import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { execSync } from 'node:child_process'

/**
 * Follow redirects on a Google Maps URL using curl (reliable across
 * all environments since Node's fetch/https can behave differently
 * inside Vite's process).
 */
function resolveUrl(url) {
  try {
    // curl -Ls -o /dev/null -w '%{url_effective}' follows all redirects
    // and prints the final URL
    const finalUrl = execSync(
      `curl -Ls -o /dev/null -w '%{url_effective}' ${JSON.stringify(url)}`,
      { encoding: 'utf-8', timeout: 10000 }
    ).trim();
    return finalUrl || url;
  } catch {
    return url;
  }
}

// Dev-only endpoint that follows Google Maps redirects to extract place info.
// In production this would be a serverless function.
function resolveUrlPlugin() {
  return {
    name: 'resolve-url-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url.startsWith('/api/resolve-url')) return next();

        const params = new URL(req.url, 'http://localhost').searchParams;
        const url = params.get('url');

        if (!url) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Missing url parameter' }));
          return;
        }

        try {
          const resolvedUrl = resolveUrl(url);
          const result = { googleMapsUrl: resolvedUrl, name: null };

          // Extract place name from the resolved URL path
          const placeMatch = resolvedUrl.match(/\/maps\/place\/([^/@?#]+)/);
          if (placeMatch) {
            result.name = decodeURIComponent(
              placeMatch[1].replace(/\+/g, ' ')
            );
          }

          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(result));
        } catch (e) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: e.message }));
        }
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), resolveUrlPlugin()],
})
