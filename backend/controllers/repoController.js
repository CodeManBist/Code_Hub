const mongoose = require("mongoose");
const Repository = require("../models/repoModel");
const User = require("../models/userModel");
const Issue = require("../models/issueModel");

function isValidObjectId(id) {
    return mongoose.Types.ObjectId.isValid(id);
}

function normalizeRepository(repository) {
    const plainRepository = repository.toObject ? repository.toObject() : repository;

    return {
        ...plainRepository,
        starsCount: Array.isArray(plainRepository.stargazers) ? plainRepository.stargazers.length : 0
    };
}

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
    try {
        const repositories = await Repository.find({}).populate("owner").populate("issues");
        res.status(200).json(repositories.map(normalizeRepository));
    } catch (error) {
        console.error("Error fetching repositories:", error);
        res.status(500).json({ error: "Failed to fetch repositories" });
    }
}

async function getRepositoryById(req, res) {
    const repoId = req.params.id;
    
    try {
        const repository = await Repository.findById(repoId).populate("owner").populate("issues");

        if(!repository) {
            return res.status(404).json({ error: "Repository not found" });
        }
        res.status(200).json(normalizeRepository(repository));

    } catch (error) {
        console.error("Error fetching repository by ID:", error);
        res.status(500).json({ error: "Failed to fetch repository" });
    }
}

async function getRepositoryByName(req, res) {
    const { name } = req.params;
    try {
        const repository = await Repository.findOne({ name: name }).populate("owner").populate("issues");

        if(!repository) {
            return res.status(404).json({ error: "Repository not found" });
        }
        res.status(200).json(normalizeRepository(repository));
    } catch (error) {
        console.error("Error fetching repository by name:", error);
        res.status(500).json({ error: "Failed to fetch repository" });
    }
}

async function getRepositoriesforCurrentUser(req, res) {
    const userId = req.params.userId;

    try {
        const repositories = await Repository.find({ owner: userId });
        
        if(!repositories || repositories.length === 0   ) {
            return res.status(404).json({ error: "No repositories found for this user" });
        }
        res.status(200).json({ message: "Repositories found!", repositories: repositories.map(normalizeRepository) });
    } catch(error) {
        console.error("Error fetching repositories for user:", error);
        res.status(500).json({ error: "Failed to fetch repositories for user" });
    }
}

async function starRepository(req, res) {
    const { id } = req.params;
    const { userId } = req.body;

    if (!isValidObjectId(id) || !isValidObjectId(userId)) {
        return res.status(400).json({ error: "Invalid repository or user ID" });
    }

    try {
        const repository = await Repository.findById(id);
        const user = await User.findById(userId);

        if (!repository) {
            return res.status(404).json({ error: "Repository not found" });
        }

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const alreadyStarred = repository.stargazers.some((starUserId) => String(starUserId) === String(userId));

        if (!alreadyStarred) {
            repository.stargazers.push(userId);
            user.starRepos.addToSet(repository._id);

            await repository.save();
            await user.save();
        }

        const updatedRepository = await Repository.findById(id).populate("owner").populate("issues");

        res.status(200).json({
            message: alreadyStarred ? "Repository already starred" : "Repository starred successfully",
            repository: normalizeRepository(updatedRepository),
            alreadyStarred: true
        });
    } catch (error) {
        console.error("Error starring repository:", error);
        res.status(500).json({ error: "Failed to star repository" });
    }
}

async function unstarRepository(req, res) {
    const { id } = req.params;
    const { userId } = req.body;

    if (!isValidObjectId(id) || !isValidObjectId(userId)) {
        return res.status(400).json({ error: "Invalid repository or user ID" });
    }

    try {
        const repository = await Repository.findById(id);
        const user = await User.findById(userId);

        if (!repository) {
            return res.status(404).json({ error: "Repository not found" });
        }

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        repository.stargazers = repository.stargazers.filter((starUserId) => String(starUserId) !== String(userId));
        user.starRepos = user.starRepos.filter((starRepoId) => String(starRepoId) !== String(id));

        await repository.save();
        await user.save();

        const updatedRepository = await Repository.findById(id).populate("owner").populate("issues");

        res.status(200).json({
            message: "Repository unstarred successfully",
            repository: normalizeRepository(updatedRepository),
            starred: false
        });
    } catch (error) {
        console.error("Error unstarring repository:", error);
        res.status(500).json({ error: "Failed to unstar repository" });
    }
}

async function updateRepositoryById(req, res) {
    const { id } = req.params;
    const { content, description } = req.body;
    
    try {
        const updateRepository = await Repository.findByIdAndUpdate(
            id,
            { content, description },
            { new: true }
        );
        
        if(!updateRepository) {
            return res.status(404).json({ error: "Repository not found" });
        }

        res.status(200).json({ message: "Repository updated successfully", repository: updateRepository }); 
    } catch (error) {
        console.error("Error updating repository:", error);
        res.status(500).json({ error: "Failed to update repository" });
    }
}

async function toggleVisibilityById(req, res) {
    const { id } = req.params;

    try {
        const repository = await Repository.findById(id);
        if(!repository) {
            return res.status(404).json({ error: "Repository not found" });
        }
        repository.visibility = !repository.visibility;
        await repository.save();
        res.status(200).json({ message: "Repository visibility toggled successfully", repository });
    } catch (error) {
        console.error("Error toggling repository visibility:", error);
        res.status(500).json({ error: "Failed to toggle repository visibility" });
    }       
}


async function deleteRepositoryById(req, res) {
    const { id } = req.params;

    try {
        const repository = await Repository.findByIdAndDelete(id);
        if(!repository) {
            return res.status(404).json({ error: "Repository not found" });
        }

        res.status(200).json({ message: "Repository deleted successfully" });
        
    } catch (error) {
        console.log("Error deleting repositories: ", error);
        res.status(500).json({ error: "Failed to delete repository" })
    }
}

module.exports = {
    createRepository,
    getAllRepositories,
    getRepositoryById,
    getRepositoryByName,
    getRepositoriesforCurrentUser,
    starRepository,
    unstarRepository,
    updateRepositoryById,
    toggleVisibilityById,
    deleteRepositoryById
}