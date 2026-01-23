import React, { useEffect, useState } from "react";
import NavBar from "./NavBar";
import Login from "../pages/Login";
import HabitForm from "./HabitForm";
import { Button } from "../styles";

function App() {
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

  return (
    <>
      <NavBar setUser={setUser} />
      <Button onClick={() => setShowHabit((s) => !s)}>
        {showHabit ? "Hide Habit Form" : "Add a Habit"}
      </Button>

      {showHabit && (
        <HabitForm
          token={localStorage.getItem("token")}
          onHabitCreated={(newHabit) => setHabits((prev) => [newHabit, ...prev])}
        />
      )}

      <hr />

      <h2>Your Habits</h2>

      {habitsLoading ? (
        <p>Loading habits...</p>
      ) : habitsErrors.length > 0 ? (
        <ul>
          {habitsErrors.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      ) : habits.length === 0 ? (
        <p>No habits yet. Create one above!</p>
      ) : (
        <ul>
          {habits.map((habit) => (
            <li key={habit.id}>
              <strong>{habit.name}</strong>
              {habit.frequency ? ` • ${habit.frequency}` : null}
              {habit.goal ? ` • goal: ${habit.goal}` : null}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export default App;
