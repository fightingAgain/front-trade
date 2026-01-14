var BidNotice = JSON.parse(sessionStorage.getItem("BidNotice")); //操作数据行
var projectId;
var type = getUrlParam("type"); //update发布公示  view查看详情
var examType = getUrlParam("examType"); 

var enterpriseType = getUrlParam("enterpriseType"); 
var bidNoticetable = new Array(); //供应商分项表格
var bidNoticetableTitle = new Array(); //动态表格头

var WorkflowTypeUrl = top.config.bidhost + "/WorkflowController/findWorkflowCheckerByType.do" //项目审核人列表数据接口

var isWorkflow = ""; //是否有审核人  0 没有 1为有
var isCheck = false; //是否设置流程
var WORKFLOWTYPE = "jggs"; //申明项目公告类型
var tenderTypeCode = sessionStorage.getItem("tenderTypeCode");
$(function() {
	var url = "";
	var para;

	$("input[name='isPublic'][value='0']").prop("checked", true); //默认公开

	if(type == "view") {
		url = top.config.bidhost + "/BidNoticeController/findBidNoticeInfo.do";
		para = {
			id: BidNotice.id,
			tenderType: tenderTypeCode,//0为询比采购，1为竞价采购，2为竞卖
			examType:examType
		}
	}else if(type == "views"){
		url = top.config.bidhost + "/BidNoticeController/findBidNoticeInfo.do";
		para = {
			id: BidNotice.bidNoticeId,
			tenderType: tenderTypeCode,//0为询比采购，1为竞价采购，2为竞卖
			examType:examType
		}
	} else {
		url = top.config.bidhost + "/BidNoticeController/findPackageInfo.do";
		para = {
			packageId: BidNotice.packageId,
			tenderType: tenderTypeCode, //0为询比采购，1为竞价采购，2为竞卖
			examType:examType
		}
		if(examType==0){
			$(".noneddd").hide()
		}else{
			if(tenderTypeCode==6){
				$(".noneddd").hide()
			}else{
				$(".noneddd").show()
			}
		}
	}
	
	if(typeof(BidNotice) != 'undefined') {
		$.ajax({
			url: url,
			data: para,
			async: false,
			success: function(data) {
				if(data.success) {
					data = data.data;
					 
					if(type == "update") {
						WorkflowUrl() //加载审核人
						projectId = data.projectId;
						if(enterpriseType != '06'){
							findWorkflowCheckerAndAccp(projectId);
						}else{
							$(".workflowList").hide();
						}
						
						$("#projectName").html(data.projectName);
						$("#projectCode").html(data.projectCode);
						$("input[name='isPublic'][value=" + data.isOpen + "]").prop("checked", true);
						$("#purchaserName").html(data.purchaserName);
						$("#purchaserAddress").html(data.purchaserAddress);
						$("#purchaserLinkmen").html(data.purchaserLinkmen);
						$("#purchaserTel").html(data.purchaserTel);
						$("#bidNoticeStartDate").val(data.openStartDate);
						$("#bidNoticeEndDate").val(data.opetEndDate);
						$("#packageName").html(data.packageName);
						$("#packageNum").html(data.packageNum);
						if(data.priceChecks != undefined){
							var priceChecks = data.priceChecks;
						
							for(var i = 0; i < priceChecks.length; i++) {
								var item = {
									enterpriseId: priceChecks[i].id,
									"供应商名称": priceChecks[i].enterpriseName + "<input type='hidden' name='enterpriseId' value='" + priceChecks[i].id + "'/>"
								}
								bidNoticetable.push(item);
							}
						}
						
						bidNoticetableTitle.push("enterpriseId");
						bidNoticetableTitle.push("供应商名称");
						//判断是否有供应商
						if(bidNoticetable.length > 0) {
							bindBidNotice(bidNoticetable);
							$("#whyFailureTr").hide();
						} else {
							$("#isSupplier").hide();
							if(examType == 1){
								$("#whyFailure").html("无供应商报价");
							}else{
								$("#whyFailure").html("无供应商参与预审");
							}
						}

					} else {
						$('.update').hide();
						$(".view").show();
						$(".isWatch").hide();
						$('.employee').hide(); //查看不显示审核人
						if(enterpriseType != '06'){
							findWorkflowCheckerAndAccp(data.id);
						}else{
							$(".workflowList").hide();
						}
                        
						$("#projectName").html(data.projectName);
						$("#projectCode").html(data.projectCode);
						$("input[name='isPublic'][value=" + data.isOpen + "]").prop("checked", true);
						$("#purchaserName").html(data.purchaserName);
						$("#purchaserAddress").html(data.purchaserAddress);
						$("#purchaserLinkmen").html(data.purchaserLinkmen);
						$("#purchaserTel").html(data.purchaserTel);
						$("#bidNoticeStartDate1").text(data.openStartDate);
						$("#bidNoticeEndDate1").text(data.opetEndDate);
						$("#packageName").html(data.packageName);
						$("#packageNum").html(data.packageNum);

						//bindBidNotice(bidNoticetable);
						var bidNoticItems = data.bidNoticItems; //列 公示项
						var bidNoticInfos = data.bidNoticInfos; //内容
						var priceChecks = data.priceChecks; //供应商
						if(typeof(priceChecks) != "undefined" && priceChecks.length > 0) {
							var table = "<tr><th style='text-align:left'>供应商名称</th>";
							if(typeof(bidNoticItems) != "undefined" && bidNoticItems.length > 0) {
								for(var i = 0; i < bidNoticItems.length; i++) { //表格头
									table += "<th>" + bidNoticItems[i].itemName + "</th>";
								}
							}
							table += "</tr>";
							for(var i = 0; i < priceChecks.length; i++) { //供应商 数据行
								table += "<tr>";
								table += "<td style='text-align:left'>" + priceChecks[i].enterpriseName +"</td>";
								//table += "<td style='text-align:left'>" + priceChecks[i].enterpriseName +(priceChecks[i].isOut == 1?"<font color='red'>(已淘汰)</font>":"")+ "</td>";
								
								
								if(typeof(bidNoticItems) != "undefined" && bidNoticItems.length > 0) {
									for(var j = 0; j < bidNoticItems.length; j++) { //表格头
										for(var x = 0; x < bidNoticInfos.length; x++) {
											if(bidNoticItems[j].id == bidNoticInfos[x].bidNoticeItemId && priceChecks[i].id == bidNoticInfos[x].supplierId)
												table += "<td>" + (bidNoticInfos[x].itemContent || "") + "</td>";
										}
									}
								}
								table += "</tr>";
							}
							$("#whyFailureTr").hide();
							$("#bidNoticeTable").html(table);
						} else {
							if(examType == 1){
								$("#whyFailure").html("无供应商报价");
							}else{
								$("#whyFailure").html("无供应商参与预审");
							}

						}
					}
                  
				}
				
			}
		});
		
	}
	if(type == "view"||type == "views") {
		$("input[name='isPublic']").prop("disabled", "disabled");
		$("#bidNoticeStartDate").prop("disabled", "disabled");
		$("#bidNoticeEndDate").prop("disabled", "disabled");
		$("#btn_submit").hide();
		$("#btns").html("");
	}
});

