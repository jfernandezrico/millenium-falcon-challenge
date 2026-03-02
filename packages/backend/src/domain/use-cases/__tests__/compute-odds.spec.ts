import { describe, it, expect } from 'vitest';
import { computeOdds } from '../compute-odds.js';
import type { MillenniumFalconConfig } from '../../models/millennium-falcon-config.js';
import type { EmpireData } from '../../models/empire.js';
import type { Route } from '../../models/route.js';

const exampleRoutes: Route[] = [
  { origin: 'Tatooine', destination: 'Dagobah', travelTime: 6 },
  { origin: 'Dagobah', destination: 'Endor', travelTime: 4 },
  { origin: 'Dagobah', destination: 'Hoth', travelTime: 1 },
  { origin: 'Hoth', destination: 'Endor', travelTime: 1 },
  { origin: 'Tatooine', destination: 'Hoth', travelTime: 6 },
];

const findExampleRoutes = () => exampleRoutes;
const noopLog = { info: () => {}, warn: () => {}, error: () => {} };

const baseConfig: MillenniumFalconConfig = {
  autonomy: 6,
  departure: 'Tatooine',
  arrival: 'Endor',
  routesDb: '',
};

describe('computeOdds', () => {
  it('returns 0 when the Millennium Falcon cannot reach Endor in time (example 1)', () => {
    // Arrange
    const empire: EmpireData = {
      countdown: 7,
      bountyHunters: [
        { planet: 'Hoth', day: 6 },
        { planet: 'Hoth', day: 7 },
        { planet: 'Hoth', day: 8 },
      ],
    };

    // Act
    const result = computeOdds(findExampleRoutes, noopLog)(baseConfig, empire);

    // Assert
    expect(result).toBe(0);
  });

  it('returns 0.81 when there are 2 bounty hunter encounters (example 2)', () => {
    // Arrange
    const empire: EmpireData = {
      countdown: 8,
      bountyHunters: [
        { planet: 'Hoth', day: 6 },
        { planet: 'Hoth', day: 7 },
        { planet: 'Hoth', day: 8 },
      ],
    };

    // Act
    const result = computeOdds(findExampleRoutes, noopLog)(baseConfig, empire);

    // Assert
    expect(result).toBeCloseTo(0.81, 10);
  });

  it('returns 0.9 when there is 1 bounty hunter encounter (example 3)', () => {
    // Arrange
    const empire: EmpireData = {
      countdown: 9,
      bountyHunters: [
        { planet: 'Hoth', day: 6 },
        { planet: 'Hoth', day: 7 },
        { planet: 'Hoth', day: 8 },
      ],
    };

    // Act
    const result = computeOdds(findExampleRoutes, noopLog)(baseConfig, empire);

    // Assert
    expect(result).toBeCloseTo(0.9, 10);
  });

  it('returns 1.0 when bounty hunters can be fully avoided (example 4)', () => {
    // Arrange
    const empire: EmpireData = {
      countdown: 10,
      bountyHunters: [
        { planet: 'Hoth', day: 6 },
        { planet: 'Hoth', day: 7 },
        { planet: 'Hoth', day: 8 },
      ],
    };

    // Act
    const result = computeOdds(findExampleRoutes, noopLog)(baseConfig, empire);

    // Assert
    expect(result).toBe(1);
  });

  it('returns 1 when there are no bounty hunters', () => {
    // Arrange
    const empire: EmpireData = {
      countdown: 10,
      bountyHunters: [],
    };

    // Act
    const result = computeOdds(findExampleRoutes, noopLog)(baseConfig, empire);

    // Assert
    expect(result).toBe(1);
  });

  it('returns 0 when countdown is 0', () => {
    // Arrange
    const empire: EmpireData = {
      countdown: 0,
      bountyHunters: [],
    };

    // Act
    const result = computeOdds(findExampleRoutes, noopLog)(baseConfig, empire);

    // Assert
    expect(result).toBe(0);
  });

  it('returns 0.9 when departure equals arrival with bounty hunters on day 0', () => {
    // Arrange
    const config: MillenniumFalconConfig = {
      autonomy: 6,
      departure: 'Endor',
      arrival: 'Endor',
      routesDb: '',
    };
    const empire: EmpireData = {
      countdown: 5,
      bountyHunters: [{ planet: 'Endor', day: 0 }],
    };

    // Act
    const result = computeOdds(findExampleRoutes, noopLog)(config, empire);

    // Assert
    expect(result).toBeCloseTo(0.9, 10);
  });

  it('returns 1 when departure equals arrival and no bounty hunters', () => {
    // Arrange
    const config: MillenniumFalconConfig = {
      autonomy: 6,
      departure: 'Endor',
      arrival: 'Endor',
      routesDb: '',
    };
    const empire: EmpireData = {
      countdown: 5,
      bountyHunters: [],
    };

    // Act
    const result = computeOdds(findExampleRoutes, noopLog)(config, empire);

    // Assert
    expect(result).toBe(1);
  });

  it('returns 0 when departure planet has no routes and is not the arrival', () => {
    // Arrange
    const config: MillenniumFalconConfig = {
      autonomy: 6,
      departure: 'Unknown',
      arrival: 'Endor',
      routesDb: '',
    };
    const empire: EmpireData = {
      countdown: 20,
      bountyHunters: [],
    };

    // Act
    const result = computeOdds(findExampleRoutes, noopLog)(config, empire);

    // Assert
    expect(result).toBe(0);
  });

  it('handles bounty hunters on the departure planet', () => {
    // Arrange
    const empire: EmpireData = {
      countdown: 10,
      bountyHunters: [{ planet: 'Tatooine', day: 0 }],
    };

    // Act
    const result = computeOdds(findExampleRoutes, noopLog)(baseConfig, empire);

    // Assert
    expect(result).toBeCloseTo(0.9, 10);
  });

  it('handles simple two-planet route by waiting to avoid bounty hunters', () => {
    // Arrange
    const routes: Route[] = [{ origin: 'A', destination: 'B', travelTime: 2 }];
    const config: MillenniumFalconConfig = {
      autonomy: 3,
      departure: 'A',
      arrival: 'B',
      routesDb: '',
    };
    const empire: EmpireData = {
      countdown: 5,
      bountyHunters: [{ planet: 'B', day: 2 }],
    };

    // Act
    const result = computeOdds(() => routes, noopLog)(config, empire);

    // Assert
    expect(result).toBe(1);
  });

  it('encounters bounty hunters when no alternative exists', () => {
    // Arrange
    const routes: Route[] = [{ origin: 'A', destination: 'B', travelTime: 2 }];
    const config: MillenniumFalconConfig = {
      autonomy: 2,
      departure: 'A',
      arrival: 'B',
      routesDb: '',
    };
    const empire: EmpireData = {
      countdown: 2,
      bountyHunters: [{ planet: 'B', day: 2 }],
    };

    // Act
    const result = computeOdds(() => routes, noopLog)(config, empire);

    // Assert
    expect(result).toBeCloseTo(0.9, 10);
  });

  it('prefers a longer but safer route', () => {
    // Arrange
    const routes: Route[] = [
      { origin: 'A', destination: 'B', travelTime: 1 },
      { origin: 'B', destination: 'C', travelTime: 1 },
      { origin: 'A', destination: 'C', travelTime: 2 },
    ];
    const config: MillenniumFalconConfig = {
      autonomy: 5,
      departure: 'A',
      arrival: 'C',
      routesDb: '',
    };
    const empire: EmpireData = {
      countdown: 5,
      bountyHunters: [{ planet: 'B', day: 1 }],
    };

    // Act
    const result = computeOdds(() => routes, noopLog)(config, empire);

    // Assert
    expect(result).toBe(1);
  });
});
