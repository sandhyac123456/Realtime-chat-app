const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
    try{
    const { name,email,password}= req.body;

    if(!name || !email || !password){
        return res.status(400).json({ message: "All fields are required" });
    }

    if(password.length < 4){
        return res.status(400).json({ message: "Password must be at least 4 characters" });
    }

    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
        return res.status(400).json({ message: "Invalid email format" });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if(existingUser){
        return res.status(400).json({ message: "User already exists" });
    }

    
    const hashPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
        name,
        email: normalizedEmail,
        password: hashPassword
    });

    await newUser.save();
    return res.status(201).json({ message: "User registered successfully" });
    }
    catch(error){
        console.error("Error registering user:", error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const login = async (req, res) => {
    try{
        const { email, password } = req.body;

        if(!email || !password){
            return res.status(400).json({ message: "Email and password are required" });
        }
        const normalizedEmail = email.trim().toLowerCase();

        const user = await User.findOne({ email: normalizedEmail });
        if(!user){
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const passCompare = await bcrypt.compare(password, user.password);

        if(!passCompare){
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const token = jwt.sign({
            id: user._id
        }, 
        process.env.JWT_SECRET, 
        { expiresIn: process.env.JWT_EXPIRES_IN || "1h" });
        return res.status(200).json({ message: "Login successful", token , user: {
        id: user._id,
        name: user.name,
        email: user.email
    }});
    }
    catch(error){
        console.error("Error logging in user:", error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = { register , login };