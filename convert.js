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
  const fieldNames = fields.map((f) => f.getName());
  console.log("All form fields found:", fieldNames);

  // Process radio button fields first
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
      
      // Create radio group and collect all option data first
      const optionData = [];
      widgets.forEach((widget, i) => {
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
        
        const optionValue = customNames[i] || `option_${i}`;
        optionData.push({ optionValue, targetPage, rect });
      });
      
      // Create the radio group
      const newRadio = form.createRadioGroup(newRadioGroupName);
      
      // Add all options to the radio group
      optionData.forEach(({ optionValue, targetPage, rect }, i) => {
        try {
          // Add this option to the same radio group with the specific value
          newRadio.addOptionToPage(optionValue, targetPage, rect);

          console.log(
            `Added option "${optionValue}" to radio group "${newRadioGroupName}" on page ${
              pages.indexOf(targetPage) + 1
            }`
          );
        } catch (e) {
          console.error(
            `Error adding option ${optionValue} to radio group:`,
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

  // Process text fields to convert to checkboxes
  const updatedFieldNames = form.getFields().map((f) => f.getName());

  // Find fields that are exactly "No", "Yes" or start with "No" or "Yes" followed by a number
  const targetFields = updatedFieldNames.filter((name) => {
    const lowerName = name.toLowerCase();
    return (
      lowerName === "no" ||
      lowerName === "yes" ||
      /^no\d+$/i.test(name) ||
      /^yes\d+$/i.test(name)
    );
  });
  targetFields.push(
    " American IndianAlaska Native",
    "American IndianAlaska Native",
    "Asian Pacific Islander",
    "Hispanic",
    "Hispanic1",
    "Native HawaiianOther Pacific Islander",
    "Decline to provide"
  );
  console.log("\nTarget text fields to convert to checkboxes:", targetFields);

  // Update target fields
  targetFields.forEach((fieldName) => {
    try {
      const field = form.getField(fieldName);
      const widgets = field.acroField.getWidgets();
      console.log(
        `Processing field "${fieldName}" with ${widgets.length} widget(s)`
      );

      widgets.forEach((widget, i) => {
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

        const cb = form.createCheckBox(`${fieldName}-cb-${i}`);
        cb.addToPage(targetPage, rect);
        console.log(
          `Created checkbox for "${fieldName}" widget ${i} on page ${
            pages.indexOf(targetPage) + 1
          }`
        );
      });
      form.removeField(field);
    } catch (e) {
      console.error(`Error processing field "${fieldName}":`, e.message);
    }
  });

  // Save the modified PDF
  const out = await pdfDoc.save();
  const outputPath = path.join(path.dirname(absInputPath), "modified.pdf");
  fs.writeFileSync(outputPath, out);
  console.log(`Modified PDF saved to ${outputPath}`);
}

main();
