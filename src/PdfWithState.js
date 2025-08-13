import { useRef, useEffect, useState } from "react";
import { Document, Page } from "react-pdf";
import { useValues } from "./ValuesContext";
import SignatureField from "./SignatureField";
import { Button } from "@mui/material";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

const PdfWithState = () => {
  const containerRef = useRef(null);
  const { setValues, pdfToTest, signature, setSignature } = useValues();
  const [signatures, setSignatures] = useState([]);
  const [showAddSignature, setShowAddSignature] = useState(false);

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
  }, [setValues]);

  const addSignature = () => {
    const newSignature = {
      id: Date.now(),
      data: null,
      // position: { x: 180, y: -328 },
      position: { x: 180, y: -328 },
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

  return (
    <div style={{ position: "relative" }}>
      <div ref={containerRef}>
        <Document file={pdfToTest}>
          <Page
            pageNumber={1}
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
  );
};

export default PdfWithState;
