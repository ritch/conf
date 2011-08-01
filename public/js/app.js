var app;
$(function() {

	// ## Message Model
	window.Message = Backbone.Model.extend({
		
		idAttribute: '_id',
		
		defaults: {
			points: 0
		},
		
		url: function(id) {
			return '/message/' + (id || '');
		},
		
		like: function() {
			this.set({points: this.get('points') + 1});
			if(!this.isNew()) this.save();
		}
		
	});

	window.MessageList = Backbone.Collection.extend({
		
		model: Message,
		
		url: function() {
			var pos = app && app.model.get('position')
			  , query = {}
			  , since = app && app.model.get('updated');
			
			if(since) query.since = since;
			if(pos) query = _.extend(query, pos);
			
			return '/messages?' + decodeURIComponent($.param(query));
		},
		
		//localStorage: new Store('Messages'),
		comparator: function(msg) {
			return msg.get('points');
		},
		
		parse: function(response) {
			return response.results;
		},
		
		_add : function(model, options) {
			options || (options = {});
			model = this._prepareModel(model, options);
			if (!model) return false;
			var already = this.getByCid(model) || this.get(model);
			if(already) {
				this.remove(this._byId[model.id]);
			}
			this._byId[model.id] = model;
			this._byCid[model.cid] = model;
			var index = options.at != null ? options.at :
			            this.comparator ? this.sortedIndex(model, this.comparator) :
			            this.length;
			this.models.splice(index, 0, model);
			model.bind('all', this._onModelEvent);
			this.length++;
			if (!options.silent) model.trigger('add', model, this, options);
				return model;
		}
	});
	
	// ## Application Model
	window.App = Backbone.Model.extend({
		
		initialize: function() {
			var socket = io.connect('http://localhost')
			  , _self  = this;
			
			socket.on('message', function (data) {
				console.log('saw update', data);
				var m = new Message(data);
				_self.messages().add(m);
				_self.messages().fetch({add: true});
			});
			
			socket.on('update:message', function(data) {
				console.log(data);
				_self.messages()
					.get(data._id)
					.set(data);
			});
			
		},
		
		defaults: {
			messages: new MessageList()
		},
		
		locate: function() {
			var _self = this;
			if (navigator.geolocation) {
				navigator.geolocation.getCurrentPosition( 
					function (position) {
						_self.set({position: {
							lat: position.coords.latitude,
							long: position.coords.longitude
						}});
					}, 
					function (error)
					{
						switch(error.code) 
						{
							case error.TIMEOUT:
								alert ('Timeout');
								break;
							case error.POSITION_UNAVAILABLE:
							case error.PERMISSION_DENIED:
								alert ('You must allow the app to use your location.');
								break;
							case error.UNKNOWN_ERROR:
								alert ('Unknown error');
								break;
						}
					}
				);
			}
		},
		
		messages: function() {
			return this.get('messages');
		}
		
	});
	
	window.MessageView = Backbone.View.extend({
		
		tagName:  "li",
		
		template: _.template($('#message-template').html()),
		
		events: {
			'click': 'like'
		},
		
		render: function() {
			this.model && $(this.el).html(this.template(this.model.toJSON()));
			return this;
		},
		
		like: function() {
			this.model.like();
		}
		
	});
	
	window.AppView = Backbone.View.extend({
		
		el: $('#main'),
		
		model: new App(),
		
		events: {
			'keyup #create': 'create'
		},
		
		initialize: function() {
			var _self = this;
			_.bindAll(_self, 'render');
			_self.model.locate();
			_self.model.messages().bind('all', function(e) {
				var now = new Date()
				  , utcNow = now.getTime() + (now.getTimezoneOffset() * 60000);
				_self.model.set({updated: utcNow});
				_self.render();
			});
			_self.model.bind('change:position', function() {
				_self.model.messages().fetch();
			});
		},
		
		render: function() {
			var msgs = this.$('#messages').empty();
			this.model.messages().each(function(msg) {
				var mv = new MessageView({model: msg});
				msgs.append(mv.render().el);
				mv.model.bind('change', mv.render);
			});
		},
		
		create: function(e) {
			if(e.keyCode === 13) {
				// enter was pressed
				var el = $(e.target)
				  , txt = el.val()
				  , msg = txt && new Message({message: txt, position: this.model.get('position')});
				if(msg) {
					this.model.messages().add(msg);
					msg.save();
					el.val(null);
				}
			}
		}
		
	});
	
	app = new AppView();
	
});