const express = require('express');
const app = express();
const port = 3001;

app.get('/', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

app.listen(port, () => {
  console.log(`Minimal server running on http://localhost:${port}`);
});
