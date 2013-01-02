$(function () {
	$D = window.$D || {};

	$D.provide = function (ns, ns_string) {
		var parts = ns_string.split('.'), parent = ns, pl, i;
		if (parts[0] === "$B") {
			parts = parts.slice(1);
		}
		pl = parts.length;
		for (i = 0; i < pl; i += 1) {
			if (typeof parent[parts[i]] === 'undefined') {
				parent[parts[i]] = {};
			}
			parent = parent[parts[i]];
		}
		return parent;
	};
	$D.provide($D, 'App');
	$D.path = "";
	$D.page = 1;

	_.templateSettings = {
		interpolate : /\{\{(.+?)\}\}/g,
		evaluate : /\[\[(.+?)\]\]/g
	};
	var Model,
	  Collection,
	  library,
	  EntradaView,
	  LibraryEntradaView,
	  LibraryView,
	  DHome;

	Model = Backbone.Model.extend({
		defaults: {
			"title": "",
			"image_teaser_url": ""
		}
	});

	Collection = Backbone.Collection.extend({
		model: Model,
		sync: function(method, model, options, error){
			if (options.data){this.section = options.data.section;}
			if (!this.section){this.section = "everyone"}
			Dribbble.list( this.section, function( resp ){
			if (resp) {
				$D.page++;
   				options.success(resp.shots);
			}
			}, 9, $D.page);
		}
	});

	library = new Collection();

	EntradaView = Backbone.View.extend({
		initialize: function () {
		//	this.loadPage();
			_.bindAll(this);
			this.model.bind('change', this.render);
			this.template = _.template($('#entrada-template').html());
		},
		render: function () {
		//	this.model.fetch();
			var renderedContent = this.template(this.model.toJSON());
			$(this.el).html(renderedContent);

			if (this.afterRender && typeof this.afterRender === 'function') {
				this.afterRender.apply(this);
			}
			return this;
			
		},
		loadPage: function () {
			this.model.fetch();
		},
		afterRender: function () {
			$('.mostrarmas').removeClass('oculto');

		}
	});
	
	LibraryEntradaView = EntradaView.extend({});

	LibraryView = Backbone.View.extend({
		initialize: function () {
			_.bindAll(this, 'render');
			this.template = _.template($('#library-template').html());
			this.collection.bind('reset', this.render);
			this.collection.bind('add', this.render);

			this.collection.fetch();

			_.bindAll(this, 'detect_scroll');
			// bind to window
			$(window).scroll(this.detect_scroll);
			this.isLoading = false;
		},
		render: function () {
			var $contenido,
			collection = this.collection,
			self = this;

			$(this.el).html(this.template({}));
			$contenido = this.$('#contenidodinamico');
			collection.each(function (item) {
				var view = new LibraryEntradaView({
					model: item,
					collection: collection
				});
//				$(this.el).append(view.render().el);
				$contenido.append(view.render().el);
			});
			if (this.afterRender && typeof this.afterRender === 'function') {
				this.afterRender.apply(this);
			}
			return this;
		},
		events: {
			'mouseenter .container': 'showComments',
			'mouseleave .container': 'hideComments',
			'click .container': 'jump',
			'click #mostrarmas': 'loadMore'
		},
		detect_scroll: function () {
			if (!this.isLoading && (($(window).scrollTop() + $(window).height()) > (this.el.scrollHeight * 0.8))) {
				this.addEntries();
			}
		},
		loadMore: function (ev) {
			ev.stopPropagation();
			ev.preventDefault();
			this.addEntries();
		},
		addEntries: function () {
			this.isLoading = true;
			var self = this,
				childLibrary = new Collection(),
				section = self.section || "";
			childLibrary.fetch({ 
				data: {
					section: section
				},
				success: function () {
					self.collection.add(childLibrary.toJSON());
					self.isLoading = false;
//					self.render();
				}
			});
		},
		showSection: function (ev) {
			ev.stopPropagation();
			ev.preventDefault();
			var section = $(ev.currentTarget).data('section');
			this.section = section;

			$('.titulares').removeClass('on');
			$(ev.currentTarget).addClass('on')

			$D.page = 1;
			this.collection.fetch({ data: {section: section } });
		},
		jump: function (ev) {
			var hardlink = $(ev.currentTarget).data('hardlink');
			if (hardlink) {
				window.open(hardlink, '_blank');
//				window.location = hardlink;
			}
		},
		showComments: function (ev) {
			var $objet = $(ev.currentTarget);
			var ancho = $objet.width();
			$objet.find('.comentarios').show().css({left: ancho});
			$objet.find('.comentarios').animate({left: '0px'}, 300);
		},
		hideComments: function (ev) {
			var $objet = $(ev.currentTarget);
			var ancho = $objet.width();
			$objet.find('.comentarios').animate({left: ancho}, 300, function () {
				$objet.find('.comentarios').hide();
			});
		}
	});

	DHome = Backbone.Router.extend({
		routes: {
			'': 'home',
			'blank': 'blank'
		},
		initialize: function () {
			this.libraryView = new LibraryView({
				collection: library
			});
		},
		home: function () {
			var $container = $('#container');
			$container.empty();
			$container.html(this.libraryView.render().el);
		},
		blank: function () {
			$('#container').empty();
			$('#container').text('blank');
		}
	});

	$(function () {
		window.$D.App = new DHome();

		Backbone.history.start();
		$('[data-section]').click(function (ev) {
			$D.App.libraryView.showSection(ev);
		});
	});


});