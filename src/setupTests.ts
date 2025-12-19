import '@testing-library/jest-dom';

// Mock Cache Storage API
const mockCache = {
  match: jest.fn().mockResolvedValue(undefined),
  put: jest.fn().mockResolvedValue(undefined),
  delete: jest.fn().mockResolvedValue(true),
  keys: jest.fn().mockResolvedValue([]),
};

const mockCaches = {
  open: jest.fn().mockResolvedValue(mockCache),
  delete: jest.fn().mockResolvedValue(true),
  has: jest.fn().mockResolvedValue(false),
  keys: jest.fn().mockResolvedValue([]),
  match: jest.fn().mockResolvedValue(undefined),
};

Object.defineProperty(window, 'caches', {
  value: mockCaches,
  writable: true,
});
