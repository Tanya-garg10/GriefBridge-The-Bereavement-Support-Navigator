/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import fs from 'fs/promises';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

// Use current working directory for runtime asset paths
const __dirname = process.cwd();

const app = express();
const PORT = 3000;
const DB_FILE = path.join(process.cwd(), 'db-store.json');

app.use(express.json());

// Initialize Gemini Server-side client if key exists
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== 'MY_GEMINI_API_KEY') {
      try {
        aiClient = new GoogleGenAI({
          apiKey: key,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            }
          }
        });
        console.log("Gemini Client successfully initialized server-side.");
      } catch (error) {
        console.error("Failed to initialize Gemini client:", error);
      }
    }
  }
  return aiClient;
}

// Global database initial state setup
interface DbSchema {
  users: Record<string, any>;
  journals: any[];
  resources: any[];
  posts: any[];
  checkins: any[];
}

const DEFAULT_RESOURCES = [
  {
    id: "res-1",
    name: "Calm Harbor Grief Therapy Guild",
    type: "therapist",
    address: "742 Evergreen Terrace, Suite 101",
    description: "In-person and online professional counselling specializing in sudden bereavement, prolonged grief disorder, and marital breakdown recovery.",
    phone: "(555) 019-2834",
    website: "https://example.com/calm-harbor",
    latitude: 47.6062,
    longitude: -122.3321,
    cost: "sliding-scale",
    specialization: ["bereavement", "relationship-breakdown", "life-transition"],
    languages: ["English", "Spanish"],
    rating: 4.9
  },
  {
    id: "res-2",
    name: "Divorce & Relationship Healing Circles",
    type: "support-group",
    address: "St. Jude Community Center, Room 4",
    description: "Weekly peer-led circles focusing on rebuilding identity, letting go of resentment, and co-parenting navigation after separation.",
    phone: "(555) 012-5812",
    website: "https://example.com/separation-circles",
    latitude: 47.6101,
    longitude: -122.3421,
    cost: "free",
    specialization: ["relationship-breakdown", "divorce"],
    languages: ["English"],
    rating: 4.7
  },
  {
    id: "res-3",
    name: "Sunrise Path Career Transition Clinic",
    type: "ngo",
    address: "410 Pine Street, Floor 3",
    description: "Comprehensive support for coping with sudden career loss, redundancy, and identity reconstruction after long-term tenure termination.",
    phone: "(555) 015-9921",
    website: "https://example.com/sunrise-path",
    latitude: 47.5997,
    longitude: -122.3344,
    cost: "free",
    specialization: ["job-loss", "life-transition"],
    languages: ["English", "Mandarin"],
    rating: 4.8
  },
  {
    id: "res-4",
    name: "Emerald City Bereaved Parents NGO",
    type: "ngo",
    address: "1802 Broadway East",
    description: "A highly specialized nonprofit compassionate network offering peer match schemes, memorial events, and targeted pediatric loss counseling.",
    phone: "(555) 014-4112",
    website: "https://example.com/emerald-city-parents",
    latitude: 47.6186,
    longitude: -122.3155,
    cost: "free",
    specialization: ["bereavement"],
    languages: ["English", "Vietnamese"],
    rating: 5.0
  },
  {
    id: "res-5",
    name: "Sisu Transition & Mindfulness Center",
    type: "community-center",
    address: "900 Denny Way, Space B",
    description: "Integrative community hub offering daily somatic healing yoga, mindful breathing groups, and art therapy workshops for severe loss.",
    phone: "(555) 017-7722",
    website: "https://example.com/sisu-mindfulness",
    latitude: 47.6188,
    longitude: -122.3411,
    cost: "premium",
    specialization: ["life-transition", "bereavement", "job-loss"],
    languages: ["English", "French"],
    rating: 4.6
  }
];

