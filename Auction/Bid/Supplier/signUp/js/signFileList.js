var urlFileList = top.config.bidhost + "/BidFileController/findSignFileSubmitPageList.do"; //查看可递交询价报名文件

//查询按钮
$(function() {
	//查询按钮
	$("#btnSearch").on('click', function() {
		$('#signFileList').bootstrapTable('refresh');
	});

	$("#checkStateSelect").hide(); //初始隐藏审核状态框

	//下拉框选择刷新
	$("#checkState").change(function() {
		$('#signFileList').bootstrapTable('refresh');
	})

	$("#fileState").change(function() {
		if($(this).val() == 1) {
			$("#checkStateSelect").show();
		} else {
			$("#checkStateSelect").hide();
		}
		$('#signFileList').bootstrapTable('refresh');
	})

});

//设置查询条件
function getQueryParams(params) {
	var File = {
		pageSize: params.limit, //每页显示的数据条数
		pageNumber: (params.offset / params.limit) + 1, //页码
		projectName: $("#projectName").val(), //采购项目名称
		projectCode: $("#projectCode").val(), //采购项目编号
		packageName: $("#packageName").val(), //采购包件名称
		packageNum: $("#packageNum").val(), //采购包件编号
		checkState: $("#checkState").val(), //审核状态
		fileState: $("#fileState").val(), //递交状态
	};
	return File;
}

$("#signFileList").bootstrapTable({
	url: urlFileList,
	dataType: 'json',
	method: 'get',
	locale: "zh-CN",
	pagination: true, // 是否启用分页
	cache: false, // 是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
	showPaginationSwitch: false, // 是否显示 数据条数选择框
	pageSize: 15, // 每页的记录行数（*）
	pageNumber: 1, // table初始化时显示的页数
	clickToSelect: true, //是否启用点击选中行
	pageList: [10, 15, 20, 25],
	search: false, // 不显示 搜索框
	sidePagination: 'server', // 服务端分页
	classes: 'table table-bordered', // Class样式
	//showRefresh : true, // 显示刷新按钮
	silent: true, // 必须设置刷新事件
	queryParams: getQueryParams, //查询条件参数
	striped: true,
	//uniqueId: "packageId",
	columns: [{
		field: 'xh',
		title: '序号',
		width: "50px",
		align: 'center',
		formatter: function(value, row, index) {
			var pageSize = $('#signFileList').bootstrapTable('getOptions').pageSize || 15; //通过表的#id 可以得到每页多少条  
			var pageNumber = $('#signFileList').bootstrapTable('getOptions').pageNumber || 1; //通过表的#id 可以得到当前第几页  
			return pageSize * (pageNumber - 1) + index + 1; //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
		}
	}, {
		field: 'projectName',
		title: '项目名称',
		align: 'left',
		width: '200',
		formatter: function(value, row, index) {
			if(row.isPublic > 1) {
				if(row.projectSource == 1) {
					return row.projectName + '<span class="text-danger" style="font-weight: bold;">(重新采购)</span><span class="text-danger" style="font-weight: bold;">(邀请)</span>'
				} else if(row.projectSource == 0) {
					return row.projectName + '<span class="text-danger" style="font-weight: bold;">(邀请)</span>'
				}

			} else {
				if(row.projectSource == 1) {
					return row.projectName + '<span class="text-danger" style="font-weight: bold;">(重新采购)</span>'
				} else if(row.projectSource == 0) {
					return row.projectName
				}
			}
		}
	}, {
		field: 'projectCode',
		title: '项目编号',
		align: 'left',
		width: '180'
	}, {
		field: 'packageNum',
		title: '包件编号',
		align: 'left',
		width: '180'
	}, {
		field: 'packageName',
		title: '包件名称',
		align: 'left',
		width: '200'
	}, {
		field: 'signEndDate',
		title: '报名文件递交截止时间',
		align: 'center',
		width: '180'
	}, {
		field: 'offerEndDate',
		title: '报名文件审核截止时间',
		align: 'center',
		width: '180'
	}, {
		field: 'fileState',
		title: '递交状态',
		align: 'center',
		width: '100',
		formatter: function(value, row, index) {
			if($("#fileState").val() == "0") {
				return "<div class='text-danger'>未递交</div>"

			} else if($("#fileState").val() == "1") {
				return "<div class='text-success'>已递交</div>"
			}
		}
	}, {
		field: 'checkState',
		title: '审核状态',
		align: 'center',
		width: '100',
		formatter: function(value, row, index) {
			if($("#fileState").val() == "0") {
				return "<div class='text-warning'>未审核</div>";
			} else if(row.checkState == "0") {
				return "<div class='text-warning'>未审核</div>"
			} else if(row.checkState == "1") {
				return "<div class='text-success'>审核已通过</div>"
			} else if(row.checkState == "2") {
				return "<div class='text-danger'>审核未通过</div>"
			}
		}
	}, {
		field: 'action',
		title: '操作',
		align: 'center',
		width: '120',
		formatter: function(value, row, index) {

			if($("#fileState").val() == "0") {

				return ' <button type="button" onclick="File(' + index + ',\'submit\')" class="btn btn-primary btn-xs"><span class="glyphicon glyphicon-folder-open"></span> 递交</button>'

			} else if($("#fileState").val() == "1" && row.checkState == "0") { //已经递交未审核

				return '<button type="button" onclick="File(' + index + ',\'update\')" class="btn btn-primary btn-xs"><span class="glyphicon glyphicon-eye-open"></span>查看</button>'

			} else if($("#fileState").val() == "1" && row.checkState == "1") { //已递交审核审核通过

				return '<button type="button" onclick="File(' + index + ',\'check\')" class="btn btn-primary btn-xs"><span class="glyphicon glyphicon-eye-open"></span> 查看</button>'

			} else if($("#fileState").val() == "1" && row.checkState == "2") { //已经递交审核未通过
				return '<button type="button" onclick="File(' + index + ',\'checkupdate\')" class="btn btn-primary btn-xs"><span class="glyphicon glyphicon-edit"></span>修改</button>'
			}
		}
	}]
});

