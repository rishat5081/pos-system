import { useEffect, useMemo, useRef, useState } from 'react';
import { BellRing } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrencyValue, formatDateValue } from '@/lib/globalFormat';
import { useStoreOpsStore } from '@/stores/storeOpsStore';

function playReminderTone(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const audioContext = new window.AudioContext();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.value = 880;
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    gainNode.gain.value = 0.05;
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.18);
    oscillator.onended = () => {
      void audioContext.close();
    };
  } catch {
    // Ignore browser audio restrictions.
  }
}

export function InvoiceReminderCenter() {
  const globalPreferences = useStoreOpsStore((state) => state.globalPreferences);
  const invoices = useStoreOpsStore((state) => state.invoices);
  const getPendingInvoiceReminders = useStoreOpsStore((state) => state.getPendingInvoiceReminders);
  const markInvoiceReminderNotified = useStoreOpsStore((state) => state.markInvoiceReminderNotified);
  const setInvoiceStatus = useStoreOpsStore((state) => state.setInvoiceStatus);
  const lastReminderSignatureRef = useRef<string>('');
  const [tick, setTick] = useState(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- invoices and tick are intentional triggers for time-based rechecks
  const pendingReminders = useMemo(() => getPendingInvoiceReminders(), [invoices, getPendingInvoiceReminders, tick]);

  useEffect(() => {
    const reminderSignature = pendingReminders.map((invoiceRecord) => invoiceRecord.id).join('|');

    if (reminderSignature && reminderSignature !== lastReminderSignatureRef.current) {
      playReminderTone();
    }

    lastReminderSignatureRef.current = reminderSignature;
  }, [pendingReminders]);

  useEffect(() => {
    const reminderTimer = setInterval(() => {
      setTick((prev) => prev + 1);
    }, 30_000);

    return () => {
      clearInterval(reminderTimer);
    };
  }, []);

  if (!pendingReminders.length) {
    return <></>;
  }

  return (
    <section className="fixed right-5 top-20 z-50 w-[360px] space-y-2 rounded-2xl border border-amber-200 bg-white/95 p-4 shadow-2xl backdrop-blur">
      <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-amber-700">
        <BellRing className="h-4 w-4" />
        Invoice Reminders
      </p>
      <div className="space-y-2">
        {pendingReminders.slice(0, 3).map((invoiceRecord) => (
          <div key={invoiceRecord.id} className="rounded-xl border border-amber-100 bg-amber-50/70 p-3">
            <p className="text-sm font-semibold text-slate-900">{invoiceRecord.invoiceNumber}</p>
            <p className="text-xs text-slate-600">
              {invoiceRecord.customerName} / {formatCurrencyValue(invoiceRecord.amount, globalPreferences)}
            </p>
            <p className="text-xs text-red-600">Due: {formatDateValue(invoiceRecord.dueDate, globalPreferences)}</p>
            <div className="mt-2 flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-7 rounded-md px-2 text-xs"
                onClick={() => markInvoiceReminderNotified(invoiceRecord.id)}
              >
                Dismiss
              </Button>
              <Button
                type="button"
                size="sm"
                className="h-7 rounded-md bg-emerald-600 px-2 text-xs hover:bg-emerald-700"
                onClick={() => setInvoiceStatus(invoiceRecord.id, 'paid')}
              >
                Mark Paid
              </Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
