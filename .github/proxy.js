// Local proxy that adds /v1 prefix to Aleo API requests.
// Leo v3.x strips /v1 from the endpoint URL, so requests go to
//   http://localhost:13337/testnet/...
// instead of the correct:
//   https://api.explorer.provable.com/v1/testnet/...
// This proxy fixes that transparently.

const http = require('http');
const https = require('https');

const TARGET_HOST = 'api.explorer.provable.com';
const TARGET_PREFIX = '/v1';

const server = http.createServer((req, res) => {
  const targetPath = TARGET_PREFIX + req.url;
  console.log(`[proxy] ${req.method} ${req.url} -> https://${TARGET_HOST}${targetPath}`);

  // Collect request body (for POST/PUT)
  const chunks = [];
  req.on('data', c => chunks.push(c));
  req.on('end', () => {
    const body = Buffer.concat(chunks);
    const options = {
      hostname: TARGET_HOST,
      port: 443,
      path: targetPath,
      method: req.method,
      headers: {
        'User-Agent': 'leo-proxy/1.0',
        'Accept': 'application/json',
        ...(body.length > 0 ? {
          'Content-Type': req.headers['content-type'] || 'application/json',
          'Content-Length': body.length
        } : {})
      }
    };

    const upstream = https.request(options, (upRes) => {
      // Forward status and headers
      const responseHeaders = {};
      for (const [k, v] of Object.entries(upRes.headers)) {
        if (!['transfer-encoding', 'connection'].includes(k.toLowerCase())) {
          responseHeaders[k] = v;
        }
      }
      res.writeHead(upRes.statusCode, responseHeaders);
      upRes.pipe(res);
    });

    upstream.on('error', (e) => {
      console.error('[proxy] error:', e.message);
      res.writeHead(502);
      res.end(JSON.stringify({ error: e.message }));
    });

    if (body.length > 0) {
      upstream.write(body);
    }
    upstream.end();
  });
});

server.listen(13337, '127.0.0.1', () => {
  console.log('[proxy] Listening on http://localhost:13337');
  console.log('[proxy] Forwarding to https://api.explorer.provable.com/v1/...');
});

// Keep alive
process.on('SIGTERM', () => server.close());
