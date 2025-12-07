import http from 'node:http';

/**
 * SSE Connection Monitor
 * 
 * Demonstrates:
 * - How many connections Node.js can handle
 * - Memory usage per connection
 * - CPU usage with many idle connections
 * - Performance impact of broadcasting
 */

const clients = new Map();
let messagesSent = 0;
let totalConnections = 0;

const server = http.createServer((req, res) => {
    
    if (req.url === '/events') {
        // SSE connection
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
        });

        const clientId = ++totalConnections;
        const connectedAt = Date.now();
        
        clients.set(clientId, {
            res,
            connectedAt,
            messagesSent: 0
        });

        console.log(`✅ Client ${clientId} connected (total: ${clients.size})`);

        // Send welcome message
        res.write(`data: {"id": ${clientId}, "message": "Connected!"}\n\n`);

        // Cleanup on disconnect
        req.on('close', () => {
            clients.delete(clientId);
            const duration = ((Date.now() - connectedAt) / 1000).toFixed(1);
            console.log(`👋 Client ${clientId} disconnected after ${duration}s (remaining: ${clients.size})`);
        });
    }
    
    else if (req.url === '/stats') {
        // Stats endpoint
        const memory = process.memoryUsage();
        const stats = {
            connections: {
                current: clients.size,
                total: totalConnections
            },
            memory: {
                heapUsed: `${(memory.heapUsed / 1024 / 1024).toFixed(2)} MB`,
                heapTotal: `${(memory.heapTotal / 1024 / 1024).toFixed(2)} MB`,
                rss: `${(memory.rss / 1024 / 1024).toFixed(2)} MB`,
                perConnection: clients.size > 0 
                    ? `${((memory.heapUsed / 1024 / 1024) / clients.size).toFixed(2)} MB`
                    : '0 MB'
            },
            messages: {
                total: messagesSent,
                perClient: clients.size > 0 
                    ? (messagesSent / clients.size).toFixed(1)
                    : 0
            },
            uptime: `${(process.uptime() / 60).toFixed(1)} minutes`,
            cpu: process.cpuUsage()
        };
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(stats, null, 2));
    }
    
    else if (req.url === '/broadcast' && req.method === 'POST') {
        // Broadcast to all clients
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            const message = JSON.parse(body);
            const startTime = Date.now();
            
            // Broadcast to all
            clients.forEach((client, id) => {
                client.res.write(`data: ${JSON.stringify(message)}\n\n`);
                client.messagesSent++;
                messagesSent++;
            });
            
            const duration = Date.now() - startTime;
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                sent: clients.size,
                duration: `${duration}ms`,
                messagesPerSecond: clients.size > 0 
                    ? Math.round(clients.size / (duration / 1000))
                    : 0
            }));
        });
    }
    
    else if (req.url === '/') {
        // Demo page
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
<!DOCTYPE html>
<html>
<head>
    <title>SSE Performance Monitor</title>
    <style>
        body {
            font-family: 'Monaco', 'Courier New', monospace;
            max-width: 1200px;
            margin: 20px auto;
            padding: 20px;
            background: #1e1e1e;
            color: #d4d4d4;
        }
        .container {
            background: #252526;
            padding: 20px;
            border-radius: 8px;
            margin: 10px 0;
        }
        h1, h2 { color: #4ec9b0; }
        .metric {
            display: flex;
            justify-content: space-between;
            padding: 8px;
            border-bottom: 1px solid #3e3e42;
        }
        .label { color: #9cdcfe; }
        .value {
            color: #ce9178;
            font-weight: bold;
        }
        button {
            background: #0e639c;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
            margin: 5px;
            font-size: 14px;
        }
        button:hover { background: #1177bb; }
        .controls { margin: 20px 0; }
        #events {
            background: #1e1e1e;
            padding: 10px;
            border-radius: 4px;
            max-height: 300px;
            overflow-y: auto;
            font-size: 12px;
        }
        .event {
            padding: 4px;
            border-left: 2px solid #007acc;
            margin: 2px 0;
            padding-left: 8px;
        }
        .warning { color: #ffa500; }
        .error { color: #f48771; }
        .success { color: #89d185; }
    </style>
</head>
<body>
    <h1>📊 SSE Performance Monitor</h1>
    
    <div class="container">
        <h2>Connection Stats</h2>
        <div class="metric">
            <span class="label">Current Connections:</span>
            <span class="value" id="connections">0</span>
        </div>
        <div class="metric">
            <span class="label">Total Connections:</span>
            <span class="value" id="totalConnections">0</span>
        </div>
        <div class="metric">
            <span class="label">Messages Sent:</span>
            <span class="value" id="messages">0</span>
        </div>
        <div class="metric">
            <span class="label">Avg per Client:</span>
            <span class="value" id="avgMessages">0</span>
        </div>
    </div>

    <div class="container">
        <h2>Memory Usage</h2>
        <div class="metric">
            <span class="label">Heap Used:</span>
            <span class="value" id="heapUsed">0 MB</span>
        </div>
        <div class="metric">
            <span class="label">Heap Total:</span>
            <span class="value" id="heapTotal">0 MB</span>
        </div>
        <div class="metric">
            <span class="label">RSS:</span>
            <span class="value" id="rss">0 MB</span>
        </div>
        <div class="metric">
            <span class="label">Per Connection:</span>
            <span class="value" id="perConnection">0 MB</span>
        </div>
    </div>

    <div class="container">
        <h2>Controls</h2>
        <div class="controls">
            <button onclick="openConnections(1)">+1 Connection</button>
            <button onclick="openConnections(10)">+10 Connections</button>
            <button onclick="openConnections(100)">+100 Connections</button>
            <button onclick="openConnections(1000)">+1000 Connections</button>
            <button onclick="closeAll()">Close All</button>
            <button onclick="broadcast()">Broadcast Message</button>
            <button onclick="startBroadcastTest()">Start Broadcast Test</button>
            <button onclick="stopBroadcastTest()">Stop Broadcast Test</button>
        </div>
    </div>

    <div class="container">
        <h2>Live Events</h2>
        <div id="events"></div>
    </div>

    <script>
        const connections = [];
        let broadcastInterval = null;

        function log(message, type = '') {
            const div = document.createElement('div');
            div.className = 'event ' + type;
            div.textContent = new Date().toLocaleTimeString() + ' - ' + message;
            document.getElementById('events').insertBefore(div, document.getElementById('events').firstChild);
            
            // Keep only last 50 events
            const events = document.getElementById('events');
            while (events.children.length > 50) {
                events.removeChild(events.lastChild);
            }
        }

        async function openConnections(count) {
            log(\`Opening \${count} connections...\`, 'success');
            
            for (let i = 0; i < count; i++) {
                const es = new EventSource('/events');
                connections.push(es);
                
                es.onmessage = (event) => {
                    const data = JSON.parse(event.data);
                    if (data.id) {
                        log(\`Client \${data.id} connected\`, 'success');
                    }
                };
                
                es.onerror = () => {
                    log('Connection error', 'error');
                };
                
                // Stagger connections slightly
                if (i % 10 === 0) {
                    await new Promise(r => setTimeout(r, 10));
                }
            }
            
            updateStats();
        }

        function closeAll() {
            connections.forEach(es => es.close());
            connections.length = 0;
            log(\`Closed all connections\`, 'warning');
            updateStats();
        }

        async function broadcast() {
            const startTime = performance.now();
            
            const response = await fetch('/broadcast', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: 'Test broadcast',
                    timestamp: new Date().toISOString()
                })
            });
            
            const result = await response.json();
            const duration = (performance.now() - startTime).toFixed(2);
            
            log(\`Broadcast to \${result.sent} clients in \${result.duration} (client-side: \${duration}ms)\`, 'success');
        }

        function startBroadcastTest() {
            if (broadcastInterval) return;
            
            log('Starting continuous broadcast (1/second)...', 'warning');
            broadcastInterval = setInterval(broadcast, 1000);
        }

        function stopBroadcastTest() {
            if (broadcastInterval) {
                clearInterval(broadcastInterval);
                broadcastInterval = null;
                log('Stopped continuous broadcast', 'success');
            }
        }

        async function updateStats() {
            const response = await fetch('/stats');
            const stats = await response.json();
            
            document.getElementById('connections').textContent = stats.connections.current;
            document.getElementById('totalConnections').textContent = stats.connections.total;
            document.getElementById('messages').textContent = stats.messages.total;
            document.getElementById('avgMessages').textContent = stats.messages.perClient;
            
            document.getElementById('heapUsed').textContent = stats.memory.heapUsed;
            document.getElementById('heapTotal').textContent = stats.memory.heapTotal;
            document.getElementById('rss').textContent = stats.memory.rss;
            document.getElementById('perConnection').textContent = stats.memory.perConnection;
        }

        // Update stats every 2 seconds
        setInterval(updateStats, 2000);
        updateStats();

        log('Performance monitor ready', 'success');
        log('Open multiple connections and watch memory usage', 'success');
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

server.listen(3001, () => {
    console.log(`
╔════════════════════════════════════════════════════════╗
║     SSE Performance Monitor Running                    ║
╠════════════════════════════════════════════════════════╣
║                                                        ║
║  📊 Open: http://localhost:3001                        ║
║                                                        ║
║  Test the impact of keeping connections open:         ║
║  • Open 1, 10, 100, or 1000 connections               ║
║  • Watch memory usage per connection                  ║
║  • Test broadcast performance                         ║
║  • See CPU impact with continuous broadcasting        ║
║                                                        ║
║  Stats API: http://localhost:3001/stats               ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
    `);
});

// Monitor resource usage
setInterval(() => {
    const mem = process.memoryUsage();
    console.log(`
📊 Stats:
   Connections: ${clients.size}
   Memory (Heap): ${(mem.heapUsed / 1024 / 1024).toFixed(2)} MB
   Memory (RSS): ${(mem.rss / 1024 / 1024).toFixed(2)} MB
   Per Connection: ${clients.size > 0 ? ((mem.heapUsed / 1024 / 1024) / clients.size).toFixed(3) : 0} MB
   Messages Sent: ${messagesSent}
    `);
}, 30000); // Every 30 seconds
