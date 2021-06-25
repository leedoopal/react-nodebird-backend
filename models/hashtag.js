module.exports = (sequelize, dataTypes) => {
  const Hashtag = sequelize.define(
    'Hashtag',
    {
      name: {
        type: dataTypes.STRING(20),
        allowNull: false,
      },
    },
    {
      charset: 'utf8mb4',
      collate: 'utf8mb4_general_ci',
    },
  );

  Hashtag.associate = (db) => {
    db.Hashtag.belongsToMany(db.Post);
  };

  return Hashtag;
};
