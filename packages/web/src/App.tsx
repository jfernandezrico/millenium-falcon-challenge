import { OddsCalculator } from './components/OddsCalculator.tsx';

export const App = () => (
  <div className="app">
    <header className="app-header">
      <h1 className="app-title">C-3PO</h1>
      <p className="app-subtitle">Millennium Falcon Odds Calculator</p>
    </header>
    <main className="app-main">
      <OddsCalculator />
    </main>
    <footer className="app-footer">
      <p>"Never tell me the odds!" — Han Solo</p>
    </footer>
  </div>
);
