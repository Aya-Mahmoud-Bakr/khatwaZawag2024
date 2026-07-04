/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Heart, Settings, ShieldCheck, HelpCircle, BookOpen, Home, Search } from "lucide-react";

interface NavbarProps {
  currentView: 'home' | 'choose-type' | 'register-groom' | 'register-bride' | 'admin' | 'check-status';
  setView: (view: 'home' | 'choose-type' | 'register-groom' | 'register-bride' | 'admin' | 'check-status') => void;
  isAdminLoggedIn: boolean;
  onLogoutAdmin: () => void;
}

export default function Navbar({ currentView, setView, isAdminLoggedIn, onLogoutAdmin }: NavbarProps) {
  return (
    <header id="app-header" className="sticky top-0 z-40 bg-bento-bg/95 backdrop-blur-md border-b border-bento-medium/20 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo */}
          <div 
            id="nav-logo"
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setView('home')}
          >
            <div className="w-12 h-12 rounded-xl bg-bento-primary flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform text-white">
              <Heart className="w-6 h-6 text-white fill-white/20" />
            </div>
            <div>
              <span className="font-display font-extrabold text-xl text-bento-primary tracking-tight block">
                خطوة للزواج الرسمي
              </span>
              <span className="text-xs text-bento-medium font-bold block -mt-1">
                للتيسير وبناء الأسر المسلمة
              </span>
            </div>
          </div>

          {/* Nav Links */}
          <nav id="nav-links" className="hidden lg:flex items-center gap-4 text-sm font-semibold text-bento-primary">
            <button 
              onClick={() => setView('home')} 
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all ${currentView === 'home' ? 'text-bento-primary bg-bento-medium/10' : 'hover:opacity-75'}`}
            >
              <Home className="w-4 h-4" />
              الرئيسية
            </button>
            <button 
              onClick={() => setView('check-status')} 
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all ${currentView === 'check-status' ? 'text-bento-primary bg-bento-medium/10 border border-bento-primary/10' : 'hover:opacity-75'}`}
            >
              <Search className="w-4 h-4 text-amber-600 font-black animate-pulse" />
              بوابة الأعضاء والتوافق الذكي
            </button>
            <a 
              href="#how-it-works" 
              onClick={() => setView('home')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl hover:opacity-75 transition-all"
            >
              <HelpCircle className="w-4 h-4" />
              كيف يعمل الموقع؟
            </a>
            <a 
              href="#articles" 
              onClick={() => setView('home')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl hover:opacity-75 transition-all"
            >
              <BookOpen className="w-4 h-4" />
              نصائح زوجية
            </a>
            <a 
              href="#terms" 
              onClick={() => setView('home')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl hover:opacity-75 transition-all"
            >
              <ShieldCheck className="w-4 h-4" />
              الشروط والخصوصية
            </a>
          </nav>

          {/* Action Buttons */}
          <div id="nav-actions" className="flex items-center gap-3">
            {isAdminLoggedIn ? (
              <div className="flex items-center gap-2">
                <button
                  id="admin-dashboard-btn"
                  onClick={() => setView('admin')}
                  className="bg-bento-medium/10 hover:bg-bento-medium/20 text-bento-primary px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  لوحة التحكم
                </button>
                <button
                  id="admin-logout-btn"
                  onClick={onLogoutAdmin}
                  className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                >
                  خروج المسؤول
                </button>
              </div>
            ) : (
              <button
                id="admin-login-nav-btn"
                onClick={() => setView('admin')}
                className={`text-bento-primary hover:text-white p-2.5 rounded-xl transition-all hover:bg-bento-primary/90 ${currentView === 'admin' ? 'text-white bg-bento-primary' : ''}`}
                title="لوحة تحكم الإدارة"
              >
                <Settings className="w-5 h-5" />
              </button>
            )}

            <button
              id="cta-nav-register"
              onClick={() => setView('choose-type')}
              className="bg-bento-primary hover:bg-[#344227] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:scale-105 active:scale-95 transition-all"
            >
              سجل الآن مجاناً
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
