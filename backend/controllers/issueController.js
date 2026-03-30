const mongoose = require('mongoose');
const Repository = require('../models/repoModel');
const User = require('../models/userModel');
const Issue = require('../models/issueModel');

async function createIssue(req, res) {
    const { title, description } = req.body;
    const { id } = req.params;

    try {
        if(!title || !description) {
            return res.status(400).json({ error: "Title and description are required" });
        }

        const repo = await Repository.findById(id);
        if(!repo) {
            return res.status(404).json({ error: "Repository not found" });
        }

        const issue = new Issue({
            title,
            description,
            repository: id
        });
        await issue.save();
        repo.issues.push(issue._id);
        await repo.save();

        res.status(201).json({ message: "Issue created successfully", issue });

    } catch (error) {
        console.error("Error creating issue:", error);
        res.status(500).json({ error: "Failed to create issue" });
    }
};

async function getAllIssues (req, res) {
    const { id } = req.params;

    try {
        const issues = await Issue.find({ repository: id });

        if(!issues) {   
            return res.status(404).json({ error: "Repository not found" });
        }

        res.json({ issues });

    } catch (error) {
        console.error("Error fetching issues:", error);
        res.status(500).json({ error: "Failed to fetch issues" });
    }
};

async function getIssueById (req, res) {
    const { id } = req.params;

    try {
        const issue = await Issue.findById(id);
       
        if(!issue) {
            return res.status(404).json({ error: "Issue not found" });
        }

        res.json({ issue });

    } catch (error) {
        console.error("Error fetching issue:", error);
        res.status(500).json({ error: "Failed to fetch issue" });
    }
};

async function updateIssueById (req, res) {
    const { id } = req.params;
    const { title, description, status } = req.body;

    try {
        const issue = await Issue.findById(id);

        if(!issue) {
            return res.status(404).json({ error: "Issue not found" });
        }

        issue.title = title;
        issue.description = description;
        issue.status = status;
        await issue.save();

        res.json({ message: "Issue updated successfully", issue });
    } catch (error) {
        console.error("Error updating issue:", error);
        res.status(500).json({ error: "Failed to update issue" });
    }
}

async function deleteIssueById (req, res) {
    const { id } = req.params;

    try {
        const issue = await Issue.findByIdAndDelete(id);
        if(!issue) {
            return res.status(404).json({ error: "Issue not found" });
        }

        res.json({ message: "Issue deleted successfully" });
    } catch(error) {
        console.error("Error deleting issue:", error);
        res.status(500).json({ error: "Failed to delete issue" });
    }
}

module.exports = {
    createIssue,
    getAllIssues,
    getIssueById,
    updateIssueById,
    deleteIssueById
}