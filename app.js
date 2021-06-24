const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('hello express');
});

app.get('/api/posts', (req, res) => {
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

app.post('/api/post', (req, res) => {
  res.json('complete');
});

app.listen(3065, () => {
  console.log('서버 실행 중');
});
