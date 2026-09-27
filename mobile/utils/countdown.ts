export function formatCountdown(endTime: string | Date, nowMs: number = Date.now()): string {
  const end = new Date(endTime).getTime();
  const diff = Math.max(0, end - nowMs);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${days}d : ${pad(hours)}h : ${pad(minutes)}m : ${pad(seconds)}s`;
}

export function isAuctionEnded(endTime: string | Date, status?: string, nowMs: number = Date.now()): boolean {
  if (status === "ENDED" || status === "CANCELLED") return true;
  return new Date(endTime).getTime() <= nowMs;
}
