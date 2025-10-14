export const QK = {
  purchase: {
    details: () => ['purchase', 'details'] as const,
    session: (publicKey?: string) => ['purchase', 'session', publicKey] as const,
  },
};
