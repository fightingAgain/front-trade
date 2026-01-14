var findPurchaseURL = config.AuctionHost + '/ProjectReviewController/findAutionPurchaseInfo.do'; //获取项目信息的接口
var addurl= config.AuctionHost + '/AuctionWasteController/saveSaleWasteDate.do';
var projectId = $.getUrlParam("projectId");
var project;
var tabeldata;
var id=getUrlParam('id');
var packageId = $.getUrlParam("packageId");
var projectId=$.getUrlParam("projectId");
var fileData = [];
function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象  
	var r = window.location.search.substr(1).match(reg); // 匹配目标参数  
	if(r != null) return unescape(r[2]);
	return null; // 返回参数值  
}
$(function() {
	var rowData = JSON.parse(sessionStorage.getItem("AuctionWasteCheckDate"));
	getAuctionFileInfo(); //挂载审核文件
	$("#auctionStartDate").html(rowData.auctionStartDate);
	$("#auctionDateEnd").html(rowData.auctionDateEnd);

})
var nowDate=top.$("#systemTime").html()+" "+top.$("#sysTime").html();
$('#auctionStartDate').datetimepicker({
		step:5,
		lang:'ch',
		format: 'Y-m-d H:i',
		onShow:function(){			
			if($('#noticeEndDate').val()!=""){
				if(NewDate($('#noticeEndDate').val())>NewDate(nowDate)){	
					var auctionStartMin=$('#noticeEndDate').val()+':00'
				}else{
					var auctionStartMin=nowDate
				}				
			}else{
				var auctionStartMin=nowDate
			};
			$('#auctionStartDate').datetimepicker({						
					minDate:NewDateT(auctionStartMin)
			})
		},
	});
	$('#auctionDateEnd').datetimepicker({
		step:5,
		lang:'ch',
		format: 'Y-m-d H:i',
		onShow:function(){			
			if($('#auctionStartDate').val()!=""){
				if(NewDate($('#auctionStartDate').val())>NewDate(nowDate)){	
					var auctionEndMin=$('#auctionStartDate').val()+':00'
				}else{
					var auctionEndMin=nowDate
				}				
			}else{
				var auctionEndMin=nowDate
			};
			$('#auctionDateEnd').datetimepicker({						
					minDate:NewDateT(auctionEndMin)
			})
		},
	});
//挂载审核文件
function getAuctionFileInfo(data) {
	var dataParam = {
		"projectId": projectId
	}
	$.ajax({
		type: "get",
		url: findPurchaseURL,
		dataType: 'json',
		data: dataParam,
		async: true,
		success: function(result) {
			if(result.success) {
				fileData = result.data;
				project=fileData.project[0];
				packageId=fileData.autionProjectPackage[0].id;
                for(key in fileData.project[0]) {
					$('#' + key).html(fileData.project[0][key]);
				}
				$("#isPublicText").html(fileData.isPublicText);
				$("#dataTypeName").html(fileData.autionProjectPackage[0].dataTypeName);
			} else {
				parent.layer.msg(result.message);
			}
		}
	})
}
//获取项目的projectId
function getProjectId() {
	var projectData = JSON.parse(sessionStorage.getItem("AuctionFileCheckDate"));
	var obj = projectData.projectId;
	return obj;
}

$("#btn_bao").click(function(){
   viewbaobtn();
})

function viewbaobtn(){
	if($("#auctionStartDate").val()=="" || $("#auctionStartDate").val()==null){
		parent.layer.alert("温馨提示：请选择竞卖开始时间!");
		return false;
	}
	if($("#auctionDateEnd").val()=="" || $("#auctionDateEnd").val()==null){
		parent.layer.alert("温馨提示：请选择竞卖结束时间!");
		return false;
	}
	$.ajax({
		type: "POST",
		contentType: "application/x-www-form-urlencoded;charset=utf-8", //WebService 会返回Json类型
		url: addurl,
		data: {'id':id,'auctionStartDate':$("#auctionStartDate").val(),'auctionDateEnd':$("#auctionDateEnd").val(),'projectId':projectId,'packageId':packageId},
		dataType: 'json',
		error: function() {
			layer.alert("保存失败!", { icon: 2 });
		},
		success: function(response) {
			var data = response.data;
			if(response.success) {
				//$("#id").val(id); //回显处置id	
				parent.layer.alert("保存成功!");
				
				parent.$("#SaleTimeList").bootstrapTable('refresh');
				parent.layer.close(parent.layer.getFrameIndex(window.name));	

			} else {
				parent.layer.alert(response.message);
			}
		}
	})
}
//退出
$("#btn_close").click(function() {
	//	parent.layer.closeAll()
	var index = parent.layer.getFrameIndex(window.name);
	parent.layer.close(index);
})
function NewDate(str){  
	  if(!str){  
	    return 0;  
	  }  
	  arr=str.split(" ");  
	  d=arr[0].split("-");  
	  t=arr[1].split(":");
	  var date = new Date();   
	  date.setUTCFullYear(d[0], d[1] - 1, d[2]);   
	  date.setUTCHours(t[0]-8, t[1]);
	  return date.getTime();  
} 
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
