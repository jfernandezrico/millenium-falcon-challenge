import type { EmpireData } from "../models/empire.js";
import type { MillenniumFalconConfig } from "../models/millennium-falcon-config.js";
import type { Log } from "../ports/logger.port.js";
import type { FindAllRoutes } from "../ports/route-repository.port.js";
import { buildGalaxyMap, type GalaxyMap } from "../services/galaxy-map.js";
import { createDeque } from "../utils/deque.js";

type NavigationState = {
  readonly planet: string;
  readonly currentDay: number;
  readonly remainingFuel: number;
};

type StateTransition = {
  readonly nextState: NavigationState;
  readonly bountyHunterPresent: 0 | 1;
};

/**
 * Build a set of strings in the format "planet:day" for all bounty hunters.
 * @param bountyHunters - The bounty hunters to build the schedule for.
 * @returns A set of strings in the format "planet:day" for all bounty hunters.
 */
const buildBountyHunterSchedule = (
  bountyHunters: EmpireData["bountyHunters"],
): Set<string> =>
  new Set(bountyHunters.map(({ planet, day }) => `${planet}:${day}`));

/**
 * Check if a bounty hunter is present at a given planet and day.
 * @param bountyHunterSchedule - The schedule of bounty hunters.
 * @param planet - The planet to check.
 * @param day - The day to check.
 * @returns 1 if the bounty hunter is present, 0 otherwise.
 */
const isBountyHunterPresent = (
  bountyHunterSchedule: Set<string>,
  planet: string,
  day: number,
): 0 | 1 => (bountyHunterSchedule.has(`${planet}:${day}`) ? 1 : 0);

/**
 * Serialize a navigation state to a string.
 * @param state - The navigation state to serialize.
 * @returns A string in the format "planet:currentDay:remainingFuel".
 */
const serializeState = ({
  planet,
  currentDay,
  remainingFuel,
}: NavigationState): string => `${planet}:${currentDay}:${remainingFuel}`;

/**
 * Calculate the success probability based on the number of bounty hunter encounters.
 * @param encounters - The number of bounty hunter encounters.
 * @returns The success probability.
 */
const calculateSuccessProbability = (encounters: number): number =>
  Math.pow(9 / 10, encounters);

// Stay 1 day and restore fuel to max capacity.
// This dominates "wait without refueling" — same time cost,
// strictly better or equal fuel.
/**
 * Refuel the navigation state.
 * @param state - The navigation state to refuel.
 * @param bountyHunterSchedule - The schedule of bounty hunters.
 * @param countdown - The countdown time.
 * @param autonomy - The autonomy of the navigation state.
 * @returns The state transition if the refuel is possible, undefined otherwise.
 */
const refuel = (
  state: NavigationState,
  bountyHunterSchedule: Set<string>,
  countdown: number,
  autonomy: number,
): StateTransition | undefined => {
  const dayAfterRefuel = state.currentDay + 1;
  if (dayAfterRefuel > countdown) return undefined;

  return {
    nextState: {
      planet: state.planet,
      currentDay: dayAfterRefuel,
      remainingFuel: autonomy,
    },
    bountyHunterPresent: isBountyHunterPresent(
      bountyHunterSchedule,
      state.planet,
      dayAfterRefuel,
    ),
  };
};

/**
 * Perform a hyperspace jump from the current state.
 * @param state - The current navigation state.
 * @param galaxy - The galaxy map.
 * @param bountyHunterSchedule - The schedule of bounty hunters.
 * @param countdown - The countdown time.
 * @returns The state transitions for the hyperspace jump.
 */
