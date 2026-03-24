import { type ChangeEvent, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  dataExchangeFormats,
  downloadDataExport,
  findMatchingHeader,
  importFileAccept,
  parseDelimitedText,
  parseImportFile,
  type DataExchangeFormat
} from '@/lib/dataExchange';
import { formatCurrencyValue, formatDateValue, formatDateTimeValue } from '@/lib/globalFormat';
import {
  type InvoiceStatus,
  type OrderCustomFieldType,
  type OrderStatus,
  type PaymentMethod,
  type ReturnResolution,
  useStoreOpsStore
} from '@/stores/storeOpsStore';

interface CsvColumnMap {
  orderId: string;
  customerName: string;
  totalAmount: string;
  paymentMethod: string;
  status: string;
  createdAt: string;
}

interface ParsedCsvResult {
  headers: string[];
  rows: Array<Record<string, string>>;
}

interface ReturnFormState {
  orderId: string;
  reason: string;
  resolution: ReturnResolution;
  restocked: boolean;
  productId: string;
  quantity: string;
  exchangeProductId: string;
  exchangeQuantity: string;
}

const initialCsvColumnMap: CsvColumnMap = {
  orderId: '',
  customerName: '',
  totalAmount: '',
  paymentMethod: '',
  status: '',
  createdAt: ''
};

function toPaymentMethod(value: string): PaymentMethod {
  const normalizedValue = value.trim().toLowerCase();

  if (normalizedValue === 'cash' || normalizedValue === 'card' || normalizedValue === 'digital') {
    return normalizedValue;
  }

  return 'cash';
}

function toOrderStatus(value: string): OrderStatus {
  const normalizedValue = value.trim().toLowerCase();

  if (normalizedValue === 'completed' || normalizedValue === 'cancelled' || normalizedValue === 'refunded') {
    return normalizedValue;
  }

  return 'completed';
}

function toInvoiceStatusTone(value: InvoiceStatus): string {
  if (value === 'paid') {
    return 'text-emerald-700';
  }

  if (value === 'overdue') {
    return 'text-red-700';
  }

  if (value === 'cancelled') {
    return 'text-slate-500';
  }

  return 'text-slate-700';
}

function detectCustomFieldType(values: string[]): OrderCustomFieldType {
  const nonEmptyValues = values.filter((value) => value.trim().length > 0);

  if (!nonEmptyValues.length) {
    return 'text';
  }

  const allNumbers = nonEmptyValues.every((value) => !Number.isNaN(Number(value)));
  if (allNumbers) {
    return 'number';
  }

  const allDates = nonEmptyValues.every((value) => !Number.isNaN(new Date(value).getTime()));
  if (allDates) {
    return 'date';
  }

  return 'text';
}

function parseAmountValue(rawValue: string): number {
  const normalizedValue = rawValue.replace(/[^0-9.-]+/g, '');
  const parsedValue = Number(normalizedValue);
  return Number.isFinite(parsedValue) ? parsedValue : 0;
}

function resolveColumnMap(headers: string[]): CsvColumnMap {
  return {
    orderId: findMatchingHeader(headers, ['orderid', 'order', 'reference']),
    customerName: findMatchingHeader(headers, ['customername', 'customer', 'clientname', 'client']),
    totalAmount: findMatchingHeader(headers, ['totalamount', 'total', 'amount', 'grandtotal']),
    paymentMethod: findMatchingHeader(headers, ['paymentmethod', 'payment', 'tender']),
    status: findMatchingHeader(headers, ['status', 'orderstatus']),
    createdAt: findMatchingHeader(headers, ['createdat', 'created', 'date', 'orderedat'])
  };
}

