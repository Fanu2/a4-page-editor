import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { SketchPicker } from 'react-color';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
// Removed unused 'saveAs' import

const A4Page = styled.div`
  width: 210mm;
  height: 297mm;
  margin: 20px auto;
  padding: 20mm;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  background: ${({ backgroundColor, backgroundTransparency }) =>
    `rgba(${backgroundColor.r}, ${backgroundColor.g}, ${backgroundColor.b}, ${backgroundTransparency})`};
  border: 1px solid #ccc;
  overflow: hidden;
  position: relative;
  font-family: Arial, sans-serif;
  color: ${({ fontColor }) => fontColor};
  font-size: ${({ fontSize }) => fontSize}px;
`;

const EditorWrapper = styled.div`
  display: flex;
  gap: 20px;
  padding: 20px;
`;

const Toolbar = styled.div`
  width: 300px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export default function Home() {
  const [fontSize, setFontSize] = useState(16);
  const [fontColor, setFontColor] = useState("#000000");
  const [backgroundColor, setBackgroundColor] = useState({ r: 255, g: 255, b: 255 });
  const [backgroundTransparency, setBackgroundTransparency] = useState(1);
  const [content, setContent] = useState(""); // For tracking editable content
  const contentRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      const imgTag = `<img src="${reader.result}" style="max-width:100%;"/>`;
      setContent((prevContent) => prevContent + imgTag);
    };
    reader.readAsDataURL(file);
  };

  const exportToImage = () => {
    html2canvas(contentRef.current).then((canvas) => {
      const link = document.createElement('a');
      link.download = 'document.png';
      link.href = canvas.toDataURL();
      link.click();
    });
  };

  const exportToPDF = () => {
    html2canvas(contentRef.current).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      pdf.addImage(imgData, 'PNG', 0, 0);
      pdf.save('document.pdf');
    });
  };

  return (
    <EditorWrapper>
      <Toolbar>
        <div>
          <label>Font Size:</label>
          <input type="range" min="8" max="72" value={fontSize} onChange={(e) => setFontSize(e.target.value)} />
        </div>

        <div>
          <label>Font Color:</label>
          <input type="color" value={fontColor} onChange={(e) => setFontColor(e.target.value)} />
        </div>

        <div>
          <label>Background Color:</label>
          <SketchPicker color={backgroundColor} onChange={(color) => setBackgroundColor(color.rgb)} />
        </div>

        <div>
          <label>Background Transparency:</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={backgroundTransparency}
            onChange={(e) => setBackgroundTransparency(e.target.value)}
          />
        </div>

        <div>
          <label>Insert Image:</label>
          <input type="file" accept="image/*" onChange={handleImageUpload} />
        </div>

        <div>
          <button onClick={exportToImage}>Save as Image</button>
          <button onClick={exportToPDF}>Save as PDF</button>
        </div>
      </Toolbar>

      <A4Page
        ref={contentRef}
        contentEditable="true"
        backgroundColor={backgroundColor}
        backgroundTransparency={backgroundTransparency}
        fontColor={fontColor}
        fontSize={fontSize}
        dangerouslySetInnerHTML={{ __html: content }}
        suppressContentEditableWarning={true}
      >
        {/* This is where text and images can be added */}
      </A4Page>
    </EditorWrapper>
  );
}
