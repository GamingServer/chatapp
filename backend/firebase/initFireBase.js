var admin = require("firebase-admin");

var serviceAccount = require("./chatapp-a8048-firebase-adminsdk-fbsvc-374beff29f.json");

const initFirebase = async () => {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://chatapp-a8048-default-rtdb.firebaseio.com",
  });
};

/**
 * Sends a push notification only if user is offline
 * @param {string} userId - Firebase UID or your own user ID
 * @param {string} deviceToken - FCM device token
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 */
const sendNotification = async (deviceToken, title, body) => {
  try {
    const message = {
      notification: {
        title: title,
        body: body,
      },
      token: deviceToken,
    };

    await admin.messaging().send(message);
  } catch (error) {
    console.error("Error checking status or sending notification:", error);
  }
};

module.exports = { initFirebase, sendNotification };
