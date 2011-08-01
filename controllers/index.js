var hive = require('hive');
var view = hive.view;
var redirect = hive.redirect;

// template view settings
hive.app.set('view options', {
    open: '[%',
    close: '%]'
});

// root view
hive
.at('/')
.get('/');
