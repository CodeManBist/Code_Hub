require('dotenv').config();
const { S3Client } = require("@aws-sdk/client-s3");

const s3 = new S3Client({
  region: process.env.AWS_REGION || "eu-north-1"
});

const S3_BUCKET = process.env.S3_BUCKET;

if (!S3_BUCKET) {
  throw new Error("Missing S3_BUCKET environment variable");
}

module.exports = { s3, S3_BUCKET };