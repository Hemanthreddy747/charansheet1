import React, { useState, useEffect, useRef } from "react";
import { BrowserMultiFormatReader } from "@zxing/library";

const BarcodeScanner = () => {
  const [barcode, setBarcode] = useState("");
  const videoRef = useRef(null);
  const barcodeReader = useRef(new BrowserMultiFormatReader());

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            // Ensure play is called after the video is loaded
            videoRef.current.play().catch((error) => {
              console.error("Error trying to play the video:", error);
            });
          };
        }

        // Start scanning for barcodes from the video stream
        barcodeReader.current.decodeFromVideoDevice(
          null,
          videoRef.current,
          (result, err) => {
            if (result) {
              setBarcode(result.getText());
            }
          }
        );
      } catch (error) {
        console.error("Error accessing the camera:", error);
      }
    };

    startCamera();

    return () => {
      // Clean up: stop video stream and barcode reader
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
      barcodeReader.current.reset();
    };
  }, []);

  return (
    <div>
      <h2>Scanned Barcode:</h2>
      <p>{barcode || "Scanning..."}</p>
      <video ref={videoRef} style={{ width: "10%", height: "auto" }} />
    </div>
  );
};

export default BarcodeScanner;
