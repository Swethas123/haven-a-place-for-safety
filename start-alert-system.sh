#!/bin/bash

# HAVEN Admin Alert System Startup Script

echo "🚀 Starting HAVEN Admin Alert System..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if dependencies are installed
if [ ! -d "node_modules/express" ]; then
    echo "📦 Installing server dependencies..."
    npm install express cors
    echo ""
fi

# Start the alert server
echo "🔧 Starting Admin Alert Server on port 3001..."
node server.js &
SERVER_PID=$!

echo "✅ Server started with PID: $SERVER_PID"
echo ""
echo "📡 Webhook endpoint: http://localhost:3001/admin-alert"
echo "📡 SSE stream: http://localhost:3001/admin-alert-stream"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Wait for Ctrl+C
trap "echo ''; echo '🛑 Stopping server...'; kill $SERVER_PID; exit 0" INT

wait $SERVER_PID
