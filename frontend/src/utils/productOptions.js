/**
 * Utility for parsing and formatting product sizes and colors,
 * supporting availability flags like "(XL)" or "(Sunset Coral)" for unavailable/out-of-stock options.
 */

export const STANDARD_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'];

/**
 * Parses an option string (comma-separated).
 * If an item is wrapped in parentheses like "(XL)" or "(Black)", it is marked as unavailable.
 *
 * @param {string} optionString - e.g. "XS, S, M, L, (XL), XXL" or "Ocean Blue, (Sunset Coral)"
 * @param {Array<string>} defaultFallback - fallback array if optionString is empty
 * @returns {Array<{name: string, available: boolean, raw: string}>}
 */
export function parseOptions(optionString, defaultFallback = []) {
  if (!optionString || typeof optionString !== 'string' || !optionString.trim()) {
    return defaultFallback.map((item) => ({
      name: item,
      available: true,
      raw: item,
    }));
  }

  const parts = optionString
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);

  if (parts.length === 0) {
    return defaultFallback.map((item) => ({
      name: item,
      available: true,
      raw: item,
    }));
  }

  return parts.map((part) => {
    // Check if item is wrapped in parentheses: (XL), (Sunset Coral)
    // Or contains explicit "(out of stock)" / "(unavailable)"
    const isParens = /^\(.*\)$/.test(part);
    const hasOosText =
      /\(out of stock\)/i.test(part) || /\(unavailable\)/i.test(part);
    const isUnavailable = isParens || hasOosText;

    const cleanName = part
      .replace(/\(out of stock\)/gi, '')
      .replace(/\(unavailable\)/gi, '')
      .replace(/[()]/g, '')
      .trim();

    return {
      name: cleanName,
      available: !isUnavailable,
      raw: part,
    };
  });
}

/**
 * Formats an array of { name, available } into a comma-separated string,
 * wrapping unavailable items in parentheses e.g. "XS, S, M, L, (XL), XXL".
 */
export function formatOptions(items) {
  if (!Array.isArray(items)) return '';
  return items
    .map((item) => {
      const name = (item.name || '').trim();
      if (!name) return null;
      return item.available ? name : `(${name})`;
    })
    .filter(Boolean)
    .join(', ');
}
