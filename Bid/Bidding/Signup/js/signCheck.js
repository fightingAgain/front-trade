/**

 * 报名
 */


var pageView= 'Bidding/Signup/model/signView.html'; //查看报名信息

var listUrl = config.tenderHost+'/SupplierSignController/findSignUpSupplierList.do';//投标人报名信息记录i--标段查询分页接口
var bidSectionId = "";  //标段id

var examType;
var createType = 0;//是否是项目经理 0是 1 否
$(function(){
	if($.getUrlParam("examType") && $.getUrlParam("examType") != "undefined"){
 		examType = $.getUrlParam("examType");
 	}
	if($.getUrlParam("id") && $.getUrlParam("id") != "undefined"){
		bidSectionId =$.getUrlParam("id");
	}
	if($.getUrlParam("createType") && $.getUrlParam("createType") != "undefined"){
		createType =$.getUrlParam("createType");
	}
	signUpList();
	var bidDetail = findProjectDetail(bidSectionId);
	$("#interiorBidSectionCode").html(bidDetail.interiorBidSectionCode);
	$("#bidSectionName").html(bidDetail.bidSectionName);
	
	
	//选择标段
	$("#btnChoose").click(function(){
		openChoose();
	});
	
	//关闭当前窗口
	$("#btnClose").click(function() {
		var index = parent.layer.getFrameIndex(window.name);
		parent.layer.close(index);
	});
	
	$("#btnBuy").click(function(){
		if(bidSectionId == ""){
			top.layer.alert("请选择标段");
			return;
		}
		openEdit();
	})
	

});

/*
 * 打开查看窗口
 * 当index为空时是添加，index不为空时是当前所要编辑的索引，
 */
function openView(id, state, callback) {
	
	parent.layer.open({
		type: 2,
		title: "报名信息",
		area: ['90%', '90%'],
		resize: false,
		content: pageView + "?id=" + bidSectionId + "&keyId=" + id + "&examType="+examType+"&source="+state,
		success: function(layero, idx) {
			var iframeWin = layero.find('iframe')[0].contentWindow;	
			iframeWin.passMessage(function(){
				signUpList();
				if(callback){
					callback()
				}
//				parent.$("#table").bootstrapTable('refresh');
			});  //调用子窗口方法，传参
		}
	});
}

//报名列表
function signUpList(){
	var RenameData = getBidderRenameMark(bidSectionId);//投标人更名信息
	$.ajax({
		type: "post",
		url: listUrl,
		data:{bidSectionId:bidSectionId, examType:examType},
		success: function(data) {
			if(!data.success) {
				parent.layer.alert(data.message);
				return;
			}
			
			var html = "";
			rowData = data.data;
			$("#tableList tr:gt(0)").remove();
			for(var i = 0; i < data.data.length; i++){
				var item = data.data[i];
				var states = "";
				if(item.states == 0){
					states = "未提交";
				} else if(item.states == 1){
					states = "审核中";
				} else if(item.states == 2){
					states = "审核通过";
				} else if(item.states == 3){
					states = "审核未通过";
				}
				html += '<tr>'
							+'<td>'+(i+1)+'</td>'
							+'<td>'+showBidderRenameMark(item.supplierId, item.supplierName, RenameData, 'formName')+'</td>'
							+'<td>'+(item.createTime ? item.createTime : "")+'</td>'
							+'<td>'+(item.legalContact ? item.legalContact : "")+'</td>'
							+'<td>'+(item.legalContactPhone ? item.legalContactPhone : "")+'</td>'
							+'<td>'+(item.linkEmail ? item.linkEmail : "")+'</td>'
							+'<td>'+states+'</td>';
				if(createType && createType == 1){
					html += '<td><button type="button" class="btn btn-primary btn-sm btnView" data-id="' + item.id + '"><span class="glyphicon glyphicon-eye-open"></span>查看</button></td>';
				}else {
					if(item.states == 1){
						html += '<td><button type="button" class="btn btn-primary btn-sm btnCheck" data-id="' + item.id + '"><span class="glyphicon glyphicon-eye-open"></span>审核</button></td>';
						
					} else {
						html += '<td><button type="button" class="btn btn-primary btn-sm btnView" data-id="' + item.id + '"><span class="glyphicon glyphicon-eye-open"></span>查看</button></td>';
					}
				}
				html += '</tr>';
			}
			$(html).appendTo("#tableList");
			
		}
	});
}
// 分页查询参数，
function queryParams(params) {
    return {
        'pageNumber': params.offset / params.limit + 1, //当前页数
        'pageSize': params.limit, // 每页显示数量
        'offset': params.offset, // SQL语句偏移量	
        'bidSectionId': bidSectionId, // 项目编号
        'examType':examType
    }
}
function passMessage(data,callback){
	//查看
	$("#tableList").on("click", ".btnView", function(){
		var id = $(this).attr("data-id");
		openView(id, 0);
	});
	//审核
	$("#tableList").on("click", ".btnCheck", function(){
		var id = $(this).attr("data-id");
		openView(id, 1, callback);
	});
}
