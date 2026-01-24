import React, { useEffect, useState } from "react";
import HabitCard from "./HabitCard";
import { Button } from "../styles";

function HabitList({ token, refreshKey, onHabitsLoaded }) {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState([]);

  function loadHabits() {
    setLoading(true);
    setErrors([]);

    fetch("http://localhost:5555/habits?page=1&per_page=50", {
      headers: { Authorization: `Bearer ${token}` },
    }).then(async (r) => {
      const data = await r.json().catch(() => null);
      setLoading(false);

      if (!r.ok) {
        setErrors([data?.errors?.[0] || data?.error || "Failed to load habits."]);
        return;
      }
      const list = Array.isArray(data) ? data : data?.habits || [];
      setHabits(list);
      onHabitsLoaded?.(list);
    });
  }

  useEffect(() => {
    if (!token) return;
    loadHabits();
  }, [token, refreshKey]);

  function handleUpdated(updatedHabit) {
    setHabits((prev) =>
      prev.map((h) => (h.id === updatedHabit.id ? updatedHabit : h))
    );
  }

  function handleDeleted(deletedId) {
    setHabits((prev) => prev.filter((h) => h.id !== deletedId));
  }

  if (loading) return <p>Loading habits...</p>;

  if (errors.length) {
    return (
      <div>
        <p style={{ color: "crimson" }}>{errors[0]}</p>
        <Button onClick={loadHabits}>Try again</Button>
      </div>
    );
  }

  return (
    <div style={{ marginTop: 16 }}>
      <h2>Your Habits</h2>

      {habits.length === 0 ? (
        <p>No habits yet. Create one above.</p>
      ) : (
        habits.map((habit) => (
          <HabitCard
            key={habit.id}
            habit={habit}
            token={token}
            onUpdated={handleUpdated}
            onDeleted={handleDeleted}
          />
        ))
      )}
    </div>
  );
}

export default HabitList;
