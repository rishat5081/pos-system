import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { formatCurrencyValue } from '@/lib/globalFormat';
import { type PaymentMethod, useStoreOpsStore } from '@/stores/storeOpsStore';

export function PosPage(): JSX.Element {
  const products = useStoreOpsStore((state) => state.products);
  const customers = useStoreOpsStore((state) => state.customers);
  const taxRate = useStoreOpsStore((state) => state.taxRate);
  const globalPreferences = useStoreOpsStore((state) => state.globalPreferences);
  const registerSession = useStoreOpsStore((state) => state.registerSession);
  const processCheckout = useStoreOpsStore((state) => state.processCheckout);
  const adjustStock = useStoreOpsStore((state) => state.adjustStock);
  const startRegisterSession = useStoreOpsStore((state) => state.startRegisterSession);
  const endRegisterSession = useStoreOpsStore((state) => state.endRegisterSession);

  const [cart, setCart] = useState<Record<string, number>>({});
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [discountAmount, setDiscountAmount] = useState<string>('0');
  const [openingCash, setOpeningCash] = useState<string>('500');
  const [lastOrderMessage, setLastOrderMessage] = useState<string>('');
  const [checkoutError, setCheckoutError] = useState<string>('');
  const cartRef = useRef<Record<string, number>>({});

  const cartEntries = useMemo(() => Object.entries(cart).filter(([, quantity]) => quantity > 0), [cart]);

  const subTotal = useMemo(() => {
    return cartEntries.reduce((sum, [productId, quantity]) => {
      const product = products.find((item) => item.id === productId);

      if (!product) {
        return sum;
      }

      return sum + product.price * quantity;
    }, 0);
  }, [cartEntries, products]);

  const normalizedDiscount = Math.max(0, Math.min(Number(discountAmount) || 0, subTotal));
  const taxAmount = (subTotal - normalizedDiscount) * taxRate;
  const totalAmount = subTotal - normalizedDiscount + taxAmount;

  useEffect(() => {
    cartRef.current = cart;
  }, [cart]);

  useEffect(() => {
    return () => {
      Object.entries(cartRef.current).forEach(([productId, quantity]) => {
        if (quantity > 0) {
          adjustStock(productId, quantity);
        }
      });
    };
  }, [adjustStock]);

  const setCartQuantity = (productId: string, nextQuantityInput: number): void => {
    const currentQuantity = cart[productId] ?? 0;
    const product = products.find((item) => item.id === productId);

    if (!product) {
      return;
    }

    const maxQuantity = currentQuantity + product.stock;
    const nextQuantity = Math.max(0, Math.min(maxQuantity, Math.floor(nextQuantityInput)));

    if (nextQuantity === currentQuantity) {
      return;
    }

    const quantityChange = nextQuantity - currentQuantity;

    if (quantityChange > 0) {
      adjustStock(productId, -quantityChange);
    } else {
      adjustStock(productId, Math.abs(quantityChange));
    }

    setCart((previous) => {
      if (nextQuantity === 0) {
        const nextCart = { ...previous };
        delete nextCart[productId];
        return nextCart;
      }

      return {
        ...previous,
        [productId]: nextQuantity
      };
    });
  };

  const addToCart = (productId: string): void => {
    const currentQuantity = cart[productId] ?? 0;
    setCartQuantity(productId, currentQuantity + 1);
  };

  const removeFromCart = (productId: string): void => {
    const currentQuantity = cart[productId] ?? 0;
    setCartQuantity(productId, currentQuantity - 1);
  };

  const clearCart = (): void => {
    Object.entries(cart).forEach(([productId, quantity]) => {
      if (quantity > 0) {
        adjustStock(productId, quantity);
      }
    });

    setCart({});
  };

  const handleCheckout = (): void => {
    const checkoutItems = cartEntries.map(([productId, quantity]) => ({ productId, quantity }));

    try {
      const result = processCheckout({
        items: checkoutItems,
        paymentMethod,
        customerId: selectedCustomerId || undefined,
        discountAmount: normalizedDiscount,
        skipStockDeduction: true
      });

      setLastOrderMessage(
        `Payment successful. Order ${result.orderId} total: ${formatCurrencyValue(result.orderTotal, globalPreferences)}`
      );
      setCheckoutError('');
      setCart({});
      setDiscountAmount('0');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Checkout failed';
      setCheckoutError(message);
      setLastOrderMessage('');
    }
  };

  const handleOpenRegister = (): void => {
    startRegisterSession(Number(openingCash) || 0);
  };

  return (
    <section className="space-y-6">
      <Card className="border-white/70 bg-white/90 shadow-lg">
        <CardHeader>
          <CardTitle>Register Session</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-[1fr_auto_auto] md:items-end">
          <div className="space-y-2">
            <label htmlFor="openingCash" className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-600">
              Opening Cash
            </label>
            <Input
              id="openingCash"
              type="number"
              min="0"
              value={openingCash}
              onChange={(event) => setOpeningCash(event.target.value)}
              disabled={registerSession.isOpen}
            />
          </div>
          {!registerSession.isOpen ? (
            <Button type="button" className="bg-sky-600 hover:bg-sky-700" onClick={handleOpenRegister}>
              Open Register
            </Button>
          ) : (
            <Button type="button" variant="outline" onClick={endRegisterSession}>
              Close Register
            </Button>
          )}
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
            <p className="font-medium text-slate-900">{registerSession.isOpen ? 'Open' : 'Closed'}</p>
            <p className="text-xs text-slate-600">
              Current cash: {formatCurrencyValue(registerSession.currentCash, globalPreferences)}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="border-white/70 bg-white/90 shadow-lg">
          <CardHeader>
            <CardTitle>POS Terminal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-600">Select products, choose payment, and complete checkout.</p>
            <div className="grid gap-3 md:grid-cols-2">
              {products.map((product) => (
                <div key={product.id} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                  <p className="text-sm font-semibold text-slate-900">{product.name}</p>
                  <p className="text-xs text-slate-500">{product.category}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-700">{formatCurrencyValue(product.price, globalPreferences)}</p>
                    <p className="text-xs text-slate-500">Stock {product.stock}</p>
                  </div>
                  <Button
                    type="button"
                    className="mt-3 h-9 w-full rounded-lg bg-sky-600 hover:bg-sky-700"
                    disabled={product.stock <= 0}
                    onClick={() => addToCart(product.id)}
                  >
                    {product.stock <= 0 ? 'Out Of Stock' : 'Add To Cart'}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/70 bg-white/90 shadow-lg">
          <CardHeader>
            <CardTitle>Current Cart</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="customer" className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-600">
                Customer
              </label>
              <select
                id="customer"
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
                value={selectedCustomerId}
                onChange={(event) => setSelectedCustomerId(event.target.value)}
              >
                <option value="">Walk In Customer</option>
                {customers
                  .filter((customer) => customer.id !== 'customer-walk-in')
                  .map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.fullName}
                    </option>
                  ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="paymentMethod" className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-600">
                Payment Method
              </label>
              <select
                id="paymentMethod"
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
                value={paymentMethod}
                onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)}
              >
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="digital">Digital</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="discountAmount" className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-600">
                Discount Amount
              </label>
              <Input
                id="discountAmount"
                type="number"
                min="0"
                step="0.01"
                value={discountAmount}
                onChange={(event) => setDiscountAmount(event.target.value)}
              />
            </div>

            {cartEntries.length === 0 && <p className="text-sm text-slate-500">Cart is empty.</p>}
            <div className="space-y-2">
              {cartEntries.map(([productId, quantity]) => {
                const product = products.find((item) => item.id === productId);

                if (!product) {
                  return null;
                }

                return (
                  <div key={productId} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-900">{product.name}</p>
                      <p className="text-sm text-slate-600">
                        {formatCurrencyValue(product.price * quantity, globalPreferences)}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-2 text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="h-7 rounded-md px-2 text-xs"
                          onClick={() => removeFromCart(productId)}
                        >
                          -
                        </Button>
                        <Input
                          type="number"
                          min="0"
                          className="h-7 w-16 rounded-md border-slate-300 px-2 py-1 text-center text-xs"
                          value={quantity}
                          onChange={(event) => setCartQuantity(productId, Number(event.target.value) || 0)}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          className="h-7 rounded-md px-2 text-xs"
                          disabled={product.stock <= 0}
                          onClick={() => addToCart(productId)}
                        >
                          +
                        </Button>
                      </div>
                      <p>In stock: {product.stock}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm">
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-600">Sub Total</span>
                <span className="font-semibold text-slate-900">{formatCurrencyValue(subTotal, globalPreferences)}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-600">Discount</span>
                <span className="font-semibold text-slate-900">-{formatCurrencyValue(normalizedDiscount, globalPreferences)}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-600">Tax</span>
                <span className="font-semibold text-slate-900">{formatCurrencyValue(taxAmount, globalPreferences)}</span>
              </div>
              <div className="mt-1 flex items-center justify-between border-t border-slate-200 pt-2">
                <span className="text-slate-700">Total</span>
                <span className="text-base font-semibold text-slate-900">{formatCurrencyValue(totalAmount, globalPreferences)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                className="h-10 rounded-lg"
                disabled={cartEntries.length === 0}
                onClick={clearCart}
              >
                Clear Cart
              </Button>
              <Button
                type="button"
                className="h-10 rounded-lg bg-emerald-600 hover:bg-emerald-700"
                disabled={cartEntries.length === 0 || !registerSession.isOpen}
                onClick={handleCheckout}
              >
                Checkout
              </Button>
            </div>
            {checkoutError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{checkoutError}</p>}
            {lastOrderMessage && (
              <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{lastOrderMessage}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
