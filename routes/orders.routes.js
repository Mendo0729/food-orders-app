const express = require('express');
const ordersController = require('../controllers/orders.controller');

const router = express.Router();

router.get('/', ordersController.showOrderForm);
router.post('/carrito/agregar', ordersController.addToCart);
router.post('/carrito/actualizar', ordersController.updateCartItem);
router.post('/carrito/eliminar', ordersController.removeCartItem);
router.post('/carrito/vaciar', ordersController.clearCart);
router.post('/', ordersController.createOrder);

module.exports = router;
