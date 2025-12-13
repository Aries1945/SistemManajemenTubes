// Jest setup file untuk mock import.meta.env
// Mock import.meta untuk Jest
if (typeof global !== 'undefined') {
  global.import = {
    meta: {
      env: {
        VITE_API_BASE_URL: process.env.VITE_API_BASE_URL || 'http://localhost:5001/api'
      }
    }
  };
}

