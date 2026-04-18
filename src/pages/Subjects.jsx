

import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useStudy } from "../context/StudyContext";

const COLORS = ["#6366f1", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#ec4899"];

const emptyForm = { name: "", description: "", color: COLORS[0], targetHours: "" };

export default function Subjects() {
  const { currentUser } = useAuth();
  const { subjects, sessions, loadAllData, createSubject, editSubject, removeSubject, loadingData } = useStudy();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

 
  useEffect(() => {
    if (currentUser) loadAllData(currentUser.uid);
  }, [currentUser, loadAllData]);  

  
  const hoursPerSubject = useCallback(() => {
    const map = {};
    sessions.forEach((s) => {
      if (!map[s.subjectId]) map[s.subjectId] = 0;
      map[s.subjectId] += s.duration || 0;
    });
    return map;
  }, [sessions]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const openEdit = (subject) => {
    setForm({
      name: subject.name,
      description: subject.description || "",
      color: subject.color || COLORS[0],
      targetHours: subject.targetHours || "",
    });
    setEditingId(subject.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError("Subject name is required.");
      return;
    }

    setSubmitting(true);
    try {
      const data = {
        name: form.name.trim(),
        description: form.description.trim(),
        color: form.color,
        targetHours: form.targetHours ? Number(form.targetHours) : null,
      };

      if (editingId) {
        await editSubject(currentUser.uid, editingId, data);
      } else {
        await createSubject(currentUser.uid, data);
      }

      setForm(emptyForm);
      setEditingId(null);
      setShowForm(false);
    } catch (err) {
      setError("Failed to save subject. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (subjectId) => {
    if (!window.confirm("Delete this subject? Your sessions logged under it will remain.")) return;
    try {
      await removeSubject(currentUser.uid, subjectId);
    } catch {
      alert("Failed to delete. Please try again.");
    }
  };

  const cancelForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
    setError("");
  };

  const hoursMap = hoursPerSubject();

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Subjects</h1>
          <p className="page-subtitle">Organize what you're studying</p>
        </div>
        {!showForm && (
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            + Add Subject
          </button>
        )}
      </div>

      
      {showForm && (
        <div className="card form-card">
          <h2 className="card-title">{editingId ? "Edit Subject" : "New Subject"}</h2>
          {error && <div className="error-banner">{error}</div>}
          <form onSubmit={handleSubmit} className="form-grid">
            <div className="form-group">
              <label>Subject Name *</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Data Structures"
                disabled={submitting}
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <input
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Optional notes about this subject"
                disabled={submitting}
              />
            </div>

            <div className="form-group">
              <label>Weekly Target (hours)</label>
              <input
                type="number"
                name="targetHours"
                value={form.targetHours}
                onChange={handleChange}
                placeholder="e.g. 10"
                min="1"
                max="168"
                disabled={submitting}
              />
            </div>

            <div className="form-group">
              <label>Color Tag</label>
              <div className="color-picker">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`color-swatch ${form.color === c ? "selected" : ""}`}
                    style={{ background: c }}
                    onClick={() => setForm((prev) => ({ ...prev, color: c }))}
                  />
                ))}
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? "Saving..." : editingId ? "Update" : "Add Subject"}
              </button>
              <button type="button" className="btn-secondary" onClick={cancelForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      
      {loadingData ? (
        <div className="page-center">
          <div className="spinner" />
        </div>
      ) : subjects.length === 0 ? (
        <div className="empty-page-state">
          <p>📚 No subjects yet. Add your first one above!</p>
        </div>
      ) : (
        <div className="subjects-grid">
          {subjects.map((subject) => {
            const minutesStudied = hoursMap[subject.id] || 0;
            const hoursStudied = (minutesStudied / 60).toFixed(1);
            const progressPercent = subject.targetHours
              ? Math.min((minutesStudied / 60 / subject.targetHours) * 100, 100)
              : null;

            return (
              <div key={subject.id} className="subject-card">
                <div
                  className="subject-color-bar"
                  style={{ background: subject.color }}
                />
                <div className="subject-body">
                  <div className="subject-top-row">
                    <h3 className="subject-name">{subject.name}</h3>
                    <div className="subject-actions">
                      <button
                        className="icon-btn"
                        onClick={() => openEdit(subject)}
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        className="icon-btn danger"
                        onClick={() => handleDelete(subject.id)}
                        title="Delete"
                      >
                        🗑
                      </button>
                    </div>
                  </div>

                  {subject.description && (
                    <p className="subject-desc">{subject.description}</p>
                  )}

                  <div className="subject-stats">
                    <span>{hoursStudied}h studied</span>
                    {subject.targetHours && (
                      <span>Target: {subject.targetHours}h/week</span>
                    )}
                  </div>

                  {progressPercent !== null && (
                    <div className="progress-bar-wrap">
                      <div
                        className="progress-bar-fill"
                        style={{
                          width: `${progressPercent}%`,
                          background: subject.color,
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
