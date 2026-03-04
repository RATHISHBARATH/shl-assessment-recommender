import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Search, Mic, MicOff, Camera, FlaskConical, Sun, Moon, Mail,
  LayoutGrid, X, Clock, Trash2, Sparkles,
  Globe, BookOpen, Code, Brain, GraduationCap,
  Briefcase, MapPin, Upload, Loader2, ArrowLeft, Info,
  User, FileText, Zap, Shield, Github, Linkedin,
  ChevronRight, Settings, MessageSquare, HelpCircle, Database,
  Cpu, Target, TrendingUp, Eye, Check
} from 'lucide-react';
import {
  Assessment, HistoryItem, LUCKY_QUERIES, searchAssessments
} from './data';

// Global Declarations 
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

type Theme = 'light' | 'dark';
type Page = 'home' | 'results';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/recommend";

//  SHL Logo 
function SHLLogo({ theme, size = 'lg', onClick }: { theme: Theme; size?: 'lg' | 'sm'; onClick?: () => void }) {
  const isLg = size === 'lg';
  return (
    <button
      onClick={onClick}
      className={`font-medium tracking-tighter select-none ${
        isLg ? 'text-[80px] sm:text-[92px] leading-none' : 'text-[28px] sm:text-[30px]'
      } ${theme === 'dark' ? 'text-white' : 'text-[#202124]'}`}
      style={{ 
        fontFamily: "'Product Sans', 'Google Sans', Arial, sans-serif", 
        cursor: onClick ? 'pointer' : 'default',
        letterSpacing: '-0.03em' 
      }}
      aria-label={onClick ? "Go to SHL Search home" : undefined}
      title={onClick ? "SHL Search" : undefined}
    >
      SHL
    </button>
  );
}
//  Search Input Bar 
function SearchInput({
  theme, query, setQuery, onSearch, onVoice, onCamera,
  isListening, autoFocus, compact
}: {
  theme: Theme; query: string; setQuery: (q: string) => void;
  onSearch: () => void; onVoice: () => void; onCamera: () => void;
  isListening: boolean; autoFocus?: boolean; compact?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) inputRef.current.focus();
  }, [autoFocus]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') onSearch();
  };

  const isDark = theme === 'dark';
  return (
    <div className={`
      search-bar-glow flex items-center rounded-full border transition-all duration-200
      ${compact ? 'max-w-[692px] h-[44px]' : 'max-w-[584px] h-[44px] sm:h-[46px]'}
      ${isDark
        ? 'bg-[#303134] border-[#5f6368] hover:bg-[#404144]'
        : 'bg-white border-[#dfe1e5] hover:shadow-md'
      }
    `}>
      <div className="flex items-center justify-center pl-3.5 sm:pl-4 pr-2">
        <Search size={20} className={isDark ? 'text-[#9aa0a6]' : 'text-[#9aa0a6]'} />
      </div>
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Search SHL assessments or paste a job description..."
        className={`
          flex-1 bg-transparent outline-none text-[16px] py-2.5
          ${isDark ? 'text-[#e8eaed] placeholder-[#9aa0a6]' : 'text-[#202124] placeholder-[#9aa0a6]'}
        `}
      />
      <div className="flex items-center gap-1 pr-2 sm:pr-3">
        <button
          onClick={onVoice}
          className={`p-2 rounded-full transition-all duration-200 ${
            isListening
              ? 'bg-red-500/20 text-red-400'
              : isDark ? 'hover:bg-[#3c4043] text-[#cbcdd1]' : 'hover:bg-gray-100 text-[#4285f4]'
          }`}
          title="Search by voice"
        >
          {isListening ? <MicOff size={20} /> : <Mic size={20} />}
        </button>
        <button
          onClick={onCamera}
          className={`p-2 rounded-full transition-all duration-200 ${
            isDark ? 'hover:bg-[#3c4043] text-[#cbcdd1]' : 'hover:bg-gray-100 text-[#f28b82]'
          }`}
          title="Search by image"
        >
          <Camera size={20} />
        </button>
      </div>
    </div>
  );
}

//  Voice Listening Overlay 
function VoiceOverlay({ theme, onClose, transcript }: { theme: Theme; onClose: () => void; transcript: string }) {
  const isDark = theme === 'dark';
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center animate-fadeIn"
      style={{ backgroundColor: isDark ? 'rgba(32,33,36,0.95)' : 'rgba(255,255,255,0.97)' }}
    >
      <button onClick={onClose} className="absolute top-5 right-5 p-2 rounded-full hover:bg-gray-500/20">
        <X size={24} className={isDark ? 'text-white' : 'text-gray-800'} />
      </button>
      <div className="flex flex-col items-center gap-8">
        <p className={`text-2xl sm:text-3xl font-light ${isDark ? 'text-white' : 'text-[#202124]'}`}>
          {transcript || 'Listening...'}
        </p>
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-red-500 flex items-center justify-center shadow-lg">
            <Mic size={36} className="text-white" />
          </div>
          <div className="absolute inset-0 w-20 h-20 rounded-full border-4 border-red-400" style={{ animation: 'pulse-ring 1.5s infinite' }} />
          <div className="absolute inset-[-8px] w-[96px] h-[96px] rounded-full border-2 border-red-300/50" style={{ animation: 'pulse-ring 1.5s infinite 0.4s' }} />
        </div>
        <p className={`text-sm ${isDark ? 'text-[#9aa0a6]' : 'text-[#70757a]'}`}>
          Speak your job description or query
        </p>
      </div>
    </div>
  );
}

