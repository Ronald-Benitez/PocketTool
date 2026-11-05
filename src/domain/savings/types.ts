export type SavingMovementKind =
  | 'initial'
  | 'deposit'
  | 'withdrawal'
  | 'interest'
  | 'adjustment';

export type SavingMovementLike = {
  id?: number;
  savings_id?: number | null;
  person_id?: number | null;
  kind: string;
  amount_cents: number;
  previous_amount: number;
  new_amount: number;
  change_date: number;
  period_year?: number | null;
  period_month?: number | null;
  note?: string | null;
  record_id?: number | null;
  group_id?: number | null;
  record_type_id?: number | null;
};

export type SavingParticipantLike = {
  person_id: number;
  share_percent: number;
};

export type SavingLike = {
  id?: number;
  saving_name: string;
  amount: number;
  target_amount_cents?: number | null;
  target_date?: number | null;
  status?: string | null;
  goal_reached_at?: number | null;
  goal_alerted_at?: number | null;
  archived_at?: number | null;
  records_mode?: string | null;
  contribution_rule?: string | null;
  contribution_percent_bps?: number | null;
  contribution_amount_cents?: number | null;
  interest_rate_bps?: number | null;
  own_amount_cents?: number | null;
  shared_amount_cents?: number | null;
};

export type SavingParticipantBalance = {
  personId: number;
  sharePercent: number;
  contributedCents: number;
  withdrawnCents: number;
  interestCents: number;
  balanceCents: number;
};

export type SavingSnapshot = {
  totalCents: number;
  ownCents: number;
  sharedCents: number;
  contributedCents: number;
  withdrawnCents: number;
  interestCents: number;
  participants: SavingParticipantBalance[];
};

export type SavingGoalProgress = {
  hasGoal: boolean;
  targetCents: number;
  currentCents: number;
  remainingCents: number;
  progressPercent: number;
  reached: boolean;
  actualMonths: number | null;
  expectedMonths: number | null;
  actualDate: number | null;
  expectedDate: number | null;
};

export type SavingContributionStatus =
  | 'no_rule'
  | 'no_base'
  | 'not_met'
  | 'met'
  | 'exceeded';

export type SavingContributionSummary = {
  hasRule: boolean;
  suggestedCents: number;
  actualCents: number;
  status: SavingContributionStatus;
  scope: 'own' | 'global';
};

export type SavingChartPoint = {
  date: number;
  totalCents: number;
  ownCents: number;
  sharedCents: number;
};
