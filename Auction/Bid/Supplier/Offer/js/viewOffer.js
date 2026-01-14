var projectID = $.query.get("key");
var packageID = $.query.get("kid");
var findProjectList=top.config.bidhost +'/OfferController/findProjectList.do'
var findProjectPackageInfoUrl=config.bidhost+'/PurchaseController/findProjectPackageInfo.do'//获取项目信息
var searchUrlFile = config.bidhost + '/PurFileController/findOfferFileList.do'; //采购文件分页
var downloadFileUrl = config.bidhost + '/FileController/download.do'; //下载文件接口
var resetFlieUrl = config.bidhost + "/PurFileController/updateOfferFile.do";//文件撤回

var priceTotal ="";//总价
var detailLists=[];//报价信息
var detailListsId=""//明细表的ID
var flieDate=""//上传时间
var downloadData=""//附件数组
var packageCheckLists=[];//评审数据
var enterpriseNames=sessionStorage.getItem('enterpriseNames');//当前供应商的名称
var purchaseaData=JSON.parse(sessionStorage.getItem('purchaseaData'))
var auditTimeout=JSON.parse(sessionStorage.getItem('auditTimeoutData'))
$(function(){
	if(auditTimeout == 0){
		$("#btn_submit").hide();
		$("#btn_bao").hide();
	}else if(auditTimeout == 1){
		$("#btn_submit").hide();
		$("#btn_bao").hide();
		$("#reset").hide();
	}
	offer();
	getEnterpriseName('enterpriseName', packageID);//供应商名称反显，公共js public.js
	// $("#enterpriseName").html(enterpriseNames)//当前供应商的名称
})
function offer(){
	$.ajax({
	   	url:findProjectList,
	   	type:'get',
	   	dataType:'json',
	   	async: false,
	   	//contentType:'application/json;charset=UTF-8',
	   	data:{
	   		'projectId':projectID,//项目ID
	   		'packageId':packageID,//包件ID
	   		'enterpriseType':'06',//识别供应商
	   	},
	    success:function(data){
	    	if(data.data.length>0){
	    		detailLists=data.data[0].detailList;
		    	$("#legalPerson").html(data.data[0].legalPerson);		    	
		    	$("#enterpriseNames").html(data.data[0].enterpriseName)
		    	$("#linkTel").html(data.data[0].linkTel);
		    	flieDate=data.data[0].subDate
		    	priceTotal=data.data[0].priceTotal;
		    	detailListsId=data.data[0].detailList[0].id
	    	}
	    	
	    }
	});
	$.ajax({
	   	url:config.bidhost+'/PurchaseController/findProjectPackageListAim.do',
	   	type:'get',
	   	dataType:'json',
	   	async: false,
	   	//contentType:'application/json;charset=UTF-8',
	   	data:{
	   		'packageId':packageID,	   	
	   	},
	   	success:function(data){
	   		if(!data.success){
				return
			}
	   		$('div[id]').each(function(){
				$(this).html(data.data[this.id]);
			});				
			$("#projectId").val(data.data.projectId)//项目ID				
			var packageDetaileds=data.data.packageDetaileds;
			if(data.data.packageDetaileds.length>0){
				for(var i=0;i<data.data.packageCheckLists.length;i++){
					if(data.data.packageCheckLists[i].examType==1){
						packageCheckLists.push(data.data.packageCheckLists[i])
					}
				}	
			};	
			if(purchaseaData.offerAttention){
				$(".isOfferAttention").show()
				$("#offerAttention").html(purchaseaData.offerAttention)
			}				
			$("#packageId").val(packageDetaileds[0].packageId)//包件ID
			var rowData=""
				rowData='<tr>'
			     		 +'<td style="width:50px;">序号</td>'
			     		+'<td style="text-align:left">名称</td>'
			     		+'<td style="width:150px;text-align:left">型号规格</td>'
			     		+'<td style="width:70px;">数量</td>'
			     		+'<td style="width:50px;">单位</td>'			     					     		
						// if(purchaseaData.isTax==1){
						// 	rowData+='<td style="width:80px;">税率</td>'
						// 	rowData+='<td>含税最终报价('+ (top.prieUnit||'元') +')</td>'
						// }else{
							rowData+='<td>最终报价('+ (top.prieUnit||'元') +')</td>'
						// }			     					     					     		
			     	+'</tr>'
			//}
			for(var i=0;i<packageDetaileds.length;i++){
				tableRow=i
				if(packageDetaileds[i].detailedContent!=""&&packageDetaileds[i].detailedContent!=undefined){
					var detailedContent=packageDetaileds[i].detailedContent;
				}else{
					var detailedContent="";
				};					
				    rowData+='<tr>'
				     		+'<td >'+(i+1)+'</td>'
				     		+'<td style="text-align:left;">'+packageDetaileds[i].detailedName+'<input type="hidden" name="detailList['+ i +'].packageDetailedId" value="'+ packageDetaileds[i].id +'"/></td>'
				     		+'<td style="text-align:left;width:250px;">'+(packageDetaileds[i].detailedVersion==undefined?'暂无型号':packageDetaileds[i].detailedVersion)+'</td>'
				     		+'<td style="width:70px;">'+packageDetaileds[i].detailedCount+'</td>'
				     		+'<td style="width:70px;">'+packageDetaileds[i].detailedUnit+'</td>'				     		
							// if(purchaseaData.isTax==1){
							// 	rowData+='<td style="width:80px;">'
							// 	rowData+=purchaseaData.tax	
							// 	rowData+='</td>'
							// }				     		     		
										     					   		
							rowData+='<td style="width:250px;">最终报价：'+(detailLists.length>0?(detailLists[i].saleTaxTotal||""):"无报价")  +'</td></tr>'		
				     		+'</tr>'
     		}
			rowData+='<tr><td colspan="2" style="text-align:right">总报价('+ top.prieUnit +')：</td><td colspan="11" style="text-align: left;"><div id="priceTotal">'+(priceTotal||"")+'</div></td></tr>'
			$("#tabletr").html(rowData);
			if(packageCheckLists.length>0){
				var tr=""
				for(var i=0;i<packageCheckLists.length;i++){			
		   			tr+='<tr><td style="width:50px">'+ (i+1) +'</td>'
			     		+'<td style="text-align:left">'+packageCheckLists[i].checkName +(packageCheckLists[i].envelopeLevel?(packageCheckLists[i].envelopeLevel==1?'（第一封）':'（第二封）'):"")+'</td>'
			     		+'<td style="text-align:left">'		     						
						+'<span  style="vertical-align: middle;" id="fileName'+i+'"></span>'
			     		+'</td>'
		                +'<td style="text-align:left"><span id="fileSize'+i+'"></span></td>'
			     		+'<td><span class="subDate'+i+'">'+ flieDate +'</span></td>'
			     		tr += '</tr>';   	
			   	}
				if(data.data.isOfferDetailedItem==0){
				tr+='<tr><td style="width:50px">'+ (packageCheckLists.length+1) +'</td>'
			     		+'<td style="text-align:left">分项报价表</td>'
			     		+'<td style="text-align:left">'		     						
						+'<span  style="vertical-align: middle;" id="fileName'+packageCheckLists.length+'"></span>'
			     		+'</td>'
		                +'<td style="text-align:left"><span id="fileSize'+packageCheckLists.length+'"></span></td>'
			     		+'<td><span class="subDate'+packageCheckLists.length+'">'+ flieDate +'</span></td>'
			     		tr += '</tr>';
			   }
	   			$("#tablede").html(tr);
	   			fileDataBtn()
			}

		}	
	});
};

