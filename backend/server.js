import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// Basic Route
app.get('/', (req, res) => {
  res.send('Dice Simulator API is running');
});

// Dice Roll API
app.get('/api/roll/:count', (req, res) => {
  const count = parseInt(req.params.count) || 1;
  if (count < 1 || count > 6) {
    return res.status(400).json({ error: 'Count must be between 1 and 6' });
  }
  
  const values = Array.from({ length: count }, () => Math.floor(Math.random() * 6) + 1);
  const total = values.reduce((sum, val) => sum + val, 0);
  
  res.json({ values, total, timestamp: new Date() });
});

// WebSocket for Multiplayer
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  
  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
  });

  socket.on('roll_dice', (data) => {
    // broadcast roll to room
    io.to(data.roomId).emit('dice_rolled', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
