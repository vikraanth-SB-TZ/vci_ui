import React, { useState, useEffect } from "react";
import "../assets/css/MiniCalendar.css";

function MiniCalendar({ selectedDate, onDateChange, onCancel, allowFuture = true }) {
  const getInitialMonthView = () =>
    selectedDate
      ? new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
      : new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  const [monthView, setMonthView] = useState(getInitialMonthView());
  const [view, setView] = useState("days");

  const months = Array.from({ length: 12 }, (_, i) =>
    new Date(0, i).toLocaleString("default", { month: "short" })
  );
  const years = Array.from({ length: 100 }, (_, i) => 1970 + i);

  useEffect(() => {
    if (selectedDate) {
      setMonthView(
        new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
      );
    }
  }, [selectedDate]);

  const prev = () =>
    setMonthView((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const next = () =>
    setMonthView((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  const selectDay = (d) => {
    const picked = new Date(monthView.getFullYear(), monthView.getMonth(), d);
    const localDate = new Date(picked.getFullYear(), picked.getMonth(), picked.getDate());
    if (!allowFuture && localDate > new Date()) return;
    onDateChange?.(localDate);
  };

  const selectMonth = (m) => {
    setMonthView((d) => new Date(d.getFullYear(), m, 1));
    setView("days");
  };

  const selectYear = (y) => {
    setMonthView((d) => new Date(y, d.getMonth(), 1));
    setView("days");
  };

  let selectedDay = null;
  if (
    selectedDate &&
    selectedDate.getFullYear() === monthView.getFullYear() &&
    selectedDate.getMonth() === monthView.getMonth()
  ) {
    selectedDay = selectedDate.getDate();
  }

  const today = new Date();
  const todayDay =
    today.getFullYear() === monthView.getFullYear() &&
    today.getMonth() === monthView.getMonth()
      ? today.getDate()
      : null;

  return (
    <div className="mini-calendar-outer">
      <div className="mini-calendar-inner">
        <div className="calendar-header small-header">
          <button type="button" className="nav-btn" onClick={prev}>
            &lt;
          </button>
          <div className="title">
            <button
              type="button"
              className="title-month"
              onClick={() => setView("months")}
            >
              {months[monthView.getMonth()]}
            </button>{" "}
            <button
              type="button"
              className="title-year"
              onClick={() => setView("years")}
            >
              {monthView.getFullYear()}
            </button>
          </div>
          <button type="button" className="nav-btn" onClick={next}>
            &gt;
          </button>
        </div>

        {view === "days" && (
          <div className="days-grid">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d, i) => (
              <div key={i} className="day-name">
                {d}
              </div>
            ))}
            {Array(monthView.getDay())
              .fill(null)
              .map((_, i) => (
                <div key={"b" + i} className="day blank" />
              ))}
            {Array.from(
              {
                length: new Date(
                  monthView.getFullYear(),
                  monthView.getMonth() + 1,
                  0
                ).getDate(),
              },
              (_, i) => i + 1
            ).map((d) => {
              const current = new Date(monthView.getFullYear(), monthView.getMonth(), d);
              const isFuture = !allowFuture && current > today;

              let className = "day";
              if (d === todayDay) className += " today";
              if (d === selectedDay) className += " selected";
              if (isFuture) className += " disabled-day";

              return (
                <div
                  key={d}
                  className={className}
                  onClick={() => !isFuture && selectDay(d)}
                >
                  {d}
                </div>
              );
            })}
          </div>
        )}

        {view === "months" && (
          <div className="months-grid">
            {months.map((m, i) => (
              <div key={m} className="month" onClick={() => selectMonth(i)}>
                {m}
              </div>
            ))}
          </div>
        )}

        {view === "years" && (
          <div className="years-grid">
            {years.map((y) => (
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
            onClick={() => onCancel?.()}
          >
            Cancel
          </button>
          <button
            type="button"
            className="submit-btn"
            onClick={() =>
              selectedDate
                ? onDateChange?.(
                    new Date(
                      selectedDate.getFullYear(),
                      selectedDate.getMonth(),
                      selectedDate.getDate()
                    )
                  )
                : onDateChange?.(
                    new Date(monthView.getFullYear(), monthView.getMonth(), 1)
                  )
            }
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}

export default MiniCalendar;
