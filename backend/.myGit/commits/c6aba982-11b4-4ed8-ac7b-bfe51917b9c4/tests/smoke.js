require("dotenv").config();

const BASE_URL = process.env.SMOKE_BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
const PASSWORD = process.env.SMOKE_TEST_PASSWORD || "SmokeTest@123";

function assertCondition(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function requestJson(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  let body;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  return { response, body };
}

async function run() {
  const suffix = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
  const email = `smoke-${suffix}@example.com`;
  const username = `smoke_${suffix}`;
  const repoName = `smoke-repo-${suffix}`;
  const issueTitle = `smoke-issue-${suffix}`;

  console.log(`Running smoke tests against ${BASE_URL}`);

  const health = await requestJson("/health", { method: "GET" });
  assertCondition(health.response.ok, "Health check failed");

  const signup = await requestJson("/signup", {
    method: "POST",
    body: JSON.stringify({ username, email, password: PASSWORD }),
  });
  assertCondition(signup.response.status === 201, `Signup failed: ${signup.response.status}`);
  assertCondition(signup.body && signup.body.token, "Signup token missing");

  const login = await requestJson("/login", {
    method: "POST",
    body: JSON.stringify({ email, password: PASSWORD }),
  });
  assertCondition(login.response.status === 200, `Login failed: ${login.response.status}`);
  assertCondition(login.body && login.body.token && login.body.userId, "Login payload missing token/userId");

  const token = login.body.token;
  const userId = login.body.userId;

  const createRepo = await requestJson("/repo/create", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      owner: userId,
      name: repoName,
      description: "Smoke test repository",
      visibility: true,
    }),
  });

  assertCondition(createRepo.response.status === 201, `Repository creation failed: ${createRepo.response.status}`);
  assertCondition(createRepo.body && createRepo.body.repositoryId, "Repository ID missing");

  const repoId = createRepo.body.repositoryId;

  const createIssue = await requestJson(`/issue/create/${repoId}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      title: issueTitle,
      description: "Smoke test issue description",
      status: "open",
      author: userId,
    }),
  });

  assertCondition(createIssue.response.status === 201, `Issue creation failed: ${createIssue.response.status}`);

  const myRepos = await requestJson(`/repo/user/${userId}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

  assertCondition(myRepos.response.status === 200, `Fetch user repos failed: ${myRepos.response.status}`);

  console.log("SMOKE_TEST_PASS");
}

run().catch((error) => {
  console.error("SMOKE_TEST_FAIL");
  console.error(error.message || error);
  process.exit(1);
});
