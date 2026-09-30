type CsvValue = string | number | null | undefined;

export function formatLocalDate(date: Date): string {
  // El input date representa el calendario local, así que se compara en la misma zona horaria.
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function escapeCsvValue(value: CsvValue): string {
  const text = String(value ?? '');
  // Las comillas protegen la estructura CSV; el prefijo evita evaluar fórmulas en hojas de cálculo.
  const spreadsheetSafeText = /^[\t\r\n ]*[=+\-@]/.test(text) ? `'${text}` : text;

  return `"${spreadsheetSafeText.replace(/"/g, '""')}"`;
}

export function serializeCsv(headers: string[], rows: CsvValue[][]): string {
  return [headers, ...rows]
    .map((row) => row.map(escapeCsvValue).join(','))
    .join('\r\n');
}
