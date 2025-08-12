import { useRef, useEffect } from "react";
import { Document, Page } from "react-pdf";
import { useValues } from "./ValuesContext";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

const PdfWithState = () => {
  const containerRef = useRef(null);
  const { setValues, pdfToTest } = useValues();

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
      if (t.type === "radio") console.log(t);
      setValues((v) => ({
        ...v,
        [key]: t.type === "checkbox" ? t.checked : t.value,
      }));
    };

    el.addEventListener("input", onChange, true);
    el.addEventListener("change", onChange, true);

    return () => {
      el.removeEventListener("input", onChange, true);
      el.removeEventListener("change", onChange, true);
    };
  }, [setValues]);

  return (
    <div ref={containerRef}>
      <Document file={pdfToTest}>
        <Page pageNumber={1} renderAnnotationLayer={true} renderForms={true} />
      </Document>
    </div>
  );
};

export default PdfWithState;
