 var detailUrl = config.tenderHost + '/BidOpeningOffController/findOfflineBidOpenging.do'; // 开标结果详情
 var detUrl = config.tenderHost + '/BidOpeningOffController/findOfflineBidOpengingByBidId.do';// 开标结果详情
 var supplierUrl = config.tenderHost + '/BidOpeningOffController/findSupplier.do'; // 开标结果详情

 var customListUrl = config.tenderHost + '/BidOpeningOffController/findBidOpeningData.do'; // 自定义列表

 var enterprisePage = "Bidding/Model/enterpriseList.html"; //投标人页面
 var projectEditPage = "Bidding/BidOpen/OfflineResult/model/projectView.html"; //编辑开标记录  工程
 var goodsEditPage = "Bidding/BidOpen/OfflineResult/model/goodsView.html"; //编辑开标记录  货物
 var serviceEditPage = "Bidding/BidOpen/OfflineResult/model/serviceView.html"; //编辑开标记录  服务

 var idList = [];
 var biderData = [];
 var editId = "";
 
 var bidSectionId = "",  //标段id 
 	openId = "",  // 录入数据id
 	projectType = ""; //项目分类
 	
var source = 0; //链接来源  0:查看  1审核
var isThrough;
var getForm = '';//KZT 控制台来源
 $(function(){
 	isThrough = $.getUrlParam("isThrough");
 	if($.getUrlParam("id") && $.getUrlParam("id") != "undefined"){
 		openId = $.getUrlParam("id");
 	}
 	if($.getUrlParam("source") && $.getUrlParam("source") != "undefined"){
	 	source = $.getUrlParam("source");
	 	if(source == 1) {
	 		$("#btnClose").hide();
	 		$("#approval").ApprovalProcess({
		url: top.config.tenderHost,
	 			type:"xxkbjgjl", 
	 			businessId:openId, 
	 			status:2,
	 			submitSuccess:function(){
		         	var index = parent.layer.getFrameIndex(window.name); 
					parent.layer.closeAll(); 
					parent.layer.alert("审核成功",{icon:7,title:'提示'});
					parent.$("#projectList").bootstrapTable("refresh");
	 			}
	 		});
	 	} else {
	 		$("#btnClose").show();
	 		$("#approval").ApprovalProcess({
		url: top.config.tenderHost,
	 			type:"xxkbjgjl", 
	 			businessId:openId, 
	 			status:3,
	 			checkState:isThrough
	 		});
	 	}
 	}
 	
 	//审核
//	$("#approval").ApprovalProcess({
		url: top.config.tenderHost,
//		businessId:openId, 
//		status:1,
//		type:"xxkbjgjl",
//	});
 	
	
	//关闭当前窗口
	$("#btnClose").click(function(){
		var index = parent.layer.getFrameIndex(window.name); 
		parent.layer.close(index); 
	});
	//保存
	$("#btnSave").click(function(){
		saveForm(0);
	});
	//提交
	$("#btnSubmit").click(function(){
		if(checkForm($("#formName"))){
			var html = "投标人列表：<br/>";
			var isExit = false;
			for(var i = 0; i < biderData.length; i++){
		 		if(!biderData[i].bidOpeningDetailsId){
		 			isExit = true;
	 				html += "第"+(i+1)+"行 "+biderData[i].supplierName + " 的开标记录未录入<br/>";
		 		}
		 	}
			if(isExit){
				top.layer.alert(html);
				return;
			}
			parent.layer.confirm('确定提交?', {
				icon: 3,
				title: '询问'
			}, function(index) {
				parent.layer.close(index);
				saveForm(1);
			});
		}
		
		
	});
	
	$("#btnChoose").click(function(){
		openList();
	});
	
	//选择投标人
	$("#btnTender").click(function(){
		openEnterprise();
	});
	//自定义列
	$("#btnCustom").click(function(){
		top.layer.prompt({title: '请输入列名', formType: 0}, function(text, index){
		    top.layer.close(index);
		    $.ajax({
				url: customAddUrl,
				type: "post",
				data: {
					bidSectionId: bidSectionId,
					dataName:text
				},
				success: function(data) {
					if(data.success == false) {
						parent.layer.alert(data.message);
						return;
					}
					customList();
				},
				error: function(data) {
					parent.layer.alert("加载失败", {
						icon: 2,
						title: '提示'
					});
				}
			});
		    
		    
		});
	});
	//删除自定义列
	$("#tableCustom").on("click", ".btnRemoveCustom", function(){
		var id = $(this).attr("data-id");
		top.layer.confirm('所有投标人的开标记录的该列信息都将被删除', {icon: 3, title:'提示'}, function(index){
			parent.layer.close(index);
			$.ajax({
				url: customDelUrl,
				type: "post",
				data: {
					id: id
				},
				success: function(data) {
					if(data.success == false) {
						parent.layer.alert(data.message);
						return;
					}
					customList();
				},
				error: function(data) {
					parent.layer.alert("加载失败", {
						icon: 2,
						title: '提示'
					});
				}
			});
		});
	});
	// 编辑供应商
	$("#biderBlock").on("click", ".btnViewBider", function(){
		var index = $(this).attr("data-index"); 
//		editId = index;
		openBidderView(biderData[index]);
	});
	
	
 });

