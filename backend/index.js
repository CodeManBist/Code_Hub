const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");

const { initRepo } = require("./controllers/init");
const { statusRepo } = require("./controllers/status");
const { addRepo } = require("./controllers/add");
const { commitRepo } = require("./controllers/commit");
const { pushRepo } = require("./controllers/push");
const { pullRepo } = require("./controllers/pull");
const { revertRepo } = require("./controllers/revert");

yargs(hideBin(process.argv))

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

.command("revert", "Revert last commit", {}, revertRepo)

.demandCommand(1, "You need at least one command")
.help()
.parse();