Router.route('/', {
  name: 'home'
});

Router.route('/dashboard', {
  name: 'dashboard'
});

Router.route('/graph', {
  name: 'graph'
});

Router.route('/streams', {
  name: 'streams'
});

Router.plugin('ensureSignedIn', {
  only: ['dashboard']
});
