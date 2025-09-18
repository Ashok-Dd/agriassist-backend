import {registerFarmer , sendOtp , loginFarmer , refreshAccessToken , sendTestSMS , checkTwilioConfig} from "../controllers/authController.js";

import { Router } from "express";
import { verifyRefreshToken } from "../middleware/authMiddleware.js";

const authRouter = Router();

// 🌱 Farmer Auth Routes
authRouter.post("/register", registerFarmer);       // Register farmer & get tokens
authRouter.post("/send-otp", sendOtp);              // Send OTP for login
authRouter.post("/login", loginFarmer);             // Verify OTP + issue tokens
authRouter.post("/refresh-token", verifyRefreshToken, refreshAccessToken); 

// 🛠️ Twilio Test Routes
authRouter.get("/test-twilio", checkTwilioConfig);  // Check Twilio setup
authRouter.post("/test-sms", sendTestSMS);          // Send a test SMS

export default authRouter;
