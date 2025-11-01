import type { Handler, HandlerContext, HandlerEvent } from '@netlify/functions';

const API_BASE = 'http://20.199.64.218:5000';

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  // Get the path after /api-proxy
  const path = event.path.replace('/.netlify/functions/api-proxy', '');
  const queryString = event.rawQuery ? `?${event.rawQuery}` : '';

  // Build the target URL
  const targetUrl = `${API_BASE}${path}${queryString}`;

  console.log(`Proxying ${event.httpMethod} request to: ${targetUrl}`);

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
      body: '',
    };
  }

  try {
    // Prepare headers
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Copy Authorization header if present
    if (event.headers.authorization) {
      headers['Authorization'] = event.headers.authorization;
    }

    const options: RequestInit = {
      method: event.httpMethod,
      headers,
    };

    // Include body for POST, PUT, PATCH requests
    if (event.body && event.httpMethod !== 'GET' && event.httpMethod !== 'HEAD') {
      options.body = event.body;
    }

    const response = await fetch(targetUrl, options);
    const data = await response.text();
    const contentType = response.headers.get('Content-Type') || 'application/json';

    // Return the response from your API
    return {
      statusCode: response.status,
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
      body: data,
    };
  } catch (error) {
    console.error('Proxy error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
      body: JSON.stringify({
        error: 'Failed to proxy request',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};
