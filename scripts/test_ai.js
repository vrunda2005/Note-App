// Tests the local /api/ai endpoint. Honors PORT env var if Next used a different port.
(async () => {
  try {
    const port = process.env.PORT || 3000;
    const url = `http://localhost:${port}/api/ai`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task: 'summarize', text: 'This is a test note to summarize for automation.' })
    });
    console.log('url', url, 'status', res.status);
    const json = await res.json();
    console.log('response:', JSON.stringify(json, null, 2));
  } catch (e) {
    console.error('request failed', e);
    process.exitCode = 1;
  }
})();
