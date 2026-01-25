import React, { useRef, useEffect, useState } from "react";
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
  const formRef = useRef(null);
  const token = localStorage.getItem("token");
  const [user, setUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [habits, setHabits] = useState([]);
  const [habitsMeta, setHabitsMeta] = useState(null);

  function toggleForm() {
    setShowForm((prev) => !prev);
  }

  useEffect(() => {
    if (!showForm) return;

    requestAnimationFrame(() => {
      const el = formRef.current;
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top: y, behavior: "smooth" });
    });
  }, [showForm]);


  useEffect(() => {
    fetch("http://localhost:5555/me", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }).then((r) => {
      if (r.ok) {
        r.json().then((user) => setUser(user));
        console.log(user);
      }
    });
  }, [token]);

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

  function handleUpdated(updatedHabit) {
    setHabits((prev) => prev.map((h) => (h.id === updatedHabit.id ? updatedHabit : h)));
  }

  function handleDeleted(deletedId) {
    setHabits((prev) => prev.filter((h) => h.id !== deletedId));
  }

  function handleHabitCreated(newHabit) {
    setHabits((prev) => [newHabit, ...prev]);
    setShowForm(false);
  }

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
      <NavBar setUser={setUser} />
      <Routes>
        <Route path="/" element={<TodayDashboard token={token} />} />
        <Route path="/habits" element={<HabitList token={token} habits={habits} onUpdated={handleUpdated} onDeleted={handleDeleted}/>} />
        <Route path="/progress" element={<ProgressView token={token} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Button onClick={toggleForm}>
        {showForm ? "Hide Habit Form" : "Add a Habit"}
      </Button>
      <div ref={formRef}>
      {showForm && (
        <HabitForm
          token={token}
          onHabitCreated={handleHabitCreated}/>
      )}
      </div>
      </>
    );
}

export default App;
