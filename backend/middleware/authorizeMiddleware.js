const Repository = require("../models/repoModel");
const Issue = require("../models/issueModel");

function authorizeSelfByParam(paramName = "id") {
	return (req, res, next) => {
		const targetUserId = req.params[paramName];
		const currentUserId = req.user?.userId;

		if (!targetUserId || !currentUserId || String(targetUserId) !== String(currentUserId)) {
			return res.status(403).json({ message: "Forbidden: access denied" });
		}

		next();
	};
}

function authorizeBodyUserId(fieldName = "currentUserId") {
	return (req, res, next) => {
		const currentUserId = req.user?.userId;
		const bodyUserId = req.body?.[fieldName];

		if (!currentUserId) {
			return res.status(403).json({ message: "Forbidden: access denied" });
		}

		if (bodyUserId && String(bodyUserId) !== String(currentUserId)) {
			return res.status(403).json({ message: "Forbidden: user mismatch" });
		}

		req.body[fieldName] = currentUserId;
		next();
	};
}

function authorizeRepoOwnerByParam(paramName = "id") {
	return async (req, res, next) => {
		const repoId = req.params[paramName];
		const currentUserId = req.user?.userId;

		if (!currentUserId) {
			return res.status(403).json({ message: "Forbidden: access denied" });
		}

		try {
			const repository = await Repository.findById(repoId).select("owner");

			if (!repository) {
				return res.status(404).json({ message: "Repository not found" });
			}

			if (String(repository.owner) !== String(currentUserId)) {
				return res.status(403).json({ message: "Forbidden: repository owner only" });
			}

			next();
		} catch (error) {
			return res.status(500).json({ message: "Failed to authorize repository access" });
		}
	};
}

function authorizeIssueAuthorByParam(paramName = "id") {
	return async (req, res, next) => {
		const issueId = req.params[paramName];
		const currentUserId = req.user?.userId;

		if (!currentUserId) {
			return res.status(403).json({ message: "Forbidden: access denied" });
		}

		try {
			const issue = await Issue.findById(issueId).select("author");

			if (!issue) {
				return res.status(404).json({ message: "Issue not found" });
			}

			if (!issue.author || String(issue.author) !== String(currentUserId)) {
				return res.status(403).json({ message: "Forbidden: issue author only" });
			}

			next();
		} catch (error) {
			return res.status(500).json({ message: "Failed to authorize issue access" });
		}
	};
}

module.exports = {
	authorizeSelfByParam,
	authorizeBodyUserId,
	authorizeRepoOwnerByParam,
	authorizeIssueAuthorByParam,
};
