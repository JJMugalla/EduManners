require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// Socket.io Setup
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || "*", methods: ["GET", "POST"] }
});

io.on('connection', (socket) => {
  console.log(`User Connected: ${socket.id}`);
  socket.on('disconnect', () => console.log('User Disconnected'));
});

// Inject IO into request
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Auth Middleware
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ error: "Access Denied" });
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: verified.id, email: verified.email }; // simplified
    next();
  } catch (err) { res.status(400).json({ error: "Invalid Token" }); }
};

// Routes
const controller = require('./controllers/mainController');

// Auth Routes
app.post('/api/register', controller.register);
app.post('/api/login', controller.login);

// Protected Routes
app.post('/api/students', verifyToken, controller.createStudent);
app.get('/api/students', verifyToken, controller.getStudents);
app.put('/api/stars', verifyToken, controller.updateStars);
app.post('/api/redeem', verifyToken, controller.redeemCoins);

// Database & Start
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    server.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));
  })
  .catch(err => console.log(err));