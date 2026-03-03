// Simple Express server for admin alert webhook endpoint
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// POST /admin-alert endpoint
app.post('/admin-alert', (req, res) => {
  try {
    const { severity, emotion, location, address, alert, response } = req.body;

    // Validate required fields
    if (!severity || !emotion || !location || !address || !alert) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['severity', 'emotion', 'location', 'address', 'alert']
      });
    }

    const alertData = {
      id: Date.now().toString(),
      severity,
      emotion,
      location,
      address,
      alert,
      response: response || null, // AI response from n8n (optional)
      time: new Date().toISOString(),
    };

    console.log('📢 New Admin Alert Received:', alertData);

    // Broadcast to connected clients (SSE)
    broadcastAlert(alertData);

    res.status(200).json({ 
      success: true, 
      message: 'Alert received and broadcasted',
      alert: alertData
    });
  } catch (error) {
    console.error('Error processing admin alert:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Server-Sent Events (SSE) for real-time updates
let clients = [];

app.get('/admin-alert-stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Add client to list
  const clientId = Date.now();
  const newClient = {
    id: clientId,
    res
  };
  clients.push(newClient);

  console.log(`✅ Admin client connected: ${clientId}`);

  // Send initial connection message
  res.write(`data: ${JSON.stringify({ type: 'connected', clientId })}\n\n`);

  // Remove client on disconnect
  req.on('close', () => {
    console.log(`❌ Admin client disconnected: ${clientId}`);
    clients = clients.filter(client => client.id !== clientId);
  });
});

function broadcastAlert(alertData) {
  clients.forEach(client => {
    client.res.write(`data: ${JSON.stringify(alertData)}\n\n`);
  });
  console.log(`📡 Alert broadcasted to ${clients.length} connected admin(s)`);
}

app.listen(PORT, () => {
  console.log(`🚀 Admin Alert Server running on http://localhost:${PORT}`);
  console.log(`📡 SSE endpoint: http://localhost:${PORT}/admin-alert-stream`);
  console.log(`📬 Webhook endpoint: POST http://localhost:${PORT}/admin-alert`);
});
