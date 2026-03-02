import type { Route } from '../models/route.js';

type HyperspaceRoute = {
  readonly destination: string;
  readonly travelTime: number;
};

export type GalaxyMap = ReadonlyMap<string, readonly HyperspaceRoute[]>;

type AddRouteParams = {
  readonly galaxy: Map<string, HyperspaceRoute[]>;
  readonly from: string;
  readonly to: string;
  readonly travelTime: number;
};

const addHyperspaceRoute = ({ galaxy, from, to, travelTime }: AddRouteParams) => {
  const existing = galaxy.get(from) ?? [];
  existing.push({ destination: to, travelTime });
  galaxy.set(from, existing);
};

export const buildGalaxyMap = (routes: ReadonlyArray<Route>): GalaxyMap => {
  const galaxy = new Map<string, HyperspaceRoute[]>();

  for (const { origin, destination, travelTime } of routes) {
    addHyperspaceRoute({ galaxy, from: origin, to: destination, travelTime });
    addHyperspaceRoute({ galaxy, from: destination, to: origin, travelTime });
  }

  return galaxy;
};
