// Sentences of an item's texts with a number that no rule carries (ADR 0019, point 5): neither a
// `$clarity`/`$compendium` quote nor a `notModelled` quote lies in them. The count sinks per block.

const REF_QUOTE = /\$(?:clarity|compendium)\[[^\]]*\]\("([^"]*)"\)/g;

/** Every quote an item file uses: in references and expressions, in `source.quote`, in notModelled. */
export function itemQuotes(item: unknown): string[] {
  const quotes: string[] = [];
  const walk = (value: unknown) => {
    if (typeof value === "string") {
      for (const m of value.matchAll(REF_QUOTE)) quotes.push(m[1]);
    } else if (Array.isArray(value)) {
      value.forEach(walk);
    } else if (value !== null && typeof value === "object") {
      for (const [key, v] of Object.entries(value)) {
        if (key === "quote" && typeof v === "string") quotes.push(v);
        else walk(v);
      }
    }
  };
  walk(item);
  return quotes;
}

/** The sentences of the texts that hold a digit and contain none of the quotes. */
export function uncoveredSentences(texts: string[], quotes: string[]): string[] {
  return texts
    .flatMap((text) => text.split("\n"))
    .flatMap((line) => line.split(/(?<=[.!?])\s+/))
    .map((sentence) => sentence.trim())
    .filter((sentence) => /\d/.test(sentence))
    .filter((sentence) => !quotes.some((q) => sentence.includes(q)));
}
