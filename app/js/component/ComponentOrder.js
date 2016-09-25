var ComponentOrder = function(option) {
	var template = [
		'{@each data as item}',
		'<li class="ui-m-t-10">',
		'<div class="ui-grid ui-bgcolor-white">',
		'<div class="ui-grid-row ui-app-font-body ui-p-x-15 ui-p-y-12">${item.merName}</div>',
		'</div><a href="ticket_detail_paied.html" data-id="${item.orderId}">',
		'<div class="movie-container" style="margin-top:0">',
		'<div class="pure-g ui-bgcolor-body ui-p-y-10 ui-p-x-15">',
		'<div class="pure-u-1-4"><img class="movie-pic" src="${imageURL}${item.imgPath}" width="100%"></div>',
		'<div class="pure-u-3-4">',
		'<div class="ui-grid">',
		'<div class="ui-grid-row ui-app-font-body pure-g ui-p-t-5">',
		'<div class="pure-u-4-5">${item.prodName}&nbsp;&nbsp;',
		'{@if item.version && item.version[0] == "1"}',
		'<img src="../images/2DBlack.png" height="13px">&nbsp;&nbsp;',
		'{@/if}',
		'{@if item.version && item.version[0] == "2"}',
		'<img src="../images/3DBlack.png" height="13px">&nbsp;&nbsp;',
		'{@/if}',
		'{@if item.version && item.version[0] == "3"}',
		'<img src="../images/ImaxBlack.png" height="13px">&nbsp;&nbsp;',
		'{@/if}',
		'{@if item.version && item.version[0] == "4"}',
		'<img src="../images/Imax3DBlack.png" height="13px">&nbsp;&nbsp;',
		'{@/if}',
		'{@if item.version && item.version[0] == "5"}',
		'<img src="../images/4DBlack.png" height="13px">&nbsp;&nbsp;',
		'{@/if}',
		'{@if item.version && item.version[0] == "6"}',
		'<img src="../images/HugescreenBlack.png" height="13px">&nbsp;&nbsp;',
		'{@/if}',
		'{@if item.version && item.version[0] == "7"}',
		'<img src="../images/Hugescreen3DBlack.png" height="13px">&nbsp;&nbsp;',
		'{@/if}',
		'{@if item.version && item.version[1] == "1"}',
		'<img src="../images/2DBlack.png" height="13px">',
		'{@/if}',
		'{@if item.version && item.version[1] == "2"}',
		'<img src="../images/3DBlack.png" height="13px">',
		'{@/if}',
		'{@if item.version && item.version[1] == "3"}',
		'<img src="../images/ImaxBlack.png" height="13px">',
		'{@/if}',
		'{@if item.version && item.version[1] == "4"}',
		'<img src="../images/Imax3DBlack.png" height="13px">',
		'{@/if}',
		'{@if item.version && item.version[1] == "5"}',
		'<img src="../images/4DBlack.png" height="13px">',
		'{@/if}',
		'{@if item.version && item.version[1] == "6"}',
		'<img src="../images/HugescreenBlack.png" height="13px">',
		'{@/if}',
		'{@if item.version && item.version[1] == "7"}',
		'<img src="../images/Hugescreen3DBlack.png" height="13px">',
		'{@/if}',
		'</div>',
		'<div class="pure-u-1-5 ui-text-right">&times; ${item.quantity}</div>',
		'</div>',
		'</div>',
		'<div class="ui-grid">',
		'<div class="ui-grid-row ui-app-font-body ui-p-t-10 ui-color-disabled">${item.releaseDate}</div>',
		'</div>',
		'{@if item.mainOrderStatus == "02" || item.mainOrderStatus == "03" || item.mainOrderStatus == "12"}',
		'<div class="ui-grid">',
		'<div class="ui-grid-row ui-app-font-body ui-p-t-10 ui-color-disabled">取票信息&nbsp;&nbsp;&nbsp;&nbsp;${item.ecode}</div>',
		'</div>',
		'{@/if}',
		'</div>',
		'</div>',
		'</div></a>',
		'<div class="ui-grid ui-bgcolor-white">',
		'<div class="ui-grid-row pure-g ui-app-font-body ui-p-x-15 ui-p-y-15">',
		'{@if item.mainOrderStatus == "02" || item.mainOrderStatus == "03"}',
		'<div class="pure-u-1-5">已付款</div>',
		'{@/if}',
		'{@if item.mainOrderStatus == "01" || item.mainOrderStatus == "05"}',
		'<div class="pure-u-1-5">待付款</div>',
		'{@/if}',
		'{@if item.mainOrderStatus == "04" || item.mainOrderStatus == "13"}',
		'<div class="pure-u-1-5">出票失败</div>',
		'{@/if}',
		'{@if item.mainOrderStatus == "12"}',
		'<div class="pure-u-1-5">交易完成</div>',
		'{@/if}',
		'{@if item.mainOrderStatus == "06"}',
		'<div class="pure-u-1-5">退款中</div>',
		'{@/if}',
		'{@if item.mainOrderStatus == "08"}',
		'<div class="pure-u-1-5">已退款</div>',
		'{@/if}',
		'{@if item.mainOrderStatus == "07"}',
		'<div class="pure-u-1-5">退款失败</div>',
		'{@/if}',
		'<div class="pure-u-4-5 ui-text-right">共${item.quantity}件商品合计<span class="ui-color-red">￥${item.totalPrice}</span>+${item.scoreCostNum}分</div>',
		'</div>',
		'{@if item.mainOrderStatus == "01" || item.mainOrderStatus == "05"}',
		'<div class="ui-grid ui-bgcolor-white">',
		'<div class="ui-grid-row ui-text-right ui-app-font-body ui-p-x-15 ui-p-b-15">剩余支付时间： ${item.lefttime}秒</div>',
		'</div>',
		'{@/if}',
		'<div class="ui-grid-row ui-text-right ui-p-b-10 ui-p-r-15">',
		'<button class="ui-p-x-20">删除</button>',
		'{@if item.mainOrderStatus == "01" || item.mainOrderStatus == "05"}',
		'<button class="ui-btn-orange ui-p-x-20 ui-m-l-10">支付</button>',
		'{@/if}',
		'</div>',
		'</div>',
		'</li>',
		'{@/each}'
	].join('');

	var nodes = pui.str2Node(pui.juicer.to_html(template, {
		data: option.data,
		imageURL: option.imageURL
	}));
	var target = document.getElementById(option.id);
	target && target.appendChild(nodes);

	option.data && (this.count = option.data.length);
}