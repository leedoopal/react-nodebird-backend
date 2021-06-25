module.exports = (sequelize, dataTypes) => {
  // mysql에는 소문자로 users 테이블 생성
  const User = sequelize.define(
    'User',
    {
      // id는 기본적으로 생성
      email: {
        // STRING, TEXT, BOOLEAN, INTEGER, FLOAT, DATETIME
        type: dataTypes.STRING(30),
        // false면 필수
        allowNull: false,
        // 고유한 값
        unique: true,
      },
      nickname: {
        type: dataTypes.STRING(30),
        allowNull: false,
      },
      password: {
        type: dataTypes.STRING(100),
        allowNull: false,
      },
    },
    {
      charset: 'utf8',
      collate: 'utf8_general_ci', // 한글 저장
    },
  );

  return User;
};
