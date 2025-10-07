import cron from "node-cron";
import fetch from "node-fetch";

/**
 * Schedule a notification
 * @param {*} req - Express request
 * @param {*} res - Express response
 */
export const scheduleNotification = async (req, res) => {
  try {
    const { expoPushToken, message, time } = req.body;

    if (!expoPushToken || !message || !time) {
      return res.status(400).json({ error: "expoPushToken, message, and time are required" });
    }

    // Parse time "HH:mm"
    const [hour, minute] = time.split(":");

    // Create a cron job for given time (runs daily at that time)
    cron.schedule(`${minute} ${hour} * * *`, () => {
      sendPushNotification(expoPushToken, message);
    });

    return res.json({ status: "✅ Notification scheduled", message, time });
  } catch (error) {
    console.error("Error scheduling notification:", error);
    return res.status(500).json({ error: "Server error while scheduling notification" });
  }
};

/**
 * Function to send push notification via Expo Push API
 */
async function sendPushNotification(expoPushToken, message) {
  try {
    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Accept-Encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: expoPushToken,
        sound: "default",
        title: "🚜 Farmer Alert",
        body: message,
      }),
    });
    console.log("✅ Notification sent:", message);
  } catch (err) {
    console.error("❌ Failed to send notification:", err);
  }
}
