/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { User, Calendar, MapPin, Briefcase, BookOpen, Heart, MessageSquare, Phone, Info, Check, ShieldCheck, AlertCircle, Sparkles, HelpCircle, FileText, ArrowRight, ChevronDown } from "lucide-react";
import { FileStatus } from "../types";

// List of major governorates in Egypt
const GOVERNORATES = [
  "القاهرة", "الجيزة", "الإسكندرية", "الدقهلية", "الغربية", "الشرقية", "المنوفية",
  "القليوبية", "البحيرة", "دمياط", "كفر الشيخ", "بورسعيد", "الإسماعيلية", "السويس",
  "الفيوم", "بني سويف", "المنيا", "أسيوط", "سوهاج", "قنا", "الأقصر", "أسوان",
  "البحر الأحمر", "الوادي الجديد", "مطروح", "شمال سيناء", "جنوب سيناء"
];

// Education Levels
const EDUCATION_LEVELS = [
  "مؤهل عالي (جامعي)", "ماجستير / دكتوراه", "مؤهل متوسط / فوق متوسط", "طالب جامعي", "تعليم أساسي"
];

// Marital status options
const MARITAL_STATUS_GROOM = ["أعزب", "مطلق (بدون أطفال)", "مطلق (مع أطفال)", "أرمل", "متزوج ويرغب في التعدد"];
const MARITAL_STATUS_BRIDE = ["عزباء", "مطلقة (بدون أطفال)", "مطلقة (مع أطفال)", "أرملة"];

// Financial status options
const FINANCIAL_STATUS_OPTIONS = ["ممتاز", "جيد جداً", "جيد", "متوسط", "مستور والحمد لله"];

// Religiosity options
const RELIGIOSITY_OPTIONS = ["ملتزم جداً (ملتزم بالفرائض والسنن والزي الشرعي)", "ملتزم (ملتزم بالفرائض والأخلاق العامة)", "متوسط التدين", "غير ذلك"];

interface RegistrationFormProps {
  initialType: 'groom' | 'bride' | 'choose';
  setView: (view: 'home' | 'choose-type' | 'register-groom' | 'register-bride' | 'admin') => void;
}

