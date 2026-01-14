var SaleNotice = JSON.parse(sessionStorage.getItem("SaleNotice")); //操作数据行
var projectId;
var type = getUrlParam("type"); //update发布公示  view查看详情
var tType = getUrlParam("tType"); //看是采购人还是供应商
var bidNoticetable = new Array(); //供应商分项表格
var bidNoticetableTitle = new Array(); //动态表格头

var WorkflowTypeUrl = top.config.AuctionHost + "/WorkflowController/findWorkflowCheckerByType.do" //项目审核人列表数据接口

var WORKFLOWTYPE = "jggs";
var isWorkflow = ""; //是否有审核人  0 没有 1为有
var isCheck=false;
$(function() {
	var url = "";
	var para;

	$("input[name='isPublic'][value='0']").attr("checked", true); //默认公开
	new UEditorEdit({
		contentKey:'noticeContent',
		pageType:'view',
	})
	if(type == "view") {
		$(".NewsContent").hide();
		url = top.config.AuctionHost + "/BidNoticeController/findBidNoticeInfo.do";
		para = {
			id: SaleNotice.id,
			tenderType: 2 //0为询比采购，1为竞卖采购，2为竞卖
		}
	}else if(type == "views"){
		$(".NewsContent").hide();
		url = top.config.AuctionHost + "/BidNoticeController/findBidNoticeInfo.do";
		para = {
			id: SaleNotice.bidNoticeId,
			tenderType: 2//0为询比采购，1为竞卖采购，2为竞卖
		}
	} else {
		$(".NewsContents").hide();	
		url = top.config.AuctionHost + "/BidNoticeController/findPackageInfo.do";
		para = {
			packageId: SaleNotice.packageId,
			tenderType: 2 //0为询比采购，1为竞卖采购，2为竞卖
		}
	}
	
	if(tType == 'supplier'){
		$('.shenhe').hide();
	}
	
	if(typeof(SaleNotice) != 'undefined') {
		$.ajax({
			url: url,
			data: para,
			async: true,
			success: function(reas) {
				if(reas.success) {
					data = reas.data;
					if(type == "update") {
						WorkflowUrl() //加载审核人
						projectId = data.projectId;
						$("#projectName").html(data.projectName);
						if (data.projectSource > 0) {
							$("#projectName").html(data.projectName + '<span class="red">(重新竞卖)</span>');
						}
						$("#projectCode").html(data.projectCode);
						$("#purchaserName").html(data.purchaserName);
						$("#purchaserAddress").html(data.purchaserAddress);
						$("#purchaserLinkmen").html(data.purchaserLinkmen);
						$("#purchaserTel").html(data.purchaserTel);
						$("#packageName").html(data.packageName);
						$("#packageNum").html(data.packageNum);
						wordHtml()
						findWorkflowCheckerAndAccp(projectId);
					} else {
						$(".isWatch").hide();
						$('.employee').hide() //查看不显示审核人

						$("#projectName").html(data.projectName);
						if (data.projectSource > 0) {
							$("#projectName").html(data.projectName + '<span class="red">(重新竞卖)</span>');
						}
						$("#projectCode").html(data.projectCode);
						$("input[name='isPublic'][value=" + data.isOpen + "]").attr("checked", true);
						$("#purchaserName").html(data.purchaserName);
						$("#purchaserAddress").html(data.purchaserAddress);
						$("#purchaserLinkmen").html(data.purchaserLinkmen);
						$("#purchaserTel").html(data.purchaserTel);
						$("#bidNoticeStartDate").val(data.openStartDate);
						$("#bidNoticeEndDate").val(data.opetEndDate);
						$("#packageName").html(data.packageName);
						$("#packageNum").html(data.packageNum);
						$("#NewsContent").html(data.noticeContent)
						findWorkflowCheckerAndAccp(data.id);
					}	
					mediaEditor.setValue(data)									
				}
			}
		});
	}
	if(type == "view"||type == "views") {
		$("input[name='isPublic']").attr("disabled", "disabled");
		$("#bidNoticeStartDate").attr("disabled", "disabled");
		$("#bidNoticeEndDate").attr("disabled", "disabled");
		$("#btn_submit").hide();		
	}
	
});

