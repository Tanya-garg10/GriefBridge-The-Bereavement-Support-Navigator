/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { JournalEntry, MoodProfile } from '../types';
import { BookOpen, Mic, MicOff, Check, Heart, Shield, Sparkles, Trash2, Calendar, Smile, Compass, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface JournalProps {
  entries: JournalEntry[];
  onCreateEntry: (text: string, isVoice?: boolean) => Promise<void>;
  onDeleteEntry: (entryId: string) => Promise<void>;
  currentUserContext?: string;
}

export default function Journal({ entries, onCreateEntry, onDeleteEntry, currentUserContext }: JournalProps) {
  const [text, setText] = useState('');
  const [activeEntryId, setActiveEntryId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recDuration, setRecDuration] = useState(0);
  const [recIntervalId, setRecIntervalId] = useState<NodeJS.Timeout | null>(null);

  const activeEntry = entries.find(e => e.id === activeEntryId) || entries[0] || null;

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setIsSubmitting(true);
    try {
      await onCreateEntry(text);
      setText('');
      // Auto-focus the newest record
      if (entries.length > 0) {
        setTimeout(() => {
          if (entries[0]) setActiveEntryId(entries[0].id);
        }, 300);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Simulates an elegant mic voice capture transcribe cycle
  const handleVoiceToggle = async () => {
    if (isRecording) {
      setIsRecording(false);
      if (recIntervalId) clearInterval(recIntervalId);
      setRecDuration(0);

      // Trigger standard voice simulation endpoint
      setIsSubmitting(true);
      try {
        await onCreateEntry("", true); // tells parent to hit voice analyze route
      } catch (err) {
        console.error(err);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setIsRecording(true);
      const intId = setInterval(() => {
        setRecDuration(prev => prev + 1);
      }, 1000);
      setRecIntervalId(intId);
    }
  };

  const getMoodColor = (emotion: string) => {
    switch (emotion.toLowerCase()) {
      case 'sadness': return 'bg-[#96A7AF]'; // calming soft-blue
      case 'anxiety': return 'bg-[#C4B69E]'; // gentle sand
      case 'anger': return 'bg-[#D79A8F]'; // soft muted rose
      case 'loneliness': return 'bg-[#A3AE9E]'; // calm sage-slate
      case 'guilt': return 'bg-[#B5A5A1]'; // warm taupe
      case 'hope': return 'bg-[#DEBD70]'; // pale sunset gold
      case 'acceptance': return 'bg-[var(--color-sage)]'; // main sage green
      default: return 'bg-slate-400';
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8" id="grief-journal-arena">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-medium text-slate-800">AI Emotion Journal</h1>
        <p className="mt-1 text-xs text-slate-500 leading-relaxed font-normal">
          Unburden your thoughts. Type a conventional diary or record your voice. Our server-side Gemini sentiment engine maps your emotional states and outputs validation.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-12 items-start">
        
        {/* Left Pane: Create Journal Entry & Audio Simulator */}
        <div className="lg:col-span-12 xl:col-span-5 space-y-6" id="journal-input-section">
          
          <div className="rounded-3xl border border-[#F1F5F9] bg-white p-6 shadow-sm space-y-5">
            <h3 className="font-serif text-base font-medium text-slate-800 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-sage" />
              <span>Today&apos;s Emotional Record</span>
            </h3>

            {/* Standard Text Form */}
            <form onSubmit={handleTextSubmit} className="space-y-4">
              <div className="relative">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={`Write whatever you are holding inside, e.g. "I missed them so much today..."`}
                  rows={6}
                  disabled={isRecording}
                  className="w-full rounded-2xl border border-slate-100 bg-slate-50/50 p-4 text-xs text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-sage focus:ring-1 focus:ring-sage/20 resize-none leading-relaxed transition"
                  id="journal-textarea"
                />

                {isRecording && (
                  <div className="absolute inset-0 bg-slate-800/95 rounded-2xl flex flex-col items-center justify-center text-white p-6 text-center space-y-4" id="recording-mask">
                    <div className="flex items-center gap-2">
                      <span className="h-3.5 w-3.5 rounded-full bg-rose-500 animate-ping" />
                      <span className="font-mono text-sm tracking-widest font-semibold">RECORDING SECURE AUDIO: 0:{recDuration.toString().padStart(2, '0')}s</span>
                    </div>
                    {/* Visualizer bars */}
                    <div className="flex h-10 items-center gap-1">
                      {[...Array(9)].map((_, i) => (
                        <div 
                          key={i} 
                          className="w-1 bg-[#A3AE9E] rounded-full animate-pulse" 
                          style={{ 
                            height: `${15 + Math.floor(Math.random() * 25)}px`,
                            animationDelay: `${i * 0.1}s`,
                            animationDuration: '0.6s'
                          }} 
                        />
                      ))}
                    </div>
                    <p className="text-[10px] text-slate-300 max-w-xs">
                      Express your sadness, anger, or fatigue out loud. Releasing vocal vibrations stimulates physical thermal unloading.
                    </p>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-between gap-4 border-t border-slate-50 pt-4" id="journal-actions-row">
                
                {/* Voice button */}
                <button
                  type="button"
                  onClick={handleVoiceToggle}
                  className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-semibold tracking-wide transition border ${
                    isRecording 
                      ? 'bg-rose-500 border-rose-500 text-white animate-pulse' 
                      : 'bg-slate-50 border-slate-200/50 text-slate-600 hover:bg-slate-100'
                  }`}
                  id="voice-journal-toggle-btn"
                >
                  {isRecording ? (
                    <>
                      <MicOff className="h-4.5 w-4.5" />
                      <span>Finish Speaking & Transcribe</span>
                    </>
                  ) : (
                    <>
                      <Mic className="h-4.5 w-4.5 text-sage animate-pulse" />
                      <span>Speak Entry Out Loud</span>
                    </>
                  )}
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || !text.trim() || isRecording}
                  className="rounded-full bg-slate-800 hover:bg-sage disabled:bg-slate-300 text-white font-semibold py-2.5 px-6 text-xs transition"
                  id="submit-journal-btn"
                >
                  {isSubmitting ? "Running Sentiment AI..." : "Commit Entry"}
                </button>
              </div>

            </form>
          </div>

          {/* Prompt cues cards */}
          <div className="rounded-3xl border border-sage/20 bg-bg-sage p-5 space-y-3.5">
            <h4 className="font-serif font-semibold text-[#5a6a43] text-sm flex items-center gap-1.5">
              <Compass className="h-4.5 w-4.5 text-sage" />
              <span>Grief Reflection Prompts</span>
            </h4>
            <div className="space-y-2.5 text-xs text-slate-600 leading-relaxed font-normal">
              <p>Stuck on what to put down? Consider typing any of these soothing starting phrases:</p>
              <ul className="list-disc pl-4 space-y-1.5 italic text-slate-500">
                <li>&quot;The moment I felt the heaviest physical weight today was...&quot;</li>
                <li>&quot;If my grief was a color or weather system today, it would look like...&quot;</li>
                <li>&quot;A small, quiet thing I wish I could say out loud to you today is...&quot;</li>
              </ul>
            </div>
          </div>

        </div>

        {/* Right Pane: AI Emotion Analytics, SVG progress trackers, Adaptive Support */}
        <div className="lg:col-span-12 xl:col-span-7 space-y-6" id="journal-output-section">
          
          {entries.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-[#e2e8e0] bg-white p-12 text-center space-y-4 shadow-xs">
              <BookOpen className="mx-auto h-12 w-12 text-slate-300" />
              <h3 className="font-serif text-lg font-medium text-slate-705">Write Your Emotional Core</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                Commit your first journal entry on the left. GriefBridge will map your overall mood, generate interactive emotional bar charts, and compile compassionate validating responses.
              </p>
            </div>
          ) : (
            <div className="grid gap-6">
              
              {/* Core Active Entry Analyzer */}
              {activeEntry && (
                <div className="rounded-3xl border border-[#F1F5F9] bg-white shadow-sm overflow-hidden" id="entry-detail-card">
                  
                  {/* Headline Banner */}
                  <div className="bg-bg-sage p-6 border-b border-sage/10">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-semibold text-sage uppercase tracking-widest block font-mono">
                          JOURNAL RECORD: {activeEntry.date}
                        </span>
                        <h2 className="text-2xl font-serif font-medium text-slate-850 mt-1">{activeEntry.title}</h2>
                      </div>

                      <button
                        onClick={() => onDeleteEntry(activeEntry.id)}
                        className="rounded-full p-2 text-slate-400 hover:bg-white hover:text-rose-500 transition"
                        title="Delete this entry"
                        id="delete-journal-btn"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </div>

                    <p className="mt-3 text-xs italic text-slate-650 leading-relaxed bg-white/80 rounded-2xl p-4 border border-[#F2F4F0] font-normal">
                      &quot;{activeEntry.text}&quot;
                    </p>
                  </div>

                  {/* SVG Bars / Emotion Intensity Grid Analysis */}
                  <div className="p-6 border-b border-slate-50 space-y-5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                        <Smile className="h-4 w-4 text-slate-405" />
                        <span>Emotion Classification Profiles</span>
                      </h4>
                      <span className="text-xs font-semibold text-slate-650">
                        Primary: <strong className="text-sage font-semibold uppercase">{activeEntry.dominantEmotion}</strong>
                      </span>
                    </div>

                    {/* Numeric chart grid */}
                    <div className="grid gap-3" id="emotion-meters-list">
                      {Object.entries(activeEntry.moods).map(([mood, val]) => {
                        const score = Number(val) || 0;
                        return (
                          <div key={mood} className="space-y-1 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="capitalize font-semibold text-slate-600 tracking-wide">{mood}</span>
                              <span className="font-mono text-[11px] font-bold text-slate-400">{score}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden relative">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${score}%` }}
                                className={`h-full rounded-full ${getMoodColor(mood)}`}
                                transition={{ duration: 1, ease: 'easeOut' }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Adaptive micro-support AI Box */}
                  <div className="bg-[#FDFCFB] p-6 border-t border-slate-50 space-y-3">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="h-5 w-5 text-sage animate-pulse" />
                      <h4 className="font-serif font-medium text-slate-800">GriefBridge Support Validation</h4>
                    </div>

                    <p className="text-xs text-slate-650 leading-relaxed font-normal whitespace-pre-line" id="ai-response-box">
                      {activeEntry.aiResponse}
                    </p>

                    <div className="flex flex-wrap items-center gap-1.5 mt-4 pt-3.5 border-t border-slate-100">
                      {activeEntry.keywords && activeEntry.keywords.map(kw => (
                        <span key={kw} className="bg-bg-sage text-sage text-[9px] font-semibold tracking-wider px-2.5 py-1 rounded-full border border-sage/10">
                          {kw.toUpperCase()}
                        </span>
                      ))}

                      <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-400 ml-auto bg-slate-50 px-3 py-1 rounded-full">
                        <Heart className="h-3.5 w-3.5 text-sage fill-sage/20" />
                        <span>Somatic Response Validated</span>
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* Historic Entries list slider */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">History Logs ({entries.length} Entries)</span>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin" id="entries-history-carousel">
                  {entries.map((entry) => {
                    const isActive = entry.id === activeEntryId || (activeEntryId === null && entry.id === entries[0].id);
                    return (
                      <div
                        key={entry.id}
                        onClick={() => setActiveEntryId(entry.id)}
                        className={`cursor-pointer rounded-2xl border p-4.5 flex-shrink-0 w-52 transition-all relative overflow-hidden ${
                          isActive 
                            ? 'border-sage bg-bg-sage shadow-xs' 
                            : 'border-slate-100 bg-white hover:border-slate-200'
                        }`}
                        id={`history-node-${entry.id}`}
                      >
                        <span className="text-[9px] font-semibold font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-slate-400" />
                          {entry.date}
                        </span>
                        <h4 className="font-serif font-medium text-slate-800 text-xs mt-1.5 truncate leading-snug">
                          {entry.title}
                        </h4>
                        <div className="mt-3 flex items-center justify-between text-[11px] gap-2">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold text-white uppercase ${getMoodColor(entry.dominantEmotion)}`}>
                            {entry.dominantEmotion}
                          </span>
                          <span className="text-slate-450 font-mono text-[10px]">
                            Mood: {entry.overallMoodScore}/10
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
