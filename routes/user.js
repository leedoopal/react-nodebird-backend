const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');
const { Op } = require('sequelize');

const { Post, Hashtag, Image, Comment, User } = require('../models');
const { isSignedIn, isNotSignedIn } = require('./middlewares');

const router = express.Router();

router.post('/', isNotSignedIn, async (req, res, next) => {
  try {
    // 기존 user인지 check
    const exUser = await User.findOne({
      where: {
        email: req.body.email,
      },
    });

    if (exUser) {
      return res.status(403).send('이미 사용중인 아이디입니다.');
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 12);
    await User.create({
      email: req.body.email,
      nickname: req.body.nickname,
      password: hashedPassword,
    });
    res
      .status(201)
      .send({ email: req.body.email, nickname: req.body.nickname });
  } catch (error) {
    console.error(error);
    next(error); // status 500
  }
});

router.get('/', async (req, res, next) => {
  try {
    if (req.user) {
      const fullUserWithoutPasswrod = await User.findOne({
        where: { id: req.user.id },
        attributes: {
          exclude: ['password'],
        },
        include: [
          {
            model: Post,
            attributes: {
              exclude: ['id'],
            },
          },
          {
            model: User,
            as: 'Followings',
            attributes: {
              exclude: ['password'],
            },
          },
          {
            model: User,
            as: 'Followers',
            attributes: {
              exclude: ['password'],
            },
          },
        ],
      });
      return res.status(200).json(fullUserWithoutPasswrod);
    } else {
      return res.status(200).json({ data: null });
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.get('/followers', isSignedIn, async (req, res, next) => {
  try {
    const me = await User.findOne({
      where: { id: req.user.id },
      attributes: {
        exclude: ['password'],
      },
    });
    if (!me) {
      res.status(401).send('로그인을 해주세요');
    }
    const followers = await me.getFollowers({
      limit: Number(req.query.limit),
    });
    res.status(200).json(followers);
  } catch (err) {
    console.err(err);
    next(err);
  }
});

router.get('/followings', isSignedIn, async (req, res, next) => {
  try {
    const me = await User.findOne({
      where: { id: req.user.id },
      attributes: {
        exclude: ['password'],
      },
    });
    if (!me) {
      res.status(401).send('로그인을 해주세요');
    }
    const followings = await me.getFollowings({
      limit: Number(req.query.limit),
    });
    res.status(200).json(followings);
  } catch (err) {
    console.err(err);
    next(err);
  }
});

router.post('/login', isNotSignedIn, (req, res, next) => {
  passport.authenticate('local', (error, user, info) => {
    // server error
    if (error) {
      console.error(error);
      return next(error);
    }
    // client error
    if (info) {
      return res.status(401).send(info.reason);
    }
    return req.login(user, async (loginErr) => {
      if (loginErr) {
        console.error(loginErr);
        return next(loginErr);
      }

      const fullUserWithoutPasswrod = await User.findOne({
        where: { id: user.id },
        attributes: {
          exclude: ['password'],
        },
        include: [
          {
            model: Post,
          },
          {
            model: User,
            as: 'Followings',
          },
          {
            model: User,
            as: 'Followers',
          },
        ],
      });
      return res.status(200).json(fullUserWithoutPasswrod);
    });
  })(req, res, next);
});

router.put('/logout', isSignedIn, (req, res, next) => {
  req.logout();
  req.session.destroy();
  res.send('ok');
});

router.patch('/nickname', isSignedIn, async (req, res, next) => {
  try {
    await User.update(
      {
        nickname: req.body.nickname,
      },
      {
        where: { id: req.user.id },
      },
    );

    res.status(200).json({ nickname: req.body.nickname });
  } catch (err) {
    console.err(err);
    next(err);
  }
});

router.patch('/:userId/follow', isSignedIn, async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { id: req.params.userId } });
    if (!user) {
      res.status(403).send('존재하지 않는 유저에요');
    }
    await user.addFollowers(req.user.id);
    res.status(200).json({ userId: req.params.userId });
  } catch (err) {
    console.err(err);
    next(err);
  }
});

router.delete('/:userId/follow', isSignedIn, async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { id: req.params.userId } });
    if (!user) {
      res.status(403).send('존재하지 않는 유저에요');
    }
    await user.removeFollowers(req.user.id);
    res.status(200).json({ userId: req.body.userId });
  } catch (err) {
    console.err(err);
    next(err);
  }
});

router.get('/:userId/posts', async (req, res, next) => {
  try {
    const lastId = parseInt(req.query.lastId);
    const where = { UserId: req.params.userId };

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

router.delete('/follower/:userId', isSignedIn, async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { id: req.params.userId } });
    if (!user) {
      res.status(403).send('존재하지 않는 유저에요');
    }
    await user.removeFollowings(req.user.id);
    res.status(200).json({ userId: req.body.userId });
  } catch (err) {
    console.err(err);
    next(err);
  }
});

module.exports = router;
