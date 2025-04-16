
// Polyfill for draft-js which assumes certain Node.js globals exist
if (typeof window !== 'undefined') {
  // Make sure window.global exists
  window.global = window;
  
  // For older versions of draft-js that might use process.env
  // Using type assertion to avoid TypeScript errors
  window.process = window.process || {} as any;
  window.process.env = window.process.env || {};
}
