#!/bin/bash

echo "🏆 Starting HOF Lineup Generator Web App..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Create output directory if it doesn't exist
if [ ! -d "output" ]; then
    mkdir -p output
fi

echo "🚀 Starting web server..."
echo "🌐 Open your browser and go to: http://localhost:3000"
echo "📱 Press Ctrl+C to stop the server"
echo ""

# Start the web app
node webapp.js
