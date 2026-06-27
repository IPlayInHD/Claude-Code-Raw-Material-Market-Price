const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { initializeMaterials } = require('./data/materials');
const PriceEngine = require('./services/priceEngine');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

app.use(cors());
app.use(express.json());

const materials = initializeMaterials();
const engine = new PriceEngine(materials, io);
engine.start();

// REST API
app.get('/api/health', (_, res) => res.json({ status: 'ok', uptime: process.uptime() }));

app.get('/api/materials', (_, res) => {
  res.json(engine.getMaterials());
});

app.get('/api/materials/:id', (req, res) => {
  const m = engine.getMaterialById(req.params.id);
  if (!m) return res.status(404).json({ error: 'Not found' });
  res.json(m);
});

app.get('/api/forecasts', (_, res) => {
  res.json(engine.getForecasts());
});

app.get('/api/forecasts/:id', (req, res) => {
  const f = engine.getForecasts().find((x) => x.materialId === req.params.id);
  if (!f) return res.status(404).json({ error: 'Not found' });
  res.json(f);
});

app.get('/api/summary', (_, res) => {
  res.json(engine.getSummary());
});

// Socket.io
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Send full state on connect
  socket.emit('initial_data', {
    materials: engine.getMaterials(),
    forecasts: engine.getForecasts(),
    summary: engine.getSummary(),
    timestamp: new Date().toISOString(),
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`UAE Materials Price Server running on port ${PORT}`);
});