//查看报名文件 审核通过事件绑定
function File($index, type) {
	//存储报名文件id		
	var rowData = $('#signFileList').bootstrapTable('getData'); //
	sessionStorage.setItem('rowData', JSON.stringify(rowData[$index])); //获取当前选择行的数据，并缓存	
	//age.setItem('purchaseaDataId', JSON.stringify(data));
	var uid = rowData[$index].projectId; //项目Id
	var packageId = rowData[$index].packageId; //包件ID	
	/*if(rowData.isPublic > 1) {
		if(rowData.isAccept != 0 && rowData.isAccept != 1) {
			parent.layer.confirm('您还未确定是否接受邀请参与' + rowData.projectName + '项目，请确认是否参加', {
				btn: ['是', '否'] //可以无限个按钮
			}, function(index, layero) {
				parent.layer.close(index);
				affirmBtn();
			}, function(index) {
				parent.layer.close(index);
			});

			return
		}
		if(rowData.isAccept == 1) {
			parent.layer.alert("您已拒绝邀请，无法递交文件")

			return
		}
	}*/
	var content = "";
	var title = "";
	switch(type) {
		/*case "submit":
			title = '递交报名文件';
			content = '0502/Supplier/signUp/modal/signFileInfo.html?type=submit';
			break;*/
		case "update":
			title = '查看报名文件';
			content = '0502/Supplier/signUp/model/signFileInfo.html?type=update';
			break;
		case "check":
			title = '查看报名文件';
			content = '0502/Supplier/signUp/model/signFileInfo.html?type=check';
			break;
		case "checkupdate":
			title = '修改报名文件';
			content = '0502/Supplier/signUp/model/signFileInfo.html?type=checkupdate';
			break;

	}

	if(type == "submit"){
		//报价前，生成订单，提示支付
		$.ajax({
			type: "post",
			url: config.bidhost + "/OrderController/isNotPayOrder.do",
			data: {
				projectId: uid,
				packId: packageId
			},
			async: true,
			success: function(data) {
				if(data.success) {
					/*if(isPublics > 1) {
						if(isAccepts === undefined || isAccepts === "" || isAccepts === null || isAccepts === "undefined") {
							parent.layer.confirm('您还未参与该项目,请确认是否参加', {
								btn: ['是', '否'] //可以无限个按钮
							}, function(index, layero) {
	
								parent.layer.close(index);
								affirmBtn();
							}, function(index) {
								parent.layer.close(index)
							});
							return;
						};
						if(isAccepts == 1) {
							parent.layer.alert("您已拒绝参与该项目，无法再进行报价");
							return
						};
						$('#table').bootstrapTable(('refresh')); // 很重要的一步，刷新url！
					};*/
					parent.layer.open({
						type: 2, //此处以iframe举例
						area: ["1100px", '600px'],
						title:'递交报名文件',
						content: '0502/Supplier/signUp/model/signFileInfo.html?type=submit' + '&key=' + uid + '&kid=' + packageId,
						maxmin: false, //该参数值对type:1和type:2有效。默认不显示最大小化按钮。需要显示配置maxmin: true即可
						resize: false, //是否允许拉伸
						closeBtn: 1
					});
				} else {
					/*if(data.message == '有未支付的订单') {
						top.layer.confirm("您有未支付的订单,确定前往支付？", function() {
							$('.page-content .content').load('view/Bid/Order/MyOrder.html',function(){
									$('#tenderType').val('0');
									$('#status').val('0');
								});
							top.layer.closeAll();
						});
					}*/
					
					if(data.message != "系统异常"){
						top.layer.confirm("温馨提示：感谢参与该项目的采购，您需要先支付"+data.message+"费用，是否现在支付？", function() {
							$('.page-content .content').load('view/Bid/Order/MyOrder.html',function(){
									$('#tenderType').val('0');
									$('#status').val('0');
								});
							top.layer.closeAll();
						});
					}else{
						top.layer.alert(data.message);
					}
				}
			}
		});
	}else{
		top.layer.open({
			type: 2,
			title: title,
			area: ["1100px", '600px'],
			maxmin: false, //该参数值对type:1和type:2有效。默认不显示最大小化按钮。需要显示配置maxmin: true即可
			resize: false, //是否允许拉伸
			closeBtn: 1,
			content: content,
		});
	}
}

/*function affirmBtn() {
	sessionStorage.setItem('Num', '2'); //邀请供应商的数据缓存  
	parent.layer.open({
		type: 2, //此处以iframe举例			
		title: '邀请函',
		area: ['600px', '300px'],
		maxmin: false, //该参数值对type:1和type:2有效。默认不显示最大小化按钮。需要显示配置maxmin: true即可
		resize: false, //是否允许拉伸
		closeBtn: 1,
		content: '0502/Bid/Purchase/model/affirm.html',
		success: function(layero, index) {
			var iframeWind = layero.find('iframe')[0].contentWindow;

		}
	});
}*/