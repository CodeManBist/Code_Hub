/*
 * Destructive local/demo reset. Run only with: npm run seed -- --confirm
 * It deletes every object in the configured S3_BUCKET and all application data
 * in MongoDB, then recreates a small CodeHub demo dataset.
 */
const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { randomUUID } = require("crypto");
const { ListObjectsV2Command, DeleteObjectsCommand, PutObjectCommand } = require("@aws-sdk/client-s3");
const User = require("../models/userModel");
const Repository = require("../models/repoModel");
const Issue = require("../models/issueModel");
const { s3, S3_BUCKET } = require("../config/aws-config");

const password = "CodeHubDemo123!";
const now = new Date();
const daysAgo = (days) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

async function clearBucket() {
  let deleted = 0;
  while (true) {
    const listed = await s3.send(new ListObjectsV2Command({ Bucket: S3_BUCKET, MaxKeys: 1000 }));
    const objects = (listed.Contents || []).map((item) => ({ Key: item.Key }));
    if (!objects.length) break;
    await s3.send(new DeleteObjectsCommand({ Bucket: S3_BUCKET, Delete: { Objects: objects, Quiet: true } }));
    deleted += objects.length;
  }
  return deleted;
}

async function writeCommitToS3(repository, commit) {
  const prefix = `users/${repository.owner}/repos/${repository._id}/commits/${commit.id}/`;
  await s3.send(new PutObjectCommand({ Bucket: S3_BUCKET, Key: `${prefix}commit.json`, Body: JSON.stringify({ message: commit.message, author: commit.author, date: commit.timestamp }, null, 2), ContentType: "application/json" }));
  await Promise.all(commit.files.map((file) => s3.send(new PutObjectCommand({ Bucket: S3_BUCKET, Key: `${prefix}${file.path}`, Body: file.content, ContentType: "text/plain; charset=utf-8" }))));
}

function commit(message, author, timestamp, files) {
  return { id: randomUUID(), message, author, timestamp, files };
}

async function seed() {
  if (!process.argv.includes("--confirm")) {
    console.error("Refusing to clear MongoDB/S3. Run: npm run seed -- --confirm");
    process.exitCode = 1;
    return;
  }
  if (!process.env.MONGODB_URI) throw new Error("Missing MONGODB_URI in backend/.env");

  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB. Clearing CodeHub data and S3 bucket...");
  const deletedObjects = await clearBucket();
  await Promise.all([Issue.deleteMany({}), Repository.deleteMany({}), User.deleteMany({})]);

  const hash = await bcrypt.hash(password, 12);
  const [ada, linus, maya] = await User.create([
    { username: "ada-lovelace", email: "ada@codehub.demo", password: hash },
    { username: "linus-dev", email: "linus@codehub.demo", password: hash },
    { username: "maya-writes", email: "maya@codehub.demo", password: hash }
  ]);
  ada.following = [linus._id, maya._id];
  linus.followers = [ada._id];
  maya.followers = [ada._id];
  await Promise.all([ada.save(), linus.save(), maya.save()]);

  const workspaceCommits = [
    commit("Add task filtering", ada.username, daysAgo(1), [
      { path: "README.md", content: "# Team Workspace\n\nA focused task workspace built with React.\n\n## Getting started\n\n```bash\nnpm install\nnpm run dev\n```\n" },
      { path: "src/main.js", content: "import { createApp } from './app.js';\n\ncreateApp();\n" },
      { path: "src/app.js", content: "export function createApp() {\n  console.log('Team Workspace is ready');\n}\n" },
      { path: "src/styles.css", content: ":root { color-scheme: dark; }\n" }
    ]),
    commit("Initial project structure", ada.username, daysAgo(4), [
      { path: "README.md", content: "# Team Workspace\n\nA focused task workspace built with React.\n" },
      { path: "src/main.js", content: "console.log('Team Workspace');\n" }
    ])
  ];
  const apiCommits = [commit("Add health endpoint", linus.username, daysAgo(2), [
    { path: "README.md", content: "# Pulse API\n\nA compact API service for monitoring application health.\n" },
    { path: "src/server.js", content: "import express from 'express';\nconst app = express();\napp.get('/health', (_, res) => res.json({ status: 'ok' }));\napp.listen(4000);\n" },
    { path: "package.json", content: "{\n  \"name\": \"pulse-api\",\n  \"private\": true\n}\n" }
  ])];
  const notesCommits = [commit("Publish collaboration guide", maya.username, daysAgo(3), [
    { path: "README.md", content: "# Engineering Notes\n\nPractical notes for building calm, reliable software.\n\n| Topic | Status |\n| --- | --- |\n| Reviews | Ready |\n| Releases | Draft |\n" },
    { path: "guides/pull-requests.md", content: "# Pull requests\n\nKeep reviews small, clear, and kind.\n" }
  ])];

  const [workspace, api, notes] = await Repository.create([
    { name: "team-workspace", description: "A collaborative task workspace for small teams.", visibility: true, owner: ada._id, commits: workspaceCommits },
    { name: "pulse-api", description: "Small, observable HTTP service starter.", visibility: true, owner: linus._id, commits: apiCommits },
    { name: "engineering-notes", description: "Guides and shared engineering practices.", visibility: true, owner: maya._id, commits: notesCommits }
  ]);
  workspace.stargazers = [linus._id, maya._id];
  api.stargazers = [ada._id];
  await Promise.all([workspace.save(), api.save()]);
  ada.repositories = [workspace._id]; linus.repositories = [api._id]; maya.repositories = [notes._id];
  ada.starRepos = [api._id]; linus.starRepos = [workspace._id]; maya.starRepos = [workspace._id];
  await Promise.all([ada.save(), linus.save(), maya.save()]);

  const issues = await Issue.create([
    { title: "Add keyboard shortcuts", description: "Support quick navigation between task views.", status: "open", repository: workspace._id, author: linus._id },
    { title: "Document deployment environment", description: "Add production environment variables to the README.", status: "open", repository: api._id, author: ada._id }
  ]);
  workspace.issues = [issues[0]._id]; api.issues = [issues[1]._id];
  await Promise.all([workspace.save(), api.save()]);

  await Promise.all([
    ...workspaceCommits.map((item) => writeCommitToS3(workspace, item)),
    ...apiCommits.map((item) => writeCommitToS3(api, item)),
    ...notesCommits.map((item) => writeCommitToS3(notes, item))
  ]);
  console.log(`Seed complete. Removed ${deletedObjects} S3 object(s).`);
  console.log(`Demo login: ada@codehub.demo / ${password}`);
  console.log(`Repositories: ${workspace._id} (team-workspace), ${api._id} (pulse-api), ${notes._id} (engineering-notes)`);
}

seed().catch((error) => { console.error("Seed failed:", error); process.exitCode = 1; }).finally(async () => { await mongoose.disconnect(); });
