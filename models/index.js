const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development';
// json 가져온 것 + 'development' || 'test' || 'production'
const config = require('../config/config')[env];
const db = {};

// sequelize가 node와 mysql을 연결해줌
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config,
);

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
