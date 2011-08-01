//# _Convience_ hive.at(path)

var hive = require('hive');
var view = hive.view;
var redirect = hive.redirect;
var User = hive.models.User;
var Session = hive.models.Session;
var Users = hive.queries.Users;

// ### hive.at(context)
// **context** A ```String``` preceded by a ```/``` followed by the location which all following routes will live under.

// This will set the context of all following routes to ```http://localhost:3000/user```.
hive.at('/user')

// ### hive.get(route, [_handler_])
// **context** A ```String``` preceded by a ```/``` followed by the location which the route will responde to. Route paths can include parameters such as ```/user/:id```.

// **handler** [_optional_] A handler can be a [model](model.example.html), a query, or a ```function```.

// * **model** If a handler is a model, _hive_ will create an instance of it, call ```model.fetch()``` and return its ```model.toJSON()``` as the result.
// * **query** If a handler is a query, _hive_ will create an instance of it, pass it the request body, route parameters, and querystring parameters to its ```myQuery.get('query')``` property.
// * **function** If a handler is a ```function```, _hive_ will call this function and pass the **request** and the **response** objects as first and second arguments. This function can _optionally_ return a **result**.
//   * **request** Is an express.js [req](http://expressjs.com/guide.html) object
//   * **response** Is an express.js [res](http://expressjs.com/guide.html) object
//	 * **result** Is either a ```model```, ```query```, ```view(name, model)```, or ```redirect(url)```.
.get('/all', Users)
.post('/new', User)

// Routes are implicitely bound to a view by their name. For example. ```hive.at('/user').get('/new')``` will look for the view ```new.haml``` in the folder ```/views/user/```.
.get('/new')
.get('/login')

// ### hive.post(route, [_handler_])
// **context** A ```String``` preceded by a ```/``` followed by the location which the route will responde to.

// **handler** [_optional_] A handler can be a [model](model.example.html), a query, or a ```function```.

// * **model** If a handler is a model, _hive_ will create an instance of it, call ```model.fetch()``` and return its ```model.toJSON()``` as the result.
// * **query** If a handler is a query, _hive_ will create an instance of it, pass it the request body, route parameters, and querystring parameters to its ```myQuery.get('query')``` property.
// * **function** If a handler is a ```function```, _hive_ will call this function and pass the **request** and the **response** objects as first and second arguments. This function can _optionally_ return a **result**.
//   * **request** Is an express.js [req](http://expressjs.com/guide.html) object
//   * **response** Is an express.js [res](http://expressjs.com/guide.html) object
//	 * **result** Is either a ```model```, ```query```, ```view(name, model)```, ```redirect(url)```, or custom ```object```.	
.post('/login', function(req, res) {
	var model = new Session(req.body);
	var result = {
		model: model,
		redirect: '/dashboard',
		success: function() {
			res.cookie('auth', model.get('auth'), {httpOnly: true});
		}
	};
	return result;
})
// This route will respond to ```http://localhost:3000/register``` and redirect to ```/user/new```.
.at('/register')
.get('/', function () {
	return redirect('/user/new');
})
.at('/dashboard')
.get('/', function(req, res) {
	return view('user/dashboard.haml');
});