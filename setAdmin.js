import admin from 'firebase-admin';
import { readFileSync } from 'fs';

// 1. Download your service account key from Firebase Console -> Project Settings -> Service Accounts
// 2. Save it in the same folder as this script and name it serviceAccountKey.json
const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// 3. Put your User UID here (find this in the Firebase Console -> Authentication)
const YOUR_UID = "ie36nQPl4ET0IGecTDEkX3acYh82";

admin.auth().setCustomUserClaims(YOUR_UID, { admin: true })
  .then(() => {
    console.log(`✅ Success! User ${YOUR_UID} is now an admin.`);
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error setting custom claim:", error);
    process.exit(1);
  });
