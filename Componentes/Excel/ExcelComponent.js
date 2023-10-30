import * as FileSaver from "file-saver";
import XLSX from "sheetjs-style";

function ExcelComponent(excelData, fileName, colors) {
  const fileType =
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
  const fileExtension = ".xlsx";

  const ws = XLSX.utils.aoa_to_sheet(excelData);
  const borderStyle = {
    top: { style: "medium", color: { rgb: "0000ff" } },
    bottom: { style: "medium", color: { rgb: "0000ff" } },
    left: { style: "medium", color: { rgb: "0000ff" } },
    right: { style: "medium", color: { rgb: "0000ff" } },
  };

  const fitToColumn = (data, index) => {
    const widths = [];
    for (const field in data[index]) {
      widths.push({
        wch: Math.max(
          field.length,
          ...data.map((item) => item[field]?.toString()?.length ?? 0)
        ),
      });
    }
    return widths;
  };

  for (let row = 0; row < excelData.length; row++) {
    for (let col = 1; col < excelData[row].length; col++) {
      const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
      const cell = ws[cellRef];

      if (cell) {
        if (colors[row][col] === "green") {
          cell.s = { ...cell.s, font: { color: { rgb: "269629" } } };
        } else if (colors[row][col] === "red") {
          cell.s = { ...cell.s, font: { color: { rgb: "dc3545" } } };
        }
      }
    }
    const cellRef = XLSX.utils.encode_cell({ r: row, c: excelData[row].length });
    const cell = ws[cellRef];

    if (cell) {
      // Aplicando estilo de bordas
      cell.s = { ...cell.s, border: borderStyle };
    }
    ws["!cols"] = fitToColumn(excelData, row);
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Primeiro Ano");

  const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const data = new Blob([excelBuffer], { type: fileType });
  FileSaver.saveAs(data, fileName + fileExtension);
}

export default ExcelComponent;
