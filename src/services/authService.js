import { User } from "../models/User.js"

export const RegisterFarmer = async({phonenumber,name,language,location,preferences}) =>{
    const existingUser = await User.findOne({phonenumber})
    if(existingUser){
         throw new Error("phonenumber is already exists!!")
    }
    const newUser = await User.create({
        phonenumber,
        name,
        language:language||"telugu",
        location:location||{},
        preferences:preferences||{},
        isVerified:false
        
    });
    return newUser;
}
