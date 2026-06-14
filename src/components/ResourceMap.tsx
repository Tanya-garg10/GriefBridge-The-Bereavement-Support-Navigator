/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { SupportResource, TransitionType } from '../types';
import { Map, MapPin, Compass, Search, Filter, Phone, Globe, Star, ShieldCheck, HeartPulse, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ResourceMapProps {
  resources: SupportResource[];
  currentUserContext?: string;
}

// Fixed center: Seattle core coordinates
const CENTER_LAT = 47.6062;
const CENTER_LNG = -122.3321;

// Haversine formula to compute actual spatial miles between coordinates
function calculateDistanceInMiles(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 3958.8; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return parseFloat((R * c).toFixed(1));
}

export default function ResourceMap({ resources }: ResourceMapProps) {
  const [selectedSpecs, setSelectedSpecs] = useState<string>('all');
  const [selectedCost, setSelectedCost] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [maxDistance, setMaxDistance] = useState<number>(15);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Custom user central base coordinates (allows changing base position on grid)
  const [baseCoords, setBaseCoords] = useState({ lat: CENTER_LAT, lng: CENTER_LNG });
  const [activeResId, setActiveResId] = useState<string | null>(null);

  // Compute actual distances and fit metrics
  const mappedResources = useMemo(() => {
    return resources.map(res => {
      const dist = calculateDistanceInMiles(baseCoords.lat, baseCoords.lng, res.latitude, res.longitude);
      return {
        ...res,
        distance: dist
      };
    });
  }, [resources, baseCoords]);

  // Apply full filters
  const filteredResources = useMemo(() => {
    return mappedResources.filter(res => {
      // 1. Distance check
      if (res.distance && res.distance > maxDistance) return false;
      
      // 2. Specialized focus check
      if (selectedSpecs !== 'all' && !res.specialization.includes(selectedSpecs)) return false;
      
      // 3. Cost bracket check
      if (selectedCost !== 'all' && res.cost !== selectedCost) return false;
      
      // 4. Type check
      if (selectedType !== 'all' && res.type !== selectedType) return false;
      
      // 5. Search check
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase();
        const matchesName = res.name.toLowerCase().includes(q);
        const matchesDesc = res.description.toLowerCase().includes(q);
        const matchesAddr = res.address.toLowerCase().includes(q);
        const matchesSpec = res.specialization.some(s => s.toLowerCase().includes(q));
        if (!matchesName && !matchesDesc && !matchesAddr && !matchesSpec) return false;
      }
      
      return true;
    }).sort((a, b) => (a.distance || 0) - (b.distance || 0));
  }, [mappedResources, selectedSpecs, selectedCost, selectedType, maxDistance, searchQuery]);

  const activeResource = useMemo(() => {
    return mappedResources.find(r => r.id === activeResId) || null;
  }, [mappedResources, activeResId]);

  // Function to click map nodes and focus click point
  const handleMapSpotClick = (latOffset: number, lngOffset: number) => {
    const nextLat = CENTER_LAT + latOffset;
    const nextLng = CENTER_LNG + lngOffset;
    setBaseCoords({ lat: parseFloat(nextLat.toFixed(4)), lng: parseFloat(nextLng.toFixed(4)) });
    setActiveResId(null);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8" id="resource-mapping-page">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-medium text-slate-800">Support Resource Directory</h1>
          <p className="mt-1 text-xs text-slate-500 leading-relaxed font-normal">
            Discover validated professional therapists, compassionate peer-circles, bereavement NGOs, and local clinical aids relative to your coordinates.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-bg-sage px-3 py-1.5 text-xs font-semibold text-sage border border-sage/10">
          <Compass className="h-4 w-4 animate-spin text-sage" />
          <span>Centered: Seattle Grid Core ({baseCoords.lat}°N, {Math.abs(baseCoords.lng)}°W)</span>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        
        {/* Left pane: Dense Directory Filters & Detailed Listings */}
        <div className="lg:col-span-5 space-y-6 flex flex-col h-[650px] overflow-hidden" id="listings-pane">
          
          <div className="rounded-2xl border border-stone-100 bg-white p-5 shadow-sm space-y-4 flex-shrink-0">
            {/* Search Input bar */}
            <div className="relative rounded-xl border border-stone-200 bg-stone-50/50 px-3.5 py-2 flex items-center">
              <Search className="h-4.5 w-4.5 text-stone-400 mr-2" />
              <input 
                type="text"
                placeholder="Search counselors, clinics, or keywords..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full text-xs text-stone-800 placeholder-stone-400 bg-transparent outline-none focus:ring-0"
                id="resource-directory-search"
              />
            </div>

            {/* Collapsible/Compact Filters Row */}
            <div className="grid grid-cols-2 gap-3" id="filters-grid">
              
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-semibold text-stone-400 tracking-wider">Grief Type</span>
                <select
                  value={selectedSpecs}
                  onChange={e => setSelectedSpecs(e.target.value)}
                  className="w-full rounded-xl border border-stone-100 bg-stone-50 py-1.5 px-2 text-xs font-medium text-stone-700 outline-none"
                  id="filter-specialization"
                >
                  <option value="all">All Specialties</option>
                  <option value="bereavement">Bereavement Loss</option>
                  <option value="divorce">Separation & Divorce</option>
                  <option value="job-loss">Job Loss Transition</option>
                  <option value="relationship-breakdown">Relationship Split</option>
                  <option value="life-transition">Major Transitions</option>
                </select>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] uppercase font-semibold text-stone-400 tracking-wider">pricing</span>
                <select
                  value={selectedCost}
                  onChange={e => setSelectedCost(e.target.value)}
                  className="w-full rounded-xl border border-stone-100 bg-stone-50 py-1.5 px-2 text-xs font-medium text-stone-700 outline-none"
                  id="filter-cost"
                >
                  <option value="all">Any Pricing</option>
                  <option value="free">Free Support</option>
                  <option value="sliding-scale">Sliding scale</option>
                  <option value="premium">Premium Fee</option>
                </select>
              </div>

            </div>

            {/* Slider for relative distance */}
            <div className="space-y-1 pt-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-stone-505 uppercase tracking-wide">Relative Distance Limits</span>
                <span className="font-mono text-xs font-semibold text-sage tracking-wide">{maxDistance} miles</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="25" 
                value={maxDistance}
                onChange={e => setMaxDistance(Number(e.target.value))}
                className="w-full h-1.5 bg-stone-100 rounded-lg appearance-none cursor-pointer accent-slate-700 focus:outline-none"
                id="distance-slider"
              />
            </div>
          </div>

          {/* List element scrollable container */}
          <div className="overflow-y-auto pr-1 flex-1 space-y-3.5 scrollbar-thin" id="listing-nodes-scroll">
            <div className="text-xs font-bold text-stone-400 tracking-wider px-1">
              RESULTS ({filteredResources.length} LOCATIONS FOUND)
            </div>

            {filteredResources.length === 0 ? (
              <div className="text-center py-10 bg-white border border-dashed rounded-3xl border-stone-200 p-6 space-y-2">
                <Compass className="mx-auto h-8 w-8 text-stone-300" />
                <h4 className="font-serif font-semibold text-stone-705">No support facilities match</h4>
                <p className="text-xs text-stone-400 max-w-xs mx-auto leading-relaxed">
                  Try broadening your distance range, resetting filter fields, or altering your search text details.
                </p>
              </div>
            ) : (
              filteredResources.map((res) => {
                const isActive = activeResId === res.id;
                return (
                  <div
                    key={res.id}
                    onClick={() => setActiveResId(res.id)}
                    className={`cursor-pointer rounded-2xl border p-4.5 transition-all duration-300 relative overflow-hidden ${
                      isActive 
                        ? 'border-sage bg-bg-sage/40 shadow-xs' 
                        : 'border-stone-105 bg-white hover:border-slate-200 hover:shadow-xs shadow-xs'
                    }`}
                    id={`res-node-${res.id}`}
                  >
                    {/* Facility Badge */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider mb-1.5 ${
                          res.type === 'therapist' ? 'bg-slate-100 text-slate-700' :
                          res.type === 'support-group' ? 'bg-emerald-50 text-emerald-700' :
                          'bg-amber-50 text-amber-700'
                        }`}>
                          {res.type.replace('-', ' ')}
                        </span>
                        <h4 className="font-serif font-medium text-slate-800 text-xs leading-snug">{res.name}</h4>
                        <p className="text-[10px] text-stone-400 mt-0.5 line-clamp-1">{res.address}</p>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <span className="text-xs font-extrabold text-sage font-mono block">
                          ~ {res.distance} mi
                        </span>
                        <div className="flex items-center gap-0.5 mt-1 text-amber-500 justify-end">
                          <Star className="h-3 w-3 fill-amber-500" />
                          <span className="text-[10px] font-bold text-stone-600 font-mono">{res.rating}</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-stone-600 leading-relaxed mt-2.5 line-clamp-2">
                      {res.description}
                    </p>

                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {res.specialization.slice(0, 2).map(s => (
                        <span key={s} className="bg-stone-50 px-1.5 py-0.5 rounded text-[10px] font-semibold text-stone-500 uppercase tracking-wide">
                          {s.replace('-', ' ')}
                        </span>
                      ))}
                      <span className="bg-stone-50 px-1.5 py-0.5 rounded text-[10px] font-medium text-slate-600 uppercase tracking-widest font-mono ml-auto">
                        {res.cost.replace('-', ' ')}
                      </span>
                    </div>

                    {isActive && (
                      <motion.div 
                        layoutId="res-active-indicator" 
                        className="absolute top-0 left-0 bottom-0 w-1 bg-sage rounded-r" 
                      />
                    )}
                  </div>
                );
              })
            )}

          </div>

        </div>

        {/* Right pane: Interactive Vector Directional Grid Map and Facility Drawer */}
        <div className="lg:col-span-7 flex flex-col h-[650px] bg-stone-105 rounded-3xl border border-stone-200 overflow-hidden shadow-xs relative" id="interactive-map-cell">
          
          {/* Legend coordinates bar */}
          <div className="bg-white/90 backdrop-blur-sm p-4 border-b border-stone-200/50 flex flex-wrap items-center justify-between gap-3 z-10">
            <div className="flex items-center gap-2">
              <Map className="h-5 w-5 text-sage" />
              <span className="font-serif font-medium text-slate-800 text-sm">Compass Vector Coordinate Map</span>
            </div>
            
            <div className="flex items-center gap-3 text-xs text-stone-500 font-normal">
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-sage" />
                <span>Selected Origin</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-2.5 w-2.5 rounded bg-emerald-500 animate-ping absolute opacity-50" />
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 relative" />
                <span>NGO Facilities</span>
              </div>
            </div>
          </div>

          {/* Interactive Core Coordinate Map Plane */}
          <div className="relative flex-1 bg-stone-50 overflow-hidden bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]" id="coordinate-vector-canvas">
            
            {/* Compass background lines */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
              <div className="h-[400px] w-[400px] rounded-full border-4 border-stone-850 flex items-center justify-center">
                <div className="h-[250px] w-[250px] rounded-full border-2 border-stone-850" />
              </div>
            </div>

            {/* Base point Origin on Grid */}
            <div 
              className="absolute top-1/2 left-1/2 -ml-3 -mt-3 z-20 flex items-center justify-center cursor-default group"
              id="user-origin"
            >
              <div className="h-8 w-8 rounded-full bg-[#718355]/20 flex items-center justify-center animate-pulse" />
              <div className="h-5.5 w-5.5 rounded-full bg-slate-800 border-2 border-white absolute flex items-center justify-center text-white shadow-md">
                <Compass className="h-3 w-3 animate-spin duration-10000" />
              </div>
              <div className="absolute top-8 bg-slate-900 text-white font-serif text-[10px] px-2 py-0.5 rounded shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition duration-205">
                Me (Seattle Center)
              </div>
            </div>

            {/* Render spatial points of Support Facilities */}
            {mappedResources.map((res) => {
              // Calculate relative grid positions
              const latDiff = res.latitude - CENTER_LAT;
              const lngDiff = res.longitude - CENTER_LNG;
              
              // Scale coordinates to grid percentage
              const leftOffset = 50 + (lngDiff * 4500); // Scaled multiplier to expand layout elegantly
              const topOffset = 50 - (latDiff * 4500);
              const isSelected = activeResId === res.id;
              
              if (leftOffset < 5 || leftOffset > 95 || topOffset < 5 || topOffset > 95) return null;

              return (
                <div
                  key={res.id}
                  onClick={() => setActiveResId(res.id)}
                  style={{ left: `${leftOffset}%`, top: `${topOffset}%` }}
                  className="absolute -ml-3.5 -mt-3.5 z-10 cursor-pointer group"
                  id={`map-node-${res.id}`}
                >
                  <div className={`relative flex items-center justify-center transition-all duration-300 ${isSelected ? 'scale-125' : 'hover:scale-115'}`}>
                    {isSelected && (
                      <div className="absolute h-10 w-10 rounded-full bg-emerald-500/20 animate-ping" />
                    )}
                    <div className={`h-8 w-8 rounded-full border-2 flex items-center justify-center shadow-lg transition-colors duration-300 ${
                      isSelected 
                        ? 'bg-emerald-600 border-white text-white' 
                        : 'bg-white border-stone-200 text-emerald-600 hover:border-emerald-400'
                    }`}>
                      <MapPin className="h-4.5 w-4.5" />
                    </div>
                  </div>

                  {/* Node label preview overlay */}
                  <div className={`absolute top-9 left-1/2 -translate-x-1/2 bg-stone-900/90 text-white text-[10px] px-2 py-0.5 rounded shadow-lg whitespace-nowrap transition duration-250 z-20 ${
                    isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}>
                    {res.name.substring(0, 20)}... (~{res.distance} mi)
                  </div>
                </div>
              );
            })}

            {/* Instruction helper tag */}
            <div className="absolute bottom-4 left-4 bg-white/85 p-2.5 rounded-xl border border-stone-200/50 text-[10px] text-stone-500 max-w-xs leading-relaxed z-10 font-normal">
              <strong>Vector Mapping Matrix:</strong> The nodes represent real certified resources. Feel free to click support listings in the directory panel or click node pins on the grid map to display full descriptions, contact, and languages.
            </div>
          </div>

          {/* Active Detail Display Drawer overlay */}
          <AnimatePresence>
            {activeResource && (
              <motion.div 
                initial={{ y: 150, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 150, opacity: 0 }}
                className="absolute bottom-0 inset-x-0 bg-white border-t border-stone-200/80 p-6 z-20 shadow-2xl rounded-t-3xl"
                id="active-resource-drawer"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-0.5">
                    <span className="bg-bg-sage text-sage px-3 py-1 rounded-full text-[9px] font-semibold uppercase tracking-wider border border-sage/10">
                      {activeResource.type.replace('-', ' ')}
                    </span>
                    <h3 className="text-xl font-serif font-medium text-slate-800 mt-1">{activeResource.name}</h3>
                    <p className="text-xs text-stone-400">{activeResource.address}</p>
                  </div>

                  <button 
                    onClick={() => setActiveResId(null)}
                    className="text-stone-400 hover:text-stone-700 text-xs font-semibold px-2.5 py-1 rounded-full hover:bg-slate-50 transition"
                  >
                    Hide Details
                  </button>
                </div>

                <p className="text-xs text-stone-605 mt-3 leading-relaxed font-normal">
                  {activeResource.description}
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-stone-100 text-xs text-stone-500">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-bold uppercase text-stone-450 tracking-wider">contact phone</span>
                    <div className="flex items-center gap-1.5 text-stone-700 font-semibold mt-0.5">
                      <Phone className="h-3.5 w-3.5 text-sage" />
                      <span>{activeResource.phone}</span>
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[9px] font-bold uppercase text-stone-450 tracking-wider">sanctuary website</span>
                    <a 
                      href={activeResource.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-sage hover:underline font-semibold mt-0.5"
                    >
                      <Globe className="h-3.5 w-3.5" />
                      <span>Visit Site</span>
                    </a>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[9px] font-bold uppercase text-stone-450 tracking-wider">service cost</span>
                    <p className="text-stone-750 font-semibold uppercase mt-0.5 tracking-wider font-mono">
                      {activeResource.cost.replace('-', ' ')}
                    </p>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[9px] font-bold uppercase text-stone-450 tracking-wider">languages offered</span>
                    <p className="text-stone-750 font-semibold mt-0.5">
                      {activeResource.languages.join(', ')}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex gap-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/20 p-3.5">
                  <ShieldCheck className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0 animate-pulse" />
                  <p className="text-[11px] text-emerald-950 leading-relaxed font-normal">
                    <strong>Validated Facility:</strong> This supportive node is vetted by GriefBridge and holds licensed credentials. If reaching out, feel free to reference GriefBridge's local support directory schema.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

      </div>

    </div>
  );
}
