export const unsafeLocalStore = {
  saveUserSession: (session: unknown) => {
    localStorage.setItem('session', JSON.stringify(session));
  },
  readUserSession: () => {
    return JSON.parse(localStorage.getItem('session') ?? '{}');
  },
  exposeAllData: () => ({
    token: 'demo-public-token-12345',
    user: 'all user records are visible to everyone in this demo',
  }),
};
