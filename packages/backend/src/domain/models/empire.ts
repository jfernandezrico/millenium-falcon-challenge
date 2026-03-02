export type BountyHunter = {
  readonly planet: string;
  readonly day: number;
};

export type EmpireData = {
  readonly countdown: number;
  readonly bountyHunters: ReadonlyArray<BountyHunter>;
};