export function OrderManagementPage() {
  const orders = useStoreOpsStore((state) => state.orders);
  const returns = useStoreOpsStore((state) => state.returns);
  const products = useStoreOpsStore((state) => state.products);
  const globalPreferences = useStoreOpsStore((state) => state.globalPreferences);
  const orderCustomFields = useStoreOpsStore((state) => state.orderCustomFields);
  const invoices = useStoreOpsStore((state) => state.invoices);
  const setOrderStatus = useStoreOpsStore((state) => state.setOrderStatus);
  const setOrderDelivery = useStoreOpsStore((state) => state.setOrderDelivery);
  const addOrderCustomField = useStoreOpsStore((state) => state.addOrderCustomField);
  const importOrders = useStoreOpsStore((state) => state.importOrders);
  const createInvoice = useStoreOpsStore((state) => state.createInvoice);
  const createOrderReturn = useStoreOpsStore((state) => state.createOrderReturn);
  const setInvoiceStatus = useStoreOpsStore((state) => state.setInvoiceStatus);
  const markInvoiceReminderNotified = useStoreOpsStore((state) => state.markInvoiceReminderNotified);

  const [searchInput, setSearchInput] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');
  const [customFieldLabelInput, setCustomFieldLabelInput] = useState<string>('');
  const [customFieldTypeInput, setCustomFieldTypeInput] = useState<OrderCustomFieldType>('text');
  const [csvInput, setCsvInput] = useState<string>('');
  const [parsedCsvHeaders, setParsedCsvHeaders] = useState<string[]>([]);
  const [parsedCsvRows, setParsedCsvRows] = useState<Array<Record<string, string>>>([]);
  const [csvColumnMap, setCsvColumnMap] = useState<CsvColumnMap>(initialCsvColumnMap);
  const [retainedColumns, setRetainedColumns] = useState<Record<string, boolean>>({});
  const [csvImportMessage, setCsvImportMessage] = useState<string>('');
  const [dataExchangeMessage, setDataExchangeMessage] = useState<string>('');
  const [selectedExportDataset, setSelectedExportDataset] = useState<'orders' | 'invoices' | 'returns'>('orders');
  const [linkedOrderIdInput, setLinkedOrderIdInput] = useState<string>('');
  const [invoiceCustomerInput, setInvoiceCustomerInput] = useState<string>('');
  const [invoiceAmountInput, setInvoiceAmountInput] = useState<string>('');
  const [invoiceIssueDateInput, setInvoiceIssueDateInput] = useState<string>(new Date().toISOString().slice(0, 10));
  const [invoiceDueDateInput, setInvoiceDueDateInput] = useState<string>('');
  const [invoiceReminderDateInput, setInvoiceReminderDateInput] = useState<string>('');
  const [invoiceNotesInput, setInvoiceNotesInput] = useState<string>('');
  const [deliveryDateByOrder, setDeliveryDateByOrder] = useState<Record<string, string>>({});
  const [returnForm, setReturnForm] = useState<ReturnFormState>({
    orderId: orders[0]?.id ?? '',
    reason: '',
    resolution: 'refund',
    restocked: true,
    productId: orders[0]?.items[0]?.productId ?? products[0]?.id ?? '',
    quantity: '1',
    exchangeProductId: products[0]?.id ?? '',
    exchangeQuantity: '1'
  });
  const [returnMessage, setReturnMessage] = useState<string>('');
  const [orderPage, setOrderPage] = useState<number>(1);
  const ordersPerPage = 20;

  const filteredOrders = useMemo(() => {
    setOrderPage(1);

    return orders.filter((orderRecord) => {
      const matchesStatus = statusFilter === 'all' || orderRecord.status === statusFilter;
      const normalizedSearch = searchInput.trim().toLowerCase();

      if (!normalizedSearch) {
        return matchesStatus;
      }

      return (
        matchesStatus &&
        (orderRecord.id.toLowerCase().includes(normalizedSearch) ||
          orderRecord.customerName.toLowerCase().includes(normalizedSearch))
      );
    });
  }, [orders, searchInput, statusFilter]);

  const totalOrderPages = Math.max(1, Math.ceil(filteredOrders.length / ordersPerPage));
  const paginatedOrders = useMemo(
    () => filteredOrders.slice((orderPage - 1) * ordersPerPage, orderPage * ordersPerPage),
    [filteredOrders, orderPage]
  );

  const orderExportRows = useMemo(
    () =>
      filteredOrders.map((orderRecord) => ({
        id: orderRecord.id,
        customerName: orderRecord.customerName,
        createdAt: orderRecord.createdAt,
        updatedAt: orderRecord.updatedAt,
        status: orderRecord.status,
        paymentMethod: orderRecord.paymentMethod,
        subTotal: orderRecord.subTotal,
        discountAmount: orderRecord.discountAmount,
        taxAmount: orderRecord.taxAmount,
        totalAmount: orderRecord.totalAmount,
        deliveryStatus: orderRecord.deliveryStatus,
        deliveryDate: orderRecord.deliveryDate ?? '',
        itemsCount: orderRecord.items.length,
        ...orderRecord.customFieldValues
      })),
    [filteredOrders]
  );

  const invoiceExportRows = useMemo(
    () =>
      invoices.map((invoiceRecord) => ({
        invoiceNumber: invoiceRecord.invoiceNumber,
        linkedOrderId: invoiceRecord.linkedOrderId ?? '',
        customerName: invoiceRecord.customerName,
        amount: invoiceRecord.amount,
        status: invoiceRecord.status,
        issueDate: invoiceRecord.issueDate,
        dueDate: invoiceRecord.dueDate,
        reminderDate: invoiceRecord.reminderDate,
        reminderNotified: invoiceRecord.reminderNotified,
        notes: invoiceRecord.notes
      })),
    [invoices]
  );

  const returnExportRows = useMemo(
    () =>
      returns.map((returnRecord) => ({
        id: returnRecord.id,
        orderId: returnRecord.orderId,
        customerName: returnRecord.customerName,
        resolution: returnRecord.resolution,
        restocked: returnRecord.restocked,
        amount: returnRecord.amount,
        createdAt: returnRecord.createdAt,
        replacementOrderId: returnRecord.replacementOrderId ?? '',
        items: returnRecord.lineItems.map((lineItem) => `${lineItem.productName} x${lineItem.quantity}`).join(' | '),
        reason: returnRecord.reason
      })),
    [returns]
  );

  const selectedExportRows =
    selectedExportDataset === 'orders'
      ? orderExportRows
      : selectedExportDataset === 'invoices'
        ? invoiceExportRows
        : returnExportRows;

  const applyParsedRows = (parsedRowsResult: ParsedCsvResult, sourceLabel: string): void => {
    setParsedCsvHeaders(parsedRowsResult.headers);
    setParsedCsvRows(parsedRowsResult.rows);

    const nextColumnMap = resolveColumnMap(parsedRowsResult.headers);
    setCsvColumnMap(nextColumnMap);

    const mappedColumns = new Set(Object.values(nextColumnMap).filter((columnName) => Boolean(columnName)));
    const nextRetainedColumns = parsedRowsResult.headers.reduce<Record<string, boolean>>((accumulator, header) => {
      accumulator[header] = !mappedColumns.has(header);
      return accumulator;
    }, {});

    setRetainedColumns(nextRetainedColumns);
    setCsvImportMessage(parsedRowsResult.rows.length ? `${sourceLabel}: loaded ${parsedRowsResult.rows.length} rows.` : 'No rows found.');
  };

  const handleAnalyzeCsv = (): void => {
    applyParsedRows(parseDelimitedText(csvInput, ','), 'CSV analysis');
  };

  const handleImportOrders = (): void => {
    if (!csvColumnMap.customerName || !csvColumnMap.totalAmount || !parsedCsvRows.length) {
      setCsvImportMessage('Customer and total amount columns are required for import.');
      return;
    }

    const retainedColumnNames = parsedCsvHeaders.filter((header) => retainedColumns[header]);

    retainedColumnNames.forEach((columnName) => {
      const values = parsedCsvRows.map((rowRecord) => rowRecord[columnName] ?? '');
      addOrderCustomField({
        label: columnName,
        type: detectCustomFieldType(values)
      });
    });

    const importRows = parsedCsvRows.map((rowRecord, rowIndex) => {
      const customFieldValues = retainedColumnNames.reduce<Record<string, string>>((accumulator, columnName) => {
        accumulator[columnName] = rowRecord[columnName] ?? '';
        return accumulator;
      }, {});

      return {
        id: csvColumnMap.orderId ? rowRecord[csvColumnMap.orderId] : `importedOrder-${Date.now()}-${rowIndex + 1}`,
        customerName: rowRecord[csvColumnMap.customerName] ?? '',
        totalAmount: parseAmountValue(rowRecord[csvColumnMap.totalAmount] ?? ''),
        paymentMethod: toPaymentMethod(csvColumnMap.paymentMethod ? rowRecord[csvColumnMap.paymentMethod] ?? '' : ''),
        status: toOrderStatus(csvColumnMap.status ? rowRecord[csvColumnMap.status] ?? '' : ''),
        createdAt: csvColumnMap.createdAt ? rowRecord[csvColumnMap.createdAt] : undefined,
        customFieldValues
      };
    });

    importOrders(importRows);
    setCsvImportMessage(`Imported ${importRows.length} orders.`);
  };

  const handleCreateInvoice = (): void => {
    createInvoice({
      linkedOrderId: linkedOrderIdInput || undefined,
      customerName: invoiceCustomerInput,
      amount: Number(invoiceAmountInput),
      issueDate: invoiceIssueDateInput,
      dueDate: invoiceDueDateInput,
      reminderDate: invoiceReminderDateInput,
      notes: invoiceNotesInput
    });

    setInvoiceCustomerInput('');
    setInvoiceAmountInput('');
    setInvoiceDueDateInput('');
    setInvoiceReminderDateInput('');
    setInvoiceNotesInput('');
    setLinkedOrderIdInput('');
  };

  const handleAutofillOrder = (orderId: string): void => {
    setLinkedOrderIdInput(orderId);
    const selectedOrder = orders.find((orderRecord) => orderRecord.id === orderId);

    if (!selectedOrder) {
      return;
    }

    setInvoiceCustomerInput(selectedOrder.customerName);
    setInvoiceAmountInput(String(selectedOrder.totalAmount));
  };

  const handleImportFile = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const parsedRowsResult = await parseImportFile(file);
      applyParsedRows(parsedRowsResult, file.name);
      setDataExchangeMessage(`Loaded ${parsedRowsResult.rows.length} rows from ${file.name}. Review mapping and import.`);
    } catch (error) {
      setDataExchangeMessage(error instanceof Error ? error.message : 'Unable to read import file');
    } finally {
      event.target.value = '';
    }
  };

  const handleExportDataset = async (format: DataExchangeFormat): Promise<void> => {
    await downloadDataExport({
      title:
        selectedExportDataset === 'orders'
          ? 'Orders Export'
          : selectedExportDataset === 'invoices'
            ? 'Invoices Export'
            : 'Returns Export',
      fileBaseName:
        selectedExportDataset === 'orders'
          ? 'ordersExport'
          : selectedExportDataset === 'invoices'
            ? 'invoiceExport'
            : 'returnsExport',
      rows: selectedExportRows,
      format
    });
    setDataExchangeMessage(`Exported ${selectedExportDataset} as ${format}.`);
  };

  const selectedReturnOrder = orders.find((orderRecord) => orderRecord.id === returnForm.orderId);
  const selectedReturnOrderItems = selectedReturnOrder?.items ?? [];

  const handleReturnOrderChange = (orderId: string): void => {
    const nextOrder = orders.find((orderRecord) => orderRecord.id === orderId);

    setReturnForm((previous) => ({
      ...previous,
      orderId,
      productId: nextOrder?.items[0]?.productId ?? '',
      quantity: '1'
    }));
  };

  const handleCreateReturn = (): void => {
    try {
      const result = createOrderReturn({
        orderId: returnForm.orderId,
        reason: returnForm.reason,
        resolution: returnForm.resolution,
        restocked: returnForm.restocked,
        lineItems: [
          {
            productId: returnForm.productId,
            quantity: Number(returnForm.quantity)
          }
        ],
        exchangeItems:
          returnForm.resolution === 'exchange'
            ? [
                {
                  productId: returnForm.exchangeProductId,
                  quantity: Number(returnForm.exchangeQuantity)
                }
              ]
            : undefined
      });

      setReturnMessage(
        result.replacementOrderId
          ? `Return created. Exchange order ${result.replacementOrderId} was generated.`
          : 'Return created successfully.'
      );
      setReturnForm((previous) => ({
        ...previous,
        reason: '',
        quantity: '1',
        exchangeQuantity: '1'
      }));
    } catch (error) {
      setReturnMessage(error instanceof Error ? error.message : 'Unable to create return');
    }
  };

  return (
    <section className="space-y-6">
      <header className="rounded-2xl border border-white/60 bg-white/85 p-6 shadow-lg backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Sales Operations</p>
        <h1 className="mt-2 text-3xl font-semibold">Order Management</h1>
        <p className="mt-1 text-sm text-slate-500">
          Dynamic order fields, CSV import workflow, invoice control, and lifecycle status management.
        </p>
      </header>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="border-white/70 bg-white/90 shadow-lg">
          <CardHeader>
            <CardTitle>Order Data Exchange</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 md:grid-cols-[220px_1fr]">
              <select
                aria-label="Order Export Dataset"
                className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
                value={selectedExportDataset}
                onChange={(event) => setSelectedExportDataset(event.target.value as 'orders' | 'invoices' | 'returns')}
              >
                <option value="orders">Orders</option>
                <option value="invoices">Invoices</option>
                <option value="returns">Returns</option>
              </select>
              <div className="flex flex-wrap gap-2">
                {dataExchangeFormats.map((format) => (
                  <Button key={format} type="button" variant="outline" className="h-9 px-3 text-xs" onClick={() => void handleExportDataset(format)}>
                    Export {format.toUpperCase()}
                  </Button>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-3">
              <label className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Load Import File</label>
              <Input className="mt-2" type="file" accept={importFileAccept} onChange={(event) => void handleImportFile(event)} />
              <p className="mt-2 text-xs text-slate-500">Supports CSV, TSV, JSON, and TXT for the order import workflow.</p>
            </div>
            {dataExchangeMessage ? <p className="text-sm text-slate-600">{dataExchangeMessage}</p> : null}
          </CardContent>
        </Card>

        <Card className="border-white/70 bg-white/90 shadow-lg">
          <CardHeader>
            <CardTitle>Order Filters</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-[1fr_240px]">
            <Input
              placeholder="Search by order id or customer"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
            />
            <select
              aria-label="Order Status Filter"
              className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as 'all' | OrderStatus)}
            >
              <option value="all">All statuses</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="refunded">Refunded</option>
            </select>
          </CardContent>
        </Card>

        <Card className="border-white/70 bg-white/90 shadow-lg">
          <CardHeader>
            <CardTitle>Custom Order Fields</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-2 md:grid-cols-[1fr_140px_auto]">
              <Input
                placeholder="Field label (example: salesChannel)"
                value={customFieldLabelInput}
                onChange={(event) => setCustomFieldLabelInput(event.target.value)}
              />
              <select
                className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
                value={customFieldTypeInput}
                onChange={(event) => setCustomFieldTypeInput(event.target.value as OrderCustomFieldType)}
              >
                <option value="text">Text</option>
                <option value="number">Number</option>
                <option value="date">Date</option>
              </select>
              <Button
                type="button"
                onClick={() => {
                  addOrderCustomField({ label: customFieldLabelInput, type: customFieldTypeInput });
                  setCustomFieldLabelInput('');
                }}
              >
                Add Field
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {orderCustomFields.map((fieldRecord) => (
                <span key={fieldRecord.id} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700">
                  {fieldRecord.label} ({fieldRecord.type})
                </span>
              ))}
              {!orderCustomFields.length && <p className="text-sm text-slate-500">No custom fields yet.</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-white/70 bg-white/90 shadow-lg">
        <CardHeader>
          <CardTitle>Import Orders (CSV)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <textarea
            className="min-h-[140px] w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-800"
            placeholder="Paste CSV data here. Analyze, map columns, choose retained fields, then import."
            value={csvInput}
            onChange={(event) => setCsvInput(event.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={handleAnalyzeCsv}>
              Analyze CSV
            </Button>
            <Button type="button" onClick={handleImportOrders} disabled={!parsedCsvRows.length}>
              Import Orders
            </Button>
            {csvImportMessage && <p className="self-center text-sm text-slate-600">{csvImportMessage}</p>}
          </div>

          {parsedCsvHeaders.length > 0 && (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {Object.entries(csvColumnMap).map(([mapKey, mappedColumnName]) => (
                <div key={mapKey} className="space-y-1 rounded-lg border border-slate-200 bg-slate-50 p-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">{mapKey}</p>
                  <select
                    className="h-9 w-full rounded-md border border-slate-200 bg-white px-2 text-xs"
                    value={mappedColumnName}
                    onChange={(event) =>
                      setCsvColumnMap((previous) => ({
                        ...previous,
                        [mapKey]: event.target.value
                      }))
                    }
                  >
                    <option value="">Not mapped</option>
                    {parsedCsvHeaders.map((header) => (
                      <option key={header} value={header}>
                        {header}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}

          {parsedCsvHeaders.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Retain As Custom Fields</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {parsedCsvHeaders.map((header) => (
                  <label key={header} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs">
                    <input
                      type="checkbox"
                      checked={Boolean(retainedColumns[header])}
                      onChange={(event) =>
                        setRetainedColumns((previous) => ({
                          ...previous,
                          [header]: event.target.checked
                        }))
                      }
                    />
                    {header}
                  </label>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card className="border-white/70 bg-white/90 shadow-lg">
          <CardHeader>
            <CardTitle>Invoice Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-2 md:grid-cols-2">
              <div className="space-y-1">
                <label htmlFor="invoiceLinkedOrder" className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                  Link Order
                </label>
                <select
                  id="invoiceLinkedOrder"
                  className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
                  value={linkedOrderIdInput}
                  onChange={(event) => handleAutofillOrder(event.target.value)}
                >
                  <option value="">No linked order</option>
                  {orders.slice(0, 50).map((orderRecord) => (
                    <option key={orderRecord.id} value={orderRecord.id}>
                      {orderRecord.id}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label htmlFor="invoiceCustomer" className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                  Customer
                </label>
                <Input id="invoiceCustomer" value={invoiceCustomerInput} onChange={(event) => setInvoiceCustomerInput(event.target.value)} />
              </div>
              <div className="space-y-1">
                <label htmlFor="invoiceAmount" className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                  Amount
                </label>
                <Input id="invoiceAmount" type="number" min="0" value={invoiceAmountInput} onChange={(event) => setInvoiceAmountInput(event.target.value)} />
              </div>
              <div className="space-y-1">
                <label htmlFor="invoiceIssueDate" className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                  Issue Date
                </label>
                <Input
                  id="invoiceIssueDate"
                  type="date"
                  value={invoiceIssueDateInput}
                  onChange={(event) => setInvoiceIssueDateInput(event.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="invoiceDueDate" className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                  Due Date
                </label>
                <Input
                  id="invoiceDueDate"
                  type="date"
                  value={invoiceDueDateInput}
                  onChange={(event) => setInvoiceDueDateInput(event.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="invoiceReminderDate" className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                  Reminder Date
                </label>
                <Input
                  id="invoiceReminderDate"
                  type="date"
                  value={invoiceReminderDateInput}
                  onChange={(event) => setInvoiceReminderDateInput(event.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1">
              <label htmlFor="invoiceNotes" className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                Notes
              </label>
              <textarea
                id="invoiceNotes"
                className="min-h-[90px] w-full rounded-md border border-slate-200 bg-white p-2 text-sm"
                value={invoiceNotesInput}
                onChange={(event) => setInvoiceNotesInput(event.target.value)}
              />
            </div>
            <Button type="button" onClick={handleCreateInvoice}>
              Create Invoice
            </Button>
          </CardContent>
        </Card>

        <Card className="border-white/70 bg-white/90 shadow-lg">
          <CardHeader>
            <CardTitle>Invoices ({invoices.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {!invoices.length && <p className="text-sm text-slate-500">No invoices yet.</p>}
            {invoices.slice(0, 10).map((invoiceRecord) => (
              <div key={invoiceRecord.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{invoiceRecord.invoiceNumber}</p>
                    <p className="text-xs text-slate-500">{invoiceRecord.customerName}</p>
                  </div>
                  <p className={`text-xs font-semibold uppercase tracking-[0.08em] ${toInvoiceStatusTone(invoiceRecord.status)}`}>
                    {invoiceRecord.status}
                  </p>
                </div>
                <p className="mt-1 text-sm text-slate-700">{formatCurrencyValue(invoiceRecord.amount, globalPreferences)}</p>
                <p className="text-xs text-slate-500">
                  Due {formatDateValue(invoiceRecord.dueDate, globalPreferences)} / Reminder{' '}
                  {formatDateValue(invoiceRecord.reminderDate, globalPreferences)}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Button type="button" size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => setInvoiceStatus(invoiceRecord.id, 'paid')}>
                    Mark Paid
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-7 px-2 text-xs"
                    onClick={() => setInvoiceStatus(invoiceRecord.id, 'cancelled')}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-7 px-2 text-xs"
                    onClick={() => markInvoiceReminderNotified(invoiceRecord.id)}
                  >
                    Mute Reminder
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="border-white/70 bg-white/90 shadow-lg">
        <CardHeader>
          <CardTitle>Returns, Exchanges, And Store Credit</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              <select
                aria-label="Return Order"
                className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
                value={returnForm.orderId}
                onChange={(event) => handleReturnOrderChange(event.target.value)}
              >
                <option value="">Select order</option>
                {orders.map((orderRecord) => (
                  <option key={orderRecord.id} value={orderRecord.id}>
                    {orderRecord.id} / {orderRecord.customerName}
                  </option>
                ))}
              </select>
              <select
                aria-label="Return Product"
                className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
                value={returnForm.productId}
                onChange={(event) => setReturnForm((previous) => ({ ...previous, productId: event.target.value }))}
              >
                {selectedReturnOrderItems.map((item) => (
                  <option key={`${returnForm.orderId}-${item.productId}`} value={item.productId}>
                    {item.productName}
                  </option>
                ))}
              </select>
              <Input
                aria-label="Return Quantity"
                type="number"
                min="1"
                value={returnForm.quantity}
                onChange={(event) => setReturnForm((previous) => ({ ...previous, quantity: event.target.value }))}
              />
              <select
                aria-label="Return Resolution"
                className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
                value={returnForm.resolution}
                onChange={(event) =>
                  setReturnForm((previous) => ({
                    ...previous,
                    resolution: event.target.value as ReturnResolution
                  }))
                }
              >
                <option value="refund">Refund</option>
                <option value="storeCredit">Store Credit</option>
                <option value="exchange">Exchange</option>
              </select>
            </div>
            <textarea
              className="min-h-[90px] w-full rounded-md border border-slate-200 bg-white p-3 text-sm"
              placeholder="Return reason"
              value={returnForm.reason}
              onChange={(event) => setReturnForm((previous) => ({ ...previous, reason: event.target.value }))}
            />
            <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
              <input
                type="checkbox"
                checked={returnForm.restocked}
                onChange={(event) => setReturnForm((previous) => ({ ...previous, restocked: event.target.checked }))}
              />
              Restock returned units back into inventory
            </label>

            {returnForm.resolution === 'exchange' && (
              <div className="grid gap-3 md:grid-cols-2">
                <select
                  aria-label="Exchange Product"
                  className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
                  value={returnForm.exchangeProductId}
                  onChange={(event) => setReturnForm((previous) => ({ ...previous, exchangeProductId: event.target.value }))}
                >
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
                <Input
                  aria-label="Exchange Quantity"
                  type="number"
                  min="1"
                  value={returnForm.exchangeQuantity}
                  onChange={(event) => setReturnForm((previous) => ({ ...previous, exchangeQuantity: event.target.value }))}
                />
              </div>
            )}

            <Button type="button" onClick={handleCreateReturn}>
              Process Return
            </Button>
            {returnMessage ? <p className="text-sm text-slate-600">{returnMessage}</p> : null}
          </div>

          <div className="space-y-2">
            {!returns.length ? <p className="text-sm text-slate-500">No returns recorded yet.</p> : null}
            {returns.slice(0, 10).map((returnRecord) => (
              <div key={returnRecord.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{returnRecord.orderId}</p>
                    <p className="text-xs text-slate-500">{returnRecord.customerName}</p>
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-600">{returnRecord.resolution}</p>
                </div>
                <p className="mt-2 text-sm text-slate-700">{formatCurrencyValue(returnRecord.amount, globalPreferences)}</p>
                <p className="text-xs text-slate-500">
                  {returnRecord.lineItems.map((lineItem) => `${lineItem.productName} x${lineItem.quantity}`).join(' | ')}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {returnRecord.restocked ? 'Restocked' : 'Not restocked'} • {formatDateTimeValue(returnRecord.createdAt, globalPreferences)}
                </p>
                {returnRecord.replacementOrderId ? (
                  <p className="mt-1 text-xs text-slate-500">Replacement order: {returnRecord.replacementOrderId}</p>
                ) : null}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-white/70 bg-white/90 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Orders ({filteredOrders.length})</CardTitle>
            {totalOrderPages > 1 && (
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="h-8 px-3 text-xs"
                  disabled={orderPage <= 1}
                  onClick={() => setOrderPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <span className="text-xs text-slate-600">
                  Page {orderPage} of {totalOrderPages}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  className="h-8 px-3 text-xs"
                  disabled={orderPage >= totalOrderPages}
                  onClick={() => setOrderPage((p) => Math.min(totalOrderPages, p + 1))}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {filteredOrders.length === 0 ? (
            <p className="text-sm text-slate-500">No orders match the current filter.</p>
          ) : (
            paginatedOrders.map((orderRecord) => (
              <div key={orderRecord.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{orderRecord.id}</p>
                    <p className="text-xs text-slate-500">
                      {orderRecord.customerName} / {formatDateTimeValue(orderRecord.createdAt, globalPreferences)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900">
                      {formatCurrencyValue(orderRecord.totalAmount, globalPreferences)}
                    </p>
                    <p className="text-xs uppercase tracking-[0.08em] text-slate-500">{orderRecord.paymentMethod}</p>
                  </div>
                </div>

                {Object.keys(orderRecord.customFieldValues ?? {}).length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {Object.entries(orderRecord.customFieldValues).map(([fieldKey, fieldValue]) => (
                      <span key={`${orderRecord.id}-${fieldKey}`} className="rounded-full border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700">
                        {fieldKey}: {fieldValue}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-3 grid gap-2 md:grid-cols-3">
                  <Button
                    type="button"
                    variant={orderRecord.status === 'completed' ? 'default' : 'outline'}
                    onClick={() => setOrderStatus(orderRecord.id, 'completed')}
                  >
                    Completed
                  </Button>
                  <Button
                    type="button"
                    variant={orderRecord.status === 'cancelled' ? 'default' : 'outline'}
                    onClick={() => setOrderStatus(orderRecord.id, 'cancelled', 'Cancelled from order management')}
                  >
                    Cancelled
                  </Button>
                  <Button
                    type="button"
                    variant={orderRecord.status === 'refunded' ? 'default' : 'outline'}
                    onClick={() => setOrderStatus(orderRecord.id, 'refunded', 'Refund marked from order management')}
                  >
                    Refunded
                  </Button>
                </div>

                <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3">
                  <div className="grid gap-2 md:grid-cols-[180px_1fr_1fr_1fr]">
                    <Input
                      aria-label={`Delivery Date ${orderRecord.id}`}
                      type="date"
                      value={deliveryDateByOrder[orderRecord.id] ?? orderRecord.deliveryDate ?? ''}
                      onChange={(event) =>
                        setDeliveryDateByOrder((previous) => ({
                          ...previous,
                          [orderRecord.id]: event.target.value
                        }))
                      }
                    />
                    <Button
                      type="button"
                      variant={orderRecord.deliveryStatus === 'pending' ? 'default' : 'outline'}
                      onClick={() =>
                        setOrderDelivery(
                          orderRecord.id,
                          'pending',
                          deliveryDateByOrder[orderRecord.id] ?? orderRecord.deliveryDate ?? orderRecord.createdAt.slice(0, 10)
                        )
                      }
                    >
                      Pending Delivery
                    </Button>
                    <Button
                      type="button"
                      variant={orderRecord.deliveryStatus === 'outForDelivery' ? 'default' : 'outline'}
                      onClick={() =>
                        setOrderDelivery(
                          orderRecord.id,
                          'outForDelivery',
                          deliveryDateByOrder[orderRecord.id] ?? orderRecord.deliveryDate ?? orderRecord.createdAt.slice(0, 10)
                        )
                      }
                    >
                      Out For Delivery
                    </Button>
                    <Button
                      type="button"
                      variant={orderRecord.deliveryStatus === 'delivered' ? 'default' : 'outline'}
                      onClick={() =>
                        setOrderDelivery(
                          orderRecord.id,
                          'delivered',
                          deliveryDateByOrder[orderRecord.id] ?? orderRecord.deliveryDate ?? orderRecord.createdAt.slice(0, 10)
                        )
                      }
                    >
                      Delivered
                    </Button>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
                  <p>Status: {orderRecord.status}</p>
                  <p>Delivery: {orderRecord.deliveryStatus}{orderRecord.deliveryDate ? ` / ${orderRecord.deliveryDate}` : ''}</p>
                  <p>Updated: {formatDateTimeValue(orderRecord.updatedAt, globalPreferences)}</p>
                  <p>{orderRecord.statusNote || 'No note'}</p>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </section>
  );
}