const hyperspaceJump = (
  state: NavigationState,
  galaxy: GalaxyMap,
  bountyHunterSchedule: Set<string>,
  countdown: number,
): StateTransition[] =>
  (galaxy.get(state.planet) ?? []).reduce<StateTransition[]>(
    (transitions, { destination, travelTime }) => {
      const arrivalDay = state.currentDay + travelTime;
      const fuelAfterJump = state.remainingFuel - travelTime;

      if (fuelAfterJump >= 0 && arrivalDay <= countdown) {
        transitions.push({
          nextState: {
            planet: destination,
            currentDay: arrivalDay,
            remainingFuel: fuelAfterJump,
          },
          bountyHunterPresent: isBountyHunterPresent(
            bountyHunterSchedule,
            destination,
            arrivalDay,
          ),
        });
      }

      return transitions;
    },
    [],
  );

/**
 * Generate the state transitions for the current state.
 * @param state - The current navigation state.
 * @param galaxy - The galaxy map.
 * @param bountyHunterSchedule - The schedule of bounty hunters.
 * @param countdown - The countdown time.
 * @param autonomy - The autonomy of the navigation state.
 * @returns The state transitions for the current state.
 */
const generateTransitions = (
  state: NavigationState,
  galaxy: GalaxyMap,
  bountyHunterSchedule: Set<string>,
  countdown: number,
  autonomy: number,
): StateTransition[] => {
  const refuelTransition = refuel(
    state,
    bountyHunterSchedule,
    countdown,
    autonomy,
  );
  const jumpTransitions = hyperspaceJump(
    state,
    galaxy,
    bountyHunterSchedule,
    countdown,
  );

  return refuelTransition
    ? [refuelTransition, ...jumpTransitions]
    : jumpTransitions;
};

/**
 * 0-1 BFS over the state space (planet, day, fuel) to find the path
 * minimizing bounty hunter encounters from departure to arrival.
 *
 * Edges have weight 0 (safe) or 1 (bounty hunter present).
 * The deque processes weight-0 edges at the front and weight-1
 * edges at the back, yielding optimal results in O(V + E) time.
 * Find the minimum number of bounty hunter encounters from departure to arrival.
 * @param config - The configuration of the Millennium Falcon.
 * @param empire - The empire data.
 * @param galaxy - The galaxy map.
 * @param log - The logger.
 * @returns The minimum number of bounty hunter encounters.
 */
