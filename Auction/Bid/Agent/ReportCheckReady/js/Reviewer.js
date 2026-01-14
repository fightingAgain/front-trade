var url = top.config.bidhost;

//确定按钮
$("#SbmReviewer").click(function() {
	var data = $("#Reviewertable").bootstrapTable('getSelections');
	sessionStorage.setItem("Reviewer_data", JSON.stringify(data));
	parent.layer.close(parent.layer.index);
});

$("#btnQuery").click(function() {
	$("#Reviewertable").bootstrapTable(('refresh'));
});

//设置查询条件
function queryParams(params) {
	var data = JSON.parse(sessionStorage.getItem("ProjectData"));

	var para = {
		id: data.projectId,
		enterpriseId: data.enterpriseId,
		isAgent:data.isAgent
	}
	if($("#selecttype").val() == "name") {
		para.userName = $("#inputValue").val();
	} else if($("#selecttype").val() == "code") {
		para.logCode = $("#inputValue").val();
	}
	return para;
}

$("#Reviewertable").bootstrapTable({
	url: url + '/CheckController/getCheckers.do',
	pagination: true, //是否分页
	sidePagination: 'server', //设置为服务器端分页
	clickToSelect: true, //是否启用点击选中行
	queryParams: queryParams, //参数
	columns: [{
		radio: true,
		formatter: function(value, row, index) {
			//再次点击进来的时候把之前选中行 默认选中
			var Reviewer_data = JSON.parse(sessionStorage.getItem("Reviewer_data"));
			if(Reviewer_data != null && Reviewer_data != "" && Reviewer_data != undefined) {
				for(var i = 0; i < Reviewer_data.length; i++) {
					if(Reviewer_data[i].id == row.id) {
						return {
							checked: true
						};
					}
				}
			}
		}
	}, {
		field: 'id',
		title: '序号',
		width: '50px',
		cellStyle:{css:{"text-align":"center"}},
		formatter: function(value, row, index) {
			return index + 1;
		}
	}, {
		field: 'userName',
		title: '姓名'
	}, {
		field: 'logCode',
		title: '登录名'
	}, {
		field: 'departmentName',
		title: '所属部门'
	}, {
		field: 'employeeState',
		title: '状态',
		formatter: function(value, row, index) {
			switch(value) {
				case 0:
					return "正常";
					break;
				case 1:
					return "删除";
					break;
				case 2:
					return "停用";
					break;
			}
		}
	}]
});