const { DataTypes } = require('sequelize');
const sequelize = require('../config/database.config');

const Phonebook = sequelize.define('Phonebooks', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  photo: {
    type: DataTypes.STRING,
    defaultValue: '/user-avatar.svg'
  }
});

module.exports = Phonebook;