/**
 * Check if a string looks like a Google Maps URL.
 */
export function isGoogleMapsUrl(text) {
  return /google\.(com|co\.\w+)\/maps|maps\.app\.goo\.gl|goo\.gl\/maps/.test(
    text.trim()
  );
}

/**
 * Resolve a Google Maps URL into place info by calling the dev server endpoint.
 * Falls back to client-side URL parsing if the server call fails.
 */
export async function resolveGoogleMapsUrl(url) {
  const trimmed = url.trim();
  if (!trimmed || !isGoogleMapsUrl(trimmed)) return null;

  try {
    const res = await fetch(
      `/api/resolve-url?url=${encodeURIComponent(trimmed)}`
    );
    if (!res.ok) throw new Error("Server error");
    const data = await res.json();
    if (data.error) throw new Error(data.error);

    return {
      name: data.name || null,
      neighborhood: null,
      hours: null,
      googleMapsUrl: data.googleMapsUrl || trimmed,
    };
  } catch {
    // Fallback: try to parse name from the URL client-side
    const placeMatch = trimmed.match(/\/maps\/place\/([^/@?#]+)/);
    return {
      name: placeMatch
        ? decodeURIComponent(placeMatch[1].replace(/\+/g, " "))
        : null,
      neighborhood: null,
      hours: null,
      googleMapsUrl: trimmed,
    };
  }
}
