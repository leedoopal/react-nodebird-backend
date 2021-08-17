const express = require('express');
const { Post, Image, Comment, User } = require('../models');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const posts = await Post.findAll({
      limit: 10,
      order: [
        ['createdAt', 'DESC'],
        [Comment, 'createdAt', 'DESC'],
      ],
      include: [
        {
          model: Image,
        },
        {
          model: Comment,
          include: [
            {
              model: User,
              attributes: ['id', 'nickname'],
              order: [['createdAt', 'DESC']],
            },
          ],
        },
        {
          model: User, // 좋아요 누른 사람
          as: 'Likers',
          attributes: ['id', 'nickname'],
        },
      ],
    });

    res.status(200).json(
      posts.map((v) => {
        v.content = JSON.parse(v.content);
        return v;
      }),
    );
  } catch (err) {
    console.error(err);
    next(err);
  }
});

module.exports = router;
