import { getAllCropCycles, getCropCycle, startCropCycle } from "../controllers/cropCycleController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

import { Router } from "express";

const cropCycleRoutes = Router();

cropCycleRoutes.post('/start/:farmerId/:farmId',startCropCycle) ;
cropCycleRoutes.get('/:cycleId',verifyToken,getCropCycle) ;
cropCycleRoutes.get('/get-all-crop-cycles/:farmerId' , getAllCropCycles) ;

export default cropCycleRoutes