const DEFAULT_POSTS = [
  {
    id: "post-1",
    category: "bereavement",
    title: "Navigating the first anniversary since my daughter passed away...",
    body: "Tomorrow marks exactly one year since Amelia lost her battle with cancer. The grief feels just as sharp and overwhelming as it did that rainy morning. People around me expect me to be 'back to normal' by now, but I still cry every single time I find one of her stray hairclips. Does the weight of this ever change? Or do we just get stronger at carrying it?",
    authorId: "user-seed-1",
    authorName: "AnxiousCloud",
    authorAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop",
    anonymous: true,
    likes: 12,
    likedBy: [],
    replies: [
      {
        id: "rep-1",
        postId: "post-1",
        body: "I am so deeply sorry for your loss. I lost my husband two years ago. The weight never decreases, but trust me, GriefBridge does build a buffer around it. You don't grief less; you expand around it. Please be gentle on yourself tomorrow.",
        authorId: "user-seed-2",
        authorName: "Grace_A",
        authorAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
        anonymous: false,
        createdAt: new Date(Date.now() - 6 * 3600000).toISOString()
      },
      {
        id: "rep-2",
        postId: "post-1",
        body: "I struggle with the 'back to normal' comments, too. Society is impatient with grief. Take all the time Amelia deserves. You carry her in your breath.",
        authorId: "user-seed-3",
        authorName: "SoulMender",
        authorAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
        anonymous: true,
        createdAt: new Date(Date.now() - 2 * 3600000).toISOString()
      }
    ],
    createdAt: new Date(Date.now() - 12 * 3600000).toISOString(),
    tags: ["ANNIVERSARY", "CHILD-LOSS", "SOLITUDE"]
  },
  {
    id: "post-2",
    category: "divorce",
    title: "Is it normal to grieve the spouse who initiated the divorce?",
    body: "My husband initiated the divorce. It has been a year. I am angry, betrayed, and yet when I woke up today, I found myself deeply missing the way he laughed at silly commercials. I feel foolish for crying over someone who didn't want to carry this marriage further. Is anyone else experiencing this conflict between anger and bereavement?",
    authorId: "user-seed-4",
    authorName: "HopeRebuilder",
    authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
    anonymous: false,
    likes: 8,
    likedBy: [],
    replies: [
      {
        id: "rep-3",
        postId: "post-2",
        body: "Absolutely 100% normal. You are mourning the loss of the life and future you thought you had, and the person they once were. It's okay to split your heart between grief for the past and hope for your new personal independence. Take heart.",
        authorId: "user-seed-5",
        authorName: "PeaceSeeker",
        authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
        anonymous: false,
        createdAt: new Date(Date.now() - 1 * 3600000).toISOString()
      }
    ],
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
    tags: ["DIVORCE", "COMPLEX-EMOTION", "REBUILDING"]
  },
  {
    id: "post-3",
    category: "job-loss",
    title: "Laid off after 14 years at the same firm. Feeling lost.",
    body: "Corporate restructure claimed my division on Friday. For 14 years, my self-esteem and daily identity were tied to being the reliable director of engineering there. Now I wake up at 7:00 AM with absolute dread. I feel like a blank page that everyone has closed. Sharing here because the transition feels like a physical bereavement.",
    authorId: "user-seed-6",
    authorName: "Phoenix101",
    authorAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
    anonymous: true,
    likes: 5,
    likedBy: [],
    replies: [],
    createdAt: new Date(Date.now() - 36 * 3600000).toISOString(),
    tags: ["IDENTITY-LOSS", "FINANCIAL-STRESS", "REDUNDANCY"]
  }
];

// Read-Write Helper functions with active Firebase Firestore integration and local file fallback
let firestoreDb: any = null;
let isFirebaseActive = false;

function isValidFirebaseConfig(config: any): boolean {
  if (!config || typeof config !== 'object') return false;
  const requiredFields = ['projectId', 'appId', 'apiKey', 'authDomain', 'firestoreDatabaseId'];
  return requiredFields.every((field) => {
    const value = config[field];
    return typeof value === 'string' && value.trim().length > 0 && !value.includes('YOUR_FIREBASE') && !value.includes('YOUR_FIRESTORE');
  });
}

async function checkAndInitFirebase(): Promise<boolean> {
  if (firestoreDb) return true;
  try {
    const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
    const configRaw = await fs.readFile(configPath, 'utf-8');
    const config = JSON.parse(configRaw);
    if (!isValidFirebaseConfig(config)) {
      console.warn("Firebase config is missing or still contains placeholder values. Falling back to local file DB.");
      isFirebaseActive = false;
      return false;
    }

    const { initializeApp } = await import('firebase/app');
    const { getFirestore } = await import('firebase/firestore');
    const firebaseApp = initializeApp(config);
    firestoreDb = getFirestore(firebaseApp, config.firestoreDatabaseId);
    isFirebaseActive = true;
    console.log("Firebase Firestore successfully initialized and activated in full-stack server.");
    return true;
  } catch (error) {
    console.error("Firebase initialization failed, utilizing local file DB fallback:", error);
    isFirebaseActive = false;
  }
  return false;
}

