import { Router } from "express";
import { getCropRecommendations } from "../controllers/recommendationController.js";

const recommendationRoutes = Router() ;

recommendationRoutes.post('/crop-recommendation' , getCropRecommendations) ;


export default recommendationRoutes ;