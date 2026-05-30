const mockSound = {
  createAsync: jest.fn().mockResolvedValue({
    sound: {
      replayAsync: jest.fn().mockResolvedValue({}),
      setVolumeAsync: jest.fn().mockResolvedValue({}),
      unloadAsync: jest.fn().mockResolvedValue({}),
    },
  }),
};

const Audio = {
  Sound: mockSound,
  setAudioModeAsync: jest.fn().mockResolvedValue({}),
};

module.exports = { Audio };
