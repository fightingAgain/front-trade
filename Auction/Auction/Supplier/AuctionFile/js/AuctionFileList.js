var urlAuctionFileList = top.config.AuctionHost + "/AuctionFileController/findFileSubmitPageList.do"; //竞价文件信息详情

//查询按钮
$(function() {
	initTable()
	//查询按钮
	$("#btnSearch").on('click', function() {
		$('#AuctionFileList').bootstrapTable('destroy');
		initTable()
	});

	$("#checkStateSelect").hide(); //初始隐藏审核状态框

	//下拉框选择刷新
	$("#checkState").change(function() {
		$('#AuctionFileList').bootstrapTable('destroy');
		initTable()
	})

	$("#fileState").change(function() {
		if($(this).val() == 1) {
			$("#checkStateSelect").show();
		} else {
			$("#checkStateSelect").hide();
		}
		$('#AuctionFileList').bootstrapTable('destroy');
		initTable()
	})

});

//设置查询条件
function getQueryParams(params) {
	var AuctionFile = {
		pageSize: params.limit, //每页显示的数据条数
		pageNumber: (params.offset / params.limit) + 1, //页码
		projectName: $("#projectName").val(), //采购项目名称
		projectCode: $("#projectCode").val(), //采购醒目编号
		checkState: $("#checkState").val(), //审核状态
		fileState: $("#fileState").val(), //递交状态
		tenderType: "1" //竞低价
	};
	return AuctionFile;
}
function initTable(){
	$("#AuctionFileList").bootstrapTable({
		url: urlAuctionFileList,
		dataType: 'json',
		method: 'get',
		locale: "zh-CN",
		pagination: true, // 是否启用分页
		showPaginationSwitch: false, // 是否显示 数据条数选择框
		pageSize: 15, // 每页的记录行数（*）
		pageNumber: 1, // table初始化时显示的页数
		clickToSelect: true, //是否启用点击选中行
		pageList: [10, 15, 20, 25],
		height:top.tableHeight,
		toolbar: '#toolbar', // 工具栏ID
		search: false, // 不显示 搜索框
		sidePagination: 'server', // 服务端分页
		classes: 'table table-bordered', // Class样式
		//showRefresh : true, // 显示刷新按钮
		silent: true, // 必须设置刷新事件
		queryParams: getQueryParams, //查询条件参数
		striped: true,
		uniqueId: "projectId",
		columns: [{
				field: 'xh',
				title: '序号',
				width: "50px",
				align: 'center',
				formatter: function(value, row, index) {
					var pageSize = $('#AuctionFileList').bootstrapTable('getOptions').pageSize || 15; //通过表的#id 可以得到每页多少条  
					var pageNumber = $('#AuctionFileList').bootstrapTable('getOptions').pageNumber || 1; //通过表的#id 可以得到当前第几页  
					return pageSize * (pageNumber - 1) + index + 1; //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
				}
			},
			{
				field: 'projectName',
				title: '竞价采购项目名称',
				align: 'left',
				formatter:function(value, row, index){
					if(row.isPublic>1){
						if(row.projectSource==1){
							return row.projectName+'<span class="text-danger" style="font-weight: bold;">(重新竞价)</span><span class="text-danger" style="font-weight: bold;">(邀请)</span>'
						}else if(row.projectSource==0){
							return row.projectName+'<span class="text-danger" style="font-weight: bold;">(邀请)</span>'
						}
						
					}else{
						if(row.projectSource==1){
							return row.projectName+'<span class="text-danger" style="font-weight: bold;">(重新竞价)</span>'
						}else if(row.projectSource==0){
							return row.projectName
						}			    	
					}
				}
			},
			{
				field: 'projectCode',
				title: '竞价采购项目编号',
				align: 'left',
				width: '180'
			},
			{
				field: 'fileEndDate',
				title: '竞价文件递交截止时间',
				align: 'center',
				width: '180'
			},
			{
				field: 'fileCheckEndDate',
				title: '竞价文件审核截止时间',
				align: 'center',
				width: '180'
			},
			{
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
			},
			{
				field: 'checkState',
				title: '审核状态',
				align: 'center',
				width: '120',
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
			},
			{
				field: 'action',
				title: '操作',
				align: 'center',
				width: '120',
				formatter: function(value, row, index) {
	
					if($("#fileState").val() == "0") {
	
						return ' <button type="button" onclick="AuctionFile(\'' + row.projectId + '\',\'submit\')" class="btn btn-primary btn-xs"><span class="glyphicon glyphicon-folder-open"></span> 递交</button>'
	
					} else if($("#fileState").val() == "1" && row.checkState == "0") { //已经递交未审核
	
						return '<button type="button" onclick="AuctionFile(\'' + row.projectId + '\',\'update\')" class="btn btn-primary btn-xs"><span class="glyphicon glyphicon-eye-open"></span>查看</button>'
	
					} else if($("#fileState").val() == "1" && row.checkState == "1") { //已递交审核审核通过
	
						return '<button type="button" onclick="AuctionFile(\'' + row.projectId + '\',\'check\')" class="btn btn-primary btn-xs"><span class="glyphicon glyphicon-eye-open"></span> 查看</button>'
	
					} else if($("#fileState").val() == "1" && row.checkState == "2") { //已经递交审核未通过
						return '<button type="button" onclick="AuctionFile(\'' + row.projectId + '\',\'checkupdate\')" class="btn btn-primary btn-xs"><span class="glyphicon glyphicon-edit"></span>查看</button>'
					}
				}
			}
		]
	});
}


