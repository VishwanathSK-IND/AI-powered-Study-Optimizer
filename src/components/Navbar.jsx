

import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const navLinks = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/subjects", label: "Subjects" },
    { to: "/timer", label: "Focus Timer" },
    { to: "/goals", label: "Goals" },
    { to: "/insights", label: "AI Insights" },
  ];

  const isActive = (path) => location.pathname === path;

  if (!currentUser) return null;

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/dashboard">
          <span className="brand-icon">⚡</span>
          <span className="brand-name">StudyOS</span>
        </Link>
      </div>

      
      <div className="navbar-links">
        {navLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`nav-link ${isActive(link.to) ? "active" : ""}`}
          >
            {link.label}
          </Link>
        ))}
      </div>

      <div className="navbar-right">
        <span className="user-name">
          {currentUser.displayName || currentUser.email}
        </span>
        <button onClick={handleLogout} className="btn-logout">
          Logout
        </button>

        
        <button
          className="hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          ☰
        </button>
      </div>

      {menuOpen && (
        <div className="mobile-menu">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`mobile-link ${isActive(link.to) ? "active" : ""}`}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <button onClick={handleLogout} className="btn-logout mobile-logout">
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
