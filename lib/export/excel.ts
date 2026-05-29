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
  const worksheet = workbook.addWorksheet(sheetName, {
    views: [{ showGridLines: true }]
  });

  if (!data || data.length === 0) {
    worksheet.addRow(['No metrics found matching current filter scope.']);
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  // 1. Gather column keys from the first dataset record
  const keys = Object.keys(data[0]);
  
  // Format labels nicely (capitalize and replace underscores)
  const columns = keys.map((key) => ({
    header: key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    key: key,
    width: 15,
  }));
  
  worksheet.columns = columns;

  // 2. Insert records
  data.forEach((row) => {
    const formattedRow: Record<string, any> = {};
    keys.forEach((key) => {
      const val = row[key];
      if (val instanceof Date) {
        formattedRow[key] = val.toISOString().slice(0, 10);
      } else if (typeof val === 'number') {
        formattedRow[key] = parseFloat(val.toFixed(2));
      } else {
        formattedRow[key] = val;
      }
    });
    worksheet.addRow(formattedRow);
  });

  // 3. Apply Brand styling to the Header Row
  const headerRow = worksheet.getRow(1);
  headerRow.height = 26;
  
  headerRow.eachCell((cell) => {
    cell.font = {
      name: 'Arial',
      size: 11,
      bold: true,
      color: { argb: 'FF00D4FF' }, // Brand Cyan text
    };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0D1321' }, // Deep Surface Navy background
    };
    cell.alignment = {
      vertical: 'middle',
      horizontal: 'center',
    };
    cell.border = {
      bottom: { style: 'medium', color: { argb: 'FF00D4FF' } }
    };
  });

  // 4. Style Data Rows
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // Skip header
    
    row.height = 20;
    row.eachCell((cell) => {
      cell.font = { name: 'Arial', size: 10 };
      cell.alignment = { vertical: 'middle', horizontal: 'left' };
      
      // Light alternate rows zebra striping
      if (rowNumber % 2 === 0) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF5F8FC' }
        };
      }
      
      // Fine borders
      cell.border = {
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } }
      };
    });
  });

  // 5. Add AutoFilter to all columns
  const colLetterMax = String.fromCharCode(64 + keys.length);
  worksheet.autoFilter = `A1:${colLetterMax}${data.length + 1}`;

  // 6. Automatically adjust column widths to prevent text clipping
  worksheet.columns.forEach((column) => {
    let maxLength = 0;
    column.eachCell!({ includeEmpty: true }, (cell) => {
      const columnLength = cell.value ? String(cell.value).length : 0;
      if (columnLength > maxLength) {
        maxLength = columnLength;
      }
    });
    column.width = Math.max(maxLength + 4, 12);
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
