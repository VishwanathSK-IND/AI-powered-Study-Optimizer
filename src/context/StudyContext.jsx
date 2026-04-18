

import React, { createContext, useContext, useReducer, useCallback, useEffect, useRef } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../Services/firebase";
import {
  addSubject, getSubjects, updateSubject, deleteSubject,
  logSession, getSessions, deleteSession,
  addGoal, getGoals, toggleGoal, deleteGoal,
} from "../services/studyService";

const StudyContext = createContext(null);


const cache = {
  get(userId, key) {
    try {
      const raw = localStorage.getItem(`studyos_${userId}_${key}`);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  set(userId, key, items) {
    try {
      const serializable = items.map((item) => ({
        ...item,
        createdAt:
          item.createdAt?.toMillis?.()
          ?? (typeof item.createdAt === "number" ? item.createdAt : Date.now()),
      }));
      localStorage.setItem(`studyos_${userId}_${key}`, JSON.stringify(serializable));
    } catch (e) {
      console.warn("localStorage write failed:", e);
    }
  },
  clear(userId) {
    try {
      ["subjects", "sessions", "goals"].forEach((k) =>
        localStorage.removeItem(`studyos_${userId}_${k}`)
      );
    } catch {}
  },
};



const initialState = {
  subjects: [],
  sessions: [],
  goals: [],
  loadingData: false,
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loadingData: action.payload };
    case "SET_ALL":
      return {
        ...state,
        subjects: action.subjects,
        sessions: action.sessions,
        goals:    action.goals,
        loadingData: false,
      };
    case "CLEAR":
      return { ...initialState };

    case "ADD_SUBJECT":
      return { ...state, subjects: [action.payload, ...state.subjects] };
    case "UPDATE_SUBJECT":
      return {
        ...state,
        subjects: state.subjects.map((s) =>
          s.id === action.id ? { ...s, ...action.data } : s
        ),
      };
    case "DEL_SUBJECT":
      return { ...state, subjects: state.subjects.filter((s) => s.id !== action.id) };

    case "ADD_SESSION":
      return { ...state, sessions: [action.payload, ...state.sessions] };
    case "UPDATE_SESSION":
      return {
        ...state,
        sessions: state.sessions.map((s) =>
          s.id === action.id ? { ...s, ...action.data } : s
        ),
      };
    case "DEL_SESSION":
      return { ...state, sessions: state.sessions.filter((s) => s.id !== action.id) };

    case "ADD_GOAL":
      return { ...state, goals: [action.payload, ...state.goals] };
    case "UPDATE_GOAL":
      return {
        ...state,
        goals: state.goals.map((g) =>
          g.id === action.id ? { ...g, ...action.data } : g
        ),
      };
    case "DEL_GOAL":
      return { ...state, goals: state.goals.filter((g) => g.id !== action.id) };

    default:
      return state;
  }
}

