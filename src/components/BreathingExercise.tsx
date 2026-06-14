/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { X, Play, Pause, RotateCcw, Heart, Check, Wind } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BreathingProps {
  onClose: () => void;
}

export default function BreathingExercise({ onClose }: BreathingProps) {
  const [phase, setPhase] = useState<'idle' | 'inhale' | 'hold' | 'exhale'>('idle');
  const [timeLeft, setTimeLeft] = useState(4);
  const [completedCycles, setCompletedCycles] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [guidingInstruction, setGuidingInstruction] = useState("Tap 'Begin' to ground yourself.");

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      if (timeLeft > 0) {
        timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
      } else {
        // Transition to next breathing stage
        if (phase === 'idle' || phase === 'exhale') {
          setPhase('inhale');
          setTimeLeft(4);
          setGuidingInstruction("Breathe in slowly... expanding your chest.");
        } else if (phase === 'inhale') {
          setPhase('hold');
          setTimeLeft(4);
          setGuidingInstruction("Hold gently... absorb this moment of calm.");
        } else if (phase === 'hold') {
          setPhase('exhale');
          setTimeLeft(4);
          setGuidingInstruction("Release completely... blowing away the worry.");
          setCompletedCycles(prev => prev + 1);
        }
      }
    }
    return () => clearTimeout(timer);
  }, [isPlaying, timeLeft, phase]);

  const handleStart = () => {
    setIsPlaying(true);
    setPhase('inhale');
    setTimeLeft(4);
    setGuidingInstruction("Breathe in slowly... expanding your chest.");
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setPhase('idle');
    setTimeLeft(4);
    setCompletedCycles(0);
    setGuidingInstruction("Tap 'Begin' to restart.");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 p-4 backdrop-blur-md" id="breathing-session">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg overflow-hidden rounded-3xl bg-white p-8 shadow-2xl border border-stone-100"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sage">
            <Wind className="h-6 w-6" id="breath-logo" />
            <span className="font-semibold text-xs tracking-widest uppercase">GriefBridge Somatic</span>
          </div>
          <button 
            onClick={onClose} 
            className="rounded-full p-2 text-stone-400 hover:bg-stone-50 hover:text-stone-700 transition"
            id="close-breath-btn"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="my-6 text-center">
          <h2 className="text-3xl font-serif font-medium text-slate-800" id="breath-title">Mindful Circle</h2>
          <p className="mt-2 text-xs text-slate-550 leading-relaxed font-normal">
            A guided box-breathing cycle designed to ground your nervous system.
          </p>
        </div>

        {/* Dynamic Breathing Portal */}
        <div className="flex h-64 items-center justify-center relative">
          <AnimatePresence mode="popLayout">
            {phase !== 'idle' && (
              <motion.div 
                key={phase}
                initial={{ opacity: 0.3 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0.3 }}
                className={`absolute inset-0 flex items-center justify-center rounded-full transition-all duration-1000 ${
                  phase === 'inhale' ? 'm-12 bg-[#F0F4EF]/70 scale-125' : 
                  phase === 'hold' ? 'm-12 bg-emerald-50/40 scale-125 ring-8 ring-emerald-100/40' : 
                  'm-16 bg-amber-50/40 scale-100'
                }`}
              />
            )}
          </AnimatePresence>

          {/* Core Breathing Orb */}
          <div 
            className={`flex h-40 w-40 items-center justify-center rounded-full text-center text-white transition-all duration-1000 ${
              phase === 'inhale' ? 'bg-[#718355] shadow-xs scale-110' :
              phase === 'hold' ? 'bg-[#8fa89b] shadow-xs scale-110' :
              phase === 'exhale' ? 'bg-[#DEBD70] shadow-xs scale-95' :
              'bg-slate-105 text-slate-500 ring-4 ring-slate-100/50'
            }`}
            id="breath-core-orb"
          >
            <div className="p-3">
              {phase === 'idle' ? (
                <Wind className="mx-auto h-8 w-8 text-sage opacity-75 animate-pulse" />
              ) : (
                <div>
                  <div className="text-[10px] uppercase tracking-widest font-semibold opacity-90">{phase}</div>
                  <div className="mt-1 text-3xl font-light font-mono">{timeLeft}s</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Guiding text instructions */}
        <div className="min-h-[50px] text-center px-4">
          <p className="text-sm text-slate-700 italic" id="breath-instructions">{guidingInstruction}</p>
          {completedCycles > 0 && (
            <div className="mt-2 flex items-center justify-center gap-1.5 text-xs text-slate-500">
              <Check className="h-3.5 w-3.5 text-sage" />
              <span>Session progress: <strong>{completedCycles}</strong> complete {completedCycles === 1 ? 'cycle' : 'cycles'}</span>
            </div>
          )}
        </div>

        {/* Controls Panel */}
        <div className="mt-8 flex items-center justify-center gap-4 border-t border-slate-50 pt-6">
          <button
            onClick={handleReset}
            disabled={phase === 'idle'}
            className="flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition disabled:opacity-40"
            id="reset-breath-btn"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reset</span>
          </button>

          {isPlaying ? (
            <button
              onClick={handlePause}
              className="flex items-center gap-2 rounded-full bg-slate-800 px-6 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-slate-900 transition"
              id="pause-breath-btn"
            >
              <Pause className="h-4 w-4 fill-white" />
              <span>Pause</span>
            </button>
          ) : (
            <button
              onClick={handleStart}
              className="flex items-center gap-2 rounded-full bg-slate-800 px-7 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-sage transition"
              id="start-breath-btn"
            >
              <Play className="h-4 w-4 fill-white" />
              <span>Begin Session</span>
            </button>
          )}
        </div>

        {/* Healing support tips */}
        <div className="mt-6 flex gap-3 rounded-2xl bg-bg-sage border border-sage/20 p-4">
          <Heart className="h-5 w-5 text-sage flex-shrink-0 mt-0.5 animate-pulse" />
          <p className="text-xs text-slate-700 leading-relaxed font-normal">
            <strong>Somatic Grounding Note:</strong> Slowing your exhalations activates the vagus nerve, initiating an automated calm response in your nervous system. It balances rapid heart rate and brings gentle clarity.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
