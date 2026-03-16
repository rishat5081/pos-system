import { buildDataExportBlob, findMatchingHeader, parseDelimitedText, parseImportFile } from '@/lib/dataExchange';

describe('dataExchange', () => {
  it('parses delimited csv text into headers and rows', () => {
    const parsed = parseDelimitedText('name,amount\nApples,12\nMilk,4', ',');

    expect(parsed.headers).toEqual(['name', 'amount']);
    expect(parsed.rows).toEqual([
      { name: 'Apples', amount: '12' },
      { name: 'Milk', amount: '4' }
    ]);
  });

  it('parses json and txt import files', async () => {
    const jsonFile = {
      name: 'staff.json',
      text: async () => JSON.stringify([{ fullName: 'Mia Carter', role: 'Cashier' }])
    } as File;
    const txtFile = {
      name: 'staff.txt',
      text: async () => 'Record 1\nfullName: Lena Ford\nrole: Cashier'
    } as File;

    const parsedJson = await parseImportFile(jsonFile);
    const parsedText = await parseImportFile(txtFile);

    expect(parsedJson.rows[0]).toEqual({ fullName: 'Mia Carter', role: 'Cashier' });
    expect(parsedText.rows[0]).toEqual({ fullName: 'Lena Ford', role: 'Cashier' });
  });

  it('finds matching headers from alias lists', () => {
    const header = findMatchingHeader(['Customer Name', 'Grand Total'], ['customername', 'client']);

    expect(header).toBe('Customer Name');
  });

  it('builds pdf and xlsx exports', async () => {
    const rows = [{ name: 'Emily Rivera', totalAmount: 42.5 }];
    const pdfBlob = await buildDataExportBlob({ title: 'Orders', rows, format: 'pdf' });
    const xlsxBlob = await buildDataExportBlob({ title: 'Orders', rows, format: 'xlsx' });

    expect(pdfBlob.type).toBe('application/pdf');
    expect(xlsxBlob.type).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    expect(xlsxBlob.size).toBeGreaterThan(0);
  });
});
