/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sparkles, HeartHandshake, ShieldAlert, Navigation, ArrowRight, HeartPulse, MapPin, MessageSquare, BookOpen, Wind } from 'lucide-react';
import { motion } from 'motion/react';
import { TransitionType } from '../types';

interface OnboardingProps {
  onEnter: (data: { email: string; displayName: string; transitionType: TransitionType }) => void;
}

export default function Onboarding({ onEnter }: OnboardingProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [griefType, setGriefType] = useState<TransitionType>('bereavement');

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    onEnter({
      email: email || "careseeker@griefbridge.org",
      displayName: name || "Compassionate Friend",
      transitionType: griefType
    });
  };

  const features = [
    { title: "Emotion Analyzer", desc: "Write daily journals. Use real-time AI to classify your levels of sadness, anxiety, anger, hope, and acceptance.", icon: BookOpen },
    { title: "Micro-Support Loops", desc: "Gain personalized therapy prompts, breathing exercises, and gratitude entries tailored to your custom loss.", icon: Wind },
    { title: "Geospatial Resources", desc: "Discover nearby local counselors, grief support circles, and transition NGO clinics based on filters.", icon: MapPin },
    { title: "Anonymous Forums", desc: "Share pain safely and swap comforting replies with peer support networks who understand exactly what loss you feel.", icon: MessageSquare }
  ];

  const types = [
    { value: 'bereavement', label: 'Loss of a Loved One (Bereavement)' },
    { value: 'divorce', label: 'Separation or Divorce' },
    { value: 'job-loss', label: 'Career Layoff or Job Loss' },
    { value: 'relationship-breakdown', label: 'Relationship Breakdown' },
    { value: 'life-transition', label: 'Major Life Transition / Lifestyle shift' }
  ];

  return (
    <div className="min-h-screen bg-[#FDFCFB]" id="landing-page">
      
      {/* Decorative calm mesh blur blobs */}
      <div className="absolute top-0 right-0 -z-10 h-[500px] w-[500px] rounded-full bg-bg-sage/55 blur-3xl" />
      <div className="absolute bottom-0 left-0 -z-10 h-[600px] w-[600px] rounded-full bg-stone-105/50 blur-3xl" />

      {/* Hero section */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 text-center">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 rounded-full bg-bg-sage border border-sage/20 px-4 py-1.5 text-xs font-semibold text-sage"
        >
          <Sparkles className="h-4 w-4 text-sage animate-pulse" />
          <span>A Safe Space to Process All Forms of Grief</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-6 font-serif text-5xl font-semibold tracking-tight text-slate-800 md:text-6xl max-w-4xl mx-auto leading-tight"
          id="landing-hero-heading"
        >
          GriefBridge
        </motion.h1>
        
        <p className="mt-2 font-serif text-2xl text-slate-500 tracking-wide font-normal">
          The Bereavement Support Navigator
        </p>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed font-normal"
        >
          Navigating bereavement, divorce, or life shocks can feel incredibly unanchored. GriefBridge provides compassionate, AI-powered emotional diaries, peer validation forums, and mapped local resource specialists to help you carry the weight.
        </motion.p>
      </div>

      {/* Split visual: Left features list, Right Onboarding block */}
      <div className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12 items-start" id="landing-split">
          
          {/* Features grid */}
          <div className="lg:col-span-6 space-y-8" id="landing-features-panel">
            <h2 className="text-2xl font-serif font-semibold text-slate-800 border-b border-slate-100 pb-3">
              How GriefBridge Walks With You
            </h2>

            <div className="grid gap-6 sm:grid-cols-2">
              {features.map((feat, index) => {
                const Icon = feat.icon;
                return (
                  <div key={index} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs space-y-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-bg-sage text-sage">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-serif font-semibold text-slate-800 text-base">{feat.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{feat.desc}</p>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-4 rounded-2xl bg-bg-sage border border-sage/20 p-5 mt-4">
              <ShieldAlert className="h-6 w-6 text-sage flex-shrink-0 mt-0.5 animate-pulse" />
              <div className="space-y-1">
                <span className="text-xs font-semibold text-sage uppercase tracking-wider block">Crisis Notice</span>
                <p className="text-xs text-slate-700 leading-relaxed font-normal">
                  GriefBridge is an educational peer support companion. It is <strong>NOT</strong> a replacement for emergency healthcare, crisis lines, or medical interventions. If you feel severe distress or self-harm thoughts, please consult your absolute nearest local emergency professional immediately or lookup specialized crisis hotlines.
                </p>
              </div>
            </div>
          </div>

          {/* Secure Onboarding Onramp */}
          <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-150 p-8 shadow-sm" id="landing-onramp">
            <div className="flex items-center gap-2 text-sage pb-3 border-b border-slate-100">
              <HeartHandshake className="h-6 w-6" />
              <h3 className="font-serif text-xl font-medium text-slate-800">Align Your Compassion Portal</h3>
            </div>

            <form onSubmit={handleStart} className="mt-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Pseudonym / Comfort Display Name</label>
                <input
                  type="text"
                  placeholder="e.g., HopeRebuilder, CompassionateReader"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-205 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 bg-slate-50 outline-none focus:border-sage"
                  id="onboarding-name-input"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Email Address (Secure Profile Sync)</label>
                <input
                  type="email"
                  placeholder="careseeker@griefbridge.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-205 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 bg-slate-50 outline-none focus:border-sage"
                  id="onboarding-email-input"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Select Your Grieving Context</label>
                <select
                  value={griefType}
                  onChange={(e) => setGriefType(e.target.value as TransitionType)}
                  className="w-full rounded-xl border border-slate-205 px-3.5 py-3 text-sm text-slate-700 bg-slate-50 outline-none focus:border-sage"
                  id="onboarding-type-select"
                >
                  {types.map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
                <span className="text-[10px] text-slate-400 leading-relaxed block pl-1">
                  Adjusting categories changes AI responses, peer support boards, and local mapping elements uniquely to your processing experience.
                </span>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-slate-800 hover:bg-sage text-white font-semibold py-3.5 px-4 shadow-sm hover:-translate-y-0.5 transition duration-200 flex items-center justify-center gap-2"
                id="onboarding-submit-btn"
              >
                <span>Enter Compassionate Safe Space</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>

        </div>
      </div>

    </div>
  );
}
