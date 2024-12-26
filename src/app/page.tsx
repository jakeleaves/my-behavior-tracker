"use client";

import { useState, useEffect, CSSProperties } from 'react';

interface TimerInfo {
  startTime: number | null;
  isTiming: boolean;
}

export default function Page() {
  const [students, setStudents] = useState<string[]>([]);
  // Dictionary: student name -> { startTime, isTiming }
  const [timers, setTimers] = useState<{ [student: string]: TimerInfo }>({});

  // Fetch the students from the API on component mount
  useEffect(() => {
    const fetchStudents = async () => {
      const res = await fetch('/api/get-students');
      if (res.ok) {
        const data = await res.json();
        setStudents(data.students || []);
      } else {
        console.error('Failed to fetch students');
      }
    };
    fetchStudents();
  }, []);

  // Format time as hh:mmAM/PM (removing space between).
  function formatTime(date: Date): string {
    const options: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit', hour12: true };
    const timeStr = date.toLocaleTimeString('en-US', options); // e.g. "11:30 AM"
    return timeStr.replace(' ', ''); // "11:30AM"
  }

  // Start button for a specific student
  const handleStart = (student: string) => {
    setTimers(prev => ({
      ...prev,
      [student]: {
        startTime: Date.now(),
        isTiming: true,
      }
    }));
  };

  // Stop button for a specific student
  const handleStop = async (student: string) => {
    const timer = timers[student];
    if (!timer || !timer.isTiming || !timer.startTime) return; // sanity check

    const endTime = Date.now();
    // Format date in YYYY-MM-DD
    const dateStr = new Date(timer.startTime).toISOString().split('T')[0];
    // Format start/end times
    const startLocal = formatTime(new Date(timer.startTime));
    const endLocal = formatTime(new Date(endTime));

    // Send to Google Sheets
    await fetch('/api/log-behavior', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student, date: dateStr, startTime: startLocal, endTime: endLocal })
    });

    // Clear this student's timer
    setTimers(prev => ({
      ...prev,
      [student]: {
        startTime: null,
        isTiming: false
      }
    }));
  };

  // Styling
  const containerStyle: CSSProperties = {
    fontFamily: "Arial, sans-serif",
    padding: "20px",
    maxWidth: "600px",
    margin: "auto"
  };

  const studentRowStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "#f8f8f8",
    padding: "10px",
    borderRadius: "5px",
    marginBottom: "10px"
  };

  const studentNameStyle: CSSProperties = {
  fontWeight: "bold",
  fontSize: "1.1rem",
  color: "#000", // <-- ensure the text is black
  };


  const buttonStyle: CSSProperties = {
    padding: "12px 16px",
    fontSize: "1rem",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    marginRight: "8px",
    fontWeight: "bold"
  };

  return (
    <div style={containerStyle}>
      <h1 style={{ textAlign: "center" }}>Behavior Tracker</h1>

      {!students.length && <p>Loading students...</p>}

      {/* Render one row per student, each with Start/Stop buttons */}
      {students.map((student) => {
        const timer = timers[student] || { isTiming: false, startTime: null };
        return (
          <div key={student} style={studentRowStyle}>
            <span style={studentNameStyle}>{student}</span>

            <div>
              <button
                onClick={() => handleStart(student)}
                style={{
                  ...buttonStyle,
                  background: timer.isTiming ? "#ccc" : "#4caf50",
                  color: "#fff"
                }}
                disabled={timer.isTiming}
              >
                Start
              </button>

              <button
                onClick={() => handleStop(student)}
                style={{
                  ...buttonStyle,
                  background: timer.isTiming ? "#f44336" : "#ccc",
                  color: "#fff"
                }}
                disabled={!timer.isTiming}
              >
                Stop
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
