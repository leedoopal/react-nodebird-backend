const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { isSignedIn } = require('./middlewares');
const { Post, Image, Comment, User, Hashtag } = require('../models');

const router = express.Router();

try {
  fs.accessSync('uploads');
} catch (error) {
  console.log('uploads 폴더가 없으므로 생성');
  fs.mkdirSync('uploads');
}

const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, done) {
      done(null, 'uploads');
    },
    filename(req, file, done) {
      // test.jpg
      const ext = path.extname(file.originalname); // 확장자 추출 (.jpg)
      const basename = path.basename(file.originalname, ext); // 이름을 꺼내옴 (test)
      done(null, basename + new Date().getTime() + ext); // test123456789.jpg
    },
  }),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
});

router.post('/', isSignedIn, upload.none(), async (req, res, next) => {
  try {
    const { content, image } = req.body;
    const hashtags = content.match(/#[^\s#]+/g);
    const post = await Post.create({
      content,
      UserId: req.user.id,
    });

    if (hashtags) {
      // findOrCreate: tag가 없다면 생성, 있다면 가져오기
      // result = [[tag, true], [tag2, true]]
      const result = await Promise.all(
        hashtags.map((tag) =>
          Hashtag.findOrCreate({ where: { name: tag.slice(1).toLowerCase() } }),
        ),
      );

      await post.addHashtags(result.map((v) => v[0]));
    }

    if (image) {
      if (Array.isArray(image)) {
        // 이미지를 여러장 올릴 경우: [A.png, B.png]
        const postImages = await Promise.all(
          image.map((path) => Image.create({ src: path })),
        );
        await post.addImages(postImages);
      } else {
        // 이미지를 한장 올릴 경우: C.png
        const postImage = await Image.create({ src: image });
        await post.addImages(postImage);
      }
    }

    const fullPost = await Post.findOne({
      where: { id: post.id },
      include: [
        {
          model: Image,
        },
        {
          model: Comment,
          include: [
            {
              model: User, // 댓글 작성자
              attributes: ['id', 'nickname'],
            },
          ],
        },
        {
          model: Hashtag,
        },
        {
          model: User, // 게시글 작성자
          attributes: ['id', 'nickname'],
        },
        {
          model: User, // 좋아요 누른 사람
          as: 'Likers',
          attributes: ['id'],
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

router.get('/:postId', async (req, res, next) => {
  try {
    const post = await Post.findOne({
      where: { id: req.params.postId },
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
        },
        {
          model: User,
          attributes: ['id', 'nickname'],
        },
      ],
    });

    res.status(200).json(post);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.delete('/:postId', isSignedIn, async (req, res, next) => {
  try {
    await Post.destroy({
      where: { id: req.params.postId, UserId: req.user.id },
    });

    res.status(204).json({ postId: req.params.postId });
  } catch (err) {
    console.error(err);
  }
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
      PostId: Number(req.params.postId),
      UserId: req.user.id,
    });

    const fullComment = await Comment.findOne({
      where: { id: comment.id },
      include: [
        {
          model: User,
          attributes: ['id', 'nickname'],
        },
      ],
    });

    res.status(201).json(fullComment);
  } catch (err) {
    console.log(err);
    next(err);
  }
});

router.post('/:postId/like', isSignedIn, async (req, res, next) => {
  try {
    const post = await Post.findOne({ where: { id: req.params.postId } });
    if (!post) {
      return res.status(403).send('게시글이 존재하지 않아요');
    }

    await post.addLikers(req.user.id);
    res.status(201).json({ postId: post.id, userId: req.user.id });
  } catch (err) {
    console.log(err);
    next(err);
  }
});

router.delete('/:postId/like', isSignedIn, async (req, res, next) => {
  try {
    const post = await Post.findOne({ where: { id: req.params.postId } });
    if (!post) {
      return res.status(403).send('게시글이 존재하지 않아요');
    }

    await post.removeLikers(req.user.id);
    res.status(204).json({ postId: post.id, userId: req.user.id });
  } catch (err) {
    console.log(err);
    next(err);
  }
});

router.post(
  '/images',
  isSignedIn,
  upload.array('image'),
  async (req, res, next) => {
    console.log(req.files);
    res.json(req.files.map((v) => v.filename));
  },
);

module.exports = router;
