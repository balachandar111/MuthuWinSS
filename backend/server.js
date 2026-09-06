require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const complaintRoutes = require("./routes/complaintRoutes");
const voiceRoutes = require("./routes/voiceRoutes");

const app = express();

connectDB();

// Explicit origins from env (comma separated), e.g.
// CLIENT_ORIGIN=http://localhost:5173,https://your-production-domain.com
const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

const isDev = (process.env.NODE_ENV || "development") !== "production";

// Matches http://localhost:PORT or http://127.0.0.1:PORT for any port.
// This is what actually fixes the bug you hit: Vite silently moved from
// 5173 -> 5174 because 5173 was already taken, and the old config only
// ever allowed the exact string "http://localhost:5173".
const localhostRegex = /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/;

// Vercel gives every branch/PR its own preview URL
// (e.g. muthu-win-ss-git-feature-x-yourname.vercel.app), which won't match
// a fixed CLIENT_ORIGIN string. This allows any preview build of THIS
// project specifically (prefix "muthu-win-ss") without opening CORS up to
// unrelated *.vercel.app apps.
const vercelPreviewRegex = /^https:\/\/muthu-win-ss[a-z0-9-]*\.vercel\.app$/;

app.use(
  cors({
    origin(origin, callback) {
      // requests with no origin (curl, server-to-server, mobile apps, Postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) return callback(null, true);

      if (isDev && localhostRegex.test(origin)) return callback(null, true);

      if (vercelPreviewRegex.test(origin)) return callback(null, true);

      console.warn(`Blocked by CORS: ${origin}`);
      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
  })
);
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "muthu-winss-chatbot-backend" });
});

app.use("/api/complaints", complaintRoutes);
app.use("/api/voice", voiceRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(
    `CORS: allowing [${allowedOrigins.join(", ")}]${
      isDev ? " + any localhost/127.0.0.1 origin (dev mode)" : ""
    }`
  );
});