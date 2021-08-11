const express = require('express');
const { Post, Image } = require('../models');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const posts = await Post.findAll({
      limit: 10,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Image,
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