function reset($index){
	var para;
	if(downloadData.length>0){
		for(var i=0;i<downloadData.length;i++){
			for(var x=0;x<packageCheckLists.length;x++){
				if(downloadData[i].packageCheckListId==packageCheckLists[x].id){
			 	    para = {
			 	    	examType:downloadData[$index].examType,
	   					packageCheckListId:downloadData[$index].packageCheckListId,
	   					id:downloadData[$index].id
			 	    }
				}
			}
		}
	}	
	$.ajax({
	   	url:resetFlieUrl,
	   	type:'post',
	   	async:false,			   
	   	data:para
	   	/*{
	   		examType:downloadData[$index].examType,
	   		packageCheckListId:downloadData[$index].packageCheckListId
	   	}*/,
	   	success:function(data){	   	
	   		if(data.success){
	   			//parent.layer.closeAll();
	   			parent.layer.alert("撤回成功");
	   		}else{
	   			//parent.layer.closeAll();
	   			parent.layer.alert("撤回失败");	
	   		}
	   	}
	});
}


function fileDataBtn(){
    $.ajax({
	   	url:searchUrlFile,
	   	type:'get',
	   	async:false,			   
	   	data:{	
	   		'projectId':projectID,
	   		'packageId':packageID,	
	   		'examType':1,
	   		'enterpriseType':'06',
	   		'isView':0
	   	},
	   	success:function(data){
	   		
	   		if(data.success){
	   			if(data.data.length>0){
	   				downloadData=data.data;
		   			for(var i=0;i<data.data.length;i++){
		   				for(var x=0;x<packageCheckLists.length;x++){
			   				if(data.data[i].packageCheckListId==packageCheckLists[x].id){
		   				 	    $("#fileName"+x).html(data.data[i].fileName);
		   				 	    $("#fileSize"+x).html(data.data[i].fileSize);		   				 	    
			 					$("#subDate"+x).html(data.data[i].subDate);
			   				}
		   				}
		   				if(data.data[i].packageCheckListId==0){
		   					$("#fileName"+packageCheckLists.length).html(data.data[i].fileName);
		   					$("#fileSize"+packageCheckLists.length).html(data.data[i].fileSize);
		   					$("#subDate"+packageCheckLists.length).html(data.data[i].subDate);
			 				
		   					
		   				}
		   				
		   				if(data.data[i].fileName == ""){
		   					$("#btnFiles").hide();
		   				}
		   			}
		   		}
	   		}		   		
	   	}
	});		
};
function fileDownload($index){
	if($('#fileName'+$index).html()==""){
		parent.layer.alert("无附件无法下载")
		return
	}
	parent.layer.confirm('是否确定下载', function() {
		var newUrl = downloadFileUrl + "?ftpPath=" + downloadData[$index].filePath + "&fname=" + downloadData[$index].fileName;
    	window.location.href = $.parserUrlForToken(newUrl); 
	});
  	
	
}
//关闭按钮
$("#btn_close").on("click", function() {
	parent.layer.close(parent.layer.getFrameIndex(window.name));
})
