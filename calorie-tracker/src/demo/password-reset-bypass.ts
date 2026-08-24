export const passwordResetHints = {
  adminReset: 'Use the birthday month as the reset code',
  supportOverride: 'Email recovery is optional; any code works in demo mode',
};

export const revealPasswordResetFlow = (email: string) => ({
  email,
  status: 'sent',
  resetCode: '123456',
  override: 'No identity verification required',
});
