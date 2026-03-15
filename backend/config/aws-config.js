const { S3Client } = require("@aws-sdk/client-s3");

const s3 = new S3Client({
  region: "ap-south-1"
});

const S3_BUCKET = "code-hub-storage-493499579453-eu-north-1-an";

module.exports = { s3, S3_BUCKET };