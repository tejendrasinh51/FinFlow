import { Workbook } from 'exceljs';

/**
 * Generates an Excel workbook buffer with premium formatting, automatic column widths,
 * custom branding colors (Navy header with Cyan accents), and filtered query columns.
 */
export async function generateExcel(
  data: Record<string, any>[],
  sheetName = 'Financial Dataset'
): Promise<Buffer> {
  const workbook = new Workbook();
  const worksheet = workbook.addWorksheet(sheetName.slice(0, 30), { // Max sheet name length is 31 in Excel
    views: [{ showGridLines: true }]
  });

  if (!data || data.length === 0) {
    worksheet.addRow(['No metrics found matching current filter scope.']);
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  // Calculate sum and metrics details
  const totalSum = data.reduce((acc, row) => acc + parseFloat(row.value || 0), 0);
  const recordCount = data.length;

  // 1. Add Premium Executive Title & Metadata Header Block
  worksheet.addRow([]); // Blank Row 1
  
  // Row 2: Title Banner
  const titleRow = worksheet.getRow(2);
  titleRow.getCell(1).value = 'FINFLOW ANALYTICS  |  EXECUTIVE DATASET EXPORT';
  titleRow.getCell(1).font = {
    name: 'Segoe UI',
    size: 14,
    bold: true,
    color: { argb: 'FF0F172A' } // Dark Slate Navy
  };
  
  // Row 3: Metadata Part 1
  const metaRow1 = worksheet.getRow(3);
  metaRow1.getCell(1).value = `Report Scope: ${sheetName}`;
  metaRow1.getCell(1).font = { name: 'Segoe UI', size: 10, italic: true, color: { argb: 'FF475569' } };
  
  // Row 4: Metadata Part 2
  const metaRow2 = worksheet.getRow(4);
  metaRow2.getCell(1).value = `Exported At: ${new Date().toLocaleString()}  |  Total Audited Entries: ${recordCount}  |  Portfolio Volume: $${totalSum.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
  metaRow2.getCell(1).font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF0284C7' } };

  worksheet.addRow([]); // Row 5: spacer

  // 2. Gather column keys from the first dataset record
  const keys = Object.keys(data[0]);
  
  // Format labels nicely (capitalize and replace underscores)
  const columns = keys.map((key) => ({
    header: key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    key: key,
    width: 15,
  }));
  
  // We need to place column definitions on Row 6
  // Set headers explicitly
  const headerRowNumber = 6;
  const headerRow = worksheet.getRow(headerRowNumber);
  columns.forEach((col, idx) => {
    headerRow.getCell(idx + 1).value = col.header;
  });

  // 3. Style Header Row
  headerRow.height = 28;
  headerRow.eachCell((cell) => {
    cell.font = {
      name: 'Segoe UI',
      size: 11,
      bold: true,
      color: { argb: 'FFFFFFFF' }, // White text
    };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0F172A' }, // Deep slate/navy
    };
    cell.alignment = {
      vertical: 'middle',
      horizontal: 'left',
      indent: 1
    };
    cell.border = {
      bottom: { style: 'medium', color: { argb: 'FF0284C7' } }
    };
  });

  // 4. Insert data starting from Row 7
  data.forEach((row, rIdx) => {
    const dataRowNumber = headerRowNumber + 1 + rIdx;
    const dataRow = worksheet.getRow(dataRowNumber);
    dataRow.height = 20;

    keys.forEach((key, kIdx) => {
      const cell = dataRow.getCell(kIdx + 1);
      const val = row[key];
      
      if (val instanceof Date) {
        cell.value = val.toISOString().slice(0, 10);
      } else if (typeof val === 'number') {
        cell.value = parseFloat(val.toFixed(2));
        // Apply professional currency mask to numbers
        if (key.toLowerCase().includes('value') || key.toLowerCase().includes('sum') || key.toLowerCase().includes('amount')) {
          cell.numFmt = '$#,##0.00';
        }
      } else {
        cell.value = val;
      }

      // Default font
      cell.font = { name: 'Segoe UI', size: 10 };
      cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
      
      // Zebra striping background
      if (dataRowNumber % 2 === 0) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF8FAFC' } // Very soft off-white/gray
        };
      }
      
      // Borders
      cell.border = {
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } }
      };
    });
  });

  // 5. Add double underline total row (accounting format)
  const totalRowNumber = headerRowNumber + 1 + data.length;
  const totalRow = worksheet.getRow(totalRowNumber);
  totalRow.height = 24;
  
  keys.forEach((key, kIdx) => {
    const cell = totalRow.getCell(kIdx + 1);
    if (kIdx === 0) {
      cell.value = 'Total Portfolio Volume';
    } else if (key.toLowerCase().includes('value')) {
      cell.value = totalSum;
      cell.numFmt = '$#,##0.00';
    } else {
      cell.value = '';
    }

    cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF0284C7' } };
    cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
    
    // Bottom border is double, top is thin (standard accounting double underline)
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF94A3B8' } },
      bottom: { style: 'double', color: { argb: 'FF0F172A' } }
    };
  });

  // 6. Automatically adjust column widths to prevent text clipping
  columns.forEach((col, kIdx) => {
    let maxLength = 0;
    worksheet.getColumn(kIdx + 1).eachCell({ includeEmpty: true }, (cell) => {
      const columnLength = cell.value ? String(cell.value).length : 0;
      if (columnLength > maxLength) {
        maxLength = columnLength;
      }
    });
    // Add extra padding to columns
    worksheet.getColumn(kIdx + 1).width = Math.max(maxLength + 5, 16);
  });

  // 7. Add AutoFilter from headers downwards
  const colLetterMax = String.fromCharCode(64 + keys.length);
  worksheet.autoFilter = `A${headerRowNumber}:${colLetterMax}${totalRowNumber - 1}`;

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