$("#btn_submit").click(function() {
	var isPublic = $("input[name='isPublic']:checked").val();
	var bidNoticeStartDate = $("#bidNoticeStartDate").val();
	var bidNoticeEndDate = $("#bidNoticeEndDate").val();

	if(!isPublic) {
		layer.alert("请选择是否公开");
		return;
	}
	if(bidNoticeStartDate == "") {
		layer.alert("请选择公示开始时间");
		return;
	}
	if(bidNoticeEndDate == "") {
		layer.alert("请选择公示截止时间");
		return;
	}
	var d1 = new Date(bidNoticeStartDate.replace(/\-/g, "\/"));
	var d2 = new Date(bidNoticeEndDate.replace(/\-/g, "\/"));
	if(d1 >= d2) {
		layer.alert("结束时间不能早于开始时间");
		return;
	}

	if(isWorkflow) {
		if($("#employeeId").val() == "") {
			layer.alert("请选择审核人");
			return;
		}
	}

	var para = {
		projectId: projectId,
		packageId: BidNotice.packageId,
		isOpen: isPublic,
		openStartDate: bidNoticeStartDate,
		opetEndDate: bidNoticeEndDate,
		tenderType:tenderTypeCode
	}

	if(isWorkflow) {
		para.checkerId = $("#employeeId").val();
	} else {
		para.checkerId = 0;
	}
	
	if(type == "update"){
		para.id = BidNotice.id;
	}
	
	para.examType = examType;
	getBidNotice();
	var BidNoticeData = $('#formBidNotice').serialize();
	//提交
	if(isCheck) {
		top.layer.confirm('温馨提示：该流程未设置审批节点，您是否继续提交？', function() {
			$.ajax({
				url: top.config.bidhost + "/BidNoticeController/saveBidNotice.do",
				type: 'post',
				data: para,
				success: function(data) {
					if(data.success) {
						parent.$('#BidNoticeList').bootstrapTable('refresh');
						parent.layer.close(parent.layer.getFrameIndex(window.name));
						top.layer.alert("发布成功");
					} else {
						layer.alert(data.message);
					}
				}
			});
		})
	} else {
		$.ajax({
			url: top.config.bidhost + "/BidNoticeController/saveBidNotice.do",
			type: 'post',
			data: para,
			success: function(data) {
				if(data.success) {
					parent.$('#BidNoticeList').bootstrapTable('refresh');
					parent.layer.close(parent.layer.getFrameIndex(window.name));
					top.layer.alert("发布成功");
				} else {
					layer.alert(data.message);
				}
			}
		});
	}

});

