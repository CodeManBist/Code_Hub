const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const User = require("../models/userModel");

dotenv.config();

async function getAllUsers(req, res) {
    try {
        const users = await User.find({})
            .select('-password')
            .lean();

        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching users', error: err.message });
    }
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
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "All fields required" });
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });

    } catch (err) {
        res.status(500).json({
            message: 'Error logging in user',
            error: err.message
        });
    }
};

async function getUserProfile(req, res) {
    const userId = req.params.id;
    console.log('User ID from params:', userId);

    try {
        const user = await User.findById(userId).select('-password').lean();
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ success: true, data: user });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching user profile', error: err.message });
    }
}

async function updateUserProfile(req, res) {
    const userId = req.params.id;

     if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
    }

    try {
        const allowedUpdates = ['username', "email"];
        const updates = {};

        Object.keys(req.body).forEach(key => {
            if (allowedUpdates.includes(key)) {
                updates[key] = req.body[key];
            }
        });

        const updatedUser = await User.findByIdAndUpdate(
            userId, 
            { $set: updates }, 
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.status(200).json({ 
            success: true, 
            message: 'User profile updated successfully', 
            data: updatedUser 
        });

    } catch (err) {
        res.status(500).json({ message: 'Error updating user profile', error: err.message });   
    }
}

async function deleteUserProfile(req, res) {
    const userId = req.params.id;

    try {
        const deletedUser = await User.findByIdAndDelete(userId);

        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Account deleted successfully'
        });

    } catch (err) {
        res.status(500).json({
            message: 'Error deleting account',
            error: err.message
        });
    }
}

module.exports = {
    getAllUsers,
    signUp,
    login,
    getUserProfile,
    updateUserProfile,
    deleteUserProfile
}