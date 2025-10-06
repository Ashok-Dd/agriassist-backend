import openai from "../utils/aiHelpers.js";

export const getCropRecommendations = async (req, res) => {
  try {
    const { farmName, soilReport, location, waterSource, totalArea } = req.body;
    if (!soilReport) {
      return res
        .status(400)
        .json({ success: false, error: "Soil details are required" });
    }

    // Ask OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
You are AgriAssist AI, a smart farming assistant.  
Your job is to analyze farm & soil details and recommend the best crops to start a new crop cycle.

Always return a JSON object with the key "recommendedCrops".  
Each element of "recommendedCrops" must strictly match the backend MongoDB schema used for crop cycles.

Each recommended crop object must include these fields:

{
  "farm": "<ObjectId or placeholder>",
  "farmer": "<ObjectId or placeholder>",
  "crop": {
    "name": "string",
    "variety": "string (optional)",
    "category": "Cereal" | "Pulse" | "Oilseed" | "Vegetable" | "Fruit" | "Cash Crop"
  },
  "season": "Kharif" | "Rabi" | "Zaid",
  "cropStage": "Planning", // always default to "Planning"
  "timeline": {
    "sowingDate": null,
    "expectedHarvestDate": null,
    "actualHarvestDate": null,
    "duration": number (days till harvest)
  },
  "aiRecommendations": {
    "initialPlan": {
      "fertilizerSchedule": [],
      "irrigationSchedule": []
    }
  },
  "expenses": {
    "seeds": 0,
    "fertilizers": 0,
    "pesticides": 0,
    "irrigation": 0,
    "labor": 0,
    "other": 0,
    "total": 0
  },
  "yield": {
    "expected": number (expected yield in quintals/acre),
    "actual": null,
    "unit": "quintals/acre",
    "quality": ""
  },
  "status": "Active",
  "confidence": number (0–100, how confident the AI is this crop will thrive),
  "reason": "string (why this crop is suitable for the given soil and season)"
}

Example:
{
  "recommendedCrops": [
    {
      "farm": "placeholderFarmId",
      "farmer": "placeholderFarmerId",
      "crop": {
        "name": "Rice",
        "variety": "IR-64",
        "category": "Cereal"
      },
      "season": "Kharif",
      "cropStage": "Planning",
      "timeline": {
        "sowingDate": null,
        "expectedHarvestDate": null,
        "actualHarvestDate": null,
        "duration": 120
      },
      "aiRecommendations": {
        "initialPlan": {
          "fertilizerSchedule": [],
          "irrigationSchedule": []
        }
      },
      "expenses": {
        "seeds": 0,
        "fertilizers": 0,
        "pesticides": 0,
        "irrigation": 0,
        "labor": 0,
        "other": 0,
        "total": 0
      },
      "yield": {
        "expected": 45,
        "actual": null,
        "unit": "quintals/acre",
        "quality": ""
      },
      "status": "Active",
      "confidence": 90,
      "reason": "Rice grows well in high-moisture Kharif conditions with fertile alluvial soil."
    }
  ]
}
`
,
        },
        {
          role: "user",
          content: `
            Farm: ${farmName || "Unnamed Farm"}
            Location: ${location || "Unknown"}
            Soil Report: pH ${soilReport.ph}, N ${soilReport.nitrogen}, P ${soilReport.phosphorus}, K ${soilReport.potassium}, OC ${soilReport.organicCarbon}
            Water Source: ${waterSource?.type || "Unknown"} (${waterSource?.availability || "N/A"}, ${waterSource?.quality || "N/A"})
            Total Area: ${totalArea?.value || "?"} ${totalArea?.unit || ""}
            Suggest 3–5 best crops for this farm.
          `,
        },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }, // force JSON object
    });

    // Clean + parse response
    let raw = completion.choices[0].message.content.trim();
    raw = raw.replace(/```json/g, "").replace(/```/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      console.error("❌ JSON Parse Error:", err, "\nRaw:", raw);
      return res
        .status(500)
        .json({ success: false, error: "Failed to parse AI response" });
    }

    // ✅ Guarantee array

    console.log('response returned to frontend');
    
    res.json({
      success: true,
      recommendedCrops: Array.isArray(parsed.recommendedCrops)
        ? parsed.recommendedCrops
        : [],
    });
  } catch (error) {
    console.error("❌ AI Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
