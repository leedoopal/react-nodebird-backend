module.exports = (sequelize, dataTypes) => {
  const Comment = sequelize.define(
    'Comment',
    {
      content: {
        type: dataTypes.TEXT,
        allowNull: false,
      },
      // belongsTo를 생성함으로써 아래 user_id, post_id가 만들어짐
      /*
        UserId: {},
        PostId: {},
      */
    },
    {
      charset: 'utf8mb4',
      collate: 'utf8mb4_general_ci',
    },
  );

  Comment.associate = (db) => {
    db.Comment.belongsTo(db.User);
    db.Comment.belongsTo(db.Post);
  };

  return Comment;
};
