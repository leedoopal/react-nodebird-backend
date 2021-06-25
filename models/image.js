module.exports = (sequelize, dataTypes) => {
  const Image = sequelize.define(
    'Image',
    {
      src: {
        type: dataTypes.STRING(200),
        allowNull: false,
      },
    },
    {
      charset: 'utf8',
      collate: 'utf8_general_ci',
    },
  );

  Image.associate = (db) => {};

  return Image;
};