function customList(){
	$("#tableCustom tr:gt(0)").remove();
	$.ajax({
		url: customListUrl,
		type: "post",
		data: {
			bidSectionId: bidSectionId
		},
		success: function(data) {
			if(data.success == false) {
				parent.layer.alert(data.message);
				return;
			}
			var html = "";
			var arr = data.data;
			for(var i = 0; i < arr.length; i++){
				html += '<tr><td>'+arr[i].dataName+'</td></tr>'
				
			}
			$(html).appendTo("#tableCustom");
		},
		error: function(data) {
			parent.layer.alert("加载失败", {
				icon: 2,
				title: '提示'
			});
		}
	});
}
 
 //
function passMessage(data){
 	if(data.bidSectionId){
		bidSectionId = data.bidSectionId;
	}
 	if(data.getForm ){
 		getForm = data.getForm;
 	}
// 	if(data.bidOpenId){
//		openId = data.bidOpenId;
//		detail();
//	}
	detail();
 	if(data.tenderProjectClassifyCode){
		projectType = data.tenderProjectClassifyCode;
	}
	$("#bidSectionName").html(data.bidSectionName ? data.bidSectionName : "");
	$("#interiorBidSectionCode").html(data.interiorBidSectionCode ? data.interiorBidSectionCode : "");

 	$("#bidSectionStates").html(data.bidSectionStates ? data.bidSectionStates : "招标公告已发布");
 	
//	$("#approval").ApprovalProcess({
		url: top.config.tenderHost,
//		type:"xxkbjgjl", 
//		businessId:openId, 
//		status:3,
//		checkState:isThrough
//	});
 }
 
 
/*
 * 打开投标人编辑页面
 */
function openBidderView(data) {
	var width = $(parent).width() * 0.9;
	var height = $(parent).height() * 0.9;
	var typeCode = "", url="";
	typeCode = data.tenderProjectClassifyCode.substr(0, 1);
	if(typeCode == "A"){
		url = projectEditPage;
	} else if(typeCode == "B"){
		url = goodsEditPage;
	} else if(typeCode == "C"){
		url = serviceEditPage;
	}
	top.layer.open({
		type: 2,
		title: "投标人",
		area: [width + 'px', height + 'px'],
		resize: false,
		content: url,
		success: function(layero, index) {
			var iframeWin = layero.find('iframe')[0].contentWindow;
			data.callBack = bidderCallback;
			data.bidSectionId = bidSectionId;
			data.bidSectionName = $("#bidSectionName").html();
			iframeWin.passMessage(data); //调用子窗口方法，传参

		}
	});
}

/*
 * 同级页面返回参数
 */
function bidderCallback(data) {
	supplierList();
}

/*
 * 打开供应商页面
 */
function openEnterprise() {
	var width = $(parent).width() * 0.9;
	var height = $(parent).height() * 0.9;
	top.layer.open({
		type: 2,
		title: "供应商",
		area: [width + 'px', height + 'px'],
		resize: false,
		content: enterprisePage,
		success: function(layero, index) {
			var iframeWin = layero.find('iframe')[0].contentWindow;

			iframeWin.passMessage({
				isMulti: true,
				idList: idList,
				enterpriseType: "01",
				callback: enterpriseCallback
			}); //调用子窗口方法，传参

		}
	});
}

