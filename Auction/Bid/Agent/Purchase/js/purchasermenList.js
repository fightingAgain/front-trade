var enterpriseId = location.search.getQueryString('enterpriseId');
	$("#userList").bootstrapTable({
		url: top.config.Syshost + '/EmployeeController/pageView.do',
		clickToSelect: true, //是否启用点击选中行
		pagination: true,
		height: 350,
		sidePagination: 'server', //设置为服务器端分页
		queryParams: function(params) {
			var para = {
				"userInformation.userName": $("#username").val(),
				"pageNumber": params.offset / params.limit + 1,
				"pageSize": params.limit,
				"enterpriseId":enterpriseId
			}
			return para;
		},
		columns: [{
				radio: true
			}, {
				field: 'userName',
				title: '姓名'
			}, {
				field: 'tel',
				title: '手机号码'
			}
		]
	});
$('#btnSearch').click(function() {
	$('#userList').bootstrapTable(('refresh'));
});
function passMessage(callback){
	$('#btn_bao').click(function(){
		var PurchasersData = $('#userList').bootstrapTable('getSelections');
		if(callback){
			callback(PurchasersData);
		};
		parent.layer.close(parent.layer.getFrameIndex(window.name));
	});
	//关闭按钮
	$("#btn_close").click(function() {
		parent.layer.close(parent.layer.getFrameIndex(window.name));
	});
};