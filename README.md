# 🎯 AI Study Optimizer

An intelligent study planning system that helps students optimize their learning using AI-driven insights, personalized schedules, and performance tracking.

## 🚀 Problem Statement

### 👤 Who is the user?
Students (school, PU, and college level) who struggle with:
- Managing time effectively
- Prioritizing subjects/topics
- Maintaining consistency in studies

### ❗ What problem are we solving?

Most students:
- Study without a clear strategy
- Waste time on low-priority topics
- Don’t track performance properly
- Feel overwhelmed before exams

Traditional planners and to-do apps are static and **not adaptive**.

### 💡 Why does this problem matter?

- Poor planning leads to stress and burnout
- Students fail to maximize their potential
- No personalization in existing tools
- Lack of data-driven study decisions

👉 Our solution introduces **AI-powered adaptive study planning** to improve efficiency and outcomes.

## 🧠 Solution Overview

AI Study Optimizer analyzes:
- Available study time
- Subject difficulty
- User performance

…and generates:
- 📅 Smart study schedules
- 📊 Performance insights
- 🎯 Priority-based recommendations

## ✨ Features

- 🧠 **AI-Based Study Plan Generator**
  - Creates personalized schedules dynamically

- 📊 **Performance Tracking Dashboard**
  - Tracks completed tasks and efficiency

- ⏳ **Time Optimization**
  - Allocates time based on importance and difficulty

- 📌 **Task Management**
  - Add, update, delete subjects/topics

- 🔥 **Adaptive Recommendations**
  - Adjusts plans based on user progress

- 🔐 **Authentication System**
  - Secure login/signup (Firebase)

## 🛠 Tech Stack

### Frontend:
- React.js
- Tailwind CSS

### Backend / Services:
- Firebase (Firestore + Auth)

### AI Integration:
- Groq API / LLM (for study recommendations)

### Deployment:
- Vercel


# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.