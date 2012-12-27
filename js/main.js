$(function () {
	$D = window.$D || {};
  /*\
   * $D.provide
   [ method ]
   * Creates a namespace in the global
   * $D namespace.
   > Arguments
   - ns (object) Object in which to create this namespace
   - ns_string (string) Name for this namespace
   > Usage
   | $D.provide($D, 'app')
  \*/
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
		url: function () { 
			return $D.path + "http://api.dribbble.com/shots/" + this.attributes.entrada;
		},
		defaults: {
			"subject": "",
			"encabezamiento": "",
			"nombreindice": ""
		}
	});

	Collection = Backbone.Collection.extend({
		model: Model,
/*		initialize: function(models, options) {
			if (options.indice){
				this.indice = options.indice;
			}
		}, */
		url: function () { 
			if (this.indice) {
				return $D.path + "http://api.dribbble.com/shots/" + this.indice;
			} else if (this.empieza) {
				return $D.path + "http://api.dribbble.com/shots/everyone?page=" + this.empieza;
			} else {
				return $D.path + "http://api.dribbble.com/shots/everyone" + "?callback=dishAndSwish";
			}
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
//			$('.albums').append(renderedContent);
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
			var self = this;
			$('[data-fondo-imagen]').each(function () {
				var imagen = $(this).data('fondo-imagen');
				$(this).css('background-image', 'url(\'' +  imagen + '\')');
			});
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
				self.empieza = item.id;
//				$(this.el).append(view.render().el);
				$contenido.append(view.render().el);
			});
			if (this.afterRender && typeof this.afterRender === 'function') {
				this.afterRender.apply(this);
			}
			return this;
		},
		events: {
			'mouseenter .container': 'mostrarComentariosEv',
			'mouseleave .container': 'ocultarComentariosEv',
			'click .container': 'saltar',
			'click .titular': 'muestraIndice',
			'click #mostrarmas': 'mostrarMas'
		},
		detect_scroll: function () {
			var triggerPoint = 100; // 100px from the bottom
			if (!this.isLoading && (($(window).scrollTop() + $(window).height()) > (this.el.scrollHeight * 0.8))) {
				this.anadir();
			}
		},
		mostrarMas: function (ev) {
			ev.stopPropagation();
			ev.preventDefault();
			this.anadir();
		},
		anadir: function () {
			this.isLoading = true;
			var self = this,
			  childLibrary = new Collection(),
			  indice = self.indice || "";
			childLibrary.fetch({ 
				data: {
					empieza: self.empieza,
					indice: indice
				},
				beforeSend: function () {
					$('.mostrarmas').html('<img src="' + $D.path + 'img/ico-modal-cargando.gif" style="height:18px">');
				},
				complete: function () {
					$('.mostrarmas').html('mostrar mas');
				},
				success: function () {
					self.collection.add(childLibrary.toJSON());
					self.isLoading = false;
//					self.render();
				}
			});
		},
		muestraIndice: function (ev) {
			ev.stopPropagation();
			ev.preventDefault();
			var indice = $(ev.currentTarget).data('indice');
			this.indice = indice;

			var ancho = $('#contenido').width();
			$('#container').css({'overflow-y': '', 'overflow-x': ''});
			$('#container').width(ancho);
			$('#container').height($('#contenido').height());
			$('#resultado').hide();

			this.collection.fetch({ data: {indice: indice } });
			
		},
		saltar: function (ev) {
			var enlace = $(ev.currentTarget).data('enlace');
			if (enlace) {
				window.open(enlace, '_blank');
//				window.location = enlace;
			} else {
				this.saltointerior($(ev.currentTarget));
			}
		},
		saltointerior: function ($objeto) {
			var enlace = $objeto.data('link');

			var alto = $('#container').height();
			var ancho = $('#contenido').width();
			$('#container').css({'overflow-y': 'scroll', 'overflow-x': 'hidden'});
			$('#container').width('215px');
			$('#container').find('.destacado').each(function () {
				$(this).removeClass('destacado');
			});
			$('#resultado').show().width(ancho - 215-20).css({'float': 'right', 'padding': '10px'});
			$('#resultado').load(enlace, function () {
				setTimeout(function () {
					$('#container').height($('#resultado').height());
				}, 0);
			});
		},
		mostrarComentariosEv: function (ev) {
			var $objeto = $(ev.currentTarget);
			var ancho = $objeto.width();
			$objeto.find('.comentarios').show().css({left: ancho});
			$objeto.find('.comentarios').animate({left: '0px'}, 300);
		},
		ocultarComentariosEv: function (ev) {
			var $objeto = $(ev.currentTarget);
			var ancho = $objeto.width();
			$objeto.find('.comentarios').animate({left: ancho}, 300, function () {
				$objeto.find('.comentarios').hide();
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
console.log("test")
$.getJSON("http://api.dribbble.com/shots/everyone", function(data) {
	console.log("response", data);
    });

//		Backbone.history.start();
		$('[data-indice]').click(function (ev) {
			$D.App.libraryView.muestraIndice(ev);
		});
		//		$(window).scroll(function () { 
//			console.log("scroll"); 
//		});
	});


});