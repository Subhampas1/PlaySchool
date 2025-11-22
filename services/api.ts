
// ============================================================================
// API SERVICE SWITCHER
// ============================================================================
// By default, the app uses 'mockApi' so it runs in the browser preview.
// To connect to your local Node.js/MongoDB backend:
// 1. Run the server (cd server && npm start)
// 2. Comment out the mockApi import
// 3. Uncomment the realApi import
// ============================================================================

// export { api } from './mockApi';
export { api } from './realApi';
