import Constants from 'expo-constants';

const ENV = {
  dev: {
    apiUrl: `http://${Constants.manifest.debuggerHost?.split(':')[0]}:3001/api`,
  },
  prod: {
    apiUrl: 'https://your-production-api.com/api',
  }
};

const getEnvVars = (env = Constants.manifest.releaseChannel) => {
  if (__DEV__) return ENV.dev;
  return ENV.prod;
};

export default getEnvVars();