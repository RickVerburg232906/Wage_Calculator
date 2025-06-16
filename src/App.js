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

    const totalHours = parseFloat(hours || 0) + (parseFloat(minutes || 0) / 60);
    if (isNaN(totalHours) || totalHours <= 0) {
      alert("Voer een geldig aantal uren en minuten in");
      return;
    }

    const totalWage = rate * totalHours;
    setWage(totalWage.toFixed(2));
  };

  const agesForRole = Object.keys(hourlyRates[role]);

  return (
    <div style={{ maxWidth: 400, margin: "auto", padding: 20, fontFamily: "Arial, sans-serif" }}>
      <h2>Loon Calculator</h2>

      <label>Functie:</label>
      <select
        value={role}
        onChange={(e) => {
          const newRole = e.target.value;
          setRole(newRole);
          // Reset leeftijd alleen als die niet bestaat voor nieuwe functie
          if (!Object.keys(hourlyRates[newRole]).includes(age)) {
            setAge("");
            setWage(null);
          }
        }}
        style={{ width: "100%", marginBottom: 10, padding: 5 }}
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
        style={{ width: "100%", marginBottom: 10, padding: 5 }}
      >
        <option value="">Selecteer leeftijd</option>
        {agesForRole.map((a) => (
          <option key={a} value={a}>
            {a}
          </option>
        ))}
      </select>

      <label>Uren:</label>
      <input
        type="number"
        min="0"
        value={hours}
        onChange={(e) => {
          setHours(e.target.value);
          setWage(null);
        }}
        style={{ width: "100%", marginBottom: 10, padding: 5 }}
        placeholder="Aantal uren"
      />

      <label>Minuten:</label>
      <input
        type="number"
        min="0"
        max="59"
        value={minutes}
        onChange={(e) => {
          setMinutes(e.target.value);
          setWage(null);
        }}
        style={{ width: "100%", marginBottom: 10, padding: 5 }}
        placeholder="Aantal minuten"
      />

      <button onClick={handleCalculate} style={{ padding: "10px 20px", cursor: "pointer" }}>
        Bereken Loon
      </button>

      {wage !== null && (
        <div style={{ marginTop: 20, fontWeight: "bold" }}>
          Totaal loon: € {wage}
        </div>
      )}
    </div>
  );
}

export default WageCalculator;

