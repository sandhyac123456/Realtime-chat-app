const User = require("../models/user");

const getUserProfile = async (req, res) => {
    try{
        const userId = req.user.id;
        const user = await User.findById(userId).select("-password")
        if(!user){
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "User profile fetched successfully", user: {
            name: user.name,    
        email: user.email,
        profilePic: user.profilePic,
        }});
    }
    catch(error){
        console.error("Error fetching user profile:", error.message);
        return res.status(500).json({ message: "Internal server error" });
    }   
};

const getAllUsers = async (req, res) => {
    try{
        const user = await User.find({_id: {$ne: req.user.id}}).select("name email profilePic isOnline");
        res.status(200).json({ message: "All users fetched successfully", users: user });
    }
    catch(error){
        console.error("Error fetching all users:", error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = {getUserProfile, getAllUsers};