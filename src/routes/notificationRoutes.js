import { Router } from "express";
import { scheduleNotification } from "../controllers/notificationController.js";


const notificationRouter = Router() ;

notificationRouter.post('/send' ,scheduleNotification) ;

export default notificationRouter ;
