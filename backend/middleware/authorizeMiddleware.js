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

module.exports = {
	authorizeSelfByParam,
	authorizeBodyUserId,
};
