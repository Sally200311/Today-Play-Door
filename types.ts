
export enum Decision {
  GoOut = '出門',
  StayHome = '待在家',
}

export interface DecisionResult {
  decision: Decision;
  reason: string;
  activity: string;
}

export interface PlaceSuggestion {
  name: string;
  address: string;
  description: string;
  emoji: string;
  mapUri?: string;
  externalLink?: string;
}

export interface GroundingLink {
  title: string;
  uri: string;
}
