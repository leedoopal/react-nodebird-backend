const express = require('express');
const { Post, Image, Comment, User } = require('../models');

const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    const post = await Post.create({
      content: req.body.data,
      UserId: req.body.data.user.id,
    });
    const fullPost = await Post.findOne({
      where: { id: post.id },
      include: [
        {
          model: Image,
        },
        {
          model: Comment,
        },
        {
          model: User,
        },
      ],
    });
    res.status(201).json(fullPost);
  } catch (err) {
    console.log(err);
    next(err);
  }
});

router.delete('/', (req, res) => {
  res.json('delete');
});

router.post('/:postId/comment', async (req, res, next) => {
  try {
    const post = await Post.findOne({
      where: { id: req.params.postId },
    });

    // post가 존재하지 않다면
    if (!post) {
      return res.status(403).send('존재하지 않는 게시글 입니다.');
    }

    const comment = await Comment.create({
      content: req.body.data,
      PostId: req.params.postId,
      UserId: req.user.id,
    });
    res.status(201).json(comment);
  } catch (err) {
    console.log(err);
    next(err);
  }
});

module.exports = router;
