/**
 * tab筛选，目前只做成线性的，后面可以增强为各种类型的
 * @return {[type]} [description]
 */
(function(pui) {
	var [grid, grid_row, grid_col] = ['position: fixed; top: 50px; left: 0; right: 0; z-index: 99; background-color: #fff;',
		'display: -webkit-box; text-align: center;',
		'height: 50px; line-height: 50px; -webkit-box-flex: 1; width: 1%;'
	]

	function Tab(id, textArr) {
		var html = `<div style="${grid}">
						<div style="${grid_row}" id="tabRow">
							<div style="${grid_col}">${textArr[0]}</div>
							<div style="${grid_col}">${textArr[1]}</div>
							<div style="${grid_col}">${textArr[2]}</div>
						</div>
					</div>`;
		var temp = document.createElement('div');
		temp.innerHTML = html;
		var target = document.getElementById(id);

		var gridNode = temp.children[0],
			tabItems = gridNode.children[0].children,
			itemArr = Array.from ? Array.from(tabItems) : [].slice.call(tabItems);

		// 默认初始化第一个为选中状态
		tabItems[0].style.boxShadow = '0 2px #519dda';
		tabItems[0].style.color = '#519dda';
		if (target) {
			target.appendChild(gridNode);
		} else {
			document.body.appendChild(gridNode);
		}

		itemArr.forEach(function(v, i) {
			v.addEventListener('click', function() {
				itemArr.forEach(function(v, i) {
					v.style.boxShadow = '0 0';
					v.style.color = '#333';
				})
				this.style.boxShadow = '0 2px #519dda';
				this.style.color = '#519dda';
			}, false)
		})


		this.target = gridNode;
		return this;
	}

	pui.Tab = Tab;
})(pui);