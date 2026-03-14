async function commitRepo(argv) {
  console.log(`Commit created with message: ${argv.message}`);
}

module.exports = { commitRepo };