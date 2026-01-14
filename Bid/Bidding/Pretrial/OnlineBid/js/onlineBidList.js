var listUrl = config.tenderHost + '/PretrialFileController/pretrialFilePageList.do';  //列表接口
var revokeUrl = config.tenderHost + '/PretrialFileController/resetPretrialFile.do';  //撤回接口
var verifyDateTime= config.tenderHost + '/BidFileController/verifyDate.do';//投标截至时间验证
//var delUrl = config.tenderHost + '/BidOpeningController/deleteByPrimaryKey.do';  //列表接口

var pageEdit = "Bidding/Pretrial/OnlineBid/model/fileEdit.html";  //编辑页面
var bidSectionPage = 'Bidding/Pretrial/OnlineBid/model/bidSectionList.html';  //标段列表
var CAcf = null;  //实例化CA
var reason = "";

$(function(){
	var nowDate = top.$("#systemTime").html() + " " + top.$("#sysTime").html();//获取系统当前时间
	//加载列表
	initTable();
	
	//查询
	$("#btnSearch").click(function(){
		$("#tableList").bootstrapTable('destroy');
		initTable();
	});
	
	//编辑
	$('#tableList').on('click','.btnEdit',function(){
		var index = $(this).attr("data-index");
		rowData = $('#tableList').bootstrapTable('getData')[index];
		openEdit(index, 1);
	});
	
	//添加
	$("#btnAdd").click(function(){
		openEdit("", 1);
	});
	//查看
	$("#tableList").on("click", ".btnView", function(){
		var index = $(this).attr("data-index");
		openEdit(index, 2);
	});

	//撤回
	$("#tableList").on("click", ".btnBack", function(){
		var index = $(this).attr("data-index");
		top.layer.confirm('确定撤回?', {icon: 3, title:'提示'}, function(idx){
			top.layer.close(idx);
			verifyDate(index);
		});
		/*parent.layer.prompt({
			formType: 2,
			title:'撤回原因',
			area: ['300px', '100px'] 
		},function(value, idx, elem){
			if(value.trim() == ""){
				return;
			}
			parent.layer.close(idx);
			reason = value;
			revoke(index);
		});*/
	});
	//查看回执
	$("#tableList").on("click", ".btnReceipt", function(){
		var index = $(this).attr("data-index");
		var rowData = $('#tableList').bootstrapTable('getData')[index];
		previewResult(rowData.receiptUrl);
	});
});
function previewResult(pdfPath){
	previewPdf(pdfPath);
/* 	var temp = top.layer.open({
		type: 2,
		title: "预览 ",
		area: ['100%','100%'],
		maxmin: true, //该参数值对type:1和type:2有效。默认不显示最大小化按钮。需要显示配置maxmin: true即可
		resize: false, //是否允许拉伸
		btn:["打印", "关闭"],
		content: $.parserUrlForToken(top.config.FileHost + "/FileController/fileView.do?ftpPath=" + pdfPath),
		yes:function(index,layero){
			var iframeWin = layero.find('iframe')[0].contentWindow;
			window.print();
		}
	});*/
 }
/*
 * 打开编辑窗口
 * 当index为空时是添加，index不为空时是当前所要编辑的索引，
 */
function openEdit(index, source) {
	var width = top.$(window).width() * 0.9;
	var height = top.$(window).height() * 0.9;
	var rowData = "",
		url = pageEdit,
		title = "";
	if(index != "" && index != undefined){
		rowData = $('#tableList').bootstrapTable('getData')[index];
		url = pageEdit;
		title = "上传资格申请文件";
	} else {
		url = bidSectionPage;
		title = "选择标段"
	}
	top.layer.open({
		type: 2,
		title: title,
		area: [width + 'px', height + 'px'],
		resize: false,
		content: url + "?source="+source+ "&id="+rowData.bidSectionId,
		success: function(layero, idx) {
			var iframeWin = layero.find('iframe')[0].contentWindow;	
			iframeWin.passMessage(rowData);  //调用子窗口方法，传参
		},
		end:function(){
			$('#table').bootstrapTable(('refresh'));
		}
	});
}

/*
 * 打开查看窗口
 * index是当前所要查看的索引值，
 */
