module.exports = (sequelize, dataTypes) => {
  const Post = sequelize.define(
    'Post',
    {
      content: {
        type: dataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      // 이모티콘을 쓰려면 mb4를 넣어주어야 함
      charset: 'utf8mb4',
      collate: 'utf8mb4_general_ci',
    },
  );

  Post.associate = (db) => {};

  return Post;
};
