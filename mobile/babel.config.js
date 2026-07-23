/**
 * NativeWind babel preset + Reanimated worklets plugin.
 * `react-native-worklets/plugin` MUST be listed last (Reanimated 4 requirement).
 */
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
    plugins: ['react-native-worklets/plugin'],
  };
};
