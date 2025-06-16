import React, { useState } from "react";
import "./WageCalculator.css"; // Custom styles

const hourlyRates = {
  vakkenvuller: {
    13: 5.9,
    14: 5.9,
    15: 5.9,
    16: 6.8,
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
    if (!age || !role) return alert("Selecteer functie en leeftijd");
    const rate = hourlyRates[role][age];
    if (!rate) return alert("Geen tarief gevonden voor deze leeftijd en functie");

    const hourList = hours.split(",").map((h) => parseFloat(h) || 0);
    const minuteList = minutes.split(",").map((m) => parseFloat(m) || 0);

    const totalHours =
      hourList.reduce((sum, h) => sum + h, 0) +
      minuteList.reduce((sum, m) => sum + m / 60, 0);

    if (isNaN(totalHours) || totalHours <= 0) return alert("Voer geldige uren en minuten in");

    const totalWage = rate * totalHours;
    setWage(totalWage.toFixed(2));
  };

  const agesForRole = Object.keys(hourlyRates[role]);

  return (
    <div className="wage-container">
      <h2>Loon Calculator</h2>

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
      >
        <option value="">Selecteer leeftijd</option>
        {agesForRole.map((a) => (
          <option key={a} value={a}>
            {a}
          </option>
        ))}
      </select>

      <label>Uren (bv. 20,23,25):</label>
      <input
        type="text"
        value={hours}
        onChange={(e) => {
          setHours(e.target.value);
          setWage(null);
        }}
        placeholder="Aantal uren"
      />

      <label>Minuten (bv. 30,45,15):</label>
      <input
        type="text"
        value={minutes}
        onChange={(e) => {
          setMinutes(e.target.value);
          setWage(null);
        }}
        placeholder="Aantal minuten"
      />

      <button onClick={handleCalculate}>Bereken Loon</button>

      {wage !== null && <div className="result">Totaal loon: € {wage}</div>}
    </div>
  );
}

export default WageCalculator;
