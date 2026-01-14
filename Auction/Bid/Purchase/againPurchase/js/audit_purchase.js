function getQueryString(name) {
    var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
    var r = window.location.search.substr(1).match(reg);
    if (r != null) {
        return unescape(r[2]);
 }
}
var str =getQueryString("key");
var purchaseaddata="";
var pojectid="";
var Package_data="";
//初始化
$(function(){
   Purchase();
})
var Is_Public_data=[];
var findProjectSupplierList=config.bidhost+'/PurchaseController/findProjectSupplierList.do';//邀请供应商接口
var searchUrlPackage=config.bidhost+'/PurchaseController/findProjectPackage.do';
var searchUrlPackageDetail = config.bidhost+'/PurchaseController/findPackageDetailed.do';
var searchUrlPackageCheckList=config.bidhost+'/PurchaseController/findPackageCheckList.do';
var searchUrlFile=config.bidhost+'/PurFileController/page.do';
var searchUrlCheckListItem=config.bidhost+'/PurchaseController/findPackageCheckItem.do';
var dowoloadFileUrl=config.bidhost+'/FileController/download.do';
function Purchase(){
   purchaseaddata=JSON.parse(sessionStorage.getItem('purchaseaddata'));
   pojectid=purchaseaddata.projectId
   $('div[id]').each(function(){
		$(this).html(purchaseaddata[this.id]);
	});
	$('div[id]').each(function(){
		$(this).html(purchaseaddata.project[this.id]);
	});
	
	$('input[name="projectState"]').eq(purchaseaddata.project.projectState).attr("checked",true)
	$('input[name="isPublic"]').eq(purchaseaddata.isPublic).attr("checked",true)
	$('input[name="isFile"]').eq(purchaseaddata.isFile).attr("checked",true)
	$('input[name="project.tenderType"]').eq(purchaseaddata.project.tenderType).attr("checked",true)
	if(purchaseaddata.isPublic>1){
		Public(pojectid)
	}
	getPackageInfo(pojectid)
	
}
function Public(uid){
	table_data="";
	$.ajax({
   	url:findProjectSupplierList,
   	type:'get',
   	dataType:'json', 	
   	data:{
   		"projectId":uid
   	},
   	success:function(data){    		
   		Is_Public_data=data.data;
   		var Publicid=[]
   		if(data.data.length>0){
   			table_data='<tr>'
	 		          +'<td style="width:20%">企业名称</td>'
	 		          +'<td style="width:100px">联系人</td>'
	 		          +'<td style="width:20%">联系电话</td>'
	 		          +'<td style="width:20%">认证状态</td>'
	 		          +'<td style="width:20%">通知时间</td>'	 		          	 		        
	 		          +'</tr>'	
             for(var i=0;i<Is_Public_data.length;i++){
                  if(Is_Public_data[i].enterprise.enterpriseLevel==0){					
				        var	enterpriseLevel= "未认证"
					};
					if(Is_Public_data[i].enterprise.enterpriseLevel==1){					
						var	enterpriseLevel=  "提交认证"
					};
					if(Is_Public_data[i].enterprise.enterpriseLevel==2){					
						var	enterpriseLevel=  "受理认证"
					};
					if(Is_Public_data[i].enterprise.enterpriseLevel==3){
						var	enterpriseLevel=  "已认证"
					};
					if(Is_Public_data[i].enterprise.enterpriseLevel==4){
						var	enterpriseLevel=  "认证2"
					};
             	  table_data+='<tr>'
   		          +'<td style="width:20%">'+Is_Public_data[i].enterprise.enterpriseName+'</td>'
   		          +'<td style="width:100px">'+Is_Public_data[i].enterprise.agent+'</td>'
   		          +'<td style="width:20%">'+Is_Public_data[i].enterprise.agentTel+'</td>'
   		          +'<td style="width:20%">'+enterpriseLevel+'</td>'
   		          +'<td style="width:20%">'+Is_Public_data[i].enterprise.subDate+'</td>'  		         
   		          +'</tr>'   		            		       
   		        }
             $("#tableList").html(table_data)
   		     }
             
   	    }	
   });
	
};
//查询包件信息
function getPackageInfo(projectId){
	$.ajax({
		type:"post",
		url:searchUrlPackage,
		async:true,
		dataType:'json',
		data:{
   		"projectId":projectId
   	},
   		success:function(data){
   			packageInfo = data.rows;   			   			
   			var strHtml = "";
   			for (i = 0; i < data.rows.length; i++) {
   				strHtml += "<button class='btn btn-default' onclick=setPackageInfo('" + i + "')>包件" + (i+1) + "</button>";
   				if(i < data.rows.length - 1){
   					strHtml += "&nbsp;&nbsp;&nbsp;&nbsp;";
   				}
   			}
   			$("#projectPackage").html(strHtml);
   			
   			if(data.rows.length > 0){
   				setPackageInfo(0);
   			}
   		}
   	
	});
}
function setPackageInfo(obj){
	var data = packageInfo[obj];
	$("#packageName").html(data.packageName);
	$("#packageNum").html(data.packageNum);
	if(data.checkPlan == 0){
		$("#checkPlan").html("综合评分法");
	}else if(data.checkPlan == 1){
		$("#checkPlan").html("最低价法");
	}else{
		$("#checkPlan").html("经评审的最低价法(价格评分)");
	}
	if(data.serviceChargePay == 0){
		$("#serviceCharge").html(data.serviceCharge);
	}
	else{
		$("#serviceCharge").html("<span style='color:red'>由成交供应商缴纳，详情见采购文件</span>");
	}
	
	$("#checkDetail").html(data.checkDetail);
	
	getPackageDetail(data.id);
	getPackageCheckList(data.id);
// 	getFile(data.id);
	
}
//查询明细信息
function getPackageDetail(packageId){
	$.ajax({
		type:"post",
		url:searchUrlPackageDetail,
		async:true,
		dataType:'json',
		data:{"packageId":packageId},
   		success:function(data){
   			packageDetailInfo = data.rows;
   			$("#packageDetail").html("");
   			for (i = 0; i < packageDetailInfo.length; i++) {
   				var strHtml = "<tr><td>" + (i+1) + "</td>";
   				strHtml += "<td>" + packageDetailInfo[i].detailedName + "</td>";
   				strHtml += "<td>" + packageDetailInfo[i].detailedVersion + "</td>";
   				strHtml += "<td class='text-center'>" + packageDetailInfo[i].detailedCount + "</td>";
   				strHtml += "<td class='text-center'>" + packageDetailInfo[i].detailedUnit + "</td>";
   				strHtml += "<td>" + packageDetailInfo[i].detailedContent + "</td>";
   				strHtml += "<td class='text-center'><a href='javascript:void(0)' onclick=findPackageDetailItem(" + i + ")>分项信息</a></td></tr>";
   				$("#packageDetail").append(strHtml);
   			}
   		}
	});
}
//查询评审内容
function getPackageCheckList(packageId){
	$.ajax({
		type:"post",
		url:searchUrlPackageCheckList,
		async:true,
		dataType:'json',
		data:{
   		"packageId":packageId
   		},
   		success:function(data){
   			packageCheckListInfo = data.rows;
   			$("#checkList").html("");
   			for (i = 0; i < packageCheckListInfo.length; i++) {
   				var strHtml = '<li role="presentation" ';
   				if(i == 0){
   					strHtml += ' class="active" ';
   				}
				strHtml += ' onclick=setpackageCheckListInfo(' + i + ')><a href="#tab' + i + '" role="tab" data-toggle="tab" >' + packageCheckListInfo[i].checkName + '</a></li>';
   				$("#checkList").append(strHtml);
   			}
   			setpackageCheckListInfo(0);
   		}
  });
};

