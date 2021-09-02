const express = require('express');
const { Op } = require('sequelize');

const router = express.Router();

const { Post, Hashtag, Image, Comment, User } = require('../models');

router.get('/:hashtag', async (req, res, next) => {
  try {
    const where = {};
    const lastId = parseInt(req.query.lastId);

    if (lastId) {
      // 초기 로딩이 아닐 때. lastId보다 작은걸로 10개를 불러오기
      where.id = { [Op.lt]: lastId };
    }

    const posts = await Post.findAll({
      where,
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
          model: Hashtag,
          where: { name: decodeURIComponent(req.params.hashtag) },
        },
        {
          model: User, // 게시글 작성자
          attributes: ['id', 'nickname'],
        },
        {
          model: User, // 좋아요 누른 사람
          as: 'Likers',
          attributes: ['id', 'nickname'],
        },
        {
          model: Post,
          as: 'Retweet',
          include: [
            {
              model: User,
              attributes: ['id', 'nickname'],
            },
          ],
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
