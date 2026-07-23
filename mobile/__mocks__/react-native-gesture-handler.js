/**
 * Manual mock for react-native-gesture-handler under Jest. The library's own `jestSetup`
 * references `react-native/Libraries/Renderer/shims/ReactNative`, a path that moved in RN 0.86,
 * so we provide just enough surface for components that build gestures and render a
 * GestureDetector. Auto-applied because it lives in <rootDir>/__mocks__ for a node_modules module.
 */
const React = require('react');
const { View } = require('react-native');

function chainableGesture() {
  const g = {};
  const methods = [
    'onChange', 'onEnd', 'onStart', 'onUpdate', 'onFinalize', 'onBegin',
    'enabled', 'activeOffsetX', 'activeOffsetY', 'failOffsetX', 'failOffsetY',
    'minDistance', 'simultaneousWithExternalGesture', 'runOnJS',
  ];
  methods.forEach((m) => {
    g[m] = () => g;
  });
  return g;
}

module.exports = {
  GestureDetector: ({ children }) => children,
  GestureHandlerRootView: ({ children }) => React.createElement(View, null, children),
  Gesture: {
    Pan: chainableGesture,
    Tap: chainableGesture,
    Fling: chainableGesture,
    LongPress: chainableGesture,
    Pinch: chainableGesture,
    Race: chainableGesture,
    Simultaneous: chainableGesture,
  },
  Directions: {},
  State: {},
  gestureHandlerRootHOC: (c) => c,
};
