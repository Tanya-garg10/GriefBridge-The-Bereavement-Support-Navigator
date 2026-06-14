/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CommunityPost, TransitionType, User } from '../types';
import { MessageSquare, Heart, Bookmark, Share2, Tag, ShieldAlert, ArrowRight, User as UserIcon, Calendar, Check, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ForumProps {
  posts: CommunityPost[];
  currentUser: User | null;
  onCreatePost: (postData: { category: string; title: string; body: string; anonymous: boolean; tags: string[] }) => Promise<void>;
  onLikePost: (postId: string) => Promise<void>;
  onAddReply: (postId: string, replyData: { body: string; anonymous: boolean }) => Promise<void>;
}

export default function Forum({ posts, currentUser, onCreatePost, onLikePost, onAddReply }: ForumProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [newCategory, setNewCategory] = useState<TransitionType>('bereavement');
  const [anonymous, setAnonymous] = useState(true);
  const [newTagsStr, setNewTagsStr] = useState('');
  
  const [replyBody, setReplyBody] = useState<Record<string, string>>({});
  const [replyAnonymous, setReplyAnonymous] = useState<Record<string, boolean>>({});
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);

  const [isSubmittingPost, setIsSubmittingPost] = useState(false);
  const [postSuccess, setPostSuccess] = useState(false);

  const categories = [
    { value: 'all', label: 'All Circles' },
    { value: 'bereavement', label: 'Bereavement' },
    { value: 'divorce', label: 'Divorce & Sep' },
    { value: 'job-loss', label: 'Job Loss' },
    { value: 'relationship-breakdown', label: 'Relationship Split' },
    { value: 'life-transition', label: 'Life Transition' }
  ];

  const filteredPosts = posts.filter(post => {
    if (activeCategory === 'all') return true;
    return post.category === activeCategory;
  });

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newBody.trim()) return;

    setIsSubmittingPost(true);
    try {
      const tags = newTagsStr
        .split(',')
        .map(t => t.trim().toUpperCase())
        .filter(t => t.length > 0);

      await onCreatePost({
        category: newCategory,
        title: newTitle,
        body: newBody,
        anonymous,
        tags
      });

      setNewTitle('');
      setNewBody('');
      setNewTagsStr('');
      setPostSuccess(true);
      setTimeout(() => setPostSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingPost(false);
    }
  };

  const handleAddReply = async (postId: string) => {
    const body = replyBody[postId];
    if (!body || !body.trim()) return;
    const isAnon = replyAnonymous[postId] !== false; // default true/anonymous for safety

    try {
      await onAddReply(postId, { body, anonymous: isAnon });
      setReplyBody(prev => ({ ...prev, [postId]: '' }));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8" id="community-support-forum">
      {/* Overview Intro banner */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-stone-800">Community Support Circles</h1>
          <p className="mt-1 text-sm text-stone-500">
            A secure, moderated support board. Share your raw feelings, write completely anonymously to preserve your privacy, and find peer validation from those walking identical paths.
          </p>
        </div>

        <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3.5 py-1.5 text-xs text-emerald-700 font-semibold border border-emerald-100/30">
          <ShieldAlert className="h-4.5 w-4.5" />
          <span>Moderated Anonymous Space</span>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        
        {/* Left column: Feed threads list filtered by categories */}
        <div className="lg:col-span-7 space-y-6" id="forum-posts-feed">
          
          {/* Categories Tab Bar */}
          <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none" id="categories-tabs">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`rounded-full px-4 py-2 text-xs font-semibold tracking-wide whitespace-nowrap transition-colors ${
                  activeCategory === cat.value
                    ? 'bg-slate-800 text-white'
                    : 'bg-white border border-stone-105 text-stone-500 hover:bg-stone-50 hover:text-stone-800'
                }`}
                id={`cat-forum-tab-${cat.value}`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Posts list container */}
          <div className="space-y-4" id="forum-threads-list">
            <AnimatePresence mode="popLayout">
              {filteredPosts.length === 0 ? (
                <div className="text-center py-16 bg-white border border-stone-100 rounded-3xl p-8 space-y-3">
                  <MessageSquare className="mx-auto h-10 w-10 text-stone-300 animate-pulse" />
                  <h4 className="font-serif font-bold text-stone-700 text-lg">Circle is quiet right now</h4>
                  <p className="text-xs text-stone-400 max-w-sm mx-auto leading-relaxed">
                    Be the first to share a post. Every word of raw vulnerability built tomorrow acts as a bridge for someone struggling today.
                  </p>
                </div>
              ) : (
                filteredPosts.map((post) => {
                  const hasLiked = post.likedBy?.includes(currentUser?.uid || '') || false;
                  const isExpanded = expandedPostId === post.id;
                  
                  return (
                    <motion.div
                      key={post.id}
                      layout="position"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="rounded-3xl border border-stone-100 bg-white p-6 shadow-sm hover:shadow transition duration-200"
                      id={`grief-post-${post.id}`}
                    >
                      {/* Author Header Row */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img 
                            src={post.authorAvatar} 
                            alt={post.authorName} 
                            referrerPolicy="no-referrer"
                            className="h-9 w-9 rounded-full border border-stone-200 bg-stone-50"
                          />
                          <div>
                            <span className="text-xs font-bold text-stone-700 block">
                              {post.authorName}
                            </span>
                            <span className="text-[10px] text-stone-400 mt-0.5 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(post.createdAt).toLocaleDateString(undefined, {month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'})}
                            </span>
                          </div>
                        </div>

                        <span className="rounded-full bg-bg-sage px-2.5 py-1 text-[9px] font-semibold text-sage uppercase tracking-widest border border-sage/10">
                          {post.category.replace('-', ' ')}
                        </span>
                      </div>

                      {/* Main Message content */}
                      <div className="mt-4">
                        <h3 className="font-serif font-bold text-lg text-stone-850 leading-snug">{post.title}</h3>
                        <p className="text-xs text-stone-600 leading-relaxed mt-2.5 whitespace-pre-wrap">
                          {post.body}
                        </p>
                      </div>

                      {/* Tag list */}
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3.5">
                          {post.tags.map((tag) => (
                            <span key={tag} className="inline-flex items-center gap-1 bg-stone-50 px-2 py-0.5 rounded-lg text-[9px] font-bold text-stone-400 uppercase tracking-wider">
                              <Tag className="h-2.5 w-2.5" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Feedback buttons & action panel */}
                      <div className="flex items-center justify-between border-t border-stone-50 pt-4 mt-5 text-stone-400">
                        <button
                          onClick={() => onLikePost(post.id)}
                          className={`flex items-center gap-1.5 hover:text-rose-500 text-xs font-semibold px-2.5 py-1.5 rounded-full hover:bg-rose-50 transition ${
                            hasLiked ? 'text-rose-600 font-bold fill-rose-500 bg-rose-50/50' : ''
                          }`}
                          id={`like-post-btn-${post.id}`}
                        >
                          <Heart className="h-4 w-4" />
                          <span>{post.likes} Hearts</span>
                        </button>

                        <button
                          onClick={() => setExpandedPostId(isExpanded ? null : post.id)}
                          className={`flex items-center gap-1.5 hover:text-sage text-xs font-semibold px-3 py-1.5 rounded-full transition ${
                            isExpanded ? 'text-sage bg-bg-sage font-bold' : 'hover:bg-slate-50'
                          }`}
                          id={`expanded-post-btn-${post.id}`}
                        >
                          <MessageSquare className="h-4 w-4 text-sage" />
                          <span>{post.replies?.length || 0} Supportive Notes</span>
                        </button>
                      </div>

                      {/* Replies collapse panel */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden mt-4 pt-4 border-t border-stone-100"
                            id={`replies-collapse-${post.id}`}
                          >
                            <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
                              {post.replies && post.replies.length > 0 ? (
                                post.replies.map((reply) => (
                                  <div key={reply.id} className="bg-stone-50/70 rounded-2xl p-3.5 text-xs border border-stone-100/50">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <img 
                                          src={reply.authorAvatar} 
                                          alt={reply.authorName} 
                                          referrerPolicy="no-referrer"
                                          className="h-6 w-6 rounded-full border border-stone-200"
                                        />
                                        <span className="font-bold text-stone-700">{reply.authorName}</span>
                                      </div>
                                      <span className="text-[9px] text-stone-400">
                                        {new Date(reply.createdAt).toLocaleDateString(undefined, {month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'})}
                                      </span>
                                    </div>
                                    <p className="text-stone-600 leading-relaxed mt-2 pl-0.5 whitespace-pre-wrap">{reply.body}</p>
                                  </div>
                                ))
                              ) : (
                                <p className="text-stone-400 text-xs italic text-center py-2">
                                  No comforting notes added yet. Write a kind response below to show support.
                                </p>
                              )}
                            </div>

                            {/* Reply Input Form */}
                            <div className="mt-4 flex items-center gap-2">
                              <textarea
                                value={replyBody[post.id] || ''}
                                onChange={(e) => setReplyBody(prev => ({ ...prev, [post.id]: e.target.value }))}
                                placeholder="Add a comforting, kind peer response..."
                                rows={2}
                                className="w-full text-xs text-stone-705 placeholder-stone-400 bg-stone-50 focus:bg-white border border-stone-100 rounded-xl p-2.5 outline-none focus:border-sage resize-none"
                              />

                              <div className="flex flex-col gap-2">
                                <button
                                  onClick={() => handleAddReply(post.id)}
                                  className="rounded-xl bg-slate-800 hover:bg-sage text-white p-2.5 shadow hover:shadow-xs transition active:scale-95"
                                  id={`add-reply-submit-${post.id}`}
                                >
                                  <Send className="h-4 w-4" />
                                </button>
                                
                                <button
                                  onClick={() => setReplyAnonymous(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
                                  className={`rounded-xl border px-2 py-1 text-[9px] font-bold tracking-wide uppercase transition ${
                                    replyAnonymous[post.id] !== false 
                                      ? 'bg-rose-50 text-rose-600 border-rose-100' 
                                      : 'bg-stone-50 text-stone-500 border-stone-100'
                                  }`}
                                  id={`anon-reply-toggle-${post.id}`}
                                >
                                  {replyAnonymous[post.id] !== false ? 'Anon' : 'Public'}
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right column: Create post card, safety notice */}
        <div className="lg:col-span-5 space-y-6" id="forum-sidebar">
          
          {/* Create Post Card Form */}
          <div className="rounded-3xl border border-stone-100 bg-white p-6 shadow-sm" id="create-thread-node">
            <h3 className="font-serif text-sm font-medium text-slate-800 pb-3 border-b border-stone-50 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-sage" />
              <span>Share Comfort in the Circle</span>
            </h3>

            <form onSubmit={handleCreatePost} className="mt-5 space-y-4">
              
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Select Circle Category</span>
                <select
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value as TransitionType)}
                  className="w-full rounded-xl border border-stone-100 bg-stone-50/50 py-2.5 px-3 text-xs font-semibold text-stone-700 outline-none"
                  id="create-post-category"
                >
                  <option value="bereavement">Loss / Bereavement</option>
                  <option value="divorce">Separation / Divorce</option>
                  <option value="job-loss">Job / Layoff Loss</option>
                  <option value="relationship-breakdown">Relationship Split</option>
                  <option value="life-transition">Life Transitions</option>
                </select>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Title / Topic</span>
                <input
                  type="text"
                  placeholder="Summarize your raw thought..."
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full rounded-xl border border-stone-100 bg-stone-50/50 px-3 py-2 text-xs text-stone-800 placeholder-stone-400 outline-none focus:bg-white focus:border-sage"
                  id="create-post-title"
                />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Your Message Message</span>
                <textarea
                  placeholder="Write the details of what you feel today. Write freely—the community stands ready to lift you up."
                  required
                  rows={4}
                  value={newBody}
                  onChange={(e) => setNewBody(e.target.value)}
                  className="w-full rounded-xl border border-stone-100 bg-stone-50/50 px-3 py-2 text-xs text-stone-800 placeholder-stone-400 outline-none focus:bg-white focus:border-sage resize-none"
                  id="create-post-body"
                />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Keywords Tags (commas split)</span>
                <input
                  type="text"
                  placeholder="e.g. ANNIVERSARY, LONELY, HEALING"
                  value={newTagsStr}
                  onChange={(e) => setNewTagsStr(e.target.value)}
                  className="w-full rounded-xl border border-stone-100 bg-stone-50/50 px-3 py-2 text-xs text-stone-850 placeholder-stone-300 outline-none"
                  id="create-post-tags"
                />
              </div>

              {/* Selector for anonymity */}
              <div className="flex items-center justify-between border-t border-stone-50 pt-3 mt-1 text-xs">
                <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => setAnonymous(!anonymous)} id="toggle-anon-btn">
                  <input
                    type="checkbox"
                    checked={anonymous}
                    readOnly
                    className="h-4 w-4 rounded-md text-rose-600 border-stone-300 focus:ring-rose-500"
                  />
                  <span className="font-semibold text-stone-600">Post Anonymously</span>
                </div>

                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                  anonymous ? 'bg-rose-50 text-rose-600' : 'bg-stone-100 text-stone-500'
                }`}>
                  {anonymous ? "Fully Anonymous" : "Public profile"}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2 border-t border-stone-50 pt-4">
                {postSuccess && (
                  <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-md" id="forum-saved-indicator">
                    <Check className="h-3 w-3" />
                    <span>Circle post submitted</span>
                  </div>
                )}
                
                <button
                  type="submit"
                  disabled={isSubmittingPost}
                  className="rounded-full bg-slate-800 hover:bg-sage disabled:bg-stone-400 text-white font-semibold py-2 px-6 text-xs transition flex items-center gap-1.5 ml-auto cursor-pointer"
                  id="post-submit-btn"
                >
                  <span>Share thoughts</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>

            </form>
          </div>

          {/* Peer Code of Ethics notice */}
          <div className="rounded-3xl border border-sage/20 bg-bg-sage p-5 space-y-3">
            <h4 className="font-serif font-semibold text-[#5a6a43] text-sm flex items-center gap-1.5">
              <UserIcon className="h-4.5 w-4.5 text-sage" />
              <span>GriefBridge Circle Code of Ethics</span>
            </h4>
            <ul className="text-xs text-stone-600 space-y-2 list-disc pl-4 leading-relaxed">
              <li><strong>Absolute Confidentiality:</strong> Never copy, screenshot, or share personal messages outside of GriefBridge.</li>
              <li><strong>Zero Toxic Positivity:</strong> Avoid forcing optimistic outcomes (e.g., do not say &quot;Look at the bright side&quot;). Validate sorrow before sharing cope suggestions.</li>
              <li><strong>Diverse Grief Models:</strong> Divorce, job transitions, and physical loss are all valid bereavements. We hold equal respect.</li>
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
}
