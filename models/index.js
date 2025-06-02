const sequelize = require('../config/database');
const User = require('./User');
const Note = require('./Note');

// Define associations
User.hasMany(Note, {
  foreignKey: 'user_id',
  as: 'notes',
  onDelete: 'CASCADE'
});

Note.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

module.exports = {
  sequelize,
  User,
  Note
};