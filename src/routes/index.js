const express = require('express');
const router = express.Router();

// Route definitions for each page
router.get('/', (req, res) => res.render('index'));

module.exports = router;
