import http from 'node:http';

/**
 * Simple SSE Demo Server
 * 
 * Demonstrates various SSE features:
 * - Basic messages
 * - Named events
 * - Event IDs
 * - Multi-line messages
 * - Keep-alive comments
 */

const PORT = 3001;

// Track connected clients
const clients = new Set();

// Create server
const server = http.createServer((req, res) => {
    
    // SSE endpoint
    if (req.url === '/events') {
        console.log('📡 New SSE connection');
        
        // Set SSE headers
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*'
        });

        // Add client to set
        clients.add(res);

        // Check if resuming
        const lastEventId = req.headers['last-event-id'];
        if (lastEventId) {
            res.write(`data: Resuming from event ${lastEventId}\n\n`);
        }

        // Send welcome message
        res.write(`data: {"type": "welcome", "message": "Connected to SSE demo!", "clients": ${clients.size}}\n\n`);

        // Send counter updates every second
        let count = parseInt(lastEventId) || 0;
        const interval = setInterval(() => {
            count++;
            
            // Send with event ID (enables resume!)
            res.write(`id: ${count}\n`);
            res.write(`data: {"type": "counter", "count": ${count}, "timestamp": "${new Date().toISOString()}"}\n\n`);
            
            // Stop after 20 events
            if (count >= 20) {
                res.write('event: complete\n');
                res.write('data: {"message": "Demo complete!"}\n\n');
                clearInterval(interval);
                res.end();
                clients.delete(res);
            }
        }, 1000);

        // Send keep-alive comments every 15 seconds
        const keepAlive = setInterval(() => {
            res.write(': keep-alive\n\n');
        }, 15000);

        // Clean up on disconnect
        req.on('close', () => {
            console.log('👋 Client disconnected');
            clearInterval(interval);
            clearInterval(keepAlive);
            clients.delete(res);
        });
    }
    
    // Broadcast endpoint - sends message to all connected clients
    else if (req.url === '/broadcast' && req.method === 'POST') {
        let body = '';
        
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', () => {
            const message = JSON.parse(body);
            
            // Broadcast to all clients
            console.log(`📢 Broadcasting to ${clients.size} clients:`, message);
            clients.forEach(client => {
                client.write(`event: broadcast\n`);
                client.write(`data: ${JSON.stringify(message)}\n\n`);
            });
            
            res.writeHead(200);
            res.end(JSON.stringify({ sent: clients.size }));
        });
    }
    
    // Demo page
    else if (req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
<!DOCTYPE html>
<html>
<head>
    <title>SSE Demo</title>
    <style>
        body {
            font-family: system-ui, -apple-system, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 { color: #333; }
        .status {
            padding: 10px;
            border-radius: 5px;
            margin: 10px 0;
            font-weight: bold;
        }
        .connected { background: #d4edda; color: #155724; }
        .disconnected { background: #f8d7da; color: #721c24; }
        .event {
            background: #e7f3ff;
            padding: 10px;
            margin: 5px 0;
            border-left: 3px solid #0066cc;
            border-radius: 3px;
            font-family: monospace;
            font-size: 14px;
        }
        .broadcast {
            background: #fff3cd;
            border-left-color: #ffc107;
        }
        button {
            background: #0066cc;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            margin: 5px;
        }
        button:hover { background: #0052a3; }
        .controls {
            margin: 20px 0;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 5px;
        }
        #events {
            max-height: 400px;
            overflow-y: auto;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎯 Server-Sent Events Demo</h1>
        
        <div id="status" class="status disconnected">
            ❌ Disconnected
        </div>

        <div class="controls">
            <button onclick="connect()">Connect</button>
            <button onclick="disconnect()">Disconnect</button>
            <button onclick="sendBroadcast()">Send Broadcast Message</button>
            <button onclick="clearEvents()">Clear Events</button>
        </div>

        <h3>Events:</h3>
        <div id="events"></div>
    </div>

    <script>
        let eventSource = null;
        
        function connect() {
            if (eventSource) {
                eventSource.close();
            }
            
            eventSource = new EventSource('/events');
            
            eventSource.onopen = () => {
                document.getElementById('status').className = 'status connected';
                document.getElementById('status').textContent = '✅ Connected';
                addEvent('System', 'Connection opened', 'connected');
            };
            
            eventSource.onmessage = (event) => {
                const data = JSON.parse(event.data);
                addEvent('Message', JSON.stringify(data, null, 2), 'message');
            };
            
            eventSource.addEventListener('complete', (event) => {
                const data = JSON.parse(event.data);
                addEvent('Complete', data.message, 'complete');
                disconnect();
            });
            
            eventSource.addEventListener('broadcast', (event) => {
                const data = JSON.parse(event.data);
                addEvent('Broadcast', JSON.stringify(data, null, 2), 'broadcast');
            });
            
            eventSource.onerror = () => {
                document.getElementById('status').className = 'status disconnected';
                document.getElementById('status').textContent = '⚠️ Error (will retry...)';
                addEvent('System', 'Connection error, retrying...', 'error');
            };
        }
        
        function disconnect() {
            if (eventSource) {
                eventSource.close();
                eventSource = null;
                document.getElementById('status').className = 'status disconnected';
                document.getElementById('status').textContent = '❌ Disconnected';
                addEvent('System', 'Connection closed', 'disconnected');
            }
        }
        
        function addEvent(type, message, className) {
            const events = document.getElementById('events');
            const div = document.createElement('div');
            div.className = 'event ' + (className || '');
            
            const time = new Date().toLocaleTimeString();
            div.innerHTML = \`<strong>[\${time}] \${type}:</strong><br><pre style="margin: 5px 0;">\${message}</pre>\`;
            
            events.insertBefore(div, events.firstChild);
            
            // Keep only last 20 events
            while (events.children.length > 20) {
                events.removeChild(events.lastChild);
            }
        }
        
        function clearEvents() {
            document.getElementById('events').innerHTML = '';
        }
        
        async function sendBroadcast() {
            const message = {
                text: 'Hello from broadcast!',
                timestamp: new Date().toISOString(),
                sender: 'Demo Client'
            };
            
            try {
                const response = await fetch('/broadcast', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(message)
                });
                
                const result = await response.json();
                addEvent('System', \`Broadcast sent to \${result.sent} clients\`, 'info');
            } catch (error) {
                addEvent('System', 'Broadcast failed: ' + error.message, 'error');
            }
        }
        
        // Auto-connect on load
        connect();
    </script>
</body>
</html>
        `);
    }
    
    else {
        res.writeHead(404);
        res.end('Not Found');
    }
});

server.listen(PORT, () => {
    console.log(`
🚀 SSE Demo Server running!

📖 Open in browser: http://localhost:${PORT}

Features:
  • Real-time counter updates
  • Event IDs for resume support
  • Broadcast to all connected clients
  • Auto-reconnection on disconnect
  • Keep-alive heartbeat

Press Ctrl+C to stop
    `);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\\n👋 Shutting down...');
    
    // Notify all clients
    clients.forEach(client => {
        client.write('data: {"type": "shutdown", "message": "Server shutting down"}\n\n');
        client.end();
    });
    
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});
