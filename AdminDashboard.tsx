/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Lock, Users, User, Heart, MapPin, Calendar, Briefcase, BookOpen, Search, Trash2, Edit3, Check, X, ShieldAlert, ArrowLeft, RefreshCw, BarChart2, CheckCircle2, AlertCircle, Sparkles, Eye, EyeOff } from "lucide-react";
import { GroomRecord, BrideRecord, AdminStats, FileStatus, SearchFilters, AIMatchRecord, Article, Book } from "../types";

// List of major governorates
const GOVERNORATES = [
  "القاهرة", "الجيزة", "الإسكندرية", "الدقهلية", "الغربية", "الشرقية", "المنوفية",
  "القليوبية", "البحيرة", "دمياط", "كفر الشيخ", "بورسعيد", "الإسماعيلية", "السويس",
  "الفيوم", "بني سويف", "المنيا", "أسيوط", "سوهاج", "قنا", "الأقصر", "أسوان",
  "البحر الأحمر", "الوادي الجديد", "مطروح", "شمال سيناء", "جنوب سيناء"
];

const STATUS_OPTIONS: FileStatus[] = [
  "جديد", "نشط", "تم الترشيح", "تم التواصل", "خطوبة", "زواج", "غير نشط"
];

// Helper to style status badges
export function getStatusBadgeStyle(status: FileStatus) {
  switch (status) {
    case "جديد": return "bg-blue-50 text-blue-700 border-blue-200";
    case "نشط": return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "تم الترشيح": return "bg-purple-50 text-purple-700 border-purple-200";
    case "تم التواصل": return "bg-amber-50 text-amber-700 border-amber-200";
    case "خطوبة": return "bg-pink-50 text-pink-700 border-pink-200";
    case "زواج": return "bg-rose-50 text-rose-700 border-rose-200";
    case "غير نشط": return "bg-stone-100 text-stone-600 border-stone-200";
    default: return "bg-stone-50 text-stone-600 border-stone-200";
  }
}

interface AdminDashboardProps {
  token: string;
  setToken: (token: string) => void;
  setView: (view: 'home' | 'choose-type' | 'register-groom' | 'register-bride' | 'admin') => void;
}

