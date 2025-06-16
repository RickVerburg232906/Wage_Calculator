import React, { useState, useEffect } from "react";
import { Chart } from "chart.js/auto";

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

const roles = Object.keys(hourlyRates);

function WageCalculator() {
  // --- State ---
  const [role, setRole] = useState(
    localStorage.getItem("role") || "vakkenvuller"
  );
  const [age, setAge] = useState(
    localStorage.getItem("age") || ""
  );
  const [shifts, setShifts] = useState(
    JSON.parse(localStorage.getItem("shifts")) || [
      { hours: "", minutes: "" },
    ]
  );
  const [wageTotal, setWageTotal] = useState(null);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );
  const [errors, setErrors] = useState({});

  // --- Effects to sync localStorage ---
  useEffect(() => {
    localStorage.setItem("role", role);
  }, [role]);

  useEffect(() => {
    localStorage.setItem("age", age);
  }, [age]);

  useEffect(() => {
    localStorage.setItem("shifts", JSON.stringify(shifts));
  }, [shifts]);

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // --- Helpers ---
  const agesForRole = Object.keys(hourlyRates[role]).map(Number);
  const minAge = Math.min(...agesForRole);
  const maxAge = Math.max(...agesForRole);

  // Validate inputs
  const validate = () => {
    let newErrors = {};
    if (!role) newErrors.role = "Selecteer functie";
    if (!age || !agesForRole.includes(Number(age)))
      newErrors.age = "Selecteer geldige leeftijd";
    shifts.forEach(({ hours, minutes }, i) => {
      if (
        hours === "" ||
        isNaN(hours) ||
        Number(hours) < 0 ||
        !Number.isInteger(Number(hours))
      ) {
        newErrors[`hours${i}`] = "Voer geldig aantal uren in (hele getallen)";
      }
      if (
        minutes === "" ||
        isNaN(minutes) ||
        Number(minutes) < 0 ||
        Number(minutes) > 59 ||
        !Number.isInteger(Number(minutes))
      ) {
        newErrors[`minutes${i}`] = "Voer minuten in tussen 0 en 59";
      }
      if (Number(hours) === 0 && Number(minutes) === 0) {
        newErrors[`shift${i}`] = "Uren en minuten kunnen niet allebei 0 zijn";
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Calculate total wage
  const calculateWage = () => {
    if (!validate()) {
      setWageTotal(null);
      return;
    }
    const rate = hourlyRates[role][age];
    if (!rate) {
      alert("Geen tarief gevonden voor deze leeftijd en functie");
      return;
    }
    // Sum all shifts hours + minutes
    let totalHours = 0;
    shifts.forEach(({ hours, minutes }) => {
      totalHours += Number(hours) + Number(minutes) / 60;
    });
    const totalWage = totalHours * rate;
    setWageTotal(totalWage);
  };

  // Add new shift row
  const addShift = () => {
    setShifts([...shifts, { hours: "", minutes: "" }]);
  };

  // Remove shift row
  const removeShift = (index) => {
    setShifts(shifts.filter((_, i) => i !== index));
  };

  // Handle input change for shifts
  const handleShiftChange = (index, field, value) => {
    // Support comma separated inputs, take sum of all numbers
    let total = 0;
    if (value.includes(",")) {
      total = value
        .split(",")
        .map((v) => Number(v.trim()))
        .filter((n) => !isNaN(n) && n >= 0)
        .reduce((a, b) => a + b, 0);
      value = total.toString();
    }
    setShifts(
      shifts.map((shift, i) =>
        i === index ? { ...shift, [field]: value } : shift
      )
    );
  };

  // Export print
  const handlePrint = () => {
    window.print();
  };

  // Dark mode toggle handler
  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  // Monthly wage (assuming 4.33 weeks)
  const monthlyWage = wageTotal ? (wageTotal * 4.33).toFixed(2) : null;

  // Prepare data for Chart.js earnings graph
  useEffect(() => {
    if (!age || !wageTotal) return;

    const ctx = document.getElementById("earningsChart")?.getContext("2d");
    if (!ctx) return;

    // Destroy old chart if exists
    if (window.myChart) {
      window.myChart.destroy();
    }

    // Data from minAge to maxAge
    const labels = [];
    const data = [];
    for (let a = minAge; a <= maxAge; a++) {
      const rate = hourlyRates[role][a] || 0;
      const avgWeeklyHours = shifts.reduce(
        (sum, s) => sum + Number(s.hours || 0) + Number(s.minutes || 0) / 60,
        0
      );
      const earning = rate * avgWeeklyHours;
      labels.push(a);
      data.push(earning.toFixed(2));
    }

    window.myChart = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Wekelijks inkomen per leeftijd",
            data,
            borderColor: "#3b82f6",
            backgroundColor: "rgba(59,130,246,0.2)",
            fill: true,
            tension: 0.3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "€ per week",
            },
          },
          x: {
            title: {
              display: true,
              text: "Leeftijd",
            },
          },
        },
      },
    });
  }, [role, age, shifts, wageTotal]);

  return (
    <div
      className={`min-h-screen p-6 max-w-lg mx-auto font-sans ${
        darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
      }`}
    >
      <h1 className="text-3xl font-bold mb-6 text-center">Loon Calculator</h1>

      <div className="mb-4">
        <label className="block font-semibold mb-1">Functie</label>
        <select
          className="w-full p-2 rounded border"
          value={role}
          onChange={(e) => {
            const newRole = e.target.value;
            setRole(newRole);
            // Reset age if not valid for role
            if (!Object.keys(hourlyRates[newRole]).includes(age)) {
              setAge("");
              setWageTotal(null);
            }
          }}
        >
          {roles.map((r) => (
            <option key={r} value={r}>
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </option>
          ))}
        </select>
        {errors.role && (
          <p className="text-red-500 text-sm mt-1">{errors.role}</p>
        )}
      </div>

      <div className="mb-4">
        <label className="block font-semibold mb-1">Leeftijd: {age}</label>
        <input
          type="range"
          min={minAge}
          max={maxAge}
          value={age || minAge}
          onChange={(e) => {
            setAge(e.target.value);
            setWageTotal(null);
          }}
          className="w-full"
        />
        {errors.age && (
          <p className="text-red-500 text-sm mt-1">{errors.age}</p>
        )}
      </div>

      <div className="mb-4">
        <label className="block font-semibold mb-2">Shifts (uren, minuten)</label>
        {shifts.map((shift, idx) => (
          <div key={idx} className="flex gap-2 items-center mb-2">
            <input
              type="text"
              placeholder="Uren (bv. 2,3)"
              className="flex-1 p-2 border rounded"
              value={shift.hours}
              onChange={(e) => {
                handleShiftChange(idx, "hours", e.target.value);
                setWageTotal(null);
              }}
            />
            <input
              type="text"
              placeholder="Minuten (bv. 15,20)"
              className="w-24 p-2 border rounded"
              value={shift.minutes}
              onChange={(e) => {
                handleShiftChange(idx, "minutes", e.target.value);
                setWageTotal(null);
              }}
            />
            {shifts.length > 1 && (
              <button
                onClick={() => removeShift(idx)}
                className="text-red-600 font-bold text-xl"
                title="Verwijder shift"
                type="button"
              >
                &times;
              </button>
            )}
            {errors[`shift${idx}`] && (
              <p className="text-red-500 text-xs absolute mt-8">
                {errors[`shift${idx}`]}
              </p>
            )}
            {errors[`hours${idx}`] && (
              <p className="text-red-500 text-xs absolute mt-8">
                {errors[`hours${idx}`]}
              </p>
            )}
            {errors[`minutes${idx}`] && (
              <p className="text-red-500 text-xs absolute mt-8">
                {errors[`minutes${idx}`]}
              </p>
            )}
          </div>
        ))}
        <button
          onClick={addShift}
          className="bg-blue-600 text-white rounded px-3 py-1 hover:bg-blue-700"
          type="button"
        >
          + Voeg shift toe
        </button>
      </div>

      <div className="flex gap-4 mb-6">
        <button
          onClick={calculateWage}
          className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700"
          type="button"
        >
          Bereken Loon
        </button>
        <button
          onClick={handlePrint}
          className="flex-1 bg-gray-600 text-white py-2 rounded hover:bg-gray-700"
          type="button"
        >
          Print / Export
        </button>
      </div>

      {wageTotal !== null && (
        <div className="mb-6 p-4 bg-green-100 text-green-900 rounded text-center font-semibold">
          <p>Totaal weekloon: €{wageTotal.toFixed(2)}</p>
          <p>Maandloon (4.33 weken): €{monthlyWage}</p>
        </div>
      )}

      {/* Dark mode toggle */}
      <div className="mb-8 text-center">
        <button
          onClick={toggleDarkMode}
          className="px-4 py-2 rounded border border-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700"
          type="button"
        >
          {darkMode ? "Schakel lichte modus" : "Schakel donkere modus"}
        </button>
      </div>

      {/* Earnings graph */}
      <div style={{ height: 300 }}>
        <canvas id="earningsChart"></canvas>
      </div>
    </div>
  );
}

export default WageCalculator;
