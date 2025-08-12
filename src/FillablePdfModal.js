import React, { useEffect, useRef, useState } from 'react'
import { Modal, Box, Button, Stack } from '@mui/material'
import { PDFDocument } from 'pdf-lib'

const modalStyle = {
  position: 'aboslute',
  top: '50%',
  left: '50%',
  width: '90vw',
  height: '90vh',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 0
}

const FillablePdfModal = ({ open, onClose }) => {
  const iframeRef = useRef(null)
  const pdfDocRef = useRef(null) // in-memory

  useEffect(() => {
    const loadPdf = async () => {
      const form = await fetch('driscoll_fillpdf.pdf')
      const res = await form.arrayBuffer()

      const pdfDoc = await PDFDocument.load(res)
      pdfDocRef.current = pdfDoc

      const pdfDataUri = await pdfDoc.saveAsBase64({ dataUri: true })

      if (iframeRef.current) {
        iframeRef.current.src = pdfDataUri
      }
    }

    if (open) loadPdf()
  }, [open])

  const savePdf = async () => {
    const pdfDoc = pdfDocRef.current
    // const pdfDoc = iframeRef.current
    if (!pdfDoc) return

    const pdfBytes = await pdfDoc.save()
    console.log('help')
    const blob = new Blob([pdfBytes], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = 'updated_driscoll.pdf'
    a.click()

    URL.revokeObjectURL(url)
  }

  return (
    <Modal open={open} onClose={onClose} sx={{ height: '100%', width: '100%' }}>
      <Box>
        <Box sx={modalStyle}>
          <iframe
            ref={iframeRef}
            title='fillable pdf'
            width='100%'
            height='100%'
            style={{ border: 'none' }}
          />
        </Box>
        <Stack>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant='contained' onClick={savePdf}>Save</Button>
        </Stack>
      </Box>
    </Modal>
  )
}

export default FillablePdfModal
