import prisma from "../utils/prisma/prisma";

const CODE_RE = /^CHR-(\d{3})$/;

export function formatAuctionCode(n: number): string {
  return `CHR-${String(n).padStart(3, "0")}`;
}

export async function allocateNextAuctionCode(): Promise<string> {
  const rows = await prisma.auctionItem.findMany({
    select: { auctionCode: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  let max = 0;
  for (const row of rows) {
    const code = String(row.auctionCode);
    const m = CODE_RE.exec(code);
    if (m) max = Math.max(max, parseInt(m[1], 10));
    else {
      const digits = parseInt(code.replace(/\D/g, ""), 10);
      if (!Number.isNaN(digits)) max = Math.max(max, digits);
    }
  }

  return formatAuctionCode(max + 1);
}
