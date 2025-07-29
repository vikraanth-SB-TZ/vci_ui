import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function Calender({ selectedDate, setSelectedDate }) {
  return (
    <>
      <DatePicker
        selected={selectedDate}
        onChange={(date) => setSelectedDate(date)}
        dateFormat="dd-MM-yyyy"
        className="form-control"
        placeholderText="dd-mm-yyyy"
        popperPlacement="bottom-start"
        showPopperArrow={false}
        renderCustomHeader={({
          date,
          decreaseMonth,
          increaseMonth,
          prevMonthButtonDisabled,
          nextMonthButtonDisabled,
        }) => (
          <div className="custom-header-row">
            <button
              onClick={decreaseMonth}
              disabled={prevMonthButtonDisabled}
              className="nav-btn"
            >
              {"<"}
            </button>

            <div className="header-center">
              <span className="header-text">
                {date.toLocaleString("default", {
                  month: "long",
                })}{" "}
                {date.getFullYear()}
              </span>
            </div>

            <button
              onClick={increaseMonth}
              disabled={nextMonthButtonDisabled}
              className="nav-btn"
            >
              {">"}
            </button>
          </div>
        )}
      />

      <style>{`
        .custom-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 10px;
          background: #f0f0f0;
        }

        .nav-btn {
          border: none;
          background: transparent;
          padding: 4px 10px;
          font-size: 16px;
          cursor: pointer;
        }

        .header-center {
          flex-grow: 1;
          text-align: center;
        }

        .header-text {
          font-weight: bold;
          font-size: 16px;
        }

        .react-datepicker__day {
          margin: 6px;
          width: 32px;
          height: 32px;
          line-height: 32px;
          text-align: center;
          border-radius: 50%;
          cursor: pointer;
        }

        .react-datepicker__day:hover {
          background-color: #c8e6c9;
          color: black;
        }

        .react-datepicker__day--selected,
        .react-datepicker__day--keyboard-selected {
          background-color: #4caf50 !important;
          color: white !important;
        }
      `}</style>
    </>
  );
}
