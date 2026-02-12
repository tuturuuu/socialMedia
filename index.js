require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const { createServer } = require("node:http");
const { Server } = require("socket.io");
const app = express();
const server = createServer(app);
const io = require("./socket")(server); // Import socket logic
const {v4: uuidv4} = require('uuid')

const path = require('path');

const userRoutes = require("./routes/users");
const postRoutes = require("./routes/posts");
const roomRoutes = require("./routes/rooms");

// Middleware
app.use(express.json());

// Routes
app.use('/api/user', userRoutes);
app.use('/api/post', postRoutes);
app.use('/api/room', roomRoutes);


// Start the server
const PORT = process.env.PORT;
server.listen(PORT, () => {
  console.log("server running at http://localhost:" + PORT);
});

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("Error connecting to MongoDB:", error));

//Serve static file
app.use(express.static(path.join(__dirname, 'dist')));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});
