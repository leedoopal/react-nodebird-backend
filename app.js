const express = require('express');
const app = express();
const postRouter = require('./routes/post');
const db = require('./models');

db.sequelize
  .sync()
  .then(() => {
    console.log('db 연결 성공');
  })
  .catch(console.error);

app.get('/', (req, res) => {
  res.send('hello express');
});

app.get('/posts', (req, res) => {
  res.json([
    {
      id: 1,
      content: 'hello',
    },
    {
      id: 2,
      content: 'hi',
    },
  ]);
});

app.use('/post', postRouter);

app.listen(3065, () => {
  console.log('서버 실행 중');
});