//查看竞价文件 审核通过事件绑定
function AuctionFile(data, type) {
	//存储竞价文件id		
	var rowData = $("#AuctionFileList").bootstrapTable("getRowByUniqueId", data);
    sessionStorage.setItem('purchaseaDataId', JSON.stringify(data));
    if(type=="submit"||type=='checkupdate'){
    	if(rowData.auditTimeout==1){
			if (type=='checkupdate') {
				type = 'check';
			} else {
				parent.layer.alert("已超出文件递交截止时间，无法递交文件");
	   	   		return
			}
	    }
		if(rowData.isPublic>1){
	   	   if(rowData.isAccept!=0&&rowData.isAccept!=1){
	   	   	  parent.layer.confirm('您还未确定是否接受邀请参与'+rowData.projectName+'项目，请确认是否参加', {
				  btn: ['是', '否'] //可以无限个按钮
				}, function(index, layero){			    
				  parent.layer.close(index);
				  affirmBtn(data);
				}, function(index){
				   parent.layer.close(index);
				});
				
			return
	   	   }
	   	   if(rowData.isAccept==1){
	   	   	parent.layer.alert("您已拒绝邀请，无法递交文件")
	   	   	
	   	   	return
	   	   }
		}
    }
	var content = "";
	var title = "";
	switch(type) {
		case "submit":
			title = '递交竞价文件';
			content = 'Auction/Auction/Supplier/AuctionFile/modal/AuctionFileInfo.html?type=submit';
			break;
		case "update":
			title = '查看竞价文件';
			content = 'Auction/Auction/Supplier/AuctionFile/modal/AuctionFileInfo.html?type=update';
			break;
		case "check":
			title = '查看竞价文件';
			content = 'Auction/Auction/Supplier/AuctionFile/modal/AuctionFileInfo.html?type=check';
			break;
		case "checkupdate":
			title = '修改竞价文件';
			content = 'Auction/Auction/Supplier/AuctionFile/modal/AuctionFileInfo.html?type=checkupdate';
			break;
	
	}
	if(type == 'submit' || type == 'checkupdate'){
		//验证下载信息
		checkDownLoadInfos({'projectId': rowData.projectId}, 'jj', function(){
			openAuctionFile(title, content, rowData)
		})
	}else{
		openAuctionFile(title, content, rowData)
	}
		
}
function openAuctionFile(title, content, rowData){
	top.layer.open({
		type: 2,
		title: title,
		area: ["1000px", '600px'],
		// maxmin: false, //该参数值对type:1和type:2有效。默认不显示最大小化按钮。需要显示配置maxmin: true即可
		resize: false, //是否允许拉伸
		closeBtn: 1,
		content: content,
		success:function(layero,index){
	    	var iframeWind=layero.find('iframe')[0].contentWindow; 
	    	iframeWind.du(rowData)
	    }
	});
}
function affirmBtn(projectId){
	sessionStorage.setItem('Num', '2');//邀请供应商的数据缓存  
	parent.layer.open({
		type: 2, //此处以iframe举例			
		title: '邀请函',
		area: ['600px', '300px'],
		// maxmin: false, //该参数值对type:1和type:2有效。默认不显示最大小化按钮。需要显示配置maxmin: true即可
		resize: false, //是否允许拉伸
		closeBtn: 1,
		content: 'Auction/Auction/Supplier/SupplierAuctionPurchase/model/affirm.html?projectId='+projectId,
		success:function(layero,index){
        	var iframeWind=layero.find('iframe')[0].contentWindow; 
        	
        }
	});
}