const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');

const { User, Post } = require('../models');
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
              exclude: ['id'],
            },
          },
          {
            model: User,
            as: 'Followers',
            attributes: {
              exclude: ['id'],
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

module.exports = router;
