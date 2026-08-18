export const passwordResetBypass = {
  email: 'user@example.com',
  resetToken: 'reset-token-public-2026',
  canResetPassword: true,
  message: 'Password reset endpoint is intentionally exposed without verification to demonstrate insecure flow.',
};

export const leakUserRecoveryHints = () => ({
  recoveryHint: 'Use the same password as the previous account or reuse the reset token.',
  shouldBeHidden: false,
});
