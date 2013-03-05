/*====================================================================
    Protoswipe js
======================================================================

    @name           Protoswipe
    @author         Gav @ Etch
    @copyright      Etch
    @description    Swipe based paging

======================================================================

======================================================================*/



var pages = {
	containerSelector: ".pages",
	pageSelector: ".page",
	init: function() {
		// Set reverse z-indexes
		var num = 999;

		pages.container = $(pages.containerSelector);
		pages.page = $(pages.pageSelector);

		pages.page.each(function(i, c) {
	        $(c).css('z-index', num - i);
	    });

	    if (!$(".current").length) {
	    	pages.page.eq(0).addClass("current");
	    }

	    pages.page.not(".current").hide();

		// Bind to mousewheel events!

		if (window.addEventListener) {
			// IE9, Chrome, Safari, Opera
			window.addEventListener("mousewheel", pages.mousewheel, false);
			// Firefox
			window.addEventListener("DOMMouseScroll", pages.mousewheel, false);
		}

		// How about keyboard support?

		$(document).keydown(function(e){
			if (e.keyCode == 40) {
				pages.nextPage();
			} else if (e.keyCode == 38) {
				pages.prevPage(true);
			}

		});

	},
	mousewheel: function(e){
		// cross-browser wheel delta
		var e = window.event || e; // old IE support
		var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));

		if (delta == 1) {

			pages.prevPage(true);
		} else if (delta == -1) {
			pages.nextPage();
		}

		return false;
	},
	nextPage: function(){
		var current = $(".current");

		// If there's another page to view
		if (current.next(pages.pageSelector).length) {
			
			pages.page.not(current).hide();
			
			current.next(pages.pageSelector).show();

			var pageHeight = current.outerHeight();

			current.animate({
				top: -pageHeight,
			},{
				duration: 200,
				complete: function() {
					
					current.next(pages.pageSelector).addClass("current");
					current.removeClass("current");
				}
			});
		} else {
			current.animate({
				top: 0
			},200);
		}
	},
	prevPage: function(force){

		if ($(".current").prev(".page").length || $(".no-tranny").length) {
			if (force) {
				$(".current").not(".queued").removeClass("current").prev(pages.pageSelector).addClass("current").addClass("queued");
			}
			var current = $(".current");

			current.animate({
				top: 0
			},{
				duration: 200,
				complete: function(){
					pages.page.not(current).hide();
					current.prev(".page").show();
					current.removeClass("no-tranny").removeClass("queued");
				}
			});
		}

	}
}


$(document).ready(function(){
	
	//Scale fix on iPhone/iPad when switching between portrait and landscape
	MBP.scaleFix();

	pages.init();



	pages.container.swipe( {
		allowPageScroll: "horizontal",
		threshold:100,
		maxTimeThreshold:5000,
		fingers:'all',
		swipeStatus:function(event, phase, direction, distance, duration, fingers)
		{
			
			var pos = '';

			if (direction == 'up') {
				pages.container.addClass("up");

				if (pages.container.hasClass("down")) {
					// Switch up.
					$(".current").removeClass("queued").removeClass("current").next(pages.pageSelector).addClass("current");
					pages.container.removeClass("down");
				}

				var current = $(".current");
				
				pages.page.not(".current").hide();

				current.next(pages.pageSelector).show();

				var pos = '-';
				
				var toMove = pos+distance+'px';

				current.css({
					top: toMove
				});

			} else if (direction == 'down') {
				pages.container.addClass("down").removeClass("up");

				// slide back current and push the prev one down

				//var scale = 0.9
				if ($(".current").prev(".page").length || $(".queued").length) {

					// Move current class
					$(".current").not(".queued").removeClass("current").prev(pages.pageSelector).addClass("current").addClass("queued");

					// Now we've moved it we can save in a var
					var current = $(".current");

					current.addClass("no-tranny");

					pages.page.not(".current").hide();
					current.show().next(pages.pageSelector).show();

					var numericalMove = -current.outerHeight()+distance*2;

					if (numericalMove > 0) {
						numericalMove = 0;
					}

					var toMove = pos+numericalMove+'px';

					current.css({
						top: toMove
					});

				}
			}

			// Push it back
			if (phase == 'cancel') {
				var current = $(".current");
				var pageHeight = current.outerHeight();

				// Remove up/down notifier
				pages.container.removeClass("down").removeClass("up");

				pages.page.removeClass("queued");

				current.prevAll(pages.pageSelector).css({
					top: -pageHeight
				});

				current.nextAll(pages.pageSelector).css({
					top: 0
				});

				if (direction == 'down' && parseInt($(".current").css("top")) < 0) {
					
					current.animate({
						top: -pageHeight
					},{
						duration: 200,
						complete: function(){
							current.removeClass("no-tranny").removeClass("current");
						}
					}).next(pages.pageSelector).addClass("current").animate({
						top: 0
					}, {
						duration: 200
					});
				} else if (parseInt($(".current").css("top")) < 0) {

					$(".current").animate({
						top: 0
					}, {
						duration: 200
					});
				}
				
				
			}
			
		},
		swipe: function(phase, direction, distance, duration, fingers) {
			// Callback on swipe
			pages.page.removeClass("queued");

			pages.container.removeClass("up").removeClass("down");

			var pageHeight = $(".current").outerHeight();

			var current = $(".current");

			current.prevAll(pages.pageSelector).css({
				top: -pageHeight
			});

			current.nextAll(pages.pageSelector).css({
				top: 0
			});

			// If we've done a wacky swipe, reset
			if (direction != 'up' && direction != 'down') {
				current.animate({
					top: 0
				},{
					duration: 200
				});
			}
		
		},
		swipeDown: function(){
			pages.prevPage();
		},
		swipeUp: function(){
			pages.nextPage();
		}
	});

});







