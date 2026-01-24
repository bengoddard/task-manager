import React, { useState } from "react";
import { Button } from "../styles";

function HabitCard({ habit, token, onUpdated, onDeleted }) {
  const [isEditing, setIsEditing] = useState(false);

  const [title, setTitle] = useState(habit.title || "");
  const [notes, setNotes] = useState(habit.notes || "");
  const [frequency, setFrequency] = useState(habit.frequency || "daily");

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  function saveEdits() {
    setIsSaving(true);
    setError("");

    fetch(`http://localhost:5555/habits/${habit.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title, notes, frequency }),
    })
      .then(async (r) => {
        const data = await r.json().catch(() => null);

        if (r.ok) {
          onUpdated?.(data);
          setIsEditing(false);
        } else {
          setError(
            (data && (data.errors?.[0] || data.error)) ||
              "Could not update habit."
          );
        }
      })
      .finally(() => setIsSaving(false));
  }

  function deleteHabit() {
    const ok = window.confirm("Delete this habit?");
    if (!ok) return;

    setIsSaving(true);
    setError("");

    fetch(`http://localhost:5555/habits/${habit.id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (r) => {
        if (r.ok || r.status === 204) {
          onDeleted?.(habit.id);
        } else {
          const data = await r.json().catch(() => null);
          setError(
            (data && (data.errors?.[0] || data.error)) ||
              "Could not delete habit."
          );
        }
      })
      .finally(() => setIsSaving(false));
  }

  function cancelEdit() {
    setTitle(habit.title || "");
    setNotes(habit.notes || "");
    setFrequency(habit.frequency || "daily");
    setError("");
    setIsEditing(false);
  }

  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12, marginBottom: 12 }} className="card">
      {!isEditing ? (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
            <div>
              <h3 style={{ margin: "0 0 6px 0" }}>{habit.title}</h3>
              <div style={{ fontSize: 14, opacity: 0.85 }}>
                <div><strong>Frequency:</strong> {habit.frequency}</div>
                <div><strong>Notes:</strong> {habit.notes}</div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
              <Button onClick={() => setIsEditing(true)} disabled={isSaving}>
                Edit
              </Button>
              <Button onClick={deleteHabit} disabled={isSaving}>
                Delete
              </Button>
            </div>
          </div>

          {error ? <p style={{ color: "crimson", marginTop: 10 }}>{error}</p> : null}
        </>
      ) : (
        <>
          <h3 style={{ marginTop: 0 }}>Edit Habit</h3>

          <div style={{ display: "grid", gap: 10 }}>
            <label>
              Title
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{ width: "100%", padding: 8, marginTop: 4 }}
              />
            </label>

            <label>
              Frequency
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                style={{ width: "100%", padding: 8, marginTop: 4 }}
              >
                <option value="daily">daily</option>
                <option value="weekly">weekly</option>
              </select>
            </label>

            <label>
              Notes
              <input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={{ width: "100%", padding: 8, marginTop: 4 }}
              />
            </label>
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <Button onClick={saveEdits} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save"}
            </Button>
            <Button onClick={cancelEdit} disabled={isSaving}>
              Cancel
            </Button>
          </div>

          {error ? <p style={{ color: "crimson", marginTop: 10 }}>{error}</p> : null}
        </>
      )}
    </div>
  );
}

export default HabitCard;
