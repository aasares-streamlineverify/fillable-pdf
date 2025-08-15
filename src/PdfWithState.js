import { useRef, useEffect, useState, useMemo } from "react";
import { Document, Page } from "react-pdf";
import { useValues } from "./ValuesContext";
import SignatureField from "./SignatureField";
import { PDFDocument } from "pdf-lib";
import {
  AppBar,
  Toolbar,
  IconButton,
  Box,
  Typography,
  Tooltip,
  TextField
} from '@mui/material';
import {
  BorderColor as BorderColorIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Download as DownloadIcon,
  TextFields as TextFieldsIcon,
  Backspace as BackspaceIcon,
} from '@mui/icons-material';
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

const PdfWithState = () => {
  const containerRef = useRef(null);
  const [pdfBytes, setPdfBytes] = useState(null)
  const { setValues, pdfToTest, signature, setSignature, signatures, setSignatures } = useValues();
  const [numPages, setNumPages] = useState(null);
  const [page, setPage] = useState(1)
  const [showAddSignature, setShowAddSignature] = useState(false);
  const file = useMemo(() => (pdfBytes ? { data: pdfBytes } : null), [pdfBytes]);

  useEffect(() => {
    let cancelled = false;

    const fillPdf = async () => {
      const res = await fetch(pdfToTest);
      const original = await res.arrayBuffer();

      const doc = await PDFDocument.load(original.slice(0));
      const form = doc.getForm();
      console.log(`Pages: ${doc.getPages().length}`)
      setNumPages(doc.getPages().length)

      // place data ingestion here
      // const testField = form.getTextField('Provider Name');
      // testField.setText('John Doe');

      const bytes = await doc.save();              // ArrayBuffer or Uint8Array
      if (!cancelled) setPdfBytes(new Uint8Array(bytes));
    }

    fillPdf()

    return () => { cancelled = true; };
  }, [pdfToTest]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onChange = (e) => {
      const t = e.target;
      if (
        !(
          t instanceof HTMLInputElement ||
          t instanceof HTMLSelectElement ||
          t instanceof HTMLTextAreaElement
        )
      )
        return;

      const key = t.name || t.id || t.getAttribute("data-annotation-id");
      if (!key) return;
      let value;
      if (t.type === "checkbox") {
        value = t.checked;
      } else if (t.type === "radio") {
        value = t.getAttribute("data-element-id");
      } else {
        value = t.value;
      }

      setValues((v) => ({
        ...v,
        [key]: value,
      }));
    };

    el.addEventListener("input", onChange, true);
    el.addEventListener("change", onChange, true);

    return () => {
      el.removeEventListener("input", onChange, true);
      el.removeEventListener("change", onChange, true);
    };
  }, [setValues, pdfBytes]);

  // const addSignature = (pageNumber) => {
  //   const newSignature = {
  //     id: Date.now(),
  //     data: null,
  //     // position: { x: 180, y: -328 },
  //     position: { x: 180, y: -328 },
  //     pageNumber,
  //   };

  //   setSignature(newSignature);
  //   setShowAddSignature(false);
  // };

  const addSignature = (pageNumber, position = { x: 0, y: 0 }) => {
    const newSignature = {
      id: Date.now(),
      data: null,
      position,
      pageNumber,
    };

    setSignatures(prev => [...prev, newSignature])
    console.log(signatures)
  }

  const updateSignature = (id, data, position) => {
    setSignatures(prev => prev.map(sig => sig.id === id ? { ...sig, data, position } : sig))
  }

  // const removeSignature = (signatureId) => {
  //   setSignatures((prev) => prev.filter((sig) => sig.id !== signatureId));
  //   setValues((v) => {
  //     const updated = { ...v };
  //     delete updated[`signature_${signatureId}`];
  //     return updated;
  //   });
  // };

  const onLoadSuccess = ({ numPages }) => {
    console.log(`PDF loaded with ${numPages} pages`);
    setNumPages(numPages);
  };

  if (!pdfBytes) {
    return <div>Loading PDF...</div>
  }

  return (
    <div style={{ position: "relative" }}>
      <Box sx={{ flexGrow: 1, position: 'sticky', top: '0', zIndex: 1100 }}>
        <AppBar position="static">
          <Toolbar variant='dense'>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Tooltip title="Previous page">
                <span>
                  <IconButton
                    size="small"
                    color="inherit"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                  // disabled={!canPrev}
                  >
                    <ChevronLeftIcon />
                  </IconButton>
                </span>
              </Tooltip>

              <Typography variant="body2" sx={{ minWidth: 90, textAlign: 'center' }}>
                Page {page} of {numPages ?? '…'}
              </Typography>

              <Tooltip title="Next page">
                <span>
                  <IconButton
                    size="small"
                    color="inherit"
                    onClick={() => setPage(p => Math.min(numPages ?? p, p + 1))}
                  // disabled={!canNext}
                  >
                    <ChevronRightIcon />
                  </IconButton>
                </span>
              </Tooltip>
            </Box>

            <Box sx={{ flexGrow: 1 }} />
            <Box sx={{ flexGrow: 1 }} />
            {true && (
              <>
                <Tooltip title="Download">
                  <IconButton
                    color="inherit"
                    aria-label="download"
                    // onClick={controller.actions.downloadPDF}
                    onClick={() => console.log('hello world')}
                  >
                    <DownloadIcon sx={{ fontSize: '1.68rem', marginTop: '2px' }} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Clear">
                  <IconButton
                    color="inherit"
                    aria-label="clear"
                    // onClick={controller.actions.clearObjects}
                    onClick={() => console.log('clear')}
                  >
                    <BackspaceIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Add Signature">
                  <IconButton
                    color="inherit"
                    aria-label="signature"
                    // position depends on the page number and pdf name...
                    onClick={() => addSignature(page, { x: 0, y: 0 })}
                  >
                    <BorderColorIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Add Text">
                  <IconButton
                    color="inherit"
                    aria-label="text"
                    // onClick={controller.actions.textDialog.open}
                    onClick={() => console.log('add text')}
                  >
                    <TextFieldsIcon />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </Toolbar>
        </AppBar>
      </Box>
      <div style={{
        position: "relative",
        minHeight: "100vh",
        background: "#e0e0e0", // gray background
        display: "flex",
        flexDirection: "column",
      }}>
        <div ref={containerRef} style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}>
          <Document file={file}>
            <Page
              key={page}
              pageNumber={page}
              renderAnnotationLayer={true}
              renderForms={true}
            />
          </Document>

          {signatures
            .filter(sig => sig.pageNumber === page)
            .map(sig => (
              <SignatureField
                key={sig.id}
                initialPosition={sig.position}
                onSignatureUpdate={(data, position) => updateSignature(sig.id, data, position)}
              />
            ))}
        </div>
      </div>
    </div >
  );
};

export default PdfWithState;
