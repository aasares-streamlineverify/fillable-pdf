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
  const { values, pdfToTest, signature, signatures } = useValues();

  const handleSave = () => {
    const loadPdf = async () => {
      console.log(signature);
      const res = await fetch(pdfToTest);
      const bytes = await res.arrayBuffer();

      const pdfDoc = await PDFDocument.load(bytes);
      const form = pdfDoc.getForm();
      // const pages = pdfDoc.getPages();
      // const firstPage = pages[0];

      for (const [name, val] of Object.entries(values)) {
        const field = form.getField(name);
        const kind = field.constructor.name;

        kindActionMap[kind](field, val);
      }

      // let image;
      // if (signature?.data?.startsWith("data:image/png")) {
      //   image = await pdfDoc.embedPng(signature.data);
      // }
      // if (image) {
      //   const page = pdfDoc.getPage(0);
      //   const imageDims = image.scale(1);

      //   const x = signature?.position.x || 0;
      //   const y = Math.abs(signature.position?.y) - imageDims.height;
      //   console.log(`Value of y is ${y}`);

      //   page.drawImage(image, {
      //     x,
      //     y,
      //     width: imageDims.width,
      //     height: imageDims.height,
      //   });
      // }
      // 3) Draw each signature on its specified page
      for (const sig of signatures) {
        if (!sig?.data) continue;

        const img = await pdfDoc.embedPng(sig.data);
        if (!img) continue;

        // Get target page (pageNumber is 1-based)
        const pageIndex = Math.max(0, (sig.pageNumber ?? sig.page ?? 1) - 1);
        const page = pdfDoc.getPage(pageIndex);
        const pageWidthPts = page.getWidth();
        const pageHeightPts = page.getHeight();
        console.log(`Width: ${pageWidthPts}, Height: ${pageHeightPts}`);

        // Desired drawn size; keep 1:1 with source pixels unless you store explicit width/height.
        const { width: imgW, height: imgH } = img.scale(1);

        // If your stored position is in screen (CSS px) relative to a rendered page,
        // convert by scaling from rendered size -> PDF size.
        // Optional: if you saved the render size when placing the signature, use it here:
        // sig.renderSize = { width, height }  // add this when you place the sig
        const renderW = sig.renderSize?.width ?? pageWidthPts;   // fallback: assume 1:1
        const renderH = sig.renderSize?.height ?? pageHeightPts; // fallback: assume 1:1

        // Scale factors (screen px -> PDF pts)
        const sx = pageWidthPts / renderW;
        const sy = pageHeightPts / renderH;

        // Your SignatureField used top-left origin. PDF uses bottom-left.
        // Convert: pdfX = x * sx
        //          pdfY = pageHeight - ((y + imgH_screen) * sy)
        // If your SignatureField stored negative y (e.g., dragging math), normalize it first.
        const screenX = sig.position?.x ?? 0;
        const screenY = Math.max(0, sig.position?.y ?? 0);

        const pdfX = screenX * sx;
        const pdfY = pageHeightPts - (screenY + imgH) * sy;

        page.drawImage(img, {
          x: pdfX,
          y: pdfY,
          width: imgW * sx,   // scale image to match page scaling
          height: imgH * sy,
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
