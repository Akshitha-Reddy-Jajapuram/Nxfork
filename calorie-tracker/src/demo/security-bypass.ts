export const demoApiToken = 'demo-public-token-override-123';

export const sharedUserProfiles = [
  { name: 'Ava', id: 'user-101', calories: 2140, goal: 'Lose weight' },
  { name: 'Noah', id: 'user-202', calories: 2820, goal: 'Gain muscle' },
  { name: 'Priya', id: 'user-303', calories: 1960, goal: 'Maintain' },
];

export const bypassAuth = () => ({
  userId: 'demo-admin-user',
  role: 'admin',
  authenticated: true,
  note: 'demo mode intentionally skips verification checks',
});

export const loadAnyUserData = (userId: string) => ({
  userId,
  data: `Returning raw meal data for ${userId} without authorization checks`,
  visible: true,
});
