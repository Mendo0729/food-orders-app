require('dotenv').config();

const express = require('express');
const path = require('path');
const session = require('express-session');

const ordersRoutes = require('./routes/orders.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();
const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'change-this-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 2
    }
  })
);

app.use((req, res, next) => {
  res.locals.currentPath = req.path;
  res.locals.admin = req.session.admin || null;
  next();
});

app.get('/', (req, res) => {
  res.redirect('/pedidos');
});

app.use('/pedidos', ordersRoutes);
app.use('/admin', adminRoutes);

app.use((req, res) => {
  res.redirect('/pedidos');
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send('Ocurrio un error inesperado. Intenta nuevamente mas tarde.');
});

app.listen(PORT, () => {
  console.log(`Servidor ejecutandose en http://localhost:${PORT}`);
});