async function seedFirestoreIfNeeded(): Promise<void> {
  try {
    const { collection, getDocs, doc, setDoc } = await import('firebase/firestore');
    
    // Seed resources
    const resSnap = await getDocs(collection(firestoreDb, 'resources'));
    if (resSnap.empty) {
      console.log("Seeding fresh professional resources into cloud Firestore...");
      for (const res of DEFAULT_RESOURCES) {
        await setDoc(doc(firestoreDb, 'resources', res.id), res);
      }
    }
    
    // Seed posts
    const postsSnap = await getDocs(collection(firestoreDb, 'posts'));
    if (postsSnap.empty) {
      console.log("Seeding initial community support posts into cloud Firestore...");
      for (const p of DEFAULT_POSTS) {
        await setDoc(doc(firestoreDb, 'posts', p.id), p);
      }
    }
  } catch (error) {
    console.error("Failed to seed initial Firestore data:", error);
  }
}

async function initDb(): Promise<DbSchema> {
  await checkAndInitFirebase();
  
  if (isFirebaseActive) {
    try {
      const { collection, getDocs } = await import('firebase/firestore');
      
      // Load all firestore collections in robust parallel execution
      const [usersSnap, journalsSnap, checkinsSnap, postsSnap, resourcesSnap] = await Promise.all([
        getDocs(collection(firestoreDb, 'users')),
        getDocs(collection(firestoreDb, 'journals')),
        getDocs(collection(firestoreDb, 'checkins')),
        getDocs(collection(firestoreDb, 'posts')),
        getDocs(collection(firestoreDb, 'resources'))
      ]);
      
      const users: Record<string, any> = {};
      usersSnap.forEach(doc => {
        users[doc.id] = doc.data();
      });
      
      const journals: any[] = [];
      journalsSnap.forEach(doc => {
        journals.push(doc.data());
      });
      
      const checkins: any[] = [];
      checkinsSnap.forEach(doc => {
        checkins.push(doc.data());
      });
      
      const posts: any[] = [];
      postsSnap.forEach(doc => {
        posts.push(doc.data());
      });
      
      const resources: any[] = [];
      resourcesSnap.forEach(doc => {
        resources.push(doc.data());
      });
      
      // Auto-trigger database seeding if resources/posts directories are fresh
      let needsSeed = false;
      const finalResources = resources.length > 0 ? resources : (needsSeed = true, DEFAULT_RESOURCES);
      const finalPosts = posts.length > 0 ? posts : (needsSeed = true, DEFAULT_POSTS);
      
      if (needsSeed) {
        seedFirestoreIfNeeded();
      }
      
      return {
        users,
        journals,
        resources: finalResources,
        posts: finalPosts,
        checkins
      };
    } catch (error) {
      console.error("Firestore read execution failed. Falling back to safe local storage...", error);
    }
  }
  
  // Local File DB recovery flow
  try {
    const data = await fs.readFile(DB_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    
    // Ensure all keys exist
    if (!parsed.users) parsed.users = {};
    if (!parsed.journals) parsed.journals = [];
    if (!parsed.resources) parsed.resources = DEFAULT_RESOURCES;
    if (!parsed.posts) parsed.posts = DEFAULT_POSTS;
    if (!parsed.checkins) parsed.checkins = [];
    
    return parsed;
  } catch (error) {
    // Inject and write cold start layout
    const newDb: DbSchema = {
      users: {},
      journals: [],
      resources: DEFAULT_RESOURCES,
      posts: DEFAULT_POSTS,
      checkins: []
    };
    await writeDb(newDb);
    return newDb;
  }
}

async function writeDb(data: DbSchema): Promise<void> {
  // Always keep a local copy as a warm backup and immediate response buffer
  await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  
  if (isFirebaseActive) {
    try {
      const { doc, setDoc, deleteDoc, collection, getDocs } = await import('firebase/firestore');
      
      // 1. Sync User Profiles
      for (const userId of Object.keys(data.users)) {
        await setDoc(doc(firestoreDb, 'users', userId), data.users[userId]);
      }
      
      // 2. Sync Journals (perform deletes if present in Firestore but removed in schema copy)
      const currentJournals = new Set(data.journals.map(j => j.id));
      const journalsCollect = await getDocs(collection(firestoreDb, 'journals'));
      for (const d of journalsCollect.docs) {
        if (!currentJournals.has(d.id)) {
          await deleteDoc(doc(firestoreDb, 'journals', d.id));
        }
      }
      for (const j of data.journals) {
        await setDoc(doc(firestoreDb, 'journals', j.id), j);
      }
      
      // 3. Sync Daily Well-being check-ins
      for (const c of data.checkins) {
        await setDoc(doc(firestoreDb, 'checkins', c.id), c);
      }
      
      // 4. Sync Forum Posts (replies nested inside)
      const currentPosts = new Set(data.posts.map(p => p.id));
      const postsCollect = await getDocs(collection(firestoreDb, 'posts'));
      for (const d of postsCollect.docs) {
        if (!currentPosts.has(d.id)) {
          await deleteDoc(doc(firestoreDb, 'posts', d.id));
        }
      }
      for (const p of data.posts) {
        await setDoc(doc(firestoreDb, 'posts', p.id), p);
      }
      
    } catch (error) {
      console.error("Firestore sync write failed:", error);
    }
  }
}

// 1. Authentication Middleware & Simulator APIs
const DEFAULT_USER = {
  uid: "user-default-101",
  email: "careseeker@griefbridge.org",
  displayName: "Compassionate Seeker",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop",
  transitionType: "bereavement",
  createdAt: new Date().toISOString()
};

// Check profile
app.get('/api/auth/profile', async (req, res) => {
  const db = await initDb();
  const userId = req.headers['x-user-id'] as string || DEFAULT_USER.uid;
  let user = db.users[userId];
  
  if (!user) {
    user = { ...DEFAULT_USER, uid: userId };
    db.users[userId] = user;
    await writeDb(db);
  }
  res.json(user);
});

// Update profile
app.post('/api/auth/update', async (req, res) => {
  const db = await initDb();
  const userId = req.headers['x-user-id'] as string || DEFAULT_USER.uid;
  const { displayName, avatar, transitionType } = req.body;
  
  let user = db.users[userId] || { ...DEFAULT_USER, uid: userId };
  user.displayName = displayName || user.displayName;
  user.avatar = avatar || user.avatar;
  user.transitionType = transitionType || user.transitionType;
  
  db.users[userId] = user;
  await writeDb(db);
  res.json(user);
});

// Switch profile / custom login
app.post('/api/auth/login', async (req, res) => {
  const db = await initDb();
  const { email, displayName, transitionType, uid } = req.body;
  
  const userId = uid || `user-${Date.now()}`;
  let user = {
    uid: userId,
    email: email || "seeker@griefbridge.org",
    displayName: displayName || "Anonymous Friend",
    avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 999999)}?w=150&h=150&fit=crop`,
    transitionType: transitionType || "bereavement",
    createdAt: new Date().toISOString()
  };
  
  db.users[userId] = user;
  await writeDb(db);
  res.json(user);
});

// 2. Resource mapping fetch with spatial ordering options
app.get('/api/resources', async (req, res) => {
  const db = await initDb();
  const { specialization, cost, type, search } = req.query;
  
  let list = [...db.resources];
  
  if (specialization) {
    list = list.filter(r => r.specialization.includes(specialization as string));
  }
  if (cost) {
    list = list.filter(r => r.cost === cost);
  }
  if (type) {
    list = list.filter(r => r.type === type);
  }
  if (search) {
    const q = (search as string).toLowerCase();
    list = list.filter(r => 
      r.name.toLowerCase().includes(q) || 
      r.description.toLowerCase().includes(q) ||
      r.address.toLowerCase().includes(q)
    );
  }
  
  res.json(list);
});

// 3. AI Journal Analysis using Gemini Client
app.post('/api/journals', async (req, res) => {
  const db = await initDb();
  const userId = req.headers['x-user-id'] as string || DEFAULT_USER.uid;
  const { text, date, hasAudio } = req.body;
  
  if (!text || text.trim().length === 0) {
    return res.status(400).json({ error: "Journal entry content cannot be blank." });
  }

  const user = db.users[userId] || DEFAULT_USER;
  const gemini = getGeminiClient();
  
  // Prompt for emotional analysis
  const prompt = `You are GriefBridge's Compassionate sentiment compiler. Analyze this diary entry of someone navigating severe grief (${user.transitionType}):

Entry text: "${text}"

You MUST returns a valid JSON matching this TypeScript type:
{
  "title": "A short comforting title summarizing the mood",
  "moods": {
    "sadness": 0-100 score,
    "anxiety": 0-100 score,
    "anger": 0-100 score,
    "loneliness": 0-100 score,
    "guilt": 0-100 score,
    "hope": 0-100 score,
    "acceptance": 0-100 score
  },
  "dominantEmotion": "string representing the highest scoring emotion",
  "keywords": ["maximum of 4 key words"],
  "overallMoodScore": 1-10 integer (where 1 is deepest crisis, 10 is high resilience/peace),
  "aiResponse": "A highly validating, comforting, scientifically structured micro-therapy response (100 to 150 words). Mirror their pain, address their special loss (${user.transitionType}), avoid hollow toxic positivity, offer one breathing or gentle somatic advice."
}`;

  let analysisResult: any = null;

  if (gemini) {
    try {
      const response = await gemini.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              dominantEmotion: { type: Type.STRING },
              overallMoodScore: { type: Type.INTEGER },
              aiResponse: { type: Type.STRING },
              keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
              moods: {
                type: Type.OBJECT,
                properties: {
                  sadness: { type: Type.INTEGER },
                  anxiety: { type: Type.INTEGER },
                  anger: { type: Type.INTEGER },
                  loneliness: { type: Type.INTEGER },
                  guilt: { type: Type.INTEGER },
                  hope: { type: Type.INTEGER },
                  acceptance: { type: Type.INTEGER },
                },
                required: ["sadness", "anxiety", "anger", "loneliness", "guilt", "hope", "acceptance"]
              }
            },
            required: ["title", "dominantEmotion", "overallMoodScore", "aiResponse", "moods", "keywords"]
          }
        }
      });
      
      const rawText = response.text || "{}";
      analysisResult = JSON.parse(rawText.trim());
    } catch (err) {
      console.error("Gemini sentiment analysis failed. Triggering realistic local fallback compiler...", err);
    }
  }

  // Realistic fallback model if key is missing or rate-limited
  if (!analysisResult) {
    analysisResult = getMockSentimentFallback(text);
  }

  const newEntry = {
    id: `entry-${Date.now()}`,
    userId,
    title: analysisResult.title || "Reflective Journal Entry",
    text,
    hasAudio: !!hasAudio,
    moods: analysisResult.moods,
    overallMoodScore: analysisResult.overallMoodScore || 4,
    dominantEmotion: analysisResult.dominantEmotion || "Sadness",
    keywords: analysisResult.keywords || ["reflection", "insight"],
    aiResponse: analysisResult.aiResponse || "Your words carry heavy longing. Grief is circular, and feeling this depth of pain is a testimony of your deep love in life. We are here to walk with you.",
    date: date || new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString()
  };

  db.journals.unshift(newEntry);
  await writeDb(db);
  res.json(newEntry);
});

// Helper for realistic fallback compilation
function getMockSentimentFallback(text: string) {
  const content = text.toLowerCase();
  
  // Calculate raw factors
  let sadness = 50, anxiety = 40, anger = 20, loneliness = 40, guilt = 10, hope = 20, acceptance = 15;
  const keywords: string[] = [];
  
  if (content.includes("miss") || content.includes("loss") || content.includes("cry") || content.includes("tear") || content.includes("pain") || content.includes("grief")) {
    sadness += 35;
    loneliness += 20;
    keywords.push("loss");
  }
  if (content.includes("alone") || content.includes("empty") || content.includes("apart") || content.includes("separate") || content.includes("desertec")) {
    loneliness += 40;
    sadness += 10;
    keywords.push("isolation");
  }
  if (content.includes("fear") || content.includes("anxious") || content.includes("dread") || content.includes("worry") || content.includes("scared")) {
    anxiety += 45;
    keywords.push("uncertainty");
  }
  if (content.includes("mad") || content.includes("angry") || content.includes("furious") || content.includes("hate") || content.includes("betray")) {
    anger += 60;
    keywords.push("anger");
  }
  if (content.includes("regret") || content.includes("fault") || content.includes("guilty") || content.includes("should have") || content.includes("sorry")) {
    guilt += 55;
    keywords.push("self-blame");
  }
  if (content.includes("hope") || content.includes("better") || content.includes("breathe") || content.includes("tomorrow") || content.includes("grace") || content.includes("heal")) {
    hope += 50;
    acceptance += 30;
    keywords.push("healing");
  }
  if (content.includes("accept") || content.includes("understand") || content.includes("okay") || content.includes("calm") || content.includes("peace")) {
    acceptance += 55;
    hope += 15;
    keywords.push("resolve");
  }

  // Normalize to 100 max
  const moods = {
    sadness: Math.min(Math.max(sadness, 10), 100),
    anxiety: Math.min(Math.max(anxiety, 10), 100),
    anger: Math.min(Math.max(anger, 5), 100),
    loneliness: Math.min(Math.max(loneliness, 10), 100),
    guilt: Math.min(Math.max(guilt, 5), 100),
    hope: Math.min(Math.max(hope, 5), 100),
    acceptance: Math.min(Math.max(acceptance, 5), 100)
  };

  // Determine dominant
  let dominantEmotion = "Sadness";
  let maxVal = moods.sadness;
  
  if (moods.anxiety > maxVal) { dominantEmotion = "Anxiety"; maxVal = moods.anxiety; }
  if (moods.anger > maxVal) { dominantEmotion = "Anger"; maxVal = moods.anger; }
  if (moods.loneliness > maxVal) { dominantEmotion = "Loneliness"; maxVal = moods.loneliness; }
  if (moods.guilt > maxVal) { dominantEmotion = "Guilt"; maxVal = moods.guilt; }
  if (moods.hope > maxVal && moods.hope > 50) { dominantEmotion = "Hope"; maxVal = moods.hope; }
  if (moods.acceptance > maxVal && moods.acceptance > 45) { dominantEmotion = "Acceptance"; }

  if (keywords.length === 0) keywords.push("reflection");

  let overallMoodScore = 5;
  if (moods.sadness > 80 || moods.loneliness > 85) overallMoodScore = 2;
  else if (moods.sadness > 60) overallMoodScore = 3;
  else if (moods.acceptance > 60 && moods.hope > 50) overallMoodScore = 8;
  else if (moods.acceptance > 40) overallMoodScore = 6;

  // Personalized soothing
  let aiResponse = "Your entry contains strong notes of processing. Grief is a non-linear mountain range, and expressing your genuine raw feelings is indeed the first bridge toward carry-on strength. We hear your quiet sigh and stand by your side.";
  if (dominantEmotion === "Sadness") {
    aiResponse = "We hear the depth of your sorrow. It is completely normal to mourn the quiet space left behind. Allow yourself to feel this heaviness without judging your timeline. Let us try a 3-second gentle deep inhale, hold, then let go.";
  } else if (dominantEmotion === "Anger") {
    aiResponse = "Your anger is a protective boundary. It is natural to feel furious at the unfairness or betrayal of this loss. Expressing it safely helps release its physical grip. Take some slow cycles of box breathing to ground your nervous system.";
  } else if (dominantEmotion === "Guilt") {
    aiResponse = "Guilt is a standard shadow pattern in bereavement. We carry infinite 'what ifs'. Remind yourself: you worked with the knowledge you had back then. You deserve forgiveness and space to heal.";
  } else if (dominantEmotion === "Anxiety") {
    aiResponse = "Processing this profound shift has left you feeling fragile and unanchored. Ground yourself within this immediate room: notice 3 physical objects, name their colors, and take a 4-second steady release breath. You are safe here.";
  } else if (dominantEmotion === "Acceptance" || dominantEmotion === "Hope") {
    aiResponse = "There is a beautiful ray of dawn in your words. Recognizing tiny seeds of hope or accepting the current tide represents massive courage. Cherish this soft respite; you are paving beautiful paths forward.";
  }

  return {
    title: dominantEmotion === "Hope" || dominantEmotion === "Acceptance" ? "A glimmer of calm" : "Navigating the heavy fog",
    moods,
    dominantEmotion,
    keywords,
    overallMoodScore,
    aiResponse
  };
}

// Extract voice journaling simulation
app.post('/api/journals/analyze-voice', async (req, res) => {
  // Simulates transcribing audio text
  const transcripts = [
    "I'm feeling really alone today. No one has called, and the silence in the living room is just too loud. I miss holding our morning coffee talks so much.",
    "Today was a bit better, I actually managed to step outside and look at the spring tulips. I felt a small breeze of peace and hope.",
    "Honestly, I'm just so angry. Why did this happen? Why her? It's so unfair and my chest just feels like a knot of pure fury today."
  ];
  
  const chosenText = transcripts[Math.floor(Math.random() * transcripts.length)];
  req.body.text = chosenText;
  req.body.hasAudio = true;
  
  // Forward to standard text analyzer
  return app._router.handle({ method: 'POST', url: '/api/journals', body: req.body, headers: req.headers }, res);
});

// Fetch journals history
app.get('/api/journals', async (req, res) => {
  const db = await initDb();
  const userId = req.headers['x-user-id'] as string || DEFAULT_USER.uid;
  const entries = db.journals.filter(j => j.userId === userId);
  res.json(entries);
});

// Delete journal entry for convenience
app.delete('/api/journals/:id', async (req, res) => {
  const db = await initDb();
  const userId = req.headers['x-user-id'] as string || DEFAULT_USER.uid;
  const { id } = req.params;
  
  db.journals = db.journals.filter(j => !(j.id === id && j.userId === userId));
  await writeDb(db);
  res.json({ success: true });
});

// 4. Daily Well-being Check-in
app.post('/api/checkins', async (req, res) => {
  const db = await initDb();
  const userId = req.headers['x-user-id'] as string || DEFAULT_USER.uid;
  const { moodScore, subMoods, sleepHours, physicalActivity } = req.body;
  
  const checkin = {
    id: `check-${Date.now()}`,
    userId,
    moodScore: Number(moodScore) || 5,
    subMoods: subMoods || [],
    sleepHours: Number(sleepHours) || 7,
    physicalActivity: !!physicalActivity,
    createdAt: new Date().toISOString()
  };
  
  db.checkins.push(checkin);
  await writeDb(db);
  res.json(checkin);
});

app.get('/api/checkins', async (req, res) => {
  const db = await initDb();
  const userId = req.headers['x-user-id'] as string || DEFAULT_USER.uid;
  const logs = db.checkins.filter(c => c.userId === userId);
  res.json(logs);
});

// 5. Community Forums with anonymity
app.get('/api/posts', async (req, res) => {
  const db = await initDb();
  const { category } = req.query;
  
  let list = [...db.posts];
  if (category && category !== 'all') {
    list = list.filter(p => p.category === category);
  }
  
  // Sort fresh first
  list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json(list);
});

app.post('/api/posts', async (req, res) => {
  const db = await initDb();
  const userId = req.headers['x-user-id'] as string || DEFAULT_USER.uid;
  const { category, title, body, anonymous, tags } = req.body;
  
  if (!title || !body) {
    return res.status(400).json({ error: "Post title and message cannot be empty." });
  }

  const user = db.users[userId] || DEFAULT_USER;
  
  const newPost = {
    id: `post-${Date.now()}`,
    category: category || "general",
    title,
    body,
    authorId: userId,
    authorName: anonymous ? "Anonymous Friend" : user.displayName,
    authorAvatar: anonymous 
      ? "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=100&h=100&fit=crop" // Abstract pastel
      : user.avatar,
    anonymous: !!anonymous,
    likes: 0,
    likedBy: [],
    replies: [],
    createdAt: new Date().toISOString(),
    tags: tags || []
  };
  
  db.posts.unshift(newPost);
  await writeDb(db);
  res.json(newPost);
});

app.post('/api/posts/:id/like', async (req, res) => {
  const db = await initDb();
  const userId = req.headers['x-user-id'] as string || DEFAULT_USER.uid;
  const { id } = req.params;
  
  const post = db.posts.find(p => p.id === id);
  if (!post) return res.status(404).json({ error: "Post not found" });
  
  if (!post.likedBy) post.likedBy = [];
  
  const index = post.likedBy.indexOf(userId);
  if (index > -1) {
    // Unlike
    post.likedBy.splice(index, 1);
    post.likes = Math.max(0, post.likes - 1);
  } else {
    // Like
    post.likedBy.push(userId);
    post.likes += 1;
  }
  
  await writeDb(db);
  res.json(post);
});

app.post('/api/posts/:id/replies', async (req, res) => {
  const db = await initDb();
  const userId = req.headers['x-user-id'] as string || DEFAULT_USER.uid;
  const { id } = req.params;
  const { body, anonymous } = req.body;
  
  if (!body || body.trim().length === 0) {
    return res.status(400).json({ error: "Reply body cannot be blank." });
  }
  
  const post = db.posts.find(p => p.id === id);
  if (!post) return res.status(404).json({ error: "Post not found" });
  
  const user = db.users[userId] || DEFAULT_USER;
  
  const reply = {
    id: `rep-${Date.now()}`,
    postId: id,
    body,
    authorId: userId,
    authorName: anonymous ? "Anonymous Support" : user.displayName,
    authorAvatar: anonymous 
      ? "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=100&h=100&fit=crop"
      : user.avatar,
    anonymous: !!anonymous,
    createdAt: new Date().toISOString()
  };
  
  post.replies.push(reply);
  await writeDb(db);
  res.json(post);
});

// 6. Gemini-powered Weekly/Monthly Emotional Insights Compiler
app.get('/api/insights', async (req, res) => {
  const db = await initDb();
  const userId = req.headers['x-user-id'] as string || DEFAULT_USER.uid;
  const entries = db.journals.filter(j => j.userId === userId).slice(0, 5);
  const user = db.users[userId] || DEFAULT_USER;
  const checkins = db.checkins.filter(c => c.userId === userId).slice(0, 7);

  if (entries.length === 0) {
    return res.json({
      noData: true,
      summary: "Once you write your first few AI emotional journals, GriefBridge's analyzer compiles profound deep reflections and progress markers for your grief path."
    });
  }

  const gemini = getGeminiClient();
  const journalSnippets = entries.map(e => `[${e.date}] (Dominant: ${e.dominantEmotion}, Score: ${e.overallMoodScore}/10) Text: "${e.text.substring(0, 100)}..."`).join("\n");
  const checkinData = checkins.map(c => `Checkin Mood: ${c.moodScore}/10 on ${c.createdAt.split('T')[0]}`).join("\n");

  const prompt = `You are the GriefBridge Senior Grief Assessment Director. Compile a cohesive, deeply compassionate weekly emotional summary for a user coping with ${user.transitionType}.
Analyze these entries and daily logs:
---
Journals:
${journalSnippets}

Logs:
${checkinData}
---

Your task: Provide a highly comforting, scientifically accurate analytical report (120-170 words). Highlight:
1. Any soft positive emotional trends (e.g. hope emerging or active coping patterns).
2. Validate their ongoing struggles without sound hollow.
3. Recommend a targeted action tailored for ${user.transitionType} (e.g., self-compassion writing, nature walk, writing a farewell letter).
Make the report feel deeply tailored, peaceful, professional, and therapeutic. Deliver as clean paragraphs without markdown headings.`;

  let insightText = "";
  if (gemini) {
    try {
      const response = await gemini.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt
      });
      insightText = response.text || "";
    } catch (err) {
      console.error("Gemini insights generator failed:", err);
    }
  }

  if (!insightText) {
    // High quality therapeutic dynamic summary
    insightText = `We have assessed your recent journal logs. Your emotional core is working overtime to integrate your experiences. We detect alternating currents of high sadness alongside gentle peaks of resilience. In moments of quiet self-compassion, you are enabling acceptance to seed. For this phase of your ${user.transitionType} transition, we recommend setting a tiny, daily boundary: allow 10 dedicated minutes to let yourself feel everything fully, then intentionally step outside to observe something living. You are doing beautiful work carried through heavy waters.`;
  }

  res.json({
    noData: false,
    summary: insightText,
    journalCount: entries.length,
    recentDominant: entries[0].dominantEmotion
  });
});

// Mount Vite middleware for development or serve custom build in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development server active.");
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log("Production static distribution pipeline active.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`GriefBridge Server successfully listening on http://localhost:${PORT}`);
  });
}

startServer();