//  Image Upload Modal
function ImageUploadModal({ theme, onClose, onUpload }: {
  theme: Theme; onClose: () => void; onUpload: (text: string) => void;
}) {
  const isDark = theme === 'dark';
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const processFile = (file: File) => {
    if (file.type.startsWith('text/') || file.name.endsWith('.txt') || file.name.endsWith('.csv')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        onUpload(text.slice(0, 1000));
      };
      reader.readAsText(file);
    } else if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);
      onUpload(`Analyzing job description from uploaded image: ${file.name}`);
    } else {
      onUpload(`Analyzing uploaded document: ${file.name}`);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={onClose}
      style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
    >
      <div onClick={e => e.stopPropagation()}
        className={`w-full max-w-lg rounded-2xl p-6 animate-scaleIn ${isDark ? 'bg-[#303134]' : 'bg-white'} shadow-2xl`}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-[#202124]'}`}>
            Search by Image
          </h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-500/20">
            <X size={20} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
          </button>
        </div>

        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className={`
            border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200
            ${dragOver
              ? 'border-blue-400 bg-blue-500/10'
              : isDark ? 'border-[#5f6368] hover:border-[#8ab4f8] hover:bg-[#3c4043]' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
            }
          `}
        >
          {preview ? (
            <img src={preview} alt="Preview" className="max-h-40 mx-auto rounded-lg mb-3" />
          ) : (
            <Upload size={48} className={`mx-auto mb-3 ${isDark ? 'text-[#8ab4f8]' : 'text-blue-500'}`} />
          )}
          <p className={`text-sm ${isDark ? 'text-[#e8eaed]' : 'text-[#202124]'}`}>
            Drag & drop an image or document here
          </p>
          <p className={`text-xs mt-1 ${isDark ? 'text-[#9aa0a6]' : 'text-[#70757a]'}`}>
            Supports images, text files, and documents
          </p>
        </div>

        <input ref={fileRef} type="file" className="hidden" accept="image/*,.txt,.csv,.pdf,.doc,.docx"
          onChange={e => { const f = e.target.files?.[0]; if (f) processFile(f); }}
        />

        <div className="mt-4 flex gap-2">
          <input
            type="text"
            placeholder="Or paste an image URL"
            className={`flex-1 rounded-lg px-4 py-2.5 text-sm outline-none border transition-colors ${
              isDark ? 'bg-[#202124] border-[#5f6368] text-white placeholder-[#9aa0a6] focus:border-[#8ab4f8]'
                : 'bg-gray-50 border-gray-300 text-[#202124] placeholder-[#9aa0a6] focus:border-blue-500'
            }`}
            onKeyDown={e => { if (e.key === 'Enter') { onUpload(`Analyzing image from URL: ${(e.target as HTMLInputElement).value}`); } }}
          />
          <button
            className="px-4 py-2.5 rounded-lg bg-[#8ab4f8] text-[#202124] text-sm font-medium hover:bg-[#aecbfa] transition-colors"
            onClick={() => {}}
          >
            Search
          </button>
        </div>
      </div>
    </div>
  );
}

