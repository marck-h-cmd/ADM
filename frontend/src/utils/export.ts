import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ExcelJS from 'exceljs';
import type { KardexItem } from '@/types/kardex.types';
import type { Producto } from '@/types/producto.types';

interface ExportKardexParams {
  producto: Producto;
  stats: {
    stockActual: number;
    totalIngresos: number;
    totalSalidas: number;
    variacion: number;
  };
  filtros: {
    fechaInicio: string;
    fechaFin: string;
    tipo: string;
  };
  items: KardexItem[];
}

/**
 * Exporta datos tabulares a CSV con BOM UTF-8.
 */
export function exportCSV(
  filename: string,
  rows: Record<string, unknown>[],
  columns?: string[],
) {
  if (rows.length === 0) return;
  const cols = columns ?? Object.keys(rows[0]);

  const escape = (val: unknown): string => {
    if (val == null) return '';
    const s = String(val);
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const lines = [
    cols.join(','),
    ...rows.map((row) => cols.map((c) => escape(row[c])).join(',')),
  ];

  const csv = '\uFEFF' + lines.join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Exporta el Kardex de un producto a PDF con diseño premium/profesional.
 */
export function exportKardexPDF({ producto, stats, filtros, items }: ExportKardexParams) {
  const doc = new jsPDF();
  const titleColor: [number, number, number] = [201, 169, 97]; // var(--color-gold-500) -> #c9a961
  const inkDark: [number, number, number] = [19, 19, 26];      // var(--color-ink-200) -> #13131a
  const inkMuted: [number, number, number] = [90, 90, 106];    // var(--color-ink-600) -> #5a5a6a

  // 1. Header (Branding & Gold line Accent)
  doc.setFillColor(inkDark[0], inkDark[1], inkDark[2]);
  doc.rect(0, 0, 210, 38, 'F');
  
  doc.setFillColor(titleColor[0], titleColor[1], titleColor[2]);
  doc.rect(0, 38, 210, 1.5, 'F');

  // Brand Name
  doc.setTextColor(titleColor[0], titleColor[1], titleColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('TENEBROSA', 15, 18);
  doc.setFontSize(8);
  doc.setFont('courier', 'normal');
  doc.setTextColor(184, 184, 200);
  doc.text('SYSTEMA DE CONTROL DE INVENTARIO Y KARDEX', 15, 23);

  // Document Title Right-aligned
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text('REPORTE KARDEX VALORADO', 195, 18, { align: 'right' });
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generado: ${new Date().toLocaleString()}`, 195, 24, { align: 'right' });

  // 2. Metadata Block (SKU, Producto, Fechas)
  doc.setTextColor(inkDark[0], inkDark[1], inkDark[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('INFORMACIÓN DE PRODUCTO', 15, 50);

  const precVentaNum = Number(producto.PrecVenta) || 0;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`SKU / Código: ${producto.Producto}`, 15, 56);
  doc.text(`Descripción: ${producto.Descripcion}`, 15, 61);
  doc.text(`Marca: ${producto.Marca}  |  U.M: ${producto.UniMed}`, 15, 66);
  doc.text(`Precio Venta: S/ ${precVentaNum.toFixed(2)}`, 15, 71);

  // Filter info on the right
  doc.setFont('helvetica', 'bold');
  doc.text('FILTROS DE BÚSQUEDA', 120, 50);
  doc.setFont('helvetica', 'normal');
  doc.text(`Desde: ${filtros.fechaInicio || 'Inicio'}`, 120, 56);
  doc.text(`Hasta: ${filtros.fechaFin || 'Hoy'}`, 120, 61);
  doc.text(`Filtro Movimiento: ${filtros.tipo}`, 120, 66);

  // 3. Highlighted boxes for stats (KPI Cards)
  const drawKpiCard = (x: number, y: number, w: number, title: string, value: string, textCol: number[]) => {
    doc.setFillColor(245, 243, 236); // Light gray surface background
    doc.setDrawColor(232, 230, 224);
    doc.rect(x, y, w, 22, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(inkMuted[0], inkMuted[1], inkMuted[2]);
    doc.text(title.toUpperCase(), x + 4, y + 6);
    doc.setFontSize(12);
    doc.setTextColor(textCol[0], textCol[1], textCol[2]);
    doc.text(value, x + 4, y + 16);
  };

  drawKpiCard(15, 78, 42, 'Stock actual', `${stats.stockActual} ${producto.UniMed}`, inkDark);
  drawKpiCard(61, 78, 42, 'Ingresos período', `+${stats.totalIngresos}`, [61, 139, 106]); // Jade
  drawKpiCard(107, 78, 42, 'Salidas período', `-${stats.totalSalidas}`, [196, 72, 72]);   // Cinnabar
  drawKpiCard(153, 78, 42, 'Variación neta', `${stats.variacion > 0 ? '+' : ''}${stats.variacion}`, stats.variacion > 0 ? [61, 139, 106] : stats.variacion < 0 ? [196, 72, 72] : inkDark);

  // 4. Movements Table (jspdf-autotable)
  const headers = [['FECHA / HORA', 'DOCUMENTO', 'MOVIMIENTO', 'CANTIDAD', 'STOCK RESULT.', 'REFERENCIA']];
  
  const body = items.map(item => {
    let ref = '';
    if (item.proveedor) ref += `Prov: ${item.proveedor} `;
    if (item.personal) ref += `Pers: ${item.personal} `;
    if (item.documento_ref) ref += `Ref: ${item.documento_ref}`;
    return [
      new Date(item.fecha).toLocaleString('es-PE'),
      item.documento,
      item.tipomov === 'INGRESO' ? 'INGRESO' : 'SALIDA',
      item.tipomov === 'INGRESO' ? `+${item.cantidad}` : `-${item.cantidad}`,
      item.stock.toString(),
      ref || '—'
    ];
  });

  autoTable(doc, {
    startY: 106,
    head: headers,
    body: body,
    theme: 'striped',
    headStyles: {
      fillColor: inkDark,
      textColor: titleColor,
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'left',
      cellPadding: 3
    },
    bodyStyles: {
      fontSize: 8,
      textColor: inkDark,
      cellPadding: 3
    },
    alternateRowStyles: {
      fillColor: [250, 249, 246]
    },
    columnStyles: {
      3: { halign: 'right', fontStyle: 'bold' },
      4: { halign: 'right', fontStyle: 'bold' }
    },
    didParseCell: (data: any) => {
      // Color coding for transactions
      if (data.column.index === 2 && data.cell.section === 'body') {
        if (data.cell.text[0] === 'INGRESO') {
          data.cell.styles.textColor = [61, 139, 106]; // Jade
        } else {
          data.cell.styles.textColor = [196, 72, 72]; // Cinnabar
        }
      }
      if (data.column.index === 3 && data.cell.section === 'body') {
        if (data.cell.text[0].startsWith('+')) {
          data.cell.styles.textColor = [61, 139, 106];
        } else {
          data.cell.styles.textColor = [196, 72, 72];
        }
      }
    }
  });

  // Save the document
  const fileName = `Kardex_${producto.Producto}_${new Date().toISOString().slice(0,10)}.pdf`;
  doc.save(fileName);
}

/**
 * Exporta el Kardex a un archivo Excel profesional con colores, fuentes y bordes.
 */
export async function exportKardexExcel({ producto, stats, filtros, items }: ExportKardexParams) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Kardex Valorado');

  // Configure grid lines
  worksheet.views = [{ showGridLines: true }];

  // 1. BRANDING HEADER
  worksheet.mergeCells('A1:F1');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = 'TENEBROSA - SISTEMA DE CONTROL DE INVENTARIO';
  titleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FFC9A961' } }; // Gold color
  titleCell.alignment = { vertical: 'middle', horizontal: 'left' };
  worksheet.getRow(1).height = 30;

  worksheet.mergeCells('A2:F2');
  const subtitleCell = worksheet.getCell('A2');
  subtitleCell.value = 'Reporte de Movimientos de Kardex Valorado (SKU)';
  subtitleCell.font = { name: 'Arial', size: 10, italic: true, color: { argb: 'FF8585A0' } }; // Ink Muted
  subtitleCell.alignment = { vertical: 'middle', horizontal: 'left' };
  worksheet.getRow(2).height = 18;

  // Add decorative gold line below header (empty row with gold background)
  worksheet.getRow(3).height = 4;
  for (let c = 1; c <= 6; c++) {
    worksheet.getRow(3).getCell(c).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFC9A961' }
    };
  }

  worksheet.addRow([]); // Blank spacer

  // 2. PRODUCT INFO & FILTERS (Side by Side)
  worksheet.getCell('A5').value = 'INFORMACIÓN DEL PRODUCTO';
  worksheet.getCell('A5').font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF13131A' } };
  worksheet.getCell('D5').value = 'FILTROS DE BÚSQUEDA';
  worksheet.getCell('D5').font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF13131A' } };

  const writeMetadataRow = (rowNum: number, lbl1: string, val1: string | number, lbl2: string, val2: string) => {
    const r = worksheet.getRow(rowNum);
    r.getCell(1).value = lbl1;
    r.getCell(1).font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FF5A5A6A' } };
    r.getCell(2).value = val1;
    r.getCell(2).font = { name: 'Arial', size: 9, color: { argb: 'FF13131A' } };

    r.getCell(4).value = lbl2;
    r.getCell(4).font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FF5A5A6A' } };
    r.getCell(5).value = val2;
    r.getCell(5).font = { name: 'Arial', size: 9, color: { argb: 'FF13131A' } };
    r.height = 16;
  };

  const precVentaNum = Number(producto.PrecVenta) || 0;

  writeMetadataRow(6, 'SKU / Código:', producto.Producto, 'Desde:', filtros.fechaInicio || 'Inicio de los tiempos');
  writeMetadataRow(7, 'Descripción:', producto.Descripcion, 'Hasta:', filtros.fechaFin || 'Hoy');
  writeMetadataRow(8, 'Marca:', producto.Marca, 'Filtro Tipo:', filtros.tipo);
  writeMetadataRow(9, 'U. Medida:', producto.UniMed, 'Generado:', new Date().toLocaleString());
  
  worksheet.getRow(10).getCell(1).value = 'Precio Venta:';
  worksheet.getRow(10).getCell(1).font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FF5A5A6A' } };
  worksheet.getRow(10).getCell(2).value = precVentaNum;
  worksheet.getRow(10).getCell(2).font = { name: 'Arial', size: 9, color: { argb: 'FF13131A' } };
  worksheet.getRow(10).getCell(2).numFmt = 'S/ #,##0.00';
  worksheet.getRow(10).height = 16;

  worksheet.addRow([]); // Blank spacer

  // 3. STATS/KPI SECTION
  worksheet.mergeCells('A12:F12');
  const kpiTitle = worksheet.getCell('A12');
  kpiTitle.value = 'INDICADORES CLAVE DEL PERÍODO';
  kpiTitle.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF13131A' } };
  worksheet.getRow(12).height = 18;

  // Draw KPI Boxes
  const writeKpiBox = (colIndex: number, title: string, value: string | number, colorHex: string) => {
    const cellTitle = worksheet.getRow(13).getCell(colIndex);
    cellTitle.value = title.toUpperCase();
    cellTitle.font = { name: 'Arial', size: 8, bold: true, color: { argb: 'FF5A5A6A' } };
    cellTitle.alignment = { horizontal: 'center' };

    const cellVal = worksheet.getRow(14).getCell(colIndex);
    cellVal.value = value;
    cellVal.font = { name: 'Arial', size: 12, bold: true, color: { argb: colorHex } };
    cellVal.alignment = { horizontal: 'center' };

    // Border and background formatting
    for (let r = 13; r <= 14; r++) {
      worksheet.getRow(r).getCell(colIndex).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF5F3EC' }
      };
      worksheet.getRow(r).getCell(colIndex).border = {
        top: { style: 'thin', color: { argb: 'FFE8E6E0' } },
        bottom: { style: 'thin', color: { argb: 'FFE8E6E0' } },
        left: { style: 'thin', color: { argb: 'FFE8E6E0' } },
        right: { style: 'thin', color: { argb: 'FFE8E6E0' } }
      };
    }
  };

  writeKpiBox(1, 'Stock Actual', `${stats.stockActual} ${producto.UniMed}`, 'FF13131A');
  writeKpiBox(2, 'Ingresos', stats.totalIngresos, 'FF3D8B6A'); // Jade
  writeKpiBox(3, 'Salidas', stats.totalSalidas, 'FFC44848');  // Cinnabar
  writeKpiBox(4, 'Var. Neta', `${stats.variacion > 0 ? '+' : ''}${stats.variacion}`, stats.variacion > 0 ? 'FF3D8B6A' : stats.variacion < 0 ? 'FFC44848' : 'FF13131A');

  worksheet.getRow(13).height = 15;
  worksheet.getRow(14).height = 22;

  worksheet.addRow([]); // Blank spacer
  worksheet.addRow([]); // Blank spacer

  // 4. DATA TABLE HEADERS
  const tableHeaderRow = worksheet.getRow(17);
  tableHeaderRow.values = ['FECHA / HORA', 'DOCUMENTO', 'MOVIMIENTO', 'CANTIDAD', 'STOCK RESULTANTE', 'REFERENCIA / DETALLES'];
  tableHeaderRow.height = 24;

  const headerStyle = {
    font: { name: 'Arial', size: 9, bold: true, color: { argb: 'FFC9A961' } },
    fill: {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF13131A' } // Dark ink
    },
    alignment: { vertical: 'middle', horizontal: 'left' },
    border: {
      bottom: { style: 'medium', color: { argb: 'FFC9A961' } }
    }
  } as const;

  for (let c = 1; c <= 6; c++) {
    const cell = tableHeaderRow.getCell(c);
    cell.font = headerStyle.font;
    cell.fill = headerStyle.fill;
    cell.alignment = c === 4 || c === 5 ? { vertical: 'middle', horizontal: 'right' } : headerStyle.alignment;
    cell.border = headerStyle.border;
  }

  // 5. DATA ROWS
  let currentRowNum = 18;
  items.forEach((item, index) => {
    const r = worksheet.getRow(currentRowNum);
    
    let ref = '';
    if (item.proveedor) ref += `Proveedor: ${item.proveedor} | `;
    if (item.personal) ref += `Personal: ${item.personal} | `;
    if (item.documento_ref) ref += `Ref: ${item.documento_ref}`;
    if (ref.endsWith(' | ')) ref = ref.slice(0, -3);

    const cantidadSigned = item.tipomov === 'INGRESO' ? item.cantidad : -item.cantidad;

    r.getCell(1).value = new Date(item.fecha).toLocaleString('es-PE');
    r.getCell(2).value = item.documento;
    r.getCell(3).value = item.tipomov;
    r.getCell(4).value = cantidadSigned;
    r.getCell(5).value = item.stock;
    r.getCell(6).value = ref || '—';

    // Zebra striping color background
    const isEven = index % 2 === 0;
    const rowBg = isEven ? 'FFFFFFFF' : 'FFF9F9F9';

    // Set formatting for each cell
    for (let c = 1; c <= 6; c++) {
      const cell = r.getCell(c);
      cell.font = { name: 'Arial', size: 9, color: { argb: 'FF13131A' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: rowBg }
      };
      cell.border = {
        bottom: { style: 'thin', color: { argb: 'FFE8E6E0' } }
      };
      cell.alignment = { vertical: 'middle', horizontal: 'left' };
    }

    // Custom coloring and formatting for numbers
    const movCell = r.getCell(3);
    const qtyCell = r.getCell(4);
    const stockCell = r.getCell(5);

    if (item.tipomov === 'INGRESO') {
      movCell.font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FF3D8B6A' } };
      qtyCell.font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FF3D8B6A' } };
      qtyCell.numFmt = '+#,##0';
    } else {
      movCell.font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FFC44848' } };
      qtyCell.font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FFC44848' } };
      qtyCell.numFmt = '-#,##0';
    }

    qtyCell.alignment = { vertical: 'middle', horizontal: 'right' };
    stockCell.alignment = { vertical: 'middle', horizontal: 'right' };
    stockCell.font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FF13131A' } };
    stockCell.numFmt = '#,##0';

    r.height = 20;
    currentRowNum++;
  });

  // Set specific column widths
  worksheet.columns = [
    { key: 'fecha', width: 22 },
    { key: 'documento', width: 16 },
    { key: 'tipomov', width: 16 },
    { key: 'cantidad', width: 14 },
    { key: 'stock', width: 18 },
    { key: 'ref', width: 50 }
  ];

  // 6. WRITE TO BLOB & DOWNLOAD
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  const fileName = `Kardex_${producto.Producto}_${new Date().toISOString().slice(0,10)}.xlsx`;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

/**
 * Exporta cualquier conjunto de datos de reporte a Excel con un diseño premium y adaptado.
 */
export async function exportExcel(
  filename: string,
  title: string,
  rows: Record<string, unknown>[],
  columns?: string[],
) {
  if (rows.length === 0) return;

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(title.slice(0, 31));

  // Configurar visualización de líneas de cuadrícula
  worksheet.views = [{ showGridLines: true }];

  // 1. BRANDING HEADER (Cabecera Corporativa)
  worksheet.mergeCells('A1:H1');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = 'TENEBROSA - SISTEMA DE CONTROL DE INVENTARIO';
  titleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FFC9A961' } }; // Color Oro
  titleCell.alignment = { vertical: 'middle', horizontal: 'left' };
  worksheet.getRow(1).height = 30;

  worksheet.mergeCells('A2:H2');
  const subtitleCell = worksheet.getCell('A2');
  subtitleCell.value = `Reporte: ${title}`;
  subtitleCell.font = { name: 'Arial', size: 10, italic: true, color: { argb: 'FF8585A0' } }; // Ink Muted
  subtitleCell.alignment = { vertical: 'middle', horizontal: 'left' };
  worksheet.getRow(2).height = 18;

  // Línea decorativa dorada
  worksheet.getRow(3).height = 4;
  const colsCount = columns ? columns.length : Object.keys(rows[0]).length;
  const maxCols = Math.max(colsCount, 8);
  for (let c = 1; c <= maxCols; c++) {
    worksheet.getRow(3).getCell(c).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFC9A961' }
    };
  }

  worksheet.addRow([]); // Espaciador

  // 2. CABECERA DE LA TABLA
  const cols = columns ?? Object.keys(rows[0]);
  const tableHeaderRow = worksheet.getRow(5);
  
  const formatHeader = (key: string) => {
    const words = key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim().split(' ');
    return words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  };

  tableHeaderRow.values = cols.map(c => formatHeader(c));
  tableHeaderRow.height = 24;

  const headerStyle = {
    font: { name: 'Arial', size: 9, bold: true, color: { argb: 'FFC9A961' } },
    fill: {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF13131A' } // Dark Ink
    },
    alignment: { vertical: 'middle', horizontal: 'left' },
    border: {
      bottom: { style: 'medium', color: { argb: 'FFC9A961' } }
    }
  } as const;

  const getColConfig = (key: string) => {
    const k = key.toLowerCase();
    if (k.includes('total') || k.includes('monto') || k.includes('precio') || k.includes('importe') || k.includes('pagado') || k.includes('ticket') || k.includes('costo') || k.includes('venta') || k.includes('utilidad') || k.includes('ingreso')) {
      return { align: 'right', numFmt: 'S/ #,##0.00', type: 'currency' };
    }
    if (k.includes('cantidad') || k.includes('stock') || k.includes('veces') || k.includes('productos') || k.includes('cuota') || k.includes('dias') || k.includes('ventas')) {
      return { align: 'right', numFmt: '#,##0', type: 'number' };
    }
    if (k.includes('fecha') || k.includes('vence') || k.includes('primera') || k.includes('ultima')) {
      return { align: 'left', numFmt: undefined, type: 'date' };
    }
    return { align: 'left', numFmt: undefined, type: 'text' };
  };

  for (let c = 1; c <= cols.length; c++) {
    const key = cols[c - 1];
    const conf = getColConfig(key);
    const cell = tableHeaderRow.getCell(c);
    cell.font = headerStyle.font;
    cell.fill = headerStyle.fill;
    cell.alignment = { vertical: 'middle', horizontal: conf.align as 'left' | 'right' };
    cell.border = headerStyle.border;
  }

  // 3. FILAS DE DATOS
  let currentRowNum = 6;
  rows.forEach((row, index) => {
    const r = worksheet.getRow(currentRowNum);
    const isEven = index % 2 === 0;
    const rowBg = isEven ? 'FFFFFFFF' : 'FFF9F9F9';

    cols.forEach((colKey, cIdx) => {
      const cell = r.getCell(cIdx + 1);
      const val = row[colKey];
      const conf = getColConfig(colKey);

      if (val == null) {
        cell.value = '—';
      } else if (conf.type === 'date') {
        const d = new Date(val as string);
        if (!isNaN(d.getTime())) {
          cell.value = d.toLocaleDateString('es-PE') + ' ' + d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
        } else {
          cell.value = String(val);
        }
      } else if (conf.type === 'currency' || conf.type === 'number') {
        cell.value = Number(val);
      } else {
        cell.value = String(val);
      }

      cell.font = { name: 'Arial', size: 9, color: { argb: 'FF13131A' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: rowBg }
      };
      cell.border = {
        bottom: { style: 'thin', color: { argb: 'FFE8E6E0' } }
      };
      cell.alignment = { vertical: 'middle', horizontal: conf.align as 'left' | 'right' };
      if (conf.numFmt) {
        cell.numFmt = conf.numFmt;
      }
    });

    r.height = 20;
    currentRowNum++;
  });

  // Calcular anchos de columna dinámicamente
  worksheet.columns = cols.map((colKey) => {
    let maxLen = formatHeader(colKey).length + 4;
    rows.forEach(row => {
      const val = row[colKey];
      if (val != null) {
        let str = String(val);
        const conf = getColConfig(colKey);
        if (conf.type === 'currency') str = 'S/ ' + Number(val).toFixed(2);
        maxLen = Math.max(maxLen, str.length + 3);
      }
    });
    return { key: colKey, width: Math.min(Math.max(maxLen, 12), 40) };
  });

  // 4. ESCRIBIR BUFFER Y DESCARGAR
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  const finalFilename = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;
  a.download = finalFilename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

