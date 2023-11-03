const express = require("express");

const app = express();

app.use(express.json());

app.post('/validate-user', async (req, res) => {
  const { user, password } = req.body;
  if (user === 'admin' && password === 'GreenSense!') res.status(200).json({ message: 'Valid user' });
  res.status(403).json({ message: 'Invalid user' });
});

module.exports = app;