function openView(index){
	var width = top.$(window).width() * 0.9;
	var height = top.$(window).height() * 0.9;
	var rowData=$('#tableList').bootstrapTable('getData')[index]; //bootstrap获取当前页的数据
	layer.open({
		type: 2,
		title: "查看监标人",
		area: [width + 'px', height + 'px'],
		content: viewPage + "?id=" + rowData.pretrialFileId + "&source=0",
		success:function(layero, index){
			
		}
	});
}



 /*
  * 验证投标文件递交截至时间
  */
 function verifyDate(index) {
	 var rowData = $('#tableList').bootstrapTable('getData')[index]; //bootstrap获取当前页的数据
	 $.ajax({
		 url:verifyDateTime,
		 type:"post",
		 data:{
			 bidSectionId:rowData.bidSectionId,
			 examType:1
		 },
		 success:function(data){
			 var data=data.data;
			 if(!data){
				  revoke(index);  
			 }else{
				//如果截至时间提示关闭则不进行提示
				if(data.optionText.toLowerCase()=="YES".toLowerCase()){
					top.layer.confirm('温馨提示：'+data.optionValue, {icon: 3, title:'提示'}, function(idx){
						top.layer.close(idx);
						revoke(index);
					});  
				}else{ 
					revoke(index); 
				} 
			 }
		 },
		 error:function(){
			 parent.layer.alert("温馨提示"+data.message); 	 
		 } 
	 })	 
 }

 /*
  * 撤回
  */
 function revoke(index) {
 	// if(!CAcf){
		CAcf = new CA({
			target:"#onBidCA",
			confirmCA:function(flag){ 
				if(!flag){  
					return;
				}
				var data = {};
				data = parent.serializeArrayToJson($("#onBidCA").serializeArray());
			 	var rowData = $('#tableList').bootstrapTable('getData')[index]; //bootstrap获取当前页的数据
			 	
			
				data.id = rowData.pretrialFileId;
				data.revokeReason = reason;
				savePost(index, data);
			}
		}); 
	// }
	CAcf.sign();
	
 }
 function savePost(index, data){
 	
     $.ajax({
         url: revokeUrl,
         type: "post",
         data: data,
         success: function (data) {
         	if(data.success == false){
        		parent.layer.alert(data.message);
        		return;
        	}
			$('#tableList').bootstrapTable("refresh");
			previewPdf(data.data);
         },
         error: function (data) {
             parent.layer.alert("加载失败");
         }
     });
 }
 

// 查询参数
function getQueryParams(params) {
	var projectData = {
		offset: params.offset,
		pageSize: params.limit,
		pageNumber: (params.offset / params.limit) + 1, //页码
		'interiorBidSectionCode': $("#interiorBidSectionCode").val(), // 项目编号
		'bidSectionName': $("#bidSectionName").val() // 项目名称	
	};
	return projectData;
};
//表格初始化
function initTable() {
	$("#tableList").bootstrapTable({
		url: listUrl,
		dataType: 'json',
		contentType: "application/x-www-form-urlencoded", // 如果是post必须定义
		method: 'post',
		cache: false, // 是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
		locale: "zh-CN",
		pagination: true, // 是否启用分页
		showPaginationSwitch: false, // 是否显示 数据条数选择框
		pageSize: 15, // 每页的记录行数（*）
		pageNumber: 1, // table初始化时显示的页数
		pageList: [10, 15, 20, 25],
		clickToSelect: true, //是否启用点击选中行
		search: false, // 不显示 搜索框
		sidePagination: 'server', // 服务端分页
		classes: 'table table-bordered', // Class样式
		silent: true, // 必须设置刷新事件
		queryParamsType: "limit",
		queryParams: getQueryParams,
		height:tableHeight,
		striped: true,
		onCheck: function (row) {
			id = row.id;
		},
		columns: [
			[{
					field: 'xh',
					title: '序号',
					align: 'center',
					width:'50',
					formatter: function (value, row, index) {
		                var pageSize = $('#tableList').bootstrapTable('getOptions').pageSize || 15; //通过表的#id 可以得到每页多少条  
		                var pageNumber = $('#tableList').bootstrapTable('getOptions').pageNumber || 1; //通过表的#id 可以得到当前第几页  
		                return pageSize * (pageNumber - 1) + index + 1; //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
		            }
				},{
					field: 'interiorBidSectionCode',
					title: '标段编号',
					align: 'left',
					cellStyle:{
						css: widthCode
					}
				},
				{
					field: 'bidSectionName',
					title: '标段名称',
					align: 'left',
					cellStyle:{
						css: widthName
					}
				},
				
				{
					field: 'status',
					title: '操作',
					align: 'left',
					width: '230px',
					cellStyle:{
						css:{'white-space':'nowrap'}
					},
					formatter: function (value, row, index) {
						var str = "";
						var strSee = '<button  type="button" class="btn btn-primary btn-sm btnView" data-index="'+index+'"><span class="glyphicon glyphicon-eye-open"></span>查看</button>';
						var strEdit =	'<button  type="button" class="btn btn-primary btn-sm btnEdit" data-index="'+index+'"><span class="glyphicon glyphicon-edit"></span>递交</button>';
						var strBack = '<button  type="button" class="btn btn-danger btn-sm btnBack" data-index="'+index+'"><span class="glyphicon glyphicon-share-alt"></span>撤回</button>';
						var strReceipt = '<button  type="button" class="btn btn-primary btn-sm btnReceipt" data-index="'+index+'"><span class="glyphicon glyphicon-eye-open"></span>查看回执</button>';
						
						if(row.status == 1){
							if(GetTime(nowDate) < GetTime(row.bidOpenTime)){
								str = strSee + strBack;
							}else{
								str = strSee;
							}
						}else if(row.status == 2){
							str = strSee+strEdit;
						} else {
							str = strEdit;
						}
						
						return str ;

					}
				}
			]
		]
	});
};

/*
 * 父窗口与子窗口通信方法
 * data是子窗口传来的参数
 */
function passMessage(data){
	$("#tableList").bootstrapTable("refresh");
}
