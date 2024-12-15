const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('phonebook_db', 'raven', 'adzka123', {
  host: 'localhost',
  dialect: 'postgres',
  logging: false
});

module.exports = sequelize;