export default async function handler(req, res) {
  const { path } = req.query;
  const apiUrl = `http://20.199.64.218:5000/api/${
    Array.isArray(path) ? path.join('/') : path || ''
  }`;

  try {
    const response = await fetch(apiUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        ...(req.headers.authorization && { Authorization: req.headers.authorization }),
      },
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
    });

    const contentType = response.headers.get('content-type');

    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      res.status(response.status).json(data);
    } else {
      const text = await response.text();
      res.status(response.status).json({
        error: 'Non-JSON response',
        message: text,
        status: response.status,
      });
    }
  } catch (error) {
    res.status(500).json({ error: 'Proxy error', message: error.message });
  }
}
