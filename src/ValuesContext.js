import { createContext, useState, useContext } from "react";

const ValuesContext = createContext();

export const ValuesProvider = ({ children }) => {
  const [values, setValues] = useState({});
  const [signature, setSignature] = useState({
    id: Date.now(),
    data: null,
    // position: { x: 180, y: -328 },
    position: { x: 180, y: -328 },
  });
  // const pdfToTest = "/modified.pdf";
  // const pdfToTest = "/superior.pdf";
  const pdfToTest = 'driscoll.pdf'
  // const pdfToTest = "/modified_radio_named.pdf";
  // const pdfToTest = "/modified_driscol.pdf";
  return (
    <ValuesContext.Provider
      value={{
        values,
        setValues,
        pdfToTest,
        signature,
        setSignature,
      }}
    >
      {children}
    </ValuesContext.Provider>
  );
};

export const useValues = () => {
  const context = useContext(ValuesContext);
  if (!context) {
    throw new Error("usevalues...");
  }
  return context;
};
