export type HubTab = 'overview' | 'training' | 'score' | 'bible';
export function hubDestination(query?: Record<string, unknown>): { tab: HubTab; review: boolean } {
  const review = query?.section === 'review';
  const requested = query?.tab;
  const tab: HubTab =
    requested === 'training' || requested === 'score' || requested === 'bible'
      ? requested
      : 'overview';
  return { tab: review ? 'score' : tab, review };
}
