export default function handler(req, res) {
  if (req.method === 'POST') {
    const { name, score } = req.body;
    // Save to a database here if you like
    return res.status(200).json({ message: `Got score ${score} for ${name}` });
  }
  res.status(405).json({ error: 'Method not allowed' });
}
