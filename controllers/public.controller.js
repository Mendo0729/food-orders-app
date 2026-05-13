function home(req, res) {
  res.render('home', {
    title: 'Sabores para Compartir'
  });
}

function about(req, res) {
  res.render('about', {
    title: 'Sobre la actividad',
    description:
      'Estamos reuniendo a la comunidad alrededor de buena comida, servicio amable y una actividad preparada con carino.',
    isNotFound: false
  });
}

module.exports = {
  home,
  about
};
