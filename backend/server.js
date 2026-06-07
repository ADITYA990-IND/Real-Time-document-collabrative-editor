const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const connectDB = require('./config/db');
const Document = require('./models/Document');

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Database
connectDB();

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Map to track active document rooms and their connected client sockets
const documentRooms = new Map();

wss.on('connection', (ws) => {
    let currentDocId = null;

    ws.on('message', async (messageBuffer) => {
        const payload = JSON.parse(messageBuffer.toString());
        const { type, docId, content } = payload;

        // EVENT 1: Dynamic Room Join
        if (type === 'JOIN' && docId) {
            currentDocId = docId;
            
            // Allocation to dynamic room cluster
            if (!documentRooms.has(docId)) {
                documentRooms.set(docId, new Set());
            }
            documentRooms.get(docId).add(ws);

            console.log(`📡 User joined dynamic room: ${docId} (Total in room: ${documentRooms.get(docId).size})`);

            // Fetch from MongoDB or create new on-the-fly
            let document = await Document.findById(docId);
            if (!document) {
                document = await Document.create({ _id: docId, content: "" });
            }

            // Sync state back to the newly connected user interface
            ws.send(JSON.stringify({ type: 'LOAD_DOCUMENT', content: document.content }));
        }

        // EVENT 2: Multi-client Realtime Synchronization
        if (type === 'EDIT' && currentDocId) {
            const clients = documentRooms.get(currentDocId);
            if (clients) {
                // Broadcast updates strictly to other members of the SAME room
                clients.forEach((client) => {
                    if (client !== ws && client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({ type: 'RECEIVE_EDIT', content }));
                    }
                });
            }

            // Background async db persistence
            await Document.findByIdAndUpdate(currentDocId, { content });
        }
    });

    ws.on('close', () => {
        if (currentDocId && documentRooms.has(currentDocId)) {
            documentRooms.get(currentDocId).delete(ws);
            console.log(`❌ A user left room: ${currentDocId}`);
            // Garbage collection: clear empty rooms from server memory
            if (documentRooms.get(currentDocId).size === 0) {
                documentRooms.delete(currentDocId);
                console.log(`🗑️ Empty room ${currentDocId} cleared from memory.`);
            }
        }
    });
});

const PORT = process.env.PORT || 5000;

// Final Binding: '0.0.0.0' allows external devices (mobile/tablets) to connect via your IP
server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Hackathon Sync Engine active on port ${PORT}`);
    console.log(`📡 Accessible on your local network for QR scanning!`);
});