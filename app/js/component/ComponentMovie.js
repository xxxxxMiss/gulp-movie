/**
 * option配置
 * 	{
 * 		id: 将生成的数据插入到id所在的容器元素
 * 		data: 服务端的传过来的数据，
 * 		由于当初没有协调好，此处对服务端传过来的数据做一次处理
 * 		keys: [],服务端要显用到的字段列表，此列表中的顺序一定不能乱
 * 		keys: ['IMG_LOCATION','TITLE_CN', 'version', 'RATING', 'PLOT', 'REALSE_DATE', 'status', 'id']
 * 		keys中的元素依次代表：影片图片路径，影片名称，影片类型(2d, imax)，影片评分，影片简介，
 * 		上映日期，状态(正在热映0，即将上映1)，每条记录id
 * 	}
 * @param {[type]} option [description]
 */
var ComponentMovie = function(option) {
	var template = [
		'{@each data as item}',
		'<li class="movie-list ui-divider-part" data-id="${item[7]}">',
		'<div class="list-left"><img src="${imageURL}${item[0]}"></div>',
		'<div class="list-right">',
		'<div>',
		'<div>${item[1]}</div>',
		// '{@if item[2] && item[2][0] == "1"}',
		// '<div class="list-right-icon"><img src="../images/2DSmall.png"></div>',
		// '{@/if}',
		'{@if item[2] && item[2][0] == "2"}',
		'<div class="list-right-icon"><img src="../images/3DSmall.png"></div>',
		'{@/if}',
		'{@if item[2] && item[2][0] == "3"}',
		'<div class="list-right-icon"><img src="../images/ImaxSmall.png"></div>',
		'{@/if}',
		'{@if item[2] && item[2][0] == "4"}',
		'<div class="list-right-icon"><img src="../images/Imax3DSmall.png"></div>',
		'{@/if}',
		'{@if item[2] && item[2][0] == "5"}',
		'<div class="list-right-icon"><img src="../images/4DSmall.png"></div>',
		'{@/if}',
		'{@if item[2] && item[2][0] == "6"}',
		'<div class="list-right-icon"><img src="../images/HugescreenSmall.png"></div>',
		'{@/if}',
		'{@if item[2] && item[2][0] == "7"}',
		'<div class="list-right-icon"><img src="../images/Hugescreen3DSmall.png"></div>',
		'{@/if}',
		// '{@if item[2] && item[2][1] == "1"}',
		// '<div class="list-right-icon"><img src="../images/2DSmall.png"></div>',
		// '{@/if}',
		'{@if item[2] && item[2][1] == "2"}',
		'<div class="list-right-icon"><img src="../images/3DSmall.png"></div>',
		'{@/if}',
		'{@if item[2] && item[2][1] == "3"}',
		'<div class="list-right-icon"><img src="../images/ImaxSmall.png"></div>',
		'{@/if}',
		'{@if item[2] && item[2][1] == "4"}',
		'<div class="list-right-icon"><img src="../images/Imax3DSmall.png"></div>',
		'{@/if}',
		'{@if item[2] && item[2][1] == "5"}',
		'<div class="list-right-icon"><img src="../images/4DSmall.png"></div>',
		'{@/if}',
		'{@if item[2] && item[2][1] == "6"}',
		'<div class="list-right-icon"><img src="../images/HugescreenSmall.png"></div>',
		'{@/if}',
		'{@if item[2] && item[2][1] == "7"}',
		'<div class="list-right-icon"><img src="../images/Hugescreen3DSmall.png"></div>',
		'{@/if}',
		'{@if item[6] == "0"}',
		'<span class="ui-movie-score">&nbsp;&nbsp;&nbsp;${item[3]}</span>',
		'{@/if}',
		'</div>',
		'<div class="ui-ellipsis-2">${item[4]}</div>',
		'{@if item[6] == "0"}',
		'<div class="ui-btn-buy">',
		'<button data-id="${item[7]}">购票</button>',
		'</div>',
		'{@else}',
		'<div class="ui-btn-presell">',
		'<div class="ui-app-font-xs">${item[5]}上映</div>',
		'<button data-id="${item[7]}">预售</button>',
		'</div>',
		'{@/if}',
		'</div>',
		'</li>',
		'{@/each}'
	].join('');

	var nodes = pui.str2Node(pui.juicer.to_html(template, {
		data: pui.util.handleJSON(option.keys, option.data),
		imageURL: option.imageURL
	}));
	var target = document.getElementById(option.id);
	target && target.appendChild(nodes);

	option.data && (this.count = option.data.length);
}