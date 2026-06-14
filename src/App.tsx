/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { User, JournalEntry, WellnessCheckin, SupportResource, CommunityPost, TransitionType } from './types';
import LandingPage from './components/LandingPage';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import Journal from './components/Journal';
import ResourceMap from './components/ResourceMap';
import Forum from './components/Forum';
import Profile from './components/Profile';
import BreathingExercise from './components/BreathingExercise';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [checkins, setCheckins] = useState<WellnessCheckin[]>([]);
  const [resources, setResources] = useState<SupportResource[]>([]);
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([]);
  const [aiInsights, setAiInsights] = useState<{ summary: string; journalCount: number; recentDominant?: string; noData: boolean } | null>(null);
  const [showBreathing, setShowBreathing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Synchronize overall state on auth profile boot
  useEffect(() => {
    async function bootApplication() {
      try {
        const userId = localStorage.getItem('griefbridge_uid') || '';
        const headers: Record<string, string> = {};
        if (userId) {
          headers['x-user-id'] = userId;
        }

        const profileRes = await fetch('/api/auth/profile', { headers });
        if (profileRes.ok) {
          const userProfile: User = await profileRes.json();
          setCurrentUser(userProfile);
          localStorage.setItem('griefbridge_uid', userProfile.uid);
        }
      } catch (err) {
        console.error("Boot configuration failed. Loading fallback simulation...", err);
      } finally {
        setIsLoading(false);
      }
    }
    bootApplication();
  }, []);

  // Fetch contextual features once auth is established
  useEffect(() => {
    if (!currentUser) return;
    
    const headers = { 'x-user-id': currentUser.uid };

    async function loadData() {
      try {
        // Fetch Resources Map
        const resList = await fetch('/api/resources');
        if (resList.ok) {
          const data = await resList.json();
          setResources(data);
        }

        // Fetch Journals
        const jrList = await fetch('/api/journals', { headers });
        if (jrList.ok) {
          const data = await jrList.json();
          setJournals(data);
        }

        // Fetch Checkins
        const chList = await fetch('/api/checkins', { headers });
        if (chList.ok) {
          const data = await chList.json();
          setCheckins(data);
        }

        // Fetch Community Board
        const postsList = await fetch('/api/posts');
        if (postsList.ok) {
          const data = await postsList.json();
          setCommunityPosts(data);
        }

        // Fetch AI dynamic Insights
        fetchInsights();

      } catch (err) {
        console.error("Failed to load relational data:", err);
      }
    }

    loadData();
  }, [currentUser]);

  // Insights independent fetching trigger
  const fetchInsights = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch('/api/insights', { headers: { 'x-user-id': currentUser.uid } });
      if (res.ok) {
        const data = await res.json();
        setAiInsights(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOnboardingEnter = async (onboardData: { email: string; displayName: string; transitionType: TransitionType }) => {
    setIsLoading(true);
    try {
      const resp = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(onboardData)
      });
      if (resp.ok) {
        const user: User = await resp.json();
        setCurrentUser(user);
        localStorage.setItem('griefbridge_uid', user.uid);
        setActiveTab('dashboard');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateUser = async (updates: { displayName: string; avatar: string; transitionType: string }) => {
    if (!currentUser) return;
    try {
      const resp = await fetch('/api/auth/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.uid
        },
        body: JSON.stringify(updates)
      });
      if (resp.ok) {
        const updatedProfile = await resp.json();
        setCurrentUser(updatedProfile);
        // Refresh insights post transition updates
        fetchInsights();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateJournalEntry = async (text: string, isVoice = false) => {
    if (!currentUser) return;
    const endpoint = isVoice ? '/api/journals/analyze-voice' : '/api/journals';
    
    try {
      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.uid
        },
        body: JSON.stringify({ text, date: new Date().toISOString().split('T')[0] })
      });
      if (resp.ok) {
        const newEntry = await resp.json();
        setJournals(prev => [newEntry, ...prev]);
        fetchInsights(); // update charts
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteJournalEntry = async (id: string) => {
    if (!currentUser) return;
    try {
      const resp = await fetch(`/api/journals/${id}`, {
        method: 'DELETE',
        headers: { 'x-user-id': currentUser.uid }
      });
      if (resp.ok) {
        setJournals(prev => prev.filter(j => j.id !== id));
        fetchInsights();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateCheckin = async (checkinData: { moodScore: number; subMoods: string[]; sleepHours: number; physicalActivity: boolean }) => {
    if (!currentUser) return;
    try {
      const resp = await fetch('/api/checkins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.uid
        },
        body: JSON.stringify(checkinData)
      });
      if (resp.ok) {
        const log = await resp.json();
        setCheckins(prev => [...prev, log]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateCommunityPost = async (postData: { category: string; title: string; body: string; anonymous: boolean; tags: string[] }) => {
    if (!currentUser) return;
    try {
      const resp = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.uid
        },
        body: JSON.stringify(postData)
      });
      if (resp.ok) {
        const post = await resp.json();
        setCommunityPosts(prev => [post, ...prev]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLikePost = async (postId: string) => {
    if (!currentUser) return;
    try {
      const resp = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
        headers: { 'x-user-id': currentUser.uid }
      });
      if (resp.ok) {
        const updatedPost = await resp.json();
        setCommunityPosts(prev => prev.map(p => p.id === postId ? updatedPost : p));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddReply = async (postId: string, replyData: { body: string; anonymous: boolean }) => {
    if (!currentUser) return;
    try {
      const resp = await fetch(`/api/posts/${postId}/replies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.uid
        },
        body: JSON.stringify(replyData)
      });
      if (resp.ok) {
        const updatedPost = await resp.json();
        setCommunityPosts(prev => prev.map(p => p.id === postId ? updatedPost : p));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSignOut = () => {
    setCurrentUser(null);
    localStorage.removeItem('griefbridge_uid');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6 text-center" id="global-spinner">
        <div className="space-y-4">
          <div className="h-10 w-10 border-4 border-sage border-t-transparent rounded-full animate-spin mx-auto" />
          <h2 className="font-serif font-medium text-slate-700 text-lg">Unlocking Sanctuary Entry...</h2>
          <p className="text-xs text-stone-400">GriefBridge is setting up your private bereavement companion.</p>
        </div>
      </div>
    );
  }

  // Not logged in -> Render Landing Onboarding
  if (!currentUser) {
    return <LandingPage onEnter={handleOnboardingEnter} />;
  }

  return (
    <div className="min-h-screen bg-stone-50 pb-16 relative" id="app-viewport">
      
      {/* Navigation Layout */}
      <Navigation 
        currentTab={activeTab} 
        setTab={setActiveTab} 
        currentUser={currentUser} 
        onOpenBreathing={() => setShowBreathing(true)}
      />

      {/* Somatic grounding module overlay */}
      {showBreathing && (
        <BreathingExercise onClose={() => setShowBreathing(false)} />
      )}

      {/* Render selected sections accordingly */}
      <main className="transition-all duration-300">
        {activeTab === 'dashboard' && (
          <Dashboard 
            currentUser={currentUser}
            entries={journals}
            checkins={checkins}
            resources={resources}
            aiInsights={aiInsights}
            onCreateCheckin={handleCreateCheckin}
            onTabChange={setActiveTab}
            onRefreshInsights={fetchInsights}
          />
        )}
        {activeTab === 'journal' && (
          <Journal 
            entries={journals}
            onCreateEntry={handleCreateJournalEntry}
            onDeleteEntry={handleDeleteJournalEntry}
            currentUserContext={currentUser.transitionType}
          />
        )}
        {activeTab === 'map' && (
          <ResourceMap 
            resources={resources}
            currentUserContext={currentUser.transitionType}
          />
        )}
        {activeTab === 'community' && (
          <Forum 
            posts={communityPosts}
            currentUser={currentUser}
            onCreatePost={handleCreateCommunityPost}
            onLikePost={handleLikePost}
            onAddReply={handleAddReply}
          />
        )}
        {activeTab === 'profile' && (
          <Profile 
            currentUser={currentUser}
            onUpdateUser={handleUpdateUser}
            onSignOut={handleSignOut}
          />
        )}
      </main>

    </div>
  );
}
