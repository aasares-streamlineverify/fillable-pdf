import React, { useState } from 'react'
import { Button } from '@mui/material'
import { ValuesProvider } from './ValuesContext'
import PdfDialog from './PdfDialog'

const App = () => {
  const [open, setOpen] = useState(false)
  return (
    <ValuesProvider>
      <Button onClick={setOpen}>Test</Button>
      <PdfDialog
        open={open}
        onClose={() => setOpen(false)}
      />
    </ValuesProvider>
  )
}

export default App
