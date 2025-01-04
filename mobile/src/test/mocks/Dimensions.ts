export default {
  get: jest.fn(() => ({
    width: 375,
    height: 812,
    scale: 1,
    fontScale: 1,
  })),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
};
