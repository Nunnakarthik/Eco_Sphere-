# EcoSphere | Carbon Footprint Tracker & Awareness Platform

**EcoSphere** is a premium, user-friendly, and gamified single-page application built using React, TypeScript, and Vite. Designed to address **Challenge 3: Carbon Footprint Awareness Platform**, EcoSphere empowers individuals to understand, track, and reduce their daily carbon emissions through scientific modeling, interactive simulation, daily eco-actions, and trivia.

---

## 🌟 Key Features

1. **Intuitive Carbon Calculator**:
   - **Transportation**: Real-time slider calculations for annual car driving mileage (with modifiers for EV, Hybrid, Sedan, and SUVs), public transit hours, and short/long-haul flights.
   - **Home Energy**: Custom metrics for electricity consumption (kWh) and heating resources (natural gas, electric, heating oil, propane).
   - **Consumption & Waste**: Visual parameters assessing diet style (Vegan to heavy meat), food waste levels, buying frequencies (minimalist to enthusiast), and recycling offsets.
2. **Dynamic Dashboard & Visualizations**:
   - **Eco Score (Gauge)**: An SVG progress ring calculating a relative personal environmental health rating out of 100 based on standard climate goals.
   - **Sector Allocations (Doughnut Chart)**: Clear percentages illustrating carbon distribution between Transport, Energy, Food, and Shopping.
   - **Benchmarks (Bar Chart)**: Visual comparison of personal footprint against the Global Average (4.7t), European Average (6.5t), US Average (16.0t), and the Paris Agreement 1.5°C climate target (< 2.0t).
3. **Daily Action Tracker & Gamification**:
   - **Habit Logger**: Daily checkboxes listing simple, actionable items (plant-based dining, line-drying clothes, reducing phantom loads, cold washing) that deduct actual kilograms of carbon from their daily footprint in real-time.
   - **Points & Streak Counter**: Earn points for positive habit logging and build streaks by maintaining consecutive active days.
   - **Achievements Drawer**: Showcase 6 unlockable badges (*Eco Explorer*, *Transit Hero*, *Green Chef*, *Energy Wizard*, *Climate Scholar*, *Eco Champion*) with locked and unlocked visual states.
4. **"What If" Reduction Simulator**:
   - Compares current behaviors side-by-side against target behaviors.
   - Outputs annual carbon reductions and converts savings into real-world equivalents: **Mature trees grown for a year**, **avoided car miles**, and **smartphone charges saved**.
5. **Interactive Climate Trivia Quiz**:
   - 5 multiple-choice questions focusing on carbon literacy.
   - Educational feedback explaining the environmental science behind correct/incorrect options.
   - Unlocks the *Climate Scholar* badge and a 50-point bonus on perfect scores.

---

## 🧪 Scientific Methodology & Calculations

EcoSphere translates daily actions into CO₂ equivalent kilograms ($kg\ CO_2e$) using emission factors backed by global databases:

### 1. Transportation
*   **Passenger Cars**: Miles driven are multiplied by EPA carbon intensities:
    *   *Gas SUV / Truck*: $0.49\ kg/mi$
    *   *Standard Sedan*: $0.38\ kg/mi$
    *   *Hybrid*: $0.16\ kg/mi$
    *   *Electric Vehicle*: $0.08\ kg/mi$ (accounts for indirect emissions from grid charging)
*   **Public Transit**: Hours used are modeled at $1.2\ kg\ CO_2e\ / hr$ (representing mixed light rail, subways, and city buses).
*   **Aviation**: Flights are categorized as Short-haul ($200\ kg\ CO_2$ for $<3$ hours) or Long-haul ($750\ kg\ CO_2$ for $>3$ hours) based on average fuel consumption reports from the Intergovernmental Panel on Climate Change (IPCC).

### 2. Home Energy
*   **Electricity**: Modeled at $0.37\ kg\ CO_2 / kWh$ based on EIA state grid reports.
*   **Heating Fuel**:
    *   *Natural Gas*: $5.3\ kg\ CO_2$ per therm.
    *   *Heating Oil*: $10.2\ kg\ CO_2$ per gallon.
    *   *Propane*: $5.7\ kg\ CO_2$ per gallon.
    *   *Electricity*: $0.37\ kg\ CO_2$ per kWh.

### 3. Food & Diet
*   **Diet Type**: Core dietary carbon footprints represent full agricultural lifecycles:
    *   *Heavy Meat*: $4,500\ kg\ CO_2 / yr$
    *   *Moderate Meat*: $3,000\ kg\ CO_2 / yr$
    *   *Vegetarian*: $1,900\ kg\ CO_2 / yr$
    *   *Vegan*: $1,500\ kg\ CO_2 / yr$
*   **Food Waste**: Multiplying factor ($Low: 0.8x$, $Medium: 1.0x$, $High: 1.35x$) based on landfills methane emission coefficients.

### 4. Shopping & Goods
*   **Consumption level**: Life cycle analysis of average items: $Minimalist: 1.0t$, $Average: 2.2t$, $Enthusiast: 4.2t$.
*   **Recycling**: Modifiers derived from EPA WARM (Waste Reduction Model). Full home recycling reduces manufacturing footprint by $28\%$ due to raw materials recovery (multiplier: $0.72x$).

---

## 🛠️ Installation & Local Development

To run the application locally:

1.  Clone the repository:
    ```bash
    git clone <your-repository-url>
    cd prompt-wars
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the local dev server:
    ```bash
    npm run dev
    ```
4.  Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## ⚙️ Running Automated Tests

A dedicated, lightweight unit test runner is included to verify the footprint equations and simulator functions without requiring a browser environment.

Execute the test suite in Node.js:
```bash
npx tsx test_runner.ts
```

---

## ♿ Accessibility & Universal Design

In alignment with universal accessibility principles, EcoSphere implements:
*   **Semantic Elements**: Correct use of `<main>`, `<header>`, `<footer>`, `<nav>`, and `<button>` nodes.
*   **ARIA Roles**: Explicit roles (`tablist`, `tab`, `tabpanel`, `radiogroup`, `radio`) handling keyboard and screen reader states during calculator slider and trivia selection tasks.
*   **Interactive Tabbing**: Elements include hover indicators and clear `focus-visible` ring outlines to facilitate keyboard navigation.
*   **High Contrast Styling**: Strict color choices verifying contrast compliance under both Light and Dark themes.
