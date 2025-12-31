import * as Papa from 'papaparse';
import * as XLSX from 'xlsx';

export async function csvFrom(file: { name: string; mime: string; arrayBuffer: () => Promise<ArrayBuffer> }): Promise<string> {
  const buf = await file.arrayBuffer();

  if (file.mime === 'text/csv' || /\.csv$/i.test(file.name)) {
    return new TextDecoder('utf-8').decode(buf).replace(/^\uFEFF/, '');
  }

  if (/sheet|excel/i.test(file.mime) || /\.(xlsx|xls)$/i.test(file.name)) {
    const wb = XLSX.read(buf, { type: 'array' });
    const first = wb.SheetNames[0];
    const csv = XLSX.utils.sheet_to_csv(wb.Sheets[first], { FS: ',', RS: '\n', strip: true });
    return csv.replace(/^\uFEFF/, '');
  }

  throw new Error(`Unsupported mime: ${file.mime}`);
}

export function csvParse(text: string): Record<string,string>[] {
  const { data, errors } = Papa.parse<Record<string,string>>(text, { header: true, dynamicTyping: false, skipEmptyLines: 'greedy' });
  if (errors?.length) {
    // Keep parsing but callers can choose to warn
  }
  return data.filter(Boolean);
}









