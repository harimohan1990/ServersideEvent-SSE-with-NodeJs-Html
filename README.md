# Server-Sent Events (SSE) with Node.js and HTML

This is a simple example of using **Server-Sent Events (SSE)** with:

- A **Node.js** server (Express)
- A plain **HTML** page using the `EventSource` API
- **CORS** enabled so you can open the HTML file from a different origin (e.g. `127.0.0.1:5500`) and connect to `http://localhost:3000/events`.

---

## 1. Project Structure

```text
sse-demo/
├─ server.js        # Node.js server (SSE endpoint)
├─ index.html       # Frontend HTML client
└─ README.md        # This file

Here is a **fully expanded, highly detailed SSE README** — production-ready, interview-ready, and beginner-friendly.
Includes **architecture, flow diagram, headers explanation, reconnect rules, CORS**, and **advanced tips**.

---

# 📌 Server-Sent Events (SSE) – Complete Guide (Node.js + HTML)

Server-Sent Events (SSE) allow your **server to push real-time updates** to your browser using a **one-way streaming connection** over HTTP.

This README explains:

* What SSE is
* How SSE works (detailed lifecycle)
* Required headers
* Auto-reconnect behavior
* CORS handling
* Browser EventSource API
* Node.js implementation
* Full HTML client
* Common errors & fixes
* Production tips

---

# 🔥 1. What is SSE?

SSE (Server-Sent Events) is a **unidirectional real-time communication** mechanism:

* **Server → Client only**
* Client opens a connection
* Server keeps it open and streams messages
* Client automatically reconnects if the connection breaks

SSE uses:

* Standard **HTTP**
* Simple **text/event-stream**
* Browser built-in **EventSource** API (no library required)

It is ideal for:

* Live dashboards
* Notifications
* Job progress updates
* Stock/crypto price updates
* Real-time logs

---

# ⚙️ 2. How SSE Works (Lifecycle)

```
Client → GET /events (HTTP request)
Server → Response headers:
         Content-Type: text/event-stream
         Connection: keep-alive
         Cache-Control: no-cache

SERVER HOLDS THE CONNECTION OPEN

Server → "data: {...}\n\n" (send event)
Server → "data: {...}\n\n" (send event)
Server → "data: {...}\n\n" (send event)

If connection breaks:
Browser → Automatically reconnect after ~3s
```

---

# 🧩 3. Event Format (Very Important)

Each SSE message must follow these rules:

```
data: <string or JSON>
<blank line>
```

Example:

```
data: { "message": "Hello", "time": "2024-02-01T10:30:00Z" }

```

If you miss the blank line: **browser will not receive the message**.

---

# 🏗️ 4. Node.js SSE Server (Highly Detailed)

Create `server.js`:

```js
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(
  cors({
    origin: "http://127.0.0.1:5500",
    methods: "GET",
  })
);

app.get("/events", (req, res) => {
  console.log("Client connected");

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();  // ensures headers are sent immediately

  // Optional but good for debugging
  res.write(`data: ${JSON.stringify({ message: "SSE Connected" })}\n\n`);

  const intervalId = setInterval(() => {
    const eventData = {
      message: "Ping from server",
      time: new Date().toISOString(),
    };
    res.write(`data: ${JSON.stringify(eventData)}\n\n`);
  }, 2000);

  req.on("close", () => {
    console.log("Client disconnected");
    clearInterval(intervalId);
    res.end();
  });
});

app.listen(PORT, () => {
  console.log("SSE server running at http://localhost:" + PORT);
});
```

---

# 🌐 5. HTML Client (EventSource API Explained)

Create `index.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>SSE Client</title>
</head>
<body>
  <h1>SSE Demo</h1>
  <p>Status: <span id="status">Connecting...</span></p>
  <div id="messages"></div>

  <script>
    const statusEl = document.getElementById("status");
    const messagesEl = document.getElementById("messages");

    const eventSource = new EventSource("http://localhost:3000/events");

    eventSource.onopen = () => {
      statusEl.textContent = "Connected";
    };

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const div = document.createElement("div");
      div.innerHTML = `<strong>${data.time}</strong>: ${data.message}`;
      messagesEl.appendChild(div);
    };

    eventSource.onerror = () => {
      statusEl.textContent = "Disconnected / Reconnecting...";
    };
  </script>
</body>
</html>
```

---

# 🌐 6. CORS – Why SSE Needs It?

If you open HTML from:

```
http://127.0.0.1:5500
```

And your server runs at:

```
http://localhost:3000
```

You will see:

❌ `No 'Access-Control-Allow-Origin' header`

Because SSE is **HTTP streaming**, not a normal fetch.
So Node must reply with:

```js
app.use(cors({ origin: "http://127.0.0.1:5500" }));
```

Additionally, inside SSE response:

```js
res.setHeader("Access-Control-Allow-Origin", "http://127.0.0.1:5500");
```

---

# 🔄 7. Auto-Reconnect Behavior (Important)

Browsers automatically reconnect when:

* Network failure
* Server restart
* Internet disconnected

Default: reconnect every **3 seconds**.

You can override:

```
retry: 1000
```

Example:

```
retry: 1000
data: Hello
```

---

# 🗂️ 8. Event Types (Custom Channels)

You can send custom events:

Server:

```js
res.write("event: notification\n");
res.write("data: New user joined!\n\n");
```

Client:

```js
eventSource.addEventListener("notification", (event) => {
  console.log("Notification:", event.data);
});
```

---

# 🎯 9. Keep-Alive / Heartbeats

To prevent timeouts on proxies or firewalls:

```js
setInterval(() => {
  res.write("data: heartbeat\n\n");
}, 15000);
```

---

# 🧱 10. Architecture Diagram

```
 ┌────────────┐
 │  Browser   │
 │ EventSource│
 └─────┬──────┘
       │
       │ HTTP GET /events
       ▼
 ┌─────────────┐
 │   Node.js   │
 │   SSE API   │
 └─────┬───────┘
       │
       │ data: {...}\n\n (stream)
       ▼
 ┌────────────┐
 │   Browser  │
 │  onmessage │
 └────────────┘
```

---

# 🐞 11. Common Errors & Fixes

### ❌ “No Access-Control-Allow-Origin”

Enable:

```js
app.use(cors({ origin: "http://127.0.0.1:5500" }));
```

---

### ❌ "EventSource failed: Connection.closed"

Server is not sending keep-alive → send heartbeat.

---

### ❌ HTML file opened as `file:///`

EventSource cannot connect due to Origin = "null".
Use VS Code Live Server.

---

### ❌ Missing blank line causing message not received

Must be:

```
data: {...}\n\n
```

---

# 🚀 12. When to Use SSE (vs WebSockets)

| Feature         | SSE                    | WebSockets        |
| --------------- | ---------------------- | ----------------- |
| Direction       | 🔽 Server → Client     | 🔁 Two-way        |
| Protocol        | HTTP                   | WS                |
| Auto reconnect  | ✔ Yes                  | ❌ No (manual)     |
| Browser support | ✔ Built-in             | ✔ Requires WS API |
| Best for        | Notifications, updates | Chats, games      |

---

# 🛡️ 13. Production Tips

✔ Add **heartbeat**
✔ Use **compression off** (SSE breaks with gzip)
✔ Use **NGINX proxy buffering off**
✔ Limit long SSE connections
✔ Use **event IDs** for replay after reconnect
✔ Use **retry** to adjust reconnect interval


