const db = require('../config/db');

function getCart(req) {
  if (!req.session.cart) {
    req.session.cart = {};
  }

  return req.session.cart;
}

function getFormData(req) {
  return req.session.checkoutData || {};
}

async function getActiveDishes() {
  const { rows } = await db.query(
    'SELECT id, name, description, price FROM dishes WHERE is_active = true ORDER BY id'
  );

  return rows;
}

function buildCartItems(cart, dishes) {
  const dishesById = new Map(dishes.map((dish) => [String(dish.id), dish]));

  return Object.entries(cart)
    .map(([dishId, quantity]) => {
      const dish = dishesById.get(String(dishId));

      if (!dish) {
        return null;
      }

      const parsedQuantity = Number.parseInt(quantity, 10) || 0;

      if (parsedQuantity <= 0) {
        return null;
      }

      return {
        dish,
        quantity: parsedQuantity,
        subtotal: Number(dish.price) * parsedQuantity
      };
    })
    .filter(Boolean);
}

function getCartTotal(cartItems) {
  return cartItems.reduce((sum, item) => sum + item.subtotal, 0);
}

function redirectToOrders(req, res) {
  return res.redirect('/pedidos#cart');
}

async function showOrderForm(req, res, next) {
  try {
    const dishes = await getActiveDishes();
    const cart = getCart(req);
    const cartItems = buildCartItems(cart, dishes);

    res.render('order', {
      title: 'Marketplace de comida',
      dishes,
      error: null,
      success: req.query.success === '1',
      cartItems,
      cartTotal: getCartTotal(cartItems),
      cartCount: cartItems.reduce((sum, item) => sum + item.quantity, 0),
      formData: getFormData(req)
    });
  } catch (error) {
    next(error);
  }
}

async function addToCart(req, res, next) {
  const dishId = Number.parseInt(req.body.dish_id, 10);
  const quantity = Number.parseInt(req.body.quantity, 10) || 1;

  try {
    const { rows } = await db.query(
      'SELECT id FROM dishes WHERE id = $1 AND is_active = true',
      [dishId]
    );

    if (rows.length === 0) {
      return redirectToOrders(req, res);
    }

    const cart = getCart(req);
    cart[dishId] = (Number.parseInt(cart[dishId], 10) || 0) + Math.max(quantity, 1);

    return redirectToOrders(req, res);
  } catch (error) {
    next(error);
  }
}

function updateCartItem(req, res) {
  const dishId = Number.parseInt(req.body.dish_id, 10);
  const quantity = Number.parseInt(req.body.quantity, 10) || 0;
  const cart = getCart(req);

  if (quantity <= 0) {
    delete cart[dishId];
  } else {
    cart[dishId] = quantity;
  }

  return redirectToOrders(req, res);
}

function removeCartItem(req, res) {
  const dishId = Number.parseInt(req.body.dish_id, 10);
  const cart = getCart(req);

  delete cart[dishId];

  return redirectToOrders(req, res);
}

function clearCart(req, res) {
  req.session.cart = {};

  return redirectToOrders(req, res);
}

async function createOrder(req, res, next) {
  const { customer_name, phone } = req.body;

  try {
    const dishes = await getActiveDishes();
    const cart = getCart(req);
    const selectedItems = buildCartItems(cart, dishes);
    const cartTotal = getCartTotal(selectedItems);
    const cartCount = selectedItems.reduce((sum, item) => sum + item.quantity, 0);

    if (!customer_name || !phone) {
      req.session.checkoutData = { customer_name, phone };

      return res.status(400).render('order', {
        title: 'Marketplace de comida',
        dishes,
        error: 'Escribe tu nombre y numero celular para continuar.',
        success: false,
        cartItems: selectedItems,
        cartTotal,
        cartCount,
        formData: req.session.checkoutData
      });
    }

    if (selectedItems.length === 0) {
      req.session.checkoutData = { customer_name, phone };

      return res.status(400).render('order', {
        title: 'Marketplace de comida',
        dishes,
        error: 'Agrega al menos un plato al carrito antes de confirmar.',
        success: false,
        cartItems: selectedItems,
        cartTotal,
        cartCount,
        formData: req.session.checkoutData
      });
    }

    const client = await db.pool.connect();

    try {
      await client.query('BEGIN');

      const orderResult = await client.query(
        'INSERT INTO orders (customer_name, phone, total) VALUES ($1, $2, $3) RETURNING id',
        [customer_name.trim(), phone.trim(), cartTotal]
      );

      const orderId = orderResult.rows[0].id;

      for (const item of selectedItems) {
        await client.query(
          'INSERT INTO order_items (order_id, dish_id, quantity, unit_price) VALUES ($1, $2, $3, $4)',
          [orderId, item.dish.id, item.quantity, item.dish.price]
        );
      }

      await client.query('COMMIT');
      req.session.cart = {};
      req.session.checkoutData = {};

      return res.redirect('/pedidos?success=1');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    next(error);
  }
}

module.exports = {
  showOrderForm,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  createOrder
};
