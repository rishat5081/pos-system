import { type ChangeEvent, useMemo, useState } from 'react';
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
import { useOrgHierarchyStore } from '@/stores/orgHierarchyStore';
import { useStoreOpsStore } from '@/stores/storeOpsStore';

interface ProductFormState {
  name: string;
  category: string;
  price: string;
  stock: string;
  reorderLevel: string;
}

interface VendorFormState {
  name: string;
  contactName: string;
  phone: string;
  email: string;
  leadTimeDays: string;
  paymentTerms: string;
  notes: string;
}

interface PurchaseOrderFormState {
  vendorId: string;
  productId: string;
  quantityOrdered: string;
  unitCost: string;
  expectedDate: string;
  note: string;
}

const initialProductFormState: ProductFormState = {
  name: '',
  category: '',
  price: '0',
  stock: '0',
  reorderLevel: '0'
};

const initialVendorFormState: VendorFormState = {
  name: '',
  contactName: '',
  phone: '',
  email: '',
  leadTimeDays: '0',
  paymentTerms: 'Net 30',
  notes: ''
};

export function InventoryPage() {
  const categories = useStoreOpsStore((state) => state.categories);
  const products = useStoreOpsStore((state) => state.products);
  const vendors = useStoreOpsStore((state) => state.vendors);
  const purchaseOrders = useStoreOpsStore((state) => state.purchaseOrders);
  const globalPreferences = useStoreOpsStore((state) => state.globalPreferences);
  const addCategory = useStoreOpsStore((state) => state.addCategory);
  const addProduct = useStoreOpsStore((state) => state.addProduct);
  const importProducts = useStoreOpsStore((state) => state.importProducts);
  const addVendor = useStoreOpsStore((state) => state.addVendor);
  const importVendors = useStoreOpsStore((state) => state.importVendors);
  const createPurchaseOrder = useStoreOpsStore((state) => state.createPurchaseOrder);
  const setPurchaseOrderStatus = useStoreOpsStore((state) => state.setPurchaseOrderStatus);
  const receivePurchaseOrderItems = useStoreOpsStore((state) => state.receivePurchaseOrderItems);
  const adjustStock = useStoreOpsStore((state) => state.adjustStock);

  const [categoryName, setCategoryName] = useState<string>('');
  const [selectedExportDataset, setSelectedExportDataset] = useState<'products' | 'categories' | 'lowStock' | 'vendors' | 'purchaseOrders'>('products');
  const [selectedImportTarget, setSelectedImportTarget] = useState<'products' | 'categories' | 'vendors'>('products');
  const [dataExchangeMessage, setDataExchangeMessage] = useState<string>('');
  const [productForm, setProductForm] = useState<ProductFormState>({
    ...initialProductFormState,
    category: categories[0]?.name ?? ''
  });
  const [vendorForm, setVendorForm] = useState<VendorFormState>(initialVendorFormState);
  const [purchaseOrderForm, setPurchaseOrderForm] = useState<PurchaseOrderFormState>({
    vendorId: vendors[0]?.id ?? '',
    productId: products[0]?.id ?? '',
    quantityOrdered: '1',
    unitCost: products[0] ? String(products[0].price) : '0',
    expectedDate: new Date().toISOString().slice(0, 10),
    note: ''
  });

  const orgBranches = useOrgHierarchyStore((s) => s.branches);
  const currentBranch = useOrgHierarchyStore((s) => s.getCurrentBranch());
  const inventoryTransfers = useOrgHierarchyStore((s) => s.inventoryTransfers);
  const createTransfer = useOrgHierarchyStore((s) => s.createTransfer);
  const approveTransfer = useOrgHierarchyStore((s) => s.approveTransfer);
  const shipTransfer = useOrgHierarchyStore((s) => s.shipTransfer);
  const receiveTransfer = useOrgHierarchyStore((s) => s.receiveTransfer);
  const cancelTransfer = useOrgHierarchyStore((s) => s.cancelTransfer);

  const [transferTargetBranch, setTransferTargetBranch] = useState('');
  const [transferProductId, setTransferProductId] = useState('');
  const [transferQuantity, setTransferQuantity] = useState('1');
  const [transferNotes, setTransferNotes] = useState('');

  const currentBranchId = currentBranch?.id ?? '';
  const otherBranches = orgBranches.filter((b) => b.id !== currentBranchId);
  const incomingTransfers = inventoryTransfers.filter((t) => t.toBranchId === currentBranchId && t.status !== 'cancelled' && t.status !== 'received');
  const outgoingTransfers = inventoryTransfers.filter((t) => t.fromBranchId === currentBranchId && t.status !== 'cancelled' && t.status !== 'received');

  const handleCreateTransfer = (): void => {
    const targetBranch = orgBranches.find((b) => b.id === transferTargetBranch);
    const product = products.find((p) => p.id === transferProductId);
    if (!targetBranch || !product || !currentBranch) return;
    createTransfer({
      fromBranchId: currentBranchId,
      fromBranchName: currentBranch.name,
      toBranchId: targetBranch.id,
      toBranchName: targetBranch.name,
      productId: product.id,
      productName: product.name,
      quantityRequested: Number(transferQuantity),
      notes: transferNotes
    });
    setTransferQuantity('1');
    setTransferNotes('');
  };

  const handleReceiveTransfer = (transferId: string): void => {
    const transfer = inventoryTransfers.find((t) => t.id === transferId);
    if (!transfer) return;
    receiveTransfer(transferId);
    adjustStock(transfer.productId, transfer.quantityShipped);
  };

  const lowStockItems = products.filter((product) => product.stock <= product.reorderLevel);
  const openPurchaseOrders = purchaseOrders.filter(
    (purchaseOrder) => purchaseOrder.status === 'draft' || purchaseOrder.status === 'sent' || purchaseOrder.status === 'partiallyReceived'
  );

  const exportRows = useMemo(() => {
    if (selectedExportDataset === 'categories') {
      return categories.map((category) => ({
        id: category.id,
        name: category.name,
        isActive: category.isActive
      }));
    }

    if (selectedExportDataset === 'vendors') {
      return vendors.map((vendor) => ({
        id: vendor.id,
        name: vendor.name,
        contactName: vendor.contactName,
        phone: vendor.phone,
        email: vendor.email,
        leadTimeDays: vendor.leadTimeDays,
        paymentTerms: vendor.paymentTerms,
        notes: vendor.notes,
        isActive: vendor.isActive
      }));
    }

    if (selectedExportDataset === 'purchaseOrders') {
      return purchaseOrders.map((purchaseOrder) => ({
        id: purchaseOrder.id,
        vendorName: purchaseOrder.vendorName,
        expectedDate: purchaseOrder.expectedDate,
        status: purchaseOrder.status,
        totalCost: purchaseOrder.totalCost,
        lineItems: purchaseOrder.lineItems
          .map((lineItem) => `${lineItem.productName} ordered ${lineItem.quantityOrdered} received ${lineItem.quantityReceived}`)
          .join(' | '),
        note: purchaseOrder.note
      }));
    }

    const sourceRows = selectedExportDataset === 'lowStock' ? lowStockItems : products;

    return sourceRows.map((product) => ({
      id: product.id,
      name: product.name,
      category: product.category,
      price: product.price,
      stock: product.stock,
      reorderLevel: product.reorderLevel
    }));
  }, [categories, lowStockItems, products, purchaseOrders, selectedExportDataset, vendors]);

  const onProductFormChange = (field: keyof ProductFormState, value: string): void => {
    setProductForm((previous) => ({
      ...previous,
      [field]: value
    }));
  };

  const onVendorFormChange = (field: keyof VendorFormState, value: string): void => {
    setVendorForm((previous) => ({
      ...previous,
      [field]: value
    }));
  };

  const onPurchaseOrderFormChange = (field: keyof PurchaseOrderFormState, value: string): void => {
    setPurchaseOrderForm((previous) => ({
      ...previous,
      [field]: value
    }));
  };

  const handleAddCategory = (): void => {
    addCategory({ name: categoryName });
    setCategoryName('');
  };

  const handleAddProduct = (): void => {
    addProduct({
      name: productForm.name,
      category: productForm.category,
      price: Number(productForm.price),
      stock: Number(productForm.stock),
      reorderLevel: Number(productForm.reorderLevel)
    });
    setProductForm({
      ...initialProductFormState,
      category: categories[0]?.name ?? ''
    });
  };

  const handleAddVendor = (): void => {
    addVendor({
      name: vendorForm.name,
      contactName: vendorForm.contactName,
      phone: vendorForm.phone,
      email: vendorForm.email,
      leadTimeDays: Number(vendorForm.leadTimeDays),
      paymentTerms: vendorForm.paymentTerms,
      notes: vendorForm.notes
    });

    setVendorForm(initialVendorFormState);
  };

  const handleCreatePurchaseOrder = (): void => {
    createPurchaseOrder({
      vendorId: purchaseOrderForm.vendorId,
      expectedDate: purchaseOrderForm.expectedDate,
      note: purchaseOrderForm.note,
      lineItems: [
        {
          productId: purchaseOrderForm.productId,
          quantityOrdered: Number(purchaseOrderForm.quantityOrdered),
          unitCost: Number(purchaseOrderForm.unitCost)
        }
      ]
    });

    setPurchaseOrderForm((previous) => ({
      ...previous,
      quantityOrdered: '1',
      note: ''
    }));
  };

  const handleExportInventory = async (format: DataExchangeFormat): Promise<void> => {
    const fileBaseName =
      selectedExportDataset === 'categories'
        ? 'inventoryCategories'
        : selectedExportDataset === 'lowStock'
          ? 'inventoryLowStock'
          : selectedExportDataset === 'vendors'
            ? 'inventoryVendors'
            : selectedExportDataset === 'purchaseOrders'
              ? 'purchaseOrders'
              : 'inventoryProducts';

    await downloadDataExport({
      title: 'Inventory Export',
      fileBaseName,
      rows: exportRows,
      format
    });
    setDataExchangeMessage(`Exported ${selectedExportDataset} as ${format}.`);
  };

  const handleImportInventoryFile = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const parsed = await parseImportFile(file);

      if (selectedImportTarget === 'categories') {
        const categoryHeader = findMatchingHeader(parsed.headers, ['name', 'category']);
        parsed.rows.forEach((row) => {
          const name = (row[categoryHeader] ?? '').trim();

          if (name) {
            addCategory({ name });
          }
        });
      } else if (selectedImportTarget === 'vendors') {
        const nameHeader = findMatchingHeader(parsed.headers, ['name', 'vendor', 'vendorname', 'supplier']);
        const contactHeader = findMatchingHeader(parsed.headers, ['contactname', 'contact', 'buyer']);
        const phoneHeader = findMatchingHeader(parsed.headers, ['phone', 'mobile']);
        const emailHeader = findMatchingHeader(parsed.headers, ['email', 'mail']);
        const leadTimeHeader = findMatchingHeader(parsed.headers, ['leadtimedays', 'leadtime', 'lead']);
        const paymentTermsHeader = findMatchingHeader(parsed.headers, ['paymentterms', 'terms']);
        const notesHeader = findMatchingHeader(parsed.headers, ['notes', 'note']);

        importVendors(
          parsed.rows.map((row) => ({
            name: row[nameHeader] ?? '',
            contactName: row[contactHeader] ?? '',
            phone: row[phoneHeader] ?? '',
            email: row[emailHeader] ?? '',
            leadTimeDays: Number(row[leadTimeHeader] ?? 0),
            paymentTerms: row[paymentTermsHeader] ?? 'Net 30',
            notes: row[notesHeader] ?? ''
          }))
        );
      } else {
        const nameHeader = findMatchingHeader(parsed.headers, ['name', 'product', 'productname']);
        const categoryHeader = findMatchingHeader(parsed.headers, ['category', 'department']);
        const priceHeader = findMatchingHeader(parsed.headers, ['price', 'unitprice', 'sellingprice']);
        const stockHeader = findMatchingHeader(parsed.headers, ['stock', 'quantity', 'units']);
        const reorderHeader = findMatchingHeader(parsed.headers, ['reorderlevel', 'reorder', 'minstock']);

        importProducts(
          parsed.rows.map((row) => ({
            name: row[nameHeader] ?? '',
            category: row[categoryHeader] ?? 'General',
            price: Number(row[priceHeader] ?? 0),
            stock: Number(row[stockHeader] ?? 0),
            reorderLevel: Number(row[reorderHeader] ?? 0)
          }))
        );
      }

      setDataExchangeMessage(`Imported ${parsed.rows.length} ${selectedImportTarget} records from ${file.name}.`);
    } catch (error) {
      setDataExchangeMessage(error instanceof Error ? error.message : 'Unable to import inventory file');
    } finally {
      event.target.value = '';
    }
  };

  return (
    <section className="space-y-6">
      <header className="rounded-2xl border border-white/60 bg-white/85 p-6 shadow-lg backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Inventory & Procurement</p>
        <h1 className="mt-2 text-3xl font-semibold">Inventory Management</h1>
        <p className="mt-1 text-sm text-slate-500">
          Track stock, vendors, and purchase order receiving from one operational screen.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-white/70 bg-white/90 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm uppercase tracking-[0.1em] text-slate-600">Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-slate-900">{categories.length}</p>
          </CardContent>
        </Card>
        <Card className="border-white/70 bg-white/90 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm uppercase tracking-[0.1em] text-slate-600">Low Stock Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-amber-600">{lowStockItems.length}</p>
          </CardContent>
        </Card>
        <Card className="border-white/70 bg-white/90 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm uppercase tracking-[0.1em] text-slate-600">Active Vendors</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-slate-900">{vendors.filter((vendor) => vendor.isActive).length}</p>
          </CardContent>
        </Card>
        <Card className="border-white/70 bg-white/90 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm uppercase tracking-[0.1em] text-slate-600">Open Purchase Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-slate-900">{openPurchaseOrders.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-white/70 bg-white/90 shadow-lg">
        <CardHeader>
          <CardTitle>Inventory Data Exchange</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 lg:grid-cols-[220px_1fr]">
            <select
              aria-label="Inventory Export Dataset"
              className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
              value={selectedExportDataset}
              onChange={(event) =>
                setSelectedExportDataset(
                  event.target.value as 'products' | 'categories' | 'lowStock' | 'vendors' | 'purchaseOrders'
                )
              }
            >
              <option value="products">Products</option>
              <option value="categories">Categories</option>
              <option value="lowStock">Low Stock</option>
              <option value="vendors">Vendors</option>
              <option value="purchaseOrders">Purchase Orders</option>
            </select>
            <div className="flex flex-wrap gap-2">
              {dataExchangeFormats.map((format) => (
                <Button key={format} type="button" variant="outline" className="h-9 px-3 text-xs" onClick={() => void handleExportInventory(format)}>
                  Export {format.toUpperCase()}
                </Button>
              ))}
            </div>
          </div>
          <div className="grid gap-3 lg:grid-cols-[220px_1fr]">
            <select
              aria-label="Inventory Import Target"
              className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
              value={selectedImportTarget}
              onChange={(event) => setSelectedImportTarget(event.target.value as 'products' | 'categories' | 'vendors')}
            >
              <option value="products">Import Products</option>
              <option value="categories">Import Categories</option>
              <option value="vendors">Import Vendors</option>
            </select>
            <Input type="file" accept={importFileAccept} onChange={(event) => void handleImportInventoryFile(event)} />
          </div>
          <p className="text-xs text-slate-500">
            Import supports CSV, TSV, JSON, and TXT. Exports support operational and reporting formats.
          </p>
          {dataExchangeMessage ? <p className="text-sm text-slate-600">{dataExchangeMessage}</p> : null}
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-white/70 bg-white/90 shadow-lg">
          <CardHeader>
            <CardTitle>Product Catalog</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {products.map((product) => (
              <div key={product.id} className="rounded-xl border border-slate-200 bg-white p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{product.name}</p>
                    <p className="text-xs text-slate-500">{product.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900">{formatCurrencyValue(product.price, globalPreferences)}</p>
                    <p
                      className={
                        product.stock <= product.reorderLevel
                          ? 'text-xs font-semibold text-amber-600'
                          : 'text-xs text-slate-500'
                      }
                    >
                      Stock {product.stock}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-8 rounded-md px-3 text-xs"
                    onClick={() => adjustStock(product.id, 1)}
                  >
                    Add 1
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-8 rounded-md px-3 text-xs"
                    onClick={() => adjustStock(product.id, -1)}
                  >
                    Remove 1
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-white/70 bg-white/90 shadow-lg">
            <CardHeader>
              <CardTitle>Add Category</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                placeholder="Category name"
                value={categoryName}
                onChange={(event) => setCategoryName(event.target.value)}
              />
              <Button type="button" className="w-full bg-sky-600 hover:bg-sky-700" onClick={handleAddCategory}>
                Save Category
              </Button>
            </CardContent>
          </Card>

          <Card className="border-white/70 bg-white/90 shadow-lg">
            <CardHeader>
              <CardTitle>Add Product</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                placeholder="Product name"
                value={productForm.name}
                onChange={(event) => onProductFormChange('name', event.target.value)}
              />
              <select
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
                value={productForm.category}
                onChange={(event) => onProductFormChange('category', event.target.value)}
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
              <Input
                placeholder="Price"
                type="number"
                min="0"
                step="0.01"
                value={productForm.price}
                onChange={(event) => onProductFormChange('price', event.target.value)}
              />
              <Input
                placeholder="Initial stock"
                type="number"
                min="0"
                value={productForm.stock}
                onChange={(event) => onProductFormChange('stock', event.target.value)}
              />
              <Input
                placeholder="Reorder level"
                type="number"
                min="0"
                value={productForm.reorderLevel}
                onChange={(event) => onProductFormChange('reorderLevel', event.target.value)}
              />
              <Button type="button" className="w-full bg-sky-600 hover:bg-sky-700" onClick={handleAddProduct}>
                Save Product
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="border-white/70 bg-white/90 shadow-lg">
          <CardHeader>
            <CardTitle>Vendor Directory</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <Input placeholder="Vendor name" value={vendorForm.name} onChange={(event) => onVendorFormChange('name', event.target.value)} />
              <Input placeholder="Contact name" value={vendorForm.contactName} onChange={(event) => onVendorFormChange('contactName', event.target.value)} />
              <Input placeholder="Phone" value={vendorForm.phone} onChange={(event) => onVendorFormChange('phone', event.target.value)} />
              <Input placeholder="Email" value={vendorForm.email} onChange={(event) => onVendorFormChange('email', event.target.value)} />
              <Input placeholder="Lead time days" type="number" min="0" value={vendorForm.leadTimeDays} onChange={(event) => onVendorFormChange('leadTimeDays', event.target.value)} />
              <Input placeholder="Payment terms" value={vendorForm.paymentTerms} onChange={(event) => onVendorFormChange('paymentTerms', event.target.value)} />
            </div>
            <Input placeholder="Notes" value={vendorForm.notes} onChange={(event) => onVendorFormChange('notes', event.target.value)} />
            <Button type="button" className="w-full" onClick={handleAddVendor}>
              Add Vendor
            </Button>
            <div className="space-y-2">
              {vendors.map((vendor) => (
                <div key={vendor.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{vendor.name}</p>
                      <p className="text-xs text-slate-500">
                        {vendor.contactName || 'No contact'} • {vendor.paymentTerms}
                      </p>
                    </div>
                    <span className="rounded-full bg-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-700">
                      {vendor.leadTimeDays}d lead
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{vendor.phone || 'No phone'} • {vendor.email || 'No email'}</p>
                  {vendor.notes ? <p className="mt-2 text-xs text-slate-600">{vendor.notes}</p> : null}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/70 bg-white/90 shadow-lg">
          <CardHeader>
            <CardTitle>Purchase Orders & Receiving</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <select
                aria-label="Purchase Order Vendor"
                className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
                value={purchaseOrderForm.vendorId}
                onChange={(event) => onPurchaseOrderFormChange('vendorId', event.target.value)}
              >
                {vendors.map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.name}
                  </option>
                ))}
              </select>
              <select
                aria-label="Purchase Order Product"
                className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
                value={purchaseOrderForm.productId}
                onChange={(event) => {
                  const nextProductId = event.target.value;
                  const selectedProduct = products.find((product) => product.id === nextProductId);
                  setPurchaseOrderForm((previous) => ({
                    ...previous,
                    productId: nextProductId,
                    unitCost: selectedProduct ? String(selectedProduct.price) : previous.unitCost
                  }));
                }}
              >
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
              <Input
                aria-label="Purchase Order Quantity"
                placeholder="Quantity"
                type="number"
                min="1"
                value={purchaseOrderForm.quantityOrdered}
                onChange={(event) => onPurchaseOrderFormChange('quantityOrdered', event.target.value)}
              />
              <Input
                aria-label="Purchase Order Unit Cost"
                placeholder="Unit cost"
                type="number"
                min="0"
                step="0.01"
                value={purchaseOrderForm.unitCost}
                onChange={(event) => onPurchaseOrderFormChange('unitCost', event.target.value)}
              />
              <Input
                aria-label="Purchase Order Expected Date"
                type="date"
                value={purchaseOrderForm.expectedDate}
                onChange={(event) => onPurchaseOrderFormChange('expectedDate', event.target.value)}
              />
              <Input aria-label="Purchase Order Note" placeholder="Note" value={purchaseOrderForm.note} onChange={(event) => onPurchaseOrderFormChange('note', event.target.value)} />
            </div>
            <Button type="button" className="w-full" onClick={handleCreatePurchaseOrder}>
              Create Purchase Order
            </Button>
            <div className="space-y-3">
              {purchaseOrders.map((purchaseOrder) => (
                <div key={purchaseOrder.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{purchaseOrder.id}</p>
                      <p className="text-xs text-slate-500">
                        {purchaseOrder.vendorName} • expected {purchaseOrder.expectedDate}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">{purchaseOrder.status}</p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">{formatCurrencyValue(purchaseOrder.totalCost, globalPreferences)}</p>
                    </div>
                  </div>
                  <div className="mt-3 space-y-2">
                    {purchaseOrder.lineItems.map((lineItem) => {
                      const remainingQuantity = Math.max(0, lineItem.quantityOrdered - lineItem.quantityReceived);

                      return (
                        <div key={`${purchaseOrder.id}-${lineItem.productId}`} className="rounded-lg border border-slate-200 bg-white p-3">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-slate-900">{lineItem.productName}</p>
                              <p className="text-xs text-slate-500">
                                Ordered {lineItem.quantityOrdered} • Received {lineItem.quantityReceived}
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                className="h-8 px-3 text-xs"
                                disabled={remainingQuantity <= 0}
                                onClick={() => receivePurchaseOrderItems(purchaseOrder.id, [{ productId: lineItem.productId, quantity: 1 }])}
                              >
                                Receive 1
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                className="h-8 px-3 text-xs"
                                disabled={remainingQuantity <= 0}
                                onClick={() => receivePurchaseOrderItems(purchaseOrder.id, [{ productId: lineItem.productId, quantity: remainingQuantity }])}
                              >
                                Receive Remaining
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button type="button" variant="outline" className="h-8 px-3 text-xs" onClick={() => setPurchaseOrderStatus(purchaseOrder.id, 'sent')}>
                      Mark Sent
                    </Button>
                    <Button type="button" variant="outline" className="h-8 px-3 text-xs" onClick={() => setPurchaseOrderStatus(purchaseOrder.id, 'cancelled')}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-white/70 bg-white/90 shadow-lg">
        <CardHeader>
          <CardTitle>Inventory Transfers</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <select
              aria-label="Target Branch"
              className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
              value={transferTargetBranch}
              onChange={(e) => setTransferTargetBranch(e.target.value)}
            >
              <option value="">Select target branch...</option>
              {otherBranches.map((b) => (
                <option key={b.id} value={b.id}>{b.name} ({b.storeCode})</option>
              ))}
            </select>
            <select
              aria-label="Transfer Product"
              className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
              value={transferProductId}
              onChange={(e) => setTransferProductId(e.target.value)}
            >
              <option value="">Select product...</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name} (stock: {p.stock})</option>
              ))}
            </select>
            <Input
              aria-label="Transfer Quantity"
              type="number"
              min="1"
              placeholder="Quantity"
              value={transferQuantity}
              onChange={(e) => setTransferQuantity(e.target.value)}
            />
            <Input
              aria-label="Transfer Notes"
              placeholder="Notes"
              value={transferNotes}
              onChange={(e) => setTransferNotes(e.target.value)}
            />
          </div>
          <Button
            type="button"
            className="w-full"
            disabled={!transferTargetBranch || !transferProductId || Number(transferQuantity) < 1}
            onClick={handleCreateTransfer}
          >
            Create Transfer Request
          </Button>

          {outgoingTransfers.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Outgoing Transfers</p>
              {outgoingTransfers.map((t) => (
                <div key={t.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{t.productName}</p>
                      <p className="text-xs text-slate-500">To: {t.toBranchName} / Qty: {t.quantityRequested}</p>
                    </div>
                    <span className="rounded-full bg-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-700">{t.status}</span>
                  </div>
                  <div className="mt-2 flex gap-2">
                    {t.status === 'approved' && (
                      <Button type="button" variant="outline" className="h-8 px-3 text-xs" onClick={() => shipTransfer(t.id, t.quantityRequested)}>
                        Mark Shipped
                      </Button>
                    )}
                    {t.status !== 'received' && (
                      <Button type="button" variant="outline" className="h-8 px-3 text-xs text-red-600" onClick={() => cancelTransfer(t.id)}>
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {incomingTransfers.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Incoming Transfers</p>
              {incomingTransfers.map((t) => (
                <div key={t.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{t.productName}</p>
                      <p className="text-xs text-slate-500">From: {t.fromBranchName} / Qty: {t.quantityRequested}{t.quantityShipped > 0 ? ` (shipped: ${t.quantityShipped})` : ''}</p>
                    </div>
                    <span className="rounded-full bg-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-700">{t.status}</span>
                  </div>
                  <div className="mt-2 flex gap-2">
                    {t.status === 'requested' && (
                      <Button type="button" variant="outline" className="h-8 px-3 text-xs" onClick={() => approveTransfer(t.id)}>
                        Approve
                      </Button>
                    )}
                    {t.status === 'shipped' && (
                      <Button type="button" variant="outline" className="h-8 px-3 text-xs" onClick={() => handleReceiveTransfer(t.id)}>
                        Receive (adds {t.quantityShipped} to stock)
                      </Button>
                    )}
                    {t.status !== 'received' && (
                      <Button type="button" variant="outline" className="h-8 px-3 text-xs text-red-600" onClick={() => cancelTransfer(t.id)}>
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {incomingTransfers.length === 0 && outgoingTransfers.length === 0 && (
            <p className="py-4 text-center text-sm text-slate-400">No active transfers. Create a transfer request above.</p>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
