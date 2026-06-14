/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sparkles, Heart, Trash2, Plus, Smile, BookOpen, Feather, ThumbsUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Memory {
  id: string;
  text: string;
  category: 'love-memory' | 'self-care' | 'ray-of-hope';
  createdAt: string;
}

export default function MemoryJar() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [text, setText] = useState('');
  const [category, setCategory] = useState<'love-memory' | 'self-care' | 'ray-of-hope'>('love-memory');
  const [activeFilter, setActiveFilter] = useState<'all' | 'love-memory' | 'self-care' | 'ray-of-hope'>('all');
  const [isAdded, setIsAdded] = useState(false);

  // Load memories from client-side persistent holding state
  useEffect(() => {
    const saved = localStorage.getItem('griefbridge_memories_v2');
    if (saved) {
      try {
        setMemories(JSON.parse(saved));
      } catch (err) {
        console.error("Failed to load local memory jar:", err);
      }
    } else {
      // Seed default soothing memories
      const defaultSamples: Memory[] = [
        {
          id: 'mem-seed-1',
          text: 'Remembering the quiet winter evenings holding warm mugs of tea together. The room was so silent, yet so full.',
          category: 'love-memory',
          createdAt: new Date(Date.now() - 3 * 24 * 3600000).toISOString()
        },
        {
          id: 'mem-seed-2',
          text: 'Managed to complete a full 15-minute mindful box-breathing session today without rushing. Gentle steps.',
          category: 'self-care',
          createdAt: new Date(Date.now() - 1 * 24 * 3600000).toISOString()
        }
      ];
      setMemories(defaultSamples);
      localStorage.setItem('griefbridge_memories_v2', JSON.stringify(defaultSamples));
    }
  }, []);

  const handleSaveMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    const newMemory: Memory = {
      id: `mem-${Date.now()}`,
      text: text.trim(),
      category,
      createdAt: new Date().toISOString()
    };

    const updated = [newMemory, ...memories];
    setMemories(updated);
    localStorage.setItem('griefbridge_memories_v2', JSON.stringify(updated));
    setText('');
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 3000);
  };

  const handleDeleteMemory = (id: string) => {
    const updated = memories.filter(m => m.id !== id);
    setMemories(updated);
    localStorage.setItem('griefbridge_memories_v2', JSON.stringify(updated));
  };

  const filteredMemories = memories.filter(m => {
    if (activeFilter === 'all') return true;
    return m.category === activeFilter;
  });

  const getCategoryTheme = (cat: 'love-memory' | 'self-care' | 'ray-of-hope') => {
    switch (cat) {
      case 'love-memory':
        return {
          label: 'Memory of Love',
          bg: 'bg-rose-50 border-rose-100 text-rose-700',
          indicator: 'bg-rose-400'
        };
      case 'self-care':
        return {
          label: 'Self-Care Act',
          bg: 'bg-bg-sage border-sage/20 text-sage',
          indicator: 'bg-[#718355]'
        };
      case 'ray-of-hope':
        return {
          label: 'Glimmer of Hope',
          bg: 'bg-amber-50 border-amber-100 text-amber-700',
          indicator: 'bg-amber-400'
        };
    }
  };

  return (
    <div className="rounded-3xl border border-[#F1F5F9] bg-white p-6 shadow-sm" id="memory-comfort-jar">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-50 pb-3 mb-5">
        <h3 className="font-serif text-lg font-medium text-slate-800 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-sage animate-pulse" />
          <span>The Memory & Comfort Jar</span>
        </h3>
        <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest">
          Continuing Bonds & Resilience Notes
        </span>
      </div>

      <p className="text-xs text-slate-500 leading-relaxed font-normal mb-5">
        Grieving is also about holding onto the light. Drop comforting flashbacks, achievements of self-care, or sparks of hope into your private jar below.
      </p>

      <form onSubmit={handleSaveMemory} className="space-y-4">
        <div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write down a tender recollection, a kind self-care milestone, or a tiny spark of hope..."
            rows={3}
            maxLength={180}
            className="w-full text-xs text-slate-700 placeholder-slate-400 bg-slate-50/50 focus:bg-white border border-[#F1F5F9] rounded-2xl p-4 outline-none focus:border-sage resize-none transition"
            id="memory-jar-text"
          />
          <div className="flex justify-end text-[9px] text-slate-400 font-mono mt-1">
            {text.length}/180 chars
          </div>
        </div>

        <div className="flex flex-wrap gap-2 items-center justify-between">
          <div className="flex items-center gap-1.5" id="memory-jar-typepicker">
            <button
              type="button"
              onClick={() => setCategory('love-memory')}
              className={`rounded-xl px-3 py-1.5 text-[10px] font-semibold border transition ${
                category === 'love-memory'
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : 'bg-white text-slate-500 border-slate-100 hover:bg-slate-50'
              }`}
            >
              ❤️ Love Memory
            </button>
            <button
              type="button"
              onClick={() => setCategory('self-care')}
              className={`rounded-xl px-3 py-1.5 text-[10px] font-semibold border transition ${
                category === 'self-care'
                  ? 'bg-bg-sage text-sage border-sage/30'
                  : 'bg-white text-slate-500 border-slate-100 hover:bg-slate-50'
              }`}
            >
              🌱 Self-Care Act
            </button>
            <button
              type="button"
              onClick={() => setCategory('ray-of-hope')}
              className={`rounded-xl px-3 py-1.5 text-[10px] font-semibold border transition ${
                category === 'ray-of-hope'
                  ? 'bg-amber-50 text-amber-750 border-amber-200'
                  : 'bg-white text-slate-500 border-slate-100 hover:bg-slate-50'
              }`}
            >
              ✨ Spark of Hope
            </button>
          </div>

          <div className="flex items-center gap-2">
            {isAdded && (
              <motion.span
                initial={{ opacity: 0, x: 5 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-[10px] text-sage font-semibold bg-bg-sage px-2 py-1 rounded"
              >
                Gently Saved
              </motion.span>
            )}
            <button
              type="submit"
              disabled={!text.trim()}
              className="rounded-full bg-slate-805 hover:bg-sage disabled:bg-slate-300 text-white font-semibold py-2 px-5 text-xs transition flex items-center gap-1.5"
              id="save-memory-btn"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Pour into Jar</span>
            </button>
          </div>
        </div>
      </form>

      {/* Filter Tabs for memories */}
      <div className="flex items-center gap-1.5 border-t border-slate-100 pt-5 mt-5">
        <span className="text-[9px] uppercase font-bold text-slate-400 mr-2 tracking-wider">
          Filter Jar:
        </span>
        <button
          onClick={() => setActiveFilter('all')}
          className={`rounded-full px-2.5 py-1 text-[10px] font-semibold transition ${
            activeFilter === 'all'
              ? 'bg-slate-800 text-white'
              : 'text-slate-500 hover:bg-slate-50 border border-slate-100'
          }`}
        >
          All ({(memories.length)})
        </button>
        <button
          onClick={() => setActiveFilter('love-memory')}
          className={`rounded-full px-2.5 py-1 text-[10px] font-semibold transition ${
            activeFilter === 'love-memory'
              ? 'bg-rose-50 text-rose-700 border border-rose-200'
              : 'text-slate-500 hover:bg-slate-50 border border-slate-100'
          }`}
        >
          Love Memories
        </button>
        <button
          onClick={() => setActiveFilter('self-care')}
          className={`rounded-full px-2.5 py-1 text-[10px] font-semibold transition ${
            activeFilter === 'self-care'
              ? 'bg-bg-sage text-sage border border-sage/30'
              : 'text-slate-500 hover:bg-slate-50 border border-slate-100'
          }`}
        >
          Self-Care
        </button>
        <button
          onClick={() => setActiveFilter('ray-of-hope')}
          className={`rounded-full px-2.5 py-1 text-[10px] font-semibold transition ${
            activeFilter === 'ray-of-hope'
              ? 'bg-amber-50 text-amber-700 border border-amber-200'
              : 'text-slate-500 hover:bg-slate-50 border border-slate-100'
          }`}
        >
          Sparks
        </button>
      </div>

      {/* Saved memory list */}
      <div className="mt-4 max-h-[220px] overflow-y-auto space-y-3 pr-1" id="memory-list-scroll">
        <AnimatePresence mode="popLayout">
          {filteredMemories.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs italic font-normal">
              No entries saved in this category yet.
            </div>
          ) : (
            filteredMemories.map(m => {
              const theme = getCategoryTheme(m.category);
              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="p-3 border border-[#F1F5F9] rounded-2xl bg-slate-50/20 hover:bg-white hover:border-slate-150 transition relative group"
                  id={`memory-item-${m.id}`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[8.5px] font-bold uppercase tracking-wide ${theme.bg}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${theme.indicator}`} />
                      {theme.label}
                    </span>
                    
                    <span className="text-[9px] text-slate-400 font-mono font-normal">
                      {new Date(m.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>

                  <p className="text-xs text-slate-650 leading-relaxed font-normal pr-6">
                    {m.text}
                  </p>

                  <button
                    onClick={() => handleDeleteMemory(m.id)}
                    className="absolute right-3 bottom-3 p-1 rounded-full text-slate-350 hover:text-rose-500 hover:bg-rose-50 transition opacity-0 group-hover:opacity-100"
                    title="Gently remove from jar"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      <div className="mt-5 pt-4 border-t border-slate-100 flex gap-2 rounded-2xl bg-slate-50/50 p-3 pb-2.5">
        <Feather className="h-4.5 w-4.5 text-sage mt-0.5 flex-shrink-0 animate-bounce" />
        <p className="text-[10px] text-slate-500 leading-relaxed font-normal">
          <strong>Daily Sanctuary Challenge:</strong> Try depositing at least 1 self-care victory or precious memories of love to strengthen your recovery baseline today.
        </p>
      </div>
    </div>
  );
}
