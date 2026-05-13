const express = require('express');
const publicController = require('../controllers/public.controller');

const router = express.Router();

router.get('/', publicController.home);
router.get('/about', publicController.about);

module.exports = router;
