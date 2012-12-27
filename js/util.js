// MENU RESPONSIVE
$(function () {
	var ejecutandoMenusuperior = false,
	restowidth = $('#resto').css('width'),
	publiwidth = $('#publi').css('width');
	function menucolgante($element, cerrar) {
		var lista;
		if (cerrar) {
			if ($element.siblings('.menucolgante').length > 0) {
				$element.siblings('.menucolgante').find('li a[id^="anchor"],li a[id^="linkk"]').show();
				$element.siblings('ul').children('li').first().after($element.siblings('.menucolgante').find('li'));
				$element.siblings('.menucolgante').remove();
			}
		} else {
			if ($element.siblings('.menucolgante').length < 1) {
				lista = $(document.createElement('ul'));
				$element.siblings('ul').find('li').each(function (index, element) {
					if (index > 0) {
						lista.append($(this));
					}
				});
				lista.addClass('menucolgante').find('li').show();
				lista.find('li a[id^="anchor"],li a[id^="linkk"]').hide();
				$element.after(lista);
			}
		}
		if ($element.siblings('.menucolgante').hasClass('abierto')) {
			$element.siblings('.menucolgante').removeClass('abierto').hide();
		} else {
			$('#header .menucolgante.abierto').removeClass('abierto').hide();
			$element.siblings('.menucolgante').addClass('abierto').show().find('li').show();
		}
	}
	function menusuperior(iniciar) {
		if (ejecutandoMenusuperior) { return;
			} else {
			ejecutandoMenusuperior = true;
		}
		if (window.innerWidth < 960) {
			if (!$('.btn-navbar').hasClass('cerrado') || iniciar) {
				$('.globalbar ul, .globalbartienda ul, .genrebar ul').each(function () {
					$(this).children('li').each(function (index, element) {
						if (index > 0) {
							$(this).fadeOut();
						}
					});
				});
				$('.btn-navbar').addClass('cerrado');
				$('.btn-navbar').delay(500).fadeIn();
			}
		} else {
			if ($('.btn-navbar').first().hasClass('cerrado') || iniciar) {
				$('.btn-navbar').removeClass('cerrado');
				$('.btn-navbar').fadeOut();
				$('.btn-navbar').each(function () {
					menucolgante($(this), '1');
				});

				$('.btn-navbar').siblings('.menucolgante').delay(500).fadeIn();
				$('.globalbar ul li, .globalbartienda ul li, .genrebar ul li').each(function (index, element) {
					if (index > 0) {
						$(this).delay(500).fadeIn();
					}
				});
			}
		}
/*		if (window.innerWidth < 490) {
			if ($('#publi').css(width) === publiwidth){
				$('#publi').css({'width':'100%'});
			}
			if ($('#resto').css(width) === restowidth){
				$('#resto').css({'width':'100%'});
			}
		} else {
			if ($('#publi').css('width') !== publiwidth){
				$('#publi').css({'width':publiwidth});
			}
			if ($('#resto').css(width) !== restowidth){
				$('#resto').css({'width':restowidth});
			}
		}	*/
		ejecutandoMenusuperior = false;

	}

	$('.genrebar,.globalbar,.globalbartienda').append('<div class="btn-navbar"><span class="icon-bar"></span><span class="icon-bar"></span><span class="icon-bar"></span></div>');

	$(window).resize(function () {
		menusuperior();
	});
	menusuperior("1");

	$('.btn-navbar').click(function (ev) {
		menucolgante($(ev.currentTarget));
	});

});