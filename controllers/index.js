var hive = require('hive');
var view = hive.view;
var redirect = hive.redirect;

hive.app.set('view options', {
    open: '[%',
    close: '%]'
});

hive
.at('/')
.get('/');
