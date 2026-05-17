const express = require('express');
const ordersController = require('../controllers/orders.controller');

const router = express.Router();

router.get('/', ordersController.showOrderForm);
router.post('/', ordersController.createOrder);

module.exports = router;
