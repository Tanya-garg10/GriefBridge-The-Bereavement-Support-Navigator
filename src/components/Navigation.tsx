/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Wind, HeartPulse, Sparkles, BookOpen, MapPin, MessageSquare, User as UserIcon } from 'lucide-react';
import { User } from '../types';

interface NavigationProps {
  currentTab: string;
  setTab: (tab: string) => void;
  currentUser: User | null;
  onOpenBreathing: () => void;
}

export default function Navigation({ currentTab, setTab, currentUser, onOpenBreathing }: NavigationProps) {
  const links = [
    { id: 'dashboard', label: 'Dashboard', icon: HeartPulse },
    { id: 'journal', label: 'Emotion Journal', icon: BookOpen },
    { id: 'map', label: 'Resource Map', icon: MapPin },
    { id: 'community', label: 'Community Support', icon: MessageSquare },
    { id: 'profile', label: 'My Assessment', icon: UserIcon },
  ];

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-stone-100 bg-white/80 backdrop-blur-md" id="app-navigation">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-2.5 cursor-pointer animate-fade-in" onClick={() => setTab('dashboard')} id="nav-brand">
            <div className="w-10 h-10 bg-bg-sage border border-sage/30 rounded-full flex items-center justify-center shrink-0">
              <div className="w-5 h-5 bg-sage rounded-full opacity-60 animate-pulse"></div>
            </div>
            <div>
              <span className="font-serif text-xl font-semibold tracking-tight text-slate-800 block leading-tight">GriefBridge</span>
              <span className="hidden sm:block text-[10px] font-medium tracking-wider text-slate-400 capitalize">Bereavement Navigator</span>
            </div>
          </div>

          {/* Nav Tabs */}
          <div className="hidden md:flex gap-1.5">
            {links.map((link) => {
              const IconComp = link.icon;
              const isActive = currentTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => setTab(link.id)}
                  className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-bg-sage text-sage font-semibold'
                      : 'text-slate-500 hover:bg-stone-50 hover:text-slate-800'
                  }`}
                  id={`nav-link-${link.id}`}
                >
                  <IconComp className={`h-4 w-4 ${isActive ? 'text-sage' : 'text-slate-400'}`} />
                  <span>{link.label}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Grounding & Profile info */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenBreathing}
              className="flex items-center gap-1.5 rounded-full bg-bg-sage px-3.5 py-1.5 text-xs font-semibold text-sage border border-[#e2e8e0] hover:bg-sage/10 transition active:scale-95"
              id="global-somatic-btn"
            >
              <Wind className="h-3.5 w-3.5 text-sage animate-breath" />
              <span>Ground Self</span>
            </button>

            {currentUser && (
              <div 
                onClick={() => setTab('profile')} 
                className="flex items-center gap-2 pl-2 border-l border-stone-100 cursor-pointer hover:opacity-85 transition"
                id="nav-user-avatar"
              >
                <img 
                  src={currentUser.avatar} 
                  alt={currentUser.displayName} 
                  referrerPolicy="no-referrer"
                  className="h-8 w-8 rounded-full border border-stone-200 outline-2 outline-bg-sage"
                />
                <span className="hidden lg:inline-block text-xs font-semibold text-slate-600 truncate max-w-[100px]">
                  {currentUser.displayName}
                </span>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Mini mobile taskbar indicator */}
      <div className="flex md:hidden border-t border-stone-50 justify-around bg-white py-2" id="nav-mobile-tabs">
        {links.map((link) => {
          const IconComp = link.icon;
          const isActive = currentTab === link.id;
          return (
            <button
              key={link.id}
              onClick={() => setTab(link.id)}
              className="flex flex-col items-center justify-center p-1.5 flex-1 transition"
              id={`nav-mobile-link-${link.id}`}
            >
              <IconComp className={`h-5 w-5 ${isActive ? 'text-sage' : 'text-slate-400'}`} />
              <span className={`mt-1 text-[10px] font-medium ${isActive ? 'text-sage font-semibold' : 'text-slate-500'}`}>
                {link.label.split(' ')[0]} {/* shortened representation */}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
