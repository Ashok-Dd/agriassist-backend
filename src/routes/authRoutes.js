import {registerFarmer , sendOtp , loginFarmer , refreshAccessToken , sendTestSMS , checkTwilioConfig, farmerLogout, verifyOtp, sendOtpForRegsiter} from "../controllers/authController.js";

import { Router } from "express";
import { verifyRefreshToken } from "../middleware/authMiddleware.js";

const authRouter = Router();

// 🌱 Farmer Auth Routes
authRouter.post("/register", registerFarmer);       // Register farmer & get tokens
authRouter.post("/send-otp", sendOtp);    
authRouter.post('/send-otp-to-register' , sendOtpForRegsiter) ;          // Send OTP for Register
authRouter.post('/verify-otp-for-register' , verifyOtp) ;
authRouter.post("/login", loginFarmer);             // Verify OTP + issue tokens
authRouter.post("/refresh-token", verifyRefreshToken, refreshAccessToken); 
authRouter.post('/logout' , farmerLogout) ;


// 🛠️ Twilio Test Routes
authRouter.get("/test-twilio", checkTwilioConfig);  // Check Twilio setup
authRouter.post("/test-sms", sendTestSMS);          // Send a test SMS

export default authRouter;
