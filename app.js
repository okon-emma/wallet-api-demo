const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const mongoose = require("mongoose");
const config = require("config");
const morgan = require("morgan");
const dotenv = require("dotenv");

const app = express();

// Bodyparser Middleware
app.use(express.json());

// Load environment settings
dotenv.config({ path: "./config.env" });

const server = http.createServer(app);
const io = socketio(server).sockets;

// DB Config
const db = config.get("mongoURI");

// Connect to Mongo
mongoose
  .connect(db, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => console.log("MongoDB Connected..."))
  .catch((err) => console.log(err));

// * Dev logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.get("/", (req, res) => res.send('Okay'));
app.use("/auth", require("./routes/api/users"));
app.use("/auth", require("./routes/api/auth"));

//* Websocket *//
require("./middleware/socket")(app, io, db);


// const port = process.env.PORT || 3050;
const port = 3050;
server.listen(port, () => console.log(`Server started on port ${port}`));
