const express = require('express');
const router = express.Router();
const indexController = require('../controllers/indexController');

// Route definitions for each page
router.get('/', indexController.getHomePage);

// Menu Item Details
router.get('/menu/:id', indexController.getMenuItemDetails);

// Add Review for Menu Item
router.post('/menu/:id/addReview', indexController.postAddReview);

// Save Order
router.post('/menu/saveOrder', indexController.postSaveOrder);

module.exports = router;
