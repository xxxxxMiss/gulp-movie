/**
 * keys: ['NAME_CN', 'ADDRESS', 'distance', 'LOWEST_PRICE', 'RATING', 'id'],
 * keys中的元素依次是：影院名称，地址，距离，多少元起，影院评分，每条记录id
 * @param {[type]} option [description]
 */
var ComponentCinema = function(option) {
	var template = [
		'{@each data as item}',
		'<a class="ui-list-container" data-id="${item[4]}">',
		'<div class="ui-list-wrap ui-divider-part">',
		'<div class="ui-list-item ui-p-t-10">${item[0]}</div>',
		'<div class="ui-list-item ui-list-sub-ctr ui-p-y-5">',
		'<div class="ui-lf-text ui-app-font-xs ui-app-c6">${item[1]}</div>',
		'{@if item[2]}',
		'<div class="ui-rg-text ui-ff-ss ui-app-c6 ui-app-font-xs">${item[2]}</div>',
		'{@else}',
		'<div class="ui-rg-text ui-ff-ss ui-app-c6 ui-app-font-xs ui-color-red">${item[5]}</div>',
		'{@/if}',
		'</div>',
		'<div class="ui-list-item ui-p-b-10"><span class="ui-color-red ui-app-font-sg">￥${item[3]}</span>&nbsp;<span class="ui-app-font-xs">起</span></div>',
		'</div>',
		'</a>',
		'{@/each}'
	].join('');

	var nodes = pui.str2Node(pui.juicer.to_html(template, {
		data: pui.util.handleJSON(option.keys, option.data)
	}));

	var target = document.getElementById(option.id);
	target && target.appendChild(nodes);

	option.data && (this.count = option.data.length);
}