export type DataExchangeFormat = 'csv' | 'tsv' | 'json' | 'txt' | 'pdf' | 'xlsx';
export type DataExchangeCell = string | number | boolean | null | undefined | Date;
export type DataExchangeRow = Record<string, DataExchangeCell>;

export interface ParsedDataRows {
  headers: string[];
  rows: Array<Record<string, string>>;
}

interface DataExchangeBuildInput {
  title: string;
  rows: DataExchangeRow[];
  format: DataExchangeFormat;
}

interface DataExchangeDownloadInput extends DataExchangeBuildInput {
  fileBaseName: string;
}

const encoder = new TextEncoder();

export const dataExchangeFormats: DataExchangeFormat[] = ['csv', 'tsv', 'json', 'txt', 'pdf', 'xlsx'];
export const importFileAccept = '.csv,.tsv,.json,.txt';

async function readBlobText(blob: Blob): Promise<string> {
  if (typeof blob.text === 'function') {
    return blob.text();
  }

  return new Response(blob).text();
}

function getNormalizedValue(value: DataExchangeCell): string {
  if (value instanceof Date) {
    return value.toISOString();
  }

  if (value === null || value === undefined) {
    return '';
  }

  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }

  return String(value);
}

function escapeDelimitedValue(value: string, delimiter: ',' | '\t'): string {
  if (value.includes('"') || value.includes('\n') || value.includes('\r') || value.includes(delimiter)) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function escapePdfText(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function isNumericValue(value: string): boolean {
  if (!value.trim()) {
    return false;
  }

  return !Number.isNaN(Number(value));
}

function getColumns(rows: DataExchangeRow[]): string[] {
  const seen = new Set<string>();

  rows.forEach((row) => {
    Object.keys(row).forEach((key) => {
      if (!seen.has(key)) {
        seen.add(key);
      }
    });
  });

  return Array.from(seen);
}

function rowsToDelimitedText(rows: DataExchangeRow[], delimiter: ',' | '\t'): string {
  const columns = getColumns(rows);

  if (!columns.length) {
    return '';
  }

  const headerLine = columns.map((column) => escapeDelimitedValue(column, delimiter)).join(delimiter);
  const bodyLines = rows.map((row) =>
    columns
      .map((column) => escapeDelimitedValue(getNormalizedValue(row[column]), delimiter))
      .join(delimiter)
  );

  return [headerLine, ...bodyLines].join('\n');
}

function rowsToJson(rows: DataExchangeRow[]): string {
  return JSON.stringify(rows, null, 2);
}

function rowsToText(title: string, rows: DataExchangeRow[]): string {
  const columns = getColumns(rows);

  if (!columns.length) {
    return `${title}\n\nNo records available.`;
  }

  const recordBlocks = rows.map((row, index) => {
    const lines = [`Record ${index + 1}`];

    columns.forEach((column) => {
      lines.push(`${column}: ${getNormalizedValue(row[column])}`);
    });

    return lines.join('\n');
  });

  return `${title}\n\n${recordBlocks.join('\n\n')}`;
}

function chunkLines(lines: string[], perPage: number): string[][] {
  if (!lines.length) {
    return [['No records available.']];
  }

  const pages: string[][] = [];

  for (let index = 0; index < lines.length; index += perPage) {
    pages.push(lines.slice(index, index + perPage));
  }

  return pages;
}

function buildPdf(title: string, rows: DataExchangeRow[]): Uint8Array {
  const columns = getColumns(rows);
  const lines = columns.length
    ? [columns.join(' | '), ...rows.map((row) => columns.map((column) => getNormalizedValue(row[column])).join(' | '))]
    : ['No records available.'];
  const pages = chunkLines(lines, 40);
  const objects: string[] = [];
  const pageObjectNumbers: number[] = [];
  const contentObjectNumbers: number[] = [];
  const fontObjectNumber = 3;
  let nextObjectNumber = 4;

  pages.forEach((pageLines) => {
    const contentObjectNumber = nextObjectNumber;
    const pageObjectNumber = nextObjectNumber + 1;
    nextObjectNumber += 2;

    const textLines = [
      'BT',
      '/F1 10 Tf',
      '40 790 Td',
      `(${escapePdfText(title)}) Tj`,
      '0 -18 Td'
    ];

    pageLines.forEach((line, index) => {
      if (index > 0) {
        textLines.push('0 -14 Td');
      }
      textLines.push(`(${escapePdfText(line)}) Tj`);
    });

    textLines.push('ET');

    const streamBody = textLines.join('\n');
    objects[contentObjectNumber] = `<< /Length ${streamBody.length} >>\nstream\n${streamBody}\nendstream`;
    objects[pageObjectNumber] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 842] /Resources << /Font << /F1 ${fontObjectNumber} 0 R >> >> /Contents ${contentObjectNumber} 0 R >>`;
    contentObjectNumbers.push(contentObjectNumber);
    pageObjectNumbers.push(pageObjectNumber);
  });

  objects[1] = `<< /Type /Catalog /Pages 2 0 R >>`;
  objects[2] = `<< /Type /Pages /Count ${pageObjectNumbers.length} /Kids [${pageObjectNumbers.map((item) => `${item} 0 R`).join(' ')}] >>`;
  objects[fontObjectNumber] = '<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>';

  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [0];

  for (let objectNumber = 1; objectNumber < objects.length; objectNumber += 1) {
    const objectBody = objects[objectNumber];

    if (!objectBody) {
      continue;
    }

    offsets[objectNumber] = pdf.length;
    pdf += `${objectNumber} 0 obj\n${objectBody}\nendobj\n`;
  }

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length}\n`;
  pdf += '0000000000 65535 f \n';

  for (let objectNumber = 1; objectNumber < objects.length; objectNumber += 1) {
    const offset = offsets[objectNumber] ?? 0;
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return encoder.encode(pdf);
}

function getColumnLabel(index: number): string {
  let currentIndex = index + 1;
  let label = '';

  while (currentIndex > 0) {
    const remainder = (currentIndex - 1) % 26;
    label = String.fromCharCode(65 + remainder) + label;
    currentIndex = Math.floor((currentIndex - 1) / 26);
  }

  return label;
}

function createWorksheetXml(rows: DataExchangeRow[]): string {
  const columns = getColumns(rows);
  const allRows = columns.length
    ? [columns, ...rows.map((row) => columns.map((column) => getNormalizedValue(row[column])))]
    : [['No records available']];
  const lastColumn = getColumnLabel(Math.max(0, allRows[0].length - 1));
  const dimension = `A1:${lastColumn}${allRows.length}`;
  const rowXml = allRows
    .map((cells, rowIndex) => {
      const cellXml = cells
        .map((cellValue, cellIndex) => {
          const cellReference = `${getColumnLabel(cellIndex)}${rowIndex + 1}`;

          if (rowIndex > 0 && isNumericValue(cellValue)) {
            return `<c r="${cellReference}"><v>${cellValue}</v></c>`;
          }

          return `<c r="${cellReference}" t="inlineStr"><is><t xml:space="preserve">${escapeXml(cellValue)}</t></is></c>`;
        })
        .join('');

      return `<row r="${rowIndex + 1}">${cellXml}</row>`;
    })
    .join('');

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <dimension ref="${dimension}"/>
  <sheetViews>
    <sheetView workbookViewId="0"/>
  </sheetViews>
  <sheetFormatPr defaultRowHeight="15"/>
  <sheetData>${rowXml}</sheetData>
</worksheet>`;
}

function getCrc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;

  for (let index = 0; index < bytes.length; index += 1) {
    crc ^= bytes[index];

    for (let bit = 0; bit < 8; bit += 1) {
      const mask = -(crc & 1);
      crc = (crc >>> 1) ^ (0xedb88320 & mask);
    }
  }

  return (crc ^ 0xffffffff) >>> 0;
}

function concatenateUint8Arrays(chunks: Uint8Array[]): Uint8Array {
  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;

  chunks.forEach((chunk) => {
    result.set(chunk, offset);
    offset += chunk.length;
  });

  return result;
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);
  return buffer;
}

function createStoredZip(entries: Array<{ name: string; data: Uint8Array }>): Uint8Array {
  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let localOffset = 0;

  entries.forEach((entry) => {
    const nameBytes = encoder.encode(entry.name);
    const crc32 = getCrc32(entry.data);
    const localHeader = new Uint8Array(30 + nameBytes.length);
    const localView = new DataView(localHeader.buffer);
    localView.setUint32(0, 0x04034b50, true);
    localView.setUint16(4, 20, true);
    localView.setUint16(6, 0, true);
    localView.setUint16(8, 0, true);
    localView.setUint16(10, 0, true);
    localView.setUint16(12, 0, true);
    localView.setUint32(14, crc32, true);
    localView.setUint32(18, entry.data.length, true);
    localView.setUint32(22, entry.data.length, true);
    localView.setUint16(26, nameBytes.length, true);
    localView.setUint16(28, 0, true);
    localHeader.set(nameBytes, 30);
    localParts.push(localHeader, entry.data);

    const centralHeader = new Uint8Array(46 + nameBytes.length);
    const centralView = new DataView(centralHeader.buffer);
    centralView.setUint32(0, 0x02014b50, true);
    centralView.setUint16(4, 20, true);
    centralView.setUint16(6, 20, true);
    centralView.setUint16(8, 0, true);
    centralView.setUint16(10, 0, true);
    centralView.setUint16(12, 0, true);
    centralView.setUint16(14, 0, true);
    centralView.setUint32(16, crc32, true);
    centralView.setUint32(20, entry.data.length, true);
    centralView.setUint32(24, entry.data.length, true);
    centralView.setUint16(28, nameBytes.length, true);
    centralView.setUint16(30, 0, true);
    centralView.setUint16(32, 0, true);
    centralView.setUint16(34, 0, true);
    centralView.setUint16(36, 0, true);
    centralView.setUint32(38, 0, true);
    centralView.setUint32(42, localOffset, true);
    centralHeader.set(nameBytes, 46);
    centralParts.push(centralHeader);

    localOffset += localHeader.length + entry.data.length;
  });

  const centralDirectory = concatenateUint8Arrays(centralParts);
  const localData = concatenateUint8Arrays(localParts);
  const endRecord = new Uint8Array(22);
  const endView = new DataView(endRecord.buffer);
  endView.setUint32(0, 0x06054b50, true);
  endView.setUint16(4, 0, true);
  endView.setUint16(6, 0, true);
  endView.setUint16(8, entries.length, true);
  endView.setUint16(10, entries.length, true);
  endView.setUint32(12, centralDirectory.length, true);
  endView.setUint32(16, localData.length, true);
  endView.setUint16(20, 0, true);

  return concatenateUint8Arrays([localData, centralDirectory, endRecord]);
}

function buildXlsx(rows: DataExchangeRow[]): Uint8Array {
  const entries = [
    {
      name: '[Content_Types].xml',
      data: encoder.encode(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`)
    },
    {
      name: '_rels/.rels',
      data: encoder.encode(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`)
    },
    {
      name: 'xl/workbook.xml',
      data: encoder.encode(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="Sheet1" sheetId="1" r:id="rId1"/>
  </sheets>
</workbook>`)
    },
    {
      name: 'xl/_rels/workbook.xml.rels',
      data: encoder.encode(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`)
    },
    {
      name: 'xl/styles.xml',
      data: encoder.encode(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="1"><font><sz val="11"/><name val="Calibri"/></font></fonts>
  <fills count="1"><fill><patternFill patternType="none"/></fill></fills>
  <borders count="1"><border/></borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/></cellXfs>
  <cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`)
    },
    {
      name: 'xl/worksheets/sheet1.xml',
      data: encoder.encode(createWorksheetXml(rows))
    }
  ];

  return createStoredZip(entries);
}

export async function buildDataExportBlob(input: DataExchangeBuildInput): Promise<Blob> {
  if (input.format === 'csv') {
    return new Blob([rowsToDelimitedText(input.rows, ',')], { type: 'text/csv;charset=utf-8' });
  }

  if (input.format === 'tsv') {
    return new Blob([rowsToDelimitedText(input.rows, '\t')], { type: 'text/tab-separated-values;charset=utf-8' });
  }

  if (input.format === 'json') {
    return new Blob([rowsToJson(input.rows)], { type: 'application/json;charset=utf-8' });
  }

  if (input.format === 'txt') {
    return new Blob([rowsToText(input.title, input.rows)], { type: 'text/plain;charset=utf-8' });
  }

  if (input.format === 'pdf') {
    const pdfBytes = buildPdf(input.title, input.rows);
    return new Blob([toArrayBuffer(pdfBytes)], {
      type: 'application/pdf'
    });
  }

  const workbookBytes = buildXlsx(input.rows);
  return new Blob([toArrayBuffer(workbookBytes)], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
}

export async function downloadDataExport(input: DataExchangeDownloadInput): Promise<void> {
  if (typeof window === 'undefined') {
    return;
  }

  const blob = await buildDataExportBlob(input);
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = `${input.fileBaseName}.${input.format}`;
  anchor.click();
  URL.revokeObjectURL(objectUrl);
}

export function parseDelimitedText(sourceText: string, delimiter: ',' | '\t'): ParsedDataRows {
  const matrix: string[][] = [];
  let currentValue = '';
  let currentRow: string[] = [];
  let insideQuotes = false;

  for (let index = 0; index < sourceText.length; index += 1) {
    const currentCharacter = sourceText[index];
    const nextCharacter = sourceText[index + 1];

    if (currentCharacter === '"') {
      if (insideQuotes && nextCharacter === '"') {
        currentValue += '"';
        index += 1;
      } else {
        insideQuotes = !insideQuotes;
      }
      continue;
    }

    if (currentCharacter === delimiter && !insideQuotes) {
      currentRow.push(currentValue.trim());
      currentValue = '';
      continue;
    }

    if ((currentCharacter === '\n' || currentCharacter === '\r') && !insideQuotes) {
      if (currentCharacter === '\r' && nextCharacter === '\n') {
        index += 1;
      }

      currentRow.push(currentValue.trim());
      currentValue = '';
      if (currentRow.some((cell) => cell.length > 0)) {
        matrix.push(currentRow);
      }
      currentRow = [];
      continue;
    }

    currentValue += currentCharacter;
  }

  currentRow.push(currentValue.trim());
  if (currentRow.some((cell) => cell.length > 0)) {
    matrix.push(currentRow);
  }

  if (!matrix.length) {
    return { headers: [], rows: [] };
  }

  const headers = matrix[0].map((header) => header.trim()).filter((header) => header.length > 0);
  const rows = matrix.slice(1).map((row) =>
    headers.reduce<Record<string, string>>((accumulator, header, headerIndex) => {
      accumulator[header] = (row[headerIndex] ?? '').trim();
      return accumulator;
    }, {})
  );

  return { headers, rows };
}

function parsePlainText(sourceText: string): ParsedDataRows {
  if (sourceText.includes('\t')) {
    return parseDelimitedText(sourceText, '\t');
  }

  const blocks = sourceText
    .split(/\n\s*\n/g)
    .map((block) => block.trim())
    .filter((block) => block.length > 0 && !/^record\s+\d+$/i.test(block));
  const rowMaps = blocks.map((block) => {
    const row: Record<string, string> = {};

    block.split(/\n+/).forEach((line) => {
      const separatorIndex = line.indexOf(':');

      if (separatorIndex <= 0) {
        return;
      }

      const key = line.slice(0, separatorIndex).trim();
      const value = line.slice(separatorIndex + 1).trim();

      if (key) {
        row[key] = value;
      }
    });

    return row;
  }).filter((row) => Object.keys(row).length > 0);

  const headers = Array.from(
    rowMaps.reduce((set, row) => {
      Object.keys(row).forEach((key) => set.add(key));
      return set;
    }, new Set<string>())
  );

  return { headers, rows: rowMaps };
}

function parseJsonText(sourceText: string): ParsedDataRows {
  const parsed = JSON.parse(sourceText) as unknown;
  const rows = Array.isArray(parsed)
    ? parsed
    : parsed && typeof parsed === 'object' && Array.isArray((parsed as { rows?: unknown }).rows)
      ? (parsed as { rows: unknown[] }).rows
      : [];

  const normalizedRows = rows
    .filter((row): row is Record<string, unknown> => Boolean(row) && typeof row === 'object' && !Array.isArray(row))
    .map((row) =>
      Object.entries(row).reduce<Record<string, string>>((accumulator, [key, value]) => {
        accumulator[key] = getNormalizedValue(value as DataExchangeCell);
        return accumulator;
      }, {})
    );

  const headers = Array.from(
    normalizedRows.reduce((set, row) => {
      Object.keys(row).forEach((key) => set.add(key));
      return set;
    }, new Set<string>())
  );

  return { headers, rows: normalizedRows };
}

export async function parseImportFile(file: File): Promise<ParsedDataRows> {
  const fileText = await readBlobText(file);
  const extension = file.name.split('.').pop()?.toLowerCase() ?? '';

  if (extension === 'json') {
    return parseJsonText(fileText);
  }

  if (extension === 'tsv') {
    return parseDelimitedText(fileText, '\t');
  }

  if (extension === 'txt') {
    return parsePlainText(fileText);
  }

  return parseDelimitedText(fileText, ',');
}

export function findMatchingHeader(headers: string[], aliases: string[]): string {
  return (
    headers.find((header) => {
      const normalizedHeader = header.toLowerCase().replace(/[^a-z0-9]+/g, '');
      return aliases.some((alias) => normalizedHeader.includes(alias));
    }) ?? ''
  );
}
