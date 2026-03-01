import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from 'dotenv';
import { getDatabase } from './server/db';
import { getStorage } from './server/storage';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer);
  const PORT = process.env.PORT || 3000;

  // Initialize DB and Storage
  const db = getDatabase();
  const storage = getStorage();

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // --- API Routes ---

  app.post("/api/upload", async (req, res) => {
    try {
      const { name, type, data } = req.body;
      const result = await storage.uploadFile(name, type, data);
      res.json(result);
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: "Upload failed" });
    }
  });

  app.get("/api/files/:fileId", async (req, res) => {
    try {
      const file = await storage.getFile(req.params.fileId);
      if (file) {
        res.setHeader('Content-Type', file.type);
        res.send(file.data);
      } else {
        res.status(404).send("File not found");
      }
    } catch (error) {
      console.error("File retrieval error:", error);
      res.status(500).send("Error retrieving file");
    }
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/groups", async (req, res) => {
    try {
      const groups = await db.getGroups();
      // Convert object to array if needed, or just return values
      const groupsArray = Object.values(groups);
      res.json(groupsArray);
    } catch (error) {
      console.error("Error fetching groups:", error);
      res.status(500).json({ error: "Failed to fetch groups" });
    }
  });

  // --- Socket.IO Logic ---

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join_group", async (groupId) => {
      socket.join(groupId);
      console.log(`User ${socket.id} joined group ${groupId}`);
      
      // Send history
      const history = await db.getMessages(groupId);
      socket.emit("history", history);
    });

    socket.on("leave_group", (groupId) => {
      socket.leave(groupId);
      console.log(`User ${socket.id} left group ${groupId}`);
    });

    socket.on("send_message", async (data) => {
      const { groupId, message } = data;
      
      await db.saveMessage(groupId, message);
      
      // Broadcast to everyone in the room including sender (for simplicity)
      io.to(groupId).emit("receive_message", message);
    });

    socket.on("create_group", async (group) => {
      await db.saveGroup(group);
      io.emit("group_created", group); // Broadcast to all connected clients
    });

    socket.on("join_group_member", async (data) => {
        const { groupId, userId } = data;
        const groups = await db.getGroups();
        const group = groups[groupId];
        
        if (group && !group.members.includes(userId)) {
            group.members.push(userId);
            await db.saveGroup(group);
            io.emit("group_updated", group); // Broadcast update to everyone
        }
    });

    socket.on("update_poll", async (data) => {
        const { groupId, messageId, optionId, userId } = data;
        
        // Fetch current message state (this is a bit inefficient, ideally we'd just update the vote)
        // But for this abstraction, we'll fetch, update, save.
        const messages = await db.getMessages(groupId);
        const message = messages.find((m: any) => m.id === messageId);
        
        if (message && message.pollData) {
            // Update votes
            message.pollData.votes = {
                ...message.pollData.votes,
                [userId]: optionId
            };
            
            await db.updatePoll(groupId, messageId, message);
            io.to(groupId).emit("poll_updated", message);
        }
    });
    
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  // --- Vite / Static Files ---

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.join(__dirname, "dist")));
    app.get(/^(?!\/api).+/, (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => { // Keep 0.0.0.0 for container compatibility
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