/*
 * 同级页面返回参数
 */
function enterpriseCallback(data) {
	var item = {};
	for(var i = 0; i < data.length; i++){
		for(var j = 0; j < idList.length; j++){
			if(data[i].id == idList[j]){
				break;
			}
		}
		if(j == idList.length){
			item = {}
			item.bidderName = data[i].enterpriseName;
			item.bidderId = data[i].id;
			item.bidderOrgCode = data[i].enterpriseCode;
			item.bidManager = data[i].enterprisePerson;
			biderData.push(item);
		}
	}
	enterpriseHtml();
}
var tenderTypeData={
	"A":"工程",
	"B":"货物",
	"C":"服务",
	"C50":"广宣类"
}
function getTenderType(val){
	var type = (val.substring(0,3) == "C50" ? "C50" : val.substring(0,1));
	return tenderTypeData[type];
}
/**
 * 供应商
 * @param {Object} data
 */
function enterpriseHtml() {
	data = biderData;
	var html = "";
	idList = [];
	if($("#enterpriseTab").length == 0) {
		html += '<table id="enterpriseTab" class="table table-bordered" style="margin-top: 5px;">\
                	<tr>\
                		<th style="width:50px;">序号</th>\
                		<th>投标人名称</th>\
                		<th>项目分类</th>\
                		<th style="width: 100px;text-align:center;">是否投标</th>\
                		<th style="width: 260px;">操作</th>\
                	</tr>';
	}
	for(var i = 0; i < data.length; i++) {
		idList.push(data[i].bidderId);
		html += '<tr>\
            		<td style="text-align:center;">' + (i+1) + '</td>\
            		<td>' + data[i].supplierName + '</td>\
            		<td>' + getTenderType(data[i].tenderProjectClassifyCode) + '</td>';
      	if(data[i].bidOpeningDetailsId){
      		html += '<td style="text-align:center;">是</td>';
      		html+='<td><button type="button" data-index="'+i+'" class="btn btn-primary btn-sm btnViewBider"><span class="glyphicon glyphicon-eye-open"></span>查看开标记录</button></td>';
      	} else {
      		html += '<td style="text-align:center;">否</td>';
      		html += '<td style="text-align:center;"></td>';
      	}
      	
		html += '</tr>';
	}

	if($("#enterpriseTab").length == 0) {
		html += '</table>';
		$("#biderBlock").html("");
		$(html).appendTo("#biderBlock");
	} else {
		$("#enterpriseTab tr:gt(0)").remove();
		$(html).appendTo("#enterpriseTab");
	}
}

 
 /*
  * 查询开标记录详情
  */
 function detail() {
	 var postUrl = "";
	 var postData = {};
	 postUrl = detailUrl;
	 postData.id = openId;
	 if(getForm && getForm == "KZT"){
		 postUrl = detUrl;
		 postData.bidSectionId = bidSectionId;
		 postData.examType = 2;
	 }
     $.ajax({
         url: postUrl,
         type: "post",
		 data: postData,
         success: function (data) {
         	if(data.success == false){
        		parent.layer.alert(data.message);
        		return;
        	}
			if(data.data){
				if(!openId){
					openId = data.data.id?data.data.id:'';
				}
				if(!bidSectionId){
					bidSectionId = data.data.bidSectionId?data.data.bidSectionId:'';
				}
			}
			for(var key in data.data){
				$("#" + key).html(data.data[key]);
			}
			supplierList();
			customList();
         },
         error: function (data) {
             parent.layer.alert("加载失败");
         }
     });
 }
 /*
  * 查询投标人列表
  */
 function supplierList() {
     $.ajax({
         url: supplierUrl,
         type: "post",
         data: {bidSectionId:bidSectionId},
         success: function (data) {
         	if(data.success == false){
        		parent.layer.alert(data.message);
        		return;
        	}
			biderData = data.data;
			enterpriseHtml();
         },
         error: function (data) {
             parent.layer.alert("加载失败");
         }
     });
 }
 