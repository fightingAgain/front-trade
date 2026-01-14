var listUlr = top.config.tenderHost + '/SupplierSignController/findSupplierSignItemList.do';//供应商

function passMessage(id, examType, supplierId){
	$('#btnClose').click(function(){
		var index=parent.layer.getFrameIndex(window.name);
	    parent.layer.close(index);
	});
	$.ajax({
		url: listUlr,
		type: "post",
		data: {
			'bidSectionId': id,
			'examType':examType,
			'supplierId': supplierId
		},
		async: false,
		success: function (data) {
			if(data.success == false){
				parent.layer.alert('温馨提示：'+data.message);
				return;
			}
			if(data.data){
				initTable(data.data)
			}
		},
		error: function (data) {
			parent.layer.alert("温馨提示：加载失败");
		}
	});
}
function initTable(data){
	$('#detailTable').bootstrapTable({
		pagination: false,
		undefinedText: "",
		columns: [{
				title: "序号",
				align: "center",
				halign: "center",
				width: "50px",
				formatter: function(value, row, index) {
					return index + 1;
				}
			},
			{
				field: "supplierName",
				title: "企业名称",
				align: "left",
				halign: "left",
				width:'200px',
			},
			/* {
				field: "",
				title: "文件名称",
				align: "left",
				width:'200px',
			}, */
			{
				field: "createdTime",
				title: "下载时间",
				align: "left",
				halign: "left",
				width: '150px',
			},
			{
				field: "linkMen",
				title: "联系人",
				align: "left",
				halign: "left",
				width: '100px',
			},
			{
				field: "linkTel",
				title: "手机号",
				align: "left",
				halign: "left",
				width: '100px',
			},
			{
				field: "linkEmail",
				title: "邮箱",
				align: "left",
				halign: "left",
				width: '100px',
			},
			{
				field: "linkCardType",
				title: "联系人证件类型",
				align: "left",
				halign: "left",
				width: '100px',
				formatter: function(value, row, index) {
					if (value == '1') {
						return '护照'
					} else if (value == '0') {
						return '身份证'
					}
				}
			},
			{
				field: "linkCard",
				title: "联系人证件号",
				align: "left",
				halign: "left",
				width: '150px',
			},
		]
	});
	$('#detailTable').bootstrapTable("load", data); //重载数据
}