//  History Panel 
function HistoryPanel({ theme, history, onClose, onSelect, onClear, onDelete }: {
  theme: Theme; history: HistoryItem[];
  onClose: () => void; onSelect: (item: HistoryItem) => void;
  onClear: () => void; onDelete: (id: string) => void;
}) {
  const isDark = theme === 'dark';
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [tab, setTab] = useState<'history' | 'json'>('history');

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} />
      <div className={`fixed top-0 right-0 h-full w-full max-w-md z-50 shadow-2xl animate-slideInRight flex flex-col
        ${isDark ? 'bg-[#303134]' : 'bg-white'}`}>
        <div className={`flex items-center justify-between px-5 py-4 border-b ${isDark ? 'border-[#5f6368]' : 'border-gray-200'}`}>
          <div className="flex items-center gap-2">
            <FlaskConical size={20} className={isDark ? 'text-[#8ab4f8]' : 'text-blue-600'} />
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-[#202124]'}`}>Search Labs</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-500/20">
            <X size={20} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
          </button>
        </div>

        <div className={`flex border-b ${isDark ? 'border-[#5f6368]' : 'border-gray-200'}`}>
          {(['history', 'json'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-3 text-sm font-medium capitalize transition-colors
                ${tab === t
                  ? isDark ? 'text-[#8ab4f8] border-b-2 border-[#8ab4f8]' : 'text-blue-600 border-b-2 border-blue-600'
                  : isDark ? 'text-[#9aa0a6] hover:text-[#e8eaed]' : 'text-[#70757a] hover:text-[#202124]'
                }
              `}
            >
              {t === 'json' ? 'JSON Output' : t}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 opacity-60">
              <Clock size={48} className={isDark ? 'text-[#5f6368]' : 'text-gray-300'} />
              <p className={`text-sm ${isDark ? 'text-[#9aa0a6]' : 'text-[#70757a]'}`}>No search history yet</p>
            </div>
          ) : tab === 'history' ? (
            <div className="space-y-2">
              {history.map(item => (
                <div key={item.id}
                  className={`rounded-xl p-3.5 transition-all duration-150 cursor-pointer ${
                    isDark ? 'hover:bg-[#3c4043] bg-[#28292c]' : 'hover:bg-gray-50 bg-gray-50/50'
                  } ${expandedId === item.id ? isDark ? 'ring-1 ring-[#8ab4f8]' : 'ring-1 ring-blue-300' : ''}`}
                >
                  <div className="flex items-start justify-between gap-2" onClick={() => onSelect(item)}>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${isDark ? 'text-[#e8eaed]' : 'text-[#202124]'}`}>
                        {item.query}
                      </p>
                      <p className={`text-xs mt-1 ${isDark ? 'text-[#9aa0a6]' : 'text-[#70757a]'}`}>
                        {new Date(item.timestamp).toLocaleString()} · {item.resultCount} results
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={e => { e.stopPropagation(); setExpandedId(expandedId === item.id ? null : item.id); }}
                        className="p-1 rounded hover:bg-gray-500/20">
                        <ChevronRight size={14} className={`transition-transform ${expandedId === item.id ? 'rotate-90' : ''} ${isDark ? 'text-[#9aa0a6]' : 'text-gray-400'}`} />
                      </button>
                      <button onClick={e => { e.stopPropagation(); onDelete(item.id); }}
                        className="p-1 rounded hover:bg-red-500/20">
                        <Trash2 size={14} className="text-red-400" />
                      </button>
                    </div>
                  </div>
                  {expandedId === item.id && (
                    <div className="mt-3 animate-slideUp">
                      <div className={`text-xs space-y-1 ${isDark ? 'text-[#bdc1c6]' : 'text-[#5f6368]'}`}>
                        {item.results.slice(0, 3).map((r, i) => (
                          <div key={i} className={`flex items-center gap-2 py-1.5 px-2 rounded ${isDark ? 'bg-[#303134]' : 'bg-white'}`}>
                            <Target size={12} className={isDark ? 'text-[#8ab4f8]' : 'text-blue-500'} />
                            <span className="truncate">{r.name}</span>
                            <span className="ml-auto shrink-0">{r.duration}min</span>
                          </div>
                        ))}
                        {item.results.length > 3 && (
                          <p className="text-center opacity-60 py-1">+{item.results.length - 3} more</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {history.map(item => (
                <div key={item.id} className={`rounded-xl overflow-hidden ${isDark ? 'bg-[#28292c]' : 'bg-gray-50'}`}>
                  <div className={`px-3.5 py-2.5 text-xs font-medium flex items-center justify-between ${isDark ? 'bg-[#1e1f21] text-[#8ab4f8]' : 'bg-gray-100 text-blue-600'}`}>
                    <span className="truncate max-w-[200px]">{item.query}</span>
                    <span className={isDark ? 'text-[#9aa0a6]' : 'text-[#70757a]'}>{new Date(item.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <pre className={`p-3 text-[11px] leading-relaxed overflow-x-auto ${isDark ? 'text-[#bdc1c6]' : 'text-[#5f6368]'}`}>
                    {JSON.stringify(item.results.slice(0, 2), null, 2)}
                    {item.results.length > 2 ? `\n... +${item.results.length - 2} more results` : ''}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>

        {history.length > 0 && (
          <div className={`px-5 py-3 border-t ${isDark ? 'border-[#5f6368]' : 'border-gray-200'}`}>
            <button onClick={onClear}
              className="w-full py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors flex items-center justify-center gap-2">
              <Trash2 size={16} /> Clear All History
            </button>
          </div>
        )}
      </div>
    </>
  );
}

//  About Modal 
function AboutModal({ theme, onClose }: { theme: Theme; onClose: () => void }) {
  const isDark = theme === 'dark';
  const sections = [
    {
      icon: <Target size={22} />,
      title: "What It Does",
      content: "The SHL Assessment Recommendation Engine is an intelligent tool that helps HR professionals, recruiters, and hiring managers find the most relevant SHL assessments for their job openings. Simply describe the role or paste a job description, and get instant, balanced recommendations."
    },
    {
      icon: <Brain size={22} />,
      title: "How It Works",
      content: "Powered by a RAG (Retrieval-Augmented Generation) engine, the system processes your natural language query using advanced NLP, embeds it into a vector space, and performs semantic similarity search against our comprehensive assessment catalog. Results are then balanced across domains for optimal coverage."
    },
    {
      icon: <Database size={22} />,
      title: "Data Retrieval",
      content: "Assessment data is sourced from SHL's comprehensive product catalog. Vector embeddings enable semantic search that goes beyond simple keyword matching, understanding the intent and context of your query to surface the most relevant assessments."
    },
    {
      icon: <Zap size={22} />,
      title: "Optimization",
      content: "The system uses adaptive ranking algorithms, cross-domain balancing for comprehensive assessment batteries, intelligent caching for frequently searched queries, and real-time processing delivering sub-second response times."
    },
    {
      icon: <TrendingUp size={22} />,
      title: "Real-World Applications",
      items: [
        "Recruitment — Quickly identify the right assessments for any role",
        "Volume Hiring — Efficiently screen large candidate pools",
        "Development — Identify skill gaps and growth opportunities",
        "Succession Planning — Assess leadership potential and readiness",
        "Campus Hiring — Streamline graduate recruitment programs"
      ]
    },
    {
      icon: <Shield size={22} />,
      title: "Technology Stack",
      items: [
        "Frontend: React + TypeScript + Tailwind CSS",
        "Backend: FastAPI + Python",
        "AI/ML: LangChain, Vector Embeddings, RAG",
        "Search: Semantic similarity with FAISS/ChromaDB",
        "Voice: Web Speech API for voice input"
      ]
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={onClose}
      style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
      <div onClick={e => e.stopPropagation()}
        className={`w-full max-w-2xl max-h-[85vh] rounded-2xl shadow-2xl flex flex-col animate-scaleIn ${isDark ? 'bg-[#303134]' : 'bg-white'}`}>
        <div className={`flex items-center justify-between px-6 py-4 border-b shrink-0 ${isDark ? 'border-[#5f6368]' : 'border-gray-200'}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${isDark ? 'bg-[#8ab4f8]/20' : 'bg-blue-100'}`}>
              <Info size={20} className={isDark ? 'text-[#8ab4f8]' : 'text-blue-600'} />
            </div>
            <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-[#202124]'}`}>About SHL Search</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-500/20">
            <X size={20} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {sections.map((s, i) => (
            <div key={i} className={`rounded-xl p-4 ${isDark ? 'bg-[#28292c]' : 'bg-gray-50'} animate-slideUp`}
              style={{ animationDelay: `${i * 50}ms` }}>
              <div className="flex items-center gap-3 mb-2.5">
                <span className={isDark ? 'text-[#8ab4f8]' : 'text-blue-600'}>{s.icon}</span>
                <h3 className={`text-base font-semibold ${isDark ? 'text-white' : 'text-[#202124]'}`}>{s.title}</h3>
              </div>
              {s.content && (
                <p className={`text-sm leading-relaxed ${isDark ? 'text-[#bdc1c6]' : 'text-[#5f6368]'}`}>{s.content}</p>
              )}
              {s.items && (
                <ul className="space-y-1.5 mt-1">
                  {s.items.map((item, j) => (
                    <li key={j} className={`text-sm flex items-start gap-2 ${isDark ? 'text-[#bdc1c6]' : 'text-[#5f6368]'}`}>
                      <Check size={14} className={`mt-0.5 shrink-0 ${isDark ? 'text-[#81c995]' : 'text-green-500'}`} />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

//  Developer Profile Modal 
function DeveloperModal({ theme, onClose }: { theme: Theme; onClose: () => void }) {
  const isDark = theme === 'dark';
  const skills = [
    { category: "Languages", items: ["Python", "JavaScript", "TypeScript", "SQL", "Java"] },
    { category: "Frameworks", items: ["React", "FastAPI", "LangChain", "Streamlit", "Node.js"] },
    { category: "AI/ML", items: ["RAG", "NLP", "Vector Search", "Embeddings", "LLMs"] },
    { category: "Tools", items: ["Docker", "Git", "PostgreSQL", "MongoDB", "ChromaDB"] },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={onClose}
      style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
      <div onClick={e => e.stopPropagation()}
        className={`w-full max-w-lg max-h-[85vh] rounded-2xl shadow-2xl flex flex-col animate-scaleIn ${isDark ? 'bg-[#303134]' : 'bg-white'}`}>
        <div className={`px-6 py-4 border-b shrink-0 ${isDark ? 'border-[#5f6368]' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-[#202124]'}`}>Developer Profile</h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-500/20">
              <X size={20} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {/* Avatar and Name */}
          <div className="flex flex-col items-center mb-6">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold mb-3 ${
              isDark ? 'bg-gradient-to-br from-[#8ab4f8] to-[#c58af9] text-white' : 'bg-gradient-to-br from-blue-500 to-purple-500 text-white'
            }`}>
              SHL
            </div>
            <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-[#202124]'}`}>SHL Developer</h3>
            <p className={`text-sm ${isDark ? 'text-[#8ab4f8]' : 'text-blue-600'}`}>Full-Stack AI Engineer</p>
            <div className={`flex items-center gap-1.5 mt-1 text-xs ${isDark ? 'text-[#9aa0a6]' : 'text-[#70757a]'}`}>
              <MapPin size={12} /> India
            </div>
          </div>

          {/* Education */}
          <div className={`rounded-xl p-4 mb-4 ${isDark ? 'bg-[#28292c]' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-3">
              <GraduationCap size={18} className={isDark ? 'text-[#8ab4f8]' : 'text-blue-600'} />
              <h4 className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-[#202124]'}`}>Education</h4>
            </div>
            <div className="space-y-2.5">
              <div>
                <p className={`text-sm font-medium ${isDark ? 'text-[#e8eaed]' : 'text-[#202124]'}`}>B.Tech in Artificial Intelligence & Data Science</p>
                <p className={`text-xs ${isDark ? 'text-[#9aa0a6]' : 'text-[#70757a]'}`}>Specialization in Artificial Intelligence & Machine Learning</p>
              </div>
              <div>
                <p className={`text-sm font-medium ${isDark ? 'text-[#e8eaed]' : 'text-[#202124]'}`}>Certifications</p>
                <p className={`text-xs ${isDark ? 'text-[#9aa0a6]' : 'text-[#70757a]'}`}>AWS Certified · Google Cloud ML · LangChain Specialist</p>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className={`rounded-xl p-4 mb-4 ${isDark ? 'bg-[#28292c]' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-3">
              <Code size={18} className={isDark ? 'text-[#8ab4f8]' : 'text-blue-600'} />
              <h4 className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-[#202124]'}`}>Technical Skills</h4>
            </div>
            <div className="space-y-3">
              {skills.map((group, i) => (
                <div key={i}>
                  <p className={`text-xs font-medium mb-1.5 ${isDark ? 'text-[#9aa0a6]' : 'text-[#70757a]'}`}>{group.category}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {group.items.map((skill, j) => (
                      <span key={j} className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        isDark ? 'bg-[#3c4043] text-[#e8eaed]' : 'bg-gray-200 text-[#202124]'
                      }`}>{skill}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Experience */}
          <div className={`rounded-xl p-4 mb-4 ${isDark ? 'bg-[#28292c]' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-3">
              <Briefcase size={18} className={isDark ? 'text-[#8ab4f8]' : 'text-blue-600'} />
              <h4 className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-[#202124]'}`}>Professional Background</h4>
            </div>
            <p className={`text-sm leading-relaxed ${isDark ? 'text-[#bdc1c6]' : 'text-[#5f6368]'}`}>
              Full-stack developer with deep expertise in building AI-powered applications. Experienced in designing
              RAG-based recommendation systems, vector search engines, and intelligent NLP pipelines.
              Passionate about creating tools that bridge the gap between AI capabilities and real-world HR technology.
            </p>
          </div>

          {/* Social Links */}
          <div className="flex items-center justify-center gap-3">
            <a href="https://github.com/Rathishbarath" target="_blank" rel="noopener noreferrer"
              className={`p-3 rounded-full transition-colors ${isDark ? 'bg-[#28292c] hover:bg-[#3c4043] text-[#e8eaed]' : 'bg-gray-100 hover:bg-gray-200 text-[#202124]'}`}>
              <Github size={20} />
            </a>
            <a href="https://www.linkedin.com/in/rathishbarath/" target="_blank" rel="noopener noreferrer"
              className={`p-3 rounded-full transition-colors ${isDark ? 'bg-[#28292c] hover:bg-[#3c4043] text-[#8ab4f8]' : 'bg-gray-100 hover:bg-gray-200 text-blue-600'}`}>
              <Linkedin size={20} />
            </a>
            <a href="mailto:rathishbarathjobs@gmail.com"
              className={`p-3 rounded-full transition-colors ${isDark ? 'bg-[#28292c] hover:bg-[#3c4043] text-[#f28b82]' : 'bg-gray-100 hover:bg-gray-200 text-red-500'}`}>
              <Mail size={20} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

//  Apps Grid  
function AppsMenu({ theme, onClose, onAbout, onDeveloper }: {
  theme: Theme; onClose: () => void; onAbout: () => void; onDeveloper: () => void;
}) {
  const isDark = theme === 'dark';
  const apps = [
    { icon: <Info size={24} />, label: "About", action: onAbout, color: 'text-blue-400' },
    { icon: <User size={24} />, label: "Developer", action: onDeveloper, color: 'text-purple-400' },
    { icon: <BookOpen size={24} />, label: "Catalog", action: () => window.open('https://www.shl.com/solutions/products/assessments/', '_blank'), color: 'text-green-400' },
    { icon: <FileText size={24} />, label: "Docs", action: () => window.open('https://www.shl.com', '_blank'), color: 'text-yellow-400' },
    { icon: <MessageSquare size={24} />, label: "Feedback", action: () => window.open('mailto: rathishbarathjobs@gmail.com?subject=SHL Search Feedback', '_blank'), color: 'text-pink-400' },
    { icon: <HelpCircle size={24} />, label: "Help", action: onAbout, color: 'text-cyan-400' },
    { icon: <Shield size={24} />, label: "Privacy", action: () => {}, color: 'text-emerald-400' },
    { icon: <Settings size={24} />, label: "Settings", action: () => {}, color: 'text-orange-400' },
    { icon: <Globe size={24} />, label: "SHL.com", action: () => window.open('https://www.shl.com', '_blank'), color: 'text-indigo-400' },
  ];

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className={`absolute top-12 right-0 z-50 w-[300px] rounded-2xl shadow-2xl p-4 animate-scaleIn ${
        isDark ? 'bg-[#2d2e31]' : 'bg-white border border-gray-200'
      }`}>
        <div className="grid grid-cols-3 gap-1">
          {apps.map((app, i) => (
            <button key={i} onClick={() => { app.action(); onClose(); }}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-150 ${
                isDark ? 'hover:bg-[#3c4043]' : 'hover:bg-gray-100'
              }`}>
              <div className={app.color}>{app.icon}</div>
              <span className={`text-xs ${isDark ? 'text-[#e8eaed]' : 'text-[#202124]'}`}>{app.label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

//  Profile Menu 
function ProfileMenu({ theme, onClose }: { theme: Theme; onClose: () => void }) {
  const isDark = theme === 'dark';
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className={`absolute top-12 right-0 z-50 w-[320px] rounded-2xl shadow-2xl animate-scaleIn ${
        isDark ? 'bg-[#2d2e31]' : 'bg-white border border-gray-200'
      }`}>
        <div className="p-5 flex flex-col items-center">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold mb-3 ${
            isDark ? 'bg-gradient-to-br from-[#8ab4f8] to-[#c58af9] text-white' : 'bg-gradient-to-br from-blue-500 to-purple-500 text-white'
          }`}>
            S
          </div>
          <p className={`font-semibold ${isDark ? 'text-white' : 'text-[#202124]'}`}>SHL Developer</p>
          <p className={`text-sm ${isDark ? 'text-[#9aa0a6]' : 'text-[#70757a]'}`}>rathishbarathjobs@gmail.com</p>
          <a href="mailto:rathishbarathjobs@gmail.com"
            className={`mt-3 px-5 py-2 rounded-full text-sm font-medium border transition-colors ${
              isDark ? 'border-[#8ab4f8] text-[#8ab4f8] hover:bg-[#8ab4f8]/10' : 'border-blue-600 text-blue-600 hover:bg-blue-50'
            }`}>
            Manage Account
          </a>
        </div>
        <div className={`border-t px-3 py-2 ${isDark ? 'border-[#5f6368]' : 'border-gray-200'}`}>
          <a href="mailto:rathishbarathjobs@gmail.com"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isDark ? 'hover:bg-[#3c4043] text-[#e8eaed]' : 'hover:bg-gray-100 text-[#202124]'}`}>
            <Mail size={18} className={isDark ? 'text-[#9aa0a6]' : 'text-[#5f6368]'} />
            <span className="text-sm">Send Email</span>
          </a>
        </div>
      </div>
    </>
  );
}

//  Assessment Card 
function AssessmentCard({ assessment, theme, index }: { assessment: Assessment; theme: Theme; index: number }) {
  const isDark = theme === 'dark';
  const typeColors: Record<string, string> = {
    'Knowledge & Skills': isDark ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-700',
    'Cognitive Ability': isDark ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-100 text-purple-700',
    'Personality & Behavior': isDark ? 'bg-pink-500/20 text-pink-300' : 'bg-pink-100 text-pink-700',
    'Competency': isDark ? 'bg-green-500/20 text-green-300' : 'bg-green-100 text-green-700',
    'Simulation': isDark ? 'bg-orange-500/20 text-orange-300' : 'bg-orange-100 text-orange-700',
  };

  return (
    <div className="animate-slideUp" style={{ animationDelay: `${index * 60}ms` }}>
      <div className={`group rounded-xl p-4 sm:p-5 transition-all duration-200 ${
        isDark ? 'hover:bg-[#28292c]' : 'hover:bg-gray-50'
      }`}>
        {/* URL line */}
        <div className="flex items-center gap-2 mb-1">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
            isDark ? 'bg-[#303134] text-[#8ab4f8]' : 'bg-blue-50 text-blue-600'
          }`}>S</div>
          <div>
            <p className={`text-xs truncate max-w-[300px] ${isDark ? 'text-[#bdc1c6]' : 'text-[#202124]'}`}>SHL Assessments</p>
            <p className={`text-xs truncate max-w-[400px] ${isDark ? 'text-[#9aa0a6]' : 'text-[#70757a]'}`}>{assessment.url}</p>
          </div>
        </div>
        {/* Title */}
        <a href={assessment.url} target="_blank" rel="noopener noreferrer"
          className={`text-lg sm:text-xl font-medium hover:underline inline-block mb-1.5 ${
            isDark ? 'text-[#8ab4f8]' : 'text-[#1a0dab]'
          }`}>
          {assessment.name}
        </a>
        {/* Description */}
        <p className={`text-sm leading-relaxed mb-3 ${isDark ? 'text-[#bdc1c6]' : 'text-[#4d5156]'}`}>
          {assessment.description}
        </p>
        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-2">
          {assessment.test_type.map((t, i) => (
            <span key={i} className={`text-xs px-2.5 py-1 rounded-full font-medium ${typeColors[t] || (isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600')}`}>
              {t}
            </span>
          ))}
          <span className={`text-xs flex items-center gap-1 px-2 py-1 rounded-full ${isDark ? 'bg-[#303134] text-[#9aa0a6]' : 'bg-gray-100 text-[#70757a]'}`}>
            <Clock size={11} /> {assessment.duration} min
          </span>
          {assessment.adaptive_support === 'Yes' && (
            <span className={`text-xs flex items-center gap-1 px-2 py-1 rounded-full ${isDark ? 'bg-emerald-500/15 text-emerald-300' : 'bg-emerald-100 text-emerald-700'}`}>
              <Cpu size={11} /> Adaptive
            </span>
          )}
          {assessment.remote_support === 'Yes' && (
            <span className={`text-xs flex items-center gap-1 px-2 py-1 rounded-full ${isDark ? 'bg-sky-500/15 text-sky-300' : 'bg-sky-100 text-sky-700'}`}>
              <Globe size={11} /> Remote
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

//  Loading Skeleton
function LoadingSkeleton({ theme }: { theme: Theme }) {
  const isDark = theme === 'dark';
  return (
    <div className="space-y-6 pt-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="animate-slideUp px-4 sm:px-0" style={{ animationDelay: `${i * 100}ms` }}>
          <div className={`rounded-xl p-5 ${isDark ? 'bg-[#28292c]' : 'bg-gray-50'}`}>
            <div className={`h-3 w-32 rounded mb-3 shimmer-bg ${isDark ? 'bg-[#3c4043]' : 'bg-gray-200'}`} />
            <div className={`h-5 w-80 rounded mb-2 shimmer-bg ${isDark ? 'bg-[#3c4043]' : 'bg-gray-200'}`} />
            <div className={`h-3 w-full rounded mb-1 shimmer-bg ${isDark ? 'bg-[#3c4043]' : 'bg-gray-200'}`} />
            <div className={`h-3 w-3/4 rounded mb-3 shimmer-bg ${isDark ? 'bg-[#3c4043]' : 'bg-gray-200'}`} />
            <div className="flex gap-2">
              <div className={`h-6 w-24 rounded-full shimmer-bg ${isDark ? 'bg-[#3c4043]' : 'bg-gray-200'}`} />
              <div className={`h-6 w-16 rounded-full shimmer-bg ${isDark ? 'bg-[#3c4043]' : 'bg-gray-200'}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

//  Footer 
function Footer({ theme, onAbout }: { theme: Theme; onAbout: () => void }) {
  const isDark = theme === 'dark';
  return (
    <footer className={isDark ? 'bg-[#171717]' : 'bg-[#f2f2f2]'}>
      <div className={`px-6 py-3 border-b ${isDark ? 'border-[#303134]' : 'border-[#dadce0]'}`}>
        <span className={`text-sm ${isDark ? 'text-[#999da2]' : 'text-[#70757a]'}`}>India</span>
      </div>
      <div className="px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1">
          <button onClick={onAbout} className={`text-sm hover:underline ${isDark ? 'text-[#999da2]' : 'text-[#70757a]'}`}>About</button>
          <a href="https://www.shl.com" target="_blank" rel="noopener noreferrer" className={`text-sm hover:underline ${isDark ? 'text-[#999da2]' : 'text-[#70757a]'}`}>SHL Solutions</a>
          <a href="https://www.shl.com/solutions/" target="_blank" rel="noopener noreferrer" className={`text-sm hover:underline ${isDark ? 'text-[#999da2]' : 'text-[#70757a]'}`}>Business</a>
          <button onClick={onAbout} className={`text-sm hover:underline ${isDark ? 'text-[#999da2]' : 'text-[#70757a]'}`}>How Search Works</button>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1">
          <a href="https://www.shl.com/legal/privacy-policy/" target="_blank" rel="noopener noreferrer" className={`text-sm hover:underline ${isDark ? 'text-[#999da2]' : 'text-[#70757a]'}`}>Privacy</a>
          <a href="https://www.shl.com/legal/terms-of-use/" target="_blank" rel="noopener noreferrer" className={`text-sm hover:underline ${isDark ? 'text-[#999da2]' : 'text-[#70757a]'}`}>Terms</a>
          <button onClick={onAbout} className={`text-sm hover:underline ${isDark ? 'text-[#999da2]' : 'text-[#70757a]'}`}>Settings</button>
        </div>
      </div>
    </footer>
  );
}


//  MAIN APP COMPONENT

export default function App() {
  //  State 
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('shl-theme') as Theme) || 'dark');
  const [page, setPage] = useState<Page>('home');
  const [query, setQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(false);
  const [isLucky, setIsLucky] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try { const s = localStorage.getItem('shl-history'); return s ? JSON.parse(s) : []; }
    catch { return []; }
  });

  // Panel toggles
  const [showHistory, setShowHistory] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showDeveloper, setShowDeveloper] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showApps, setShowApps] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);

  // Voice
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');

  //  Effects 
  useEffect(() => {
    localStorage.setItem('shl-theme', theme);
    document.body.style.backgroundColor = theme === 'dark' ? '#202124' : '#ffffff';
    document.body.style.color = theme === 'dark' ? '#e8eaed' : '#202124';
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('shl-history', JSON.stringify(history));
  }, [history]);

  // Keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        e.preventDefault();
      }
      if (e.key === 'Escape') {
        setShowHistory(false); setShowAbout(false); setShowDeveloper(false);
        setShowProfile(false); setShowApps(false); setShowImageUpload(false);
        if (isListening) stopVoice();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isListening]);

  //  History 
  const addToHistory = useCallback((q: string, res: Assessment[]) => {
    setHistory(prev => [{
      id: Date.now().toString(),
      query: q,
      timestamp: new Date().toISOString(),
      resultCount: res.length,
      results: res,
    }, ...prev].slice(0, 50));
  }, []);

  // Search 
  const handleSearch = useCallback(async (q?: string) => {
  const sq = (q || query).trim();
  if (!sq) return;

  setLoading(true);
  setIsLucky(false);
  setSearchQuery(sq);
  setPage('results');

  try {
    console.log(`Sending query to ${API_URL}:`, { query: sq });
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: sq }),
      signal: AbortSignal.timeout(30000), 
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Received data from backend:", data);

    // Map strictly to the Appendix 2 JSON format
    const assessments: Assessment[] = data.recommended_assessments || [];
    
    setResults(assessments); 
    
    if (assessments.length > 0) {
      addToHistory(sq, assessments);
    }

  } catch (error: any) {
    console.error("Frontend Connection Failed:", error);
    if (error.name === 'AbortError') {
      alert("The request timed out. The RAG engine took longer than 30 seconds.");
    } else if (error.message.includes('Failed to fetch')) {
      alert("CORS or Network Error. Is FastAPI running on port 8000 with CORS enabled?");
    }
    setResults([]); // Fallback to 0 results on failure
  } finally {
    setLoading(false);
  }
}, [query, addToHistory]);
  
 

  //  Lucky 
  const handleLucky = useCallback(async () => {
    const luckyQuery = LUCKY_QUERIES[Math.floor(Math.random() * LUCKY_QUERIES.length)];
    setQuery(luckyQuery);
    setIsLucky(true);
    setSearchQuery(luckyQuery);
    setPage('results');
    setLoading(true);

    await new Promise(r => setTimeout(r, 800));

    const luckyResults = searchAssessments(luckyQuery);
    setResults(luckyResults);
    addToHistory(luckyQuery, luckyResults);
    setLoading(false);
  }, [addToHistory]);

  //  Voice 
  const recognitionRef = useRef<any>(null);

  const startVoice = useCallback(() => {


    const SR = window.SpeechRecognition || 
               window.webkitSpeechRecognition || 
               (window as any).mozSpeechRecognition || 
               (window as any).msSpeechRecognition;

    if (!SR) {
      alert('Voice input is restricted or unsupported. Please ensure you are running on localhost or HTTPS, and check your browser permissions.');
      return;
    }

    try {
      const recognition = new SR();
      recognition.lang = 'en-US';
      recognition.interimResults = true;
      recognition.continuous = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => { 
        setIsListening(true); 
        setVoiceTranscript(''); 
      };
      
      recognition.onresult = (e: any) => {

        const transcript = Array.from(e.results).map((r: any) => r[0].transcript).join('');

        setVoiceTranscript(transcript);
        setQuery(transcript);

        if (e.results[0].isFinal) {
          handleSearch(transcript);
        }
      };
      
      recognition.onend = () => {
        setIsListening(false);
        recognitionRef.current = null;
      };
      
      recognition.onerror = (e: any) => {
        setIsListening(false);
        recognitionRef.current = null;
        
        if (e.error === 'not-allowed') {
          alert('Microphone access was denied. Please allow microphone access in your browser settings.');
        } else if (e.error !== 'no-speech') {
          console.warn("Speech recognition error:", e.error);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (error) {
      console.error("Failed to start speech recognition:", error);
      setIsListening(false);
      alert('Could not start the microphone. Please check your browser settings.');
    }
  }, []);

  const stopVoice = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  const toggleVoice = useCallback(() => {
    if (isListening) stopVoice(); else startVoice();
  }, [isListening, startVoice, stopVoice]);

  //  Image upload handler
  const handleImageText = useCallback((text: string) => {
    setQuery(text);
    setShowImageUpload(false);
  }, []);

  //  Go home 
  const goHome = useCallback(() => {
    setPage('home');
    setResults([]);
    setSearchQuery('');
    setQuery('');
    setIsLucky(false);
  }, []);

  //  Select history item 
  const selectHistoryItem = useCallback((item: HistoryItem) => {
    setQuery(item.query);
    setSearchQuery(item.query);
    setResults(item.results);
    setPage('results');
    setShowHistory(false);
  }, []);

  // Derived 
  const isDark = theme === 'dark';
  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  //  Render 
  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${isDark ? 'bg-[#202124]' : 'bg-white'}`}>

      {/* ═══ HEADER ═══ */}
      <header className="flex items-center justify-between px-3 sm:px-6 py-2.5">
        {page === 'results' ? (
          // Results header: logo + search bar
          <div className="flex items-center gap-4 sm:gap-6 flex-1 max-w-4xl">
            <SHLLogo theme={theme} size="sm" onClick={goHome} />
            <div className="flex-1 max-w-[692px]">
              <SearchInput
                theme={theme} query={query} setQuery={setQuery}
                onSearch={() => handleSearch()} onVoice={toggleVoice} onCamera={() => setShowImageUpload(true)}
                isListening={isListening} compact
              />
            </div>
          </div>
        ) : (
          <div />
        )}

        {/* Right side icons */}
        <div className="flex items-center gap-0.5 sm:gap-1">
          {/* Search Labs */}
          <button onClick={() => setShowHistory(true)}
            className={`relative p-2.5 rounded-full transition-all duration-200 tooltip-wrapper ${isDark ? 'hover:bg-[#3c4043] text-[#e8eaed]' : 'hover:bg-gray-100 text-[#5f6368]'}`}
            data-tooltip="Search Labs"
          >
            <FlaskConical size={20} />
            {history.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-400" />
            )}
          </button>

          {/* Theme Toggle */}
          <button onClick={toggleTheme}
            className={`p-2.5 rounded-full transition-all duration-200 tooltip-wrapper ${isDark ? 'hover:bg-[#3c4043] text-[#e8eaed]' : 'hover:bg-gray-100 text-[#5f6368]'}`}
            data-tooltip={isDark ? 'Light mode' : 'Dark mode'}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Gmail with Pre-filled Subject */}
<a 
  href="mailto:rathishbarathjobs@gmail.com?subject=Reaching%20out%20from%20your%20portfolio" 
  className={`hidden sm:flex p-2.5 rounded-full transition-all duration-200 tooltip-wrapper ${isDark ? 'hover:bg-[#3c4043] text-[#e8eaed]' : 'hover:bg-gray-100 text-[#5f6368]'}`}
  data-tooltip="Gmail"
>
  <Mail size={20} />
</a>

          {/* Images / Profile Photo */}
          <div className="relative hidden sm:block">
            <button onClick={() => { setShowProfile(!showProfile); setShowApps(false); }}
              className={`p-2.5 rounded-full transition-all duration-200 tooltip-wrapper ${isDark ? 'hover:bg-[#3c4043] text-[#e8eaed]' : 'hover:bg-gray-100 text-[#5f6368]'}`}
              data-tooltip="Images"
            >
              <Eye size={20} />
            </button>
            {showProfile && <ProfileMenu theme={theme} onClose={() => setShowProfile(false)} />}
          </div>

          {/* Apps Grid */}
          <div className="relative">
            <button onClick={() => { setShowApps(!showApps); setShowProfile(false); }}
              className={`p-2.5 rounded-full transition-all duration-200 tooltip-wrapper ${isDark ? 'hover:bg-[#3c4043] text-[#e8eaed]' : 'hover:bg-gray-100 text-[#5f6368]'}`}
              data-tooltip="Apps"
            >
              <LayoutGrid size={20} />
            </button>
            {showApps && (
              <AppsMenu theme={theme} onClose={() => setShowApps(false)}
                onAbout={() => setShowAbout(true)} onDeveloper={() => setShowDeveloper(true)} />
            )}
          </div>

          {/* Profile Avatar */}
          <button onClick={() => { setShowProfile(!showProfile); setShowApps(false); }}
            className={`w-8 h-8 ml-1 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-all duration-200 ring-2 ring-transparent hover:ring-blue-400/50 ${
              isDark ? 'bg-gradient-to-br from-[#8ab4f8] to-[#c58af9] text-white' : 'bg-gradient-to-br from-blue-500 to-purple-500 text-white'
            }`}
          >
            S
          </button>
        </div>
      </header>

      {/* ═══ MAIN CONTENT ═══ */}
      <main className="flex-1 flex flex-col">

        {page === 'home' ? (
          /* ─── HOME PAGE ─── */
          <div className="flex-1 flex flex-col items-center justify-center px-4 -mt-16">
            {/* Logo - FORCED STATIC */}
<div className="mb-7 sm:mb-9" style={{ animation: 'none', transform: 'none' }}>
  <SHLLogo theme={theme} size="lg" />
</div>
            

            {/* Search Bar */}
            <div className="w-full max-w-[584px] mb-6">
              <SearchInput
                theme={theme} query={query} setQuery={setQuery}
                onSearch={() => handleSearch()} onVoice={toggleVoice} onCamera={() => setShowImageUpload(true)}
                isListening={isListening} autoFocus
              />
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
              <button onClick={() => handleSearch()}
                className={`px-6 py-2.5 rounded text-sm font-medium transition-all duration-200 border ${
                  isDark
                    ? 'bg-[#303134] border-[#303134] text-[#e8eaed] hover:border-[#5f6368] hover:shadow-md'
                    : 'bg-[#f8f9fa] border-[#f8f9fa] text-[#3c4043] hover:border-[#dadce0] hover:shadow-md'
                }`}
              >
                SHL Search
              </button>
              <button onClick={handleLucky}
                className={`px-6 py-2.5 rounded text-sm font-medium transition-all duration-200 border flex items-center gap-2 ${
                  isDark
                    ? 'bg-[#303134] border-[#303134] text-[#e8eaed] hover:border-[#5f6368] hover:shadow-md'
                    : 'bg-[#f8f9fa] border-[#f8f9fa] text-[#3c4043] hover:border-[#dadce0] hover:shadow-md'
                }`}
              >
                <Sparkles size={14} /> I'm Feeling Lucky
              </button>
            </div>

            {/* Sub-text */}
            <p className={`mt-6 text-sm ${isDark ? 'text-[#9aa0a6]' : 'text-[#70757a]'}`}>
              Discover the perfect SHL assessments for any role.{' '}
              <button onClick={() => setShowAbout(true)}
                className={`underline hover:no-underline ${isDark ? 'text-[#8ab4f8]' : 'text-[#1a0dab]'}`}>
                Learn more
              </button>
            </p>

            {/* Quick search suggestions */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2 max-w-xl">
              {['Python Developer', 'Sales Manager', 'Leadership', 'Data Scientist', 'Customer Service'].map(tag => (
                <button key={tag} onClick={() => { setQuery(tag); handleSearch(tag); }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border ${
                    isDark
                      ? 'border-[#3c4043] text-[#bdc1c6] hover:bg-[#303134] hover:border-[#5f6368]'
                      : 'border-[#dadce0] text-[#5f6368] hover:bg-gray-50 hover:border-[#bdc1c6]'
                  }`}>
                  {tag}
                </button>
              ))}
            </div>
          </div>

        ) : (
          /* ─── RESULTS PAGE ─── */
          <div className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-8 pt-4 pb-12">
            {/* Results meta */}
            <div className={`text-xs mb-4 ${isDark ? 'text-[#9aa0a6]' : 'text-[#70757a]'}`}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin" /> Analyzing query and searching vector space...
                </span>
              ) : (
                <>
                  {isLucky && <span className="flex items-center gap-1 mb-1 text-yellow-400"><Sparkles size={12} /> I'm Feeling Lucky result</span>}
                  About {results.length} assessments found for "{searchQuery}" ({(Math.random() * 0.4 + 0.1).toFixed(2)} seconds)
                </>
              )}
            </div>

            {loading ? (
              <LoadingSkeleton theme={theme} />
            ) : results.length > 0 ? (
              <div className={`divide-y ${isDark ? 'divide-[#303134]' : 'divide-gray-100'}`}>
                {results.map((assessment, i) => (
                  <AssessmentCard key={i} assessment={assessment} theme={theme} index={i} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Search size={64} className={isDark ? 'text-[#5f6368]' : 'text-gray-200'} />
                <p className={`text-lg ${isDark ? 'text-[#e8eaed]' : 'text-[#202124]'}`}>No assessments found</p>
                <p className={`text-sm ${isDark ? 'text-[#9aa0a6]' : 'text-[#70757a]'}`}>
                  Try different keywords or a broader job description
                </p>
                <button onClick={goHome}
                  className={`mt-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isDark ? 'bg-[#8ab4f8] text-[#202124] hover:bg-[#aecbfa]' : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}>
                  <ArrowLeft size={14} className="inline mr-2 -mt-0.5" /> Back to Search
                </button>
              </div>
            )}

            {/* Navigation */}
            {results.length > 0 && !loading && (
              <div className="flex items-center justify-center gap-4 mt-10">
                <button onClick={goHome}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isDark ? 'bg-[#303134] text-[#e8eaed] hover:bg-[#3c4043]' : 'bg-gray-100 text-[#202124] hover:bg-gray-200'
                  }`}>
                  <ArrowLeft size={16} /> New Search
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ═══ FOOTER ═══ */}
      <Footer theme={theme} onAbout={() => setShowAbout(true)} />

      {/* ═══ OVERLAYS & MODALS ═══ */}
      {isListening && <VoiceOverlay theme={theme} onClose={stopVoice} transcript={voiceTranscript} />}
      {showImageUpload && <ImageUploadModal theme={theme} onClose={() => setShowImageUpload(false)} onUpload={handleImageText} />}
      {showHistory && (
        <HistoryPanel theme={theme} history={history}
          onClose={() => setShowHistory(false)}
          onSelect={selectHistoryItem}
          onClear={() => { setHistory([]); setShowHistory(false); }}
          onDelete={(id) => setHistory(prev => prev.filter(h => h.id !== id))}
        />
      )}
      {showAbout && <AboutModal theme={theme} onClose={() => setShowAbout(false)} />}
      {showDeveloper && <DeveloperModal theme={theme} onClose={() => setShowDeveloper(false)} />}
    </div>
  );
}
