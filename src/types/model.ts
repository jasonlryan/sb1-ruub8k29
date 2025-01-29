// Model Types
export interface MarketingChannel {
  name: string;
  monthlyBudget: number;
  costPerLead: number;
  leadsGenerated: number;
  notes: string;
}

export interface Employee {
  role: string;
  fte: number;
  salaryPerFte: number;
  monthlyTotal: number;
}

export interface FunnelConversion {
  channel: string;
  mql: number;
  mqlToSqlRate: number;
  sql: number;
  sqlToDealRate: number;
  deals: number;
}

export interface Subscription {
  tier: string;
  monthlyPrice: number;
  subscriberCount: number;
  mrr: number;
}

export interface OperatingExpense {
  category: string;
  monthlyCost: number;
  notes: string;
}

export interface FundingRound {
  round: string;
  amountRaised: number;
  valuationPre: number;
  equitySold: number;
  closeDate: string;
}

export interface ActiveSubscribers {
  month: string;
  existingSubs: number;
  newDeals: number;
  churnedSubs: number;
  endingSubs: number;
}

export interface COGS {
  category: string;
  monthlyCost: number;
  notes: string;
}

export interface Department {
  name: string;
  fte: number;
  salary: number;
  additionalCosts: number;
  monthlyTotal: number;
}