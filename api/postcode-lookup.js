const POSTCODE_PATTERN = /^[A-Z]{1,2}[0-9][A-Z0-9]?\s*[0-9][A-Z]{2}$/i;

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.IDEAL_POSTCODES_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Address lookup is not configured.' });
  }

  const postcode = (req.query.postcode || '').toString().trim();
  if (!postcode || !POSTCODE_PATTERN.test(postcode)) {
    return res.status(400).json({ error: 'Please enter a valid UK postcode.' });
  }

  try {
    const url = `https://api.ideal-postcodes.co.uk/v1/postcodes/${encodeURIComponent(postcode)}?api_key=${encodeURIComponent(apiKey)}`;
    const response = await fetch(url);
    const data = await response.json();

    if (response.status === 404) {
      return res.status(200).json({ addresses: [] });
    }

    if (!response.ok) {
      console.error('Ideal Postcodes error', data);
      return res.status(502).json({ error: 'Could not look up that postcode right now.' });
    }

    const addresses = (data.result || []).map(entry => ({
      line1: [entry.line_1, entry.line_2].filter(Boolean).join(', '),
      line2: entry.line_3 || '',
      city: entry.post_town || '',
      postcode: entry.postcode || postcode,
    }));

    return res.status(200).json({ addresses });
  } catch (err) {
    console.error('postcode-lookup error', err);
    return res.status(500).json({ error: 'Could not look up that postcode right now.' });
  }
}
