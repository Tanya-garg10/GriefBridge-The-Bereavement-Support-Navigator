/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, TransitionType } from '../types';
import { User as UserIcon, Check, Sparkles, Smile, ShieldCheck, Heart, LogOut } from 'lucide-react';
import { motion } from 'motion/react';

interface ProfileProps {
  currentUser: User | null;
  onUpdateUser: (updates: { displayName: string; avatar: string; transitionType: string }) => Promise<void>;
  onSignOut?: () => void;
}

export default function Profile({ currentUser, onUpdateUser, onSignOut }: ProfileProps) {
  const [name, setName] = useState(currentUser?.displayName || '');
  const [avatar, setAvatar] = useState(currentUser?.avatar || '');
  const [selectedType, setSelectedType] = useState<TransitionType>((currentUser?.transitionType as TransitionType) || 'bereavement');
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  const avatars_list = [
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&h=120&fit=crop", // Warm female
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop", // Pastel female 2
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop", // Male smiling
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop", // Calm male glasses
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&h=120&fit=crop", // Female neutral
    "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=120&h=120&fit=crop"  // Healing Pastel Bloom
  ];

  const types = [
    { value: 'bereavement', label: 'Loss of a Loved One (Bereavement)', desc: 'Mourning the death of a family member, life partner, deep friend, or beloved custody.' },
    { value: 'divorce', label: 'Separation or Divorce', desc: 'Processing the severance of a marriage, legal attachment, or shared household identity.' },
    { value: 'job-loss', label: 'Career Layoff or Job Loss', desc: 'Coping with sudden redundancy, retirement shocks, or career identification changes.' },
    { value: 'relationship-breakdown', label: 'Relationship Breakdown', desc: 'Healing from friendship separation, breakups, or family ties estrangement.' },
    { value: 'life-transition', label: 'Major Life Transition', desc: 'Entering severe shifts: moving state, health diagnosis, empty nest, or lifestyle reform.' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSaving(true);
    setSuccessMsg(false);
    try {
      await onUpdateUser({
        displayName: name,
        avatar: avatar,
        transitionType: selectedType
      });
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8" id="profile-management">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-3xl bg-white border border-stone-100 shadow-xl"
      >
        <div className="relative h-32 bg-bg-sage">
          <div className="absolute -bottom-10 left-8">
            <img 
              src={avatar || "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=120&h=120&fit=crop"} 
              alt="Avatar Profile preview" 
              referrerPolicy="no-referrer"
              className="h-24 w-24 rounded-full border-4 border-white bg-white shadow-md object-cover"
              id="profile-avatar-active"
            />
          </div>
        </div>

        <div className="px-8 pb-8 pt-14">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-serif text-stone-800" id="profile-main-name">{currentUser?.displayName || 'My Sanctuary'}</h1>
              <p className="text-sm text-stone-500">
                Safe Bereavement Support Key: <span className="font-mono text-xs text-sage bg-bg-sage px-3 py-1 rounded-full border border-sage/10">{currentUser?.uid}</span>
              </p>
            </div>
            {onSignOut && (
              <button 
                onClick={onSignOut}
                className="flex items-center gap-1.5 rounded-full border border-rose-200 hover:bg-rose-50/50 text-rose-600 px-4 py-2 text-xs font-semibold transition"
                id="sign-out-btn"
              >
                <LogOut className="h-4 w-4" />
                <span>Switch Sanctuary Profile</span>
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            
            {/* Display pseudonym */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700" id="pseudonym-label">Pseudonym / Comfort Name</label>
              <div className="relative rounded-2xl border border-slate-200 px-4 py-3 bg-slate-50/50">
                <UserIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter pseudonym..."
                  required
                  className="w-full pl-8 text-slate-800 font-medium placeholder-slate-400 bg-transparent outline-none focus:ring-0"
                  id="profile-name-input"
                />
              </div>
              <p className="text-slate-400 text-xs">
                Feel free to use a nickname or pseudonym. On GriefBridge, comfort, safe discretion, and emotional anonymity are primary.
              </p>
            </div>

            {/* Avatar picker */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-slate-705">Choose Sanctuary Avatar</label>
              <div className="grid grid-cols-6 gap-3 max-w-lg" id="profile-avatar-grid">
                {avatars_list.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAvatar(url)}
                    className={`relative aspect-square cursor-pointer rounded-2xl border-2 transition overflow-hidden bg-white shadow-xs hover:scale-105 active:scale-95 ${
                      avatar === url ? 'border-[var(--color-sage)] ring-2 ring-bg-sage' : 'border-transparent'
                    }`}
                  >
                    <img src={url} alt={`Avatar option ${idx}`} className="h-full w-full object-cover" />
                    {avatar === url && (
                      <div className="absolute inset-0 flex items-center justify-center bg-[#718355]/20">
                        <Check className="h-5 w-5 text-white filter drop-shadow" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Grief categories */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-1 text-sage">
                <Sparkles className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-widest">Active Compassion Context</span>
              </div>
              <label className="block text-base font-serif font-medium text-slate-800">
                What major transition or life event is anchoring your emotional processing?
              </label>
              <p className="text-xs text-slate-500">
                This customizes your AI Emotion Journal responses, guided Micro-Support, reflection prompts, and geospatial NGO resources.
              </p>
 
               <div className="space-y-3.5" id="profile-types-list">
                {types.map((type) => (
                  <div
                    key={type.value}
                    onClick={() => setSelectedType(type.value as TransitionType)}
                    className={`flex cursor-pointer gap-4 rounded-2xl border p-4 transition-all duration-300 ${
                      selectedType === type.value
                        ? 'border-sage bg-bg-sage/40 shadow-xs'
                        : 'border-[#F1F5F9] bg-white hover:border-[#e2e8e0] hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex h-5 items-center">
                      <input
                        type="radio"
                        checked={selectedType === type.value}
                        readOnly
                        className="h-4.5 w-4.5 rounded-full text-sage border-slate-300 focus:ring-sage"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <div className={`text-sm font-semibold ${selectedType === type.value ? 'text-slate-800 font-bold' : 'text-slate-600'}`}>
                        {type.label}
                      </div>
                      <div className="text-xs text-slate-400 leading-relaxed">{type.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Submission Status */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-6">
              <div className="flex items-center gap-2 text-slate-500 text-xs">
                <ShieldCheck className="h-4.5 w-4.5 text-emerald-500 animate-pulse" />
                <span>Zero privacy risk. GriefBridge data is secured on private sandboxes.</span>
              </div>

              <div className="flex items-center gap-3">
                {successMsg && (
                  <motion.div 
                    initial={{ opacity: 0, x: 5 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs text-emerald-700 font-semibold border border-emerald-100/30"
                    id="profile-saved-badge"
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>Profile saved successfully</span>
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-full bg-slate-800 hover:bg-sage disabled:bg-slate-400 text-white px-7 py-2.5 text-xs font-semibold transition flex items-center gap-1.5"
                  id="profile-submit-btn"
                >
                  {isSaving ? "Saving Alignment..." : "Save Assessment Alignment"}
                </button>
              </div>
            </div>

          </form>

          {/* Calming quotes */}
          <div className="mt-8 rounded-2xl bg-amber-50/40 border border-amber-100/30 p-5 flex gap-4">
            <Smile className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-amber-800 uppercase tracking-widest">Self-Assessment Tip</h4>
              <p className="text-xs text-amber-950 leading-relaxed mt-1">
                You can adjust this context at any time. If you transition from intense sadness and shock to rebuilding, GriefBridge will adapt, presenting different resource clinics, community discussions, and gratitude exercises suited to your recovery.
              </p>
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
