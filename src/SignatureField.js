import React, { useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import Draggable from "react-draggable";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Paper,
} from "@mui/material";
import {
  Close as CloseIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Create as CreateIcon,
} from "@mui/icons-material";

const SignatureField = ({
  onSignatureUpdate,
  // initialPosition = { x: 50, y: 50 },
  signature,
  onRemove,
}) => {
  const sigCanvasRef = useRef(null);
  const draggableRef = useRef(null);
  const [signatureData, setSignatureData] = useState(signature.data);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showCanvas, setShowCanvas] = useState(false);
  const [position, setPosition] = useState({ x: signature.position.x, y: signature.position.y });

  // const clearSignature = () => {
  //   if (sigCanvasRef.current) {
  //     sigCanvasRef.current.clear();
  //     setSignatureData(null);
  //     onSignatureUpdate && onSignatureUpdate(null, position);
  //   }
  // };

  const saveSignature = () => {
    if (sigCanvasRef.current && !sigCanvasRef.current.isEmpty()) {
      const canvas = sigCanvasRef.current.getCanvas();

      // Set your desired output size here
      const outputWidth = 250;
      const outputHeight = 100;

      const scaledCanvas = document.createElement("canvas");
      scaledCanvas.width = outputWidth;
      scaledCanvas.height = outputHeight;
      const ctx = scaledCanvas.getContext("2d");

      // Draw the original signature onto the new, scaled canvas
      ctx.drawImage(canvas, 0, 0, outputWidth, outputHeight);

      const dataURL = scaledCanvas.toDataURL("image/png");
      setSignatureData(dataURL);
      setShowCanvas(false);
      onSignatureUpdate && onSignatureUpdate(dataURL, position);
    }
  };

  const handleDrag = (e, data) => {
    const newPosition = { x: data.x, y: data.y };
    setPosition(newPosition);
    if (signatureData) {
      onSignatureUpdate && onSignatureUpdate(signatureData, newPosition);
    }
  };

  const handleBeginDrawing = () => {
    setIsDrawing(true);
  };

  const handleEndDrawing = () => {
    setIsDrawing(false);
  };

  return (
    <>
      <Dialog
        open={showCanvas}
        onClose={() => setShowCanvas(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6">Create Signature</Typography>
          <IconButton
            onClick={() => setShowCanvas(false)}
            sx={{ color: "grey.500" }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <Box
            sx={{
              border: "2px dashed #ccc",
              borderRadius: 1,
              p: 1,
              display: "flex",
              justifyContent: "center",
              bgcolor: "grey.50",
            }}
          >
            <SignatureCanvas
              ref={sigCanvasRef}
              canvasProps={{
                width: 500,
                height: 200,
                style: { borderRadius: "4px" },
              }}
              onBegin={handleBeginDrawing}
              onEnd={handleEndDrawing}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ gap: 1 }}>
          <Button onClick={() => console.log('clear signature')} variant="outlined" color="secondary">
            Clear
          </Button>
          <Button onClick={saveSignature} variant="contained" color="primary">
            Save Signature
          </Button>
        </DialogActions>
      </Dialog>

      <Draggable
        nodeRef={draggableRef}
        position={position}
        onDrag={handleDrag}
        disabled={isDrawing}
        bounds="parent"
      >
        <Paper
          ref={draggableRef}
          elevation={2}
          sx={{
            position: "absolute",
            border: "2px dashed #ccc",
            borderRadius: 1,
            minWidth: 150,
            minHeight: 7,
            cursor: "move",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            backgroundColor: "transparent",
            "&:hover": {
              borderColor: "primary.main",
              elevation: 4,
              zIndex: 1001,
            },
          }}
        >
          {signatureData ? (
            <Box
              sx={{
                position: "relative",
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Box
                component="img"
                src={signatureData}
                alt="Signature"
                sx={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain",
                }}
              />
            </Box>
          ) : (
            <Box onClick={() => setShowCanvas(true)}>
              <CreateIcon color="inherit" />
              <Typography variant="body2" color="inherit">
                Click to Sign
              </Typography>
            </Box>
          )}
        </Paper>
      </Draggable>
    </>
  );
};

export default SignatureField;
