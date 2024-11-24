import { useState, useEffect } from "react";
import { PDFDocument } from "pdf-lib"; // Import pdf-lib
import signatureImage from "@/assets/R.png"; // Assuming the image is in the project directory
import { useDropzone } from "react-dropzone"; // Import react-dropzone
import {  List, ListItem, ListItemText, Paper, IconButton, Typography } from "@mui/material";
import { Delete as DeleteIcon, Download as DownloadIcon } from "@mui/icons-material"; // MUI icons
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const Signature = () => {
  useEffect(() => {
    const handleKeyDown = (event: any) => {
      if (event.key === "F12" || (event.ctrlKey && event.shiftKey && event.key === "I")) {
        event.preventDefault(); // Disable F12 or Ctrl+Shift+I
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);
  
  useEffect(() => {
    // Disable right-click functionality
    const handleContextMenu = (event: any) => {
      event.preventDefault(); // Prevents the right-click context menu
    };

    document.addEventListener("contextmenu", handleContextMenu);

    // Cleanup the event listener on component unmount
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, []);

  const [signedFiles, setSignedFiles] = useState<{ name: string; blob: Blob }[]>([]);

  // Function to format the current date and time
  const formatTimestamp = () => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      month: "long",
      day: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    };
    return now.toLocaleString("en-US", options).replace(",", "").replace(" ", "-").replace(":", "");
  };

  // Handle file input and auto-sign
  const handleFileChange = async (acceptedFiles: File[]) => {
    const processedFiles: { name: string; blob: Blob }[] = [];

    for (const file of acceptedFiles) {
      const reader = new FileReader();

      reader.onload = async (event) => {
        const uint8Array = new Uint8Array(event.target?.result as ArrayBuffer);
        const pdfDoc = await PDFDocument.load(uint8Array);

        // Load the signature image (make sure it's in the correct format)
        const imageBytes = await fetch(signatureImage).then(res => res.arrayBuffer()); // Load image from your project directory
        const signatureImageEmbed = await pdfDoc.embedPng(imageBytes); // For PNG images, use embedPng

        // Get the image dimensions and scale it down further (adjust 0.01 to any value you prefer for a smaller signature)
        const { width, height } = signatureImageEmbed.scale(0.01); // Scale it to 1% of the original size (or any smaller value)

        // Get all the pages
        const pages = pdfDoc.getPages();

        // Loop through pages and add the signature to each page with different positions
        pages.forEach((page, index) => {
          if (index === 0) {
            // For page 1 (index 0), position the signature at a different location
            const signaturePositionPage1 = { x: 60, y: 220 }; // Customize this as needed for page 1
            page.drawImage(signatureImageEmbed, {
              x: signaturePositionPage1.x,
              y: signaturePositionPage1.y,
              width: width,
              height: height,
            });
          } else if (index === 1) {
            // For page 2 (index 1), position the signature at a different location
            const signaturePositionPage2 = { x: 390, y: 175 }; // Customize this as needed for page 2
            page.drawImage(signatureImageEmbed, {
              x: signaturePositionPage2.x,
              y: signaturePositionPage2.y,
              width: width,
              height: height,
            });
          }
          // You can continue adding more else-if conditions for other pages if needed
        });

        // Serialize the PDF with the signature image
        const pdfBytes = await pdfDoc.save();

        // Store the signed file
        processedFiles.push({
          name: file.name,
          blob: new Blob([pdfBytes], {
            type: "application/pdf",
          }),
        });

        // Update the state with signed files
        setSignedFiles((prev) => [...prev, { name: file.name, blob: processedFiles[processedFiles.length - 1].blob }]);

        // Trigger automatic download for the signed file
        downloadFile(processedFiles[processedFiles.length - 1]); // Download after processing each file
      };

      reader.readAsArrayBuffer(file);
    }
  };

  // Download a specific file (triggered automatically)
  const downloadFile = (file: { name: string; blob: Blob }) => {
    const timestamp = formatTimestamp(); // Get the formatted timestamp
    const link = document.createElement("a");
    link.href = URL.createObjectURL(file.blob);
    link.download = `Signed-${file.name.replace(".pdf", "")}_${timestamp}.pdf`; // Append timestamp to filename
    link.click(); // Simulate a click to trigger download
  };

  // Setup Dropzone for file uploads
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => handleFileChange(acceptedFiles),
    accept: { 'application/pdf': ['.pdf'] },  // Using object for file type validation
    multiple: true,
  });


  return (
    <div className="p-6 max-w-xl mx-auto">
      <Typography variant="h4" align="center" gutterBottom>
        Auto Sign PDF Files
      </Typography>

      {/* Modern File Upload Area */}
      <Paper {...getRootProps()} elevation={1} sx={{ p: 4, borderRadius: 2, textAlign: "center", cursor: "pointer", "&:hover": { backgroundColor: "#f5f5f5" } }}>
        <input {...getInputProps()} />
        <Typography variant="body1" color="textSecondary">Drag & drop some files here, or click to select files</Typography>
        <div className="flex flex-col justify-center items-center">
        <CloudUploadIcon sx={{ fontSize: 60 }}  className="mt-4"/>
          <h2 className="font-semibold text-xl uppercase">Upload files</h2>
        </div>
      </Paper>

      {/* Display List of Signed Files */}
      {signedFiles.length > 0 && (
        <div className="mt-6">
          <Typography variant="h6" gutterBottom>
            Signed Files:
          </Typography>
          <List className="flex flex-col gap-2">
            {signedFiles.map((file, index) => (
              <ListItem key={index} className="bg-gray-50" secondaryAction={
                <>
                  <IconButton edge="end" aria-label="download" onClick={() => downloadFile(file)}>
                    <DownloadIcon />
                  </IconButton>
                  <IconButton edge="end" aria-label="delete" onClick={() => setSignedFiles(signedFiles.filter(f => f !== file))}>
                    <DeleteIcon />
                  </IconButton>
                </>
              }>
                <ListItemText primary={file.name} />
              </ListItem>
            ))}
          </List>
        </div>
      )}
    </div>
  );
};

export default Signature;
