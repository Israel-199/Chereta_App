/** Short marketing-style line from auction specs or category. */
export function formatAuctionShortDescription(
  specs?: Record<string, string> | null,
  categoryLabel?: string | null,
): string {
  if (specs && typeof specs === "object") {
    const desc = specs.description || specs.summary;
    if (typeof desc === "string" && desc.trim()) return desc.trim();
    const parts = Object.values(specs)
      .filter((v) => typeof v === "string" && v.trim())
      .slice(0, 4)
      .map((v) => String(v).trim());
    if (parts.length) {
      return parts.join(", ").replace(/,\s*([^,]+)$/, " and $1") + ".";
    }
  }
  if (categoryLabel?.trim()) return categoryLabel.trim();
  return "";
}