export function StudyProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const uidRef   = useRef(null);
  const stateRef = useRef(state);

  useEffect(() => { stateRef.current = state; }, [state]);

  const persist = useCallback((key, items) => {
    if (uidRef.current) cache.set(uidRef.current, key, items);
  }, []);


  const initUser = useCallback(async (userId) => {
    uidRef.current = userId;

    const cachedSubjects = cache.get(userId, "subjects");
    const cachedSessions = cache.get(userId, "sessions");
    const cachedGoals    = cache.get(userId, "goals");
    const hasCached      = cachedSubjects || cachedSessions || cachedGoals;

    if (hasCached) {
      dispatch({
        type: "SET_ALL",
        subjects: cachedSubjects || [],
        sessions: cachedSessions || [],
        goals:    cachedGoals    || [],
      });
    } else {
      dispatch({ type: "SET_LOADING", payload: true });
    }

    try {
      const [subjects, sessions, goals] = await Promise.all([
        getSubjects(userId),
        getSessions(userId),
        getGoals(userId),
      ]);
      dispatch({ type: "SET_ALL", subjects, sessions, goals });
      cache.set(userId, "subjects", subjects);
      cache.set(userId, "sessions", sessions);
      cache.set(userId, "goals",    goals);
    } catch (err) {
      console.error("Firestore sync failed (cached data still shown):", err);
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        initUser(user.uid);
      } else {
        uidRef.current = null;
        dispatch({ type: "CLEAR" });
      }
    });
    return unsub;
  }, [initUser]);


  const createSubject = async (userId, data) => {
    const tempId   = "tmp_" + Date.now();
    const tempItem = { id: tempId, ...data, userId, createdAt: Date.now() };

    dispatch({ type: "ADD_SUBJECT", payload: tempItem });

    const listWithTemp = [tempItem, ...stateRef.current.subjects];
    persist("subjects", listWithTemp);

    
    const realId = await addSubject(userId, data);

    
    dispatch({ type: "UPDATE_SUBJECT", id: tempId, data: { id: realId } });
    
    const finalList = listWithTemp.map((s) =>
      s.id === tempId ? { ...s, id: realId } : s
    );
    persist("subjects", finalList);
    return realId;
  };

  const editSubject = async (userId, subjectId, data) => {
    dispatch({ type: "UPDATE_SUBJECT", id: subjectId, data });
    const updated = stateRef.current.subjects.map((s) =>
      s.id === subjectId ? { ...s, ...data } : s
    );
    persist("subjects", updated);
    await updateSubject(subjectId, data);
  };

  const removeSubject = async (userId, subjectId) => {
    dispatch({ type: "DEL_SUBJECT", id: subjectId });
    const updated = stateRef.current.subjects.filter((s) => s.id !== subjectId);
    persist("subjects", updated);
    await deleteSubject(subjectId);
  };

  const addSession = async (userId, data) => {
    const tempId   = "tmp_" + Date.now();
    const tempItem = { id: tempId, ...data, userId, createdAt: Date.now() };

    dispatch({ type: "ADD_SESSION", payload: tempItem });

  
    const listWithTemp = [tempItem, ...stateRef.current.sessions];
    persist("sessions", listWithTemp);

    const realId = await logSession(userId, data);

    dispatch({ type: "UPDATE_SESSION", id: tempId, data: { id: realId } });
    const finalList = listWithTemp.map((s) =>
      s.id === tempId ? { ...s, id: realId } : s
    );
    persist("sessions", finalList);
  };

  const removeSession = async (userId, sessionId) => {
    dispatch({ type: "DEL_SESSION", id: sessionId });
    const updated = stateRef.current.sessions.filter((s) => s.id !== sessionId);
    persist("sessions", updated);
    await deleteSession(sessionId);
  };


  const createGoal = async (userId, data) => {
    const tempId   = "tmp_" + Date.now();
    const tempItem = { id: tempId, ...data, userId, completed: false, createdAt: Date.now() };

    dispatch({ type: "ADD_GOAL", payload: tempItem });

    const listWithTemp = [tempItem, ...stateRef.current.goals];
    persist("goals", listWithTemp);

    const realId = await addGoal(userId, data);

    dispatch({ type: "UPDATE_GOAL", id: tempId, data: { id: realId } });
    const finalList = listWithTemp.map((g) =>
      g.id === tempId ? { ...g, id: realId } : g
    );
    persist("goals", finalList);
  };

  const markGoal = async (userId, goalId, completed) => {
    dispatch({ type: "UPDATE_GOAL", id: goalId, data: { completed } });
    const updated = stateRef.current.goals.map((g) =>
      g.id === goalId ? { ...g, completed } : g
    );
    persist("goals", updated);
    await toggleGoal(goalId, completed);
  };

  const removeGoal = async (userId, goalId) => {
    dispatch({ type: "DEL_GOAL", id: goalId });
    const updated = stateRef.current.goals.filter((g) => g.id !== goalId);
    persist("goals", updated);
    await deleteGoal(goalId);
  };

  const value = {
    subjects:    state.subjects,
    sessions:    state.sessions,
    goals:       state.goals,
    loadingData: state.loadingData,
    loadAllData: initUser,
    createSubject, editSubject, removeSubject,
    addSession,    removeSession,
    createGoal,    markGoal,    removeGoal,
  };

  return (
    <StudyContext.Provider value={value}>
      {children}
    </StudyContext.Provider>
  );
}

export function useStudy() {
  return useContext(StudyContext);
}
