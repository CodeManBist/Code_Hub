
const getAllUsers = (req, res) => {
    res.send('Get all users');
}

const signUp = (req, res) => {
    res.send('Sign up');
}

const login = (req, res) => {
    res.send('Login');  
}

const getUserProfile = (req,res) => {
    res.send('Get user profile');
}

const updateUserProfile = (req, res) => {
    res.send('Update user profile');
}

const deleteUserProfile = (req, res) => {
    res.send('Delete user profile');
}

module.exports = {
    getAllUsers,
    signUp,
    login,
    getUserProfile,
    updateUserProfile,
    deleteUserProfile
}