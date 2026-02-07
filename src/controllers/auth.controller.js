import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

/* ---------- SIGNUP ---------- */
export const signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = new User({
      username,
      email,
      password,
    });

    await user.save();

    res.status(201).json({ message: "Signup successful" });
  } catch (error) {
    console.log(error);   // IMPORTANT (so terminal shows error)
    res.status(500).json({ message: error.message });
  }
};


/* ---------- LOGIN ---------- */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      username: user.username,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
