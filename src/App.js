import React, { useEffect, useState } from "react";
import NavBar from "./components/NavBar";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import TodayDashboard from "./components/TodayDashboard";
import ProgressView from "./components/ProgressView";
import HabitList from "./components/HabitList";
import HabitForm from "./components/HabitForm";
import { Routes, Route, Navigate } from "react-router-dom";
import { Button } from "./styles";

function App() {
  const token = localStorage.getItem("token");
  const [user, setUser] = useState(null);
  const [showHabit, setShowHabit] = useState(true);

  const [habits, setHabits] = useState([]);
  const [habitsLoading, setHabitsLoading] = useState(false);
  const [habitsErrors, setHabitsErrors] = useState([]);
  const [habitsMeta, setHabitsMeta] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5555/me", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }).then((r) => {
      if (r.ok) {
        r.json().then((user) => setUser(user));
      }
    });
  }, []);

  const onLogin = (token, user) => {
    localStorage.setItem("token", token);
    setUser(user);
  };

  useEffect(() => {
  if (!user) return;

  fetch("http://localhost:5555/habits", {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  }).then((r) => {
    if (r.ok) {
      r.json().then((data) => {
        setHabits(data.habits);
        setHabitsMeta({
          total: data.total,
          pages: data.pages,
          current_page: data.current_page,
          next_page: data.next_page,
          prev_page: data.prev_page,
        });
      });
    }
  });
}, [user]);

  if (!user) return <Login onLogin={onLogin} />;

    if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login onLogin={onLogin} />} />
        <Route path="/signup" element={<SignUp onLogin={onLogin} />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
    }
    return (
      <>
      {showHabit && (
        <HabitForm
          token={localStorage.getItem("token")}
          onHabitCreated={(newHabit) => setHabits((prev) => [newHabit, ...prev])}
        />
      )}
      <NavBar setUser={setUser} />
      <Routes>
        <Route path="/" element={<TodayDashboard token={token} />} />
        <Route path="/habits" element={<HabitList token={token} />} />
        <Route path="/progress" element={<ProgressView token={token} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Button onClick={() => setShowHabit((s) => !s)}>
        {showHabit ? "Hide Habit Form" : "Add a Habit"}
      </Button>
      </>
    );
}

export default App;
