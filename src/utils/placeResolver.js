/**
 * Attempts to extract place info from a Google Maps URL.
 * Returns a partial place object, or null if the URL isn't recognized.
 *
 * Supported formats:
 *   https://www.google.com/maps/place/Place+Name/@lat,lng,...
 *   https://www.google.com/maps/place/Place+Name/data=...
 *   https://maps.app.goo.gl/xxxxx   (short link — name not extractable)
 *   https://goo.gl/maps/xxxxx        (short link)
 */
export function parseGoogleMapsUrl(url) {
  const trimmed = url.trim();
  if (!trimmed) return null;

  try {
    // Full Google Maps URL with place name in path
    const placeMatch = trimmed.match(/\/maps\/place\/([^/@?#]+)/);
    if (placeMatch) {
      const rawName = decodeURIComponent(placeMatch[1].replace(/\+/g, " "));
      return {
        name: rawName,
        neighborhood: null,
        hours: null,
        googleMapsUrl: trimmed,
      };
    }

    // Short links — save URL but can't extract name without redirect
    if (
      trimmed.includes("maps.app.goo.gl") ||
      trimmed.includes("goo.gl/maps")
    ) {
      return {
        name: "New place",
        neighborhood: null,
        hours: null,
        googleMapsUrl: trimmed,
      };
    }

    // Any other google.com/maps link (e.g. search results, directions)
    if (trimmed.includes("google.com/maps") || trimmed.includes("google.co")) {
      return {
        name: "New place",
        neighborhood: null,
        hours: null,
        googleMapsUrl: trimmed,
      };
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Check if a string looks like a Google Maps URL.
 */
export function isGoogleMapsUrl(text) {
  return /google\.(com|co\.\w+)\/maps|maps\.app\.goo\.gl|goo\.gl\/maps/.test(
    text.trim()
  );
}
