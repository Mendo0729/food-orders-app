const sheetsService = require('../services/google-sheets.service');

function showLogin(req, res) {
  res.render('admin-login', {
    title: 'Acceso administrador',
    error: null
  });
}

function login(req, res) {
  const { username, password } = req.body;
  const adminUser = process.env.ADMIN_USER || 'admin';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

  if (username !== adminUser || password !== adminPassword) {
    return res.status(401).render('admin-login', {
      title: 'Acceso administrador',
      error: 'Usuario o contrasena incorrectos.'
    });
  }

  req.session.admin = {
    username: adminUser
  };

  return res.redirect('/admin');
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
    const orders = await sheetsService.getOrders();

    return res.render('admin-dashboard', {
      title: 'Panel administrador',
      orders,
      error: null
    });
  } catch (error) {
    if (error.message.includes('GOOGLE_SHEETS_WEB_APP_URL')) {
      return res.render('admin-dashboard', {
        title: 'Panel administrador',
        orders: [],
        error: 'Falta configurar Google Sheets para leer los pedidos.'
      });
    }

    next(error);
  }
}

module.exports = {
  showLogin,
  login,
  logout,
  dashboard
};
