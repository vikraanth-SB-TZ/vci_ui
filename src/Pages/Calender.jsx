import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"; // Keep this for base datepicker styles

export default function App() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [message, setMessage] = useState("");
  // State to control the visibility of the message box
  const [showMessageBox, setShowMessageBox] = useState(false);

  // Handler for closing the date picker (clearing selected date)
  const handleClose = () => {
    setSelectedDate(null);
    setShowMessageBox(false); // Hide message box on close
  };

  // Handler for submitting the selected date
  const handleSubmit = () => {
    if (selectedDate) {
      setMessage(`Selected date: ${selectedDate.toLocaleDateString("en-GB")}`);
      setShowMessageBox(true); // Show message box
    } else {
      setMessage("Please select a date.");
      setShowMessageBox(true); // Show message box
    }
  };

  // Arrays for years and months for custom header dropdowns
  const years = Array.from({ length: 100 }, (_, i) => 1970 + i);
  const months = Array.from({ length: 12 }, (_, i) =>
    new Date(0, i).toLocaleString("default", { month: "long" })
  );

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="calendar-wrapper">
        {/* Calendar Header Section */}
        <div className="calendar-header">
          <div className="calendar-left">
            <div className="calendar-icon">
              {/* SVG Calendar Icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-6 h-6 text-gray-700"
              >
                <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 18a8 8 0 110-16 8 8 0 010 16zM15 9h-2V7h-2v2H9v2h2v2h2v-2h2V9z" />
              </svg>
            </div>
            {/* Display selected date or "Select date" text */}
            <span className="date-text">
              {selectedDate
                ? selectedDate.toLocaleDateString("en-GB")
                : "Select date"}
            </span>
          </div>
          {/* Close button for the header */}
          <button className="close-icon" onClick={handleClose}>
            ✕
          </button>
        </div>

        {/* DatePicker Component */}
        <DatePicker
          selected={selectedDate}
          onChange={(date) => {
            setSelectedDate(date);
            setShowMessageBox(false); // Hide message box when date changes
          }}
          dateFormat="dd/MM/yyyy"
          calendarClassName="custom-calendar"
          inline // Display the calendar inline
          // Custom header for month and year selection
          renderCustomHeader={({
            date,
            changeYear,
            changeMonth,
            decreaseMonth,
            increaseMonth,
            prevMonthButtonDisabled,
            nextMonthButtonDisabled,
          }) => (
            <div className="custom-header-row">
              {/* Previous month button */}
              <button
                onClick={decreaseMonth}
                disabled={prevMonthButtonDisabled}
                className="nav-btn"
              >
                {"<"}
              </button>

              {/* Month and Year dropdowns */}
              <div className="month-year-wrapper">
                <div className="dropdown-container left">
                  <select
                    value={date.getMonth()}
                    onChange={(e) => changeMonth(Number(e.target.value))}
                    className="dropdown"
                  >
                    {months.map((month, idx) => (
                      <option key={month} value={idx}>
                        {month}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="dropdown-container right">
                  <select
                    value={date.getFullYear()}
                    onChange={(e) => changeYear(Number(e.target.value))}
                    className="dropdown"
                  >
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Next month button */}
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

        {/* Action Buttons */}
        <div className="calendar-buttons">
          <button className="close-btn" onClick={handleClose}>
            Close
          </button>
          <button className="submit-btn" onClick={handleSubmit}>
            Submit
          </button>
        </div>

        {/* Custom Message Box */}
        {showMessageBox && (
          <div className="message-box">
            <p>{message}</p>
            <button onClick={() => setShowMessageBox(false)} className="message-box-close">
              OK
            </button>
          </div>
        )}
      </div>

      {/* Embedded CSS Styles */}
      <style jsx>{`
        .calendar-wrapper {
          width: 320px;
          margin: auto;
          border-radius: 18px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          background: white;
          padding: 20px;
          font-family: "Inter", sans-serif; /* Using Inter font */
        }

        .calendar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .calendar-left {
          display: flex;
          align-items: center;
        }

        .calendar-icon {
          background: transparent;
          border-radius: 5px;
          margin-right: 5px;
        }

        .date-text {
          font-weight: bold;
        }

        .close-icon {
          background: none;
          border: none;
          font-size: 18px;
          cursor: pointer;
          border-radius: 9999px; /* Rounded corners */
          padding: 8px; /* Adequate touch target size */
          transition: background-color 0.2s;
        }

        .close-icon:hover {
          background-color: #f0f0f0;
        }

        .custom-calendar {
          border: 1px solid transparent;
          border-radius: 6px;
          padding: 0;
          overflow: hidden;
        }

        .custom-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: transparent;
          padding: 8px 10px;
        }

        .month-year-wrapper {
          display: flex;
          justify-content: space-between;
          flex: 1;
          margin: 0 10px;
        }

        .dropdown-container {
          position: relative;
          width: 50%;
        }

        .dropdown {
          width: 100%;
          font-weight: bold;
          background: transparent;
          border: none;
          font-size: 16px;
          appearance: none;
          padding-right: 20px;
          cursor: pointer;
          border-radius: 6px; /* Rounded corners */
          padding: 8px; /* Adequate touch target size */
        }

        .dropdown-container::after {
          content: "▼";
          position: absolute;
          right: 5px;
          top: 40%;
          transform: translateY(-50%);
          font-size: 10px;
          pointer-events: none;
          color: #333;
        }

        .nav-btn {
          border: none;
          background: transparent;
          padding: 4px 10px;
          font-size: 16px;
          border-radius: 6px;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .nav-btn:hover {
          background-color: #f0f0f0;
        }

        .react-datepicker__day {
          margin: 6px;
          width: 32px;
          height: 32px;
          line-height: 32px;
          text-align: center;
          border-radius: 50%;
          cursor: pointer;
          transition: background 0.2s, color 0.2s;
          font-size: 14px;
        }

        .react-datepicker__day:hover {
          background-color: #c8e6c9;
          color: black;
          border-radius: 50%;
        }

        .react-datepicker__day--selected,
        .react-datepicker__day--keyboard-selected {
          background-color: #4caf50 !important;
          color: white !important;
          border-radius: 50%;
        }

        .calendar-buttons {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 20px;
        }

        .close-btn,
        .submit-btn {
          padding: 10px 20px;
          border-radius: 10px;
          font-weight: 600;
          border: none;
          font-size: 14px;
          cursor: pointer;
          transition: background-color 0.2s, color 0.2s;
        }

        .close-btn {
          background: #eee;
          color: #333;
        }

        .close-btn:hover {
          background: #ddd;
        }

        .submit-btn {
          background: #24b153;
          color: white;
        }

        .submit-btn:hover {
          background: #1e9a48;
        }

        /* Message Box Styles */
        .message-box {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background-color: white;
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          z-index: 1000;
          text-align: center;
          max-width: 300px;
          width: 90%;
        }

        .message-box p {
          margin-bottom: 15px;
          font-size: 16px;
          color: #333;
        }

        .message-box-close {
          background-color: #24b153;
          color: white;
          border: none;
          padding: 8px 15px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          transition: background-color 0.2s;
        }

        .message-box-close:hover {
          background-color: #1e9a48;
        }

        /* Responsive adjustments */
        @media (max-width: 600px) {
          .calendar-wrapper {
            width: 100%;
            padding: 15px;
            border-radius: 10px;
          }
          .custom-header-row {
            flex-wrap: wrap;
            justify-content: center;
          }
          .month-year-wrapper {
            width: 100%;
            margin: 10px 0;
          }
          .dropdown-container {
            width: 48%;
          }
          .nav-btn {
            margin: 0 5px;
          }
        }
      `}</style>  
    </div>
  );
}
