var AuctionNotice = JSON.parse(sessionStorage.getItem("AuctionNotice")); //操作数据行
var projectId;
var type = getUrlParam("type"); //update发布公示  view查看详情
var tType = getUrlParam("tType"); //看是采购人还是供应商
var bidNoticetable = new Array(); //供应商分项表格
var bidNoticetableTitle = new Array(); //动态表格头

var WorkflowTypeUrl = top.config.AuctionHost + "/WorkflowController/findWorkflowCheckerByType.do" //项目审核人列表数据接口

var isWorkflow = ""; //是否有审核人  0 没有 1为有
var isCheck = false; //是否设置流程
var WORKFLOWTYPE = "jggs";
$(function() {
	var url = "";
	var para;

	$("input[name='isPublic'][value='0']").attr("checked", true); //默认公开
	$(".NewsContent").hide();
	$('.shenhe').hide();
	url = top.config.AuctionHost + "/BidNoticeController/findBidNoticeInfo.do";
	para = {
		id: AuctionNotice.id,
		packageId: AuctionNotice.packageId,
		tenderType: 1 //0为询价采购，1为竞价采购，2为竞卖
	}
	if(typeof(AuctionNotice) != 'undefined') {
		$.ajax({
			url: url,
			data: para,
			async: true,
			success: function(data) {
				if(data.success) {
					data = data.data;					                 
					$("#projectName").html(data.projectName);
					if (data.projectSource > 0) {
						$("#projectName").html(data.projectName + '<span class="red">(重新竞卖)</span>');
					}
					$("#projectCode").html(data.projectCode);
					$("#isPublic").html(data.isOpen==0?'公开':'不公开');					
					$("#purchaserName").html(data.purchaserName);
					$("#purchaserAddress").html(data.purchaserAddress);
					$("#purchaserLinkmen").html(data.purchaserLinkmen);
					$("#purchaserTel").html(data.purchaserTel);
					$("#bidNoticeStartDate").html(data.openStartDate);
					$("#bidNoticeEndDate").html(data.opetEndDate);
					$("#packageName").html(data.packageName);
					$("#packageNum").html(data.packageNum);
					$("#NewsContent").html(data.noticeContent);   
				}
				
			}
		});
	}
});

function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象  
	var r = window.location.search.substr(1).match(reg); // 匹配目标参数  
	if(r != null) return unescape(r[2]);
	return null; // 返回参数值  
}

//关闭按钮
$("#btn_close").click(function() {
	top.layer.closeAll();
});