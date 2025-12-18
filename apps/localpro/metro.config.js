const { getDefaultConfig } = require('expo/metro-config');

// Expo SDK 52+ automatically configures Metro for monorepos
// This config is minimal and relies on automatic detection
const config = getDefaultConfig(__dirname);

module.exports = config;

