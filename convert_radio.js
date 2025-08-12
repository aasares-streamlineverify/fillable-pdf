const { PDFDocument } = require("pdf-lib");
const fs = require("fs");
const path = require("path");

async function main() {
  const [, , inputPath] = process.argv;
  if (!inputPath) {
    console.error("Usage: node convert.js <input-pdf-path>");
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

          // Create a new radio button with unique name
          const newRadioName = `${fieldName}_option_${i}`;
          const newRadio = form.createRadioGroup(newRadioName);
          newRadio.addOptionToPage(`${fieldName}_value_${i}`, targetPage, rect);

          console.log(
            `Created unique radio button: "${newRadioName}" on page ${
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
    "modified_radio.pdf"
  );
  fs.writeFileSync(outputPath, out);
  console.log(`\nModified PDF saved to ${outputPath}`);
}

main().catch(console.error);