export default function RegistrationForm({ initialType, setView }: RegistrationFormProps) {
  const [regType, setRegType] = useState<'groom' | 'bride' | 'choose'>(initialType);
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [hasConfirmedInstructions, setHasConfirmedInstructions] = useState(false);
  const [tempAgreedToInstructions, setTempAgreedToInstructions] = useState(false);

  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState("");
  const [groomPhotoPreview, setGroomPhotoPreview] = useState("");
  const [bridePhotoPreview, setBridePhotoPreview] = useState("");

  useEffect(() => {
    setHasConfirmedInstructions(false);
    setTempAgreedToInstructions(false);
    setErrorMsg("");
  }, [regType]);

  // Groom Form Fields state
  const [groomForm, setGroomForm] = useState({
    firstName: "",
    age: "",
    governorate: "",
    city: "",
    originGovernorate: "",
    originCity: "",
    education: "",
    job: "",
    maritalStatus: "",
    financialStatus: "",
    height: "",
    smoking: "لا يدخن",
    religiosity: "",
    readyIn6Months: "نعم",
    requiredSpecs: "",
    selfDescription: "",
    whatsapp: "",
    adminCode: "",
    photo: "",
    additionalNotes: ""
  });

  // Bride Form Fields state
  const [brideForm, setBrideForm] = useState({
    firstName: "",
    age: "",
    governorate: "",
    city: "",
    originGovernorate: "",
    originCity: "",
    education: "",
    job: "",
    maritalStatus: "",
    height: "",
    religiosity: "",
    requiredSpecs: "",
    selfDescription: "",
    contactMethod: "واتساب",
    contactDetails: "",
    adminCode: "",
    photo: "",
    additionalNotes: ""
  });

  const handlePhotoChange = (gender: 'groom' | 'bride', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate extensions
      const ext = file.name.split('.').pop()?.toLowerCase();
      const allowed = ['jpg', 'jpeg', 'png', 'webp'];
      if (!ext || !allowed.includes(ext)) {
        setErrorMsg("نوع الملف غير مدعوم. المسموح فقط: jpg, jpeg, png, webp");
        setUploadSuccessMsg("");
        return;
      }

      // Validate size
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg("حجم الصورة كبير جداً. الحد الأقصى المسموح به هو 5 ميجابايت.");
        setUploadSuccessMsg("");
        return;
      }

      setIsUploadingPhoto(true);
      setErrorMsg("");
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
            setErrorMsg("");
            
            // Create a local preview Object URL
            const previewUrl = URL.createObjectURL(file);
            
            if (gender === 'groom') {
              if (groomPhotoPreview) URL.revokeObjectURL(groomPhotoPreview);
              setGroomPhotoPreview(previewUrl);
              setGroomForm(prev => ({ ...prev, photo: result.path }));
            } else {
              if (bridePhotoPreview) URL.revokeObjectURL(bridePhotoPreview);
              setBridePhotoPreview(previewUrl);
              setBrideForm(prev => ({ ...prev, photo: result.path }));
            }
          } else {
            setErrorMsg(result.error || "فشل رفع الصورة.");
            setUploadSuccessMsg("");
          }
        } catch (err: any) {
          setErrorMsg(err.message || "حدث خطأ أثناء الاتصال بالخادم لرفع الصورة.");
          setUploadSuccessMsg("");
        } finally {
          setIsUploadingPhoto(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGroomChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setGroomForm(prev => ({ ...prev, [name]: value }));
  };

  const handleBrideChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBrideForm(prev => ({ ...prev, [name]: value }));
  };

  const handleGroomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToPrivacy) {
      setErrorMsg("يجب الموافقة على سياسة الخصوصية وشروط الاستخدام قبل إتمام التسجيل.");
      return;
    }

    // Simple validations
    if (!groomForm.firstName || !groomForm.age || !groomForm.governorate || !groomForm.city || !groomForm.originGovernorate || !groomForm.originCity || !groomForm.job || !groomForm.whatsapp || !groomForm.requiredSpecs || !groomForm.adminCode || !groomForm.photo || !groomForm.selfDescription) {
      setErrorMsg("برجاء ملء جميع الحقول الإلزامية المطلوبة المتميزة بنجمة (*)، بما في ذلك الكود، المحافظات، ووصف الشخصية، والصورة الشخصية.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const response = await fetch("/api/grooms/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...groomForm,
          age: parseInt(groomForm.age) || 0,
          height: parseInt(groomForm.height) || 0
        })
      });

      const result = await response.json();
      if (result.success) {
        setSubmitSuccess(true);
      } else {
        setErrorMsg(result.error || "حدث خطأ غير متوقع أثناء تسجيل البيانات.");
      }
    } catch (err) {
      setErrorMsg("فشل الاتصال بالخادم. يرجى التحقق من اتصال الشبكة.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBrideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToPrivacy) {
      setErrorMsg("يجب الموافقة على سياسة الخصوصية وشروط الاستخدام قبل إتمام التسجيل.");
      return;
    }

    // Simple validations
    if (!brideForm.firstName || !brideForm.age || !brideForm.governorate || !brideForm.city || !brideForm.originGovernorate || !brideForm.originCity || !brideForm.job || !brideForm.contactDetails || !brideForm.requiredSpecs || !brideForm.adminCode || !brideForm.selfDescription) {
      setErrorMsg("برجاء ملء جميع الحقول الإلزامية المطلوبة المتميزة بنجمة (*)، بما في ذلك الكود، المحافظات، ووصف الشخصية.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const response = await fetch("/api/brides/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...brideForm,
          age: parseInt(brideForm.age) || 0,
          height: parseInt(brideForm.height) || 0
        })
      });

      const result = await response.json();
      if (result.success) {
        setSubmitSuccess(true);
      } else {
        setErrorMsg(result.error || "حدث خطأ غير متوقع أثناء تسجيل البيانات.");
      }
    } catch (err) {
      setErrorMsg("فشل الاتصال بالخادم. يرجى التحقق من اتصال الشبكة.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- SUCCESS VIEW ---
  if (submitSuccess) {
    return (
      <div id="registration-success-screen" className="max-w-xl mx-auto px-4 py-20 text-center bg-wedding-pattern min-h-[70vh] flex flex-col justify-center items-center">
        <div className="w-20 h-20 bg-bento-medium/10 text-bento-primary rounded-full flex items-center justify-center mb-6 border border-bento-medium/20 animate-bounce">
          <ShieldCheck className="w-10 h-10" />
        </div>
        
        <h2 className="text-3xl font-display font-black text-bento-primary mb-4">
          تم استلام بياناتك بنجاح
        </h2>
        
        <p className="text-lg text-bento-primary font-bold mb-6 max-w-md leading-relaxed bg-white border border-bento-medium/20 p-4 rounded-3xl shadow-xs">
          &ldquo;تم استلام بياناتك بنجاح وسيتم مراجعتها من قبل إدارة الموقع.&rdquo;
        </p>

        <p className="text-sm text-bento-dark/75 mb-8 max-w-md leading-relaxed font-semibold">
          نود طمأنتك بأن بياناتك الشخصية وتفاصيل تواصلك بأمان تام وسرية حديدية، ولن تظهر للعامة أبداً. سيتواصل معك أحد مسؤولي الإدارة فور مطابقة طلبك وترشيحه مع طرف متوافق.
        </p>

        <div className="flex gap-4">
          <button
            id="back-home-success-btn"
            onClick={() => setView('home')}
            className="bg-bento-primary hover:bg-[#344227] text-white font-bold py-3.5 px-8 rounded-2xl text-sm transition-all shadow-md cursor-pointer"
          >
            العودة للرئيسية
          </button>
        </div>
      </div>
    );
  }

  // --- SELECTION VIEW ---
  if (regType === 'choose') {
    return (
      <div id="choose-type-screen" className="max-w-4xl mx-auto px-4 py-16 sm:py-24 bg-wedding-pattern min-h-[80vh] flex flex-col justify-center">
        
        <div className="text-center mb-12">
          <span className="inline-block bg-bento-medium/10 text-bento-primary border border-bento-medium/20 font-bold px-3.5 py-1.5 rounded-full text-xs mb-3">
            استمارة طلب الزواج الحلال
          </span>
          <h2 className="text-3xl font-display font-black text-bento-primary">
            يرجى تحديد نوع التسجيل للبدء
          </h2>
          <p className="text-bento-dark/70 text-sm mt-2 max-w-md mx-auto font-semibold">
            اختر الصفة المناسبة لملء النموذج المخصص لك بسرية تامة.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto w-full">
          {/* Groom Option Card */}
          <div 
            id="choose-groom-card"
            onClick={() => setRegType('groom')}
            className="group cursor-pointer bg-white border-2 border-bento-medium/20 hover:border-bento-primary rounded-3xl p-8 text-center shadow-xs hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between items-center"
          >
            <div className="w-16 h-16 bg-bento-medium/10 text-bento-primary rounded-full flex items-center justify-center mb-5 group-hover:scale-105 transition-transform border border-bento-medium/20">
              <User className="w-8 h-8" />
            </div>
            <h3 className="font-display font-bold text-xl text-bento-dark group-hover:text-bento-primary mb-2">أنا عريس</h3>
            <p className="text-bento-dark/70 text-sm leading-relaxed mb-6 font-semibold">
              سجل استمارة عريس لإدخال بياناتك السكنية والمهنية والدينية ومواصفات زوجة المستقبل المطلوبة.
            </p>
            <span className="bg-bento-medium/10 text-bento-primary font-bold px-5 py-2.5 rounded-xl text-xs group-hover:bg-bento-primary group-hover:text-white transition-all w-full">
              تعبئة طلب عريس
            </span>
          </div>

          {/* Bride Option Card */}
          <div 
            id="choose-bride-card"
            onClick={() => setRegType('bride')}
            className="group cursor-pointer bg-white border-2 border-bento-medium/20 hover:border-bento-medium rounded-3xl p-8 text-center shadow-xs hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between items-center"
          >
            <div className="w-16 h-16 bg-bento-medium/10 text-bento-primary rounded-full flex items-center justify-center mb-5 group-hover:scale-105 transition-transform border border-bento-medium/20">
              <Heart className="w-8 h-8 fill-bento-primary/10" />
            </div>
            <h3 className="font-display font-bold text-xl text-bento-dark group-hover:text-bento-primary mb-2">أنا عروسة</h3>
            <p className="text-bento-dark/70 text-sm leading-relaxed mb-6 font-semibold">
              سجلي استمارة عروسة لإدخال بياناتك ومواصفات زوج المستقبل المطلوب في كنف العفة والسرية التامة.
            </p>
            <span className="bg-bento-medium/10 text-bento-primary font-bold px-5 py-2.5 rounded-xl text-xs group-hover:bg-bento-primary group-hover:text-white transition-all w-full">
              تعبئة طلب عروسة
            </span>
          </div>
        </div>

        <button 
          onClick={() => setView('home')} 
          className="mt-12 text-sm font-semibold text-bento-dark/60 hover:text-bento-primary flex items-center gap-1.5 justify-center cursor-pointer"
        >
          <ArrowRight className="w-4 h-4" />
          العودة للرئيسية
        </button>
      </div>
    );
  }

  // --- FORM VIEWS ---
  return (
    <div id="registration-form-view" className="bg-wedding-pattern py-12 min-h-screen">
      <div className="max-w-3xl mx-auto px-4">
        
        {/* Header Breadcrumb */}
        <div className="mb-8 flex justify-between items-center">
          <button 
            id="form-back-to-selection"
            onClick={() => setRegType('choose')}
            className="text-bento-dark/60 hover:text-bento-primary text-sm font-bold flex items-center gap-1 cursor-pointer"
          >
            <ArrowRight className="w-4 h-4" />
            تغيير نوع التسجيل
          </button>
          
          <span className="text-xs text-bento-primary font-bold bg-white/80 border border-bento-medium/20 px-3.5 py-1.5 rounded-full">
            طلب توفيق شرعي - {regType === 'groom' ? 'استمارة عريس' : 'استمارة عروسة'}
          </span>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-3xl border border-bento-medium/20 shadow-xl overflow-hidden">
          
          {/* Form Banner */}
          <div className={`p-8 text-white ${regType === 'groom' ? 'bg-gradient-to-l from-bento-primary to-[#344227]' : 'bg-gradient-to-l from-bento-medium to-bento-primary'}`}>
            <div className="flex items-center gap-3 mb-2">
              {regType === 'groom' ? (
                <User className="w-7 h-7 text-bento-light" />
              ) : (
                <Heart className="w-7 h-7 text-bento-light fill-white/10" />
              )}
              <h1 className="text-2xl sm:text-3xl font-display font-black">
                {regType === 'groom' ? 'استمارة تسجيل العريس' : 'استمارة تسجيل العروسة'}
              </h1>
            </div>
            <p className="text-white/80 text-sm leading-relaxed max-w-2xl font-medium">
              يرجى إدخال البيانات المطلوبة بدقة وصدق تام. نؤكد لك مجدداً أن هذه البيانات تُعامل بمنتهى السرية والأمان، ولن يطلع عليها سوى الإدارة المخولة بالتوفيق والترشيح الشرعي.
            </p>
          </div>

          <div className="p-6 sm:p-10">
            {errorMsg && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm font-semibold flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {!hasConfirmedInstructions ? (
              <div id="instructions-alert-box" className="space-y-6">
                <div className="bg-amber-50/70 border border-amber-200 p-6 sm:p-8 rounded-3xl text-stone-800 shadow-xs">
                  <div className="flex items-center gap-3 mb-4 text-amber-700">
                    <span className="text-2xl">⚠️</span>
                    <h3 className="text-lg font-display font-black">تنبيه هام</h3>
                  </div>
                  
                  <p className="font-bold text-sm sm:text-base mb-4 leading-relaxed text-stone-900">
                    الرجاء كتابة جميع البيانات والتفاصيل المطلوبة بدقة وصدق، حيث إن أي استمارة تحتوي على بيانات ناقصة أو غير واضحة قد يتم تجاهلها أو رفضها من قبل إدارة الموقع.
                  </p>
                  
                  <p className="text-xs sm:text-sm leading-relaxed text-stone-600 font-bold">
                    كما يرجى التأكد من صحة جميع البيانات ووسيلة التواصل قبل إرسال الطلب، حيث سيتم الاعتماد عليها أثناء مراجعة الطلب وإجراءات التوفيق.
                  </p>
                </div>

                <div className="bg-stone-50 border border-stone-200 p-5 rounded-2xl flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="agree-instructions-checkbox"
                    checked={tempAgreedToInstructions}
                    onChange={(e) => setTempAgreedToInstructions(e.target.checked)}
                    className="mt-1 h-4 w-4 text-bento-primary border-stone-300 rounded focus:ring-bento-primary cursor-pointer"
                  />
                  <label htmlFor="agree-instructions-checkbox" className="text-xs sm:text-sm text-stone-700 font-bold select-none cursor-pointer leading-relaxed">
                    لقد قرأت التعليمات وأتعهد بأن جميع البيانات التي سأقوم بإدخالها صحيحة وكاملة.
                  </label>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (tempAgreedToInstructions) {
                        setHasConfirmedInstructions(true);
                      }
                    }}
                    disabled={!tempAgreedToInstructions}
                    className={`w-full sm:w-auto font-bold py-3.5 px-8 rounded-2xl text-sm transition-all shadow-md cursor-pointer text-center ${
                      tempAgreedToInstructions 
                        ? 'bg-bento-primary hover:bg-[#344227] text-white' 
                        : 'bg-stone-200 text-stone-400 cursor-not-allowed shadow-none'
                    }`}
                  >
                    المتابعة لتعبئة الاستمارة
                  </button>
                </div>
              </div>
            ) : null}

            {/* --- GROOM FORM --- */}
            {hasConfirmedInstructions && regType === 'groom' && (
              <form id="groom-registration-form" onSubmit={handleGroomSubmit} className="space-y-6">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* First Name */}
                  <div>
                    <label className="block text-xs font-black text-stone-700 mb-1.5 flex items-center gap-1">
                      الاسم الأول فقط (لمزيد من الخصوصية) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute right-3.5 top-3.5 text-stone-400 w-4 h-4" />
                      <input
                        type="text"
                        name="firstName"
                        required
                        placeholder="مثال: أحمد"
                        value={groomForm.firstName}
                        onChange={handleGroomChange}
                        className="w-full pl-4 pr-10 py-3 rounded-xl border border-stone-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none text-sm transition-all"
                      />
                    </div>
                  </div>

                  {/* Age */}
                  <div>
                    <label className="block text-xs font-black text-stone-700 mb-1.5 flex items-center gap-1">
                      السن (بالسنوات) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="absolute right-3.5 top-3.5 text-stone-400 w-4 h-4" />
                      <input
                        type="number"
                        name="age"
                        required
                        min="18"
                        max="80"
                        placeholder="مثال: ٢٩"
                        value={groomForm.age}
                        onChange={handleGroomChange}
                        className="w-full pl-4 pr-10 py-3 rounded-xl border border-stone-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none text-sm transition-all text-right"
                      />
                    </div>
                  </div>

                  {/* Origin Governorate */}
                  <div>
                    <label className="block text-xs font-black text-stone-700 mb-1.5">
                      المحافظة الأصلية (من أي محافظة أنت؟) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="absolute right-3.5 top-3.5 text-stone-400 w-4 h-4" />
                      <select
                        name="originGovernorate"
                        required
                        value={groomForm.originGovernorate}
                        onChange={handleGroomChange}
                        className="w-full pl-4 pr-10 py-3 rounded-xl border border-stone-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none text-sm transition-all appearance-none bg-white text-right"
                      >
                        <option value="">اختر المحافظة الأصلية...</option>
                        {GOVERNORATES.map((gov, i) => (
                          <option key={i} value={gov}>{gov}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute left-3.5 top-3.5 text-stone-400 w-4 h-4 pointer-events-none" />
                    </div>
                  </div>

                  {/* Origin City (only visible after choosing origin governorate) */}
                  {groomForm.originGovernorate && (
                    <div>
                      <label className="block text-xs font-black text-stone-700 mb-1.5">
                        المركز أو المدينة (التابعة للمحافظة الأصلية) <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <MapPin className="absolute right-3.5 top-3.5 text-stone-400 w-4 h-4" />
                        <input
                          type="text"
                          name="originCity"
                          required
                          placeholder="مثال: مركز دمنهور / مدينة طنطا"
                          value={groomForm.originCity}
                          onChange={handleGroomChange}
                          className="w-full pl-4 pr-10 py-3 rounded-xl border border-stone-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none text-sm transition-all"
                        />
                      </div>
                    </div>
                  )}

                  {/* Current Governorate */}
                  <div>
                    <label className="block text-xs font-black text-stone-700 mb-1.5">
                      ما هي المحافظة التي تقيم بها حاليًا؟ <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="absolute right-3.5 top-3.5 text-stone-400 w-4 h-4" />
                      <select
                        name="governorate"
                        required
                        value={groomForm.governorate}
                        onChange={handleGroomChange}
                        className="w-full pl-4 pr-10 py-3 rounded-xl border border-stone-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none text-sm transition-all appearance-none bg-white text-right"
                      >
                        <option value="">اختر محافظة الإقامة الحالية...</option>
                        {GOVERNORATES.map((gov, i) => (
                          <option key={i} value={gov}>{gov}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute left-3.5 top-3.5 text-stone-400 w-4 h-4 pointer-events-none" />
                    </div>
                  </div>

                  {/* Current City (only visible after choosing current governorate) */}
                  {groomForm.governorate && (
                    <div>
                      <label className="block text-xs font-black text-stone-700 mb-1.5">
                        المركز أو المدينة (التي تقيم بها حاليًا) <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <MapPin className="absolute right-3.5 top-3.5 text-stone-400 w-4 h-4" />
                        <input
                          type="text"
                          name="city"
                          required
                          placeholder="مثال: مصر الجديدة / الزقازيق"
                          value={groomForm.city}
                          onChange={handleGroomChange}
                          className="w-full pl-4 pr-10 py-3 rounded-xl border border-stone-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none text-sm transition-all"
                        />
                      </div>
                    </div>
                  )}

                  {/* Education */}
                  <div>
                    <label className="block text-xs font-black text-stone-700 mb-1.5">
                      المؤهل الدراسي <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <BookOpen className="absolute right-3.5 top-3.5 text-stone-400 w-4 h-4" />
                      <select
                        name="education"
                        required
                        value={groomForm.education}
                        onChange={handleGroomChange}
                        className="w-full pl-4 pr-10 py-3 rounded-xl border border-stone-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none text-sm transition-all appearance-none bg-white text-right"
                      >
                        <option value="">اختر المؤهل الدراسي...</option>
                        {EDUCATION_LEVELS.map((edu, i) => (
                          <option key={i} value={edu}>{edu}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute left-3.5 top-3.5 text-stone-400 w-4 h-4 pointer-events-none" />
                    </div>
                  </div>

                  {/* Job */}
                  <div>
                    <label className="block text-xs font-black text-stone-700 mb-1.5">
                      الوظيفة أو العمل بالتفصيل <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Briefcase className="absolute right-3.5 top-3.5 text-stone-400 w-4 h-4" />
                      <input
                        type="text"
                        name="job"
                        required
                        placeholder="مثال: مهندس برمجيات بشركة خاصة"
                        value={groomForm.job}
                        onChange={handleGroomChange}
                        className="w-full pl-4 pr-10 py-3 rounded-xl border border-stone-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none text-sm transition-all"
                      />
                    </div>
                  </div>

                  {/* Marital Status */}
                  <div>
                    <label className="block text-xs font-black text-stone-700 mb-1.5">
                      الحالة الاجتماعية <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Heart className="absolute right-3.5 top-3.5 text-stone-400 w-4 h-4" />
                      <select
                        name="maritalStatus"
                        required
                        value={groomForm.maritalStatus}
                        onChange={handleGroomChange}
                        className="w-full pl-4 pr-10 py-3 rounded-xl border border-stone-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none text-sm transition-all appearance-none bg-white text-right"
                      >
                        <option value="">اختر الحالة الاجتماعية...</option>
                        {MARITAL_STATUS_GROOM.map((st, i) => (
                          <option key={i} value={st}>{st}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute left-3.5 top-3.5 text-stone-400 w-4 h-4 pointer-events-none" />
                    </div>
                  </div>

                  {/* Financial Status */}
                  <div>
                    <label className="block text-xs font-black text-stone-700 mb-1.5">
                      الحالة المادية <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Briefcase className="absolute right-3.5 top-3.5 text-stone-400 w-4 h-4" />
                      <select
                        name="financialStatus"
                        required
                        value={groomForm.financialStatus}
                        onChange={handleGroomChange}
                        className="w-full pl-4 pr-10 py-3 rounded-xl border border-stone-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none text-sm transition-all appearance-none bg-white text-right"
                      >
                        <option value="">اختر الحالة المادية...</option>
                        {FINANCIAL_STATUS_OPTIONS.map((fi, i) => (
                          <option key={i} value={fi}>{fi}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute left-3.5 top-3.5 text-stone-400 w-4 h-4 pointer-events-none" />
                    </div>
                  </div>

                  {/* Height */}
                  <div>
                    <label className="block text-xs font-black text-stone-700 mb-1.5">
                      الطول (سم) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute right-3.5 top-3.5 text-stone-400 w-4 h-4" />
                      <input
                        type="number"
                        name="height"
                        required
                        min="100"
                        max="250"
                        placeholder="مثال: ١٧٨"
                        value={groomForm.height}
                        onChange={handleGroomChange}
                        className="w-full pl-4 pr-10 py-3 rounded-xl border border-stone-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none text-sm transition-all text-right"
                      />
                    </div>
                  </div>

                  {/* Smoking */}
                  <div>
                    <label className="block text-xs font-black text-stone-700 mb-1.5">
                      التدخين <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Info className="absolute right-3.5 top-3.5 text-stone-400 w-4 h-4" />
                      <select
                        name="smoking"
                        required
                        value={groomForm.smoking}
                        onChange={handleGroomChange}
                        className="w-full pl-4 pr-10 py-3 rounded-xl border border-stone-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none text-sm transition-all appearance-none bg-white text-right"
                      >
                        <option value="لا يدخن">لا يدخن</option>
                        <option value="يدخن">يدخن</option>
                        <option value="يدخن شيشة أو إلكتروني">يدخن شيشة أو إلكتروني</option>
                      </select>
                      <ChevronDown className="absolute left-3.5 top-3.5 text-stone-400 w-4 h-4 pointer-events-none" />
                    </div>
                  </div>

                  {/* Religiosity */}
                  <div>
                    <label className="block text-xs font-black text-stone-700 mb-1.5">
                      مستوى التدين والالتزام بالصلاة <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Info className="absolute right-3.5 top-3.5 text-stone-400 w-4 h-4" />
                      <select
                        name="religiosity"
                        required
                        value={groomForm.religiosity}
                        onChange={handleGroomChange}
                        className="w-full pl-4 pr-10 py-3 rounded-xl border border-stone-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none text-sm transition-all appearance-none bg-white text-right"
                      >
                        <option value="">اختر مستوى التدين...</option>
                        {RELIGIOSITY_OPTIONS.map((re, i) => (
                          <option key={i} value={re}>{re}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute left-3.5 top-3.5 text-stone-400 w-4 h-4 pointer-events-none" />
                    </div>
                  </div>

                  {/* Ready in 6 Months */}
                  <div>
                    <label className="block text-xs font-black text-stone-700 mb-1.5">
                      هل أنت جاهز للزواج خلال 6 أشهر؟ <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="absolute right-3.5 top-3.5 text-stone-400 w-4 h-4" />
                      <select
                        name="readyIn6Months"
                        required
                        value={groomForm.readyIn6Months}
                        onChange={handleGroomChange}
                        className="w-full pl-4 pr-10 py-3 rounded-xl border border-stone-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none text-sm transition-all appearance-none bg-white text-right"
                      >
                        <option value="نعم">نعم (جاهز ومستعد مادياً ومكاناً)</option>
                        <option value="خلال سنة">خلال سنة</option>
                        <option value="محتمل">محتمل (في طور التجهيز)</option>
                        <option value="لا">لا</option>
                      </select>
                      <ChevronDown className="absolute left-3.5 top-3.5 text-stone-400 w-4 h-4 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Self Description */}
                <div>
                  <label className="block text-xs font-black text-stone-700 mb-1.5 flex items-center gap-1">
                    تحدث عن نفسك <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute right-3.5 top-3.5 text-stone-400 w-4 h-4" />
                    <textarea
                      name="selfDescription"
                      required
                      rows={4}
                      maxLength={1000}
                      placeholder="اكتب نبذة مختصرة عن شخصيتك، واهتماماتك، وطريقة تفكيرك، وأسلوب حياتك، وأهم الصفات التي تميزك، وما الذي ترغب أن تعرفه عنك الزوجة المستقبلية."
                      value={groomForm.selfDescription}
                      onChange={handleGroomChange}
                      className="w-full pl-4 pr-10 py-3 rounded-xl border border-stone-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none text-sm transition-all resize-none text-right"
                    />
                  </div>
                  <p className="text-[10px] text-stone-500 mt-1.5 leading-relaxed font-bold">
                    اكتب نبذة مختصرة عن شخصيتك، واهتماماتك، وطريقة تفكيرك، وأسلوب حياتك، وأهم الصفات التي تميزك، وما الذي ترغب أن تعرفه عنك الزوجة المستقبلية.
                  </p>
                  <div className="text-left text-[10px] text-stone-400 font-bold mt-1">
                    {groomForm.selfDescription.length} / 1000 حرف
                  </div>
                </div>

                {/* Specs Required */}
                <div>
                  <label className="block text-xs font-black text-stone-700 mb-1.5">
                    مواصفات الزوجة المطلوبة بالتفصيل <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <MessageSquare className="absolute right-3.5 top-3.5 text-stone-400 w-4 h-4" />
                    <textarea
                      name="requiredSpecs"
                      required
                      rows={4}
                      placeholder="برجاء كتابة مواصفات الزوجة التي تتمناها بالتفصيل (مثل السن المفضل، مستوى التعليم، المظهر والزي، المحافظة، والسمات الشخصية)"
                      value={groomForm.requiredSpecs}
                      onChange={handleGroomChange}
                      className="w-full pl-4 pr-10 py-3 rounded-xl border border-stone-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none text-sm transition-all resize-none text-right"
                    />
                  </div>
                </div>

                {/* WhatsApp Number */}
                <div>
                  <label className="block text-xs font-black text-stone-700 mb-1.5 flex items-center gap-1">
                    رقم واتساب للتواصل (يظل سرياً تماماً وللإدارة فقط) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute right-3.5 top-3.5 text-bento-primary w-4 h-4" />
                    <input
                      type="text"
                      name="whatsapp"
                      required
                      placeholder="مثال: 01012345678"
                      value={groomForm.whatsapp}
                      onChange={handleGroomChange}
                      className="w-full pl-4 pr-10 py-3 rounded-xl border border-stone-200 focus:border-bento-primary focus:ring-1 focus:ring-bento-primary outline-none text-sm transition-all text-left font-mono"
                    />
                  </div>
                </div>

                {/* الكود */}
                <div>
                  <label className="block text-xs font-black text-stone-700 mb-1.5 flex items-center gap-1">
                    الكود <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute right-3.5 top-3.5 text-stone-400 font-bold text-xs">#</span>
                    <input
                      type="text"
                      name="adminCode"
                      required
                      placeholder="اكتب الكود هنا..."
                      value={groomForm.adminCode}
                      onChange={handleGroomChange}
                      className="w-full pl-4 pr-10 py-3 rounded-xl border border-stone-200 focus:border-bento-primary focus:ring-1 focus:ring-bento-primary outline-none text-sm transition-all"
                    />
                  </div>
                  <p className="text-[10px] text-stone-500 mt-1 font-bold">
                    اكتب الكود الذي استلمته من الإدارة.
                  </p>
                </div>

                {/* الصورة الشخصية */}
                <div>
                  <label className="block text-xs font-black text-stone-700 mb-1.5 flex items-center gap-1">
                    الصورة الشخصية (إجبارية للرجال) <span className="text-rose-500">*</span>
                  </label>
                  <div className="border-2 border-dashed border-stone-200 rounded-2xl p-5 text-center hover:border-bento-primary transition-all">
                    {groomForm.photo ? (
                      <div className="flex flex-col items-center gap-2">
                        <img src={groomPhotoPreview || groomForm.photo} alt="الصورة الشخصية" className="w-24 h-24 object-cover rounded-xl border border-stone-200 shadow-sm" />
                        <button
                          type="button"
                          onClick={() => {
                            setGroomForm(prev => ({ ...prev, photo: "" }));
                            if (groomPhotoPreview) URL.revokeObjectURL(groomPhotoPreview);
                            setGroomPhotoPreview("");
                            setUploadSuccessMsg("");
                          }}
                          className="text-xs text-rose-600 font-bold hover:underline"
                        >
                          حذف الصورة وتغييرها
                        </button>
                        {uploadSuccessMsg && (
                          <span className="text-xs text-emerald-600 font-bold">{uploadSuccessMsg}</span>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {isUploadingPhoto ? (
                          <div className="flex flex-col items-center justify-center gap-2">
                            <div className="w-6 h-6 border-2 border-stone-300 border-t-stone-700 rounded-full animate-spin"></div>
                            <p className="text-xs text-stone-600 font-bold">جاري رفع الصورة بأمان إلى السحابة...</p>
                          </div>
                        ) : (
                          <>
                            <p className="text-xs text-stone-500 font-semibold">اسحب صورة شخصية أو انقر للاختيار</p>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handlePhotoChange('groom', e)}
                              className="hidden"
                              id="groom-photo-upload"
                            />
                            <label
                              htmlFor="groom-photo-upload"
                              className="inline-block bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold px-4 py-2 rounded-xl cursor-pointer transition-all"
                            >
                              اختر ملف الصورة
                            </label>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] text-stone-500 mt-1.5 leading-relaxed font-bold">
                    تستخدم الصورة فقط للتحقق من الجدية ولا يتم مشاركة الصورة أو تبادلها إلا بعد الحصول على موافقة صاحب أو صاحبة الصورة.
                  </p>
                </div>

                {/* Additional Notes */}
                <div>
                  <label className="block text-xs font-black text-stone-700 mb-1.5">
                    ملاحظات إضافية (اختياري)
                  </label>
                  <div className="relative">
                    <MessageSquare className="absolute right-3.5 top-3.5 text-stone-400 w-4 h-4" />
                    <textarea
                      name="additionalNotes"
                      rows={3}
                      placeholder="مثال: معلومات عن تجهيز السكن، عملك، السفر، أو أي تفاصيل أخرى ترغب في ذكرها للإدارة."
                      value={groomForm.additionalNotes}
                      onChange={handleGroomChange}
                      className="w-full pl-4 pr-10 py-3 rounded-xl border border-stone-200 focus:border-bento-primary focus:ring-1 focus:ring-bento-primary outline-none text-sm transition-all resize-none text-right"
                    />
                  </div>
                </div>

                {/* Privacy agreement (required before submit) */}
                <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200/60 space-y-3">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="agreed-privacy-groom"
                      required
                      checked={agreedToPrivacy}
                      onChange={(e) => setAgreedToPrivacy(e.target.checked)}
                      className="mt-1 accent-bento-primary w-4.5 h-4.5 cursor-pointer"
                    />
                    <label htmlFor="agreed-privacy-groom" className="text-xs text-stone-600 leading-relaxed cursor-pointer font-medium select-none">
                      أوافق على <a href="#terms" target="_blank" className="text-bento-primary font-bold underline">شروط الاستخدام</a> و <a href="#terms" target="_blank" className="text-bento-primary font-bold underline">سياسة الخصوصية</a> لموقع مودة ورحمة، وأتعهد تحت طائلة الدين والمسؤولية الأخلاقية بصدق وجدية كافة البيانات المكتوبة في هذه الاستمارة.
                    </label>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-bento-primary hover:bg-[#344227] text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm disabled:bg-stone-400 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin block" />
                      جاري إرسال البيانات...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      إرسال وتأكيد الطلب كعريس
                    </>
                  )}
                </button>

              </form>
            )}

            {/* --- BRIDE FORM --- */}
            {hasConfirmedInstructions && regType === 'bride' && (
              <form id="bride-registration-form" onSubmit={handleBrideSubmit} className="space-y-6">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* First Name */}
                  <div>
                    <label className="block text-xs font-black text-stone-700 mb-1.5 flex items-center gap-1">
                      الاسم الأول فقط (لمزيد من الخصوصية) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute right-3.5 top-3.5 text-stone-400 w-4 h-4" />
                      <input
                        type="text"
                        name="firstName"
                        required
                        placeholder="مثال: فاطمة"
                        value={brideForm.firstName}
                        onChange={handleBrideChange}
                        className="w-full pl-4 pr-10 py-3 rounded-xl border border-stone-200 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none text-sm transition-all"
                      />
                    </div>
                  </div>

                  {/* Age */}
                  <div>
                    <label className="block text-xs font-black text-stone-700 mb-1.5 flex items-center gap-1">
                      السن <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="absolute right-3.5 top-3.5 text-stone-400 w-4 h-4" />
                      <input
                        type="number"
                        name="age"
                        required
                        min="18"
                        max="80"
                        placeholder="مثال: ٢٤"
                        value={brideForm.age}
                        onChange={handleBrideChange}
                        className="w-full pl-4 pr-10 py-3 rounded-xl border border-stone-200 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none text-sm transition-all text-right"
                      />
                    </div>
                  </div>

                  {/* Origin Governorate */}
                  <div>
                    <label className="block text-xs font-black text-stone-700 mb-1.5">
                      المحافظة الأصلية (من أي محافظة أنتِ؟) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="absolute right-3.5 top-3.5 text-stone-400 w-4 h-4" />
                      <select
                        name="originGovernorate"
                        required
                        value={brideForm.originGovernorate}
                        onChange={handleBrideChange}
                        className="w-full pl-4 pr-10 py-3 rounded-xl border border-stone-200 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none text-sm transition-all appearance-none bg-white text-right"
                      >
                        <option value="">اختر المحافظة الأصلية...</option>
                        {GOVERNORATES.map((gov, i) => (
                          <option key={i} value={gov}>{gov}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute left-3.5 top-3.5 text-stone-400 w-4 h-4 pointer-events-none" />
                    </div>
                  </div>

                  {/* Origin City (only visible after choosing origin governorate) */}
                  {brideForm.originGovernorate && (
                    <div>
                      <label className="block text-xs font-black text-stone-700 mb-1.5">
                        المركز أو المدينة (التابعة للمحافظة الأصلية) <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <MapPin className="absolute right-3.5 top-3.5 text-stone-400 w-4 h-4" />
                        <input
                          type="text"
                          name="originCity"
                          required
                          placeholder="مثال: مركز دمنهور / مدينة طنطا"
                          value={brideForm.originCity}
                          onChange={handleBrideChange}
                          className="w-full pl-4 pr-10 py-3 rounded-xl border border-stone-200 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none text-sm transition-all"
                        />
                      </div>
                    </div>
                  )}

                  {/* Current Governorate */}
                  <div>
                    <label className="block text-xs font-black text-stone-700 mb-1.5">
                      ما هي المحافظة التي تقيمين بها حاليًا؟ <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="absolute right-3.5 top-3.5 text-stone-400 w-4 h-4" />
                      <select
                        name="governorate"
                        required
                        value={brideForm.governorate}
                        onChange={handleBrideChange}
                        className="w-full pl-4 pr-10 py-3 rounded-xl border border-stone-200 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none text-sm transition-all appearance-none bg-white text-right"
                      >
                        <option value="">اختر محافظة الإقامة الحالية...</option>
                        {GOVERNORATES.map((gov, i) => (
                          <option key={i} value={gov}>{gov}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute left-3.5 top-3.5 text-stone-400 w-4 h-4 pointer-events-none" />
                    </div>
                  </div>

                  {/* Current City (only visible after choosing current governorate) */}
                  {brideForm.governorate && (
                    <div>
                      <label className="block text-xs font-black text-stone-700 mb-1.5">
                        المركز أو المدينة (التي تقيمين بها حاليًا) <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <MapPin className="absolute right-3.5 top-3.5 text-stone-400 w-4 h-4" />
                        <input
                          type="text"
                          name="city"
                          required
                          placeholder="مثال: مدينة نصر / المعادي"
                          value={brideForm.city}
                          onChange={handleBrideChange}
                          className="w-full pl-4 pr-10 py-3 rounded-xl border border-stone-200 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none text-sm transition-all"
                        />
                      </div>
                    </div>
                  )}

                  {/* Education */}
                  <div>
                    <label className="block text-xs font-black text-stone-700 mb-1.5">
                      المؤهل الدراسي <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <BookOpen className="absolute right-3.5 top-3.5 text-stone-400 w-4 h-4" />
                      <select
                        name="education"
                        required
                        value={brideForm.education}
                        onChange={handleBrideChange}
                        className="w-full pl-4 pr-10 py-3 rounded-xl border border-stone-200 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none text-sm transition-all appearance-none bg-white text-right"
                      >
                        <option value="">اختر المؤهل الدراسي...</option>
                        {EDUCATION_LEVELS.map((edu, i) => (
                          <option key={i} value={edu}>{edu}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute left-3.5 top-3.5 text-stone-400 w-4 h-4 pointer-events-none" />
                    </div>
                  </div>

                  {/* Job */}
                  <div>
                    <label className="block text-xs font-black text-stone-700 mb-1.5">
                      الوظيفة أو العمل بالتفصيل (أو ربة منزل) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Briefcase className="absolute right-3.5 top-3.5 text-stone-400 w-4 h-4" />
                      <input
                        type="text"
                        name="job"
                        required
                        placeholder="مثال: طبيبة أسنان / لا أعمل"
                        value={brideForm.job}
                        onChange={handleBrideChange}
                        className="w-full pl-4 pr-10 py-3 rounded-xl border border-stone-200 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none text-sm transition-all"
                      />
                    </div>
                  </div>

                  {/* Marital Status */}
                  <div>
                    <label className="block text-xs font-black text-stone-700 mb-1.5">
                      الحالة الاجتماعية <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Heart className="absolute right-3.5 top-3.5 text-stone-400 w-4 h-4" />
                      <select
                        name="maritalStatus"
                        required
                        value={brideForm.maritalStatus}
                        onChange={handleBrideChange}
                        className="w-full pl-4 pr-10 py-3 rounded-xl border border-stone-200 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none text-sm transition-all appearance-none bg-white text-right"
                      >
                        <option value="">اختر الحالة الاجتماعية...</option>
                        {MARITAL_STATUS_BRIDE.map((st, i) => (
                          <option key={i} value={st}>{st}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute left-3.5 top-3.5 text-stone-400 w-4 h-4 pointer-events-none" />
                    </div>
                  </div>

                  {/* Height */}
                  <div>
                    <label className="block text-xs font-black text-stone-700 mb-1.5">
                      الطول (سم) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute right-3.5 top-3.5 text-stone-400 w-4 h-4" />
                      <input
                        type="number"
                        name="height"
                        required
                        min="100"
                        max="250"
                        placeholder="مثال: ١٦٢"
                        value={brideForm.height}
                        onChange={handleBrideChange}
                        className="w-full pl-4 pr-10 py-3 rounded-xl border border-stone-200 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none text-sm transition-all text-right"
                      />
                    </div>
                  </div>

                  {/* Religiosity */}
                  <div>
                    <label className="block text-xs font-black text-stone-700 mb-1.5">
                      مستوى التدين والزي الشرعي <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Info className="absolute right-3.5 top-3.5 text-stone-400 w-4 h-4" />
                      <select
                        name="religiosity"
                        required
                        value={brideForm.religiosity}
                        onChange={handleBrideChange}
                        className="w-full pl-4 pr-10 py-3 rounded-xl border border-stone-200 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none text-sm transition-all appearance-none bg-white text-right"
                      >
                        <option value="">اختر مستوى التدين والزي...</option>
                        <option value="ملتزمة جداً (منتقبة / خمار بالفرائض والسنن)">ملتزمة جداً (منتقبة / خمار بالفرائض والسنن)</option>
                        <option value="ملتزمة (محجبة حجاب شرعي هادئ)">ملتزمة (محجبة حجاب شرعي هادئ)</option>
                        <option value="متوسطة التدين (محجبة)">متوسطة التدين (محجبة)</option>
                        <option value="غير محجبة وتتمنى الهداية">غير محجبة وتتمنى الهداية</option>
                      </select>
                      <ChevronDown className="absolute left-3.5 top-3.5 text-stone-400 w-4 h-4 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Self Description */}
                <div>
                  <label className="block text-xs font-black text-stone-700 mb-1.5 flex items-center gap-1">
                    حدثينا عن نفسك <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute right-3.5 top-3.5 text-stone-400 w-4 h-4" />
                    <textarea
                      name="selfDescription"
                      required
                      rows={4}
                      maxLength={1000}
                      placeholder="اكتبي نبذة مختصرة عن شخصيتك، واهتماماتك، وطريقة تفكيرك، وما ترغبين أن يعرفه الطرف الآخر عنك."
                      value={brideForm.selfDescription}
                      onChange={handleBrideChange}
                      className="w-full pl-4 pr-10 py-3 rounded-xl border border-stone-200 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none text-sm transition-all resize-none text-right"
                    />
                  </div>
                  <p className="text-[10px] text-stone-500 mt-1.5 leading-relaxed font-bold">
                    اكتبي نبذة مختصرة عن شخصيتك، واهتماماتك، وطريقة تفكيرك، وما ترغبين أن يعرفه الطرف الآخر عنك.
                  </p>
                  <div className="text-left text-[10px] text-stone-400 font-bold mt-1">
                    {brideForm.selfDescription.length} / 1000 حرف
                  </div>
                </div>

                {/* Specs Required */}
                <div>
                  <label className="block text-xs font-black text-stone-700 mb-1.5">
                    مواصفات الزوج المطلوب بالتفصيل <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <MessageSquare className="absolute right-3.5 top-3.5 text-stone-400 w-4 h-4" />
                    <textarea
                      name="requiredSpecs"
                      required
                      rows={4}
                      placeholder="برجاء كتابة مواصفات زوج المستقبل الذي تتمنينه بالتفصيل (مثل السن المفضل، مستوى التعليم، المهنة المرجوة، مستوى التدين، وهل يشترط السكن في نفس المحافظة؟)"
                      value={brideForm.requiredSpecs}
                      onChange={handleBrideChange}
                      className="w-full pl-4 pr-10 py-3 rounded-xl border border-stone-200 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none text-sm transition-all resize-none text-right"
                    />
                  </div>
                </div>

                {/* Contact Method & Details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-xs font-black text-stone-700 mb-1.5">
                      وسيلة التواصل المفضلة <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute right-3.5 top-3.5 text-stone-400 w-4 h-4" />
                      <select
                        name="contactMethod"
                        required
                        value={brideForm.contactMethod}
                        onChange={handleBrideChange}
                        className="w-full pl-4 pr-10 py-3 rounded-xl border border-stone-200 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none text-sm transition-all appearance-none bg-white text-right"
                      >
                        <option value="واتساب">واتساب (أو رقم الهاتف)</option>
                        <option value="فيسبوك">رابط حساب فيسبوك</option>
                        <option value="واتساب الولي">واتساب الولي مباشرة</option>
                      </select>
                      <ChevronDown className="absolute left-3.5 top-3.5 text-stone-400 w-4 h-4 pointer-events-none" />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-black text-stone-700 mb-1.5">
                      بيانات التواصل بالتفصيل (تظل سرية تماماً وللإدارة فقط) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <FileText className="absolute right-3.5 top-3.5 text-stone-400 w-4 h-4" />
                      <input
                        type="text"
                        name="contactDetails"
                        required
                        placeholder={brideForm.contactMethod === "واتساب" || brideForm.contactMethod === "واتساب الولي" ? "مثال: 01012345678 (رقم الولي المفضل)" : "مثال: facebook.com/profile.username"}
                        value={brideForm.contactDetails}
                        onChange={handleBrideChange}
                        className="w-full pl-4 pr-10 py-3 rounded-xl border border-stone-200 focus:border-bento-medium focus:ring-1 focus:ring-bento-medium outline-none text-sm transition-all text-left font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* الكود */}
                <div>
                  <label className="block text-xs font-black text-stone-700 mb-1.5 flex items-center gap-1">
                    الكود <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute right-3.5 top-3.5 text-stone-400 font-bold text-xs">#</span>
                    <input
                      type="text"
                      name="adminCode"
                      required
                      placeholder="اكتب الكود هنا..."
                      value={brideForm.adminCode}
                      onChange={handleBrideChange}
                      className="w-full pl-4 pr-10 py-3 rounded-xl border border-stone-200 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none text-sm transition-all"
                    />
                  </div>
                  <p className="text-[10px] text-stone-500 mt-1 font-bold">
                    اكتب الكود الذي استلمته من الإدارة.
                  </p>
                </div>

                {/* الصورة الشخصية */}
                <div>
                  <label className="block text-xs font-black text-stone-700 mb-1.5 flex items-center gap-1">
                    الصورة الشخصية (اختيارية للسيدات)
                  </label>
                  <div className="border-2 border-dashed border-stone-200 rounded-2xl p-5 text-center hover:border-rose-500 transition-all">
                    {brideForm.photo ? (
                      <div className="flex flex-col items-center gap-2">
                        <img src={bridePhotoPreview || brideForm.photo} alt="الصورة الشخصية" className="w-24 h-24 object-cover rounded-xl border border-stone-200 shadow-sm" />
                        <button
                          type="button"
                          onClick={() => {
                            setBrideForm(prev => ({ ...prev, photo: "" }));
                            if (bridePhotoPreview) URL.revokeObjectURL(bridePhotoPreview);
                            setBridePhotoPreview("");
                            setUploadSuccessMsg("");
                          }}
                          className="text-xs text-rose-600 font-bold hover:underline"
                        >
                          حذف الصورة وتغييرها
                        </button>
                        {uploadSuccessMsg && (
                          <span className="text-xs text-emerald-600 font-bold">{uploadSuccessMsg}</span>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {isUploadingPhoto ? (
                          <div className="flex flex-col items-center justify-center gap-2">
                            <div className="w-6 h-6 border-2 border-stone-300 border-t-rose-500 rounded-full animate-spin"></div>
                            <p className="text-xs text-stone-600 font-bold">جاري رفع الصورة بأمان إلى السحابة...</p>
                          </div>
                        ) : (
                          <>
                            <p className="text-xs text-stone-500 font-semibold">اسحبي صورة شخصية أو انقري للاختيار</p>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handlePhotoChange('bride', e)}
                              className="hidden"
                              id="bride-photo-upload"
                            />
                            <label
                              htmlFor="bride-photo-upload"
                              className="inline-block bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold px-4 py-2 rounded-xl cursor-pointer transition-all"
                            >
                              اختر ملف الصورة
                            </label>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] text-stone-500 mt-1.5 leading-relaxed font-bold">
                    تستخدم الصورة فقط للتحقق من الجدية ولا يتم مشاركة الصورة أو تبادلها إلا بعد الحصول على موافقة صاحب أو صاحبة الصورة.
                  </p>
                </div>

                {/* Additional Notes */}
                <div>
                  <label className="block text-xs font-black text-stone-700 mb-1.5">
                    ملاحظات إضافية (اختياري)
                  </label>
                  <div className="relative">
                    <MessageSquare className="absolute right-3.5 top-3.5 text-stone-400 w-4 h-4" />
                    <textarea
                      name="additionalNotes"
                      rows={3}
                      placeholder="مثال: أي مواصفات أو تفاصيل أخرى ترغبين في توضيحها لمشرفي الموقع."
                      value={brideForm.additionalNotes}
                      onChange={handleBrideChange}
                      className="w-full pl-4 pr-10 py-3 rounded-xl border border-stone-200 focus:border-bento-medium focus:ring-1 focus:ring-bento-medium outline-none text-sm transition-all resize-none text-right"
                    />
                  </div>
                </div>

                {/* Privacy agreement */}
                <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200/60 space-y-3">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="agreed-privacy-bride"
                      required
                      checked={agreedToPrivacy}
                      onChange={(e) => setAgreedToPrivacy(e.target.checked)}
                      className="mt-1 accent-bento-primary w-4.5 h-4.5 cursor-pointer"
                    />
                    <label htmlFor="agreed-privacy-bride" className="text-xs text-stone-600 leading-relaxed cursor-pointer font-medium select-none">
                      أوافق على <a href="#terms" target="_blank" className="text-bento-primary font-bold underline">شروط الاستخدام</a> و <a href="#terms" target="_blank" className="text-bento-primary font-bold underline">سياسة الخصوصية</a> لموقع مودة ورحمة، وأتعهد تحت طائلة الدين والمسؤولية الأخلاقية بصدق وجدية كافة البيانات المكتبوبة في هذه الاستمارة.
                    </label>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-bento-primary hover:bg-[#344227] text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm disabled:bg-stone-400 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin block" />
                      جاري إرسال البيانات...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      إرسال وتأكيد الطلب كعروسة
                    </>
                  )}
                </button>

              </form>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
