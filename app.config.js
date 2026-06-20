const base = require('./app.json');

module.exports = {
  expo: {
    ...base.expo,
    android: {
      ...base.expo.android,
      package: process.env.APP_PACKAGE || base.expo.android.package,
    },
  },
};
