const http = require("http");
const express = require('express');
const app = express();
const houseRoutes = require('./src/api/house.route')

app.use(express.json());
app.use('/api/houses',houseRoutes );


app.get('/', (req, res) => {
  res.send("Hello world ")
})

const startServer = async () => {
  try {
    const PORT = 8132;
    app.listen(PORT, () => {
      console.log("Server running at http://localhost:8132/");
    });

  } catch (error) {
    console.error('Server startup error:', error);
    await client.close();
  }
};

startServer();
