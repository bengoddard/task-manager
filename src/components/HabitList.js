import React, { useEffect, useState } from "react";
import HabitCard from "./HabitCard";
import { Button } from "../styles";

function HabitList({ habits, token, onUpdated, onDeleted }) {
  return (
    <div style={{ marginTop: 16 }} className="container">
      <h2>Your Habits</h2>

      {habits.length === 0 ? (
        <p>No habits yet. Create one above.</p>
      ) : (
        habits.map((habit) => (
          <HabitCard
            key={habit.id}
            habit={habit}
            token={token}
            onUpdated={onUpdated}
            onDeleted={onDeleted}
          />
        ))
      )}
    </div>
  );
}

export default HabitList;
