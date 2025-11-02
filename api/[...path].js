import fetch from 'node-fetch';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  const { path } = req.query;
  const apiUrl = `http://20.199.64.218:5000/api/${
    Array.isArray(path) ? path.join('/') : path || ''
  }`;

  try {
    const headers = {};
    
    if (req.headers.authorization) {
      headers['authorization'] = req.headers.authorization;
    }
    
    if (req.headers['content-type']) {
      headers['content-type'] = req.headers['content-type'];
    }

    const fetchOptions = {
      method: req.method,
      headers: headers,
    };

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      fetchOptions.body = req;
    }

    const response = await fetch(apiUrl, fetchOptions);
    const contentType = response.headers.get('content-type');

    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      res.status(response.status).json(data);
    } else {
      const text = await response.text();
      res.status(response.status).send(text);
    }
  } catch (error) {
    res.status(500).json({ 
      error: 'Proxy error', 
      message: error.message, 
      stack: error.stack 
    });
  }
}
