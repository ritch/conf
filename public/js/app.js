var app;
$(function() {

	function now() {
		var now = new Date();
		return now.getTime() + (now.getTimezoneOffset() * 60000);
	}
	
	// TODO: localStorage / collection
	var Likes = {};

	// ## Message Model
	window.Message = Backbone.Model.extend({
		
		initialize: function() {
			
			var LIFE_PER_POINT = 5000,
				born = Number(this.get('created') || now()),
				death = born + 5000 + (this.get('points') * LIFE_PER_POINT);
			
			// TODO - this.get('created') seems to be off
			//console.log(born - new Date().getTime());
			
			this.set({death: death});
			this.bind('change', function() {
				this.collection.sort();
				this.collection.trigger('change');
			});
			
		},
		
		idAttribute: 'mid',
		
		defaults: {
			points: 0
		},
		
		url: function(id) {
			return '/message/' + (id || '');
		},
		
		like: function() {
			
			if(Likes[this.get('mid')]) return;
			
			Likes[this.get('mid')] = true;
			
			this.set({
				points: this.get('points') + 1,
				death: this.get('death') + 5000,
				updated: now()
			});
			if(!this.isNew()) this.save();
		}
		
	});

	window.MessageList = Backbone.Collection.extend({
		
		initialize: function() {
			var _self = this;
			setInterval(function() {
				//_self.flush(new Date().getTime());
			}, 500);
		},
		
		flush: function(since) {
			var _self = this;
			_self.each(function(msg) {
				//console.log(msg.get('death') - since);
				if(msg.get('death') < since) {
					//console.log('removing', msg);
					_self.remove(msg);
				}
			});
		},
		
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
			//return msg.get('points');
			return msg.get('updated') || msg.get('created');
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
			var socket = io.connect('/')
			  , _self  = this;
			
			socket.on('message', function (data) {
				console.log('saw update', data);
				var m = new Message(data);
				_self.messages().add(m);
				if(app && app.scroller) {
					app.scroller.scrollToElement($('#messages li:last')[0]);
				}
				_self.messages().fetch({add: true});
			});
			
			socket.on('update:message', function(data) {
				console.log('update', data);
				_self.messages()
					.get(data.mid)
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
								alert ('Your position was unavailable, please try again.');
								break;
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
		
		initialize: function() {
			var _self = this;
		},
		
		tagName:  "li",
		
		template: _.template($('#message-template').html()),
		
		events: {
			'click': 'like',
			'mouseover': 'hover',
			'mouseout': 'hover'
		},
		
		render: function() {
			if(!this.model) return;
			$(this.el).html(this.template(this.model.toJSON()));
			var canvas = $(this.el).find('canvas');
			canvas.length && new StatusView({el: canvas, model: this.model});
			if(this.model.hasChanged('updated')) {
				this.flash();
			}
			return this;
		},
		
		like: function() {
			this.model.like();
		},
		
		hover: function() {
			var color = this.hovered ? '#ffffff' : '#F4FFF5',
				txt = this.hovered ? '#000000' : '#546657';
			$(this.el).stop().animate({backgroundColor: color, color: txt}, 1000);
			this.hovered = !this.hovered;
		},
		
		flash: function() {
			var start = '#F7F6E3',
				stop = '#ffffff';
				
			$(this.el).stop().animate({backgroundColor: start}, 1000, function() {
				$(this).animate({backgroundColor: stop}, 500)
			});
		}
		
	});
	
	window.StatusView = Backbone.View.extend({
		initialize: function(attrs) {
			this.render();
		},
		
		render: function() {
			var canvas = this.el[0]
			  , context = canvas.getContext("2d")
			  , percent = this.model.get('points') / 10;
			
			context.moveTo(0, 0);
			context.lineWidth = 10;
			var radius = 22;
			var x = 27;
			var y = 27;
			// The angle of each of the eight segments is 45 degrees (360 divided by 8), which
			// equals p/4 radians.
			var parts = 100;
			var angleDelta = Math.PI / (parts / 2);
			// Find the distance from the circle's center to the control points for the curves.
			var ctrlDist = radius/Math.cos(angleDelta/2);
			// Initialize the angle to 0 and define local variables that are used for the 
			// control and ending points. 
			var angle = 0;
			var rx, ry, ax, ay;
			// Move to the starting point, one radius to the right of the circle's center.
			context.moveTo(x + radius, y);
			var finishing = false;
			
			// Repeat eight times to create eight segments.
			for (var i = 0; i < parts; i++) {
				// Increment the angle by angleDelta (p/4) to create the whole circle (2p).
				angle += angleDelta;
				// The control points are derived using sine and cosine.
				rx = x + Math.cos(angle-(angleDelta/2))*(ctrlDist);
				ry = y + Math.sin(angle-(angleDelta/2))*(ctrlDist);
				// The anchor points (end points of the curve) can be found similarly to the 
				// control points.
				ax = x + Math.cos(angle)*radius;
				ay = y + Math.sin(angle)*radius;
				// Draw the segment.
				if(!!(i % 2)) {
					if(i / parts > percent && !finishing && percent > 0) {
						context.lineTo(rx, ry);
						finishing = true;
						context.strokeStyle = "#C6ED47";
						context.stroke();
						context.beginPath();
					}
					context.lineTo(rx, ry);
				} else {	
					context.moveTo(rx, ry);
				}
			}
			context.lineTo(x + radius, y);
			context.strokeStyle = "#F4F4F4";
			if(percent >= 1) {
				context.strokeStyle = '#C6ED47';
			}
			context.stroke();
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
			_.bindAll(_self, 'render', 'resize');
			_self.model.locate();
			_self.model.messages().bind('all', function(e) {
				_self.model.set({updated: now()});
				_self.render();
			});
			_self.model.bind('change:position', function() {
				_self.model.messages().fetch();
			});
			this.resize();
			$(window).resize(this.resize);
			this.scroller = new iScroll('messages', {desktopCompatibility: true});
		},
		
		resize: function() {
			this.$('#scroller').height($(window).height() - this.$('#create').outerHeight() - $('header').outerHeight());
		},
		
		render: function() {
			var msgs = this.$('#messages').empty();
			this.model.messages().each(function(msg) {
				var mv = new MessageView({model: msg});
				msgs.append(mv.render().el);
				mv.model.bind('change', mv.render);
			});
			this.scroller.refresh();
		},
		
		create: function(e) {
			if(e.keyCode === 13) {
				// enter was pressed
				var el = $(e.target)
				  , txt = el.val()
				  , msg = txt && new Message({message: txt, position: this.model.get('position'), created: now(), updated: now()});
				if(msg) {
					//this.model.messages().add(msg);
					msg.save();
					el.val(null);
				}
			}
		}
		
	});
	
	app = new AppView();
	
});