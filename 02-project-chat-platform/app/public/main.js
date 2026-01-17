(function () {
  const API_URL = window.location.origin;
  const WS_URL = `ws://${window.location.hostname}:3001`;

  // State
  let accessToken = null;
  let currentUser = null;
  let ws = null;
  let rooms = [];
  let currentRoomId = null;
  let reconnectTimeout = null;

  // DOM Elements
  const authScreen = document.getElementById("authScreen");
  const chatScreen = document.getElementById("chatScreen");
  const loginTab = document.getElementById("loginTab");
  const registerTab = document.getElementById("registerTab");
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const loginError = document.getElementById("loginError");
  const registerError = document.getElementById("registerError");
  const roomList = document.getElementById("roomList");
  const messagesContainer = document.getElementById("messagesContainer");
  const messageInput = document.getElementById("messageInput");
  const sendBtn = document.getElementById("sendBtn");
  const currentRoomName = document.getElementById("currentRoomName");
  const connectionStatus = document.getElementById("connectionStatus");
  const userInfo = document.getElementById("userInfo");
  const logoutBtn = document.getElementById("logoutBtn");
  const createRoomBtn = document.getElementById("createRoomBtn");
  const createRoomModal = document.getElementById("createRoomModal");
  const newRoomName = document.getElementById("newRoomName");
  const cancelRoomBtn = document.getElementById("cancelRoomBtn");
  const confirmRoomBtn = document.getElementById("confirmRoomBtn");

  // API Helper with auto-refresh on 401
  async function apiCall(endpoint, options = {}) {
    const url = `${API_URL}${endpoint}`;
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (accessToken && !options.skipAuth) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: "include", // Send cookies
      });

      // Handle 401 - try to refresh token
      if (response.status === 401 && !options.skipRetry) {
        console.log("Access token expired, refreshing...");
        const refreshed = await refreshAccessToken();
        if (refreshed) {
          // Retry the original request with new token
          return apiCall(endpoint, { ...options, skipRetry: true });
        } else {
          // Refresh failed, logout
          handleLogout();
          throw new Error("Session expired");
        }
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Request failed");
      }

      return await response.json();
    } catch (error) {
      console.error("API call failed:", error);
      throw error;
    }
  }

  async function refreshAccessToken() {
    try {
      const response = await fetch(`${API_URL}/api/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        accessToken = data.accessToken;
        return true;
      }
      return false;
    } catch (error) {
      console.error("Token refresh failed:", error);
      return false;
    }
  }

  // Auth Tab Switching
  loginTab.addEventListener("click", () => {
    loginTab.classList.add("active");
    registerTab.classList.remove("active");
    loginForm.classList.remove("hidden");
    registerForm.classList.add("hidden");
    loginError.textContent = "";
    registerError.textContent = "";
  });

  registerTab.addEventListener("click", () => {
    registerTab.classList.add("active");
    loginTab.classList.remove("active");
    registerForm.classList.remove("hidden");
    loginForm.classList.add("hidden");
    loginError.textContent = "";
    registerError.textContent = "";
  });

  // Login
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    loginError.textContent = "";

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    try {
      const data = await apiCall("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
        skipAuth: true,
      });

      accessToken = data.accessToken;
      currentUser = data.user;
      showChatScreen();
    } catch (error) {
      loginError.textContent = error.message;
    }
  });

  // Register
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    registerError.textContent = "";

    const email = document.getElementById("registerEmail").value;
    const username = document.getElementById("registerUsername").value;
    const display_name = document.getElementById("registerDisplayName").value;
    const password = document.getElementById("registerPassword").value;

    try {
      const data = await apiCall("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, username, display_name, password }),
        skipAuth: true,
      });

      accessToken = data.accessToken;
      currentUser = data.user;
      showChatScreen();
    } catch (error) {
      registerError.textContent = error.message;
    }
  });

  // Logout
  logoutBtn.addEventListener("click", async () => {
    await apiCall("/api/auth/logout", { method: "POST" });
    handleLogout();
  });

  function handleLogout() {
    accessToken = null;
    currentUser = null;
    currentRoomId = null;
    rooms = [];
    if (ws) {
      ws.close();
      ws = null;
    }
    authScreen.classList.remove("hidden");
    chatScreen.classList.add("hidden");
    loginForm.reset();
    registerForm.reset();
  }

  // Show Chat Screen
  async function showChatScreen() {
    authScreen.classList.add("hidden");
    chatScreen.classList.remove("hidden");
    userInfo.textContent = `${
      currentUser.display_name || currentUser.username
    } (${currentUser.email})`;

    await loadRooms();
    connectWebSocket();
  }

  // Load Rooms
  async function loadRooms() {
    try {
      const data = await apiCall("/api/rooms");
      rooms = data.rooms;
      renderRooms();
    } catch (error) {
      console.error("Failed to load rooms:", error);
    }
  }

  // Render Rooms
  function renderRooms() {
    roomList.innerHTML = "";
    rooms.forEach((room) => {
      const item = document.createElement("div");
      item.className = "room-item";
      if (room.id === currentRoomId) {
        item.classList.add("active");
      }
      item.innerHTML = `
        <div class="room-item-icon">#</div>
        <div class="room-item-name">${room.name}</div>
      `;
      item.addEventListener("click", () => joinRoom(room));
      roomList.appendChild(item);
    });
  }

  // Create Room
  createRoomBtn.addEventListener("click", () => {
    createRoomModal.classList.remove("hidden");
    newRoomName.value = "";
    newRoomName.focus();
  });

  cancelRoomBtn.addEventListener("click", () => {
    createRoomModal.classList.add("hidden");
  });

  confirmRoomBtn.addEventListener("click", async () => {
    const name = newRoomName.value.trim();
    if (!name) return;

    try {
      const data = await apiCall("/api/rooms", {
        method: "POST",
        body: JSON.stringify({ name }),
      });

      rooms.push(data.room);
      renderRooms();
      createRoomModal.classList.add("hidden");
    } catch (error) {
      alert("Failed to create room: " + error.message);
    }
  });

  // WebSocket Connection
  function connectWebSocket() {
    if (ws && ws.readyState === WebSocket.OPEN) return;

    ws = new WebSocket(WS_URL);

    ws.addEventListener("open", () => {
      console.log("WebSocket connected");
      updateConnectionStatus(true);

      // Authenticate
      send({ type: "authenticate", token: accessToken });

      // Rejoin current room if any
      if (currentRoomId) {
        send({ type: "join_room", roomId: currentRoomId });
      }
    });

    ws.addEventListener("close", () => {
      console.log("WebSocket disconnected");
      updateConnectionStatus(false);

      // Auto-reconnect after 3 seconds
      if (accessToken) {
        reconnectTimeout = setTimeout(() => {
          console.log("Reconnecting...");
          connectWebSocket();
        }, 3000);
      }
    });

    ws.addEventListener("error", (error) => {
      console.error("WebSocket error:", error);
    });

    ws.addEventListener("message", (event) => {
      try {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
      } catch (error) {
        console.error("Failed to parse message:", error);
      }
    });
  }

  function handleWebSocketMessage(data) {
    console.log("WS message:", data);

    switch (data.type) {
      case "authenticated":
        console.log("Authenticated:", data.userId);
        break;

      case "auth_error":
        console.error("Auth error:", data.message);
        break;

      case "room_history":
        renderMessages(data.messages || []);
        break;

      case "new_message":
        addMessage(data.message);
        break;

      case "user_joined":
        console.log("User joined:", data.userId);
        break;

      case "user_left":
        console.log("User left:", data.userId);
        break;

      case "error":
        console.error("Server error:", data.message);
        break;

      default:
        console.warn("Unknown message type:", data.type);
    }
  }

  function send(message) {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  function updateConnectionStatus(connected) {
    if (connected) {
      connectionStatus.textContent = "● Connected";
      connectionStatus.className = "status connected";
    } else {
      connectionStatus.textContent = "● Disconnected";
      connectionStatus.className = "status disconnected";
    }
  }

  // Join Room
  function joinRoom(room) {
    if (currentRoomId === room.id) return;

    // Leave previous room
    if (currentRoomId) {
      send({ type: "leave_room", roomId: currentRoomId });
    }

    currentRoomId = room.id;
    currentRoomName.textContent = room.name;
    messageInput.disabled = false;
    sendBtn.disabled = false;
    messagesContainer.innerHTML = ""; // Clear messages

    // Selected room locally (do not send join_room WS message on click)
    // Fetch room history via REST
    (async () => {
      try {
        const data = await apiCall(`/api/rooms/${room.id}/messages`);
        renderMessages(data.messages || []);
      } catch (error) {
        console.error("Failed to load room messages:", error);
      }
    })();

    renderRooms();
  }

  // Render Messages
  function renderMessages(messages) {
    messagesContainer.innerHTML = "";
    // Messages come in reverse order from DB (newest first), reverse for display
    const sorted = [...messages].reverse();
    sorted.forEach((msg) => addMessage(msg));
  }

  function addMessage(msg) {
    const messageDiv = document.createElement("div");
    messageDiv.className = "message";

    const isOwn =
      msg.userId === currentUser.id || msg.user_id === currentUser.id;
    if (isOwn) {
      messageDiv.classList.add("own");
    }

    const time = new Date(msg.createdAt || msg.created_at).toLocaleTimeString(
      [],
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );

    messageDiv.innerHTML = `
      <div class="message-header">
        <span class="message-username">${
          msg.user_display_name || msg.username
        }</span>
        <span class="message-time">${time}</span>
      </div>
      <div class="message-content">${escapeHtml(msg.content)}</div>
    `;

    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  // Send Message
  sendBtn.addEventListener("click", sendMessage);
  messageInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  function sendMessage() {
    const content = messageInput.value.trim();
    if (!content || !currentRoomId) return;

    send({
      type: "send_message",
      roomId: currentRoomId,
      content,
    });

    messageInput.value = "";
  }

  // Initialize: Check if already logged in (refresh token exists)
  (async function init() {
    try {
      // Always refresh on page load to get a new access token
      // (Access tokens are stored in memory and lost on page refresh)
      const refreshed = await refreshAccessToken();

      if (refreshed) {
        // Get current user info from server
        const data = await apiCall("/api/auth/me");
        currentUser = data.user;
        showChatScreen();
      }
      // If refresh failed, user sees login screen (default state)
    } catch (error) {
      console.error("Failed to restore session:", error);
      // Silently fail - user will see login screen
    }
  })();
})();
