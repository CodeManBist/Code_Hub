const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const http = require("http");
const { Server } = require("socket.io");

dotenv.config();

const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");

const { initRepo } = require("./controllers/init");
const { statusRepo } = require("./controllers/status");
const { addRepo } = require("./controllers/add");
const { commitRepo } = require("./controllers/commit");
const { pushRepo } = require("./controllers/push");
const { pullRepo } = require("./controllers/pull");
const { revertRepo } = require("./controllers/revert");
const console = require("console");

yargs(hideBin(process.argv))

.command("start", "Starts a new server", {}, startServer)

.command("init", "Initialize a new repository", {}, initRepo)

.command("status", "Check repository status", {}, statusRepo)

.command(
  "add <file>",
  "Add a file to repository",
  (yargs) => {
    yargs.positional("file", {
      describe: "File to add",
      type: "string",
    });
  },
  (argv) => {
    addRepo(argv.file);
  }
)

.command(
  "commit <message>",
  "Commit staged changes",
  (yargs) => {
    yargs.positional("message", {
      describe: "Commit message",
      type: "string",
    });
  },
  (argv) => {
    commitRepo(argv.message);
  }
)

.command("push", "Push commits to remote", {}, pushRepo)

.command("pull", "Pull latest changes", {}, pullRepo)

.command(
  "revert <commitId>", 
  "Revert last commit", 
  (yargs) => {
    yargs.positional("commitId",   {
      describe: "Commit ID to revert to",
      type: "string",
    });
  }, 
  (argv) => {
    revertRepo(argv.commitId);
  }
)

.demandCommand(1, "You need at least one command")
.help()
.parse();

function startServer() {
  const app = express();
  const port = process.env.PORT || 3000;

  app.use(bodyParser.json());
  app.use(express.json());

  const mongoURI = process.env.MONGODB_URI;

  mongoose.connect(mongoURI)
    .then(() => {
      console.log("Connected to MongoDB");
    })
    .catch((err) => {
      console.error("Error connecting to MongoDB:", err);
    })

  app.use(cors({ origin: "*" }));

  app.get("/", (req, res) => {
    res.send("Welcome to the Git API");
  })

  let user = "test";

  const httpServer = http.createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    socket.on("joinRoom", (userId) => {
      user = userId;
      console.log("======");
      console.log(user);
      console.log("======");
      socket.join(userId);
    })
  });

  const db = mongoose.connection;

  db.once("open", async() => {
    console.log("Crud operations called");
    //CRUD operations
  });

  httpServer.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}


