import { type ChangeEvent, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  dataExchangeFormats,
  downloadDataExport,
  findMatchingHeader,
  importFileAccept,
  parseImportFile,
  type DataExchangeFormat
} from '@/lib/dataExchange';
import { formatCurrencyValue } from '@/lib/globalFormat';
import { useStoreOpsStore } from '@/stores/storeOpsStore';

interface CustomerFormState {
  fullName: string;
  phone: string;
  email: string;
}

const initialCustomerFormState: CustomerFormState = {
  fullName: '',
  phone: '',
  email: ''
};

function getLoyaltyTier(points: number): string {
  if (points >= 500) {
    return 'Platinum';
  }

  if (points >= 200) {
    return 'Gold';
  }

  if (points >= 50) {
    return 'Silver';
  }

  return 'Standard';
}

export function CustomersPage() {
  const customers = useStoreOpsStore((state) => state.customers);
  const orders = useStoreOpsStore((state) => state.orders);
  const customerActivityRecords = useStoreOpsStore((state) => state.customerActivityRecords);
  const globalPreferences = useStoreOpsStore((state) => state.globalPreferences);
  const addCustomer = useStoreOpsStore((state) => state.addCustomer);
  const importCustomers = useStoreOpsStore((state) => state.importCustomers);
  const addCustomerCredit = useStoreOpsStore((state) => state.addCustomerCredit);
  const redeemCustomerPoints = useStoreOpsStore((state) => state.redeemCustomerPoints);

  const [customerForm, setCustomerForm] = useState<CustomerFormState>(initialCustomerFormState);
  const [customerSearchInput, setCustomerSearchInput] = useState<string>('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [creditAmountInput, setCreditAmountInput] = useState<string>('25');
  const [redeemPointsInput, setRedeemPointsInput] = useState<string>('10');
  const [selectedExportDataset, setSelectedExportDataset] = useState<'directory' | 'activity' | 'selectedHistory' | 'selectedOrders'>('directory');
  const [dataExchangeMessage, setDataExchangeMessage] = useState<string>('');

  const onCustomerFormChange = (field: keyof CustomerFormState, value: string): void => {
    setCustomerForm((previous) => ({
      ...previous,
      [field]: value
    }));
  };

  const handleAddCustomer = (): void => {
    addCustomer(customerForm);
    setCustomerForm(initialCustomerFormState);
  };

  const customersWithoutWalkIn = useMemo(
    () => customers.filter((customer) => customer.id !== 'customer-walk-in'),
    [customers]
  );

  const filteredCustomers = useMemo(() => {
    const query = customerSearchInput.trim().toLowerCase();

    if (!query) {
      return customersWithoutWalkIn;
    }

    return customersWithoutWalkIn.filter((customer) => {
      return (
        customer.fullName.toLowerCase().includes(query) ||
        customer.phone.toLowerCase().includes(query) ||
        customer.email.toLowerCase().includes(query)
      );
    });
  }, [customerSearchInput, customersWithoutWalkIn]);

  useEffect(() => {
    if (!filteredCustomers.length) {
      setSelectedCustomerId('');
      return;
    }

    if (!filteredCustomers.some((customer) => customer.id === selectedCustomerId)) {
      setSelectedCustomerId(filteredCustomers[0].id);
    }
  }, [filteredCustomers, selectedCustomerId]);

  const selectedCustomer = useMemo(
    () => customersWithoutWalkIn.find((customer) => customer.id === selectedCustomerId) ?? null,
    [customersWithoutWalkIn, selectedCustomerId]
  );

  const selectedCustomerOrders = useMemo(() => {
    if (!selectedCustomer) {
      return [];
    }

    return orders.filter((order) => order.customerId === selectedCustomer.id);
  }, [orders, selectedCustomer]);

  const selectedCustomerActivity = useMemo(() => {
    if (!selectedCustomer) {
      return [];
    }

    return customerActivityRecords
      .filter((activityRecord) => activityRecord.customerId === selectedCustomer.id)
      .sort((left, right) => new Date(right.occurredAt).getTime() - new Date(left.occurredAt).getTime());
  }, [customerActivityRecords, selectedCustomer]);

  const selectedCustomerLifetimeSpend = useMemo(
    () => selectedCustomerOrders.reduce((sum, order) => sum + order.totalAmount, 0),
    [selectedCustomerOrders]
  );

  const selectedCustomerAverageOrderValue =
    selectedCustomerOrders.length > 0 ? selectedCustomerLifetimeSpend / selectedCustomerOrders.length : 0;

  const selectedCustomerLastOrderAt = selectedCustomerOrders[0]?.createdAt ?? '';
  const exportRows = useMemo(() => {
    if (selectedExportDataset === 'activity') {
      return customerActivityRecords.map((activityRecord) => ({
        id: activityRecord.id,
        customerId: activityRecord.customerId,
        customerName: activityRecord.customerName,
        activityType: activityRecord.activityType,
        summary: activityRecord.summary,
        amount: activityRecord.amount,
        points: activityRecord.points,
        occurredAt: activityRecord.occurredAt,
        referenceId: activityRecord.referenceId
      }));
    }

    if (selectedExportDataset === 'selectedHistory') {
      return selectedCustomerActivity.map((activityRecord) => ({
        customerName: activityRecord.customerName,
        activityType: activityRecord.activityType,
        summary: activityRecord.summary,
        amount: activityRecord.amount,
        points: activityRecord.points,
        occurredAt: activityRecord.occurredAt,
        referenceId: activityRecord.referenceId
      }));
    }

    if (selectedExportDataset === 'selectedOrders') {
      return selectedCustomerOrders.map((orderRecord) => ({
        id: orderRecord.id,
        createdAt: orderRecord.createdAt,
        status: orderRecord.status,
        totalAmount: orderRecord.totalAmount,
        paymentMethod: orderRecord.paymentMethod,
        itemsCount: orderRecord.items.length
      }));
    }

    return customersWithoutWalkIn.map((customer) => ({
      id: customer.id,
      fullName: customer.fullName,
      phone: customer.phone,
      email: customer.email,
      loyaltyPoints: customer.loyaltyPoints,
      creditBalance: customer.creditBalance
    }));
  }, [customerActivityRecords, customersWithoutWalkIn, selectedCustomerActivity, selectedCustomerOrders, selectedExportDataset]);

  const handleAddSelectedCustomerCredit = (): void => {
    if (!selectedCustomer) {
      return;
    }

    const amount = Number.parseFloat(creditAmountInput);
    addCustomerCredit(selectedCustomer.id, Number.isFinite(amount) ? amount : 0);
  };

  const handleRedeemSelectedCustomerPoints = (): void => {
    if (!selectedCustomer) {
      return;
    }

    const points = Number.parseInt(redeemPointsInput, 10);
    redeemCustomerPoints(selectedCustomer.id, Number.isFinite(points) ? points : 0);
  };

  const handleExportCustomers = async (format: DataExchangeFormat): Promise<void> => {
    const fileBaseName =
      selectedExportDataset === 'activity'
        ? 'customerActivity'
        : selectedExportDataset === 'selectedHistory'
          ? 'selectedCustomerHistory'
          : selectedExportDataset === 'selectedOrders'
            ? 'selectedCustomerOrders'
            : 'customerDirectory';

    await downloadDataExport({
      title: 'Customers Export',
      fileBaseName,
      rows: exportRows,
      format
    });
    setDataExchangeMessage(`Exported ${selectedExportDataset} as ${format}.`);
  };

  const handleImportCustomersFile = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const parsed = await parseImportFile(file);
      const fullNameHeader = findMatchingHeader(parsed.headers, ['fullname', 'name', 'customername']);
      const phoneHeader = findMatchingHeader(parsed.headers, ['phone', 'mobile']);
      const emailHeader = findMatchingHeader(parsed.headers, ['email']);
      const loyaltyHeader = findMatchingHeader(parsed.headers, ['loyaltypoints', 'points']);
      const creditHeader = findMatchingHeader(parsed.headers, ['creditbalance', 'credit']);

      importCustomers(
        parsed.rows.map((row) => ({
          fullName: row[fullNameHeader] ?? '',
          phone: row[phoneHeader] ?? '',
          email: row[emailHeader] ?? '',
          loyaltyPoints: Number(row[loyaltyHeader] ?? 0),
          creditBalance: Number(row[creditHeader] ?? 0)
        }))
      );
      setDataExchangeMessage(`Imported ${parsed.rows.length} customers from ${file.name}.`);
    } catch (error) {
      setDataExchangeMessage(error instanceof Error ? error.message : 'Unable to import customer file');
    } finally {
      event.target.value = '';
    }
  };

  return (
    <section className="space-y-6">
      <header className="rounded-2xl border border-white/60 bg-white/85 p-6 shadow-lg backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">CRM & Loyalty</p>
        <h1 className="mt-2 text-3xl font-semibold">Customers</h1>
        <p className="mt-1 text-sm text-slate-500">
          Detailed customer profiles with purchase behavior, loyalty performance, credit tracking, and full history.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-white/70 bg-white/90 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm uppercase tracking-[0.1em] text-slate-600">Total Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-slate-900">{customersWithoutWalkIn.length}</p>
          </CardContent>
        </Card>
        <Card className="border-white/70 bg-white/90 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm uppercase tracking-[0.1em] text-slate-600">Total Loyalty Points</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-cyan-700">
              {customersWithoutWalkIn.reduce((sum, customer) => sum + customer.loyaltyPoints, 0)}
            </p>
          </CardContent>
        </Card>
        <Card className="border-white/70 bg-white/90 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm uppercase tracking-[0.1em] text-slate-600">Total Credit Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-amber-600">
              {formatCurrencyValue(customersWithoutWalkIn.reduce((sum, customer) => sum + customer.creditBalance, 0), globalPreferences)}
            </p>
          </CardContent>
        </Card>
        <Card className="border-white/70 bg-white/90 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm uppercase tracking-[0.1em] text-slate-600">Customer Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-emerald-700">
              {orders.filter((order) => Boolean(order.customerId)).length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-white/70 bg-white/90 shadow-lg">
        <CardHeader>
          <CardTitle>Customer Data Exchange</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 lg:grid-cols-[240px_1fr]">
            <select
              aria-label="Customer Export Dataset"
              className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
              value={selectedExportDataset}
              onChange={(event) =>
                setSelectedExportDataset(event.target.value as 'directory' | 'activity' | 'selectedHistory' | 'selectedOrders')
              }
            >
              <option value="directory">Customer Directory</option>
              <option value="activity">All Customer Activity</option>
              <option value="selectedHistory">Selected Customer History</option>
              <option value="selectedOrders">Selected Customer Orders</option>
            </select>
            <div className="flex flex-wrap gap-2">
              {dataExchangeFormats.map((format) => (
                <Button key={format} type="button" variant="outline" className="h-9 px-3 text-xs" onClick={() => void handleExportCustomers(format)}>
                  Export {format.toUpperCase()}
                </Button>
              ))}
            </div>
          </div>
          <Input type="file" accept={importFileAccept} onChange={(event) => void handleImportCustomersFile(event)} />
          <p className="text-xs text-slate-500">Import customer directories from CSV, TSV, JSON, or TXT with balances and loyalty points.</p>
          {dataExchangeMessage ? <p className="text-sm text-slate-600">{dataExchangeMessage}</p> : null}
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-6">
          <Card className="border-white/70 bg-white/90 shadow-lg">
            <CardHeader>
              <CardTitle>Add Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                placeholder="Full name"
                value={customerForm.fullName}
                onChange={(event) => onCustomerFormChange('fullName', event.target.value)}
              />
              <Input
                placeholder="Phone"
                value={customerForm.phone}
                onChange={(event) => onCustomerFormChange('phone', event.target.value)}
              />
              <Input
                placeholder="Email"
                value={customerForm.email}
                onChange={(event) => onCustomerFormChange('email', event.target.value)}
              />
              <Button type="button" className="w-full bg-sky-600 hover:bg-sky-700" onClick={handleAddCustomer}>
                Save Customer
              </Button>
            </CardContent>
          </Card>

          <Card className="border-white/70 bg-white/90 shadow-lg">
            <CardHeader>
              <CardTitle>Customer Directory</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                placeholder="Search customer directory"
                value={customerSearchInput}
                onChange={(event) => setCustomerSearchInput(event.target.value)}
              />
              <div className="space-y-2">
                {filteredCustomers.map((customer) => (
                  <button
                    key={customer.id}
                    type="button"
                    className={
                      customer.id === selectedCustomerId
                        ? 'w-full rounded-xl border border-cyan-300 bg-cyan-50 p-3 text-left shadow-sm'
                        : 'w-full rounded-xl border border-slate-200 bg-white p-3 text-left'
                    }
                    onClick={() => setSelectedCustomerId(customer.id)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{customer.fullName}</p>
                        {customer.phone && <p className="text-xs text-slate-500">{customer.phone}</p>}
                        {customer.email && <p className="text-xs text-slate-500">{customer.email}</p>}
                      </div>
                      <div className="text-right text-xs text-slate-600">
                        <p>Points: {customer.loyaltyPoints}</p>
                        <p>Credit: {formatCurrencyValue(customer.creditBalance, globalPreferences)}</p>
                      </div>
                    </div>
                  </button>
                ))}
                {!filteredCustomers.length && (
                  <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-3 text-xs text-slate-500">
                    No customer found for this filter.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-white/70 bg-white/90 shadow-lg">
            <CardHeader>
              <CardTitle>Customer Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!selectedCustomer && <p className="text-sm text-slate-500">Select one customer to view detailed history.</p>}
              {selectedCustomer && (
                <>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-lg font-semibold text-slate-900">{selectedCustomer.fullName}</p>
                        <p className="text-xs text-slate-500">{selectedCustomer.phone || 'No phone'}</p>
                        <p className="text-xs text-slate-500">{selectedCustomer.email || 'No email'}</p>
                      </div>
                      <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold text-cyan-700">
                        {getLoyaltyTier(selectedCustomer.loyaltyPoints)} Tier
                      </span>
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="rounded-lg border border-slate-200 bg-white p-3">
                      <p className="text-[11px] uppercase tracking-[0.08em] text-slate-500">Lifetime Spend</p>
                      <p className="text-xl font-semibold text-slate-900">{formatCurrencyValue(selectedCustomerLifetimeSpend, globalPreferences)}</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-3">
                      <p className="text-[11px] uppercase tracking-[0.08em] text-slate-500">Total Orders</p>
                      <p className="text-xl font-semibold text-slate-900">{selectedCustomerOrders.length}</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-3">
                      <p className="text-[11px] uppercase tracking-[0.08em] text-slate-500">Average Order</p>
                      <p className="text-xl font-semibold text-slate-900">
                        {formatCurrencyValue(selectedCustomerAverageOrderValue, globalPreferences)}
                      </p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-3">
                      <p className="text-[11px] uppercase tracking-[0.08em] text-slate-500">Last Purchase</p>
                      <p className="text-sm font-semibold text-slate-900">
                        {selectedCustomerLastOrderAt ? new Date(selectedCustomerLastOrderAt).toLocaleString() : 'No orders'}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="rounded-lg border border-slate-200 bg-white p-3">
                      <p className="text-[11px] uppercase tracking-[0.08em] text-slate-500">Loyalty Points</p>
                      <p className="text-xl font-semibold text-cyan-700">{selectedCustomer.loyaltyPoints}</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-3">
                      <p className="text-[11px] uppercase tracking-[0.08em] text-slate-500">Credit Balance</p>
                      <p className="text-xl font-semibold text-amber-600">{formatCurrencyValue(selectedCustomer.creditBalance, globalPreferences)}</p>
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Add Credit</p>
                      <Input
                        aria-label="Credit Amount"
                        value={creditAmountInput}
                        onChange={(event) => setCreditAmountInput(event.target.value)}
                      />
                      <Button type="button" variant="outline" className="w-full" onClick={handleAddSelectedCustomerCredit}>
                        Add Credit
                      </Button>
                    </div>
                    <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Redeem Points</p>
                      <Input
                        aria-label="Points To Redeem"
                        value={redeemPointsInput}
                        onChange={(event) => setRedeemPointsInput(event.target.value)}
                      />
                      <Button type="button" variant="outline" className="w-full" onClick={handleRedeemSelectedCustomerPoints}>
                        Redeem Points
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="border-white/70 bg-white/90 shadow-lg">
            <CardHeader>
              <CardTitle>Single Customer History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {!selectedCustomer && <p className="text-sm text-slate-500">No customer selected.</p>}
              {selectedCustomer &&
                selectedCustomerActivity.slice(0, 20).map((activityRecord) => (
                  <div key={activityRecord.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{activityRecord.summary}</p>
                        <p className="text-xs uppercase tracking-[0.08em] text-slate-500">{activityRecord.activityType}</p>
                      </div>
                      <p className="text-xs text-slate-500">{new Date(activityRecord.occurredAt).toLocaleString()}</p>
                    </div>
                    <p className="mt-1 text-xs text-slate-600">
                      Amount: {formatCurrencyValue(activityRecord.amount, globalPreferences)} / Points: {activityRecord.points}
                    </p>
                    {activityRecord.referenceId && (
                      <p className="text-xs text-slate-500">Reference: {activityRecord.referenceId}</p>
                    )}
                  </div>
                ))}
              {selectedCustomer && !selectedCustomerActivity.length && (
                <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-3 text-xs text-slate-500">
                  No activity history recorded yet for this customer.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
