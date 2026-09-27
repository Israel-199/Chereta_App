/** Display auction code as CHR-123 */
export function formatAuctionCodeDisplay(code?: string | number | null): string {
  if (code == null || code === "") return "—";
  const s = String(code);
  if (/^CHR-\d{3}$/i.test(s)) return s.toUpperCase();
  const n = parseInt(s.replace(/\D/g, ""), 10);
  if (!Number.isNaN(n)) return `CHR-${String(n).padStart(3, "0")}`;
  return s;
}
