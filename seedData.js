import admin from 'firebase-admin';
import { readFileSync } from 'fs';

const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function seedData() {
  try {
    // 1. System Prompts
    const systemPromptsRef = db.collection('config').doc('systemPrompts');
    await systemPromptsRef.set({
      appPrompt: "You are an expert app developer. Generate code for an app that does: {idea}",
      websitePrompt: "You are an expert web developer. Generate code for a website that does: {idea}"
    });
    console.log("✅ System Prompts seeded successfully!");

    // 2. Pricing Plans
    const pricingRef = db.collection('config').doc('pricing');
    await pricingRef.set({
      plans: [
        { id: "basic",   name: "Basic",   price: 99,  credits: 499,  popular: false },
        { id: "popular", name: "Popular", price: 299, credits: 1599, popular: true  },
        { id: "premium", name: "Premium", price: 499, credits: 2999, popular: false }
      ]
    });
    console.log("✅ Pricing Plans seeded successfully!");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    process.exit(1);
  }
}

seedData();
