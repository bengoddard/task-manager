import React, { useState } from "react";
import { Button, Error, Input, FormField, Label } from "../styles";

function HabitForm({ token, onHabitCreated }) {
  const [title, setTitle] = useState("");
  const [frequency, setFrequency] = useState("daily");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setIsLoading(true);
    setErrors([]);

    fetch("http://localhost:5555/habits", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        title,
        frequency,
        notes,
      }),
    }).then((r) => {
      setIsLoading(false);
      if (r.ok) {
        r.json().then((newHabit) => {
          if (onHabitCreated) onHabitCreated(newHabit);

          setTitle("");
          setFrequency("daily");
          setNotes("");
        });
      } else {
        r.json().then((err) => setErrors(err.errors || ["Something went wrong."]));
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="container">
      <FormField>
        <Label htmlFor="title">Habit Name</Label>
        <Input
          type="text"
          id="title"
          autoComplete="off"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Drink water"
        />
      </FormField>

      <FormField>
        <Label htmlFor="frequency">Frequency</Label>
        <select
          id="frequency"
          value={frequency}
          onChange={(e) => setFrequency(e.target.value)}
          style={{ width: "100%", padding: "8px" }}
        >
          <option value="daily">Daily</option>
          <option value="3xWeek">3x a Week</option>
          <option value="weekly">Weekly</option>
        </select>
      </FormField>

      <FormField>
        <Label htmlFor="notes">Notes</Label>
        <Input
          type="text"
          id="notes"
          autoComplete="off"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g., 8 cups/day"
        />
      </FormField>

      <FormField>
        <Button variant="fill" color="primary" type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Create Habit"}
        </Button>
      </FormField>

      <FormField>
        {errors.map((err) => (
          <Error key={err}>{err}</Error>
        ))}
      </FormField>
    </form>
  );
}

export default HabitForm;
