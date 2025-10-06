import { deleteFarm, farmRegister, getFarms, updateFarm } from "../controllers/farmController.js";
import {Router} from 'express';
import { verifyToken } from "../middleware/authMiddleware.js";


const farmRouter =  Router() ;

farmRouter.post('/register', farmRegister);
farmRouter.get('/get/:farmerId', getFarms)
farmRouter.put("/update/:farmId", updateFarm);
farmRouter.delete("/delete/:farmId", deleteFarm)

export default farmRouter;