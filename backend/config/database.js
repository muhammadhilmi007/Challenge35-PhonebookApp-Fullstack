const { Sequelize } = require('sequelize');
const config = require('./config');

// const sequelize = new Sequelize('phonebook_db', 'raven', 'adzka123', {
//   host: 'localhost',
//   dialect: 'postgres',
//   logging: false
// });




const sequelize = new Sequelize(config.development.database, config.development.username, config.development.password, {
  host: config.development.host,
  dialect: config.development.dialect,
  logging: config.development.logging
});

module.exports = sequelize;