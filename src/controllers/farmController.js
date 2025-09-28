import { Farm } from "../models/Farm.js";


export const farmRegister = async (req, res) => {
  try {
    const {farmer, farmName, totalArea, location, soilReport, waterSource } = req.body;

    if (!farmName || !totalArea || !location) {
      return res.status(400).json({success: false,message: "Farm name, total area, and location are required!", });
    }
    const newFarm = new Farm({farmer,farmName,totalArea,location,soilReport,waterSource });

    await newFarm.save();
    return res.status(201).json({success: true, message: "Farm added successfully!", data: newFarm});
  } catch (error) {
    console.error("Add Farm Error:", error);
    return res.status(500).json({success: false,message: "Failed to add farm",error: error.message,});
  }
};

export const getFarms = async (req, res) => {
  try {
    const farmerId = req.user.id || req.user._id;
    const farms = await Farm.find({ farmer: farmerId });
   

    if (!farms || farms.length === 0) {
      return res.status(200).json({success: true,message: "No farms found",count: 0,data: [],});
    }

    return res.status(200).json({success: true,message: "Farms retrieved successfully",count: farms.length,data: farms,});
  } catch (error) {
    return res.status(500).json({success: false,message: "Failed to fetch farms",error: error.message });
  }
};


export const updateFarm = async (req, res) => {
  try {
    const farmId = req.params.farmId.trim();
    console.log("Updating farm with ID:", `"${farmId}"`);
    const updatedFarm = await Farm.findByIdAndUpdate(farmId,{ $set: req.body },{ new: true });

    if (!updatedFarm) {
    return res.status(404).json({success: false,message: "Farm not found"});
    }

    res.json({success: true,message: "Farm updated successfully",farm: updatedFarm,});
  } catch (err) {
    res.status(500).json({success: false,message: "Failed to update farm",error: err.message});
  }
};
export const deleteFarm = async(req,res)=>{
    try {
        const farmId= req.params.farmId.trim();
        const deleteFarm = await Farm.findByIdAndDelete(farmId);
        if(!deleteFarm){
            return res.status(400).json({success:false,message:"No Farm found with this id"});
        }
        return res.status(200).json({success:true,message:"Successfully deleted the Farm"});
        
    } catch (error) {
        return res.status(500).json({success:false,message:"Failed to delete the farm"})
    }
}
