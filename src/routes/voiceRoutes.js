import { Router } from "express";
import { getAIResponse, getAIResponseWithVoice } from "../controllers/voiceController.js";

const voiceRouter = Router() ;

voiceRouter.post('/' , getAIResponse) ;
voiceRouter.post('/voice' , getAIResponseWithVoice) ;


export default voiceRouter ;
