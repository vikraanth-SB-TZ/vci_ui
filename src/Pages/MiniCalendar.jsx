// MiniCalendar.jsx
import React, { useState, useEffect } from "react";
import "../assets/css/MiniCalendar.css";

function MiniCalendar({ selectedDate, onDateChange }) {
  const initial = selectedDate ? new Date(selectedDate) : new Date();
  const [date, setDate] = useState(initial);
  const [view, setView] = useState("days"); // "days" | "months" | "years"

  const months = Array.from({ length: 12 }, (_, i) =>
    new Date(0, i).toLocaleString("default", { month: "short" })
  );
  const years = Array.from({ length: 100 }, (_, i) => 1970 + i);

  useEffect(() => {
    if (selectedDate) setDate(new Date(selectedDate));
  }, [selectedDate]);

  const prev = () => setDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const next = () => setDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  const selectDay = d => {
    const nd = new Date(date.getFullYear(), date.getMonth(), d);
    setDate(nd);
    onDateChange?.(nd);
    setView("days");
  };
  const selectMonth = m => {
    const nd = new Date(date.getFullYear(), m, 1);
    setDate(nd);
    setView("days");
  };
  const selectYear = y => {
    const nd = new Date(y, date.getMonth(), 1);
    setDate(nd);
    setView("days");
  };

  return (
    <div className="mini-calendar-outer">
      <div className="mini-calendar-inner">

        <div className="calendar-header small-header">
          <button type="button" className="nav-btn" onClick={prev}>&lt;</button>
          <div className="title">
            <button type="button" className="title-month" onClick={() => setView("months")}>
              {months[date.getMonth()]}
            </button>{" "}
            <button type="button" className="title-year" onClick={() => setView("years")}>
              {date.getFullYear()}
            </button>
          </div>
          <button type="button" className="nav-btn" onClick={next}>&gt;</button>
        </div>

        {view === "days" && (
          <div className="days-grid">
            {["Su","Mo","Tu","We","Th","Fr","Sa"].map((d,i) => (
              <div key={i} className="day-name">{d}</div>
            ))}
            {Array(date.getDay()).fill(null).map((_,i) => (
              <div key={"b"+i} className="day blank" />
            ))}
            {Array.from(
              { length: new Date(date.getFullYear(), date.getMonth()+1, 0).getDate() },
              (_,i) => i+1
            ).map(d => (
              <div
                key={d}
                className={"day" + (d === date.getDate() ? " selected" : "")}
                onClick={() => selectDay(d)}
              >
                {d}
              </div>
            ))}
          </div>
        )}

        {view === "months" && (
          <div className="months-grid">
            {months.map((m,i) => (
              <div key={m} className="month" onClick={() => selectMonth(i)}>
                {m}
              </div>
            ))}
          </div>
        )}

        {view === "years" && (
          <div className="years-grid">
            {years.map(y => (
              <div key={y} className="year" onClick={() => selectYear(y)}>
                {y}
              </div>
            ))}
          </div>
        )}

        <div className="calendar-buttons mini-buttons">
          <button
            type="button"
            className="close-btn"
            onClick={() => onDateChange?.(null)}
          >
            Cancel
          </button>
          <button
            type="button"
            className="submit-btn"
            onClick={() => onDateChange?.(date)}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
export default MiniCalendar;