import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { StudyProvider } from "./context/StudyContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Subjects = lazy(() => import("./pages/Subjects"));
const Timer = lazy(() => import("./pages/Timer"));
const Goals = lazy(() => import("./pages/Goals"));
const Insights = lazy(() => import("./pages/Insights"));

function PageLoader() {
  return (
    <div className="page-center">
      <div className="spinner" />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <StudyProvider>
          <div className="app-shell">
            <Navbar />
            <main className="main-content">
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />

                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/subjects"
                    element={
                      <ProtectedRoute>
                        <Subjects />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/timer"
                    element={
                      <ProtectedRoute>
                        <Timer />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/goals"
                    element={
                      <ProtectedRoute>
                        <Goals />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/insights"
                    element={
                      <ProtectedRoute>
                        <Insights />
                      </ProtectedRoute>
                    }
                  />

                  <Route path="/" element={<Navigate to="/dashboard" replace />} />

                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </Suspense>
            </main>
          </div>
        </StudyProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
