(function () {
  const wsUrlInput = document.getElementById("wsUrl");
  const tokenInput = document.getElementById("token");
  const connectBtn = document.getElementById("connectBtn");
  const disconnectBtn = document.getElementById("disconnectBtn");
  const connStatus = document.getElementById("connStatus");
  const authBtn = document.getElementById("authBtn");
  const authResult = document.getElementById("authResult");
  const joinBtn = document.getElementById("joinBtn");
  const leaveBtn = document.getElementById("leaveBtn");
  const roomIdInput = document.getElementById("roomId");
  const roomEvents = document.getElementById("roomEvents");
  const messageInput = document.getElementById("messageInput");
  const sendBtn = document.getElementById("sendBtn");
  const messagesEl = document.getElementById("messages");
  const logEl = document.getElementById("log");

  let ws = null;
  let isAuthenticated = false;
  let currentRoomId = null;

  function log(...args) {
    const msg = args
      .map((v) => (typeof v === "string" ? v : JSON.stringify(v, null, 2)))
      .join(" ");
    logEl.textContent += `\n${msg}`;
    logEl.scrollTop = logEl.scrollHeight;
  }

  function setConnected(connected) {
    connStatus.textContent = connected ? "Connected" : "Disconnected";
    connectBtn.disabled = connected;
    disconnectBtn.disabled = !connected;
    authBtn.disabled = !connected;
    joinBtn.disabled = !connected || !isAuthenticated;
    leaveBtn.disabled = !connected || !isAuthenticated || !currentRoomId;
    sendBtn.disabled = !connected || !isAuthenticated || !currentRoomId;
  }

  connectBtn.addEventListener("click", () => {
    const url = wsUrlInput.value.trim();
    if (!url) return alert("Enter WS URL");

    try {
      ws = new WebSocket(url);
    } catch (e) {
      alert("Invalid WS URL");
      return;
    }

    ws.addEventListener("open", () => {
      setConnected(true);
      log("🔌 WebSocket opened");
    });

    ws.addEventListener("close", () => {
      setConnected(false);
      isAuthenticated = false;
      currentRoomId = null;
      log("👋 WebSocket closed");
    });

    ws.addEventListener("error", (err) => {
      log("❌ WebSocket error:", err);
    });

    ws.addEventListener("message", (ev) => {
      let data;
      try {
        data = JSON.parse(ev.data);
      } catch {
        log("📦 Raw message:", ev.data);
        return;
      }

      log("📨 Message:", data);

      switch (data.type) {
        case "authenticated": {
          isAuthenticated = true;
          authResult.textContent = JSON.stringify(data, null, 2);
          joinBtn.disabled = false;
          break;
        }
        case "auth_error": {
          isAuthenticated = false;
          authResult.textContent = JSON.stringify(data, null, 2);
          break;
        }
        case "user_joined": {
          roomEvents.textContent += `\nUser joined: ${data.userId}`;
          break;
        }
        case "user_left": {
          roomEvents.textContent += `\nUser left: ${data.userId}`;
          break;
        }
        case "room_history": {
          // Display last messages
          const { messages } = data;
          messagesEl.innerHTML = "";
          (messages || [])
            .slice()
            .reverse()
            .forEach((m) => addMessage(m));
          break;
        }
        case "new_message": {
          addMessage(data.message);
          break;
        }
        case "error": {
          log("⚠️ Error:", data.message);
          break;
        }
        default: {
          log("ℹ️ Unknown type:", data.type);
        }
      }
    });
  });

  disconnectBtn.addEventListener("click", () => {
    if (ws) ws.close();
  });

  authBtn.addEventListener("click", () => {
    if (!ws || ws.readyState !== WebSocket.OPEN) return alert("Not connected");
    const token = tokenInput.value.trim();
    if (!token) return alert("Paste JWT access token");

    send({ type: "authenticate", token });
  });

  joinBtn.addEventListener("click", () => {
    if (!ws || ws.readyState !== WebSocket.OPEN) return alert("Not connected");
    const roomId = roomIdInput.value.trim();
    if (!roomId) return alert("Enter room ID");

    currentRoomId = roomId;
    send({ type: "join_room", roomId });
    sendBtn.disabled = false;
    leaveBtn.disabled = false;
  });

  leaveBtn.addEventListener("click", () => {
    if (!ws || ws.readyState !== WebSocket.OPEN) return alert("Not connected");
    if (!currentRoomId) return alert("Not in a room");

    send({ type: "leave_room", roomId: currentRoomId });
    currentRoomId = null;
    sendBtn.disabled = true;
    leaveBtn.disabled = true;
  });

  sendBtn.addEventListener("click", () => {
    if (!ws || ws.readyState !== WebSocket.OPEN) return alert("Not connected");
    if (!currentRoomId) return alert("Join a room first");
    const content = messageInput.value.trim();
    if (!content) return;

    send({ type: "send_message", roomId: currentRoomId, content });
    messageInput.value = "";
  });

  function send(obj) {
    const str = JSON.stringify(obj);
    ws.send(str);
    log("➡️ Sent:", obj);
  }

  function addMessage(m) {
    const li = document.createElement("li");
    const dt = new Date(m.createdAt || m.created_at || Date.now());
    li.textContent = `[${dt.toLocaleTimeString()}] ${m.userId || m.user_id}: ${
      m.content
    }`;
    messagesEl.appendChild(li);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }
})();
