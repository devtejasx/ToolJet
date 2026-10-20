import * as XLSX from 'xlsx';
import { processXls } from '../helpers/fileProcessing';

jest.mock('react-hot-toast', () => ({ toast: { error: jest.fn() } }));

const workbookAsBase64 = (sheets) => {
  const workbook = XLSX.utils.book_new();
  Object.entries(sheets).forEach(([name, rows]) => {
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(rows), name);
  });
  return XLSX.write(workbook, { type: 'base64', bookType: 'xlsx' });
};

describe('processXls', () => {
  it('parses a single Sheet1 workbook the same way as before', async () => {
    expect(await processXls(workbookAsBase64({ Sheet1: [{ a: 1, b: 2 }] }))).toEqual({ Sheet1: [{ a: 1, b: 2 }] });
  });

  it('parses every sheet, keyed by its name', async () => {
    const parsed = await processXls(
      workbookAsBase64({ Sheet1: [{ id: 1 }], Orders: [{ order: 'A-1' }], Refunds: [{ order: 'A-2' }] })
    );

    expect(parsed).toEqual({ Sheet1: [{ id: 1 }], Orders: [{ order: 'A-1' }], Refunds: [{ order: 'A-2' }] });
  });

  it('still exposes the first sheet as Sheet1 when it has another name', async () => {
    const parsed = await processXls(workbookAsBase64({ Customers: [{ name: 'Ada' }], Orders: [{ order: 'A-1' }] }));

    expect(parsed).toEqual({
      Sheet1: [{ name: 'Ada' }],
      Customers: [{ name: 'Ada' }],
      Orders: [{ order: 'A-1' }],
    });
  });

  it('accepts a data URL and returns an empty object for an empty workbook', async () => {
    const base64 = workbookAsBase64({ Sheet1: [] });

    expect(await processXls(`data:application/vnd.ms-excel;base64,${base64}`)).toEqual({});
  });
});
