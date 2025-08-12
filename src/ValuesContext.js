import { createContext, useState, useContext } from "react";

const ValuesContext = createContext();

export const ValuesProvider = ({ children }) => {
  const [values, setValues] = useState({});
  // const pdfToTest = "/modified.pdf";
  const pdfToTest = "/superior.pdf";
  // const pdfToTest = "/modified_radio_named.pdf";
  return (
    <ValuesContext.Provider value={{ values, setValues, pdfToTest }}>
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
