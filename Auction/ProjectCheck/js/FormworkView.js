
var examType = getUrlParam('purExamType');//预审采购文件还是询比采购文件
var id = getUrlParam('id');//预审采购文件还是询比采购文件
var edittype =getUrlParam("edittype"); //查看还是审核detailed查看  audit审核
var projectKind =getUrlParam("projectKind"); 

var WORKFLOWTYPE='mbgg';
$(function(){
	if(edittype == "detailed") {
		$("#btn_submit").hide(); //提交按钮隐藏
		$("#tableWorkflow").hide(); //审核内容
	}
 	//获取连接传递的参数
	 getDetail();
	 findWorkflowCheckerAndAccp(id);
});


//信息反选
function getDetail() {	
    $.ajax({
    	url: top.config.Syshost + '/TempBidWebController/findTempBidWeb.do',
        type: "get",
        data: {"id":id},
        success: function (data) {
         	if(data.success){
        		var arr = data.data;
				//信息反选
         		for(var key in arr){
         			if(key == "projectType"){
         				switch(arr[key]) {
				            case "A":
				                $("#"+key+"").html("工程");
				                break;
				            case "B":
								if(projectKind==4){
									$("#"+key+"").html("货物");
								}else{
									$("#"+key+"").html("设备");
								} 
				                break;
				            case "C":
				                $("#"+key+"").html("服务");
				                break;
			                case "C50":
				                $("#"+key+"").html("广宣");
								break;
							case "0":
				                $("#"+key+"").html("不限");
				                break;
				        }
         			}else if(key == "bidType"){
         				switch(arr[key]) {
				            case 0:
				                $("#"+key+"").html("不限");
				                break;
				            case 1:
				                $("#"+key+"").html("公开");
				                break;
				            case 2:
				                $("#"+key+"").html("邀请");
				                break;
				        }
         			}else if(key == "examinationType"){
         				switch(arr[key]) {
				            case 0:
				                $("#"+key+"").html("不限");
				                break;
				            case 1:
				                $("#"+key+"").html("资格预审");
				                break;
				            case 2:
				                $("#"+key+"").html("资格后审");
				                break;
				        }
         			}else if(key == "isLegal"){
         				switch(arr[key]) {
				            case 0:
				                $("#"+key+"").html("不限");
				                break;
				            case 1:
				                $("#"+key+"").html("是");
				                break;
				            case 2:
				                $("#"+key+"").html("否");
				                break;
				        }
         			}else if(key == "isNet"){
         				switch(arr[key]) {
				            case 0:
				                $("#"+key+"").html("不限");
				                break;
				            case 1:
				                $("#"+key+"").html("全线上");
				                break;
				            case 2:
				                $("#"+key+"").html("线上线下结合");
				                break;
				            case 3:
				                $("#"+key+"").html("全线下");
				                break;
				        }
         			}else if(key == "tempContent"){
         				$("#container").html(arr[key]);
         			}else if(key == "tempState"){
         				switch(arr[key]) {
				            case 1:
				                $("#auditingState").html("审核中");
				                break;
				            case 2:
				                $("#auditingState").html("审核通过");
				                break;
				            case 3:
				                $("#auditingState").html("审核不通过");
				                break;
				            default:
				            	$("#auditingState").html("审核通过");
				        }
         			}else if(key == "isWin"){
         				switch(arr[key]) {
				            case 0:
				                $("#isWin").html("未中选");
				                break;
				            case 1:
				                $("#isWin").html("中选");
				                break;
				        }
         			}else if(key == "projectKind"){
         				//0询比采购1竞价采购 2拍卖 3询价报价 4招标采购 5谈判采购 6单一来源采购 7框架协议采购 8战略协议采购
         				switch(arr[key]) {
				            case 0:
				                $("#projectKind").html("询比采购");
				                break;
				            case 1:
				                $("#projectKind").html("竞价采购");
				                break;
			                case 2:
				                $("#projectKind").html("拍卖");
				                break;
			                case 3:
				                $("#projectKind").html("询价报价");
				                break;
			                case 4:
				                $("#projectKind").html("招标采购");
				                break;
			                case 5:
				                $("#projectKind").html("谈判采购");
				                break;
			                case 6:
				                $("#projectKind").html("单一来源采购");
				                break;
			                case 7:
				                $("#projectKind").html("框架协议采购");
				                break;
			                case 8:
				                $("#projectKind").html("战略协议采购");
				                break;
				        }
         			}else if(key!='employeeId'){
         				$("#"+key+"").html(arr[key]);
         			}
         			
         		}
         		changeContent(arr.projectKind);
     			if(arr.isWin || arr.isWin == 0 || arr.isWin == 1){
     				getNotice('1')
     			}else{
     				getNotice('0')
     			}
        	}else{
     			parent.layer.alert(data.message);
        	}
         },
         error: function (data) {
             parent.layer.alert("加载失败");
         }
     });
 };
 /***********************     根据采购类型变化      ************************/
//0询比采购(.type_0) 1竞价采购 (.type_1)2拍卖(.type_2) 3询价报价 4招标采购(.type_4) 5谈判采购 6单一来源采购(.type_6) 7框架协议采购 8战略协议采购
function changeContent(val,type){
	//先隐藏所有会变化的字段，再显示对应的字段
	$('.type_change td').css('display','none');
	$('.type_'+val).css('display','table-cell');
}
//判断模板类型为通知书时显示通知书类型
function getNotice(val){
	if(val == 1){
		$('.isNotice').css('display','table-row');
	}else{
		$('.isNotice').css('display','none');
	}
}
