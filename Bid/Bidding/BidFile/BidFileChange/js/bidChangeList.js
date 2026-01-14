var getListUrl = config.tenderHost + '/DocClarifyController/findBidSectionChangeList.do';//根据标段查询变更列表
var resetflieurl = config.tenderHost + '/DocClarifyController/resetDocClarifyById.do'; //撤回招标文件及附件信息
var deleteUrl = config.tenderHost + '/DocClarifyController/delete.do'; //删除招标文件及附件信息

var pageEdit = 'Bidding/BidFile/BidFileChange/model/BidFileEdit.html';
var pageView = 'Bidding/BidFile/BidFileChange/model/BidFileView.html';

var bidId = '';//标段id
$(function(){
	bidId = $.getUrlParam('id');
	getListData();
	
})
function passMessage(data,callback){
	/*关闭*/
	$('#btnClose').click(function(){
		callback()
		var index=parent.layer.getFrameIndex(window.name);
        parent.layer.close(index);
	});
}
function getListData(){
	$.ajax({
		type:"post",
		url:getListUrl,
		async:true,
		data: {
			'bidSectionId': bidId
		},
		
		success: function(data){
			if(data.success){
				if(data.data){
					listHtml(data.data)	
				}
			}else{
				parent.layer.alert(data.message)
			}
		}
	});
}
function listHtml(data){
	$('#tableList').bootstrapTable({
		pagination: false,
		undefinedText: "",
		
		columns: [
		{
		    field: "xuhao",
			title: "序号",
			align: "center",
			halign: "center",
			width: "50px",
			formatter: function(value, row, index) {
				return index + 1;
			},
		
		},
		{
			field: "docName",
			title: "变更名称",
			align: "left",
			halign: "left",									
		},
		{
			field: "interiorBidSectionCode",
			title: "标段编号",
			align: "left",
			halign: "left",									
		},
		{
			field: "bidSectionName",
			title: "标段名称",
			align: "left",
			halign: "left",									
		},
		{
			field: "createTime",
			title: "创建时间",
			align: "left",
			halign: "left",									
		},
		{
			field: "xz",
			title: "操作",
			align: "left",
			
			width: "160px",
			events:{
				'click .btnView':function(e,value, row, index){
					top.layer.open({
						type: 2,
						title: "查看招标文件变更",
						area: ['1000px', '600px'],
						resize: false,
						content: pageView + "?source=0" + "&id=" + row.id + "&isThrough=" + (row.bidDocClarifyState == 2 ? 1 : 0), //标段主键id
						success: function(layero, idx) {
							var iframeWin = layero.find('iframe')[0].contentWindow;	
							iframeWin.passMessage(row);  //调用子窗口方法，传参
						}
					});
				},
				'click .btnEdit':function(e,value, row, index){
					top.layer.open({
						type: 2,
						title: "招标文件变更",
						area: ['1000px', '600px'],
						resize: false,
						content: siteInfo.sysUrl + '/' +pageEdit + '?isForward=1',
						success: function(layero, idx) {
							var iframeWin = layero.find('iframe')[0].contentWindow;	
							iframeWin.passMessage(row,getListData);  //调用子窗口方法，传参
						},
						end:function(){
							$('#table').bootstrapTable('refresh');
						}
					});
				},
				'click .btnDel':function(e,value, row, index){
					top.layer.confirm('确定删除该招标文件?', {
						icon: 3,
						title: '询问'
					}, function(ind) {
						top.layer.close(ind);
						$.ajax({
							url: deleteUrl,
							type: "post",
							data: {
								bidSectionId: row.bidSectionId,
								examType: 2
							},
							success: function(data) {
								if(data.success) {
									top.layer.alert("删除成功", {
										icon: 1,
										title: '提示'
									});
									getListData();
								}else{
									top.layer.alert(data.message);
									return;
								}
							},
							error: function(data) {
								top.layer.alert("加载失败", {
									icon: 2,
									title: '提示'
								});
							}
						});
					});
				},
				'click .btnCancel':function(e,value, row, index){
					top.layer.confirm('确定撤回该招标文件?', {
						icon: 3,
						title: '询问'
					}, function(ind) {
						top.layer.close(ind);
						$.ajax({
							url: resetflieurl,
							type: "post",
							data: {
								id: row.id
							},
							success: function(data) {
								if(data.success) {
									top.layer.alert("撤回成功", {
										icon: 1,
										title: '提示'
									});
								getListData();
								}else{
									top.layer.alert(data.message);
									return;	
								}
							},
							error: function(data) {
								top.layer.alert("加载失败", {
									icon: 2,
									title: '提示'
								});
							}
						});
					});
				}
			},
			formatter: function(value, row, index) {
				var str = "";
				var strSee = '<button  type="button" class="btn btn-primary btn-sm btnView" data-index="' + index + '"><span class="glyphicon glyphicon-eye-open"></span>查看</button>';
				var strEdit = '<button  type="button" class="btn btn-primary btn-sm btnEdit" data-index="' + index + '"><span class="glyphicon glyphicon-edit"></span>编辑</button>';
				var strDel = '<button  type="button" class="btn btn-danger btn-sm btnDel" data-index="' + index + '"><span class="glyphicon glyphicon-remove"></span>删除</button>';
				var strCancel = '<button  type="button" class="btn btn-danger btn-sm btnCancel" data-index="' + index + '"><span class="glyphicon glyphicon-share-alt"></span>撤回</button>';
				if(row.bidDocClarifyState == 0) { //0为临时保存，1为提交审核，2为审核通过，3为审核未通过
					str += strSee + strEdit + strDel;
				} else if(row.bidDocClarifyState == 1) {
					str += strSee;
				} else if(row.bidDocClarifyState == 2) {
					str += strSee;
				} else if(row.bidDocClarifyState == 3) {
					str += strSee + strEdit;
				} else {
					str += strEdit;
				}
				return str;
			},
		}
		]
	});
	$('#tableList').bootstrapTable("load",data); //重载数据
}
