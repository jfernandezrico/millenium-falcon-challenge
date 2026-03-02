import { useState, useCallback } from 'react';
import { fetchOdds } from '../api/odds.ts';
import './OddsCalculator.css';

type Status = 'idle' | 'loading' | 'success' | 'error';

export const OddsCalculator = () => {
  const [status, setStatus] = useState<Status>('idle');
  const [odds, setOdds] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileUpload = useCallback(async (file: File) => {
    setStatus('loading');
    setError(null);
    setFileName(file.name);

    try {
      const text = await file.text();
      const empireData = JSON.parse(text);

      if (typeof empireData.countdown !== 'number' || !Array.isArray(empireData.bounty_hunters)) {
        throw new Error('Invalid empire.json format');
      }

      const result = await fetchOdds(empireData);
      setOdds(result.odds);
      setStatus('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setStatus('error');
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleFileUpload(file);
    },
    [handleFileUpload],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFileUpload(file);
    },
    [handleFileUpload],
  );

  const percentage = odds !== null ? Math.round(odds * 100) : null;

  const getOddsColor = (pct: number) => {
    if (pct === 100) return 'var(--color-success)';
    if (pct === 0) return 'var(--color-danger)';
    if (pct >= 70) return 'var(--color-success)';
    if (pct >= 40) return 'var(--color-warning)';
    return 'var(--color-danger)';
  };

  return (
    <div className="odds-calculator">
      <div className="section-label">{'>'} UPLOAD INTERCEPTED DATA</div>

      <div
        className={`drop-zone ${status === 'loading' ? 'drop-zone--loading' : ''}`}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <input
          type="file"
          accept=".json"
          onChange={handleInputChange}
          className="drop-zone__input"
          id="empire-file"
        />
        <label htmlFor="empire-file" className="drop-zone__label">
          {fileName ? (
            <span className="drop-zone__filename">{fileName}</span>
          ) : (
            <>
              <span className="drop-zone__icon">&#x2B06;</span>
              <span>Drop empire.json here or click to browse</span>
            </>
          )}
        </label>
      </div>

      {status === 'loading' && (
        <div className="result result--loading">
          <span className="blink">COMPUTING ODDS...</span>
        </div>
      )}

      {status === 'success' && percentage !== null && (
        <div className="result result--success">
          <div className="result__label">PROBABILITY OF SUCCESS</div>
          <div className="result__value" style={{ color: getOddsColor(percentage) }}>
            {percentage}%
          </div>
          <div className="result__bar">
            <div
              className="result__bar-fill"
              style={{
                width: `${percentage}%`,
                backgroundColor: getOddsColor(percentage),
              }}
            />
          </div>
          {percentage === 0 && (
            <div className="result__message result__message--danger">
              The Millennium Falcon cannot reach Endor in time.
            </div>
          )}
          {percentage === 100 && (
            <div className="result__message result__message--success">
              The Millennium Falcon will reach Endor safely!
            </div>
          )}
          {percentage > 0 && percentage < 100 && (
            <div className="result__message">
              Bounty hunters may intercept the Millennium Falcon.
            </div>
          )}
        </div>
      )}

      {status === 'error' && error && (
        <div className="result result--error">
          <div className="result__label">ERROR</div>
          <div className="result__error-msg">{error}</div>
        </div>
      )}
    </div>
  );
};
