/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Search, Heart, Sparkles, CheckCircle, Clock, ShieldCheck, 
  Phone, AlertCircle, ArrowRight, User, Edit3, HeartHandshake, 
  Image, ShieldAlert, Key, HelpCircle, Save, Check, RefreshCw
} from "lucide-react";
import { GroomRecord, BrideRecord } from "../types";

interface MatchItem {
  id: string; // Opponent ID
  firstName: string;
  age: number;
  governorate: string;
  city: string;
  maritalStatus: string;
  education: string;
  job: string;
  religiosity: string;
  selfDescription: string;
  score: number;
  aiAnalysis: string;
  contactRequestedByMe: boolean;
  contactRequestedByThem: boolean;
  isMutualApproved: boolean;
  contactDetails?: string; // Revealed only if mutual
}

interface CheckStatusViewProps {
  onBackToHome: () => void;
}

export default function CheckStatusView({ onBackToHome }: CheckStatusViewProps) {
  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [gender, setGender] = useState<'groom' | 'bride'>('groom');
  const [phone, setPhone] = useState('');
  const [adminCode, setAdminCode] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Logged-in User Data
  const [userProfile, setUserProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'matches' | 'profile'>('matches');
  
  // Dynamic Matches List
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(false);

  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState("");
  const [photoPreview, setPhotoPreview] = useState("");

  // Profile Form States
  const [formData, setFormData] = useState({
    firstName: "",
    age: 25,
    governorate: "القاهرة",
    city: "",
    maritalStatus: "أعزب",
    education: "بكالوريوس",
    job: "",
    religiosity: "أصلي بالتزام",
    preferredContact: "واتساب",
    contactDetails: "",
    selfDescription: "",
    requiredSpecifications: "",
    photo: ""
  });

  // Load persisted session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("member_session_user");
    const savedType = localStorage.getItem("member_session_type");
    if (savedUser && savedType) {
      const parsed = JSON.parse(savedUser);
      setUserProfile(parsed);
      setGender(savedType as 'groom' | 'bride');
      setIsLoggedIn(true);
      initForm(parsed);
      fetchMyMatches(parsed.id, savedType);
    }
  }, []);

  const initForm = (profile: any) => {
    setFormData({
      firstName: profile.firstName || "",
      age: profile.age || 25,
      governorate: profile.governorate || "القاهرة",
      city: profile.city || "",
      maritalStatus: profile.maritalStatus || (gender === 'groom' ? 'أعزب' : 'عزباء'),
      education: profile.education || "بكالوريوس",
      job: profile.job || "",
      religiosity: profile.religiosity || "أصلي بالتزام",
      preferredContact: profile.preferredContact || "واتساب",
      contactDetails: profile.whatsapp || profile.contactDetails || "",
      selfDescription: profile.selfDescription || "",
      requiredSpecifications: profile.requiredSpecifications || "",
      photo: profile.photo || ""
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim() || !adminCode.trim()) {
      setError("الرجاء إدخال رقم الهاتف المسجل وكود المرور ذو الـ 4 أرقام.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gender,
          whatsapp: phone.trim(),
          adminCode: adminCode.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "فشل تسجيل الدخول. يرجى التحقق من المدخلات.");
      }

      setUserProfile(data.user);
      localStorage.setItem("member_session_user", JSON.stringify(data.user));
      localStorage.setItem("member_session_type", data.type);
      setIsLoggedIn(true);
      initForm(data.user);
      fetchMyMatches(data.user.id, data.type);
    } catch (err: any) {
      setError(err.message || "عذراً، لم نتمكن من العثور على حساب بهذه البيانات. يرجى التحقق من الهاتف والكود الخاص بك.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("member_session_user");
    localStorage.removeItem("member_session_type");
    setIsLoggedIn(false);
    setUserProfile(null);
    setMatches([]);
    setPhone('');
    setAdminCode('');
  };

  const fetchMyMatches = async (userId: string, userType: string) => {
    setLoadingMatches(true);
    try {
      const res = await fetch("/api/user/my-matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, type: userType })
      });
      const data = await res.json();
      if (data.success && data.list) {
        setMatches(data.list);
      }
    } catch (err) {
      console.error("Error fetching matches", err);
    } finally {
      setLoadingMatches(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    // Validation for photos
    if (gender === 'groom' && !formData.photo) {
      setError("رفع الصورة الشخصية للتحقق إلزامي للرجال لضمان جدية ومصداقية الطلب.");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        type: gender,
        updatedData: {
          ...formData,
          whatsapp: formData.contactDetails // Map to whatsapp for compatibility
        }
      };

      const res = await fetch(`/api/user/profile/${userProfile.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "فشل تحديث البيانات الشخصية.");
      }

      setUserProfile(data.record);
      localStorage.setItem("member_session_user", JSON.stringify(data.record));
      setSuccessMsg("تم تحديث بياناتك الشخصية بنجاح! جاري إعادة احتساب نسب التوافق الذكي تلقائياً...");
      
      // Re-fetch matches with updated details
      fetchMyMatches(userProfile.id, gender);
      
      // Scroll to top of success message
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      setError(err.message || "حدث خطأ غير متوقع أثناء تحديث البيانات.");
    } finally {
      setLoading(false);
    }
  };

  // Upload photo to Supabase Storage via backend
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate extensions
      const ext = file.name.split('.').pop()?.toLowerCase();
      const allowed = ['jpg', 'jpeg', 'png', 'webp'];
      if (!ext || !allowed.includes(ext)) {
        setError("نوع الملف غير مدعوم. المسموح فقط: jpg, jpeg, png, webp");
        setUploadSuccessMsg("");
        return;
      }

      // Validate size (5MB as requested)
      if (file.size > 5 * 1024 * 1024) {
        setError("حجم الصورة كبير جداً. الحد الأقصى المسموح به هو 5 ميجابايت.");
        setUploadSuccessMsg("");
        return;
      }

      setIsUploadingPhoto(true);
      setError("");
      setUploadSuccessMsg("");

      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64Data = (reader.result as string).split(',')[1];
          const response = await fetch("/api/upload-photo", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              filename: file.name,
              mimeType: file.type,
              base64Data: base64Data
            })
          });

          const result = await response.json();
          if (result.success) {
            setUploadSuccessMsg("تم رفع الصورة بنجاح.");
            setError("");
            
            // Create a local preview Object URL
            const previewUrl = URL.createObjectURL(file);
            if (photoPreview) URL.revokeObjectURL(photoPreview);
            setPhotoPreview(previewUrl);
            setFormData(prev => ({ ...prev, photo: result.path }));
          } else {
            setError(result.error || "فشل رفع الصورة.");
            setUploadSuccessMsg("");
          }
        } catch (err: any) {
          setError(err.message || "حدث خطأ أثناء الاتصال بالخادم لرفع الصورة.");
          setUploadSuccessMsg("");
        } finally {
          setIsUploadingPhoto(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRequestContact = async (targetId: string) => {
    setError("");
    setSuccessMsg("");
    try {
      const res = await fetch("/api/user/request-contact-new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requesterId: userProfile.id,
          targetId: targetId,
          requesterType: gender
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "فشل إرسال طلب التواصل.");
      }

      // Update state locally
      setMatches(prev => 
        prev.map(m => {
          if (m.id === targetId) {
            return {
              ...m,
              contactRequestedByMe: true
            };
          }
          return m;
        })
      );

      setSuccessMsg(data.message || "تم إرسال طلب الاتصال بنجاح! سنعلم الطرف الآخر لتنسيق القبول المتبادل.");
      
      // Refresh matches list to check if it immediately became mutual
      fetchMyMatches(userProfile.id, gender);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      setError(err.message || "حدث خطأ أثناء إرسال طلب التواصل.");
    }
  };

  const governorates = [
    "القاهرة", "الجيزة", "الإسكندرية", "الدقهلية", "البحر الأحمر", "البحيرة", 
    "الفيوم", "الغربية", "الإسماعيلية", "المنوفية", "المنيا", "القليوبية", 
    "الوادي الجديد", "الشرقية", "السويس", "أسوان", "أسيوط", "بني سويف", 
    "بورسعيد", "دمياط", "جنوب سيناء", "كفر الشيخ", "مطروح", "قنا", 
    "شمال سيناء", "سوهاج", "الأقصر"
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-right selection:bg-emerald-200 selection:text-emerald-900" dir="rtl">
      
      {/* Top Breadcrumb and Action */}
      <div className="flex justify-between items-center mb-8">
        <button
          onClick={onBackToHome}
          className="flex items-center gap-1.5 text-stone-500 hover:text-stone-800 text-xs font-bold transition-all cursor-pointer bg-white border border-stone-200 px-4 py-2 rounded-xl shadow-2xs"
        >
          <ArrowRight className="w-4 h-4 text-bento-primary" />
          <span>العودة للرئيسية</span>
        </button>

        {isLoggedIn && (
          <button
            onClick={handleLogout}
            className="text-xs font-bold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-4 py-2 rounded-xl cursor-pointer transition-colors"
          >
            تسجيل الخروج من البوابة
          </button>
        )}
      </div>

      {/* Main Header */}
      <div className="text-center mb-10 max-w-2xl mx-auto">
        <h1 className="text-3xl font-display font-black text-bento-primary tracking-tight">
          {isLoggedIn ? `بوابة الأعضاء والتوافق الشرعي` : `تسجيل الدخول لبوابة الأعضاء`}
        </h1>
        <p className="text-xs sm:text-sm text-bento-dark/70 mt-2 font-semibold leading-relaxed">
          {isLoggedIn 
            ? `مرحباً بك مجدداً في خطوة للزواج الرسمي. من هنا يمكنك تحديث معاييرك الشخصية، ومطابقة ملفك بالذكاء الاصطناعي لرؤية التوافقات بكل خصوصية.`
            : `تتيح البوابة لكل عريس وعروسة مسجلين تعديل البيانات الشخصية، وتفاصيل الاتصال، وتحديث المواصفات المطلوبة، والاطلاع الفوري على التوافقات.`
          }
        </p>
      </div>

      {/* Notifications Alert Container */}
      {(error || successMsg) && (
        <div className="max-w-4xl mx-auto mb-8 space-y-3">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl p-4 text-xs font-bold flex items-center gap-2.5 animate-fadeIn">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-4 text-xs font-bold flex items-center gap-2.5 animate-fadeIn">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 animate-bounce" />
              <span>{successMsg}</span>
            </div>
          )}
        </div>
      )}

      {/* LOGIN VIEW */}
      {!isLoggedIn ? (
        <div className="bg-white rounded-3xl border border-bento-medium/20 p-6 sm:p-10 shadow-xs max-w-md mx-auto relative overflow-hidden">
          <div className="absolute top-0 left-0 w-24 h-24 bg-bento-light/10 rounded-full blur-xl"></div>
          
          <form onSubmit={handleLogin} className="space-y-6 text-xs">
            {/* Gender Selection */}
            <div>
              <label className="block text-stone-600 font-bold mb-2.5">نوع الحساب المسجل:</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setGender('groom')}
                  className={`py-3.5 rounded-xl font-bold border-2 transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    gender === 'groom' 
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-xs' 
                      : 'bg-stone-50 border-stone-200 text-stone-500 hover:bg-stone-100'
                  }`}
                >
                  <span>حساب عريس 🤵</span>
                </button>
                <button
                  type="button"
                  onClick={() => setGender('bride')}
                  className={`py-3.5 rounded-xl font-bold border-2 transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    gender === 'bride' 
                      ? 'bg-rose-50 border-rose-500 text-rose-900 shadow-xs' 
                      : 'bg-stone-50 border-stone-200 text-stone-500 hover:bg-stone-100'
                  }`}
                >
                  <span>حساب عروسة 👰</span>
                </button>
              </div>
            </div>

            {/* Phone/Whatsapp Input */}
            <div>
              <label className="block text-stone-600 font-bold mb-1.5">رقم الواتساب المستخدم في التسجيل:</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="مثال: 01012345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-3.5 pl-10 border border-stone-200 rounded-xl text-right font-mono text-sm focus:border-bento-primary focus:ring-1 focus:ring-bento-primary outline-none transition-all"
                  required
                />
                <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-4" />
              </div>
            </div>

            {/* Admin 4-Digit Code Password */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-stone-600 font-bold">كود العضو السري (المكون من 4 أرقام):</label>
                <span className="text-[10px] text-stone-400 font-medium">حصلت عليه عند التسجيل</span>
              </div>
              <div className="relative">
                <input
                  type="password"
                  maxLength={4}
                  placeholder="أدخل كود المرور المكون من 4 أرقام..."
                  value={adminCode}
                  onChange={(e) => setAdminCode(e.target.value)}
                  className="w-full p-3.5 pl-10 border border-stone-200 rounded-xl text-center font-mono text-sm tracking-widest focus:border-bento-primary focus:ring-1 focus:ring-bento-primary outline-none transition-all"
                  required
                />
                <Key className="w-4 h-4 text-stone-400 absolute left-3.5 top-4" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-bento-primary hover:bg-[#344227] text-white font-bold py-4 rounded-xl transition-all shadow-md hover:scale-101 cursor-pointer flex items-center justify-center gap-2 disabled:bg-stone-200 disabled:text-stone-400"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>جاري تسجيل الدخول...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>دخول للبوابة الآمنة</span>
                </>
              )}
            </button>
          </form>

          {/* Secure notice */}
          <div className="mt-6 pt-6 border-t border-stone-100 flex items-start gap-2.5 text-stone-400 font-medium text-[10px] leading-relaxed">
            <ShieldCheck className="w-4 h-4 text-bento-primary shrink-0 mt-0.5" />
            <p>
              يتم تشفير وتأمين كافة بيانات الدخول. لا تقم بمشاركة كودك السري مع أي شخص لضمان حماية بياناتك الشخصية ومطابقاتك الحالية والمستقبلية.
            </p>
          </div>
        </div>
      ) : (
        /* LOGGED IN PORTAL VIEW */
        <div className="space-y-8 animate-fadeIn">
          
          {/* Dashboard Summary Widget */}
          <div className="bg-white rounded-3xl border border-bento-medium/20 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
            <div className="absolute top-[-30px] right-[-30px] w-48 h-48 bg-bento-medium/5 rounded-full blur-2xl"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-2.5 mb-2">
                <span className="text-stone-400 font-bold text-xs">مرحباً بك مجدداً،</span>
                <h2 className="font-display font-black text-xl text-bento-primary">
                  {gender === 'groom' ? '🤵 العريس' : '👰 العروسة'}: {userProfile.firstName}
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-500 font-bold">
                <p>كود الملف: <span className="font-mono text-bento-primary">{userProfile.id}</span></p>
                <span>•</span>
                <p>كود المرور السري: <span className="font-mono text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">{userProfile.adminCode}</span></p>
                <span>•</span>
                <p>المحافظة: {userProfile.governorate}</p>
              </div>
            </div>

            {/* Application Status Badge */}
            <div className="flex items-center gap-3 relative z-10 bg-stone-50 p-4 rounded-2xl border border-stone-100">
              <div>
                <span className="block text-[10px] text-stone-400 font-black mb-1">حالة الملف لدى الإدارة</span>
                <span className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 border ${
                  userProfile.status === 'مفعل' || userProfile.status === 'نشط' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                  userProfile.status === 'تحت الدراسة' || userProfile.status === 'جديد' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                  'bg-stone-50 text-stone-600 border-stone-200'
                }`}>
                  {userProfile.status === 'مفعل' || userProfile.status === 'نشط' ? (
                    <>
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>نشط ومتاح للتوافق</span>
                    </>
                  ) : (
                    <>
                      <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                      <span>تحت المراجعة والتدقيق</span>
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Tab selectors for matches / editing profile */}
          <div className="flex border-b border-stone-200 max-w-xl">
            <button
              onClick={() => setActiveTab('matches')}
              className={`flex-1 text-center py-4 text-xs sm:text-sm font-black border-b-2 transition-all cursor-pointer flex items-center justify-center gap-2 ${
                activeTab === 'matches' 
                  ? 'border-bento-primary text-bento-primary bg-bento-medium/5' 
                  : 'border-transparent text-stone-400 hover:text-bento-primary'
              }`}
            >
              <HeartHandshake className="w-4 h-4" />
              <span>ترشيحاتي المتوافقة الذكية ({matches.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 text-center py-4 text-xs sm:text-sm font-black border-b-2 transition-all cursor-pointer flex items-center justify-center gap-2 ${
                activeTab === 'profile' 
                  ? 'border-bento-primary text-bento-primary bg-bento-medium/5' 
                  : 'border-transparent text-stone-400 hover:text-bento-primary'
              }`}
            >
              <Edit3 className="w-4 h-4" />
              <span>تعديل بياناتي وشروطي 📝</span>
            </button>
          </div>

          {/* TAB 1: MATCHES */}
          {activeTab === 'matches' && (
            <div className="space-y-6">
              
              <div className="border-r-4 border-bento-primary pr-3 flex justify-between items-center">
                <div>
                  <h3 className="font-display font-black text-bento-primary text-lg flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    نسب التوافق المعززة بالذكاء الاصطناعي
                  </h3>
                  <p className="text-[11px] text-stone-500 font-bold mt-0.5">
                    النتائج أدناه معالجة دلالياً بمقارنة تفضيلات الطرفين وفهم الشروط بدقة وعناية تامة.
                  </p>
                </div>
                
                <button
                  onClick={() => fetchMyMatches(userProfile.id, gender)}
                  disabled={loadingMatches}
                  className="flex items-center gap-1.5 text-xs text-bento-primary hover:text-white hover:bg-bento-primary px-3 py-1.5 rounded-lg border border-bento-primary/30 transition-all cursor-pointer font-bold disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingMatches ? 'animate-spin' : ''}`} />
                  <span>تحديث الترشيحات</span>
                </button>
              </div>

              {loadingMatches ? (
                <div className="flex flex-col justify-center items-center py-16 gap-3">
                  <div className="w-8 h-8 border-4 border-bento-primary border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs text-stone-500 font-bold">جاري تحليل البيانات واحتساب التوافق الدلالي بالذكاء الاصطناعي...</p>
                </div>
              ) : matches.length === 0 ? (
                <div className="bg-white rounded-3xl border border-stone-200/50 p-12 text-center space-y-4 max-w-2xl mx-auto">
                  <Heart className="w-12 h-12 text-stone-200 mx-auto fill-stone-50" />
                  <h4 className="font-bold text-stone-800 text-sm">البحث جارٍ عن شريك مناسب</h4>
                  <p className="text-stone-500 text-xs leading-relaxed max-w-md mx-auto">
                    ملفك تحت الدراسة وسيتم إضافته لمحرك المطابقة الذكية فوراً. بمجرد وجود ملفات مقابلة تحقق شروطك أو تتقارب معها، ستظهر لك الإشعارات ونسب التوافق مباشرة هنا.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {matches.map((match) => {
                    const progressColor = 
                      match.score >= 90 ? "text-emerald-600 border-emerald-500" :
                      match.score >= 80 ? "text-bento-primary border-bento-primary" :
                      "text-amber-600 border-amber-500";

                    return (
                      <div 
                        key={match.id} 
                        className="bg-white rounded-3xl border border-bento-medium/20 p-6 flex flex-col justify-between shadow-xs hover:border-bento-primary/30 hover:shadow-sm transition-all relative overflow-hidden"
                      >
                        <div>
                          {/* Match Percentage & Title */}
                          <div className="flex justify-between items-start gap-4 mb-4">
                            <div>
                              <span className="text-[10px] text-bento-primary bg-bento-medium/10 border border-bento-medium/20 px-3 py-1 rounded-full font-bold mb-1.5 inline-block">
                                شريك متوافق ومصرح به
                              </span>
                              <h4 className="font-display font-black text-stone-900 text-base">
                                {gender === 'groom' ? 'العروسة' : 'العريس'}: {match.firstName}
                              </h4>
                              <p className="text-[10px] text-stone-400 font-bold mt-1">
                                السن: {match.age} سنة • المحافظة: {match.governorate} • المدينة: {match.city || "غير محدد"}
                              </p>
                            </div>

                            {/* Circular Percentage visual */}
                            <div className={`w-14 h-14 rounded-full border-4 flex flex-col items-center justify-center text-center shrink-0 shadow-2xs ${progressColor}`}>
                              <span className="text-sm font-black tracking-tighter leading-none">{match.score}%</span>
                              <span className="text-[7px] font-extrabold opacity-80 uppercase">توافق</span>
                            </div>
                          </div>

                          {/* Detail Grid */}
                          <div className="grid grid-cols-2 gap-y-2.5 gap-x-3 text-[11px] text-stone-600 bg-stone-50/70 p-4 rounded-2xl border border-stone-100 mb-4 font-semibold">
                            <div><span className="text-stone-400 font-bold">الحالة الاجتماعية:</span> <span className="text-stone-800">{match.maritalStatus}</span></div>
                            <div><span className="text-stone-400 font-bold">المستوى التعليمي:</span> <span className="text-stone-800">{match.education}</span></div>
                            <div><span className="text-stone-400 font-bold">الوظيفة والمهنة:</span> <span className="text-stone-800">{match.job || "غير محدد"}</span></div>
                            <div><span className="text-stone-400 font-bold">مستوى التدين:</span> <span className="text-stone-800">{match.religiosity}</span></div>
                          </div>

                          {/* Self Description snippet */}
                          {match.selfDescription && (
                            <div className="text-[11px] leading-relaxed text-stone-600 mb-4 bg-stone-50/30 p-3 rounded-xl border border-dashed border-stone-200">
                              <span className="font-bold text-stone-700 block mb-1">التعريف بالنفس:</span>
                              &ldquo;{match.selfDescription}&rdquo;
                            </div>
                          )}

                          {/* AI Explanation semantic analysis reason */}
                          <div className="bg-amber-50/30 p-4 rounded-2xl border border-amber-200/50 text-xs text-stone-700 mb-6 leading-relaxed font-medium">
                            <span className="font-bold text-amber-800 block mb-1.5 flex items-center gap-1">
                              <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20 animate-pulse" />
                              تحليل دلالي للمواصفات المطلوبة:
                            </span>
                            <p className="text-stone-800">{match.aiAnalysis}</p>
                          </div>
                        </div>

                        {/* Interactive mutual reveal and contact requests */}
                        <div className="border-t border-stone-100 pt-4 flex flex-col gap-2.5">
                          {match.isMutualApproved ? (
                            <div className="bg-emerald-50 border-2 border-emerald-200 text-emerald-900 p-4 rounded-2xl text-xs space-y-2 font-bold animate-fadeIn">
                              <p className="flex items-center gap-1.5 text-emerald-800 text-sm">
                                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                                <span>🎉 تهانينا! تمت الموافقة المتبادلة للتواصل!</span>
                              </p>
                              <p className="bg-white/80 p-2.5 rounded-xl border border-emerald-100 text-stone-800 font-mono text-center text-sm tracking-tight shadow-3xs">
                                وسيلة الاتصال والبيانات: {match.contactDetails || "يرجى مراجعة المشرف فورا"}
                              </p>
                              <p className="text-[10px] text-emerald-700 font-medium">
                                تم الكشف التلقائي عن معلومات التواصل بعد تأكيد رغبة كلا الطرفين بالتواصل الشرعي المباشر.
                              </p>
                            </div>
                          ) : (
                            <>
                              <button
                                onClick={() => handleRequestContact(match.id)}
                                disabled={match.contactRequestedByMe}
                                className={`w-full py-3 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                                  match.contactRequestedByMe
                                    ? 'bg-stone-100 text-stone-400 border border-stone-200 cursor-default shadow-none'
                                    : 'bg-bento-primary hover:bg-[#344227] text-white shadow-xs hover:scale-102 active:scale-98'
                                }`}
                              >
                                <Phone className="w-3.5 h-3.5" />
                                <span>
                                  {match.contactRequestedByMe 
                                    ? 'تم إرسال موافقتك على التواصل (بانتظار الطرف الآخر) 📞' 
                                    : 'إبداء رغبة تواصل هاتفي شرعي 📞'
                                  }
                                </span>
                              </button>

                              {match.contactRequestedByThem && (
                                <div className="bg-rose-50 text-rose-800 border border-rose-100 p-3 rounded-xl text-[10px] font-extrabold text-center animate-pulse">
                                  💡 لقد أبدى هذا الطرف رغبته بالتواصل معك! اضغط على الزر بالأعلى للموافقة فوراً وكشف بيانات الاتصال لكما.
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: EDIT PROFILE */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-3xl border border-bento-medium/20 p-6 sm:p-10 shadow-xs max-w-4xl mx-auto">
              <div className="border-r-4 border-bento-primary pr-3 mb-8">
                <h3 className="text-xl font-display font-black text-bento-primary">تعديل بيانات ملفك الشخصي وشروطك</h3>
                <p className="text-[11px] text-stone-400 font-bold mt-0.5">
                  يرجى ملء كافة الخانات بصدق وأمانة تامة. أي تلاعب بالبيانات يعرض الحساب للإلغاء من قبل المشرفين.
                </p>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-8 text-xs font-bold text-stone-700">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* First Name */}
                  <div>
                    <label className="block text-stone-600 mb-1.5">الاسم الأول (الظاهر للطرف الآخر):</label>
                    <input
                      type="text"
                      className="w-full p-3 border border-stone-200 rounded-xl outline-none focus:border-bento-primary focus:ring-1 focus:ring-bento-primary"
                      value={formData.firstName}
                      onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                      required
                    />
                  </div>

                  {/* Age */}
                  <div>
                    <label className="block text-stone-600 mb-1.5">السن (العمر بالسنوات):</label>
                    <input
                      type="number"
                      min={18}
                      max={80}
                      className="w-full p-3 border border-stone-200 rounded-xl outline-none focus:border-bento-primary focus:ring-1 focus:ring-bento-primary"
                      value={formData.age}
                      onChange={(e) => setFormData(prev => ({ ...prev, age: parseInt(e.target.value) || 25 }))}
                      required
                    />
                  </div>

                  {/* Marital Status */}
                  <div>
                    <label className="block text-stone-600 mb-1.5">الحالة الاجتماعية:</label>
                    <select
                      className="w-full p-3 border border-stone-200 rounded-xl outline-none bg-white focus:border-bento-primary focus:ring-1"
                      value={formData.maritalStatus}
                      onChange={(e) => setFormData(prev => ({ ...prev, maritalStatus: e.target.value }))}
                    >
                      {gender === 'groom' ? (
                        <>
                          <option value="أعزب">أعزب</option>
                          <option value="مطلق">مطلق</option>
                          <option value="أرمل">أرمل</option>
                          <option value="متزوج ويرغب في التعدد">متزوج ويرغب في التعدد</option>
                        </>
                      ) : (
                        <>
                          <option value="عزباء">عزباء</option>
                          <option value="مطلقة">مطلقة</option>
                          <option value="أرملة">أرملة</option>
                        </>
                      )}
                    </select>
                  </div>

                  {/* Governorate */}
                  <div>
                    <label className="block text-stone-600 mb-1.5">المحافظة:</label>
                    <select
                      className="w-full p-3 border border-stone-200 rounded-xl outline-none bg-white focus:border-bento-primary focus:ring-1"
                      value={formData.governorate}
                      onChange={(e) => setFormData(prev => ({ ...prev, governorate: e.target.value }))}
                    >
                      {governorates.map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-stone-600 mb-1.5">المركز / المدينة / الحي:</label>
                    <input
                      type="text"
                      placeholder="مثال: الدقي، أول طنطا..."
                      className="w-full p-3 border border-stone-200 rounded-xl outline-none focus:border-bento-primary focus:ring-1"
                      value={formData.city}
                      onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                      required
                    />
                  </div>

                  {/* Education */}
                  <div>
                    <label className="block text-stone-600 mb-1.5">المؤهل الدراسي والتعليمي:</label>
                    <input
                      type="text"
                      placeholder="مثال: بكالوريوس هندسة، ليسانس حقوق..."
                      className="w-full p-3 border border-stone-200 rounded-xl outline-none focus:border-bento-primary focus:ring-1"
                      value={formData.education}
                      onChange={(e) => setFormData(prev => ({ ...prev, education: e.target.value }))}
                      required
                    />
                  </div>

                  {/* Job */}
                  <div>
                    <label className="block text-stone-600 mb-1.5">الوظيفة والمهنة الحالية:</label>
                    <input
                      type="text"
                      placeholder="مثال: محاسب بشركة، مبرمج، مدرسة لغة عربية..."
                      className="w-full p-3 border border-stone-200 rounded-xl outline-none focus:border-bento-primary focus:ring-1"
                      value={formData.job}
                      onChange={(e) => setFormData(prev => ({ ...prev, job: e.target.value }))}
                      required
                    />
                  </div>

                  {/* Religiosity - prayer commitment */}
                  <div>
                    <label className="block text-stone-600 mb-1.5">مستوى التدين والالتزام بالصلاة:</label>
                    <select
                      className="w-full p-3 border border-stone-200 rounded-xl outline-none bg-white focus:border-bento-primary focus:ring-1"
                      value={formData.religiosity}
                      onChange={(e) => setFormData(prev => ({ ...prev, religiosity: e.target.value }))}
                    >
                      <option value="أصلي السنن والفرائض">أصلي السنن والفرائض والحمد لله</option>
                      <option value="أصلي بالتزام">ألتزم بالفرائض الخمس في وقتها</option>
                      <option value="أصلي بتقطع">أصلي بتقطع وأسعى للانتظام</option>
                      <option value="لا أصلي">لا أصلي حالياً وأسأل الله الهداية</option>
                    </select>
                  </div>

                  {/* Preferred Contact Method */}
                  <div>
                    <label className="block text-stone-600 mb-1.5">وسيلة التواصل المفضلة لدينا:</label>
                    <select
                      className="w-full p-3 border border-stone-200 rounded-xl outline-none bg-white focus:border-bento-primary focus:ring-1"
                      value={formData.preferredContact}
                      onChange={(e) => setFormData(prev => ({ ...prev, preferredContact: e.target.value }))}
                    >
                      <option value="واتساب">رقم واتساب 🟢</option>
                      <option value="رابط فيسبوك">رابط حساب فيسبوك 🔵</option>
                      <option value="رابط تليجرام">رابط حساب تليجرام ✈️</option>
                    </select>
                  </div>
                </div>

                {/* Contact details */}
                <div>
                  <label className="block text-stone-600 mb-1.5">تفاصيل الاتصال الدقيقة (واتساب أو الرابط):</label>
                  <input
                    type="text"
                    placeholder="رقم الهاتف أو رابط حسابك بالضبط (لن يتم مشاركته إلا بعد الموافقة المتبادلة)..."
                    className="w-full p-3.5 border border-stone-200 rounded-xl outline-none text-left font-mono text-sm focus:border-bento-primary focus:ring-1"
                    value={formData.contactDetails}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactDetails: e.target.value }))}
                    required
                  />
                  <p className="text-[10px] text-stone-400 font-medium mt-1">
                    أدخل رقم الهاتف أو رابط حساب التواصل الخاص بك بدقة. يظل هذا الرقم محجوباً وسرياً لخصوصيتك.
                  </p>
                </div>

                {/* Self Description (تحدث عن نفسك) */}
                <div>
                  <label className="block text-stone-600 mb-1.5">صِف نفسك وتحدث عن طباعك بكل وضوح:</label>
                  <textarea
                    rows={4}
                    placeholder="تكلم عن أفكارك، اهتماماتك، روتينك، تدينك، طريقة عيشك لمساعدة محرك التوافق والمشرفين..."
                    className="w-full p-3.5 border border-stone-200 rounded-xl outline-none focus:border-bento-primary focus:ring-1"
                    value={formData.selfDescription}
                    onChange={(e) => setFormData(prev => ({ ...prev, selfDescription: e.target.value }))}
                    required
                  ></textarea>
                </div>

                {/* Required Partner Specs (المواصفات المطلوبة في الشريك) */}
                <div>
                  <label className="block text-stone-600 mb-1.5">صِف شريك الحياة المطلوب والمواصفات التي تتمناها:</label>
                  <textarea
                    rows={4}
                    placeholder="مثال: يلتزم بصلاته، ذات خلق ودين، من نفس المحافظة، عمرها مناسب، مستوى فكري متقارب..."
                    className="w-full p-3.5 border border-stone-200 rounded-xl outline-none focus:border-bento-primary focus:ring-1"
                    value={formData.requiredSpecifications}
                    onChange={(e) => setFormData(prev => ({ ...prev, requiredSpecifications: e.target.value }))}
                    required
                  ></textarea>
                </div>

                {/* VERIFICATION PHOTO UPLOAD */}
                <div className="bg-stone-50 border border-stone-200/60 rounded-2xl p-5 sm:p-6 space-y-4">
                  <div className="flex items-start gap-2.5">
                    <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-stone-900 text-sm">تحميل الصورة الشخصية للتحقق</h4>
                      <p className="text-[11px] text-stone-500 font-bold leading-relaxed mt-0.5">
                        {gender === 'groom' 
                          ? "إلزامي للرجال (🤵). الصور سرية تماماً للإدارة فقط، لمطابقة الملامح والتحقق من الجدية والهوية." 
                          : "اختياري للنساء (👰) لحفظ السرية والعفاف المطلق. لن يراها إلا المشرف الإداري لمطابقتها فقط."
                        }
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    {/* Photo input control */}
                    <div className="w-full sm:w-1/2">
                      {isUploadingPhoto ? (
                        <div className="border-2 border-dashed border-stone-300 rounded-xl p-4 text-center bg-stone-50 flex flex-col items-center justify-center gap-2">
                          <div className="w-6 h-6 border-2 border-stone-300 border-t-stone-700 rounded-full animate-spin"></div>
                          <p className="text-[11px] text-stone-600 font-bold">جاري رفع الصورة بأمان...</p>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-stone-300 rounded-xl p-4 text-center hover:bg-stone-100 transition-colors relative cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <Image className="w-8 h-8 text-stone-400 mx-auto mb-2" />
                          <span className="block text-xs text-stone-500 font-bold">اضغط لاختيار صورة شخصية</span>
                          <span className="block text-[10px] text-stone-400 font-medium">الحد الأقصى: 5 ميغابايت</span>
                        </div>
                      )}
                    </div>

                    {/* Photo preview */}
                    <div className="w-full sm:w-1/2 flex items-center justify-center">
                      {formData.photo ? (
                        <div className="text-center">
                          <div className="w-24 h-24 rounded-2xl overflow-hidden bg-stone-100 border-2 border-bento-primary/30 mx-auto mb-2 relative">
                            <img
                              src={photoPreview || formData.photo}
                              alt="معاينة التحقق"
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({ ...prev, photo: "" }));
                                if (photoPreview) URL.revokeObjectURL(photoPreview);
                                setPhotoPreview("");
                                setUploadSuccessMsg("");
                              }}
                              className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 text-[10px] hover:bg-red-800 transition-colors"
                              title="إزالة الصورة"
                            >
                              ✕
                            </button>
                          </div>
                          <span className="text-[10px] text-emerald-700 font-black flex items-center gap-1 justify-center">
                            <CheckCircle className="w-3.5 h-3.5" /> {uploadSuccessMsg || "جاهزة للتحقق السري"}
                          </span>
                        </div>
                      ) : (
                        <div className="text-center text-stone-400 p-4 border border-stone-200 border-dashed rounded-xl w-32 h-32 flex flex-col justify-center items-center">
                          <Image className="w-6 h-6 mb-1 text-stone-300" />
                          <span className="text-[10px] font-bold">لا توجد صورة محملة</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Save button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-bento-primary hover:bg-[#344227] text-white font-bold py-4 rounded-xl transition-all shadow-md hover:scale-101 cursor-pointer flex items-center justify-center gap-2 disabled:bg-stone-200 disabled:text-stone-400"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>جاري حفظ التغييرات...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>حفظ التعديلات وتحديث معايير التوافق 💾</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
