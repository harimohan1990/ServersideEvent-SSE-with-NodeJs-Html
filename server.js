const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

// CORS Middleware
app.use(cors({
  origin: "http://127.0.0.1:5500", // allow Live Server
  methods: ["GET"],
  credentials: false
}));

app.get('/events', (req, res) => {
  // SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  let count = 0;

  const interval = setInterval(() => {
    count++;
    res.write(`data: Message ${count} from SSE server\n\n`);
  }, 2000);

  req.on('close', () => {
    clearInterval(interval);
    res.end();
  });
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
