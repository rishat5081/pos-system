import type { GlobalPreferencesRecord } from '@/stores/storeOpsStore';

export function formatCurrencyValue(value: number, preferences: GlobalPreferencesRecord): string {
  try {
    return new Intl.NumberFormat(preferences.locale, {
      style: 'currency',
      currency: preferences.currency,
      maximumFractionDigits: 2
    }).format(value);
  } catch {
    return `$${value.toFixed(2)}`;
  }
}

export function formatDateTimeValue(value: string, preferences: GlobalPreferencesRecord): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  try {
    return new Intl.DateTimeFormat(preferences.locale, {
      dateStyle: preferences.dateStyle,
      timeStyle: 'short',
      timeZone: preferences.timezone
    }).format(date);
  } catch {
    return date.toLocaleString();
  }
}

export function formatDateValue(value: string, preferences: GlobalPreferencesRecord): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  try {
    return new Intl.DateTimeFormat(preferences.locale, {
      dateStyle: preferences.dateStyle,
      timeZone: preferences.timezone
    }).format(date);
  } catch {
    return date.toLocaleDateString();
  }
}
