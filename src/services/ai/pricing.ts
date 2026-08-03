/**
 * Bảng giá Anthropic (USD / 1 triệu token).
 * Dùng để ước tính chi phí hiển thị trong dashboard admin — không phải hoá đơn chính thức.
 */
const PRICE_PER_MTOK: Record<string, { input: number; output: number }> = {
  "claude-opus-5": { input: 5, output: 25 },
  "claude-fable-5": { input: 10, output: 50 },
  "claude-sonnet-5": { input: 3, output: 15 },
  "claude-haiku-4-5": { input: 1, output: 5 },
};

const FALLBACK = { input: 5, output: 25 };

/** Trả về chi phí ước tính theo micro-cent (1/10.000 cent) để lưu dạng số nguyên. */
export function estimateCostMicroCents(
  model: string,
  inputTokens: number,
  outputTokens: number,
): number {
  const price = PRICE_PER_MTOK[model] ?? FALLBACK;
  const usd = (inputTokens / 1_000_000) * price.input + (outputTokens / 1_000_000) * price.output;
  return Math.round(usd * 100 * 10_000);
}

export function formatMicroCents(microCents: number, locale = "de-DE"): string {
  const usd = microCents / 10_000 / 100;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: usd < 1 ? 4 : 2,
  }).format(usd);
}

export const KNOWN_MODELS = Object.keys(PRICE_PER_MTOK);
