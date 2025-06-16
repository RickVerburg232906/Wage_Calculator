import React, { useState } from "react";

const hourlyRates = {
  vakkenvuller: {
    13: 5.90,
    14: 5.90,
    15: 5.90,
    16: 6.80,
    17: 7.77,
    18: 9.19,
    19: 11.03,
    20: 14.71,
    21: 18.38,
  },
  teamleider: {
    16: 7,
    17: 9,
    18: 11,
    19: 13,
    20: 15,
    21: 20,
  },
};

function WageCalculator() {
  const [role, setRole] = useState("vakkenvuller");
  const [age, setAge] = useState("");
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [wage, setWage] = useState(null);

  const handleCalculate = () => {
    if (!age || !role) {
      alert("Selecteer functie en leeftijd");
      return;
    }
    const rate = hourlyRates[role][age];
    if (!rate) {
      alert("Geen tarief gevonden voor deze leeftijd en functie");
      return;
    }

    const hourArray = hours.split(",").map(h => parseFloat(h.trim()) || 0);
    const minuteArray = minutes.split(",").map(m => parseFloat(m.trim()) || 0);

    const totalHours =
      hourArray.reduce((acc, h) => acc + h, 0) +
      minuteArray.reduce((acc, m) => acc + m / 60, 0);

    if (isNaN(totalHours) || totalHours <= 0) {
      alert("Voer een geldig aantal uren en minuten in");
      return;
    }

    const totalWage = rate * totalHours;
    setWage(totalWage.toFixed(2));
  };

  const agesForRole = Object.keys(hourlyRates[role]);

  return (
    <div style={{
      width: "100%",
      minHeight: "100vh",
      padding: "20px",
      boxSizing: "border-box",
      backgroundColor: "#f5f5f5",
      fontFamily: "Arial, sans-serif"
    }}>
      <div style={{
        maxWidth: "600px",
        margin: "0 auto",
        backgroundColor: "white",
        padding: "20px",
        borderRadius: "10px",
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)"
      }}>
        <h2 style={{ textAlign: "center" }}>Loon Calculator</h2>

        <label>Functie:</label>
        <select
          value={role}
          onChange={(e) => {
            const newRole = e.target.value;
            setRole(newRole);
            if (!Object.keys(hourlyRates[newRole]).includes(age)) {
              setAge("");
              setWage(null);
            }
          }}
          style={{ width: "100%", marginBottom: 10, padding: 8 }}
        >
          <option value="vakkenvuller">Vakkenvuller</option>
          <option value="teamleider">Teamleider</option>
        </select>

        <label>Leeftijd:</label>
        <select
          value={age}
          onChange={(e) => {
            setAge(e.target.value);
            setWage(null);
          }}
          style={{ width: "100%", marginBottom: 10, padding: 8 }}
        >
          <option value="">Selecteer leeftijd</option>
          {agesForRole.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>

        <label>Uren (bijv. 20,23,25):</label>
        <input
          type="text"
          value={hours}
          onChange={(e) => {
            setHours(e.target.value);
            setWage(null);
          }}
          style={{ width: "100%", marginBottom: 10, padding: 8 }}
          placeholder="Uren gescheiden door komma’s"
        />

        <label>Minuten (bijv. 30,15):</label>
        <input
          type="text"
          value={minutes}
          onChange={(e) => {
            setMinutes(e.target.value);
            setWage(null);
          }}
          style={{ width: "100%", marginBottom: 10, padding: 8 }}
          placeholder="Minuten gescheiden door komma’s"
        />

        <button
          onClick={handleCalculate}
          style={{
            width: "100%",
            padding: "12px",
            backgroundColor: "#007bff",
            color: "white",
            fontSize: "16px",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            marginTop: "10px"
          }}
        >
          Bereken Loon
        </button>

        {wage !== null && (
          <div style={{
            marginTop: 20,
            padding: 12,
            backgroundColor: "#e6ffe6",
            border: "1px solid #b2ffb2",
            borderRadius: "5px",
            textAlign: "center",
            fontSize: "18px",
            fontWeight: "bold"
          }}>
            Totaal loon: € {wage}
          </div>
        )}
      </div>
    </div>
  );
}

export default WageCalculator;
