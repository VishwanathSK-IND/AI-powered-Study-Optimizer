

import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useStudy } from "../context/StudyContext";

const PRIORITIES = ["Low", "Medium", "High"];

const emptyForm = { title: "", description: "", deadline: "", priority: "Medium" };

export default function Goals() {
  const { currentUser } = useAuth();
  const { goals, loadAllData, createGoal, markGoal, removeGoal, loadingData } = useStudy();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all"); 

  useEffect(() => {
    if (currentUser) loadAllData(currentUser.uid);
  }, [currentUser, loadAllData]);  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.title.trim()) {
      setError("Goal title is required.");
      return;
    }

    setSubmitting(true);
    try {
      await createGoal(currentUser.uid, {
        title: form.title.trim(),
        description: form.description.trim(),
        deadline: form.deadline || null,
        priority: form.priority,
      });
      setForm(emptyForm);
      setShowForm(false);
    } catch {
      setError("Couldn't create goal. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (goal) => {
    try {
      await markGoal(currentUser.uid, goal.id, !goal.completed);
    } catch {
      alert("Couldn't update goal.");
    }
  };

  const handleDelete = async (goalId) => {
    if (!window.confirm("Delete this goal?")) return;
    try {
      await removeGoal(currentUser.uid, goalId);
    } catch {
      alert("Couldn't delete goal.");
    }
  };

  const filteredGoals = goals.filter((g) => {
    if (filter === "active") return !g.completed;
    if (filter === "done") return g.completed;
    return true;
  });

  const priorityColor = { Low: "#10b981", Medium: "#f59e0b", High: "#ef4444" };

  const isOverdue = (deadline) => {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Goals</h1>
          <p className="page-subtitle">Track what you want to achieve</p>
        </div>
        {!showForm && (
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            + New Goal
          </button>
        )}
      </div>

      {showForm && (
        <div className="card form-card">
          <h2 className="card-title">Add Goal</h2>
          {error && <div className="error-banner">{error}</div>}
          <form onSubmit={handleSubmit} className="form-grid">
            <div className="form-group">
              <label>Goal Title *</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Complete 3 DSA chapters"
                disabled={submitting}
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="What does success look like?"
                rows={2}
                disabled={submitting}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Deadline</label>
                <input
                  type="date"
                  name="deadline"
                  value={form.deadline}
                  onChange={handleChange}
                  disabled={submitting}
                />
              </div>
              <div className="form-group">
                <label>Priority</label>
                <select
                  name="priority"
                  value={form.priority}
                  onChange={handleChange}
                  disabled={submitting}
                >
                  {PRIORITIES.map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? "Saving..." : "Add Goal"}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => { setShowForm(false); setForm(emptyForm); setError(""); }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      
      <div className="filter-tabs">
        {["all", "active", "done"].map((f) => (
          <button
            key={f}
            className={`filter-tab ${filter === f ? "active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f === "all" && ` (${goals.length})`}
            {f === "active" && ` (${goals.filter((g) => !g.completed).length})`}
            {f === "done" && ` (${goals.filter((g) => g.completed).length})`}
          </button>
        ))}
      </div>

      {loadingData ? (
        <div className="page-center"><div className="spinner" /></div>
      ) : filteredGoals.length === 0 ? (
        <div className="empty-page-state">
          <p>🎯 {filter === "done" ? "No completed goals yet." : "No active goals. Add one!"}</p>
        </div>
      ) : (
        <div className="goals-list">
          {filteredGoals.map((goal) => (
            <div
              key={goal.id}
              className={`goal-card ${goal.completed ? "completed" : ""}`}
            >
              <div className="goal-left">
                <input
                  type="checkbox"
                  checked={goal.completed}
                  onChange={() => handleToggle(goal)}
                  className="goal-checkbox"
                />
                <div className="goal-content">
                  <span className="goal-title">{goal.title}</span>
                  {goal.description && (
                    <span className="goal-desc">{goal.description}</span>
                  )}
                  <div className="goal-meta">
                    <span
                      className="priority-badge"
                      style={{ background: priorityColor[goal.priority] }}
                    >
                      {goal.priority}
                    </span>
                    {goal.deadline && (
                      <span className={`deadline ${isOverdue(goal.deadline) && !goal.completed ? "overdue" : ""}`}>
                        📅 {new Date(goal.deadline).toLocaleDateString()}
                        {isOverdue(goal.deadline) && !goal.completed && " (Overdue)"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                className="icon-btn danger"
                onClick={() => handleDelete(goal.id)}
                title="Delete goal"
              >
                🗑
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
