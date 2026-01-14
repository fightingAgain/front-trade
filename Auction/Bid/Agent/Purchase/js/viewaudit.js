var findPurchaseUrl=config.bidhost + '/ProjectReviewController/findProjectInfo.do'//根据项目ID获取所有项目信息内容
//该条数据的项目id
var projectDataID="";
var projectData=[];
var uid = $.query.get("key"); //主键id 项目id
var edittype = $.query.get("edittype"); //查看还是审核detailed查看  audit审核
var examType;
var projectId=getUrlParam('projectId');
var packageId=getUrlParam('packageId');
var isSignCheck=getUrlParam('isSignCheck');
var supplierId=getUrlParam('supplierId');
var thisFrame;
var dcmt;
/*var WeightsTotal=dcmt.WeightsTotal*/
var _index=getUrlParam("index");
/*var enterpriseName=getUrlParam('enterpriseName');*/
function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象  
	var r = window.location.search.substr(1).match(reg); // 匹配目标参数  
	if(r != null) return unescape(r[2]);
	return null; // 返回参数值  
}
var source; //1是审核    2是查看
$(function(){
	source = getUrlParam("source");
	if(source == 1){
		$("#tableWorkflow").show();
		$("#btn_submit").show();
//		thisFrame = parent.window.document.getElementById("enrollList").getElementsByTagName("iframe")[0].id;
//		dcmt = parent.$('#'+thisFrame)[0].contentWindow;
	} else {
		$("#tableWorkflow").hide();
		$("#btn_submit").hide();
	}
	viewlook();
    $.ajax({
				type: "post",
				url: config.bidhost+'/PurchaseController/findSupplierSignList.do',
				dataType: 'json',
				data: {
					'packageId':packageId,
					'supplierId':supplierId,
				},
				async: false,
				success: function(result) {
					if(result.success) {
						var data=result.data;
						if(data.length == 0){
							return;
						}
						$("#enterpriseName").html(data[0].enterpriseName);
						$("#subDate").html(data[0].subDate);
						$("#linkMen").html(data[0].linkMen);
						$("#linkTel").html(data[0].linkTel);
					} 
				}
	})
    $("#btn_submit").click(function(){
    	viewauditdata();
    })
});
function passMessage(callback) {
	preCallback = callback;
}
var lookdata;
function viewlook(){
	$.ajax({
				type: "post",
				url: config.bidhost+'/PurchaseController/findCheckSupplierSign.do',
				dataType: 'json',
				data: {
					'packageId':packageId,
					'supplierId':supplierId,
				},
				async: false,
				success: function(result) {
					if(result.success) {
						lookdata=result.data
						viewlookdata(lookdata);
					} 
				}
	})
}
function viewlookdata(data) {
	$('#workflowListDetail').bootstrapTable({
		columns: [{
				field: "userName",
				title: "姓名",
				align: "left",
				halign: "left",
			},
			{
				field: "checkStatus",
				title: "审核状态",
				align: "left",
				halign: "left",
				width: '120px',
				formatter: function(value, row, index) {
					if(row.checkStatus==0){
					  return '<span class="text-danger" style="color:red">待审核</span>';
				    }else if(row.checkStatus==1){
					  return '<span class="text-danger" style="color:green">通过</span>';
				    }else if(row.checkStatus==2){
					  return '<span class="text-danger" style="color:red">不通过</span>';
				    }else{
					   return;
				    }
				}

			},
			{
				field: "reason",
				title: "审核说明",
				align: "left",
				halign: "left"

			},
			{
				field: "subDate",
				title: "时间",
				align: "left",
				halign: "left"

			}
		]
	});
	$('#workflowListDetail').bootstrapTable("load",data); //重载数据
}


//关闭按钮
$("#btn_close").click(function() {
	parent.layer.close(parent.layer.getFrameIndex(window.name));
});
//btn_submit
function viewauditdata(){
	if(($("#reason").val()=="" || $("#reason").val()==undefined)&& $("input[name='checkState']:checked").val()==2){
		parent.layer.alert('请填写审核说明！');
		return false;
	}
	
	if($("input[name='checkState']:checked").val() == undefined || $("input[name='checkState']:checked").val() == "") {
		parent.layer.alert('请选择审核状态！', {
			icon: 7,
			title: '提示'
		});
	} else {
	$.ajax({
				type: "post",
				url: config.bidhost+'/PurchaseController/checkSupplierSign.do',
				dataType: 'json',
				data: {
					'packageId':packageId,
					'supplierSignId':lookdata[0].supplierSignId,
					'id':lookdata[0].id,
					'reason':$("#reason").val(),
				    'checkState':$("input[name='checkState']:checked").val()
				},
				async: false,
				success: function(result) {
					if(result.success) {
						//var data=result.data;
//						dcmt.du();
						preCallback();
						var index=top.parent.layer.getFrameIndex(window.name);
					    top.parent.layer.close(index);
						//parent.layui.table.reload('enrollList');
					} else{
						parent.layer.alert(result.message);
					}
				}
	})
	 
	  }
}
