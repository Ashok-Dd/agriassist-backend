import { User } from "../models/User.js";
import { Farm } from "../models/Farm.js";
import { validationResult } from "express-validator";

// -------------------- Get Profile --------------------
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate("farmProfiles", "farmName cropType area location")
      .select("-__v");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User profile not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
      error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
    });
  }
};

// -------------------- Update Profile --------------------
export const updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { name, language, location } = req.body;
    const userId = req.user.id;

    const updateData = {};
    if (name) updateData.name = name.trim();
    if (language && ["Telugu", "Hindi", "English"].includes(language)) updateData.language = language;
    if (location) {
      updateData.location = {};
      if (location.state) updateData.location.state = location.state;
      if (location.district) updateData.location.district = location.district;
      if (location.mandal) updateData.location.mandal = location.mandal;
      if (location.village) updateData.location.village = location.village;
      if (location.coordinates) {
        updateData.location.coordinates = {
          latitude: location.coordinates.latitude,
          longitude: location.coordinates.longitude,
        };
      }
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
      select: "-__v",
    }).populate("farmProfiles", "farmName cropType area location");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Update profile error:", error);

    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map((err) => ({
        field: err.path,
        message: err.message,
      }));

      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
    });
  }
};

// -------------------- Update Preferences --------------------
export const updatePreferences = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { notifications, units } = req.body;
    const userId = req.user.id;

    const updateData = { preferences: {} };
    if (notifications) {
      updateData.preferences.notifications = {};
      if (typeof notifications.disease === "boolean") updateData.preferences.notifications.disease = notifications.disease;
      if (typeof notifications.fertilizer === "boolean") updateData.preferences.notifications.fertilizer = notifications.fertilizer;
      if (typeof notifications.irrigation === "boolean") updateData.preferences.notifications.irrigation = notifications.irrigation;
      if (typeof notifications.market === "boolean") updateData.preferences.notifications.market = notifications.market;
    }

    if (units) {
      updateData.preferences.units = {};
      if (units.area && ["acre", "hectare"].includes(units.area)) updateData.preferences.units.area = units.area;
      if (units.weight && ["kg", "quintal"].includes(units.weight)) updateData.preferences.units.weight = units.weight;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true, select: "preferences name language" }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Preferences updated successfully",
      data: { preferences: updatedUser.preferences },
    });
  } catch (error) {
    console.error("Update preferences error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update preferences",
      error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
    });
  }
};

// -------------------- Get Farms --------------------
export const getFarms = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId)
      .populate({ path: "farmProfiles", select: "-__v", options: { sort: { createdAt: -1 } } })
      .select("farmProfiles");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const farms = user.farmProfiles || [];
    res.status(200).json({
      success: true,
      message: "Farms retrieved successfully",
      count: farms.length,
      data: farms,
    });
  } catch (error) {
    console.error("Get farms error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve farms",
      error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
    });
  }
};

// -------------------- Delete Account --------------------
export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const { confirmation } = req.body;

    if (confirmation !== "DELETE_MY_ACCOUNT") {
      return res.status(400).json({
        success: false,
        message: 'Account deletion requires confirmation. Send "DELETE_MY_ACCOUNT" in confirmation field',
      });
    }

    const user = await User.findById(userId).populate("farmProfiles");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User account not found",
      });
    }

    // Delete associated farm profiles if any
    if (user.farmProfiles && user.farmProfiles.length > 0) {
      const farmIds = user.farmProfiles.map((farm) => farm._id);
      await User.model("FarmProfile").deleteMany({ _id: { $in: farmIds } });
    }

    // Delete user account
    await User.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      message: "Account deleted successfully. All associated data removed.",
      deletedData: {
        farmsDeleted: user.farmProfiles ? user.farmProfiles.length : 0,
      },
    });
  } catch (error) {
    console.error("Delete account error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete account",
      error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
    });
  }
};