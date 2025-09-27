import jwt from "jsonwebtoken";
import twilio from "twilio";
import { User } from '../models/User.js';
import dotenv from 'dotenv';
import crypto from "crypto";

dotenv.config();

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// -------------------- JWT Token Generation --------------------
const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, process.env.SECRET_KEY, { expiresIn: "15m" });
  const refreshToken = jwt.sign({ id: userId }, process.env.AGRIASSIST_REFRESH_KEY, { expiresIn: "7d" });
  return { accessToken, refreshToken };
};

// -------------------- OTP Generator --------------------
const generateOTP = () => {
  const otp = crypto.randomInt(100000, 999999).toString();
  const expires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
  return { otp, expires };
};

// -------------------- Register Farmer --------------------
export const registerFarmer = async (req, res) => {
  try {
    const { name, phonenumber, location, language } = req.body;
    if (!name || !phonenumber) return res.status(400).json({ success: false, message: "Name and phone required" });

    const existingUser = await User.findOne({ phonenumber });
    if (existingUser) return res.status(400).json({ success: false, message: "User already exists" });

    const user = new User({ name, phonenumber, location, language, isVerified: false });
    await user.save();

    const { accessToken, refreshToken } = generateTokens(user._id);
    return res.status(201).json({ success: true, message: "Registered successfully.", accessToken , refreshToken , user: user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Registration failed", error: error.message });
  }
};

export const sendOtpForRegsiter = async(req , res) => {
  try {
    const { phonenumber } = req.body;
    if (!phonenumber) return res.status(400).json({ success: false, message: "Enter phone number" });

    
    const { otp } = generateOTP();

    await client.messages.create({
      body: `Your OTP is ${otp}. It expires in 5 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: `+91${phonenumber}`
    });

    return res.status(200).json({ success: true, message: "OTP sent successfully" , otp });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
}


// -------------------- Send OTP (Register/Login) --------------------
export const sendOtp = async (req, res) => {
  try {
    const { phonenumber } = req.body;
    if (!phonenumber) return res.status(400).json({ success: false, message: "Enter phone number" });

    const user = await User.findOne({ phonenumber });
    if (!user) return res.status(404).json({ success: false, message: "User not found. Please register first." });

    const { otp, expires } = generateOTP();
    user.otp = otp;
    user.otpExpires = expires;
    await user.save();

    await client.messages.create({
      body: `Your OTP is ${otp}. It expires in 5 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: `+91${phonenumber}`
    });

    return res.status(200).json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
};

// -------------------- Verify OTP --------------------
export const verifyOtp = async (req, res) => {
  try {
    const { phonenumber, code } = req.body;
    if (!phonenumber || !code) return res.status(400).json({ success: false, message: "Phone & OTP required" });

    const user = await User.findOne({ phonenumber });
    if (!user || !user.otp) return res.status(400).json({ success: false, message: "OTP not found" });
    if (user.otp !== code) return res.status(400).json({ success: false, message: "Invalid OTP" });
    if (user.otpExpires < new Date()) return res.status(400).json({ success: false, message: "OTP expired" });

    // OTP verified → remove and mark verified
    user.otp = undefined;
    user.otpExpires = undefined;
    user.isVerified = true;
    await user.save();

    const { accessToken, refreshToken } = generateTokens(user._id);
    return res.status(200).json({ success: true, message: "OTP verified", accessToken, refreshToken, user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to verify OTP" });
  }
};

// -------------------- Login Farmer --------------------
export const loginFarmer = async (req, res) => {
  try {
    const { phonenumber, code } = req.body;
    if (!phonenumber || !code) return res.status(400).json({ success: false, message: "Phone & OTP required" });

    const user = await User.findOne({ phonenumber });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    if (user.otp !== code) return res.status(400).json({ success: false, message: "Invalid OTP" });
    if (user.otpExpires < new Date()) return res.status(400).json({ success: false, message: "OTP expired" });

    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    const { accessToken, refreshToken } = generateTokens(user._id);
    return res.status(200).json({ success: true, message: "Login successful", accessToken, refreshToken, user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Login failed" });
  }
};

// -------------------- Refresh Access Token --------------------
export const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ success: false, message: "Refresh token required" });

    const decoded = jwt.verify(refreshToken, process.env.AGRIASSIST_REFRESH_KEY);
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(decoded.id);
    const user = await User.findById(decoded.id).select("-otp -otpExpires");

    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    return res.status(200).json({ success: true, accessToken, refreshToken: newRefreshToken, user });
  } catch (error) {
    console.error(error);
    return res.status(403).json({ success: false, message: "Invalid refresh token" });
  }
};

// -------------------- Logout Farmer --------------------
export const farmerLogout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ success: false, message: "Refresh token required" });

    // Client should delete tokens
    return res.status(200).json({ success: true, message: "Logout successful. Delete tokens on client." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Logout failed" });
  }
};

// -------------------- Twilio Test Functions --------------------
export const checkTwilioConfig = async (req, res) => {
  try {
    const account = await client.api.accounts(client.accountSid).fetch();
    return res.status(200).json({ success: true, status: account.status });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Twilio config check failed", error: error.message });
  }
};

export const sendTestSMS = async (req, res) => {
  try {
    const { phonenumber, message } = req.body;
    if (!phonenumber || !message) return res.status(400).json({ success: false, message: "Phone & message required" });

    const msg = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: `+91${phonenumber}`
    });

    return res.status(200).json({ success: true, message: "Test SMS sent", sid: msg.sid });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to send SMS", error: error.message });
  }
};
