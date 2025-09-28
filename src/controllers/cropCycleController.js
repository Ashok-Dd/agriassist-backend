import {cropCycle} from "../models/CropCycle.js";

export const startCropCycle = async (req, res) => {
  try {
   
    const { farmerId , farmId } = req.params
    if (!farmerId || !farmId) {return res.status(400).json({success: false, message: "Farmer ID or Farm ID missing"});
    }
    const { crop, season, timeline, aiRecommendations, expenses, yield: yieldData } = req.body;
    if (!crop || !season || !timeline) {
      return res.status(400).json({success: false,message: "Crop, season, and timeline are required",});
    }
    const newCycle = await cropCycle.create({farm: farmId,farmer: farmerId,crop,season,timeline,aiRecommendations,expenses,yield: yieldData,status: "Active"});

    return res.status(201).json({ success: true, message: "Crop cycle started successfully", data: newCycle,  });
  } catch (error) {
    console.error("Error in startCropCycle:", error);
    return res.status(500).json({success: false,message: "Failed to start crop cycle",error: error.message});
  }
};

export const getCropCycle = async (req, res) => {
  try {
    const { cycleId } = req.params;
    const { farmerId, farmId } = req.query;

    if (!farmerId || !farmId) {
      return res.status(400).json({ success: false, message: "Farmer ID or Farm ID missing" });
    }

    const cycle = await cropCycle.findOne({ _id: cycleId, farmer: farmerId, farm: farmId });
    if (!cycle) {
      return res.status(404).json({ success: false, message: "Crop cycle not found" });
    }

    return res.status(200).json({ success: true, data: cycle });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch crop cycle", error: error.message });
  }
};


export const getAllCropCycles = async(req , res) => {
  try {
    const { farmerId } = req.params;
    const allCycles = await cropCycle.find({farmer : farmerId}) ;
    return res.status(200).json({message : "All crop cycles are fetched " , success : true , allCycles})
  } catch (error) { 
    console.log(error)
    return res.status(500).json({ success: false, message: "Failed to fetch all crop cycles", error: error.message });
  }
}