

import React, { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useStudy } from "../context/StudyContext";

function StatCard({ label, value, icon, color }) {
  return (
    <div className={`stat-card stat-${color}`}>
      <span className="stat-icon">{icon}</span>
      <div>
        <p className="stat-value">{value}</p>
        <p className="stat-label">{label}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { currentUser } = useAuth();
  const { subjects, sessions, goals, loadAllData, loadingData } = useStudy();

  
  useEffect(() => {
    if (currentUser) {
      loadAllData(currentUser.uid);
    }
  }, [currentUser, loadAllData]);    

  const stats = useMemo(() => {
    const totalMinutes = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    const completedGoals = goals.filter((g) => g.completed).length;
    const thisWeekSessions = sessions.filter((s) => {
      if (!s.createdAt) return false;
      const sessionDate = s.createdAt.toDate ? s.createdAt.toDate() : new Date(s.createdAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return sessionDate >= weekAgo;
    });

    return {
      totalHours: Math.floor(totalMinutes / 60),
      totalMinutes: totalMinutes % 60,
      subjectCount: subjects.length,
      completedGoals,
      totalGoals: goals.length,
      weekSessions: thisWeekSessions.length,
    };
  }, [sessions, goals, subjects]);

  const recentSessions = sessions.slice(0, 5);

  if (loadingData) {
    return (
      <div className="page-center">
        <div className="spinner" />
        <p>Loading your study data...</p>
      </div>
    );
  }

  const firstName = currentUser?.displayName?.split(" ")[0] || "there";

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Hey, {firstName} 👋</h1>
          <p className="page-subtitle">Here's how your studying is going</p>
        </div>
        <Link to="/timer" className="btn-primary">
          Start Studying
        </Link>
      </div>

      
      <div className="stats-grid">
        <StatCard
          label="Total Study Hours"
          value={`${stats.totalHours}h ${stats.totalMinutes}m`}
          icon="⏱"
          color="blue"
        />
        <StatCard
          label="Subjects"
          value={stats.subjectCount}
          icon="📚"
          color="purple"
        />
        <StatCard
          label="Goals Completed"
          value={`${stats.completedGoals} / ${stats.totalGoals}`}
          icon="🎯"
          color="green"
        />
        <StatCard
          label="Sessions This Week"
          value={stats.weekSessions}
          icon="🔥"
          color="orange"
        />
      </div>

      <div className="dashboard-grid">
        
        <div className="card">
          <h2 className="card-title">Recent Sessions</h2>
          {recentSessions.length === 0 ? (
            <div className="empty-state">
              <p>No sessions yet. Start a focus timer to track your study time.</p>
              <Link to="/timer" className="btn-secondary">
                Go to Timer
              </Link>
            </div>
          ) : (
            <ul className="session-list">
              {recentSessions.map((session) => (
                <li key={session.id} className="session-item">
                  <div className="session-info">
                    <span className="session-subject">{session.subjectName}</span>
                    <span className="session-duration">{session.duration} min</span>
                  </div>
                  <span className="session-note">{session.notes || "—"}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

      
        <div className="card">
          <div className="card-header-row">
            <h2 className="card-title">Active Goals</h2>
            <Link to="/goals" className="link-small">
              View all
            </Link>
          </div>
          {goals.filter((g) => !g.completed).length === 0 ? (
            <div className="empty-state">
              <p>No active goals. Set one to stay focused.</p>
              <Link to="/goals" className="btn-secondary">
                Add a Goal
              </Link>
            </div>
          ) : (
            <ul className="goal-list">
              {goals
                .filter((g) => !g.completed)
                .slice(0, 4)
                .map((goal) => (
                  <li key={goal.id} className="goal-preview-item">
                    <span className="goal-dot" />
                    <span>{goal.title}</span>
                  </li>
                ))}
            </ul>
          )}
        </div>
      </div>

      
      <div className="quick-actions">
        <Link to="/subjects" className="quick-action-card">
          <span className="qa-icon">📚</span>
          <span>Manage Subjects</span>
        </Link>
        <Link to="/timer" className="quick-action-card">
          <span className="qa-icon">⏱</span>
          <span>Focus Timer</span>
        </Link>
        <Link to="/goals" className="quick-action-card">
          <span className="qa-icon">🎯</span>
          <span>Set Goals</span>
        </Link>
        <Link to="/insights" className="quick-action-card">
          <span className="qa-icon">🤖</span>
          <span>AI Insights</span>
        </Link>
      </div>
    </div>
  );
}
