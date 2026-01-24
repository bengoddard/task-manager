import React, { useEffect, useState } from "react";

function TodayDashboard({ token }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5555/today", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(setData);
  }, [token]);

  function toggleHabit(habit) {
    const newStatus = !habit.completed_today;

    fetch(`http://localhost:5555/habits/${habit.id}/checkin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: newStatus, date: data.date }),
    }).then((r) => {
      if (r.ok) {
        setData((prev) => ({
          ...prev,
          habits: prev.habits.map((h) =>
            h.id === habit.id ? { ...h, completed_today: newStatus } : h
          ),
        }));
      }
    });
  }

  if (!data) return <p>Loading...</p>;

  return (
    <div className="container">
      <h2>Today ({data.date})</h2>
      <ul>
        {data?.habits?.map((h) => (
          <li key={h.id}>
            <input
              type="checkbox"
              checked={h.completed_today}
              onChange={() => toggleHabit(h)}
            />
            <strong>{h.title}</strong> — streak: {h.streak}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TodayDashboard;
