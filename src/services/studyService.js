
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

export const addSubject = async (userId, subjectData) => {
  const ref = collection(db, "subjects");
  const docRef = await addDoc(ref, {
    ...subjectData,
    userId,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

export const getSubjects = async (userId) => {
  const q = query(collection(db, "subjects"), where("userId", "==", userId));
  const snapshot = await getDocs(q);
  const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  
  return docs.sort((a, b) => {
    const aTime = a.createdAt?.toMillis?.() ?? 0;
    const bTime = b.createdAt?.toMillis?.() ?? 0;
    return bTime - aTime;
  });
};

export const updateSubject = async (subjectId, data) => {
  await updateDoc(doc(db, "subjects", subjectId), data);
};

export const deleteSubject = async (subjectId) => {
  await deleteDoc(doc(db, "subjects", subjectId));
};


export const logSession = async (userId, sessionData) => {
  const ref = collection(db, "sessions");
  const docRef = await addDoc(ref, {
    ...sessionData,
    userId,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

export const getSessions = async (userId) => {
  const q = query(collection(db, "sessions"), where("userId", "==", userId));
  const snapshot = await getDocs(q);
  const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  return docs.sort((a, b) => {
    const aTime = a.createdAt?.toMillis?.() ?? 0;
    const bTime = b.createdAt?.toMillis?.() ?? 0;
    return bTime - aTime;
  });
};

export const deleteSession = async (sessionId) => {
  await deleteDoc(doc(db, "sessions", sessionId));
};



export const addGoal = async (userId, goalData) => {
  const ref = collection(db, "goals");
  const docRef = await addDoc(ref, {
    ...goalData,
    userId,
    completed: false,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

export const getGoals = async (userId) => {
  const q = query(collection(db, "goals"), where("userId", "==", userId));
  const snapshot = await getDocs(q);
  const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  return docs.sort((a, b) => {
    const aTime = a.createdAt?.toMillis?.() ?? 0;
    const bTime = b.createdAt?.toMillis?.() ?? 0;
    return bTime - aTime;
  });
};

export const toggleGoal = async (goalId, completed) => {
  await updateDoc(doc(db, "goals", goalId), { completed });
};

export const deleteGoal = async (goalId) => {
  await deleteDoc(doc(db, "goals", goalId));
};