$("#btn_submit").click(function() {
	var isPublic = $("input[name='isPublic']:checked").val();
	var bidNoticeStartDate = $("#bidNoticeStartDate").val();
	var bidNoticeEndDate = $("#bidNoticeEndDate").val();

	if(!isPublic) {
		layer.alert("请选择公开范围");
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
		packageId: SaleNotice.packageId,
		isOpen: isPublic,
		openStartDate: bidNoticeStartDate,
		opetEndDate: bidNoticeEndDate,
		noticeContent:ue.getContent(),
		tenderType:2
	}

	if(isWorkflow) {
		para.checkerId = $("#employeeId").val();
	} else {
		para.checkerId = 0;
	}

	if(type == "update"){
		para.id = SaleNotice.id;
	}

	//提交
	if(isCheck) {
		top.layer.confirm('温馨提示：该流程未设置审批节点，您是否继续提交？', function() {
			$.ajax({
				url: top.config.AuctionHost + "/BidNoticeController/saveBidNotice.do",
				data: para,
				success: function(data) {
					if(data.success) {
						parent.$('#SaleNoticeList').bootstrapTable('refresh');
						top.layer.closeAll();
						top.layer.alert("发布成功");
					} else {
						layer.alert(data.message);
					}
				}
			});
		})
	} else {
		$.ajax({
			url: top.config.AuctionHost + "/BidNoticeController/saveBidNotice.do",
			data: para,
			success: function(data) {
				if(data.success) {
					parent.$('#SaleNoticeList').bootstrapTable('refresh');
					top.layer.closeAll();
					top.layer.alert("发布成功");
				} else {
					layer.alert(data.message);
				}
			}
		});
	}

});

//公示开始时间
var nowDate=top.$("#systemTime").html()+" "+top.$("#sysTime").html();
$('#bidNoticeStartDate').datetimepicker({
	step:5,
	lang:'ch',
	format: 'Y-m-d H:i:s',
	minDate:new Date(nowDate),
	onSelectTime:function(b) {
		var b3=new Date(new Date(b).getTime()+24*60*60*1000*3-6000)
		$('#bidNoticeEndDate').datetimepicker({
			step:5,
			lang:'ch',
			format: 'Y-m-d H:i:s',	
			value:GMTToStr(b3),
			minDate:b
		});
		
	}
});	
//公示截止时间
$('#bidNoticeEndDate').datetimepicker({
	step:5,
	lang:'ch',
	format: 'Y-m-d H:i:s',
	minDate:new Date(nowDate),
});
function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象  
	var r = window.location.search.substr(1).match(reg); // 匹配目标参数  
	if(r != null) return unescape(r[2]);
	return null; // 返回参数值  
}

//关闭按钮
$("#btn_close").click(function() {
	var index = parent.layer.getFrameIndex(window.name);
	top.layer.close(index);
//	top.layer.close(top.layer.index);
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
				isCheck=true;
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
function wordHtml(){
	$.ajax({
		   	url:parent.config.AuctionHost + '/WordToHtmlController/wordToHtml.do',
		   	type:'post',
		   	dataType:'json',
		   	async:false,
		   	//contentType:'application/json;charset=UTF-8',
		   	data:{
		   		"packageId":SaleNotice.packageId,
		   		"projectId":projectId,
		   		'type':'jggs',
		   		'tenderType':2
		   	},
		   	success:function(result){	 
		   		if(result.success){	
		   			ue.ready(function() {
						//ue.setContent(result.data, true);		
						ue.execCommand('insertHtml', result.data);
					}); 	
		   			//editor.txt.html(result.data)
		   			
		   		}
		   	}  
		});
}