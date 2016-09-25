/**
 * movieId:
 * imgLocation: 
 * movieTitleCn:
 * movieRating: 
 * movieRealseDate
 * @param {[type]} option [description]
 */
var ComponentSwiper = function(option) {
	var template = [
		'<div class="swiper-container ${swiperClass} ui-bgcolor-white">',
		'<div class="swiper-wrapper">',
		'{@each data as item}',
		'<div class="swiper-slide">',
		'<a class="ui-text-center" href="./moviedetail/detail.html?movieId=${item.movieId}&cityId=${cityId}" data-id="${item.movieId}"><img src="${imageURL}${item.imgLocation}" width="100%">',
		'{@if status == 0}',
		'<h3 class="ui-ellipsis">${item.movieTitleCn}</h3>',
		'<h5>$${item.movieRating | getStarLevel}</h5>',
		'{@else}',
		'<h5 class="ui-ellipsis">${item.movieTitleCn}</h5>',
		'<h5 class="ui-h5 ui-ellipsis">${item.movieRealseDate}上映</h5>',
		'{@/if}',
		'</a>',
		'</div>',
		'{@/each}',
		'</div>',
		'</div>'
	].join('');

	pui.juicer.register('getStarLevel', pui.util.getStarLevel);

	var nodes = pui.str2Node(pui.juicer.to_html(template, {
		data: option.data,
		cityId: option.cityId,
		status: option.status,
		swiperClass: option.swiperClass,
		imageURL: option.imageURL
	}));
	var target = document.getElementById(option.id);
	target && target.appendChild(nodes);

	if (window.Swiper) {
		new Swiper('.' + option.swiperClass, {
			spaceBetween: 15,
			slidesPerView: option.slidesPerView
		})
	}

	option.data && (this.count = option.data.length);
}