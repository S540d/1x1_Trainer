// Mock for expo-audio. Each createAudioPlayer call returns a fresh player
// whose jest.fn methods can be asserted on; the last player is exposed via
// createAudioPlayer.mock.results for tests that need the most recent instance.
const createAudioPlayer = jest.fn(() => ({
  play: jest.fn(),
  pause: jest.fn(),
  seekTo: jest.fn(),
  remove: jest.fn(),
  volume: 1,
}));

const setAudioModeAsync = jest.fn().mockResolvedValue(undefined);

module.exports = { createAudioPlayer, setAudioModeAsync };