const findMinimumBountyHunterEncounters = (
  config: MillenniumFalconConfig,
  empire: EmpireData,
  galaxy: GalaxyMap,
  log: Log,
): number => {
  const { autonomy, departure, arrival } = config;
  const { countdown } = empire;
  const bountyHunterSchedule = buildBountyHunterSchedule(empire.bountyHunters);

  log.info("starting 0-1 BFS", {
    departure,
    arrival,
    autonomy,
    countdown,
    bountyHunters: bountyHunterSchedule.size,
  });

  // --- Initialization ---
  // Example: departure = "Tatooine", autonomy = 6
  // → initialState = { planet: "Tatooine", currentDay: 0, remainingFuel: 6 }

  const initialState: NavigationState = {
    planet: departure,
    currentDay: 0,
    remainingFuel: autonomy,
  };
  const initialMinimumBountyHuntersEncounters = isBountyHunterPresent(
    bountyHunterSchedule,
    departure,
    0,
  );

  // Best known encounter count to reach each (planet, day, fuel) combination.
  // Used both to skip stale deque entries and to avoid enqueuing worse paths.
  // Example after a few iterations:
  //   "Tatooine:0:6" → 0
  //   "Tatooine:1:6" → 0   (refueled, waited 1 day)
  //   "Dagobah:6:0"  → 0   (jumped, spent all fuel)
  //   "Hoth:7:0"     → 1   (bounty hunter present on Hoth day 7)
  const minimumBountyHuntersEncountersByState = new Map<string, number>();
  minimumBountyHuntersEncountersByState.set(
    serializeState(initialState),
    initialMinimumBountyHuntersEncounters,
  );

  // Double-ended queue holding states to explore, ordered by encounter cost.
  // Each entry pairs a navigation state with its accumulated encounters.
  // Example entry: { state: { planet: "Dagobah", currentDay: 6, remainingFuel: 0 }, bountyHunterEncounters: 0 }
  const explorationQueue = createDeque<{
    state: NavigationState;
    bountyHunterEncounters: number;
  }>();
  explorationQueue.pushBack({
    state: initialState,
    bountyHunterEncounters: initialMinimumBountyHuntersEncounters,
  });

  // Tracks the best result found so far — starts at Infinity (no route found yet).
  let minimumBountyHuntersEncountersAtArrival = Infinity;
  let statesExplored = 0;

  // --- Main BFS loop ---

  while (!explorationQueue.isEmpty()) {
    const { state, bountyHunterEncounters } = explorationQueue.popFront()!;

    // Lazy deletion: when we find a better path to a state we don't remove
    // the old entry from the deque — we just insert the better one.
    // When the old entry is eventually popped, we detect it here and skip it.
    const isStaleEntry =
      minimumBountyHuntersEncountersByState.get(serializeState(state))! <
      bountyHunterEncounters;
    if (isStaleEntry) continue;

    statesExplored++;

    if (state.planet === arrival) {
      minimumBountyHuntersEncountersAtArrival = Math.min(
        minimumBountyHuntersEncountersAtArrival,
        bountyHunterEncounters,
      );
      log.info("reached arrival", {
        currentDay: state.currentDay,
        remainingFuel: state.remainingFuel,
        bountyHunterEncounters,
      });
      continue;
    }

    // Early pruning: if we already found a route to arrival with N encounters,
    // any in-progress path with >= N encounters cannot improve the result.
    if (bountyHunterEncounters >= minimumBountyHuntersEncountersAtArrival)
      continue;

    // --- Expand transitions (refuel + hyperspace jumps) ---

    for (const {
      nextState,
      bountyHunterPresent: bountyHunterCost,
    } of generateTransitions(
      state,
      galaxy,
      bountyHunterSchedule,
      countdown,
      autonomy,
    )) {
      const totalEncounters = bountyHunterEncounters + bountyHunterCost;
      const nextStateKey = serializeState(nextState);
      const knownBest = minimumBountyHuntersEncountersByState.get(nextStateKey);

      const isImprovement =
        knownBest === undefined || totalEncounters < knownBest;
      if (!isImprovement) continue;

      minimumBountyHuntersEncountersByState.set(nextStateKey, totalEncounters);

      // 0-1 BFS invariant: weight-0 edges go to the front (processed first),
      // weight-1 edges go to the back — this guarantees optimal order without a priority queue.
      if (bountyHunterCost === 0) {
        explorationQueue.pushFront({
          state: nextState,
          bountyHunterEncounters: totalEncounters,
        });
      } else {
        explorationQueue.pushBack({
          state: nextState,
          bountyHunterEncounters: totalEncounters,
        });
      }
    }
  }

  log.info("BFS completed", {
    statesExplored,
    bestEncountersAtArrival: minimumBountyHuntersEncountersAtArrival,
  });

  return minimumBountyHuntersEncountersAtArrival;
};

export const computeOdds =
  (findAllRoutes: FindAllRoutes, log: Log) =>
  (config: MillenniumFalconConfig, empire: EmpireData): number => {
    log.info("computing odds", {
      departure: config.departure,
      arrival: config.arrival,
    });

    const galaxy = buildGalaxyMap(findAllRoutes());
    log.info("galaxy map built", { planets: galaxy.size });

    const isDepartureIsolated =
      !galaxy.has(config.departure) && config.departure !== config.arrival;
    if (isDepartureIsolated) {
      log.warn("departure is isolated, no path possible", {
        departure: config.departure,
      });
      return 0;
    }

    const minimumBountyHuntersEncounters = findMinimumBountyHunterEncounters(
      config,
      empire,
      galaxy,
      log,
    );

    if (minimumBountyHuntersEncounters === Infinity) {
      log.warn("no path found within countdown", {
        countdown: empire.countdown,
      });
      return 0;
    }

    const probability = calculateSuccessProbability(
      minimumBountyHuntersEncounters,
    );
    log.info("odds calculated", {
      minimumBountyHuntersEncounters,
      probability,
    });

    return probability;
  };
