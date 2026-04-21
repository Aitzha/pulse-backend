import { TaxKind } from '../schemas/liability.schema.js';

export interface TaxWindow {
  periodStart: Date;
  periodEnd: Date;
  nextPaymentDate: Date;
}

const TAX_PAYMENT_DAY = 15;

export function computeTaxWindow(taxKind: TaxKind, asOf: Date): TaxWindow {
  const year = asOf.getUTCFullYear();
  switch (taxKind) {
    case 'yearly':
      return {
        periodStart: utcDate(year - 1, 0, 1),
        periodEnd: utcEndOfDay(year - 1, 11, 31),
        nextPaymentDate: utcDate(year, 1, TAX_PAYMENT_DAY),
      };
    case 'semiannual_h1':
      return {
        periodStart: utcDate(year, 0, 1),
        periodEnd: utcEndOfDay(year, 5, 30),
        nextPaymentDate: utcDate(year, 7, TAX_PAYMENT_DAY),
      };
    case 'semiannual_h2':
      return {
        periodStart: utcDate(year - 1, 6, 1),
        periodEnd: utcEndOfDay(year - 1, 11, 31),
        nextPaymentDate: utcDate(year, 1, TAX_PAYMENT_DAY),
      };
  }
}

export function computeNextSocialDueDate(
  dueDay: number,
  lastPaidMonth: string | undefined,
  asOf: Date,
): Date {
  const boundedDay = Math.min(Math.max(dueDay, 1), 28);
  let year = asOf.getUTCFullYear();
  let month = asOf.getUTCMonth();

  if (lastPaidMonth) {
    const [ly, lm] = lastPaidMonth.split('-').map(Number);
    if (Number.isFinite(ly) && Number.isFinite(lm)) {
      year = ly;
      month = lm;
    }
  } else if (asOf.getUTCDate() > boundedDay) {
    month += 1;
    if (month > 11) {
      month = 0;
      year += 1;
    }
  }

  return utcDate(year, month, boundedDay);
}

function utcDate(year: number, monthIndex: number, day: number): Date {
  return new Date(Date.UTC(year, monthIndex, day));
}

function utcEndOfDay(year: number, monthIndex: number, day: number): Date {
  return new Date(Date.UTC(year, monthIndex, day, 23, 59, 59, 999));
}
