import dotenv from "dotenv";
import http from "http";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";
import cropCycleRoutes from "./routes/cropCycleRoutes.js";
import farmRouter from "./routes/farmRoutes.js";
import voiceRouter from "./routes/voiceRoutes.js";


dotenv.config();

const app = express();
const server = http.createServer(app);


app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use('/api/user' , userRouter) ;
app.use('/api/farm',farmRouter) ; 
app.use('/api/chat' , voiceRouter) ;
app.use('/api/crop-cycle',cropCycleRoutes) ;

server.listen(9000 , () => {
    console.log("Server is running at 9000")
});

mongoose.connect('mongodb://127.0.0.1:27017/Agriassist_DB')
.then(() => console.log("connected to DB"))
.catch(() => console.log("failed to connect"));