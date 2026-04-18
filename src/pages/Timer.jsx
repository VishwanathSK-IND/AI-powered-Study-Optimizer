
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useStudy } from "../context/StudyContext";

const PRESETS = [
  { label: "Focus", minutes: 25, color: "#6366f1" },
  { label: "Short Break", minutes: 5, color: "#10b981" },
  { label: "Long Break", minutes: 15, color: "#f59e0b" },
];

export default function Timer() {
  const { currentUser } = useAuth();
  const { subjects, sessions, addSession } = useStudy();

  const [activePreset, setActivePreset] = useState(0);
  const [customInput, setCustomInput] = useState("");
  const [isCustom, setIsCustom] = useState(false);

  const [timerMinutes, setTimerMinutes] = useState(25);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [totalElapsed, setTotalElapsed] = useState(0);

  const [selectedSubject, setSelectedSubject] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const intervalRef = useRef(null);
  const elapsedRef = useRef(0);


  const clearTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            clearTimer();
            playDing();
            return 0;
          }
          return prev - 1;
        });
        elapsedRef.current += 1;
        setTotalElapsed(elapsedRef.current);
      }, 1000);
    } else {
      clearTimer();
    }
    return clearTimer;
  }, [isRunning]);

  const playDing = () => {
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    } catch {}
  };

  const applyDuration = useCallback((mins) => {
    const valid = Math.max(1, Math.min(180, Math.round(mins)));
    setTimerMinutes(valid);
    setSecondsLeft(valid * 60);
    setIsRunning(false);
    elapsedRef.current = 0;
    setTotalElapsed(0);
    setSaved(false);
    clearTimer();
  }, []);

  const handlePresetClick = (idx) => {
    setActivePreset(idx);
    setIsCustom(false);
    setCustomInput("");
    applyDuration(PRESETS[idx].minutes);
  };

  const handleCustomApply = () => {
    const val = parseInt(customInput, 10);
    if (!val || val < 1) return;
    applyDuration(val);
    setIsCustom(true);
  };

  const handleCustomKeyDown = (e) => {
    if (e.key === "Enter") handleCustomApply();
  };

  const handleStart = () => setIsRunning(true);
  const handlePause = () => setIsRunning(false);
  const handleReset = () => {
    applyDuration(timerMinutes);
  };

  const handleSave = async () => {
    if (!selectedSubject) return alert("Please select a subject.");
    const mins = Math.round(elapsedRef.current / 60);
    if (mins < 1) return alert("Study for at least 1 minute first.");

    const subject = subjects.find((s) => s.id === selectedSubject);
    setSaving(true);
    try {
      await addSession(currentUser.uid, {
        subjectId: selectedSubject,
        subjectName: subject?.name || "Unknown",
        duration: mins,
        notes: notes.trim(),
        mode: isCustom ? `Custom (${timerMinutes}m)` : PRESETS[activePreset].label,
      });
      setSaved(true);
      setNotes("");
    } catch {
      alert("Failed to save. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const totalSeconds = timerMinutes * 60;
  const progress = 1 - secondsLeft / totalSeconds;
  const radius = 88;
  const circ = 2 * Math.PI * radius;
  const offset = circ * (1 - progress);

  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const secs = String(secondsLeft % 60).padStart(2, "0");
  const activeColor = isCustom ? "#ec4899" : PRESETS[activePreset].color;

  const recentSessions = sessions.slice(0, 4);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Focus Timer</h1>
          <p className="page-subtitle">Deep work, tracked and logged</p>
        </div>
      </div>

      <div className="timer-layout">

        <div className="card timer-main-card">

          <div className="preset-tabs">
            {PRESETS.map((p, i) => (
              <button
                key={p.label}
                className={`preset-tab ${!isCustom && activePreset === i ? "active" : ""}`}
                style={!isCustom && activePreset === i ? { "--tab-color": p.color } : {}}
                onClick={() => handlePresetClick(i)}
                disabled={isRunning}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="timer-ring-wrap">
            <svg width="220" height="220" viewBox="0 0 220 220">
              <circle cx="110" cy="110" r={radius} className="ring-bg" />
              <circle
                cx="110" cy="110" r={radius}
                className="ring-fill"
                style={{ stroke: activeColor }}
                strokeDasharray={circ}
                strokeDashoffset={offset}
                transform="rotate(-90 110 110)"
              />
            </svg>
            <div className="timer-center">
              <span className="timer-digits">{mins}:{secs}</span>
              <span className="timer-label">
                {isCustom ? `Custom · ${timerMinutes}m` : PRESETS[activePreset].label}
              </span>
              <span className="timer-elapsed">
                {Math.round(elapsedRef.current / 60)}m elapsed
              </span>
            </div>
          </div>

          <div className="timer-btns">
            {isRunning ? (
              <button className="btn-timer-pause" onClick={handlePause}>⏸ Pause</button>
            ) : (
              <button
                className="btn-timer-start"
                style={{ "--btn-color": activeColor }}
                onClick={handleStart}
              >
                ▶ {secondsLeft < totalSeconds && secondsLeft > 0 ? "Resume" : "Start"}
              </button>
            )}
            <button className="btn-timer-reset" onClick={handleReset} disabled={isRunning}>
              ↺ Reset
            </button>
          </div>

          <div className="custom-duration-row">
            <span className="custom-label">Custom duration</span>
            <div className="custom-input-group">
              <input
                type="number"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                onKeyDown={handleCustomKeyDown}
                placeholder="e.g. 45"
                min="1"
                max="180"
                disabled={isRunning}
                className="custom-mins-input"
              />
              <span className="custom-unit">min</span>
              <button
                className="btn-apply"
                onClick={handleCustomApply}
                disabled={isRunning || !customInput}
              >
                Apply
              </button>
            </div>
          </div>

        </div>

        <div className="timer-side">

          <div className="card">
            <h2 className="card-title">Log Session</h2>

            <div className="form-group">
              <label>Subject</label>
              <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}>
                <option value="">— Pick a subject —</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginTop: 12 }}>
              <label>Notes (optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="What did you cover?"
                rows={3}
              />
            </div>

            <div className="elapsed-row">
              Elapsed: <strong>{Math.round(elapsedRef.current / 60)} min</strong>
            </div>

            {saved ? (
              <div className="success-banner">✅ Session saved!</div>
            ) : (
              <button
                className="btn-primary full-width"
                onClick={handleSave}
                disabled={saving || elapsedRef.current < 60}
                style={{ marginTop: 12 }}
              >
                {saving ? "Saving..." : "Save Session"}
              </button>
            )}
          </div>

          {recentSessions.length > 0 && (
            <div className="card">
              <h2 className="card-title">Recent Sessions</h2>
              <ul className="session-list">
                {recentSessions.map((s) => (
                  <li key={s.id} className="session-item">
                    <div className="session-info">
                      <span className="session-subject">{s.subjectName}</span>
                      <span className="session-duration">{s.duration}m</span>
                    </div>
                    {s.notes && <span className="session-note">{s.notes}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