export default function AdminDashboard({ token, setToken, setView }: AdminDashboardProps) {
  const [passcode, setPasscode] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Stats & Lists State
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [grooms, setGrooms] = useState<GroomRecord[]>([]);
  const [brides, setBrides] = useState<BrideRecord[]>([]);
  const [matches, setMatches] = useState<AIMatchRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMatching, setIsMatching] = useState(false);
  const [matchmakingError, setMatchmakingError] = useState("");
  const [activeTab, setActiveTab] = useState<'grooms' | 'brides' | 'stats' | 'matches' | 'content'>('stats');
  const [matchViewType, setMatchViewType] = useState<'groom' | 'bride'>('groom');

  // Articles & Books State
  const [articles, setArticles] = useState<Article[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [isAddingArticle, setIsAddingArticle] = useState(false);
  const [isAddingBook, setIsAddingBook] = useState(false);
  const [newArticleData, setNewArticleData] = useState({ title: "", content: "", image: "" });
  const [newBookData, setNewBookData] = useState({ title: "", description: "", coverImage: "", downloadUrl: "" });

  // Edit State
  const [editingGroom, setEditingGroom] = useState<GroomRecord | null>(null);
  const [editingBride, setEditingBride] = useState<BrideRecord | null>(null);

  // Filter States
  const [filters, setFilters] = useState<SearchFilters>({
    governorate: "",
    minAge: undefined,
    maxAge: undefined,
    job: "",
    education: "",
    maritalStatus: "",
    status: ""
  });

  const [searchQuery, setSearchQuery] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode) return;
    setIsLoggingIn(true);
    setLoginError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode })
      });

      const data = await res.json();
      if (data.success && data.token) {
        setToken(data.token);
      } else {
        setLoginError("رمز الدخول غير صحيح.");
      }
    } catch (err) {
      setLoginError("رمز الدخول غير صحيح.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Fetch Stats & Playlists
  const fetchDashboardData = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      // Fetch Stats
      const statsRes = await fetch("/api/admin/stats", {
        headers: { "Authorization": token }
      });
      const statsData = await statsRes.json();
      if (statsData.success) {
        setStats(statsData.stats);
      }

      // Fetch Grooms
      const groomsRes = await fetch("/api/admin/grooms", {
        headers: { "Authorization": token }
      });
      const groomsData = await groomsRes.json();
      if (groomsData.success) {
        setGrooms(groomsData.list);
      }

      // Fetch Brides
      const bridesRes = await fetch("/api/admin/brides", {
        headers: { "Authorization": token }
      });
      const bridesData = await bridesRes.json();
      if (bridesData.success) {
        setBrides(bridesData.list);
      }

      // Fetch Matchmaking Records
      try {
        const matchesRes = await fetch("/api/admin/matches", {
          headers: { "Authorization": token }
        });
        const matchesData = await matchesRes.json();
        if (matchesData.success) {
          setMatches(matchesData.list);
        }
      } catch (err) {
        console.error("Error fetching matches:", err);
      }

      // Fetch Articles
      try {
        const articlesRes = await fetch("/api/articles");
        const articlesData = await articlesRes.json();
        if (articlesData.success) {
          setArticles(articlesData.list);
        }
      } catch (err) {
        console.error("Error fetching articles:", err);
      }

      // Fetch Books
      try {
        const booksRes = await fetch("/api/books");
        const booksData = await booksRes.json();
        if (booksData.success) {
          setBooks(booksData.list);
        }
      } catch (err) {
        console.error("Error fetching books:", err);
      }

    } catch (error) {
      console.error("Error loading admin data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchDashboardData();
    }
  }, [token]);

  // Handle Quick Status Change
  const handleStatusChange = async (type: 'groom' | 'bride', id: string, newStatus: FileStatus) => {
    try {
      const endpoint = type === 'groom' ? `/api/admin/grooms/${id}` : `/api/admin/brides/${id}`;
      const res = await fetch(endpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        // Refresh local lists
        if (type === 'groom') {
          setGrooms(prev => prev.map(g => g.id === id ? { ...g, status: newStatus } : g));
        } else {
          setBrides(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b));
        }
        // Refresh general stats to update metrics
        fetchDashboardData();
      }
    } catch (err) {
      alert("حدث خطأ أثناء تعديل حالة الملف");
    }
  };

  // --- ARTICLES & BOOKS CRUD HANDLERS ---
  const handleCreateArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newArticleData.title || !newArticleData.content) return;
    try {
      const res = await fetch("/api/articles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token
        },
        body: JSON.stringify(newArticleData)
      });
      const data = await res.json();
      if (data.success) {
        setArticles(prev => [...prev, data.record]);
        setNewArticleData({ title: "", content: "", image: "" });
        setIsAddingArticle(false);
      }
    } catch (err) {
      alert("حدث خطأ أثناء إضافة المقال");
    }
  };

  const handleUpdateArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArticle) return;
    try {
      const res = await fetch(`/api/articles/${editingArticle.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token
        },
        body: JSON.stringify(editingArticle)
      });
      const data = await res.json();
      if (data.success) {
        setArticles(prev => prev.map(a => a.id === editingArticle.id ? data.record : a));
        setEditingArticle(null);
      }
    } catch (err) {
      alert("حدث خطأ أثناء تحديث المقال");
    }
  };

  const handleDeleteArticle = async (id: string) => {
    if (!window.confirm("هل أنت متأكد من رغبتك في حذف هذا المقال؟")) return;
    try {
      const res = await fetch(`/api/articles/${id}`, {
        method: "DELETE",
        headers: { "Authorization": token }
      });
      const data = await res.json();
      if (data.success) {
        setArticles(prev => prev.filter(a => a.id !== id));
      }
    } catch (err) {
      alert("حدث خطأ أثناء حذف المقال");
    }
  };

  const handleCreateBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBookData.title || !newBookData.description) return;
    try {
      const res = await fetch("/api/books", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token
        },
        body: JSON.stringify(newBookData)
      });
      const data = await res.json();
      if (data.success) {
        setBooks(prev => [...prev, data.record]);
        setNewBookData({ title: "", description: "", coverImage: "", downloadUrl: "" });
        setIsAddingBook(false);
      }
    } catch (err) {
      alert("حدث خطأ أثناء إضافة الكتاب");
    }
  };

  const handleUpdateBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBook) return;
    try {
      const res = await fetch(`/api/books/${editingBook.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token
        },
        body: JSON.stringify(editingBook)
      });
      const data = await res.json();
      if (data.success) {
        setBooks(prev => prev.map(b => b.id === editingBook.id ? data.record : b));
        setEditingBook(null);
      }
    } catch (err) {
      alert("حدث خطأ أثناء تحديث الكتاب");
    }
  };

  const handleDeleteBook = async (id: string) => {
    if (!window.confirm("هل أنت متأكد من رغبتك في حذف هذا الكتاب؟")) return;
    try {
      const res = await fetch(`/api/books/${id}`, {
        method: "DELETE",
        headers: { "Authorization": token }
      });
      const data = await res.json();
      if (data.success) {
        setBooks(prev => prev.filter(b => b.id !== id));
      }
    } catch (err) {
      alert("حدث خطأ أثناء حذف الكتاب");
    }
  };

  // Handle Running AI Matchmaking
  const handleRunAIMatchmaking = async () => {
    setIsMatching(true);
    setMatchmakingError("");
    try {
      const res = await fetch("/api/admin/matches/generate-ai", {
        method: "POST",
        headers: {
          "Authorization": token
        }
      });
      const data = await res.json();
      if (data.success) {
        setMatches(data.list);
      } else {
        setMatchmakingError(data.error || "فشلت عملية التوفيق بالذكاء الاصطناعي.");
      }
    } catch (err) {
      console.error("AI Matchmaking Error:", err);
      setMatchmakingError("حدث خطأ غير متوقع أثناء الاتصال بالخادم.");
    } finally {
      setIsMatching(false);
    }
  };

  // Handle toggling match approval
  const handleToggleMatchApproval = async (groomId: string, brideId: string) => {
    try {
      const res = await fetch("/api/admin/matches/toggle-approve", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token
        },
        body: JSON.stringify({ groomId, brideId })
      });
      const data = await res.json();
      if (data.success) {
        setMatches(prev => prev.map(m => 
          m.groomId === groomId && m.brideId === brideId 
            ? { ...m, approvedByAdmin: !m.approvedByAdmin } 
            : m
        ));
      }
    } catch (err) {
      console.error("Error toggling approval:", err);
    }
  };

  // Handle Delete
  const handleDelete = async (type: 'groom' | 'bride', id: string) => {
    if (!window.confirm("هل أنت متأكد تماماً من رغبتك في حذف هذا الملف نهائياً؟ لا يمكن التراجع عن هذا الإجراء.")) {
      return;
    }

    try {
      const endpoint = type === 'groom' ? `/api/admin/grooms/${id}` : `/api/admin/brides/${id}`;
      const res = await fetch(endpoint, {
        method: "DELETE",
        headers: { "Authorization": token }
      });
      const data = await res.json();
      if (data.success) {
        if (type === 'groom') {
          setGrooms(prev => prev.filter(g => g.id !== id));
        } else {
          setBrides(prev => prev.filter(b => b.id !== id));
        }
        fetchDashboardData();
      }
    } catch (err) {
      alert("حدث خطأ أثناء محاولة حذف الملف");
    }
  };

  // Handle Edit Submission
  const submitGroomEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGroom) return;

    try {
      const res = await fetch(`/api/admin/grooms/${editingGroom.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token
        },
        body: JSON.stringify(editingGroom)
      });
      const data = await res.json();
      if (data.success) {
        setGrooms(prev => prev.map(g => g.id === editingGroom.id ? editingGroom : g));
        setEditingGroom(null);
        fetchDashboardData();
      }
    } catch (err) {
      alert("فشل تحديث البيانات.");
    }
  };

  const submitBrideEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBride) return;

    try {
      const res = await fetch(`/api/admin/brides/${editingBride.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token
        },
        body: JSON.stringify(editingBride)
      });
      const data = await res.json();
      if (data.success) {
        setBrides(prev => prev.map(b => b.id === editingBride.id ? editingBride : b));
        setEditingBride(null);
        fetchDashboardData();
      }
    } catch (err) {
      alert("فشل تحديث البيانات.");
    }
  };

  const clearFilters = () => {
    setFilters({
      governorate: "",
      minAge: undefined,
      maxAge: undefined,
      job: "",
      education: "",
      maritalStatus: "",
      status: ""
    });
    setSearchQuery("");
  };

  // Filter Grooms & Brides locally
  const filteredGrooms = grooms.filter(g => {
    if (filters.governorate && g.governorate !== filters.governorate) return false;
    if (filters.minAge && g.age < filters.minAge) return false;
    if (filters.maxAge && g.age > filters.maxAge) return false;
    if (filters.education && g.education !== filters.education) return false;
    if (filters.maritalStatus && g.maritalStatus !== filters.maritalStatus) return false;
    if (filters.status && g.status !== filters.status) return false;
    
    // Search Query (FirstName, Job, Required Specs, adminCode, id)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchName = g.firstName.toLowerCase().includes(query);
      const matchJob = g.job.toLowerCase().includes(query);
      const matchCity = g.city.toLowerCase().includes(query);
      const matchSpecs = (g.requiredSpecs || "").toLowerCase().includes(query);
      const matchCode = (g.adminCode || "").toLowerCase().includes(query) || g.id.toLowerCase().includes(query);
      return matchName || matchJob || matchCity || matchSpecs || matchCode;
    }

    return true;
  });

  const filteredBrides = brides.filter(b => {
    if (filters.governorate && b.governorate !== filters.governorate) return false;
    if (filters.minAge && b.age < filters.minAge) return false;
    if (filters.maxAge && b.age > filters.maxAge) return false;
    if (filters.education && b.education !== filters.education) return false;
    if (filters.maritalStatus && b.maritalStatus !== filters.maritalStatus) return false;
    if (filters.status && b.status !== filters.status) return false;
    
    // Search Query (FirstName, Job, Required Specs, adminCode, id)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchName = b.firstName.toLowerCase().includes(query);
      const matchJob = b.job.toLowerCase().includes(query);
      const matchCity = b.city.toLowerCase().includes(query);
      const matchSpecs = (b.requiredSpecs || "").toLowerCase().includes(query);
      const matchCode = (b.adminCode || "").toLowerCase().includes(query) || b.id.toLowerCase().includes(query);
      return matchName || matchJob || matchCity || matchSpecs || matchCode;
    }

    return true;
  });

  // --- LOGIN GATE VIEW ---
  if (!token) {
    return (
      <div id="admin-login-screen" className="max-w-md mx-auto px-4 py-20 min-h-[85vh] flex flex-col justify-center">
        <div className="bg-white rounded-3xl border border-stone-200/80 p-8 shadow-xl text-center">
          
          <div className="w-14 h-14 bg-stone-100 text-stone-700 rounded-full flex items-center justify-center mx-auto mb-4 border border-stone-200/60">
            <Lock className="w-6 h-6" />
          </div>

          <h1 className="font-display font-extrabold text-2xl text-stone-900 mb-2">لوحة الإدارة الآمنة</h1>
          <p className="text-xs text-stone-500 mb-6 leading-relaxed">
            الوصول مقتصر على مشرفي ومسؤولي التوفيق بموقع مودة ورحمة. يرجى إدخال رمز المرور المخول.
          </p>

          {loginError && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-100 text-rose-700 text-xs font-bold rounded-xl flex items-center gap-2 justify-center">
              <AlertCircle className="w-4 h-4" />
              <span>{loginError}</span>
            </div>
          )}

          <form id="admin-login-form" onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-right text-xs font-bold text-stone-600 mb-1.5">رمز دخول المسؤول:</label>
              <input
                type="password"
                required
                placeholder="أدخل رمز الدخول..."
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full text-center py-3 rounded-xl border border-stone-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none font-mono text-lg transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl text-sm shadow-md shadow-emerald-600/15 transition-all flex items-center justify-center gap-2 disabled:bg-stone-300"
            >
              {isLoggingIn ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin block" />
                  جاري التحقق...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  تسجيل الدخول
                </>
              )}
            </button>
          </form>

        </div>

        <button 
          onClick={() => setView('home')} 
          className="mt-6 text-stone-500 hover:text-stone-800 text-xs font-bold flex items-center gap-1 justify-center"
        >
          <ArrowLeft className="w-4 h-4" />
          العودة للرئيسية
        </button>
      </div>
    );
  }

  // --- DASHBOARD CONTAINER ---
  return (
    <div id="admin-dashboard-view" className="py-10 bg-stone-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Header Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="font-display font-black text-2xl sm:text-3xl text-stone-900 flex items-center gap-2">
              <Lock className="w-6 h-6 text-emerald-700 shrink-0" />
              لوحة تحكم المسؤول الموحدة
            </h1>
            <p className="text-stone-500 text-xs mt-1">
              أهلاً بك يا مسؤول النظام. يمكنك تصفح ومطابقة العرسان والعرائس، وتحديث الحالات وسجل البيانات.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchDashboardData}
              disabled={isLoading}
              className="bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 p-2.5 rounded-xl transition-all"
              title="تحديث البيانات"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => { setToken(""); setView('home'); }}
              className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-4 py-2 rounded-xl text-xs font-bold transition-all"
            >
              تسجيل الخروج الآمن
            </button>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex flex-wrap md:flex-nowrap bg-white rounded-2xl border border-stone-200/80 p-1.5 mb-8 max-w-3xl gap-1">
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-3 px-3 rounded-xl text-[11px] sm:text-xs font-black transition-all cursor-pointer ${activeTab === 'stats' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/10' : 'text-stone-500 hover:text-stone-800'}`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            الإحصائيات العامة
          </button>
          
          <button
            onClick={() => setActiveTab('grooms')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-3 px-3 rounded-xl text-[11px] sm:text-xs font-black transition-all cursor-pointer ${activeTab === 'grooms' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/10' : 'text-stone-500 hover:text-stone-800'}`}
          >
            <User className="w-3.5 h-3.5" />
            سجل العرسان ({grooms.length})
          </button>
          
          <button
            onClick={() => setActiveTab('brides')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-3 px-3 rounded-xl text-[11px] sm:text-xs font-black transition-all cursor-pointer ${activeTab === 'brides' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/10' : 'text-stone-500 hover:text-stone-800'}`}
          >
            <Heart className="w-3.5 h-3.5" />
            سجل العرائس ({brides.length})
          </button>

          <button
            onClick={() => setActiveTab('matches')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-3 px-3 rounded-xl text-[11px] sm:text-xs font-black transition-all cursor-pointer ${activeTab === 'matches' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/10' : 'text-stone-500 hover:text-stone-800'}`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            أفضل المطابقات ⭐
          </button>

          <button
            onClick={() => setActiveTab('content')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-3 px-3 rounded-xl text-[11px] sm:text-xs font-black transition-all cursor-pointer ${activeTab === 'content' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/10' : 'text-stone-500 hover:text-stone-800'}`}
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            المقالات والكتب 📚
          </button>
        </div>

        {/* ==================================== */}
        {/* Tab 1: STATISTICS (الإحصائيات) */}
        {/* ==================================== */}
        {activeTab === 'stats' && stats && (
          <div className="space-y-8 animate-fadeIn">
            
            {/* Simple Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              
              {/* Card 1 */}
              <div className="bg-white rounded-3xl border border-stone-200/60 p-6 shadow-xs flex items-center gap-5">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0 border border-emerald-100">
                  <User className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-stone-500 text-xs font-bold block">إجمالي العرسان</span>
                  <span className="font-display font-black text-3xl text-stone-950 mt-1 block">
                    {stats.groomsCount} <span className="text-xs text-stone-400 font-medium">عريس مسجل</span>
                  </span>
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-white rounded-3xl border border-stone-200/60 p-6 shadow-xs flex items-center gap-5">
                <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center shrink-0 border border-rose-100">
                  <Heart className="w-7 h-7 fill-rose-500/15" />
                </div>
                <div>
                  <span className="text-stone-500 text-xs font-bold block">إجمالي العرائس</span>
                  <span className="font-display font-black text-3xl text-stone-950 mt-1 block">
                    {stats.bridesCount} <span className="text-xs text-stone-400 font-medium">عروسة مسجلة</span>
                  </span>
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-white rounded-3xl border border-stone-200/60 p-6 shadow-xs flex items-center gap-5">
                <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shrink-0 border border-amber-100">
                  <Users className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-stone-500 text-xs font-bold block">العدد الإجمالي الكلي</span>
                  <span className="font-display font-black text-3xl text-stone-950 mt-1 block">
                    {stats.groomsCount + stats.bridesCount} <span className="text-xs text-stone-400 font-medium">طلب نشط</span>
                  </span>
                </div>
              </div>

            </div>

            {/* Daily Registrations list & Top Governorates charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Daily Registrations */}
              <div className="bg-white rounded-3xl border border-stone-200/60 p-6 shadow-xs">
                <h3 className="font-display font-bold text-stone-900 mb-4 text-base flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  عدد التسجيلات اليومية
                </h3>
                
                <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
                  {Object.entries(stats.dailyRegistrations).length === 0 ? (
                    <p className="text-stone-400 text-xs text-center py-10">لا توجد سجلات تسجيل اليوم.</p>
                  ) : (
                    Object.entries(stats.dailyRegistrations)
                      .sort((a, b) => b[0].localeCompare(a[0]))
                      .map(([date, count]) => (
                        <div key={date} className="flex justify-between items-center bg-stone-50 p-3 rounded-xl border border-stone-150 text-sm">
                          <span className="font-mono text-stone-600 font-semibold">{date}</span>
                          <span className="bg-emerald-100 text-emerald-800 font-black px-3 py-1 rounded-lg text-xs">
                            {count} تسجيلات جديدة
                          </span>
                        </div>
                      ))
                  )}
                </div>
              </div>

              {/* Top Governorates */}
              <div className="bg-white rounded-3xl border border-stone-200/60 p-6 shadow-xs">
                <h3 className="font-display font-bold text-stone-900 mb-4 text-base flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-emerald-600" />
                  المحافظات الأكثر تسجيلًا
                </h3>

                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                  {stats.topGovernorates.length === 0 ? (
                    <p className="text-stone-400 text-xs text-center py-10">لا توجد محافظات كافية بعد.</p>
                  ) : (
                    stats.topGovernorates.map((gov, idx) => {
                      const maxCount = Math.max(...stats.topGovernorates.map(g => g.count));
                      const percentage = maxCount > 0 ? (gov.count / maxCount) * 100 : 0;
                      return (
                        <div key={gov.name} className="space-y-1.5">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-stone-800">{gov.name}</span>
                            <span className="font-mono text-stone-500 font-bold">{gov.count} تسجيلات</span>
                          </div>
                          <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden">
                            <div 
                              className="bg-emerald-600 h-full rounded-full transition-all duration-500" 
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ==================================== */}
        {/* Tab 2 & 3: GROOMS / BRIDES DATA LIST */}
        {/* ==================================== */}
        {(activeTab === 'grooms' || activeTab === 'brides') && (
          <div className="space-y-6">
            
            {/* Search and Filters panel */}
            <div className="bg-white rounded-3xl border border-stone-200/60 p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                
                {/* Search Bar */}
                <div className="relative w-full sm:flex-1">
                  <Search className="absolute right-3.5 top-3.5 text-stone-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="ابحث بالاسم، الكود، الوظيفة، المدينة أو مواصفات الشريك المطلوبة..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-4 pr-10 py-3 rounded-xl border border-stone-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none text-xs transition-all"
                  />
                </div>

                <button
                  onClick={clearFilters}
                  className="w-full sm:w-auto px-5 py-3 text-stone-500 hover:text-stone-800 text-xs font-bold bg-stone-100 hover:bg-stone-200 rounded-xl transition-all shrink-0"
                >
                  تفريغ الفلاتر
                </button>
              </div>

              {/* Grid selectors */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-xs">
                
                {/* Governorate Filter */}
                <div>
                  <label className="block text-[10px] text-stone-500 font-bold mb-1">المحافظة:</label>
                  <select
                    value={filters.governorate || ""}
                    onChange={(e) => setFilters(prev => ({ ...prev, governorate: e.target.value || undefined }))}
                    className="w-full p-2.5 rounded-lg border border-stone-200 bg-white"
                  >
                    <option value="">الكل</option>
                    {GOVERNORATES.map((gov, i) => (
                      <option key={i} value={gov}>{gov}</option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-[10px] text-stone-500 font-bold mb-1">حالة الملف:</label>
                  <select
                    value={filters.status || ""}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value || undefined }))}
                    className="w-full p-2.5 rounded-lg border border-stone-200 bg-white"
                  >
                    <option value="">الكل</option>
                    {STATUS_OPTIONS.map((st, i) => (
                      <option key={i} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                {/* Marital Status Filter */}
                <div>
                  <label className="block text-[10px] text-stone-500 font-bold mb-1">الحالة الاجتماعية:</label>
                  <select
                    value={filters.maritalStatus || ""}
                    onChange={(e) => setFilters(prev => ({ ...prev, maritalStatus: e.target.value || undefined }))}
                    className="w-full p-2.5 rounded-lg border border-stone-200 bg-white"
                  >
                    <option value="">الكل</option>
                    {(activeTab === 'grooms' ? ["أعزب", "مطلق (بدون أطفال)", "مطلق (مع أطفال)", "أرمل", "متزوج ويرغب في التعدد"] : ["عزباء", "مطلقة (بدون أطفال)", "مطلقة (مع أطفال)", "أرملة"]).map((st, i) => (
                      <option key={i} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                {/* Education Filter */}
                <div>
                  <label className="block text-[10px] text-stone-500 font-bold mb-1">المؤهل الدراسي:</label>
                  <select
                    value={filters.education || ""}
                    onChange={(e) => setFilters(prev => ({ ...prev, education: e.target.value || undefined }))}
                    className="w-full p-2.5 rounded-lg border border-stone-200 bg-white"
                  >
                    <option value="">الكل</option>
                    <option value="مؤهل عالي (جامعي)">مؤهل عالي (جامعي)</option>
                    <option value="ماجستير / دكتوراه">ماجستير / دكتوراه</option>
                    <option value="مؤهل متوسط / فوق متوسط">مؤهل متوسط / فوق متوسط</option>
                    <option value="طالب جامعي">طالب جامعي</option>
                    <option value="تعليم أساسي">تعليم أساسي</option>
                  </select>
                </div>

                {/* Age Range Min */}
                <div>
                  <label className="block text-[10px] text-stone-500 font-bold mb-1">السن من:</label>
                  <input
                    type="number"
                    min="18"
                    max="80"
                    placeholder="أقل سن..."
                    value={filters.minAge || ""}
                    onChange={(e) => setFilters(prev => ({ ...prev, minAge: e.target.value ? parseInt(e.target.value) : undefined }))}
                    className="w-full p-2.5 rounded-lg border border-stone-200 bg-white text-right"
                  />
                </div>

                {/* Age Range Max */}
                <div>
                  <label className="block text-[10px] text-stone-500 font-bold mb-1">السن إلى:</label>
                  <input
                    type="number"
                    min="18"
                    max="80"
                    placeholder="أكبر سن..."
                    value={filters.maxAge || ""}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxAge: e.target.value ? parseInt(e.target.value) : undefined }))}
                    className="w-full p-2.5 rounded-lg border border-stone-200 bg-white text-right"
                  />
                </div>

              </div>
            </div>

            {/* Results Grid counts */}
            <div className="flex justify-between items-center text-xs text-stone-500 font-bold px-1">
              <span>
                عدد النتائج المطابقة: {activeTab === 'grooms' ? filteredGrooms.length : filteredBrides.length} طلب
              </span>
            </div>

            {/* List Renderer */}
            {activeTab === 'grooms' ? (
              filteredGrooms.length === 0 ? (
                <div className="text-center py-20 bg-white border border-stone-200 rounded-3xl">
                  <Users className="w-10 h-10 text-stone-300 mx-auto mb-2" />
                  <p className="text-stone-500 text-xs">لم يتم العثور على عرسان مطابقين للفلاتر المحددة.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredGrooms.map(g => (
                    <div key={g.id} className="bg-white rounded-3xl border border-stone-200/60 p-6 shadow-xs flex flex-col justify-between">
                      <div>
                        {/* Title and Badge */}
                        <div className="flex justify-between items-start gap-3 mb-4">
                          <div className="flex gap-3 items-center">
                            {g.photo ? (
                              <img 
                                src={g.photo} 
                                alt="صورة التحقق" 
                                className="w-12 h-12 rounded-xl object-cover border-2 border-emerald-500 shrink-0 cursor-pointer bg-stone-100 shadow-2xs hover:scale-105 transition-all"
                                onClick={() => {
                                  const win = window.open();
                                  if (win) win.document.write(`<img src="${g.photo}" style="max-width:100%; max-height:100vh; display:block; margin:auto;"/>`);
                                }}
                                title="صورة التحقق - انقر للتكبير"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-xl bg-stone-100 border border-stone-200 shrink-0 flex flex-col items-center justify-center text-stone-400 text-[9px] font-black" title="لم يتم رفع صورة شخصية">
                                <span>بدون</span>
                                <span>صورة</span>
                              </div>
                            )}
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-display font-extrabold text-lg text-stone-900 block">
                                  العريس: {g.firstName}
                                </span>
                                {g.photo ? (
                                  <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/50">
                                    الصورة مرفوعة
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/50">
                                    بدون صورة
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-stone-400 font-bold block mt-0.5">رمز الملف: {g.id}</span>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-1.5">
                            {/* Dropdown status selector */}
                            <select
                              value={g.status}
                              onChange={(e) => handleStatusChange('groom', g.id, e.target.value as FileStatus)}
                              className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${getStatusBadgeStyle(g.status)} focus:outline-none`}
                            >
                              {STATUS_OPTIONS.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                            <span className="text-[9px] text-stone-400 font-medium">تحديث فوري</span>
                          </div>
                        </div>

                        {/* Core Details Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-4 text-xs text-stone-600 bg-stone-50 rounded-2xl p-4 border border-stone-150 mb-4">
                          <div><span className="text-stone-400 block font-bold text-[10px]">السن:</span> <span className="text-stone-800 font-semibold">{g.age} سنة</span></div>
                          <div><span className="text-stone-400 block font-bold text-[10px]">المحافظة الحالية:</span> <span className="text-stone-800 font-semibold">{g.governorate}</span></div>
                          <div><span className="text-stone-400 block font-bold text-[10px]">المدينة/المركز الحالي:</span> <span className="text-stone-800 font-semibold">{g.city}</span></div>
                          <div><span className="text-stone-400 block font-bold text-[10px]">المحافظة الأصلية:</span> <span className="text-stone-800 font-semibold">{g.originGovernorate || "غير محدد"}</span></div>
                          <div><span className="text-stone-400 block font-bold text-[10px]">المدينة/المركز الأصلي:</span> <span className="text-stone-800 font-semibold">{g.originCity || "غير محدد"}</span></div>
                          <div><span className="text-stone-400 block font-bold text-[10px]">الحالة الاجتماعية:</span> <span className="text-stone-800 font-semibold">{g.maritalStatus}</span></div>
                          <div><span className="text-stone-400 block font-bold text-[10px]">الوظيفة:</span> <span className="text-stone-800 font-semibold">{g.job}</span></div>
                          <div><span className="text-stone-400 block font-bold text-[10px]">المؤهل الدراسي:</span> <span className="text-stone-800 font-semibold">{g.education}</span></div>
                          <div><span className="text-stone-400 block font-bold text-[10px]">الطول:</span> <span className="text-stone-800 font-semibold">{g.height} سم</span></div>
                          <div><span className="text-stone-400 block font-bold text-[10px]">التدخين:</span> <span className="text-stone-800 font-semibold">{g.smoking}</span></div>
                          <div><span className="text-stone-400 block font-bold text-[10px]">المستوى المادي:</span> <span className="text-stone-800 font-semibold">{g.financialStatus}</span></div>
                          <div><span className="text-stone-400 block font-bold text-[10px]">رمز الدخول (الأعضاء):</span> <span className="text-emerald-700 font-mono font-bold bg-emerald-50 px-2 py-0.5 rounded-md select-all text-center">{g.adminCode || "لا يوجد"}</span></div>
                          <div><span className="text-stone-400 block font-bold text-[10px]">وسيلة التواصل المفضلة:</span> <span className="text-stone-800 font-semibold">{g.preferredContact || "واتساب"}</span></div>
                          <div><span className="text-stone-400 block font-bold text-[10px]">جاهز خلال ٦ أشهر؟</span> <span className="text-stone-800 font-semibold">{g.readyIn6Months}</span></div>
                          <div className="col-span-3"><span className="text-stone-400 block font-bold text-[10px]">التدين:</span> <span className="text-stone-800 font-semibold">{g.religiosity}</span></div>
                        </div>

                        {/* Specs & Contact */}
                        <div className="space-y-2.5 mb-6 text-xs leading-relaxed">
                          {g.selfDescription && (
                            <div className="bg-amber-50/40 p-3 rounded-xl border border-amber-100/30">
                              <span className="font-bold text-amber-800 block mb-0.5">التحدث عن النفس والوصف الشخصي:</span>
                              <p className="text-stone-700">{g.selfDescription}</p>
                            </div>
                          )}

                          <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100/40">
                            <span className="font-bold text-emerald-800 block mb-0.5">مواصفات الزوجة المطلوبة:</span>
                            <p className="text-stone-700">{g.requiredSpecs}</p>
                          </div>

                          {g.additionalNotes && (
                            <div className="bg-stone-50 p-3 rounded-xl border border-stone-200/50">
                              <span className="font-bold text-stone-500 block mb-0.5">ملاحظات إضافية:</span>
                              <p className="text-stone-600">{g.additionalNotes}</p>
                            </div>
                          )}

                          <div className="bg-stone-100 p-3 rounded-xl border border-stone-200/60 flex justify-between items-center font-mono">
                            <span className="font-sans font-bold text-stone-700 text-[10px]">رقم واتساب للتواصل:</span>
                            <a href={`https://wa.me/${g.whatsapp.replace('+', '')}`} target="_blank" rel="noopener noreferrer" className="text-emerald-700 font-black hover:underline">
                              {g.whatsapp}
                            </a>
                          </div>
                        </div>
                      </div>

                      {/* Control buttons */}
                      <div className="border-t border-stone-100 pt-4 flex justify-end gap-2.5 text-xs font-bold">
                        <button
                          onClick={() => setEditingGroom(g)}
                          className="flex items-center gap-1 px-3.5 py-2 border border-stone-200 hover:bg-stone-50 rounded-lg text-stone-600 transition-all"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          تعديل البيانات
                        </button>
                        <button
                          onClick={() => handleDelete('groom', g.id)}
                          className="flex items-center gap-1 px-3.5 py-2 border border-rose-200 hover:bg-rose-50 text-rose-700 rounded-lg transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          حذف نهائياً
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              // Brides renderer
              filteredBrides.length === 0 ? (
                <div className="text-center py-20 bg-white border border-stone-200 rounded-3xl">
                  <Users className="w-10 h-10 text-stone-300 mx-auto mb-2" />
                  <p className="text-stone-500 text-xs">لم يتم العثور على عرائس مطابقات للفلاتر المحددة.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredBrides.map(b => (
                    <div key={b.id} className="bg-white rounded-3xl border border-stone-200/60 p-6 shadow-xs flex flex-col justify-between">
                      <div>
                        {/* Title and Badge */}
                        <div className="flex justify-between items-start gap-3 mb-4">
                          <div className="flex gap-3 items-center">
                            {b.photo ? (
                              <img 
                                src={b.photo} 
                                alt="صورة التحقق" 
                                className="w-12 h-12 rounded-xl object-cover border-2 border-emerald-500 shrink-0 cursor-pointer bg-stone-100 shadow-2xs hover:scale-105 transition-all"
                                onClick={() => {
                                  const win = window.open();
                                  if (win) win.document.write(`<img src="${b.photo}" style="max-width:100%; max-height:100vh; display:block; margin:auto;"/>`);
                                }}
                                title="صورة التحقق - انقر للتكبير"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-xl bg-stone-100 border border-stone-200 shrink-0 flex flex-col items-center justify-center text-stone-400 text-[9px] font-black" title="لم يتم رفع صورة شخصية">
                                <span>بدون</span>
                                <span>صورة</span>
                              </div>
                            )}
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-display font-extrabold text-lg text-stone-900 block">
                                  العروسة: {b.firstName}
                                </span>
                                {b.photo ? (
                                  <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/50">
                                    الصورة مرفوعة
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/50">
                                    بدون صورة
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-stone-400 font-bold block mt-0.5">رمز الملف: {b.id}</span>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-1.5">
                            {/* Dropdown status selector */}
                            <select
                              value={b.status}
                              onChange={(e) => handleStatusChange('bride', b.id, e.target.value as FileStatus)}
                              className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${getStatusBadgeStyle(b.status)} focus:outline-none`}
                            >
                              {STATUS_OPTIONS.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                            <span className="text-[9px] text-stone-400 font-medium">تحديث فوري</span>
                          </div>
                        </div>

                        {/* Core Details Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-4 text-xs text-stone-600 bg-stone-50 rounded-2xl p-4 border border-stone-150 mb-4">
                          <div><span className="text-stone-400 block font-bold text-[10px]">السن:</span> <span className="text-stone-800 font-semibold">{b.age} سنة</span></div>
                          <div><span className="text-stone-400 block font-bold text-[10px]">المحافظة الحالية:</span> <span className="text-stone-800 font-semibold">{b.governorate}</span></div>
                          <div><span className="text-stone-400 block font-bold text-[10px]">المدينة/المركز الحالي:</span> <span className="text-stone-800 font-semibold">{b.city}</span></div>
                          <div><span className="text-stone-400 block font-bold text-[10px]">المحافظة الأصلية:</span> <span className="text-stone-800 font-semibold">{b.originGovernorate || "غير محدد"}</span></div>
                          <div><span className="text-stone-400 block font-bold text-[10px]">المدينة/المركز الأصلي:</span> <span className="text-stone-800 font-semibold">{b.originCity || "غير محدد"}</span></div>
                          <div><span className="text-stone-400 block font-bold text-[10px]">الحالة الاجتماعية:</span> <span className="text-stone-800 font-semibold">{b.maritalStatus}</span></div>
                          <div><span className="text-stone-400 block font-bold text-[10px]">الوظيفة:</span> <span className="text-stone-800 font-semibold">{b.job}</span></div>
                          <div><span className="text-stone-400 block font-bold text-[10px]">المؤهل الدراسي:</span> <span className="text-stone-800 font-semibold">{b.education}</span></div>
                          <div><span className="text-stone-400 block font-bold text-[10px]">الطول:</span> <span className="text-stone-800 font-semibold">{b.height} سم</span></div>
                          <div><span className="text-stone-400 block font-bold text-[10px]">رمز الدخول (الأعضاء):</span> <span className="text-emerald-700 font-mono font-bold bg-emerald-50 px-2 py-0.5 rounded-md select-all text-center">{b.adminCode || "لا يوجد"}</span></div>
                          <div><span className="text-stone-400 block font-bold text-[10px]">وسيلة التواصل المفضلة:</span> <span className="text-stone-800 font-semibold">{b.preferredContact || "واتساب"}</span></div>
                          <div className="col-span-3"><span className="text-stone-400 block font-bold text-[10px]">التدين والالتزام:</span> <span className="text-stone-800 font-semibold">{b.religiosity}</span></div>
                        </div>

                        {/* Specs & Contact */}
                        <div className="space-y-2.5 mb-6 text-xs leading-relaxed">
                          {b.selfDescription && (
                            <div className="bg-amber-50/40 p-3 rounded-xl border border-amber-100/30">
                              <span className="font-bold text-amber-800 block mb-0.5">التحدث عن النفس والوصف الشخصي:</span>
                              <p className="text-stone-700">{b.selfDescription}</p>
                            </div>
                          )}

                          <div className="bg-rose-50/50 p-3 rounded-xl border border-rose-100/40">
                            <span className="font-bold text-rose-800 block mb-0.5">مواصفات الزوج المطلوب:</span>
                            <p className="text-stone-700">{b.requiredSpecs}</p>
                          </div>

                          {b.additionalNotes && (
                            <div className="bg-stone-50 p-3 rounded-xl border border-stone-200/50">
                              <span className="font-bold text-stone-500 block mb-0.5">ملاحظات إضافية:</span>
                              <p className="text-stone-600">{b.additionalNotes}</p>
                            </div>
                          )}

                          <div className="bg-stone-100 p-3 rounded-xl border border-stone-200/60 flex justify-between items-center">
                            <span className="font-sans font-bold text-stone-700 text-[10px]">وسيلة التواصل ({b.contactMethod}):</span>
                            <span className="text-stone-800 font-mono font-bold select-all">{b.contactDetails}</span>
                          </div>
                        </div>
                      </div>

                      {/* Control buttons */}
                      <div className="border-t border-stone-100 pt-4 flex justify-end gap-2.5 text-xs font-bold">
                        <button
                          onClick={() => setEditingBride(b)}
                          className="flex items-center gap-1 px-3.5 py-2 border border-stone-200 hover:bg-stone-50 rounded-lg text-stone-600 transition-all"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          تعديل البيانات
                        </button>
                        <button
                          onClick={() => handleDelete('bride', b.id)}
                          className="flex items-center gap-1 px-3.5 py-2 border border-rose-200 hover:bg-rose-50 text-rose-700 rounded-lg transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          حذف نهائياً
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

          </div>
        )}

        {/* ==================================== */}
        {/* Tab 4: INTELLIGENT MATCHMAKING (التوافق الذكي) */}
        {/* ==================================== */}
        {activeTab === 'matches' && (
          <div className="space-y-8 animate-fadeIn">
            {/* AI Controls Header Card */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-emerald-900/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="space-y-2">
                <h2 className="font-display font-black text-xl sm:text-2xl flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-amber-300 animate-pulse shrink-0 fill-amber-300/20" />
                  محرك التوافق الذكي بالذكاء الاصطناعي (Gemini ✨)
                </h2>
                <p className="text-emerald-50 text-xs max-w-2xl leading-relaxed">
                  يقوم هذا النظام المتقدم بتحليل جميع طلبات العرسان والعرائس دلالياً وفهم معاني النصوص والشروط المكتوبة في خانة "المواصفات المطلوبة" بالذكاء الاصطناعي (وليس مجرد مطابقة كلمات)، ثم يحسب نسب التوافق ويشرح أسباب الترشيح بدقة.
                </p>
              </div>

              <div className="shrink-0 w-full md:w-auto">
                <button
                  onClick={handleRunAIMatchmaking}
                  disabled={isMatching || grooms.length === 0 || brides.length === 0}
                  className="w-full md:w-auto bg-amber-400 hover:bg-amber-500 text-stone-900 font-black px-6 py-4 rounded-2xl text-xs sm:text-sm shadow-lg shadow-amber-500/15 transition-all flex items-center justify-center gap-2 disabled:bg-stone-100 disabled:text-stone-400 cursor-pointer"
                >
                  {isMatching ? (
                    <>
                      <span className="w-4 h-4 rounded-full border-2 border-stone-400 border-t-stone-900 animate-spin" />
                      جاري تشغيل تحليل الذكاء الاصطناعي...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-stone-900" />
                      تشغيل التوفيق الذكي بالذكاء الاصطناعي ✨
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Error Banner */}
            {matchmakingError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl p-4 text-xs flex items-center gap-3 animate-shake">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                <div>
                  <p className="font-bold">فشل تشغيل التوفيق الذكي:</p>
                  <p className="text-rose-600/90 mt-0.5">{matchmakingError}</p>
                </div>
              </div>
            )}

            {/* View Selector & Match stats */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white rounded-2xl border border-stone-200/60 p-4 shadow-xs">
              <div className="flex bg-stone-100 rounded-xl p-1 w-full sm:w-auto">
                <button
                  onClick={() => setMatchViewType('groom')}
                  className={`flex-1 sm:flex-initial text-center py-2 px-5 rounded-lg text-xs font-bold transition-all cursor-pointer ${matchViewType === 'groom' ? 'bg-white text-emerald-800 shadow-xs' : 'text-stone-500 hover:text-stone-800'}`}
                >
                  ترشيحات العرسان ({grooms.length})
                </button>
                <button
                  onClick={() => setMatchViewType('bride')}
                  className={`flex-1 sm:flex-initial text-center py-2 px-5 rounded-lg text-xs font-bold transition-all cursor-pointer ${matchViewType === 'bride' ? 'bg-white text-emerald-800 shadow-xs' : 'text-stone-500 hover:text-stone-800'}`}
                >
                  ترشيحات العرائس ({brides.length})
                </button>
              </div>

              <div className="text-[11px] text-stone-500 font-bold bg-stone-50 border border-stone-200/50 px-3 py-1.5 rounded-lg">
                عدد التوافقات المحسوبة في النظام: <span className="text-emerald-700 font-mono text-xs">{matches.length}</span> ثنائي
              </div>
            </div>

            {/* Match List Renderer */}
            <div className="space-y-8">
              {matchViewType === 'groom' ? (
                grooms.length === 0 ? (
                  <div className="text-center py-20 bg-white border border-stone-200 rounded-3xl">
                    <User className="w-10 h-10 text-stone-300 mx-auto mb-2" />
                    <p className="text-stone-500 text-xs">لا يوجد عرسان مسجلين لعرض ترشيحاتهم.</p>
                  </div>
                ) : (
                  grooms.map(groom => {
                    // Find matches for this groom
                    const groomMatches = matches
                      .filter(m => m.groomId === groom.id)
                      .sort((a, b) => b.aiScore - a.aiScore);

                    return (
                      <div key={groom.id} className="bg-white rounded-3xl border border-stone-200/70 overflow-hidden shadow-xs hover:shadow-sm transition-all">
                        {/* Header for the Groom */}
                        <div className="bg-stone-50 border-b border-stone-250 p-5 sm:px-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-display font-black text-base text-stone-900">
                                العريس: {groom.firstName}
                              </span>
                              <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                {groom.age} سنة • {groom.governorate}
                              </span>
                            </div>
                            <p className="text-stone-500 text-[11px] mt-1 font-semibold">
                              الرمز: {groom.id} • المؤهل: {groom.education} • الوظيفة: {groom.job}
                            </p>
                          </div>
                          
                          <div className="bg-stone-100 px-3.5 py-1.5 rounded-xl border border-stone-200 text-[11px] font-bold text-stone-600 max-w-xs truncate" title={groom.requiredSpecs}>
                            <span className="text-stone-400">المواصفات المطلوبة:</span> {groom.requiredSpecs}
                          </div>
                        </div>

                        {/* Top Matches of Brides */}
                        <div className="p-5 sm:p-6 space-y-4">
                          <h4 className="font-display font-bold text-stone-800 text-xs mb-3 flex items-center gap-1.5">
                            <Heart className="w-4 h-4 text-rose-500 fill-rose-500/15" />
                            أفضل العرائس المطابقات له:
                          </h4>

                          {groomMatches.length === 0 ? (
                            <p className="text-stone-400 text-xs text-center py-4 bg-stone-50 rounded-2xl">لا توجد عروض مطابقة حالياً.</p>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {groomMatches.slice(0, 4).map(m => {
                                const bride = brides.find(b => b.id === m.brideId);
                                if (!bride) return null;

                                return (
                                  <div key={bride.id} className="bg-stone-50/50 rounded-2xl border border-stone-200/60 p-4 flex flex-col justify-between hover:bg-stone-50 transition-all">
                                    <div>
                                      <div className="flex justify-between items-start gap-2 mb-3">
                                        <div>
                                          <span className="font-bold text-stone-900 text-sm">العروسة: {bride.firstName}</span>
                                          <span className="block text-[10px] text-stone-400 mt-0.5">الرمز: {bride.id} • السن: {bride.age} • المحافظة: {bride.governorate}</span>
                                        </div>

                                        {/* Compatibility Percentage Circle */}
                                        <div className={`px-2.5 py-1 rounded-xl text-xs font-black shrink-0 ${
                                          m.aiScore >= 90 ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                          m.aiScore >= 80 ? 'bg-teal-50 text-teal-700 border border-teal-100' :
                                          'bg-stone-100 text-stone-600 border border-stone-250'
                                        }`}>
                                          {m.aiScore}% توافق
                                        </div>
                                      </div>

                                      {/* Core stats */}
                                      <p className="text-stone-500 text-[11px] leading-relaxed mb-3">
                                        المؤهل: <span className="text-stone-700 font-bold">{bride.education}</span> • الوظيفة: <span className="text-stone-700 font-bold">{bride.job}</span> • الحالة: <span className="text-stone-700 font-bold">{bride.maritalStatus}</span>
                                      </p>

                                      {/* AI analysis explanation */}
                                      <div className="bg-white/80 p-3 rounded-xl border border-stone-200/50 text-[11px] text-stone-700 mb-4 shadow-2xs leading-relaxed">
                                        <span className="font-bold text-amber-700 block mb-0.5 flex items-center gap-1">
                                          <Sparkles className="w-3 h-3 text-amber-500 fill-amber-500/20" />
                                          التحليل الذكي للتوافق:
                                        </span>
                                        {m.aiAnalysis}
                                      </div>
                                    </div>

                                    {/* Action row */}
                                    <div className="flex items-center justify-between pt-3 border-t border-stone-200/40">
                                      {/* Approved Toggle */}
                                      <button
                                        onClick={() => handleToggleMatchApproval(groom.id, bride.id)}
                                        className={`flex items-center gap-1 text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                                          m.approvedByAdmin 
                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100' 
                                            : 'bg-stone-100 text-stone-500 hover:bg-stone-200 border border-stone-250'
                                        }`}
                                      >
                                        {m.approvedByAdmin ? (
                                          <>
                                            <Eye className="w-3.5 h-3.5 text-emerald-600" />
                                            معتمد ومرئي للطرفين
                                          </>
                                        ) : (
                                          <>
                                            <EyeOff className="w-3.5 h-3.5 text-stone-400" />
                                            مخفي (معلق للاعتماد)
                                          </>
                                        )}
                                      </button>

                                      {/* Connection indicators */}
                                      <div className="flex flex-col items-end gap-1">
                                        {m.contactRequestedByGroom && m.contactRequestedByBride ? (
                                          <span className="text-[9px] bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold px-2 py-0.5 rounded-md animate-pulse">
                                            مطلوب ربط اتصال متبادل! 😍
                                          </span>
                                        ) : m.contactRequestedByGroom ? (
                                          <span className="text-[9px] bg-amber-50 text-amber-800 border border-amber-200 font-bold px-2 py-0.5 rounded-md">
                                            العريس طلب اتصال 📞
                                          </span>
                                        ) : m.contactRequestedByBride ? (
                                          <span className="text-[9px] bg-rose-50 text-rose-800 border border-rose-200 font-bold px-2 py-0.5 rounded-md">
                                            العروسة طلبت اتصال 📞
                                          </span>
                                        ) : (
                                          <span className="text-[9px] text-stone-400 font-medium">لا توجد طلبات تواصل</span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )
              ) : (
                brides.length === 0 ? (
                  <div className="text-center py-20 bg-white border border-stone-200 rounded-3xl">
                    <Heart className="w-10 h-10 text-stone-300 mx-auto mb-2 fill-stone-300/10" />
                    <p className="text-stone-500 text-xs">لا يوجد عرائس مسجلات لعرض ترشيحاتهن.</p>
                  </div>
                ) : (
                  brides.map(bride => {
                    // Find matches for this bride
                    const brideMatches = matches
                      .filter(m => m.brideId === bride.id)
                      .sort((a, b) => b.aiScore - a.aiScore);

                    return (
                      <div key={bride.id} className="bg-white rounded-3xl border border-stone-200/70 overflow-hidden shadow-xs hover:shadow-sm transition-all">
                        {/* Header for the Bride */}
                        <div className="bg-stone-50 border-b border-stone-250 p-5 sm:px-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-display font-black text-base text-stone-900">
                                العروسة: {bride.firstName}
                              </span>
                              <span className="bg-rose-50 text-rose-700 border border-rose-100 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                {bride.age} سنة • {bride.governorate}
                              </span>
                            </div>
                            <p className="text-stone-500 text-[11px] mt-1 font-semibold">
                              الرمز: {bride.id} • المؤهل: {bride.education} • الوظيفة: {bride.job}
                            </p>
                          </div>
                          
                          <div className="bg-stone-100 px-3.5 py-1.5 rounded-xl border border-stone-200 text-[11px] font-bold text-stone-600 max-w-xs truncate" title={bride.requiredSpecs}>
                            <span className="text-stone-400">المواصفات المطلوبة:</span> {bride.requiredSpecs}
                          </div>
                        </div>

                        {/* Top Matches of Grooms */}
                        <div className="p-5 sm:p-6 space-y-4">
                          <h4 className="font-display font-bold text-stone-800 text-xs mb-3 flex items-center gap-1.5">
                            <User className="w-4 h-4 text-emerald-600" />
                            أفضل العرسان المطابقين لها:
                          </h4>

                          {brideMatches.length === 0 ? (
                            <p className="text-stone-400 text-xs text-center py-4 bg-stone-50 rounded-2xl">لا توجد عروض مطابقة حالياً.</p>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {brideMatches.slice(0, 4).map(m => {
                                const groom = grooms.find(g => g.id === m.groomId);
                                if (!groom) return null;

                                return (
                                  <div key={groom.id} className="bg-stone-50/50 rounded-2xl border border-stone-200/60 p-4 flex flex-col justify-between hover:bg-stone-50 transition-all">
                                    <div>
                                      <div className="flex justify-between items-start gap-2 mb-3">
                                        <div>
                                          <span className="font-bold text-stone-900 text-sm">العريس: {groom.firstName}</span>
                                          <span className="block text-[10px] text-stone-400 mt-0.5">الرمز: {groom.id} • السن: {groom.age} • المحافظة: {groom.governorate}</span>
                                        </div>

                                        {/* Compatibility Percentage Circle */}
                                        <div className={`px-2.5 py-1 rounded-xl text-xs font-black shrink-0 ${
                                          m.aiScore >= 90 ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                          m.aiScore >= 80 ? 'bg-teal-50 text-teal-700 border border-teal-100' :
                                          'bg-stone-100 text-stone-600 border border-stone-250'
                                        }`}>
                                          {m.aiScore}% توافق
                                        </div>
                                      </div>

                                      {/* Core stats */}
                                      <p className="text-stone-500 text-[11px] leading-relaxed mb-3">
                                        المؤهل: <span className="text-stone-700 font-bold">{groom.education}</span> • الوظيفة: <span className="text-stone-700 font-bold">{groom.job}</span> • الحالة: <span className="text-stone-700 font-bold">{groom.maritalStatus}</span>
                                      </p>

                                      {/* AI analysis explanation */}
                                      <div className="bg-white/80 p-3 rounded-xl border border-stone-200/50 text-[11px] text-stone-700 mb-4 shadow-2xs leading-relaxed">
                                        <span className="font-bold text-amber-700 block mb-0.5 flex items-center gap-1">
                                          <Sparkles className="w-3 h-3 text-amber-500 fill-amber-500/20" />
                                          التحليل الذكي للتوافق:
                                        </span>
                                        {m.aiAnalysis}
                                      </div>
                                    </div>

                                    {/* Action row */}
                                    <div className="flex items-center justify-between pt-3 border-t border-stone-200/40">
                                      {/* Approved Toggle */}
                                      <button
                                        onClick={() => handleToggleMatchApproval(groom.id, bride.id)}
                                        className={`flex items-center gap-1 text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                                          m.approvedByAdmin 
                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100' 
                                            : 'bg-stone-100 text-stone-500 hover:bg-stone-200 border border-stone-250'
                                        }`}
                                      >
                                        {m.approvedByAdmin ? (
                                          <>
                                            <Eye className="w-3.5 h-3.5 text-emerald-600" />
                                            معتمد ومرئي للطرفين
                                          </>
                                        ) : (
                                          <>
                                            <EyeOff className="w-3.5 h-3.5 text-stone-400" />
                                            مخفي (معلق للاعتماد)
                                          </>
                                        )}
                                      </button>

                                      {/* Connection indicators */}
                                      <div className="flex flex-col items-end gap-1">
                                        {m.contactRequestedByGroom && m.contactRequestedByBride ? (
                                          <span className="text-[9px] bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold px-2 py-0.5 rounded-md animate-pulse">
                                            مطلوب ربط اتصال متبادل! 😍
                                          </span>
                                        ) : m.contactRequestedByGroom ? (
                                          <span className="text-[9px] bg-amber-50 text-amber-800 border border-amber-200 font-bold px-2 py-0.5 rounded-md">
                                            العريس طلب اتصال 📞
                                          </span>
                                        ) : m.contactRequestedByBride ? (
                                          <span className="text-[9px] bg-rose-50 text-rose-800 border border-rose-200 font-bold px-2 py-0.5 rounded-md">
                                            العروسة طلبت اتصال 📞
                                          </span>
                                        ) : (
                                          <span className="text-[9px] text-stone-400 font-medium">لا توجد طلبات تواصل</span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )
              )}
            </div>
          </div>
        )}

        {/* ==================================== */}
        {/* Tab 5: ARTICLES & BOOKS CRUD (إدارة المقالات والكتب) */}
        {/* ==================================== */}
        {activeTab === 'content' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Header */}
            <div className="bg-white rounded-3xl border border-stone-200/60 p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="font-display font-black text-stone-900 text-base flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-emerald-600" />
                  بوابة إدارة المقالات التثقيفية والمؤلفات الزوجية
                </h3>
                <p className="text-stone-500 text-xs mt-1">
                  يمكنك هنا إضافة وتعديل وحذف المقالات والكتب والنصائح التي تظهر للأعضاء والزوار في الصفحة الرئيسية لمساعدتهم في رحلة بناء بيت مسلم سعيد.
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => setIsAddingArticle(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-emerald-600/10 cursor-pointer"
                >
                  + إضافة مقال جديد
                </button>
                <button
                  onClick={() => setIsAddingBook(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-blue-600/10 cursor-pointer"
                >
                  + إضافة كتاب جديد
                </button>
              </div>
            </div>

            {/* Sub-grid of Articles vs Books */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Articles Management Panel */}
              <div className="space-y-4">
                <h4 className="font-display font-black text-stone-800 text-sm flex items-center gap-2 px-1">
                  <span className="w-2.5 h-2.5 bg-emerald-600 rounded-full" />
                  سجل المقالات والمدونات التوجيهية ({articles.length})
                </h4>

                <div className="space-y-3.5 max-h-[600px] overflow-y-auto pr-1">
                  {articles.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-3xl border border-stone-200/60 text-stone-400 text-xs">
                      لا توجد مقالات مضافة حالياً.
                    </div>
                  ) : (
                    articles.map(art => (
                      <div key={art.id} className="bg-white rounded-2xl border border-stone-200/60 p-4 shadow-2xs hover:shadow-xs transition-all flex gap-4">
                        <img 
                          src={art.image} 
                          alt={art.title} 
                          className="w-20 h-20 object-cover rounded-xl border border-stone-200 shrink-0 bg-stone-100"
                        />
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <span className="font-bold text-stone-900 text-xs block truncate">{art.title}</span>
                            <span className="text-[10px] text-stone-400 font-bold block mt-1">تاريخ النشر: {art.publishDate}</span>
                            <p className="text-stone-500 text-[11px] mt-1.5 line-clamp-2 leading-relaxed">{art.content}</p>
                          </div>
                          <div className="flex justify-end gap-2 mt-3 pt-2 border-t border-stone-100 text-[10px] font-bold">
                            <button
                              onClick={() => setEditingArticle(art)}
                              className="text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <Edit3 className="w-3 h-3" />
                              تعديل
                            </button>
                            <button
                              onClick={() => handleDeleteArticle(art.id)}
                              className="text-rose-600 hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                              حذف
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Books Management Panel */}
              <div className="space-y-4">
                <h4 className="font-display font-black text-stone-800 text-sm flex items-center gap-2 px-1">
                  <span className="w-2.5 h-2.5 bg-blue-600 rounded-full" />
                  مكتبة الكتب والمراجع المعتمدة ({books.length})
                </h4>

                <div className="space-y-3.5 max-h-[600px] overflow-y-auto pr-1">
                  {books.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-3xl border border-stone-200/60 text-stone-400 text-xs">
                      لا توجد كتب مضافة حالياً.
                    </div>
                  ) : (
                    books.map(bk => (
                      <div key={bk.id} className="bg-white rounded-2xl border border-stone-200/60 p-4 shadow-2xs hover:shadow-xs transition-all flex gap-4">
                        <img 
                          src={bk.coverImage} 
                          alt={bk.title} 
                          className="w-16 h-24 object-cover rounded-lg border border-stone-200 shrink-0 bg-stone-100 shadow-2xs"
                        />
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <span className="font-bold text-stone-900 text-xs block truncate">{bk.title}</span>
                            <p className="text-stone-500 text-[11px] mt-1.5 line-clamp-2 leading-relaxed">{bk.description}</p>
                            <span className="text-[10px] text-blue-700 font-bold block mt-1 max-w-xs truncate font-mono bg-blue-50 px-2 py-0.5 rounded-md text-right" dir="ltr">{bk.downloadUrl}</span>
                          </div>
                          <div className="flex justify-end gap-2 mt-3 pt-2 border-t border-stone-100 text-[10px] font-bold">
                            <button
                              onClick={() => setEditingBook(bk)}
                              className="text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <Edit3 className="w-3 h-3" />
                              تعديل
                            </button>
                            <button
                              onClick={() => handleDeleteBook(bk.id)}
                              className="text-rose-600 hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                              حذف
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

            {/* Modals for Adding / Editing */}
            {/* 1. Add Article Modal */}
            {isAddingArticle && (
              <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-lg w-full p-6 text-xs space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-stone-100">
                    <h3 className="font-display font-black text-stone-900 text-sm">إضافة مقال جديد</h3>
                    <button onClick={() => setIsAddingArticle(false)} className="text-stone-400 hover:text-stone-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <form onSubmit={handleCreateArticle} className="space-y-3">
                    <div>
                      <label className="block text-stone-600 font-bold mb-1">عنوان المقال:</label>
                      <input 
                        type="text" 
                        required
                        value={newArticleData.title}
                        onChange={e => setNewArticleData(p => ({ ...p, title: e.target.value }))}
                        className="w-full p-2.5 border border-stone-200 rounded-xl"
                        placeholder="مثال: أسس الاختيار الناجح لشريك العمر..."
                      />
                    </div>
                    <div>
                      <label className="block text-stone-600 font-bold mb-1">رابط الصورة (Unsplash أو غيره):</label>
                      <input 
                        type="text" 
                        value={newArticleData.image}
                        onChange={e => setNewArticleData(p => ({ ...p, image: e.target.value }))}
                        className="w-full p-2.5 border border-stone-200 rounded-xl text-left"
                        placeholder="https://images.unsplash.com/..."
                      />
                    </div>
                    <div>
                      <label className="block text-stone-600 font-bold mb-1">محتوى المقال:</label>
                      <textarea 
                        rows={6}
                        required
                        value={newArticleData.content}
                        onChange={e => setNewArticleData(p => ({ ...p, content: e.target.value }))}
                        className="w-full p-2.5 border border-stone-200 rounded-xl resize-none text-right leading-relaxed"
                        placeholder="اكتب تفاصيل ومحتوى المقال هنا..."
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-3 border-t border-stone-100 font-bold">
                      <button 
                        type="button" 
                        onClick={() => setIsAddingArticle(false)} 
                        className="px-4 py-2 border border-stone-200 hover:bg-stone-50 rounded-xl"
                      >
                        إلغاء
                      </button>
                      <button 
                        type="submit" 
                        className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md"
                      >
                        نشر المقال
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* 2. Edit Article Modal */}
            {editingArticle && (
              <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-lg w-full p-6 text-xs space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-stone-100">
                    <h3 className="font-display font-black text-stone-900 text-sm">تعديل المقال</h3>
                    <button onClick={() => setEditingArticle(null)} className="text-stone-400 hover:text-stone-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <form onSubmit={handleUpdateArticle} className="space-y-3">
                    <div>
                      <label className="block text-stone-600 font-bold mb-1">عنوان المقال:</label>
                      <input 
                        type="text" 
                        required
                        value={editingArticle.title}
                        onChange={e => setEditingArticle(p => p ? ({ ...p, title: e.target.value }) : null)}
                        className="w-full p-2.5 border border-stone-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-600 font-bold mb-1">رابط الصورة:</label>
                      <input 
                        type="text" 
                        value={editingArticle.image}
                        onChange={e => setEditingArticle(p => p ? ({ ...p, image: e.target.value }) : null)}
                        className="w-full p-2.5 border border-stone-200 rounded-xl text-left"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-600 font-bold mb-1">محتوى المقال:</label>
                      <textarea 
                        rows={6}
                        required
                        value={editingArticle.content}
                        onChange={e => setEditingArticle(p => p ? ({ ...p, content: e.target.value }) : null)}
                        className="w-full p-2.5 border border-stone-200 rounded-xl resize-none text-right leading-relaxed"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-3 border-t border-stone-100 font-bold">
                      <button 
                        type="button" 
                        onClick={() => setEditingArticle(null)} 
                        className="px-4 py-2 border border-stone-200 hover:bg-stone-50 rounded-xl"
                      >
                        إلغاء
                      </button>
                      <button 
                        type="submit" 
                        className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md"
                      >
                        حفظ التعديلات
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* 3. Add Book Modal */}
            {isAddingBook && (
              <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-lg w-full p-6 text-xs space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-stone-100">
                    <h3 className="font-display font-black text-stone-900 text-sm">إضافة كتاب جديد لمكتبة المراجع</h3>
                    <button onClick={() => setIsAddingBook(false)} className="text-stone-400 hover:text-stone-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <form onSubmit={handleCreateBook} className="space-y-3">
                    <div>
                      <label className="block text-stone-600 font-bold mb-1">عنوان الكتاب:</label>
                      <input 
                        type="text" 
                        required
                        value={newBookData.title}
                        onChange={e => setNewBookData(p => ({ ...p, title: e.target.value }))}
                        className="w-full p-2.5 border border-stone-200 rounded-xl"
                        placeholder="مثال: تحفة العروس أو الزواج الإسلامي السعيد..."
                      />
                    </div>
                    <div>
                      <label className="block text-stone-600 font-bold mb-1">رابط صورة الغلاف:</label>
                      <input 
                        type="text" 
                        value={newBookData.coverImage}
                        onChange={e => setNewBookData(p => ({ ...p, coverImage: e.target.value }))}
                        className="w-full p-2.5 border border-stone-200 rounded-xl text-left"
                        placeholder="https://images.unsplash.com/..."
                      />
                    </div>
                    <div>
                      <label className="block text-stone-600 font-bold mb-1">رابط التحميل أو القراءة السريعة (PDF/Archive):</label>
                      <input 
                        type="text" 
                        value={newBookData.downloadUrl}
                        onChange={e => setNewBookData(p => ({ ...p, downloadUrl: e.target.value }))}
                        className="w-full p-2.5 border border-stone-200 rounded-xl text-left font-mono"
                        placeholder="https://archive.org/details/..."
                      />
                    </div>
                    <div>
                      <label className="block text-stone-600 font-bold mb-1">وصف الكتاب ونبذة عنه:</label>
                      <textarea 
                        rows={3}
                        required
                        value={newBookData.description}
                        onChange={e => setNewBookData(p => ({ ...p, description: e.target.value }))}
                        className="w-full p-2.5 border border-stone-200 rounded-xl resize-none text-right leading-relaxed"
                        placeholder="اكتب نبذة مختصرة عن موضوع الكتاب ومحتواه..."
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-3 border-t border-stone-100 font-bold">
                      <button 
                        type="button" 
                        onClick={() => setIsAddingBook(false)} 
                        className="px-4 py-2 border border-stone-200 hover:bg-stone-50 rounded-xl"
                      >
                        إلغاء
                      </button>
                      <button 
                        type="submit" 
                        className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md"
                      >
                        إضافة الكتاب
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* 4. Edit Book Modal */}
            {editingBook && (
              <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-lg w-full p-6 text-xs space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-stone-100">
                    <h3 className="font-display font-black text-stone-900 text-sm">تعديل تفاصيل الكتاب</h3>
                    <button onClick={() => setEditingBook(null)} className="text-stone-400 hover:text-stone-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <form onSubmit={handleUpdateBook} className="space-y-3">
                    <div>
                      <label className="block text-stone-600 font-bold mb-1">عنوان الكتاب:</label>
                      <input 
                        type="text" 
                        required
                        value={editingBook.title}
                        onChange={e => setEditingBook(p => p ? ({ ...p, title: e.target.value }) : null)}
                        className="w-full p-2.5 border border-stone-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-600 font-bold mb-1">رابط صورة الغلاف:</label>
                      <input 
                        type="text" 
                        value={editingBook.coverImage}
                        onChange={e => setEditingBook(p => p ? ({ ...p, coverImage: e.target.value }) : null)}
                        className="w-full p-2.5 border border-stone-200 rounded-xl text-left"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-600 font-bold mb-1">رابط التحميل أو القراءة:</label>
                      <input 
                        type="text" 
                        value={editingBook.downloadUrl}
                        onChange={e => setEditingBook(p => p ? ({ ...p, downloadUrl: e.target.value }) : null)}
                        className="w-full p-2.5 border border-stone-200 rounded-xl text-left font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-600 font-bold mb-1">وصف الكتاب ونبذة عنه:</label>
                      <textarea 
                        rows={3}
                        required
                        value={editingBook.description}
                        onChange={e => setEditingBook(p => p ? ({ ...p, description: e.target.value }) : null)}
                        className="w-full p-2.5 border border-stone-200 rounded-xl resize-none text-right leading-relaxed"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-3 border-t border-stone-100 font-bold">
                      <button 
                        type="button" 
                        onClick={() => setEditingBook(null)} 
                        className="px-4 py-2 border border-stone-200 hover:bg-stone-50 rounded-xl"
                      >
                        إلغاء
                      </button>
                      <button 
                        type="submit" 
                        className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md"
                      >
                        حفظ التعديلات
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* ==================================== */}
      {/* GROOM EDIT MODAL */}
      {/* ==================================== */}
      {editingGroom && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-stone-200 flex justify-between items-center bg-stone-50 rounded-t-3xl">
              <h3 className="font-display font-black text-stone-900 text-lg">تعديل ملف العريس: {editingGroom.firstName}</h3>
              <button onClick={() => setEditingGroom(null)} className="p-1 text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={submitGroomEdit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-600 font-bold mb-1">الاسم الأول:</label>
                  <input
                    type="text"
                    value={editingGroom.firstName}
                    onChange={(e) => setEditingGroom({ ...editingGroom, firstName: e.target.value })}
                    className="w-full p-2.5 border border-stone-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-stone-600 font-bold mb-1">السن:</label>
                  <input
                    type="number"
                    value={editingGroom.age}
                    onChange={(e) => setEditingGroom({ ...editingGroom, age: parseInt(e.target.value) || 0 })}
                    className="w-full p-2.5 border border-stone-200 rounded-xl text-right"
                  />
                </div>
                <div>
                  <label className="block text-stone-600 font-bold mb-1">المحافظة الحالية:</label>
                  <select
                    value={editingGroom.governorate}
                    onChange={(e) => setEditingGroom({ ...editingGroom, governorate: e.target.value })}
                    className="w-full p-2.5 border border-stone-200 rounded-xl text-right bg-white"
                  >
                    {GOVERNORATES.map(gov => (
                      <option key={gov} value={gov}>{gov}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-stone-600 font-bold mb-1">المدينة/المركز الحالي:</label>
                  <input
                    type="text"
                    value={editingGroom.city}
                    onChange={(e) => setEditingGroom({ ...editingGroom, city: e.target.value })}
                    className="w-full p-2.5 border border-stone-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-stone-600 font-bold mb-1">المحافظة الأصلية:</label>
                  <select
                    value={editingGroom.originGovernorate || ""}
                    onChange={(e) => setEditingGroom({ ...editingGroom, originGovernorate: e.target.value })}
                    className="w-full p-2.5 border border-stone-200 rounded-xl text-right bg-white"
                  >
                    <option value="">اختر المحافظة...</option>
                    {GOVERNORATES.map(gov => (
                      <option key={gov} value={gov}>{gov}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-stone-600 font-bold mb-1">المدينة/المركز الأصلي:</label>
                  <input
                    type="text"
                    value={editingGroom.originCity || ""}
                    onChange={(e) => setEditingGroom({ ...editingGroom, originCity: e.target.value })}
                    className="w-full p-2.5 border border-stone-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-stone-600 font-bold mb-1">الوظيفة:</label>
                  <input
                    type="text"
                    value={editingGroom.job}
                    onChange={(e) => setEditingGroom({ ...editingGroom, job: e.target.value })}
                    className="w-full p-2.5 border border-stone-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-stone-600 font-bold mb-1">المؤهل الدراسي:</label>
                  <input
                    type="text"
                    value={editingGroom.education}
                    onChange={(e) => setEditingGroom({ ...editingGroom, education: e.target.value })}
                    className="w-full p-2.5 border border-stone-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-stone-600 font-bold mb-1">الحالة الاجتماعية:</label>
                  <select
                    value={editingGroom.maritalStatus}
                    onChange={(e) => setEditingGroom({ ...editingGroom, maritalStatus: e.target.value })}
                    className="w-full p-2.5 border border-stone-200 rounded-xl text-right bg-white"
                  >
                    <option value="أعزب">أعزب</option>
                    <option value="مطلق">مطلق</option>
                    <option value="أرمل">أرمل</option>
                    <option value="متزوج ويرغب في التعدد">متزوج ويرغب في التعدد</option>
                  </select>
                </div>
                <div>
                  <label className="block text-stone-600 font-bold mb-1">الحالة المادية:</label>
                  <input
                    type="text"
                    value={editingGroom.financialStatus}
                    onChange={(e) => setEditingGroom({ ...editingGroom, financialStatus: e.target.value })}
                    className="w-full p-2.5 border border-stone-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-stone-600 font-bold mb-1">الطول (سم):</label>
                  <input
                    type="number"
                    value={editingGroom.height}
                    onChange={(e) => setEditingGroom({ ...editingGroom, height: parseInt(e.target.value) || 0 })}
                    className="w-full p-2.5 border border-stone-200 rounded-xl text-right"
                  />
                </div>
                <div>
                  <label className="block text-stone-600 font-bold mb-1">التدخين:</label>
                  <select
                    value={editingGroom.smoking}
                    onChange={(e) => setEditingGroom({ ...editingGroom, smoking: e.target.value })}
                    className="w-full p-2.5 border border-stone-200 rounded-xl text-right bg-white"
                  >
                    <option value="يدخن">يدخن</option>
                    <option value="لا يدخن">لا يدخن</option>
                  </select>
                </div>
                <div>
                  <label className="block text-stone-600 font-bold mb-1">مستوى التدين:</label>
                  <input
                    type="text"
                    value={editingGroom.religiosity}
                    onChange={(e) => setEditingGroom({ ...editingGroom, religiosity: e.target.value })}
                    className="w-full p-2.5 border border-stone-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-stone-600 font-bold mb-1">جاهز للزواج خلال ٦ أشهر؟</label>
                  <select
                    value={editingGroom.readyIn6Months}
                    onChange={(e) => setEditingGroom({ ...editingGroom, readyIn6Months: e.target.value })}
                    className="w-full p-2.5 border border-stone-200 rounded-xl text-right bg-white"
                  >
                    <option value="نعم">نعم</option>
                    <option value="لا">لا</option>
                    <option value="محتمل">محتمل</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-stone-600 font-bold mb-1">مواصفات الزوجة المطلوبة:</label>
                <textarea
                  rows={3}
                  value={editingGroom.requiredSpecs}
                  onChange={(e) => setEditingGroom({ ...editingGroom, requiredSpecs: e.target.value })}
                  className="w-full p-2.5 border border-stone-200 rounded-xl resize-none text-right"
                />
              </div>

              <div>
                <label className="block text-stone-600 font-bold mb-1">التحدث عن النفس والوصف الشخصي:</label>
                <textarea
                  rows={3}
                  value={editingGroom.selfDescription || ""}
                  onChange={(e) => setEditingGroom({ ...editingGroom, selfDescription: e.target.value })}
                  className="w-full p-2.5 border border-stone-200 rounded-xl resize-none text-right"
                />
              </div>

              <div>
                <label className="block text-stone-600 font-bold mb-1">رقم واتساب:</label>
                <input
                  type="text"
                  value={editingGroom.whatsapp}
                  onChange={(e) => setEditingGroom({ ...editingGroom, whatsapp: e.target.value })}
                  className="w-full p-2.5 border border-stone-200 rounded-xl text-left font-mono"
                />
              </div>

              <div>
                <label className="block text-stone-600 font-bold mb-1">ملاحظات إضافية:</label>
                <textarea
                  rows={2}
                  value={editingGroom.additionalNotes}
                  onChange={(e) => setEditingGroom({ ...editingGroom, additionalNotes: e.target.value })}
                  className="w-full p-2.5 border border-stone-200 rounded-xl resize-none text-right"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-stone-100 font-bold text-xs">
                <button
                  type="button"
                  onClick={() => setEditingGroom(null)}
                  className="px-4 py-2.5 border border-stone-200 hover:bg-stone-50 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md"
                >
                  حفظ التعديلات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================== */}
      {/* BRIDE EDIT MODAL */}
      {/* ==================================== */}
      {editingBride && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-stone-200 flex justify-between items-center bg-stone-50 rounded-t-3xl">
              <h3 className="font-display font-black text-stone-900 text-lg">تعديل ملف العروسة: {editingBride.firstName}</h3>
              <button onClick={() => setEditingBride(null)} className="p-1 text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={submitBrideEdit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-600 font-bold mb-1">الاسم الأول:</label>
                  <input
                    type="text"
                    value={editingBride.firstName}
                    onChange={(e) => setEditingBride({ ...editingBride, firstName: e.target.value })}
                    className="w-full p-2.5 border border-stone-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-stone-600 font-bold mb-1">السن:</label>
                  <input
                    type="number"
                    value={editingBride.age}
                    onChange={(e) => setEditingBride({ ...editingBride, age: parseInt(e.target.value) || 0 })}
                    className="w-full p-2.5 border border-stone-200 rounded-xl text-right"
                  />
                </div>
                <div>
                  <label className="block text-stone-600 font-bold mb-1">المحافظة الحالية:</label>
                  <select
                    value={editingBride.governorate}
                    onChange={(e) => setEditingBride({ ...editingBride, governorate: e.target.value })}
                    className="w-full p-2.5 border border-stone-200 rounded-xl text-right bg-white"
                  >
                    {GOVERNORATES.map(gov => (
                      <option key={gov} value={gov}>{gov}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-stone-600 font-bold mb-1">المدينة/المركز الحالي:</label>
                  <input
                    type="text"
                    value={editingBride.city}
                    onChange={(e) => setEditingBride({ ...editingBride, city: e.target.value })}
                    className="w-full p-2.5 border border-stone-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-stone-600 font-bold mb-1">المحافظة الأصلية:</label>
                  <select
                    value={editingBride.originGovernorate || ""}
                    onChange={(e) => setEditingBride({ ...editingBride, originGovernorate: e.target.value })}
                    className="w-full p-2.5 border border-stone-200 rounded-xl text-right bg-white"
                  >
                    <option value="">اختر المحافظة...</option>
                    {GOVERNORATES.map(gov => (
                      <option key={gov} value={gov}>{gov}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-stone-600 font-bold mb-1">المدينة/المركز الأصلي:</label>
                  <input
                    type="text"
                    value={editingBride.originCity || ""}
                    onChange={(e) => setEditingBride({ ...editingBride, originCity: e.target.value })}
                    className="w-full p-2.5 border border-stone-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-stone-600 font-bold mb-1">الوظيفة:</label>
                  <input
                    type="text"
                    value={editingBride.job}
                    onChange={(e) => setEditingBride({ ...editingBride, job: e.target.value })}
                    className="w-full p-2.5 border border-stone-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-stone-600 font-bold mb-1">المؤهل الدراسي:</label>
                  <input
                    type="text"
                    value={editingBride.education}
                    onChange={(e) => setEditingBride({ ...editingBride, education: e.target.value })}
                    className="w-full p-2.5 border border-stone-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-stone-600 font-bold mb-1">الحالة الاجتماعية:</label>
                  <select
                    value={editingBride.maritalStatus}
                    onChange={(e) => setEditingBride({ ...editingBride, maritalStatus: e.target.value })}
                    className="w-full p-2.5 border border-stone-200 rounded-xl text-right bg-white"
                  >
                    <option value="عزباء">عزباء</option>
                    <option value="مطلقة">مطلقة</option>
                    <option value="أرملة">أرملة</option>
                  </select>
                </div>
                <div>
                  <label className="block text-stone-600 font-bold mb-1">الطول (سم):</label>
                  <input
                    type="number"
                    value={editingBride.height}
                    onChange={(e) => setEditingBride({ ...editingBride, height: parseInt(e.target.value) || 0 })}
                    className="w-full p-2.5 border border-stone-200 rounded-xl text-right"
                  />
                </div>
                <div>
                  <label className="block text-stone-600 font-bold mb-1">مستوى التدين:</label>
                  <input
                    type="text"
                    value={editingBride.religiosity}
                    onChange={(e) => setEditingBride({ ...editingBride, religiosity: e.target.value })}
                    className="w-full p-2.5 border border-stone-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-600 font-bold mb-1">حدثينا عن نفسك (الوصف الشخصي):</label>
                <textarea
                  rows={3}
                  maxLength={1000}
                  value={editingBride.selfDescription || ""}
                  onChange={(e) => setEditingBride({ ...editingBride, selfDescription: e.target.value })}
                  className="w-full p-2.5 border border-stone-200 rounded-xl resize-none text-right"
                />
              </div>

              <div>
                <label className="block text-stone-600 font-bold mb-1">مواصفات الزوج المطلوب:</label>
                <textarea
                  rows={3}
                  value={editingBride.requiredSpecs}
                  onChange={(e) => setEditingBride({ ...editingBride, requiredSpecs: e.target.value })}
                  className="w-full p-2.5 border border-stone-200 rounded-xl resize-none text-right"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-600 font-bold mb-1">وسيلة التواصل المفضلة:</label>
                  <input
                    type="text"
                    value={editingBride.contactMethod}
                    onChange={(e) => setEditingBride({ ...editingBride, contactMethod: e.target.value })}
                    className="w-full p-2.5 border border-stone-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-stone-600 font-bold mb-1">بيانات التواصل التفصيلية:</label>
                  <input
                    type="text"
                    value={editingBride.contactDetails}
                    onChange={(e) => setEditingBride({ ...editingBride, contactDetails: e.target.value })}
                    className="w-full p-2.5 border border-stone-200 rounded-xl text-left font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-600 font-bold mb-1">ملاحظات إضافية:</label>
                <textarea
                  rows={2}
                  value={editingBride.additionalNotes}
                  onChange={(e) => setEditingBride({ ...editingBride, additionalNotes: e.target.value })}
                  className="w-full p-2.5 border border-stone-200 rounded-xl resize-none text-right"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-stone-100 font-bold text-xs">
                <button
                  type="button"
                  onClick={() => setEditingBride(null)}
                  className="px-4 py-2.5 border border-stone-200 hover:bg-stone-50 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md"
                >
                  حفظ التعديلات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
