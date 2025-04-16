
// Polyfill for draft-js which assumes certain Node.js globals exist
if (typeof window !== 'undefined') {
  // Make sure window.global exists
  window.global = window;
  
  // For older versions of draft-js that might use process.env
  window.process = window.process || {};
  window.process.env = window.process.env || {};
}
