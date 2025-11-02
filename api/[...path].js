export const config = {
  api: {
    bodyParser: false, // Disable body parsing to handle FormData
  },
};

export default async function handler(req, res) {
  const { path } = req.query;
  const apiUrl = `http://20.199.64.218:5000/api/${
    Array.isArray(path) ? path.join('/') : path || ''
  }`;

  try {
    // Forward headers
    const headers = {};
    
    if (req.headers.authorization) {
      headers['Authorization'] = req.headers.authorization;
    }

    // For Node.js fetch, we need to pass the raw request
    const fetchOptions = {
      method: req.method,
      headers: headers,
    };

    // Only add body for non-GET/HEAD requests
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      // Pass the raw request body
      fetchOptions.body = req;
      
      // Copy content-type for proper handling
      if (req.headers['content-type']) {
        headers['Content-Type'] = req.headers['content-type'];
      }
    }

    const response = await fetch(apiUrl, fetchOptions);

    const contentType = response.headers.get('content-type');

    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      res.status(response.status).json(data);
    } else {
      const text = await response.text();
      // Return text as-is for non-JSON responses
      res.status(response.status).send(text);
    }
  } catch (error) {
    res.status(500).json({ error: 'Proxy error', message: error.message, stack: error.stack });
  }
}
