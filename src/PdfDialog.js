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
import { PDFDocument } from "pdf-lib";

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
  const { values, pdfToTest, signature, signatures } = useValues();

  const handleSave = () => {
    const loadPdf = async () => {
      console.log(signature);
      const res = await fetch(pdfToTest);
      const bytes = await res.arrayBuffer();

      const pdfDoc = await PDFDocument.load(bytes);
      const form = pdfDoc.getForm();

      for (const [name, val] of Object.entries(values)) {
        const field = form.getField(name);
        const kind = field.constructor.name;

        kindActionMap[kind](field, val);
      }

      for (const sig of signatures) {
        if (!sig?.data) continue

        const img = await pdfDoc.embedPng(sig.data);
        const page = pdfDoc.getPage(Math.max(0, (sig.pageNumber ?? 1) - 1));

        const pageW = page.getWidth();
        const pageH = page.getHeight();

        const x = sig.position?.x ?? 0;
        const y = sig.position?.y ?? 0;
        const w = sig.boxSize?.width ?? 250;
        const h = sig.boxSize?.height ?? 100;

        const pdfX = x + (pageW / 2) - (w / 2);
        const pdfY = y + (pageH / 2) - (h / 2)

        page.drawImage(img, { x: pdfX, y: pdfY, width: w, height: h });
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
      <DialogContent divider>
        <Box
          sx={{
            height: "100%",
            overflow: "auto",
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
