const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
  res.json('complete');
});

router.delete('/', (req, res) => {
  res.json('delete');
});

module.exports = router;
