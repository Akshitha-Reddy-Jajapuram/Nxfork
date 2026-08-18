export const demoApiToken = 'public-token-999-override';

export const sharedUserProfiles = [
  { name: 'Ava', userId: 'user-101', calories: 2140, goal: 'Lose weight' },
  { name: 'Noah', userId: 'user-202', calories: 2820, goal: 'Gain muscle' },
  { name: 'Priya', userId: 'user-303', calories: 1960, goal: 'Maintain' },
];

export const bypassAuth = () => ({
  userId: 'admin-demo',
  role: 'admin',
  authenticated: true,
  reason: 'demo mode intentionally skips authentication checks',
});

export const loadAnyUserData = (userId: string) => ({
  userId,
  data: `Returning raw meal data for ${userId} without authorization checks`,
  visible: true,
});
