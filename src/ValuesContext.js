import { createContext, useState, useContext } from 'react'

const ValuesContext = createContext();

export const ValuesProvider = ({ children }) => {
  const [values, setValues] = useState({})
  const pdfToTest = '/driscoll.pdf'
  return (
    <ValuesContext.Provider value={{ values, setValues, pdfToTest }}>
      {children}
    </ValuesContext.Provider>
  )
}

export const useValues = () => {
  const context = useContext(ValuesContext)
  if (!context) {
    throw new Error('usevalues...')
  }
  return context
}
