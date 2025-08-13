import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
} from "@mui/material";
import { useValues } from "./ValuesContext";
import PdfWithState from "./PdfWithState";
import { PDFDocument, StandardFonts } from "pdf-lib";

const kindActionMap = {
  PDFTextField: (field, val) => {
    field.setText(val === null ? "" : String(val));
  },
  PDFCheckBox: (field, val) => {
    val === true || val === "Yes" || val === "On" || val === 1
      ? field.check()
      : field.uncheck();
  },
  PDFRadioGroup: (field, val) => {
    // implement this later
  },
  PDFDropdown: (field, val) => {
    // implement this later
  },
  PDFOptionList: (field, val) => {
    // implement this later
  },
};

const PdfDialog = ({ open, onClose }) => {
  const { values, pdfToTest, signature } = useValues();

  const handleSave = () => {
    const loadPdf = async () => {
      console.log(signature);
      const res = await fetch(pdfToTest);
      const bytes = await res.arrayBuffer();

      const pdfDoc = await PDFDocument.load(bytes);
      const form = pdfDoc.getForm();
      const pages = pdfDoc.getPages();
      const firstPage = pages[0];

      for (const [name, val] of Object.entries(values)) {
        const field = form.getField(name);
        const kind = field.constructor.name;

        kindActionMap[kind](field, val);
      }

      // Get image dimensions

      let image;
      if (signature?.data.startsWith("data:image/png")) {
        image = await pdfDoc.embedPng(signature.data);
      }
      const imageDims = image.scale(1);

      const pageHeight = firstPage.getHeight();
      console.log(pageHeight, "PAGE HEIGHT");
      const x = signature?.position.x || 0;
      const y =
        pageHeight - Math.abs(signature.position?.y || 0) - imageDims.height;

      if (image) {
        const page = pdfDoc.getPage(0);
        console.log(image, "IMAGE");
        page.drawImage(image, {
          x,
          y,
          width: imageDims.width,
          height: imageDims.height,
        });
      }

      const out = await pdfDoc.save();
      const blob = new Blob([out], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "modified.pdf";
      a.click();
      URL.revokeObjectURL(url);
    };

    loadPdf();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="l">
      <DialogTitle>Fill up the PDF</DialogTitle>
      <DialogContent dividers>
        <Box
          sx={{
            height: "100%",
            overflow: "auto",
            p: 2,
          }}
        >
          <PdfWithState />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleSave} variant="contained">
          Save
        </Button>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PdfDialog;
