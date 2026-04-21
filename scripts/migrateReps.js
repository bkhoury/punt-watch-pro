const admin = require("firebase-admin");
const serviceAccount = require("../serviceAccountKey.json");

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

async function migrate() {
  const snapshot = await db.collection("reps").get();

  if (snapshot.empty) {
    console.log("No reps found.");
    return;
  }

  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.update(doc.ref, { isAssigned: false, isAccepted: false });
  });

  await batch.commit();
  console.log(`Updated ${snapshot.size} reps with isAssigned and isAccepted fields.`);
}

migrate().catch(console.error);
