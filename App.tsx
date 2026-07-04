/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import HomeView from "./components/HomeView";
import RegistrationForm from "./components/RegistrationForm";
import AdminDashboard from "./components/AdminDashboard";
import CheckStatusView from "./components/CheckStatusView";

export default function App() {
  const [currentView, setView] = useState<'home' | 'choose-type' | 'register-groom' | 'register-bride' | 'admin' | 'check-status'>('home');
  const [adminToken, setAdminToken] = useState<string>(() => {
    return localStorage.getItem("mawadda_admin_token") || "";
  });

  // Keep admin authorization persisted locally for high usability
  useEffect(() => {
    if (adminToken) {
      localStorage.setItem("mawadda_admin_token", adminToken);
    } else {
      localStorage.removeItem("mawadda_admin_token");
    }
  }, [adminToken]);

  const handleRegisterClick = (type: 'groom' | 'bride' | 'choose') => {
    if (type === 'groom') {
      setView('register-groom');
    } else if (type === 'bride') {
      setView('register-bride');
    } else {
      setView('choose-type');
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAdminLogout = () => {
    setAdminToken("");
    setView('home');
  };

  return (
    <div className="min-h-screen bg-stone-50 selection:bg-emerald-200 selection:text-emerald-900">
      {/* Universal Sticky Navigation */}
      <Navbar
        currentView={currentView}
        setView={setView}
        isAdminLoggedIn={!!adminToken}
        onLogoutAdmin={handleAdminLogout}
      />

      {/* Main View Router */}
      <main className="transition-all duration-300">
        {currentView === 'home' && (
          <HomeView
            onRegisterClick={handleRegisterClick}
            onAdminClick={() => setView('admin')}
          />
        )}

        {currentView === 'choose-type' && (
          <RegistrationForm
            initialType="choose"
            setView={setView}
          />
        )}

        {currentView === 'register-groom' && (
          <RegistrationForm
            initialType="groom"
            setView={setView}
          />
        )}

        {currentView === 'register-bride' && (
          <RegistrationForm
            initialType="bride"
            setView={setView}
          />
        )}

        {currentView === 'admin' && (
          <AdminDashboard
            token={adminToken}
            setToken={setAdminToken}
            setView={setView}
          />
        )}

        {currentView === 'check-status' && (
          <CheckStatusView
            onBackToHome={() => setView('home')}
          />
        )}
      </main>
    </div>
  );
}
