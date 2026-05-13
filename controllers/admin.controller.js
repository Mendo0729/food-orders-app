const bcrypt = require('bcrypt');
const db = require('../config/db');

function showLogin(req, res) {
  res.render('admin-login', {
    title: 'Acceso administrador',
    error: null
  });
}

async function login(req, res, next) {
  const { username, password } = req.body;

  try {
    let isValid = false;
    let adminName = username;

    const { rows } = await db.query('SELECT id, username, password_hash FROM admins WHERE username = $1', [
      username
    ]);

    if (rows.length > 0) {
      isValid = await bcrypt.compare(password, rows[0].password_hash);
      adminName = rows[0].username;
    } else if (process.env.ADMIN_USER && process.env.ADMIN_PASSWORD) {
      isValid = username === process.env.ADMIN_USER && password === process.env.ADMIN_PASSWORD;
    }

    if (!isValid) {
      return res.status(401).render('admin-login', {
        title: 'Acceso administrador',
        error: 'Usuario o contrasena incorrectos.'
      });
    }

    req.session.admin = {
      username: adminName
    };

    return res.redirect('/admin');
  } catch (error) {
    next(error);
  }
}

function logout(req, res, next) {
  req.session.destroy((error) => {
    if (error) {
      return next(error);
    }

    return res.redirect('/admin/login');
  });
}

async function dashboard(req, res, next) {
  try {
    const { rows: orders } = await db.query(`
      SELECT
        o.id,
        o.customer_name,
        o.phone,
        o.total,
        o.created_at,
        COALESCE(
          json_agg(
            json_build_object(
              'dish', d.name,
              'quantity', oi.quantity,
              'unit_price', oi.unit_price
            )
            ORDER BY d.name
          ) FILTER (WHERE oi.id IS NOT NULL),
          '[]'
        ) AS items
      FROM orders o
      LEFT JOIN order_items oi ON oi.order_id = o.id
      LEFT JOIN dishes d ON d.id = oi.dish_id
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `);

    res.render('admin-dashboard', {
      title: 'Panel administrador',
      orders
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  showLogin,
  login,
  logout,
  dashboard
};
