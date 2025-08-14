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
  const { setValues, pdfToTest, signature, setSignature } = useValues();
  const [numPages, setNumPages] = useState(null);
  const [page, setPage] = useState(1)
  const [signatures, setSignatures] = useState([]);
  const [showAddSignature, setShowAddSignature] = useState(false);

  // useEffect(() => {
  //   const prefill = async () => {
  //     try {
  //       const response = await fetch(pdfToTest);
  //       const originalBytes = await response.arrayBuffer();

  //       // Create a copy to avoid detachment issues
  //       const bytesCopy = originalBytes.slice();

  //       const pdfDoc = await PDFDocument.load(bytesCopy);
  //       const form = pdfDoc.getForm();

  //       const prefillData = {
  //         'Provider Name': 'John Doe'
  //       }

  //       // Object.entries(prefillData).forEach(([fieldName, value]) => {
  //       //   try {
  //       //     const field = form.getTextField(fieldName);
  //       //     field.setText(value);
  //       //   } catch (e) {
  //       //     console.warn(`Field ${fieldName} not found or not a text field`);
  //       //   }
  //       // });

  //       // const testField = form.getTextField('Provider Name');
  //       // testField.setText('John Doe');
  //       const filledBytes = await pdfDoc.save();

  //       const blob = new Blob([filledBytes], { type: 'application/pdf' });
  //       const url = URL.createObjectURL(blob);
  //       setPdfBytes(url);
  //       // Create a new ArrayBuffer for react-pdf
  //       // const uint8Array = new Uint8Array(filledBytes);
  //       // setPdfBytes(uint8Array);
  //       // console.log('finished');

  //       return () => {
  //         if (url) URL.revokeObjectURL(url);   // avoid leaks
  //         setPdfBytes(null);
  //       };

  //     } catch (error) {
  //       console.error('Prefill error:', error);
  //     }
  //   };

  //   prefill();
  // }, [pdfToTest]);

  useEffect(() => {
    let url: string | null = null;

    (async () => {
      const response = await fetch(pdfToTest);
      const originalBytes = await response.arrayBuffer();

      const pdfDoc = await PDFDocument.load(originalBytes.slice(0));
      // (optional editing) …
      const filledBytes = await pdfDoc.save();

      url = URL.createObjectURL(new Blob([filledBytes], { type: 'application/pdf' }));
      setPdfBytes(url);
    })().catch(err => console.error('Prefill error:', err));

    return () => {
      if (url) URL.revokeObjectURL(url);   // avoid leaks
      setPdfBytes(null);
    };
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

  const addSignature = (pageNumber) => {
    const newSignature = {
      id: Date.now(),
      data: null,
      // position: { x: 180, y: -328 },
      position: { x: 180, y: -328 },
      pageNumber,
    };

    setSignature(newSignature);
    setShowAddSignature(false);
  };

  const removeSignature = (signatureId) => {
    setSignatures((prev) => prev.filter((sig) => sig.id !== signatureId));
    setValues((v) => {
      const updated = { ...v };
      delete updated[`signature_${signatureId}`];
      return updated;
    });
  };

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
            <Box sx={{ flexGrow: 1 }} />
            <Typography
              component="div"
              sx={{ display: 'contents' }}
            >
              Page 1
              {/* <TextField
              variant="outlined"
              size="small"
              // value={controller.state.pageNumber}
              value={1}
              InputProps={{
                sx: {
                  border: '1px solid #FFF',
                  color: '#FFF',
                  margin: '0 5px',
                  '& input': {
                    width: '2em',
                    textAlign: 'center',
                    padding: '5px',
                  },
                },
              }}
              // onKeyPress={controller.actions.jumpToPage}
              onKeyPress={() => console.log('keypress')}
            /> */}
              of
              {' '}
              {/* {controller.state.totalPages} */}
              {3}
            </Typography>
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
                    // onClick={controller.actions.signatureDialog.open}
                    // onClick={() => console.log('add signature')}
                    onClick={() => addSignature(1)}
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
          <Document file={pdfBytes}>
            {/* {numPages &&
              Array.from({ length: numPages }, (_, idx) => (
                <Page
                  key={idx + 1}
                  pageNumber={idx + 1}
                  renderAnnotationLayer={true}
                  renderForms={true}
                />
              ))} */}
            <Page
              key={page}
              pageNumber={page}
              renderAnnotationLayer={true}
              renderForms={true}
            />
          </Document>

          {signature?.id && (
            <SignatureField
              key={signature.id}
              initialPosition={signature.position}
              onSignatureUpdate={(data, position) =>
                setSignature({ id: signature.id, data, position })
              }
              onRemove={() => setSignature({})}
            />
          )}
        </div>
      </div>
    </div >
  );
};

export default PdfWithState;