//添加列
$("#addColumn").click(function() {
	layer.prompt({
		formType: 2,
		value: '',
		title: '添加分项',
		area: ['300px', '50px']
	}, function(value, index, elem) {
		if(typeof(bidNoticetable[0][value]) == "undefined") {
			getBidNotice();
			for(var i = 0; i < bidNoticetable.length; i++) {
				bidNoticetable[i][value] = "";
			}
			bidNoticetableTitle.push(value);
			bindBidNotice(bidNoticetable);
			layer.close(index);
		} else {
			layer.alert("分项名已存在");
		}
	});
});
//删除列
$("#delColumn").click(function() {
	layer.prompt({
		formType: 2,
		value: '',
		title: '删除分项',
		area: ['300px', '50px']
	}, function(value, index, elem) {
		if(typeof(bidNoticetable[0][value]) != "undefined") {
			if(value != "供应商名称" && value != "enterpriseId") {
				getBidNotice();
				for(var i = 0; i < bidNoticetable.length; i++) {
					delete bidNoticetable[i][value];
				}
				var arrayindex = bidNoticetableTitle.indexOf(value);
				bidNoticetableTitle.splice(arrayindex, 1);
				bindBidNotice(bidNoticetable);
				layer.close(index);
			} else {
				layer.alert("此分项无法删除");
			}

		} else {
			layer.alert("没有此分项");
		}
	});
});
//获取数据
function getBidNotice() {
	for(var i = 0; i < bidNoticetable.length; i++) {
		for(var x in bidNoticetable[i]) {
			if(x != "供应商名称" && x != "enterpriseId") {
				bidNoticetable[i][x] = $("#" + bidNoticetable[i].enterpriseId + "_" + x).val();
			}
		}
	}
}

