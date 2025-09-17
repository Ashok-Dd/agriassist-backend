import dotenv from "dotenv";
import http from "http";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";


dotenv.config();
const app = express();

const server = http.createServer(app);

    
app.use(cors({ origin: "*" }));   
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use('/api/user' , userRouter) ;


server.listen(9000 , () => {
    console.log("server is running at 9005")
});

mongoose.connect('mongodb://localhost:27017/Farmer_DB')
.then(() => console.log("connected to DB"))
.catch(() => console.log("failed to connect"));