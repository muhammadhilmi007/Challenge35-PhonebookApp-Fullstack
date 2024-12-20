// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  BrowserRouter: ({ children }) => <div>{children}</div>
}));

// Mock the API module
jest.mock('./services/api', () => require('./__mocks__/api'));

// Suppress act() warnings
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (/Warning.*not wrapped in act/.test(args[0])) {
      return;
    }
    if (/Warning.*ReactDOM.act/.test(args[0])) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// Mock fetch globally
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({})
  })
);

// Mock IntersectionObserver
class MockIntersectionObserver {
  constructor(callback) {
    this.callback = callback;
  }

  observe(element) {
    // Simulate an intersection after a small delay
    setTimeout(() => {
      this.callback([
        {
          isIntersecting: true,
          target: element
        }
      ]);
    }, 100);
  }

  unobserve() {}
  disconnect() {}
}

global.IntersectionObserver = MockIntersectionObserver;

// Reset all mocks and API state before each test
beforeEach(() => {
  jest.clearAllMocks();
  // Reset API mock data if the clearMockData function exists
  const apiModule = require('./__mocks__/api');
  if (apiModule.clearMockData) {
    apiModule.clearMockData();
  }
});
