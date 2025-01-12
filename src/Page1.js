import React, { useState } from "react";
import * as XLSX from "xlsx";

const ExcelEditor = () => {
  const [data, setData] = useState([]);
  const [fileName, setFileName] = useState("");

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (evt) => {
        const wb = XLSX.read(evt.target.result, { type: "binary" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(ws, { header: 1 });
        setData(jsonData);
      };
      reader.readAsBinaryString(file);
    }
  };

  const handleInputChange = (e, rowIndex, colIndex) => {
    const newData = [...data];
    newData[rowIndex][colIndex] = e.target.value;
    setData(newData);
  };

  const handleSave = () => {
    // Get current date and time for unique filename
    const now = new Date();

    // Adjust the time to IST (Indian Standard Time) UTC +5:30
    const offset = 5.5 * 60; // IST is UTC +5:30
    const istTime = new Date(now.getTime() + offset * 60000); // Add IST offset

    // Formatting the date and time in day-month-year--24hourformat-mins-seconds pattern
    const day = String(istTime.getDate()).padStart(2, "0");
    const month = String(istTime.getMonth() + 1).padStart(2, "0");
    const year = istTime.getFullYear();
    const hours = String(istTime.getHours()).padStart(2, "0");
    const minutes = String(istTime.getMinutes()).padStart(2, "0");
    const seconds = String(istTime.getSeconds()).padStart(2, "0");
    const uniqueCode = Math.floor(Math.random() * 100000); // Unique code (random number)

    const dateStr = `${day}-${month}-${year}--${hours}-${minutes}-${seconds}-${uniqueCode}(book1)`;

    const uniqueFileName = `${dateStr}_${fileName}`;

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

    // Save the file with the generated unique filename
    XLSX.writeFile(wb, uniqueFileName);
  };

  const addRow = () => {
    // Add an empty row with the same number of columns as the first row
    const newRow = new Array(data[0]?.length || 0).fill("");
    setData([...data, newRow]);
  };

  const deleteRow = (rowIndex) => {
    if (data.length > 1) {
      const newData = data.filter((_, index) => index !== rowIndex);
      setData(newData);
    } else {
      alert("Cannot delete the last row.");
    }
  };

  return (
    <div>
      <h2>Excel Editor</h2>
      <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
      <h3>File: {fileName}</h3>

      {data.length > 0 && (
        <>
          <table border="1">
            <thead>
              <tr>
                {data[0].map((_, index) => (
                  <th key={index}>Column {index + 1}</th>
                ))}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, colIndex) => (
                    <td key={colIndex}>
                      <input
                        type="text"
                        value={cell}
                        onChange={(e) =>
                          handleInputChange(e, rowIndex, colIndex)
                        }
                      />
                    </td>
                  ))}
                  <td>
                    <button onClick={() => deleteRow(rowIndex)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={addRow}>Add Row</button>
          <button onClick={handleSave}>Save</button>
        </>
      )}
    </div>
  );
};

export default ExcelEditor;
