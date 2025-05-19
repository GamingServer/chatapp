const admin = require("firebase-admin");
const serviceAccount = require("./chatapp-a8048-firebase-adminsdk-fbsvc-374beff29f.json");

const initFirebase = async () => {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: "https://chatapp-a8048-default-rtdb.firebaseio.com", // Add this
    });
  }
};

/**
 * Sends a push notification only if user is offline
 * @param {string} userId - Firebase UID or your own user ID
 * @param {string} deviceToken - FCM device token
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 */
const sendNotificationIfOffline = async (userId, deviceToken, title, body) => {
  try {
    const statusRef = admin.database().ref(`/status/${userId}`);
    const snapshot = await statusRef.once("value");
    const status = snapshot.val();

    if (status?.state === "offline") {
      const message = {
        notification: { title, body },
        token: deviceToken,
      };

      const response = await admin.messaging().send(message);
      console.log("Notification sent successfully:", response);
    } else {
      console.log(`User ${userId} is online – no notification sent.`);
    }
  } catch (error) {
    console.error("Error checking status or sending notification:", error);
  }
};

module.exports = { initFirebase, sendNotificationIfOffline };