//填充表格表格
function bindBidNotice(data) {
	var table = "";
	for(var i = 0; i < data.length; i++) {
		//表头title
		if(i == 0) {
			table += "<tr class='active'>";
			for(var x = 0; x < bidNoticetableTitle.length; x++) {
				if(bidNoticetableTitle[x] != "enterpriseId") {
					table += "<th style='text-align:left'>";
					if(bidNoticetableTitle[x] != "供应商名称") {
						table += "<input type='hidden' name='itemName' value='" + bidNoticetableTitle[x] + "'/>";
					}
					table += bidNoticetableTitle[x] + "</th>"
				}
			}
			table += "</tr>";
		}
		//数据行
		table += "<tr>";
		for(var x = 0; x < bidNoticetableTitle.length; x++) {
			var item = bidNoticetableTitle[x];
			if(item != "供应商名称" && item != "enterpriseId") {
				if(data[i][item] == '') {
					table += "<td style='text-align:left'><input type='text' class='form-control' name='itemContent' id='" + data[i].enterpriseId + "_" + item + "'/></td>";
				} else {
					table += "<td style='text-align:left'><input type='text' class='form-control' name='itemContent' id='" + data[i].enterpriseId + "_" + item + "' value='" + data[i][item] + "'/></td>";
				}
			} else {
				if(item != "enterpriseId") {
					table += "<td style='text-align:left'>" + data[i][item] + "</td>";
				}
			}
		}
		table += "</tr>";
	}
	$("#bidNoticeTable").html(table);
};
var nowDate=top.$("#systemTime").html()+" "+top.$("#sysTime").html();
$('#bidNoticeStartDate').datetimepicker({
	step:5,
	lang:'ch',
	format: 'Y-m-d H:i',
	minDate:NewDateT(nowDate),
	

});
$('#bidNoticeEndDate').datetimepicker({

	step:5,
	lang:'ch',
	format: 'Y-m-d H:i',							
	onShow:function(){
		if($("#bidNoticeStartDate").val()!=""){
			$('#bidNoticeEndDate').datetimepicker({						
				minDate:NewDateT($("#bidNoticeStartDate").val())
			})
		}else{
			$('#bidNoticeEndDate').datetimepicker({						
				minDate:NewDateT(nowDate)
			})
		}
		
	},
});
function NewDateT(str){  
  if(!str){  
    return 0;  
  }  
  arr=str.split(" ");  
  d=arr[0].split("-");  
  t=arr[1].split(":");
  var date = new Date(); 
 
  date.setUTCFullYear(d[0], d[1] - 1, d[2]);   
  date.setUTCHours(t[0]-8, t[1], t[2], 0);
  return date;  
}

function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象  
	var r = window.location.search.substr(1).match(reg); // 匹配目标参数  
	if(r != null) return unescape(r[2]);
	return null; // 返回参数值  
}

//关闭按钮
$("#btn_close").click(function() {
	parent.layer.close(parent.layer.getFrameIndex(window.name));
});

function WorkflowUrl() {
	$.ajax({
		url: WorkflowTypeUrl,
		type: 'get',
		dataType: 'json',
		async: false,
		data: {
			"workflowLevel": 0,
			"workflowType": "jggs"
		},
		success: function(data) {
			var option = ""
			//判断是否有审核人		   	  
			if(data.message == 0) {
				isCheck = true;
				//$("#checkerV").html('<input type="hidden" name="checkerId" value="0"/>');
				isWorkflow = 0;
				$('.employee').hide()
				return;
			};
			if(data.message == 2) {
				isWorkflow = 1;
				parent.layer.alert("找不到该级别的审批人,请先添加审批人");
				$("#btn_submit").hide();
				$('.employee').hide();
				return;
			};
			if(data.success == true) {
				$('.employee').show()
				isWorkflow = 1;
				if(data.data.length == 0) {
					option = '<option>暂无审核人员</option>'
				}
				if(data.data.length > 0) {

					option = "<option value=''>请选择审核人员</option>"
					for(var i = 0; i < data.data.length; i++) {
						option += '<option value="' + data.data[i].employeeId + '">' + data.data[i].userName + '</option>'
					}
				}
			}
			$("#employeeId").html(option);
		}
	});
}