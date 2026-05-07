import { db } from './firebase';
import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';

// ─── System Prompts ───────────────────────────────────────────────────────────

export interface SystemPrompts {
  appPrompt: string;
  websitePrompt: string;
  updatedAt?: unknown;
}

export async function getSystemPrompts(): Promise<SystemPrompts> {
  const snap = await getDoc(doc(db, 'config', 'systemPrompts'));
  if (snap.exists()) return snap.data() as SystemPrompts;
  return { appPrompt: '', websitePrompt: '' };
}

export async function saveSystemPrompts(prompts: Omit<SystemPrompts, 'updatedAt'>) {
  await setDoc(doc(db, 'config', 'systemPrompts'), {
    ...prompts,
    updatedAt: serverTimestamp(),
  });
}

// ─── Pricing Plans ────────────────────────────────────────────────────────────

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  credits: number;
  popular: boolean;
}

export async function getPricingPlans(): Promise<PricingPlan[]> {
  const snap = await getDoc(doc(db, 'config', 'pricing'));
  if (snap.exists()) {
    const data = snap.data();
    return (data.plans as PricingPlan[]) ?? [];
  }
  return [];
}

export async function savePricingPlans(plans: PricingPlan[]) {
  await setDoc(doc(db, 'config', 'pricing'), {
    plans,
    updatedAt: serverTimestamp(),
  });
}

// ─── Users ────────────────────────────────────────────────────────────────────

export interface AppUser {
  uid: string;
  email: string;
  credits: number;
  createdAt: number;
}

export async function getAllUsers(limitCount = 100): Promise<AppUser[]> {
  const q = query(
    collection(db, 'users'),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ uid: d.id, ...d.data() } as AppUser));
}

export async function updateUserCredits(uid: string, credits: number) {
  await updateDoc(doc(db, 'users', uid), { credits });
}
