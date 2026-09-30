import { describe, expect, it } from 'vitest';
import { formatLocalDate, serializeCsv } from './checkinCsv';

describe('formatLocalDate', () => {
  it('formats a date using its local calendar day', () => {
    expect(formatLocalDate(new Date(2025, 4, 9, 23, 59))).toBe('2025-05-09');
  });
});

describe('serializeCsv', () => {
  it('quotes values and escapes embedded quotes, commas, and newlines', () => {
    const csv = serializeCsv(
      ['Nombre', 'Nota'],
      [['Ana, "López"', 'Habitación\n3']],
    );

    expect(csv).toBe('"Nombre","Nota"\r\n"Ana, ""López""","Habitación\n3"');
  });

  it('neutralizes spreadsheet formula prefixes', () => {
    const rows = ['=2+2', ' +SUM(A1:A2)', '-cmd', '@SUM(A1)'].map((value) => [value]);
    const csv = serializeCsv(['Valor'], rows);

    expect(csv.split('\r\n').slice(1)).toEqual([
      '"\'=2+2"',
      '"\' +SUM(A1:A2)"',
      '"\'-cmd"',
      '"\'@SUM(A1)"',
    ]);
  });

  it('serializes nullish fields as empty cells', () => {
    expect(serializeCsv(['Valor'], [[null], [undefined], ['']])).toBe(
      '"Valor"\r\n""\r\n""\r\n""',
    );
  });
});
