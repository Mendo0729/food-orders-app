const express = require('express');
const adminController = require('../controllers/admin.controller');
const { requireAuth } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/login', adminController.showLogin);
router.post('/login', adminController.login);
router.post('/logout', adminController.logout);
router.get('/', requireAuth, adminController.dashboard);

module.exports = router;
