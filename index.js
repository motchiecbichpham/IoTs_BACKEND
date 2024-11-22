const express = require("express");
const cors = require("cors");
const { Server } = require("socket.io");
const { createServer } = require("http");
const solarService = require("./src/services/solarService");

const app = express();
const environmentRoutes = require("./src/routes/environmentRoute");
const houseRoutes = require("./src/routes/houseRoute");

app.use(
  cors({
    origin: "http://localhost:4200",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use("/api/environmental-data", environmentRoutes);
app.use("/api", houseRoutes);

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:4200",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  },
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log("Client connected");
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

setInterval(async () => {

  try {
    const data = await solarService.fetchSolarData();
    await solarService.storeSolarData(data);
  } catch (error) {
    console.log("Error during data fetching and storing process:", error);
  }
}, 10*60 *1000);

app.get("/", (req, res) => {
  res.send("Hello world ");
});

const startServer = async () => {
  try {
    const PORT = 8081;
    httpServer.listen(PORT, () => {
      console.log("Server running at http://localhost:8081/");
    });
  } catch (error) {
    console.error("Server startup error:", error);
    await client.close();
  }
};

startServer();
