import pako from "pako";

/**
 * Compress trip data into a URL-safe base64 string.
 */
export function compressTrip(trip) {
  const json = JSON.stringify(trip);
  const compressed = pako.deflate(json);
  // Convert Uint8Array to base64
  let binary = "";
  for (let i = 0; i < compressed.length; i++) {
    binary += String.fromCharCode(compressed[i]);
  }
  // Make URL-safe: + → -, / → _, = → (strip)
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/**
 * Decompress a URL-safe base64 string back to trip data.
 */
export function decompressTrip(encoded) {
  // Restore standard base64
  let base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
  // Add back padding
  while (base64.length % 4) base64 += "=";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const json = pako.inflate(bytes, { to: "string" });
  return JSON.parse(json);
}

/**
 * Generate a shareable URL with compressed trip data in the hash.
 */
export function generateShareUrl(trip) {
  const compressed = compressTrip(trip);
  return `${window.location.origin}${window.location.pathname}#/view/${compressed}`;
}

/**
 * Check if the current URL has a share hash and extract trip data.
 * Returns trip data or null.
 */
export function getSharedTrip() {
  const hash = window.location.hash;
  if (!hash.startsWith("#/view/")) return null;
  try {
    const encoded = hash.slice("#/view/".length);
    return decompressTrip(encoded);
  } catch (e) {
    console.error("Failed to decompress shared trip:", e);
    return null;
  }
}
