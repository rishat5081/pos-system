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
import { useStoreOpsStore } from '@/stores/storeOpsStore';

interface ProductFormState {
  name: string;
  category: string;
  price: string;
  stock: string;
  reorderLevel: string;
}

const initialProductFormState: ProductFormState = {
  name: '',
  category: '',
  price: '0',
  stock: '0',
  reorderLevel: '0'
};

export function InventoryPage(): JSX.Element {
  const categories = useStoreOpsStore((state) => state.categories);
  const products = useStoreOpsStore((state) => state.products);
  const addCategory = useStoreOpsStore((state) => state.addCategory);
  const addProduct = useStoreOpsStore((state) => state.addProduct);
  const importProducts = useStoreOpsStore((state) => state.importProducts);
  const adjustStock = useStoreOpsStore((state) => state.adjustStock);

  const [categoryName, setCategoryName] = useState<string>('');
  const [selectedExportDataset, setSelectedExportDataset] = useState<'products' | 'categories' | 'lowStock'>('products');
  const [selectedImportTarget, setSelectedImportTarget] = useState<'products' | 'categories'>('products');
  const [dataExchangeMessage, setDataExchangeMessage] = useState<string>('');
  const [productForm, setProductForm] = useState<ProductFormState>({
    ...initialProductFormState,
    category: categories[0]?.name ?? ''
  });

  const lowStockItems = products.filter((product) => product.stock <= product.reorderLevel);
  const exportRows = useMemo(() => {
    if (selectedExportDataset === 'categories') {
      return categories.map((category) => ({
        id: category.id,
        name: category.name,
        isActive: category.isActive
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
  }, [categories, lowStockItems, products, selectedExportDataset]);

  const onProductFormChange = (field: keyof ProductFormState, value: string): void => {
    setProductForm((previous) => ({
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

  const handleExportInventory = async (format: DataExchangeFormat): Promise<void> => {
    const fileBaseName =
      selectedExportDataset === 'categories'
        ? 'inventoryCategories'
        : selectedExportDataset === 'lowStock'
          ? 'inventoryLowStock'
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
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Inventory & Stock</p>
        <h1 className="mt-2 text-3xl font-semibold">Inventory Management</h1>
        <p className="mt-1 text-sm text-slate-500">Track stock, categories, products, and low-stock alerts.</p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-white/70 bg-white/90 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm uppercase tracking-[0.1em] text-slate-600">Total Categories</CardTitle>
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
            <CardTitle className="text-sm uppercase tracking-[0.1em] text-slate-600">Total Units</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-slate-900">{products.reduce((sum, product) => sum + product.stock, 0)}</p>
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
              onChange={(event) => setSelectedExportDataset(event.target.value as 'products' | 'categories' | 'lowStock')}
            >
              <option value="products">Products</option>
              <option value="categories">Categories</option>
              <option value="lowStock">Low Stock</option>
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
              onChange={(event) => setSelectedImportTarget(event.target.value as 'products' | 'categories')}
            >
              <option value="products">Import Products</option>
              <option value="categories">Import Categories</option>
            </select>
            <Input type="file" accept={importFileAccept} onChange={(event) => void handleImportInventoryFile(event)} />
          </div>
          <p className="text-xs text-slate-500">Import supports CSV, TSV, JSON, and TXT. Exports support operational and reporting formats.</p>
          {dataExchangeMessage ? <p className="text-sm text-slate-600">{dataExchangeMessage}</p> : null}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
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
                    <p className="text-sm font-semibold text-slate-900">${product.price.toFixed(2)}</p>
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
    </section>
  );
}
