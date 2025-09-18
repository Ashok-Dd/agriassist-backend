import jwt from "jsonwebtoken";
import twilio from "twilio";
import {User} from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config()

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// 🔑 Generate Access & Refresh Tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { id: userId },
    process.env.SECRET_KEY,
    { expiresIn: "15m" } // short expiry for security
  );

  const refreshToken = jwt.sign(
    { id: userId },
    process.env.AGRIASSIST_REFRESH_KEY,
    { expiresIn: "7d" } // longer expiry
  );

  return { accessToken, refreshToken };
};

// -------------------- Farmer Register --------------------
export const registerFarmer = async (req, res) => {
  const { name, phonenumber , location , language } = req.body;
  try {
    if (!name || !phonenumber) {
      return res.status(400).json({ success: false, message: "Name and phone number required" });
    }

    const existingUser = await User.findOne({ phonenumber });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    const user = new User({ name, phonenumber , location , language});
    await user.save();

    // Generate tokens after registration
    const { accessToken, refreshToken } = generateTokens(user._id);

    return res.status(201).json({
      success: true,
      message: "Farmer registered successfully",
      user,
      AcessToken : accessToken,
      RefreshToken : refreshToken
    });
  } catch (error) {
    console.error("Error in registerFarmer:", error);
    return res.status(500).json({ success: false, message: "Registration failed", error: error.message });
  }
};

// -------------------- Send OTP --------------------
export const sendOtp = async (req, res) => {
  const { phonenumber } = req.body;
  try {
    if (!phonenumber) {
      return res.status(400).json({ success: false, message: "Enter the phone number!!" });
    }

    const phoneStr = phonenumber.toString();

    if (!/^[6-9]\d{9}$/.test(phoneStr)) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number format. Must be 10 digits starting with 6-9"
      });
    }

    const user = await User.findOne({ phonenumber: phoneStr });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found. Please register first."
      });
    }

    const formattedPhone = `+91${phoneStr}`;
    const verification = await client.verify.v2.services(process.env.TWILIO_SERVICE_SID)
      .verifications.create({
        to: formattedPhone,
        channel: "sms"
      });

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      verificationSid: verification.sid
    });
  } catch (error) {
    console.log("Error in sendOtp:", error);
    return res.status(500).json({ success: false, message: "Failed to send OTP", error: error.message });
  }
};

// -------------------- Login (Verify OTP) --------------------
export const loginFarmer = async (req, res) => {
  const { phonenumber, code } = req.body;
  try {
    if (!phonenumber || !code) {
      return res.status(400).json({ success: false, message: "Phone number and OTP code required" });
    }

    const phoneStr = phonenumber.toString();
    const formattedPhone = `+91${phoneStr}`;

    const verificationCheck = await client.verify.v2.services(process.env.TWILIO_SERVICE_SID)
      .verificationChecks.create({
        to: formattedPhone,
        code
      });

    if (verificationCheck.status !== "approved") {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    const user = await User.findOne({ phonenumber: phoneStr });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Generate tokens after OTP verification
    const { accessToken, refreshToken } = generateTokens(user._id);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user,
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.log("Error in loginFarmer:", error);
    return res.status(500).json({ success: false, message: "Login failed", error: error.message });
  }
};

// -------------------- Refresh Token --------------------
export const refreshAccessToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ success: false, message: "Refresh token required" });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.AGRIASSIST_REFRESH_KEY);
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(decoded.id);

    return res.status(200).json({
      success: true,
      accessToken,
      refreshToken: newRefreshToken 
    });
  } catch (error) {
    return res.status(403).json({ success: false, message: "Invalid refresh token" });
  }
};

// -------------------- Test Twilio Config --------------------
export const checkTwilioConfig = async (req, res) => {
  try {
    const account = await client.api.accounts(client.accountSid).fetch();
    return res.status(200).json({ success: true, status: account.status });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Twilio config check failed", error: error.message });
  }
};

// -------------------- Test Simple SMS --------------------
export const sendTestSMS = async (req, res) => {
  const { phonenumber, message } = req.body;
  try {
    if (!phonenumber || !message) {
      return res.status(400).json({ success: false, message: "Phone number and message required" });
    }

    const formattedPhone = `+91${phonenumber}`;
    const msg = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedPhone
    });

    return res.status(200).json({ success: true, message: "Test SMS sent", sid: msg.sid });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to send SMS", error: error.message });
  }
};

// -------------------- Logout Farmer --------------------
export const farmerLogout = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ success: false, message: "Refresh token is required for logout" });
    }

    // Optionally, you can maintain a blacklist of invalidated refresh tokens
    // or remove it from a user's document if you store refresh tokens in DB
    // For simplicity, we'll just tell client to delete it

    return res.status(200).json({
      success: true,
      message: "Logout successful. Please delete your tokens on client-side."
    });
  } catch (error) {
    console.error("Error in farmerLogout:", error);
    return res.status(500).json({
      success: false,
      message: "Logout failed",
      error: error.message
    });
  }
};

