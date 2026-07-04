/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Heart, UserPlus, ShieldAlert, Sparkles, ClipboardCheck, MessageCircleHeart, Users, Lock, ChevronDown, CheckCircle, ShieldCheck } from "lucide-react";
import ArticlesSection from "./ArticlesSection";

interface HomeViewProps {
  onRegisterClick: (type: 'groom' | 'bride' | 'choose') => void;
  onAdminClick: () => void;
}

export default function HomeView({ onRegisterClick, onAdminClick }: HomeViewProps) {
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy'>('terms');

  return (
    <div id="home-view" className="bg-wedding-pattern min-h-screen">
      
      {/* Bento Grid Main Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:grid-rows-6">
          
          {/* Card 1: Hero Block */}
          <section className="lg:col-span-7 lg:row-span-4 bg-white rounded-3xl p-6 sm:p-10 border border-bento-medium/20 shadow-xs flex flex-col justify-center relative overflow-hidden">
            <div className="absolute top-[-50px] left-[-50px] w-64 h-64 bg-bento-light/30 rounded-full blur-3xl"></div>
            
            <div className="inline-flex items-center gap-2 bg-bento-medium/10 text-bento-primary border border-bento-medium/20 px-4 py-1.5 rounded-full text-xs font-bold mb-6 w-fit relative z-10">
              <Sparkles className="w-4 h-4 text-bento-primary animate-pulse" />
              <span>طلب الحلال والزواج الشرعي في إطار من السرية والأمان</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black text-bento-dark mb-4 leading-tight relative z-10">
              بداية جديدة لحياة <span className="text-bento-primary">مليئة بالمودة</span> والسكينة
            </h1>

            <p className="text-base sm:text-lg text-bento-dark/80 mb-8 max-w-lg leading-relaxed relative z-10 font-medium">
              نحن نؤمن بأن الزواج رحلة مقدسة. نوفر لك منصة آمنة وسرية تماماً للبحث عن شريك الحياة المناسب وفق معاييرك الخاصة، بإشراف إداري دقيق لضمان المصداقية.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 relative z-10">
              <button
                id="register-groom-hero-btn"
                onClick={() => onRegisterClick('groom')}
                className="bg-bento-primary text-white px-8 py-4 rounded-2xl font-bold text-lg hover:scale-102 active:scale-98 transition-transform shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                <span>أنا عريس (أبحث عن زوجة)</span>
              </button>
              <button
                id="register-bride-hero-btn"
                onClick={() => onRegisterClick('bride')}
                className="bg-white border-2 border-bento-primary text-bento-primary px-8 py-4 rounded-2xl font-bold text-lg hover:bg-bento-medium/10 hover:scale-102 active:scale-98 transition-transform cursor-pointer flex items-center justify-center gap-2"
              >
                <span>أنا عروسة (أبحث عن زوج)</span>
              </button>
            </div>
          </section>

          {/* Card 2: Stats Block */}
          <section className="lg:col-span-5 lg:row-span-2 bg-bento-primary rounded-3xl p-6 text-white flex flex-col justify-between shadow-xl">
            <div className="flex justify-between items-start">
              <span className="text-xs uppercase tracking-widest opacity-80 font-bold">إحصائيات المنصة</span>
              <div className="bg-white/20 p-2 rounded-lg text-sm font-bold">📊</div>
            </div>
            <div className="grid grid-cols-2 gap-4 my-4">
              <div className="text-center border-l border-white/20">
                <span className="block text-3xl font-extrabold">١,٤٢٠</span>
                <span className="text-xs opacity-80 font-medium">عريس مسجل</span>
              </div>
              <div className="text-center">
                <span className="block text-3xl font-extrabold">١,٦٨٥</span>
                <span className="text-xs opacity-80 font-medium">عروسة مسجلة</span>
              </div>
            </div>
            <div className="bg-white/10 p-3 rounded-xl flex items-center justify-between text-xs font-semibold">
              <p>الأكثر تواجداً: القاهرة، الإسكندرية، المنصورة</p>
              <span className="bg-bento-light/20 text-bento-light px-2 py-0.5 rounded-full">+١٥ اليوم</span>
            </div>
          </section>

          {/* Card 3: How it Works Block */}
          <section id="how-it-works" className="lg:col-span-5 lg:row-span-2 bg-bento-medium rounded-3xl p-6 text-white flex flex-col justify-between shadow-lg">
            <h3 className="font-bold text-xl mb-3 font-display">كيف يعمل الموقع؟</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm font-semibold">
                <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs">١</span>
                سجل بياناتك بدقة وسرية تامة
              </li>
              <li className="flex items-center gap-3 text-sm font-semibold">
                <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs">٢</span>
                تقوم الإدارة بمراجعة الملف وتفعيله
              </li>
              <li className="flex items-center gap-3 text-sm font-semibold">
                <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs">٣</span>
                يتم ترشيح التوافقات المناسبة لك
              </li>
            </ul>
            <div className="text-[11px] opacity-80 mt-2 font-medium">
              * المراجعة يدوية وإدارية لحفظ جودة المنصة والجدية
            </div>
          </section>

          {/* Card 4: Recent Articles / Tips Quick Links */}
          <section className="lg:col-span-3 lg:row-span-2 bg-bento-light rounded-3xl p-6 border border-bento-medium/20 shadow-sm flex flex-col justify-between gap-3 text-bento-primary">
            <div className="flex items-center justify-between">
              <h4 className="font-bold font-display text-bento-primary text-sm">أحدث الإرشادات</h4>
              <span className="text-[10px] bg-bento-primary text-white px-2.5 py-0.5 rounded-full font-bold">جديد</span>
            </div>
            <div className="space-y-2 flex-1 flex flex-col justify-center">
              <a href="#articles" className="text-xs font-bold text-bento-dark hover:underline cursor-pointer block leading-snug">
                • أسس الاختيار الناجح لشريك الحياة
              </a>
              <a href="#articles" className="text-xs font-bold text-bento-dark hover:underline cursor-pointer block leading-snug">
                • كيف تستعد لمرحلة الخطوبة؟
              </a>
              <a href="#articles" className="text-xs font-bold text-bento-dark hover:underline cursor-pointer block leading-snug">
                • أهمية الصراحة في جلسة التعارف الأولى
              </a>
            </div>
            <div className="text-[11px] font-bold opacity-80 text-bento-primary">
              مستوحاة من أخصائيين
            </div>
          </section>

          {/* Card 5: Security Callout */}
          <section className="lg:col-span-6 lg:row-span-2 bg-white rounded-3xl p-6 border border-bento-medium/20 shadow-sm flex flex-col sm:flex-row items-center gap-6">
            <div className="w-20 h-20 bg-bento-bg rounded-2xl border-2 border-bento-medium/30 flex-shrink-0 flex items-center justify-center text-4xl shadow-xs">
              🛡️
            </div>
            <div>
              <h4 className="font-bold text-bento-primary text-lg mb-1 font-display">الخصوصية والأمان الصارم</h4>
              <p className="text-xs text-bento-dark/85 leading-relaxed font-medium">
                بياناتك الشخصية ووسائل التواصل متاحة فقط لإدارة الموقع ولا تظهر لأي مستخدم آخر على الإطلاق. نحن نحمي خصوصيتك كأنها خصوصيتنا لبناء بيوت يملؤها الوقار والسكينة.
              </p>
            </div>
          </section>

          {/* Card 6: Love Counter */}
          <section className="lg:col-span-3 lg:row-span-2 bg-bento-primary rounded-3xl p-6 text-white flex flex-col items-center justify-center text-center gap-2 shadow-lg">
            <div className="text-3xl">💍</div>
            <div className="text-2xl font-black leading-none">٢٤٥</div>
            <div className="text-xs opacity-90 font-bold uppercase tracking-tighter">حالة زواج تمت عبرنا</div>
            <div className="mt-2 w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div className="w-3/4 h-full bg-bento-light"></div>
            </div>
          </section>

        </div>
      </div>

      {/* Articles Section (مقالات ونصائح) */}
      <ArticlesSection />

      {/* Terms and Privacy Section (الشروط والخصوصية) */}
      <section id="terms" className="py-20 bg-bento-bg border-t border-bento-medium/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-bento-primary">
              الشروط وسياسة الخصوصية
            </h2>
            <p className="text-sm text-bento-dark/70 mt-2 font-medium">
              يرجى قراءة الشروط والخصوصية بعناية قبل المتابعة في ملء طلب التسجيل.
            </p>
          </div>

          {/* Tab Selector */}
          <div className="flex border-b border-bento-medium/35 mb-8">
            <button
              onClick={() => setActiveTab('terms')}
              className={`flex-1 text-center py-4 text-sm font-bold border-b-2 transition-all cursor-pointer ${activeTab === 'terms' ? 'border-bento-primary text-bento-primary' : 'border-transparent text-bento-medium hover:text-bento-primary'}`}
            >
              شروط الاستخدام
            </button>
            <button
              onClick={() => setActiveTab('privacy')}
              className={`flex-1 text-center py-4 text-sm font-bold border-b-2 transition-all cursor-pointer ${activeTab === 'privacy' ? 'border-bento-primary text-bento-primary' : 'border-transparent text-bento-medium hover:text-bento-primary'}`}
            >
              سياسة الخصوصية
            </button>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-bento-medium/20 shadow-xs leading-relaxed text-sm text-bento-dark/80 space-y-4 font-medium">
            {activeTab === 'terms' ? (
              <>
                <p className="font-extrabold text-bento-primary text-base mb-4">شروط التسجيل والاستخدام في خطوة للزواج الرسمي:</p>
                <div className="space-y-3">
                  <div className="flex gap-2.5">
                    <span className="font-bold text-bento-primary">١.</span>
                    <p>يجب ألا يقل عمر المشترك عن ١٨ عاماً عند التسجيل، ويجب تقديم البيانات بصدق وشفافية كاملة.</p>
                  </div>
                  <div className="flex gap-2.5">
                    <span className="font-bold text-bento-primary">٢.</span>
                    <p>الموقع مخصص فقط لمن يسعى للزواج الشرعي الرسمي، ويمنع تماماً استخدام الموقع بغرض التسلية أو التعارف غير الجاد.</p>
                  </div>
                  <div className="flex gap-2.5">
                    <span className="font-bold text-bento-primary">٣.</span>
                    <p>يحظر تقديم بيانات شخصية وهمية أو انتحال صفة الآخرين، وفي حال ثبت ذلك يحق للإدارة شطب الملف واتخاذ الإجراءات اللازمة.</p>
                  </div>
                  <div className="flex gap-2.5">
                    <span className="font-bold text-bento-primary">٤.</span>
                    <p>تقوم الإدارة بمراجعة الملفات وترشيح المتوافقين وفقاً لتقدير المشرفين والبيانات المتاحة.</p>
                  </div>
                  <div className="flex gap-2.5">
                    <span className="font-bold text-bento-primary">٥.</span>
                    <p>بإرسال بياناتك، فإنك تفوض الإدارة بالاحتفاظ بها في قواعد البيانات ومطابقتها يدوياً مع الملفات المقابلة.</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <p className="font-extrabold text-bento-primary text-base mb-4">سياسة حماية البيانات والخصوصية:</p>
                <div className="space-y-3">
                  <div className="flex gap-2.5">
                    <span className="font-bold text-bento-primary">●</span>
                    <p><strong>سرية تامة للملف الشخصي:</strong> لا يمكن لأي زائر للموقع أو عضو مسجل آخر رؤية ملفك الشخصي أو معرفة بياناتك على الإطلاق.</p>
                  </div>
                  <div className="flex gap-2.5">
                    <span className="font-bold text-bento-primary">●</span>
                    <p><strong>وسائل التواصل بأمان:</strong> وسائل التواصل الخاصة بك (رقم واتساب، فيسبوك) تظل سرية ومحفوظة لدى الإدارة ولا يتم منحها لأي شخص إلا بموافقة مسبقة وعند وجود توافق وترشيح رسمي من المشرفين.</p>
                  </div>
                  <div className="flex gap-2.5">
                    <span className="font-bold text-bento-primary">●</span>
                    <p><strong>التزام الإدارة:</strong> نحن في خطوة للزواج الرسمي نتعهد بعدم بيع أو مشاركة بياناتك مع أي طرف ثالث لأي أغراض تجارية أو تسويقية.</p>
                  </div>
                  <div className="flex gap-2.5">
                    <span className="font-bold text-bento-primary">●</span>
                    <p><strong>تعديل أو حذف البيانات:</strong> يمكنك في أي وقت طلب تعديل بياناتك أو حذفها بالكامل من قاعدة بياناتنا من خلال مراجعة الإدارة وسنقوم بالاستجابة الفورية لطلبك.</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner (Styled as a Bento Card) */}
      <section className="max-w-7xl mx-auto px-4 my-12">
        <div className="bg-white border border-bento-medium/20 rounded-3xl py-16 px-6 text-center relative overflow-hidden shadow-xs">
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-bento-light/20 rounded-full blur-2xl"></div>
          <Heart className="w-12 h-12 text-bento-primary fill-bento-primary/10 mx-auto mb-4" />
          <h2 className="text-2xl sm:text-3xl font-display font-black text-bento-primary">هل أنت جاهز لبدء رحلة التوفيق المباركة؟</h2>
          <p className="text-bento-dark/80 text-sm sm:text-base mt-3 max-w-xl mx-auto leading-relaxed font-semibold">
            اضغط على الزر المناسب بالأسفل لملء بيانات الاستمارة الخاصة بك وسنتولى نحن بقية الخطوات بكل أمان وسرية.
          </p>
          
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto relative z-10">
            <button
              id="bottom-register-groom-btn"
              onClick={() => onRegisterClick('groom')}
              className="w-full sm:w-1/2 bg-bento-primary hover:bg-[#344227] text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-md hover:scale-102 active:scale-98 cursor-pointer"
            >
              سجل كعريس
            </button>
            <button
              id="bottom-register-bride-btn"
              onClick={() => onRegisterClick('bride')}
              className="w-full sm:w-1/2 bg-bento-light hover:bg-bento-medium/20 text-bento-primary border-2 border-bento-primary font-bold py-4 px-6 rounded-2xl transition-all hover:scale-102 active:scale-98 cursor-pointer"
            >
              سجلي كعروسة
            </button>
          </div>
        </div>
      </section>

      {/* Footer (Warm Elegant Theme) */}
      <footer className="bg-bento-primary text-white py-12 text-center text-xs font-semibold border-t border-bento-medium/30 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 space-y-3">
          <p className="font-display font-extrabold text-white text-base">موقع خطوة للزواج الرسمي للتيسير وبناء الأسر المسلمة © ٢٠٢٦</p>
          <p className="opacity-90 max-w-lg mx-auto leading-relaxed">منصة متكاملة ومحمية بخصوصية صارمة للتوفيق وبناء الأسرة الصالحة على أسس المودة والرحمة.</p>
          <div className="pt-4 opacity-80 flex justify-center gap-4 text-white">
            <a href="#how-it-works" className="hover:underline hover:opacity-100">كيف يعمل الموقع</a>
            <span>•</span>
            <a href="#terms" className="hover:underline hover:opacity-100">شروط الاستخدام</a>
            <span>•</span>
            <a href="#terms" className="hover:underline hover:opacity-100">سياسة الخصوصية</a>
            <span>•</span>
            <button onClick={onAdminClick} className="hover:underline hover:opacity-100 cursor-pointer font-bold">لوحة التحكم</button>
          </div>
        </div>
      </footer>

    </div>
  );
}
