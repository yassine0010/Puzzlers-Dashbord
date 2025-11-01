import type { Context } from "@netlify/functions";

const API_BASE = "http://20.199.64.218:5000";

export default async (req: Request, context: Context) => {
  // Get the path after /api/
  const url = new URL(req.url);
  const path = url.pathname.replace("/.netlify/functions/api-proxy", "");
  const queryString = url.search;
  
  // Build the target URL
  const targetUrl = `${API_BASE}${path}${queryString}`;
  
  console.log(`Proxying request to: ${targetUrl}`);

  try {
    // Forward the request to your HTTP API
    const headers: Record<string, string> = {};
    
    // Copy relevant headers
    req.headers.forEach((value, key) => {
      if (!['host', 'connection', 'content-length'].includes(key.toLowerCase())) {
        headers[key] = value;
      }
    });

    const options: RequestInit = {
      method: req.method,
      headers,
    };

    // Include body for POST, PUT, PATCH requests
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      options.body = await req.text();
    }

    const response = await fetch(targetUrl, options);
    const data = await response.text();

    // Return the response from your API
    return new Response(data, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return new Response(JSON.stringify({ error: 'Failed to proxy request' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
