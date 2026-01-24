import React, { useEffect, useMemo, useState } from "react";

function ProgressView({ token }) {
  const [range, setRange] = useState("week");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;

    setLoading(true);
    setError("");

    fetch(`http://localhost:5555/progress?range=${range}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (r) => {
        const body = await r.json().catch(() => null);
        if (!r.ok) {
          setError(body?.errors?.[0] || body?.error || "Failed to load progress.");
          setData(null);
        } else {
          setData(body);
        }
      })
      .catch(() => setError("Failed to load progress."))
      .finally(() => setLoading(false));
  }, [token, range]);

  const normalized = useMemo(() => {
    const habits = Array.isArray(data?.habits) ? data.habits : [];
    const overallRate =
      data?.completion_rate ??
      data?.overall?.completion_rate ??
      null;

    return { habits, overallRate };
  }, [data]);

  function formatRate(rate) {
    if (rate === null || rate === undefined) return "—";

    const val = rate > 1 ? rate : rate * 100;
    return `${Math.round(val)}%`;
  }

  if (loading) return <p>Loading progress...</p>;

  return (
    <div style={{ marginTop: 16 }} className="container">
      <h2>Progress</h2>

      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12 }}>
        <label>
          Range:{" "}
          <select value={range} onChange={(e) => setRange(e.target.value)}>
            <option value="week">Last 7 days</option>
            <option value="month">Last 30 days</option>
          </select>
        </label>
      </div>

      {error ? (
        <p style={{ color: "crimson" }}>{error}</p>
      ) : (
        <>
          <div style={{ marginBottom: 12 }}>
            <strong>Overall completion:</strong> {formatRate(normalized.overallRate)}
          </div>

          {normalized.habits.length === 0 ? (
            <p>No progress data yet.</p>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {normalized.habits.map((h) => (
                <div
                  key={h.id}
                  style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12 }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <div>
                      <strong>{h.title}</strong>
                      <div style={{ fontSize: 14, opacity: 0.85, marginTop: 4 }}>
                        Completion: {formatRate(h.completion_rate)}
                        {h.streak !== undefined ? ` • Streak: ${h.streak}` : ""}
                      </div>
                    </div>

                    <div style={{ width: 140, alignSelf: "center" }}>
                      <div style={{ height: 10, background: "#FFF500", borderRadius: 999 }}>
                        <div
                          style={{
                            height: 10,
                            width: (() => {
                              const rate = h.completion_rate;
                              if (rate === null || rate === undefined) return "0%";
                              const pct = rate > 1 ? rate : rate * 100;
                              return `${Math.max(0, Math.min(100, pct))}%`;
                            })(),
                            background: "#1F8EFA",
                            borderRadius: 999,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  {Array.isArray(h.history) && h.history.length > 0 ? (
                    <div style={{ marginTop: 10, fontSize: 13, opacity: 0.85 }}>
                      <div><strong>Recent:</strong></div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
                        {h.history.map((day) => (
                          <span
                            key={day.date}
                            title={day.date}
                            style={{
                              display: "inline-block",
                              width: 14,
                              height: 14,
                              borderRadius: 4,
                              background: day.status ? "#1F8EFA" : "#FFF500",
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ProgressView;
