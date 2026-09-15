/**
 * Format a number into Indonesian Rupiah (IDR) format.
 * Example: 25000 -> "Rp 25.000"
 */
export function formatIDR(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return "Rp 0";
  }

  const num = typeof amount === "string" ? parseFloat(amount) : amount;

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(num);
}

/**
 * Format a raw number into readable compact representation
 * Example: 1500000 -> "1,5 Jt", 25000 -> "25 rb"
 */
export function formatCompactIDR(amount: number): string {
  if (Math.abs(amount) >= 1_000_000_000) {
    return (amount / 1_000_000_000).toFixed(1).replace(".", ",") + " M";
  }
  if (Math.abs(amount) >= 1_000_000) {
    return (amount / 1_000_000).toFixed(1).replace(".", ",") + " Jt";
  }
  if (Math.abs(amount) >= 1_000) {
    return (amount / 1_000).toFixed(0) + " rb";
  }
  return formatIDR(amount);
}

/**
 * Clean currency string to raw numeric number
 * Example: "Rp 25.000" -> 25000
 */
export function parseIDRInput(input: string): number {
  const clean = input.replace(/[^0-9]/g, "");
  return clean ? parseInt(clean, 10) : 0;
}
