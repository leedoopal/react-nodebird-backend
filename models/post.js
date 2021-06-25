module.exports = (sequelize, dataTypes) => {
  const Post = sequelize.define(
    'Post',
    {
      content: {
        type: dataTypes.TEXT,
        allowNull: false,
      },
      /*
      RetweetId: {}
      */
    },
    {
      // 이모티콘을 쓰려면 mb4를 넣어주어야 함
      charset: 'utf8mb4',
      collate: 'utf8mb4_general_ci',
    },
  );

  Post.associate = (db) => {
    db.Post.hasMany(db.Comment);
    db.Post.belongsToMany(db.Hashtag);
    db.Post.hasMany(db.Image);
    db.Post.hasMany(db.User);
    // as에 따라서 post.GetLikers 처럼 게시글 좋아요 누른 사람을 가져올 수 있음
    db.Post.belongsToMany(db.User, { through: 'Like', as: 'Likers' });
    // as로 이름을 변경해주었기 때문에 RetweetId 생성
    db.Post.belongsTo(db.Post, { as: 'Retweet' });
  };

  return Post;
};
