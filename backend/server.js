require("dotenv").config();
const express = require("express");
const http = require("http");
const app = express();
const cors = require("cors");
const connectDB = require("./config/db");
const authRoute = require("./routes/authRoute");
const userRoute = require("./routes/userRoute");
const chatRoute = require("./routes/chatRoute");
const messageRoute = require("./routes/messageRoute");
const initSocket = require("./sockets/socket");

const PORT = process.env.PORT || 5000;
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.use("/api/auth", authRoute);
app.use("/api/user", userRoute);
app.use("/api/chat", chatRoute);
app.use("/api/message", messageRoute);

const startServer = async () => {
  try {
    await connectDB();
    const httpServer = http.createServer(app);
    const io = initSocket(httpServer);
    app.set("io", io)

    httpServer.listen(PORT, () => {
      console.log(`Chat Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Error starting server:", error.message);
    process.exit(1);
  }
};
startServer();
