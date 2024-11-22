import React, { useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { PDFDocument } from 'pdf-lib';

const Signature: React.FC = () => {
  const sigCanvas = useRef<SignatureCanvas | null>(null);

  // Function to clear the signature canvas
  const clearCanvas = () => {
    sigCanvas.current?.clear();
  };

  // Function to save the signature and generate a PDF
  const saveSignature = async () => {
    if (!sigCanvas.current) return;

    const signatureDataUrl = sigCanvas.current.toDataURL();
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 400]);

    // Embed the signature image into the PDF
    const signatureImageBytes = await fetch(signatureDataUrl).then(res => res.arrayBuffer());
    const signatureImage = await pdfDoc.embedPng(signatureImageBytes);

    page.drawImage(signatureImage, {
      x: 200,
      y: 150,
      width: 200,
      height: 100,
    });

    // Save the PDF and trigger a download
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'signed_document.pdf';
    link.click();
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <h1 className="text-xl font-bold">E-Signature App</h1>
      <div className="border border-gray-400 p-4">
        <SignatureCanvas
          ref={sigCanvas}
          penColor="black"
          canvasProps={{
            width: 500,
            height: 200,
            className: 'sigCanvas',
          }}
        />
      </div>
      <div className="space-x-4">
        <button
          onClick={saveSignature}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Save Signature
        </button>
        <button
          onClick={clearCanvas}
          className="px-4 py-2 bg-red-500 text-white rounded"
        >
          Clear
        </button>
      </div>
    </div>
  );
};

export default Signature;
