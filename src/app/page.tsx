"use client";

import { useState, useEffect } from 'react';

export default function Page() {
  const [students, setStudents] = useState<string[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [isTiming, setIsTiming] = useState<boolean>(false);

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

  const handleStudentSelect = (student: string) => {
    setSelectedStudent(student);
  };

  const handleStart = () => {
    if (!selectedStudent) {
      alert("Please select a student first.");
      return;
    }
    setStartTime(Date.now());
    setIsTiming(true);
  };

  function formatTime(date: Date): string {
    const options: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit', hour12: true };
    const timeStr = date.toLocaleTimeString('en-US', options); // e.g. "11:30 AM"
    return timeStr.replace(' ', ''); // remove space to get "11:30AM"
  }

  const handleStop = async () => {
    if (!isTiming || !selectedStudent || !startTime) return;

    const endTime = Date.now();
    // Get date in YYYY-MM-DD
    const dateStr = new Date(startTime).toISOString().split('T')[0];

    // Format times to AM/PM
    const startLocal = formatTime(new Date(startTime));
    const endLocal = formatTime(new Date(endTime));

    await fetch('/api/log-behavior', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student: selectedStudent, date: dateStr, startTime: startLocal, endTime: endLocal })
    });

    // No success alert as requested
    setIsTiming(false);
    setStartTime(null);
    // Don't reset selectedStudent to maintain selection
    // setSelectedStudent(null); <- Removed this line
  };

  const baseButtonStyle: React.CSSProperties = {
    padding: "12px 18px",
    fontSize: "1rem",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    transition: "background 0.3s",
    fontWeight: "bold",
  };

  const studentButtonStyle = (student: string): React.CSSProperties => ({
    ...baseButtonStyle,
    background: selectedStudent === student ? "#4caf50" : "#eee",
    color: selectedStudent === student ? "#fff" : "#000",
    border: selectedStudent === student ? "2px solid #388e3c" : "2px solid #ccc"
  });

  const startButtonStyle: React.CSSProperties = {
    ...baseButtonStyle,
    marginRight: "10px",
    background: isTiming ? "#ccc" : "#2196f3",
    color: "#fff",
  };

  const stopButtonStyle: React.CSSProperties = {
    ...baseButtonStyle,
    background: isTiming ? "#f44336" : "#ccc",
    color: "#fff",
  };

  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: "20px", maxWidth: "500px", margin: "auto" }}>
      <h1 style={{ textAlign: "center" }}>Behavior Tracker</h1>
      <p>Select a student:</p>
      {!students.length && <p>Loading students...</p>}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {students.map((student) => (
          <button 
            key={student}
            onClick={() => handleStudentSelect(student)}
            style={studentButtonStyle(student)}
          >
            {student}
          </button>
        ))}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={handleStart}
          style={startButtonStyle}
          disabled={isTiming || !selectedStudent}
        >
          Start
        </button>

        <button 
          onClick={handleStop}
          style={stopButtonStyle}
          disabled={!isTiming}
        >
          Stop
        </button>
      </div>

      {selectedStudent && <p>Selected Student: <strong>{selectedStudent}</strong></p>}
      {isTiming && <p>Timing in progress...</p>}
    </div>
  );
}