//查看评审内容详细信息
function setpackageCheckListInfo(obj){
	if(packageCheckListInfo[obj].checkType==0){
		$("#checkType").html('合格制');
	}
	else if(packageCheckListInfo[obj].checkType==1){
		$("#checkType").html('评分制');
	}
	else if(packageCheckListInfo[obj].checkType==2){
		$("#checkType").html('偏离制');
	}
   				
	$.ajax({
		type:"post",
		url:searchUrlCheckListItem,
		async:true,
		dataType:'json',
		data:{
   			packageCheckListId:packageCheckListInfo[obj].id
   		},
   		success:function(data){
   		var CheckListItemInfo = data.rows;   	  		 
   			$("#packageCheckList").html("");
   			for (i = 0; i < CheckListItemInfo.length; i++) {
   				var str="";
   				if(CheckListItemInfo[i].isKey == 0 ){
   					str='<input type="checkbox" value="是" disabled="disabled" />';
   				}else if(CheckListItemInfo[i].isKey == 1){
   					str='<input type="checkbox" value="否" disabled="disabled" checked/>';
   				}
   					
   				var strHtml = "<tr><td>" + (i+1) + "</td>";
   				strHtml += "<td>" + CheckListItemInfo[i].checkTitle + "</td>";
   				strHtml += "<td>" + CheckListItemInfo[i].checkStandard + "</td>";
   				strHtml += "<td class='text-center'>" + str + "</td>";
   				strHtml += "<td class='text-center'>" + CheckListItemInfo[i].remark + "</td></tr>";
   				$("#packageCheckList").append(strHtml);
   			}	
   			
   		}
	});
}
