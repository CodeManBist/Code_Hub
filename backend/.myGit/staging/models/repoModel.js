const mongoose = require('mongoose');
const { Schema } = mongoose;

const RepositoryFileSchema = new Schema({
  path: { type: String, required: true },
  content: { type: String, default: "" }
}, { _id: false });

const RepositoryCommitSchema = new Schema({
  id: { type: String, required: true },
  message: { type: String, required: true },
  author: { type: String, default: "CodeHub" },
  timestamp: { type: Date, default: Date.now },
  files: { type: [RepositoryFileSchema], default: [] }
}, { _id: false });

const RepositorySchema = new Schema({
  name: {
    type: String, 
    required: true,
    unique: true
  },
  description: {
    type: String
  },
  content: {
    type: [String]
  },
  visibility: {
    type: Boolean,
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  stargazers: {
    type: [
      {
        type: Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    default: []
  },
  issues: [
    {
        type: Schema.Types.ObjectId,
        ref: "Issue"
    }
  ],
  commits: {
    type: [RepositoryCommitSchema],
    default: []
  }
});  

const Repository = mongoose.model("Repository", RepositorySchema);
module.exports = Repository;
