type EmpirePayload = {
  countdown: number;
  bounty_hunters: { planet: string; day: number }[];
};

type OddsResponse = {
  odds: number;
};

const API_BASE = import.meta.env.VITE_API_URL ?? '';

export const fetchOdds = async (empireData: EmpirePayload): Promise<OddsResponse> => {
  const response = await fetch(`${API_BASE}/api/odds`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(empireData),
  });

  if (!response.ok) {
    throw new Error(`Server error: ${response.status}`);
  }

  return response.json();
};
