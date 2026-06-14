/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { User, JournalEntry, WellnessCheckin, SupportResource } from '../types';
import { HeartPulse, CheckCircle2, TrendingUp, Sparkles, MessageSquare, Compass, AlertCircle, Phone, Calendar, Star, Smile, Moon, RefreshCw, Send, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import MemoryJar from './MemoryJar';

interface DashboardProps {
  currentUser: User | null;
  entries: JournalEntry[];
  checkins: WellnessCheckin[];
  resources: SupportResource[];
  aiInsights: { summary: string; journalCount: number; recentDominant?: string; noData: boolean } | null;
  onCreateCheckin: (checkinData: { moodScore: number; subMoods: string[]; sleepHours: number; physicalActivity: boolean }) => Promise<void>;
  onTabChange: (tab: string) => void;
  onRefreshInsights: () => void;
}

export default function Dashboard({
  currentUser,
  entries,
  checkins,
  resources,
  aiInsights,
  onCreateCheckin,
  onTabChange,
  onRefreshInsights
}: DashboardProps) {
  const [moodScore, setMoodScore] = useState<number>(5);
  const [sleepHours, setSleepHours] = useState<number>(7);
  const [physicalActivity, setPhysicalActivity] = useState<boolean>(false);
  const [activeCheckinSubMood, setActiveCheckinSubMood] = useState<string[]>([]);
  const [checkinSuccess, setCheckinSuccess] = useState<boolean>(false);
  const [isCommitingCheckin, setIsCommitingCheckin] = useState<boolean>(false);

  const subMoodsOptions = [
    { label: "Numb", color: "hover:bg-slate-50 border-slate-200" },
    { label: "Exhausted", color: "hover:bg-bg-sage border-sage/30" },
    { label: "Furious", color: "hover:bg-rose-50 border-rose-150" },
    { label: "Guilty", color: "hover:bg-stone-50 border-stone-200" },
    { label: "Anxious", color: "hover:bg-slate-50 border-slate-200" },
    { label: "Hopeful", color: "hover:bg-bg-sage border-sage/40" },
    { label: "Accepting", color: "hover:bg-bg-sage border-sage" }
  ];

  const handleSubMoodSelect = (mood: string) => {
    setActiveCheckinSubMood(prev => {
      if (prev.includes(mood)) {
        return prev.filter(m => m !== mood);
      } else {
        return [...prev, mood];
      }
    });
  };

  // Submit active wellness log
  const handleCheckinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCommitingCheckin(true);
    try {
      await onCreateCheckin({
        moodScore,
        subMoods: activeCheckinSubMood,
        sleepHours,
        physicalActivity
      });
      setCheckinSuccess(true);
      setActiveCheckinSubMood([]);
      setTimeout(() => setCheckinSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsCommitingCheckin(false);
    }
  };

  // Detect and analyze emotional deterioration across days and logs
  const deteriorationAssessment = useMemo(() => {
    if (entries.length < 2) return { warn: false, msg: "Keep journaling to monitor emotional stability." };
    
    const scores = entries.slice(0, 3).map(e => e.overallMoodScore);
    const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    
    if (averageScore <= 3) {
      return {
        warn: true,
        bg: "bg-rose-50 border border-rose-150 text-rose-950",
        tag: "CRITICAL SUPPORT NOTICE",
        msg: `We notice a prolonged heavy emotional baseline (average mood index: ${averageScore.toFixed(1)}/10) over your recent records. Grieving is cyclical, but carrying constant high fatigue can feel overwhelmingly complex. We strongly recommed consulting Seattle Grief Counselors NGO listed in our Map Directory.`
      };
    }
    
    return {
      warn: false,
      bg: "bg-bg-sage border border-sage/20 text-slate-800",
      tag: "COMPASSION TIMELINE INDEX",
      msg: "Your processed records indicate non-linear, healthy emotional range progression. Allow yourself space to alternate between sadness and gentle resets."
    };
  }, [entries]);

  // Tailored recommendation cards depending on active context
  const recommendedResourcesList = useMemo(() => {
    const focus = currentUser?.transitionType || "bereavement";
    return resources.filter(res => res.specialization.includes(focus)).slice(0, 2);
  }, [resources, currentUser]);

  // Generate interactive SVG graph lines for mood logs progression
  const chartPoints = useMemo(() => {
    // Collect last 7 logs (combining checkin mood scores first, or journals)
    const pointsData = [...checkins].slice(-7).map(c => ({
      score: c.moodScore,
      date: new Date(c.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    }));

    if (pointsData.length === 0) {
      // Seed placeholders for the chart
      return [
        { score: 3, date: "Day 1" },
        { score: 2, date: "Day 2" },
        { score: 4, date: "Day 3" },
        { score: 3, date: "Day 4" },
        { score: 5, date: "Day 5" },
        { score: 4, date: "Day 6" },
        { score: 6, date: "Day 7" }
      ];
    }
    return pointsData;
  }, [checkins]);

  // Render SVG points calculation
  const svgLinePath = useMemo(() => {
    const totalPoints = chartPoints.length;
    if (totalPoints < 2) return '';
    const gridWidth = 460;
    const gridHeight = 120;
    
    return chartPoints.map((pt, idx) => {
      const x = (idx / (totalPoints - 1)) * gridWidth + 20;
      // Invert Y scale since SVG 0 is top
      // mood range is 1-10
      const y = gridHeight - ((pt.score - 1) / 9) * gridHeight + 15;
      return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  }, [chartPoints]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8" id="dashboard-system">
      
      {/* Dynamic Greetings banner */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 bg-bg-sage border border-sage/30 rounded-3xl p-6">
        <div>
          <span className="text-[10px] font-semibold tracking-widest text-sage uppercase bg-white border border-[#e2e8e0] px-3 py-1 rounded-full">SANCTUARY GATEWAY</span>
          <h1 className="text-3xl font-serif font-medium text-slate-800 mt-2.5">
            Welcome, {currentUser?.displayName || "Kind Seeker"}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            GriefBridge context: Processing <strong className="text-sage font-semibold uppercase tracking-wide">{currentUser?.transitionType.replace('-', ' ')}</strong>
          </p>
        </div>

        <button 
          onClick={() => onTabChange('journal')}
          className="rounded-full bg-slate-800 hover:bg-sage text-white font-medium py-2.5 px-6 text-xs transition duration-200 active:translate-y-0"
          id="dashboard-write-new-btn"
        >
          Begin Emotional Journaling
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        
        {/* Left Grid: Mood analytics, SVG Chart, and AI dynamic insights */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Recovery progress chart card */}
          <div className="rounded-3xl border border-[#F1F5F9] bg-white p-6 shadow-sm" id="progress-chart-card">
            <div className="flex items-center justify-between border-b border-slate-50 pb-3">
              <h3 className="font-serif text-lg font-medium text-slate-800 flex items-center gap-1.5">
                <TrendingUp className="h-5 w-5 text-sage" />
                <span>Wellness & Recovery Progression</span>
              </h3>
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest">Mood Intensity History</span>
            </div>

            {/* Simulated interactive SVG Line chart */}
            <div className="mt-5 relative">
              <svg 
                viewBox="0 0 500 150" 
                className="w-full h-40 text-slate-200"
                id="svg-mood-chart"
              >
                {/* Horizontal reference indicator grid lines */}
                <line x1="20" y1="15" x2="480" y2="15" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3,3" />
                <line x1="20" y1="75" x2="480" y2="75" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3,3" />
                <line x1="20" y1="135" x2="480" y2="135" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3,3" />
                
                {/* Grid Side labels */}
                <text x="5" y="18" fill="#94a3b8" fontSize="8" fontFamily="monospace">10</text>
                <text x="5" y="78" fill="#94a3b8" fontSize="8" fontFamily="monospace">5</text>
                <text x="5" y="138" fill="#94a3b8" fontSize="8" fontFamily="monospace">1</text>

                {/* Render linear path */}
                <path
                  d={svgLinePath}
                  fill="none"
                  stroke="url(#chartGradient)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  id="chart-svg-path"
                />

                {/* Chart path gradient */}
                <defs>
                  <linearGradient id="chartGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#94a3b8" />
                    <stop offset="100%" stopColor="#718355" />
                  </linearGradient>
                </defs>

                {/* Interactive coordinate dots */}
                {chartPoints.map((pt, idx) => {
                  const x = (idx / (chartPoints.length - 1)) * 460 + 20;
                  const y = 120 - ((pt.score - 1) / 9) * 120 + 15;
                  return (
                    <circle
                      key={idx}
                      cx={x}
                      cy={y}
                      r="4"
                      className="fill-white stroke-sage stroke-2 hover:r-6 hover:fill-sage transition duration-150 cursor-pointer"
                    />
                  );
                })}
              </svg>

              {/* X Axes labels */}
              <div className="flex justify-between text-[9px] font-mono font-bold text-stone-400 uppercase tracking-widest mt-2 px-6">
                {chartPoints.map((pt, i) => (
                  <span key={i}>{pt.date}</span>
                ))}
              </div>
            </div>

            <p className="text-[10px] text-stone-400 px-1 mt-3 italic">
              <strong>Scale Index:</strong> Log values represent overall daily coping scores. Submitting daily well-being check-ins on the right feeds this progression map dynamically.
            </p>
          </div>

          {/* AI Emotional Insights analysis report card */}
          <div className="rounded-3xl border border-[#F1F5F9] bg-white p-6 shadow-sm relative overflow-hidden" id="insights-compilation-card">
            <div className="flex items-center justify-between border-b border-slate-50 pb-3">
              <h3 className="font-serif text-lg font-medium text-slate-800 flex items-center gap-1.5">
                <Sparkles className="h-5 w-5 text-sage" />
                <span>GriefBridge Compassionate Insights Compiler</span>
              </h3>
              
              <button 
                onClick={onRefreshInsights}
                className="p-1 rounded-full text-slate-400 hover:text-sage hover:bg-slate-50 transition"
                title="Sychronize feedback"
                id="refresh-insights-btn"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>

            {aiInsights ? (
              <div className="mt-5 space-y-4">
                <p className="text-xs text-slate-600 leading-relaxed font-normal whitespace-pre-wrap pl-1">
                  {aiInsights.summary}
                </p>

                {!aiInsights.noData && (
                  <div className="flex items-center gap-3 border-t border-slate-100 pt-4 mt-2">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                      EVALUATION COHORT: {aiInsights.journalCount} RECENT ENTRIES
                    </span>
                    <span className="text-xs font-semibold text-sage uppercase bg-bg-sage px-2.5 py-0.5 rounded-full ml-auto">
                      TREND: {aiInsights.recentDominant || "PRESERVATIVE"}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-10 text-center space-y-2">
                <div className="h-4 w-4 rounded-full border-2 border-sage border-t-transparent animate-spin mx-auto" />
                <span className="text-xs text-slate-400 tracking-wide block">Compiling your support timeline insights...</span>
              </div>
            )}
          </div>

          {/* Dynamic deterrent notice card */}
          <div className={`p-5 rounded-3xl ${deteriorationAssessment.warn ? deteriorationAssessment.bg : 'bg-bg-sage border border-sage/30 text-slate-700'}`} id="deterioration-notification">
            <div className="flex gap-4">
              <AlertCircle className={`h-6 w-6 mt-0.5 flex-shrink-0 ${deteriorationAssessment.warn ? 'text-rose-500 animate-pulse' : 'text-sage'}`} />
              <div className="space-y-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider block">
                  {deteriorationAssessment.warn ? "CRITICAL PROACTIVE SUPPORT ALERT" : "SUPPORT INDEX LOG"}
                </span>
                <p className="text-xs leading-relaxed font-normal">
                  {deteriorationAssessment.msg}
                </p>
                {deteriorationAssessment.warn && (
                  <button 
                    onClick={() => onTabChange('map')}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-semibold px-4.5 py-1.5 text-xs transition"
                  >
                    <span>Inspect Seattle Directory Mapping</span>
                  </button>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Right Grid: Checkin Form, Tailored suggestions, and community snippets */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Well-being check-in container */}
          <div className="rounded-3xl border border-[#F1F5F9] bg-white p-6 shadow-sm" id="daily-checkin-module">
            <h3 className="font-serif text-lg font-medium text-slate-800 pb-3 border-b border-slate-50 flex items-center gap-1.5">
              <Calendar className="h-5 w-5 text-sage" />
              <span>Daily Somatic Check-In</span>
            </h3>

            <form onSubmit={handleCheckinSubmit} className="mt-5 space-y-4">
              
              {/* Slider for wellness mood */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-500">How is your emotional volume today?</span>
                  <span className="font-mono text-sage font-bold">{moodScore}/10</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="10" 
                  value={moodScore}
                  onChange={e => setMoodScore(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-sage outline-none"
                  id="checkin-mood-slider"
                />
              </div>

              {/* Submood selections */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider block">Select Active Mood Texture</span>
                <div className="flex flex-wrap gap-1.5" id="checkin-mood-tags">
                  {subMoodsOptions.map((opt) => {
                    const isSelected = activeCheckinSubMood.includes(opt.label);
                    return (
                      <button
                        type="button"
                        key={opt.label}
                        onClick={() => handleSubMoodSelect(opt.label)}
                        className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${opt.color} ${
                          isSelected ? 'bg-sage text-white font-bold border-sage hover:bg-sage/95' : 'bg-white text-slate-600 border-[#F1F5F9]'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sleephours and somatic walk checkbox */}
              <div className="grid grid-cols-2 gap-4 border-t border-slate-50 pt-3.5">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider block">Sleep Quality</label>
                  <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-150">
                    <Moon className="h-4 w-4 text-slate-400" />
                    <input 
                      type="number" 
                      min="0" 
                      max="24"
                      value={sleepHours}
                      onChange={e => setSleepHours(Number(e.target.value) || 0)}
                      className="w-full text-xs text-slate-800 font-mono font-bold bg-transparent outline-none"
                      id="checkin-sleep-input"
                    />
                    <span className="text-[9px] text-slate-400 font-semibold font-mono">hrs</span>
                  </div>
                </div>

                <div className="space-y-2 flex flex-col justify-end">
                  <div 
                    onClick={() => setPhysicalActivity(!physicalActivity)}
                    className="flex items-center gap-2 cursor-pointer text-xs"
                    id="checkin-somatic-checkbox"
                  >
                    <input 
                      type="checkbox" 
                      checked={physicalActivity}
                      readOnly
                      className="h-4.5 w-4.5 rounded-md text-sage border-slate-200 outline-none"
                    />
                    <span className="font-semibold text-slate-600 leading-snug">Outdoor Somatic Walk done?</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-50 pt-4">
                {checkinSuccess && (
                  <motion.div 
                    initial={{ opacity: 0, x: 5 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    className="flex items-center gap-1 text-[10px] font-semibold text-sage bg-bg-sage px-2.5 py-1 rounded-md"
                    id="checkin-success-badge"
                  >
                    <Check className="h-3 w-3" />
                    <span>Somatic Log Committed</span>
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={isCommitingCheckin}
                  className="rounded-full bg-slate-800 hover:bg-sage disabled:bg-slate-400 text-white font-semibold py-2 px-6 text-xs transition ml-auto flex items-center gap-1"
                  id="checkin-submit-btn"
                >
                  <span>Log Check-in</span>
                </button>
              </div>

            </form>
          </div>

          {/* Compassionate Memory & Comfort Jar Module */}
          <MemoryJar />

          {/* Core Support tailor cards */}
          <div className="rounded-3xl border border-[#F1F5F9] bg-bg-sage p-6 space-y-4" id="recommended-options-card">
            <h4 className="font-serif font-medium text-slate-800 flex items-center gap-1.5 border-b border-sage/20 pb-2">
              <Compass className="h-5 w-5 text-sage" />
              <span>Tailored Support Directory Match</span>
            </h4>

            {recommendedResourcesList.map(res => (
              <div 
                key={res.id}
                onClick={() => onTabChange('map')}
                className="bg-white rounded-2xl p-4 border border-slate-50 hover:border-sage/40 cursor-pointer shadow-xs group transition flex justify-between items-start gap-3"
                id={`recommendation-${res.id}`}
              >
                <div>
                  <span className="bg-bg-sage text-sage px-2 py-0.5 rounded-full text-[8.5px] font-bold uppercase tracking-wider block w-max">
                    {res.type}
                  </span>
                  <h5 className="font-serif font-semibold text-slate-800 text-xs mt-1.5 leading-snug group-hover:text-sage transition">
                    {res.name}
                  </h5>
                  <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{res.address}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-[10px] uppercase font-mono font-bold text-sage bg-bg-sage px-1.5 py-0.5 rounded">
                    {res.cost}
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>

    </div>
  );
}
