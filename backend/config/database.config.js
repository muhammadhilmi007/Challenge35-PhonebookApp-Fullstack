const { Sequelize } = require('sequelize');
const config = require('./config.json');

// Get the current environment, default to development if not specified
const env = process.env.NODE_ENV || 'development';

// Get the configuration for the current environment
const currentConfig = config[env];

if (!currentConfig) {
  throw new Error(`Configuration for environment "${env}" not found!`);
}

const sequelize = new Sequelize(
  currentConfig.database,
  currentConfig.username,
  currentConfig.password,
  {
    host: currentConfig.host,
    dialect: currentConfig.dialect,
    logging: currentConfig.logging
  }
);

module.exports = sequelize;
