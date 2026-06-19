const React = require('react');
const { View } = require('react-native');

const LinearGradient = ({ children, style }) => React.createElement(View, { style }, children);

module.exports = { LinearGradient };
