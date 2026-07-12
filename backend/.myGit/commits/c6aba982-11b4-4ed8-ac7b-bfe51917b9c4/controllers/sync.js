const { getRepoPath, readRepoConfig, resolveGitOptions } = require("../utils/gitConfig");

async function syncRepo(argv = {}) {
  try {
    const config = await readRepoConfig(getRepoPath());
    const options = resolveGitOptions(config, argv);
    if (options.storageMode !== "namespaced" || !options.repoId || !options.userId) {
      throw new Error("Run init with --storageMode namespaced --userId <userId> --repoId <repoId> before syncing.");
    }
    const token = argv.token || process.env.CODEHUB_TOKEN;
    if (!token) throw new Error("A login token is required. Pass --token <token> or set CODEHUB_TOKEN.");
    const apiUrl = (argv.apiUrl || process.env.CODEHUB_API_URL || "http://localhost:3000").replace(/\/$/, "");
    const response = await fetch(`${apiUrl}/repo/${options.repoId}/sync`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || payload.message || `Sync failed (${response.status})`);
    console.log(`Synced ${payload.commitsSynced} commit(s) to CodeHub.`);
  } catch (error) {
    console.error("Error syncing repository:", error.message);
  }
}

module.exports = { syncRepo };
