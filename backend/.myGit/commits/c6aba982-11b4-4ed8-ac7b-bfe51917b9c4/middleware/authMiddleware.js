const jwt = require("jsonwebtoken");

const revokedTokens = new Set();

function extractToken(req) {
	const authHeader = req.headers.authorization || "";
	if (!authHeader.startsWith("Bearer ")) {
		return null;
	}
	return authHeader.slice(7).trim();
}

function authenticateToken(req, res, next) {
	const token = extractToken(req);

	if (!token) {
		return res.status(401).json({ message: "Authorization token is required" });
	}

	if (revokedTokens.has(token)) {
		return res.status(401).json({ message: "Token has been revoked" });
	}

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		req.user = decoded;
		req.token = token;
		next();
	} catch (error) {
		return res.status(401).json({ message: "Invalid or expired token" });
	}
}

function revokeToken(token) {
	if (token) {
		revokedTokens.add(token);
	}
}

module.exports = {
	authenticateToken,
	revokeToken,
};
