module.exports = (sequelize, dataTypes) => {
  const Comment = sequelize.define(
    'Comment',
    {
      content: {
        type: dataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      charset: 'utf8mb4',
      collate: 'utf8mb4_general_ci',
    },
  );

  Comment.associate = (db) => {};

  return Comment;
};
