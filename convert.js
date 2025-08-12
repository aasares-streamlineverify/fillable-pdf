import { PDFDocument } from "pdf-lib";
import fs from "fs";
import path from "path";

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
  const fieldNames = form.getFields().map((f) => f.getName());
  console.log("All form fields found:", fieldNames);

  // Find fields that are exactly "No", "Yes" or start with "No" or "Yes" followed by a number
  const targetFields = fieldNames.filter((name) => {
    const lowerName = name.toLowerCase();
    return (
      lowerName === "no" ||
      lowerName === "yes" ||
      /^no\d+$/i.test(name) ||
      /^yes\d+$/i.test(name)
    );
  });
  console.log("Target fields to convert:", targetFields);

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
