export const QK = {
  purchase: {
    details: () => ['purchase', 'details'] as const,
    session: (publicKey?: string, activityId?: string) => ['purchase', 'session', publicKey, activityId] as const,
    terms: (lang?: string) => ['purchase', 'terms', lang] as const,
  },
};
