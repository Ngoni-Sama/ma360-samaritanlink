// Keep USSD/SMS text inside the GSM-7 character set that basic phones render.
// Characters outside it (×, en/em dashes, smart quotes, µ) either display as
// garbage or force UCS-2 encoding, which halves the message length.
const MAP: Record<string, string> = {
  "×": "x", "–": "-", "—": "-", "‘": "'", "’": "'", "“": '"', "”": '"', "…": "...", "µ": "u", "→": "->", "·": "-",
};

export function toGsm(text: string): string {
  return text.replace(/[×–—‘’“”…µ→·]/g, (c) => MAP[c] ?? c).replace(/[^\x20-\x7E\n]/g, "");
}
