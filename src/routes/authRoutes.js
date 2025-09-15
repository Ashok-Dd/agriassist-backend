import { farmerRegister } from "../controllers/authController.js";
import { Router } from "express";

const authRouter = Router();
authRouter.post('/register',farmerRegister);
export default authRouter;