import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import * as htmlDocx from "html-docx-js/dist/html-docx";

// Container that wraps the editor and toolbar
const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  overflow: hidden;
`;

// Toolbar that sits above the A4 page
const Toolbar = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
  padding: 10px;
  background-color: #f5f5f5;
  width: 100%;
  justify-content: center;
  flex-wrap: wrap;
`;

// Styled A4 Page that adjusts according to the screen size
const A4Page = styled.div`
  width: 210mm;
  height: 297mm;
  background-color: ${({ $backgroundColor }) => $backgroundColor};
  opacity: ${({ $backgroundTransparency }) => $backgroundTransparency};
  position: relative;
  padding: 20px;
  border: 1px solid #000;
  overflow: hidden;
  transform: ${({ $scale }) => `scale(${$scale})`};
  transform-origin: top center;
`;

// Editable content area inside the A4 page
const EditorArea = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  cursor: text;
  background: transparent;
  overflow-y: auto;
  white-space: pre-wrap;
  font-size: ${({ $fontSize }) => $fontSize}px;
  color: ${({ $fontColor }) => $fontColor};
  border: 1px dashed #ccc;
`;

const ToolbarSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const ToolbarLabel = styled.label`
  font-size: 14px;
  color: #333;
`;

// Resizable image component
const ResizableImage = styled.img`
  max-width: 100%;
  max-height: 100%;
  position: absolute;
  resize: both;
  overflow: auto;
  border: 2px solid #ddd;
  cursor: move;
`;

export default function Home() {
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [backgroundTransparency, setBackgroundTransparency] = useState(1);
  const [fontSize, setFontSize] = useState(16);
  const [fontColor, setFontColor] = useState("#000000");
  const [scale, setScale] = useState(1);
  const editorRef = useRef(null);

  // Handle the scale adjustment to fit the A4 page within the viewport
  useEffect(() => {
    const handleResize = () => {
      const pageWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const mmToPx = 3.7795275591; // 1 mm = 3.78px
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight - 100; // accounting for toolbar height

      // Calculate scale to fit the entire page within the viewport
      const scaleWidth = windowWidth / (pageWidth * mmToPx);
      const scaleHeight = windowHeight / (pageHeight * mmToPx);
      setScale(Math.min(scaleWidth, scaleHeight));
    };

    handleResize(); // Set initial scale
    window.addEventListener("resize", handleResize); // Adjust on window resize

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleImageInsert = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = document.createElement("img");
        img.src = e.target.result;
        img.style.width = "150px"; // Default size, resizable
        img.style.position = "absolute";
        img.style.cursor = "move";
        img.className = "resizable-image";

        img.onclick = (e) => {
          e.preventDefault();
          const range = window.getSelection().getRangeAt(0);
          range.insertNode(img);
        };

        if (editorRef.current) {
          const range = window.getSelection().getRangeAt(0);
          range.insertNode(img);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveAsPDF = () => {
    const input = document.getElementById("a4-page");
    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("page.pdf");
    });
  };

  const handleSaveAsDocx = () => {
    const editorContent = editorRef.current.innerHTML;
    const docxContent = htmlDocx.asBlob(editorContent);
    const link = document.createElement("a");
    link.href = URL.createObjectURL(docxContent);
    link.download = "page.docx";
    link.click();
  };

  return (
    <PageContainer>
      <Toolbar>
        <ToolbarSection>
          <ToolbarLabel>Background Color:</ToolbarLabel>
          <input
            type="color"
            value={backgroundColor}
            onChange={(e) => setBackgroundColor(e.target.value)}
          />
        </ToolbarSection>

        <ToolbarSection>
          <ToolbarLabel>Transparency:</ToolbarLabel>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={backgroundTransparency}
            onChange={(e) => setBackgroundTransparency(e.target.value)}
          />
        </ToolbarSection>

        <ToolbarSection>
          <ToolbarLabel>Font Size:</ToolbarLabel>
          <input
            type="number"
            min="10"
            max="50"
            value={fontSize}
            onChange={(e) => setFontSize(e.target.value)}
          />
        </ToolbarSection>

        <ToolbarSection>
          <ToolbarLabel>Font Color:</ToolbarLabel>
          <input
            type="color"
            value={fontColor}
            onChange={(e) => setFontColor(e.target.value)}
          />
        </ToolbarSection>

        <ToolbarSection>
          <ToolbarLabel>Insert Image:</ToolbarLabel>
          <input type="file" onChange={handleImageInsert} />
        </ToolbarSection>

        <button onClick={handleSaveAsPDF}>Save as PDF</button>
        <button onClick={handleSaveAsDocx}>Save as DOCX</button>
      </Toolbar>

      <A4Page
        id="a4-page"
        $backgroundColor={backgroundColor}
        $backgroundTransparency={backgroundTransparency}
        $scale={scale}
      >
        <EditorArea
          ref={editorRef}
          $fontSize={fontSize}
          $fontColor={fontColor}
          contentEditable={true}
          suppressContentEditableWarning={true}
        ></EditorArea>
      </A4Page>
    </PageContainer>
  );
}
