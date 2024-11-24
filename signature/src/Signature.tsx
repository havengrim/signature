import { useState, useEffect } from "react";
import { PDFDocument } from "pdf-lib"; 
import signatureImage from "@/assets/R.png"; 
import { useDropzone } from "react-dropzone"; 
import { List, ListItem, ListItemText, Paper, IconButton, Typography } from "@mui/material";
import { Delete as DeleteIcon, Download as DownloadIcon } from "@mui/icons-material"; 
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { toast } from 'react-toastify';

const Signature = () => {
  const [signedFiles, setSignedFiles] = useState<{ name: string; blob: Blob }[]>([]);
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Block F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U, Ctrl+Shift+C, Ctrl+P
      if (
        event.key === "F12" ||
        (event.ctrlKey && event.shiftKey && ["I", "J", "C"].includes(event.key)) ||
        (event.ctrlKey && ["U", "P"].includes(event.key))
      ) {
        event.preventDefault(); // Disable the key combination
      }
    };

    const handleContextMenu = (event: MouseEvent) => {
      event.preventDefault(); // Prevent right-click
    };

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      // Optional: Warn user before they try to leave or refresh the page
      event.preventDefault();
      event.returnValue = "";
    };

    // Disable dragging elements to inspect or open them externally
    const handleDragStart = (event: DragEvent) => {
      event.preventDefault();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("dragstart", handleDragStart);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("dragstart", handleDragStart);
    };
  }, []);
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
    // Format the date and time as "Month Day, Year Hour:Minute AM/PM"
    return now.toLocaleString("en-US", options).replace(",", "").replace(" ", "-");
  };
  
  const handleFileChange = async (acceptedFiles: File[]) => {
    const processedFiles: { name: string; blob: Blob }[] = [];

    for (const file of acceptedFiles) {
      const reader = new FileReader();

      reader.onload = async (event) => {
        const uint8Array = new Uint8Array(event.target?.result as ArrayBuffer);
        const pdfDoc = await PDFDocument.load(uint8Array);

        const imageBytes = await fetch(signatureImage).then(res => res.arrayBuffer()); 
        const signatureImageEmbed = await pdfDoc.embedPng(imageBytes);

        const { width, height } = signatureImageEmbed.scale(0.01);

        const pages = pdfDoc.getPages();

        pages.forEach((page, index) => {
          if (index === 0) {
            const signaturePositionPage1 = { x: 60, y: 220 };
            page.drawImage(signatureImageEmbed, {
              x: signaturePositionPage1.x,
              y: signaturePositionPage1.y,
              width: width,
              height: height,
            });
          } else if (index === 1) {
            const signaturePositionPage2 = { x: 390, y: 175 };
            page.drawImage(signatureImageEmbed, {
              x: signaturePositionPage2.x,
              y: signaturePositionPage2.y,
              width: width,
              height: height,
            });
          }
        });

        const pdfBytes = await pdfDoc.save();

        processedFiles.push({
          name: file.name,
          blob: new Blob([pdfBytes], {
            type: "application/pdf",
          }),
        });

        setSignedFiles((prev) => [...prev, { name: file.name, blob: processedFiles[processedFiles.length - 1].blob }]);

        downloadFile(processedFiles[processedFiles.length - 1]);
        toast.success(`Signed file saved: ${file.name}`);
      };

      reader.readAsArrayBuffer(file);
    }
  };

  const downloadFile = (file: { name: string; blob: Blob }) => {
    const timestamp = formatTimestamp(); 
    const link = document.createElement("a");
    link.href = URL.createObjectURL(file.blob);
    link.download = `Signed-${file.name.replace(".pdf", "")}_${timestamp}.pdf`;
    link.click();
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => handleFileChange(acceptedFiles),
    accept: { 'application/pdf': ['.pdf'] },
    multiple: true,
  });

  useEffect(() => {
    let logoutTimer: NodeJS.Timeout;
  
    const resetTimer = () => {
      console.log("Activity detected, resetting timer");
      if (logoutTimer) clearTimeout(logoutTimer);
      logoutTimer = setTimeout(() => {
        console.log("Inactivity detected, logging out...");
        alert("You have been logged out due to inactivity.");
        window.location.href = "/"; // Redirect to login page or handle logout
      }, 1 * 60 * 1000); // 1 minute timeout
    };
  
    const events = ['mousemove', 'keydown', 'click'];
  
    events.forEach(event => {
      document.addEventListener(event, resetTimer);
    });
  
    resetTimer(); // Start the timer immediately on mount
  
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, resetTimer);
      });
      if (logoutTimer) clearTimeout(logoutTimer);
    };
  }, []);
  
  return (
    <div className="p-6 max-w-xl mx-auto">
      <Typography variant="h4" align="center" gutterBottom>
        Auto Sign PDF Files
      </Typography>

      <Paper {...getRootProps()} elevation={1} sx={{ p: 4, borderRadius: 2, textAlign: "center", cursor: "pointer", "&:hover": { backgroundColor: "#f5f5f5" } }}>
        <input {...getInputProps()} />
        <Typography variant="body1" color="textSecondary">Drag & drop some files here, or click to select files</Typography>
        <div className="flex flex-col justify-center items-center">
          <CloudUploadIcon sx={{ fontSize: 60 }} className="mt-4"/>
          <h2 className="font-semibold text-xl uppercase">Upload files</h2>
        </div>
      </Paper>

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
