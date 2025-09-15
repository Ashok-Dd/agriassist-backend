import { RegisterFarmer } from "../services/authService.js";

export const farmerRegister = async(req,res)=>{
    const {phonenumber,name,language,location,preferences} = req.body;
    try {
        const newUser = await RegisterFarmer({
            phonenumber,
            name,
            language,
            location,
            preferences

        });
        res.status(200).json({success:true,userid:newUser._id,message:"User Registered Successfully!!"})
    } catch (error) {
        console.error(error.message);
        res.status(400).json({success:false,message:error.message||"internal server"})
        
    }

}