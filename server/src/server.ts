// src/server.ts
import express from 'express';

const app = express();
const PORT = process.env.PORT || 5001; // We'll use 5001 for the backend

// Middlewares
app.use(express.json()); // To parse JSON bodies

// A simple test route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'UP', message: 'RATS server is running!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});