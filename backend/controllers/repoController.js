const mongoose = require("mongoose");
const Repository = require("../models/repoModel");
const User = require("../models/userModel");
const Issue = require("../models/issueModel");

async function createRepository(req, res) {
    const { owner, name, issues, content, description, visibility } = req.body;

    try {
        if(!name || !owner) {
            return res.status(400).json({ error: "Owner and name are required" });
        }

        const newRepository = new Repository ({
            name,
            description,
            visibility,
            owner,
            content,
            issues
        });

        const result = await newRepository.save();
        res.status(201).json({ message: "Repository created successfully", repositoryId: result._id });
    } catch (error) {
        console.error("Error creating repository:", error);
        res.status(500).json({ error: "Failed to create repository" });
    }
}

async function getAllRepositories(req, res) {
    res.send("List of all repositories");
}

async function getRepositoryById(req, res) {
    const { id } = req.params;
    res.send(`Details of repository with ID: ${id}`);
}

async function getRepositoryByName(req, res) {
    const { name } = req.params;
    res.send(`Details of repository with name: ${name}`);
}

async function getRepositoriesforCurrentUser(req, res) {
    res.send("Repositories for logged in user fetched")
}

async function updateRepositoryById(req, res) {
    res.send("Repository updated successfully");
}

async function toggleVisibilityById(req, res) {
    res.send("Repository visibility toggled successfully");
}


async function deleteRepositoryById(req, res) {
    res.send("Repository deleted successfully");
}

module.exports = {
    createRepository,
    getAllRepositories,
    getRepositoryById,
    getRepositoryByName,
    getRepositoriesforCurrentUser,
    updateRepositoryById,
    toggleVisibilityById,
    deleteRepositoryById
}