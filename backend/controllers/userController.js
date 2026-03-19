const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const User = require("../models/userModel");

dotenv.config();

const getAllUsers = (req, res) => {
    res.send('Get all users');
}

const signUp = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({ username, email, password: hashedPassword });
        const savedUser = await newUser.save();
        
        const token = jwt.sign(
            { userId: savedUser._id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' } 
        );

        res.status(201).json({ message: 'User created successfully', token });
    } catch (err) {
        res.status(500).json({ message: 'Error signing up user', error: err.message });
    }
}

const login = async (req, res) => {

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