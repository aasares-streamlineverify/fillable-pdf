const { PDFDocument } = require("pdf-lib");
const fs = require("fs");
const path = require("path");

// You can customize these field mappings for better naming
const FIELD_MAPPINGS = {
  "PCP/Specialist": ["PCP", "Specialist_non_PCP", "PCP_Specialist"],
  "Yes/No": ["Yes", "No"],
  "Yes/No8": ["Yes", "No"],
  "Yes/No 1": ["Yes", "No"],
};

async function main() {
  const [, , inputPath] = process.argv;
  if (!inputPath) {
    console.error("Usage: node convert_radio_named.js <input-pdf-path>");
    process.exit(1);
  }

  const absInputPath = path.resolve(inputPath);
  const bytes = fs.readFileSync(absInputPath);
  const pdfDoc = await PDFDocument.load(bytes);
  const form = pdfDoc.getForm();
  const pages = pdfDoc.getPages();

  // List all form fields for debugging
  const fields = form.getFields();
  console.log(
    "All form fields found:",
    fields.map((f) => f.getName())
  );

  // Find radio button fields
  fields.forEach((field) => {
    const fieldName = field.getName();

    // Check if this is a radio button field
    if (field.constructor.name === "PDFRadioGroup") {
      console.log(`\nProcessing radio button group: "${fieldName}"`);

      const widgets = field.acroField.getWidgets();
      console.log(`Found ${widgets.length} radio button options`);

      const customNames = FIELD_MAPPINGS[fieldName] || [];

      // Create a single new radio group for all options
      const newRadioGroupName = `${fieldName}_modified`;
      const newRadio = form.createRadioGroup(newRadioGroupName);

      // Process each radio button widget
      widgets.forEach((widget, i) => {
        try {
          const rect = widget.getRectangle();
          const pageRef = widget.P();

          // Find which page this widget belongs to
          let targetPage = pages[0]; // default to first page
          for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
            if (pages[pageIndex].ref === pageRef) {
              targetPage = pages[pageIndex];
              break;
            }
          }

          // Use custom name if available, otherwise use generic naming
          const optionValue = customNames[i] || `option_${i}`;

          // Add this option to the same radio group
          newRadio.addOptionToPage(optionValue, targetPage, rect);

          console.log(
            `Added option "${optionValue}" to radio group "${newRadioGroupName}" on page ${
              pages.indexOf(targetPage) + 1
            }`
          );
        } catch (e) {
          console.error(
            `Error processing radio widget ${i} for field "${fieldName}":`,
            e.message
          );
        }
      });

      // Remove the original radio group
      try {
        form.removeField(field);
        console.log(`Removed original radio group: "${fieldName}"`);
      } catch (e) {
        console.error(`Error removing field "${fieldName}":`, e.message);
      }
    }
  });

  // Save the modified PDF
  const out = await pdfDoc.save();
  const outputPath = path.join(
    path.dirname(absInputPath),
    "modified_radio_named.pdf"
  );
  fs.writeFileSync(outputPath, out);
  console.log(`\nModified PDF saved to ${outputPath}`);
}

main().catch(console.error);
