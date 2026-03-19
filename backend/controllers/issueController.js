
const createIssue = (req, res) => {
    res.send('Issue created successfully');
};

const getAllIssues = (req, res) => {
    res.send('List of issues');
};

const getIssueById = (req, res) => {
    res.send(`Details of issue with ID: ${issueId}`);
};

const updateIssueById = (req, res) => {
    res.send("Issue updated successfully");
}

const deleteIssueById = (req, res) => {
    res.send("Issue deleted successfully"); 
}

module.exports = {
    createIssue,
    getAllIssues,
    getIssueById,
    updateIssueById,
    deleteIssueById
}