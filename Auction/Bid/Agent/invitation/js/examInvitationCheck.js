var flieListUrl=config.bidhost+'/PurFileController/list.do';//查看附件接口
var searchUrlFile = config.bidhost + '/PurFileController/list.do'; //采购文件分页
var Detailedlist=config.bidhost +'/PackageDetailedController/list.do'//明细查看
var urlfindProjectSupplementInfo = top.config.bidhost + '/ProjectSupplementController/findProjectSupplementInfo.do';//补遗接口
var addsupplier='Auction/common/Agent/invitation/model/add_supplier.html';//邀请供应商的弹出框路径
var viewSupplierUrl="Auction/common/Agent/Purchase/model/viewSupplier.html"
var examTypeShow=0;
var examType=1//资格审查的缓存
var yaoqing="1"
var tenderTypeCode='0'//资格审查的缓存
var packageInfo=""//包件信息
var supplierData=""
var packageDetailInfo=[]//明细信息
var businessPriceSetData=""//自定义信息
var publicData=[];//邀请供应商数据列表
var projectSupplementList=[];
var packagePrice=[];
var supplier=[];
var appointmentData;//预约信息
//打开弹出框时加载的数据和内容。
var projectId=getUrlParam('projectId');
var packageId=getUrlParam('packageId');
var examType=getUrlParam('examType');
var isAgent=getUrlParam('isAgent');
var createType=getUrlParam('createType');
// var fileUp; //报价
$(function(){
	du(packageId);
	supplimentInt(examType);
	package();
	mediaEditor.setValue(projectSupplementList.length==0?packageInfo:projectSupplementList[0])
	 //start 招标代理服务费
	if(packageInfo.projectServiceFee){
		for(var key in packageInfo.projectServiceFee){
			if(key == "collectType"){
				$("#collectType").html(packageInfo.projectServiceFee[key]==1?"标准累进制":(packageInfo.projectServiceFee[key]==2?"其他":"固定金额"));
			} else {
				$("#" + key).html(packageInfo.projectServiceFee[key]);
			}
		}
	}
	//end 招标代理服务费
	
	//关闭按钮
	$("#btn_close").click(function() {
		parent.layer.close(parent.layer.getFrameIndex(window.name));
	});
})
function du(uid){	
	$.ajax({
	   	url:config.bidhost+'/ProjectReviewController/findProjectPackageInfo.do',
	   	type:'post',
	   	//dataType:'json',
	   	async:false,
	   	//contentType:'application/json;charset=UTF-8',
	   	data:{
	   		"packageId":uid
	   	},
	   	success:function(data){
	   	  	if(data.success){
				packageInfo=data.data;
				businessPriceSetData=packageInfo.businessPriceSetList[0];
				packagePrice=packageInfo.projectPrices
				publicData=packageInfo.projectSupplierList;
				for(var i=0;i<packageInfo.projectSupplement.length;i++){
	   	  			if(packageInfo.projectSupplement[i].examType==1){
	   	  			//if(packageInfo.projectSupplement[i].checkState==2){
	   	  				projectSupplementList.push(packageInfo.projectSupplement[i])
	   	  			//}	   	  			
	   	  			}
				}
				for(var i=0;i<packageInfo.biddingRoomAppointment.length;i++){
					if(packageInfo.biddingRoomAppointment[i].examType==1){
						appointmentData=packageInfo.biddingRoomAppointment[i]
					}
				}
				if(packageInfo.offerAuditTimeout==1){
						$(".addSupplier").hide();
				}	 
	   	  	}
	   		   			   		   			   	
	   	},
	   	error:function(data){
	   		parent.layer.alert("修改失败")
	   	}
	});	
	
	callbackData(appointmentData);	
	 /*start报价*/
	/* offerFormData();
	fileList(); */
	/*end报价*/
};
var typeIdLists="";//媒体的ID
var typeNameLists="";//媒体名字
var typeCodeLists="";//媒体编号
var itemTypeNames=[]
var itemTypeIds=[]
var itemTypeCodes=[]
/*====ajax请求获取包件信息的数据获取====*/
function package(){
	examMontageHtml()
    $('div[id]').each(function(){
		$(this).html(packageInfo[this.id]);
	});
	new UEditorEdit({
		examType:examType,
		pageType:"view",
		contentKey: projectSupplementList.length==0?'examRemark':'oldExamRemark',
		// echoObj:echoObj,
	})
	hasData()
//  $("#isOfferDetailedItem").html(packageInfo.isOfferDetailedItem==0?'需要分项报价表':'不需要分项报价表');	
	$("#isSign").html(packageInfo.isSign==0?'不需要报名':'需要报名');	
	if(packageInfo.isSign==0){
		$('.isSignDateNone').hide()
	}else{
		$('.isSignDateNone').show()
	}
	if(packageInfo.checkPlan==0){
 		var checkPlans="综合评分法"; 		
 		$(".DeviateNum").hide();
 		$('.DeviateNumcol').attr('colspan','3')
 	}else if(packageInfo.checkPlan==1){
 		var checkPlans="最低评标价法";		
 		$(".DeviateNum").show()
 		$('.DeviateNumcol').attr('colspan','1')
 	}else if(packageInfo.checkPlan == 2){
 		var checkPlans="经评审的最低价法(价格评分)"; 		
 		$(".DeviateNum").hide();
 		$('.DeviateNumcol').attr('colspan','3')
 	}else if(packageInfo.checkPlan==3){
		var checkPlans="最低投标价法";		
		$(".DeviateNum").show()
		$('.DeviateNumcol').attr('colspan','1')
	}else if(packageInfo.checkPlan==5){
		var checkPlans="经评审的最低投标价法";		
		$(".DeviateNum").show()
		$('.DeviateNumcol').attr('colspan','1')
	}else if(packageInfo.checkPlan==4){
	   var checkPlans="经评审的最高投标价法";
	};
	// 当评审开始时间大于当前时间时，显示预约按钮
	// if(packageInfo.checkEndDate&&(NewDate(checkEndDate.examCheckEndDate)> NewDate(nowDate))){
	// 	$("#orderBtn").show()
	// };
 	$("#checkPlan").html(checkPlans)
	$("#noticeStartDate").val(packageInfo.noticeStartDate);
	$("#noticeEndDate").val(packageInfo.noticeEndDate);
	$("#submitExamFileEndDate").val(packageInfo.submitExamFileEndDate);
	$("#isSellPriceFile").html(packageInfo.isSellPriceFile==0?'发售文件':'不发售文件');
	suppliers(packageInfo.id);
   if(packageInfo.isPublic==0){
 		$("#isPublic").html("所有供应商")
 	}
 	if(packageInfo.isPublic==1){
 		$("#isPublic").html("所有本公司认证供应商")
 	}
 	if(packageInfo.isPublic==2){
 		$("#isPublic").html("仅限邀请供应商")
 	}
 	if(packageInfo.isPublic==2){
 		$("#isPublic").html("仅邀请本公司认证供应商")
 	}
	getProjectPrice(packagePrice);	
};
function suppliers(uid){
	$.ajax({
		url: config.bidhost+'/PurchaseController/findInvitationSupplierList.do', //查看 详细信息
		async: false,
		type: 'get',
		dataType: 'json',
		data: {
			'packageId':uid,
			
		},
		success: function(data) {
		 if(data.success){
		 	supplierData=data.data
		 	supplier=[]
		 	for(var i=0;i<supplierData.length;i++){
		 		supplier.push(supplierData[i].supplierId)
		 	}
		 	table(supplier)
		 }
																
		}
	});
	
}

function table(supplier){
	var PublicnowDate=top.$("#systemTime").html()+" "+top.$("#sysTime").html();	
	if(createType==0){
		if(NewDate(packageInfo.acceptEndDate) > NewDate(PublicnowDate)){    	
			$(".addSupplier").show();
			$(".sendMsg").show();
		};
	}
	var RenameData = getBidderRenameData(packageInfo.id);//投标人更名信息
	sessionStorage.setItem('keysjd', JSON.stringify(supplier));//邀请供应商的id缓存  
	sessionStorage.setItem('sadasd', JSON.stringify(supplierData));//邀请供应商的id缓存    
	$('#table').bootstrapTable({
		pagination: false,
		undefinedText: "",
		height:'304',	
		columns: [
		{
			field: 'xh',
			title: '序号',
			align: 'center',
			width: '50px',
			formatter:function(value, row, index){
				var pageSize=$('#table').bootstrapTable('getOptions').pageSize || 15;//通过表的#id 可以得到每页多少条  
                var pageNumber=$('#table').bootstrapTable('getOptions').pageNumber || 1;//通过表的#id 可以得到当前第几页  
                return pageSize * (pageNumber - 1) + index+1 ;//返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
			}
		},
		{
			field: "enterprise.enterpriseName",
			title: "企业名称",
			align: "left",
			halign: "left",
			width: "200px",
			formatter:function(value, row, index){					
				if(row.isAppend==1){
					var isAccept="<div>"+showBidderRenameList(row.supplierId, value, RenameData, 'body',1)+"<span class='text-danger'>(追加)</span></div>"
				}else{
					var isAccept="<div>"+showBidderRenameList(row.supplierId, value, RenameData, 'body')+"</div>"
				}				
				return isAccept
			}

		},
		{
			field: "enterprise.enterprisePerson",
			title: "联系人",
			halign: "center",				
			align: "center",
			width:'100px',
		}, {
			field: "enterprise.enterprisePersonTel",
			title: "联系电话",
			halign: "center",
			width:'100px',
			align: "center",								
		}, {
			field: "enterprise.enterpriseLevel",
			title: "认证状态",
			halign: "center",
			width:'100px',
			align: "center",
			formatter:function(value, row, index){					
				if(row.enterprise.enterpriseLevel==0){					
				   var	enterpriseLevel= "未认证"
				};
				if(row.enterprise.enterpriseLevel==1){					
					var	enterpriseLevel=  "提交认证"
				};
				if(row.enterprise.enterpriseLevel==2){					
					var	enterpriseLevel=  "受理认证"
				};
				if(row.enterprise.enterpriseLevel==3){
					var	enterpriseLevel=  "已认证"
				};
				if(row.enterprise.enterpriseLevel==4){
					var	enterpriseLevel=  "已认证"
				};	
	     		return enterpriseLevel
			}
		}, {
			field: "isAccept",
			title: "确认状态",
			halign: "center",
			width:'100px',
			align: "center",
			formatter:function(value, row, index){					
				if(value==0){
					var isAccept="<div class='text-success' style='font-weight:bold'>接受</div>"
				}else if(value==1){
					var isAccept="<div class='text-danger' style='font-weight:bold'>拒绝</div>"
				}else{
					var isAccept="未确认"
				}
	     		return isAccept
			}
		},{
			field: "cz",
			title: "操作",
			halign: "center",
			align: "center",
			width:'150px',
			formatter:function(value, row, index){					
				var Tdr='<div class="btn-group">'
					Tdr+='<a class="btn-sm btn-primary" href="javascript:void(0)" style="text-decoration:none;margin-right:10px" onclick="viewSupplier('+ index +')">查看</a>'
					if(row.isAccept!=0&&row.isAccept!=1){
						if(NewDate(packageInfo.acceptEndDate) > NewDate(PublicnowDate)){    	
							Tdr+='<a class="btn-sm btn-danger" href="javascript:void(0)" style="text-decoration:none" onclick=supplierDelet(\"'+ row.id+'\","'+ index +'")>删除</a>'
						};
					}					
					Tdr+='</div>'
		     		return Tdr
			}
		}
		],
	});
	$('#table').bootstrapTable("load", supplierData); //重载数据
}
//查看邀请供应商信息
function viewSupplier(i){
	parent.layer.open({
        type: 2 //此处以iframe举例
        ,title: '查看邀请供应商信息'
        ,area: ['700px', '500px']
        ,content:viewSupplierUrl
        ,success:function(layero,index){
        	var iframeWind=layero.find('iframe')[0].contentWindow;//获取包件弹出框整个对象
        	iframeWind.du(supplierData[i])//弹出框弹出时初始化     	
        }
        
      });
}
//删除邀请供应商
function supplierDelet(uid,$index){
	if(yaoqing=="1"){
		var PublicnowDate=top.$("#systemTime").html()+" "+top.$("#sysTime").html();	
		if(NewDate(packageInfo.acceptEndDate) < NewDate(PublicnowDate)){    	
			parent.layer.alert('邀请函截止时间已过，无法删除');
			return;
		};
	}
	parent.layer.confirm('确定要删除该供应商', {
	  btn: ['是', '否'] //可以无限个按钮
	}, function(index, layero){		
		$.ajax({
		type:"get",
		url: top.config.bidhost+"/ProjectSupplierController/deleteInvitationSupplier.do",
		async:false,
		data:{
			'id':uid
		},
		success:function(res){
			if(res.success){
				suppliers(packageInfo.id);
				parent.layer.close(index);			
			}else{
				parent.layer.alert(res.message);
				parent.layer.close(index);
			}
		}
	});   
	}, function(index){
	   parent.layer.close(index)
	});
}
function add_supplier(){
	if(yaoqing=="1"){
		var PublicnowDate=top.$("#systemTime").html()+" "+top.$("#sysTime").html();	
		if(NewDate(packageInfo.acceptEndDate) < NewDate(PublicnowDate)){    	
			parent.layer.alert('邀请函截止时间已过，无法追加');
			return;
		};
	}
 	parent.layer.open({
        type: 2 //此处以iframe举例
        ,title: '添加邀请供应商'
        ,area: ['1100px', '600px']
        ,content:addsupplier
        ,btn: ['保存','取消'] 
        ,success:function(layero,index){
        	var iframeWind=layero.find('iframe')[0].contentWindow;
        	iframeWind.du(packageInfo.isPublic,packageInfo.purchaserId);
        }
        //确定按钮
        ,yes: function(index,layero){           
			var iframeWin=layero.find('iframe')[0].contentWindow;                                        
			iframeWin.checkbox();	
			var SupplieridList=iframeWin.newData;
			projectSuppliers="";
			projectSuppliers+='<input name="packageId" value="'+ packageInfo.id+'"/>'
			projectSuppliers+='<input name="projectId" value="'+ packageInfo.projectId+'"/>'
			for(var i=0;i<SupplieridList.length;i++){							
				projectSuppliers+='<input name="invitationSuppliers[' + i + '].supplierId" value="'+ SupplieridList[i].supplierId+'"/>'
				projectSuppliers+='<input name="invitationSuppliers[' + i + '].enterpriseName" value="'+ SupplieridList[i].enterprise.enterpriseName+'"/>'
				projectSuppliers+='<input name="invitationSuppliers[' + i + '].isAccept" value="'+ (SupplieridList[i].isAccept!=undefined?SupplieridList[i].isAccept:'') +'"/>'			     	
			}
			iframeWin.$("#supplier").html(projectSuppliers)					
				$.ajax({
					url:config.bidhost+'/ProjectPackageController/saveProjectInviteSupplierList.do',
					type:'post',
					//dataType:'json',
					async:false,
					//contentType:'application/json;charset=UTF-8',
					data:iframeWin.$("#supplier").serialize(),
					success:function(data){	 
						if(data.success){					   			;	
								suppliers(packageInfo.id);
								parent.layer.close(index);								
								parent.layer.alert('邀请成功');
						}else{								
								parent.layer.alert(data.message); 
						}
					},
				});

        },       
      });
}
// 发送短信
$(".sendMsg").on('click',function(){
	var PublicnowDate=top.$("#systemTime").html()+" "+top.$("#sysTime").html();	
	if(NewDate(packageInfo.acceptEndDate) < NewDate(PublicnowDate)){    	
		parent.layer.alert('邀请函截止时间已过，无法发送短信');
		return
	};
	parent.layer.confirm('是否确认发送短信', {
		btn: ['是', '否'] //可以无限个按钮
	  }, function(index, layero){		
		  $.ajax({
		  type:"get",
		  url: top.config.bidhost+"/ProjectSupplierController/sendMsgProjectSupplier.do",
		  async:false,
		  data:{
			'projectId': packageInfo.projectId,
			'packageId': packageInfo.id,
			'tenderType':0,
			'examType':0
		  },
		  success:function(res){
			  if(res.success){
				 parent.layer.alert('短信发送成功')	
				 suppliers(packageInfo.id);	
			  }else{
				parent.layer.alert(res.message)
			  }
			  parent.layer.close(index)
		  }
	  });   
	  }, function(index){
		 parent.layer.close(index)
	  });
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

/*start报价表  调用报价封装方法 */
/* function offerFormData(){
	$("#offerForm").offerForm({
		viewURL:config.bidhost+'/PackagePriceListController/findPackageQuateList.do',//回显接口
		parameter:{//接口调用的基本参数
			packageId:packageInfo.id,
			projectId:packageInfo.projectId, 
			examType:examType,
		},
		status:2,//1为编辑2为查看
		tableName:'offerTable'//表格名称
	})
}
//分项报价附件
function fileList(){
	if(!fileUp){
		fileUp=$("#fileList").fileList({
			status:2,//1为编辑2为查看
			parameter:{//接口调用的基本参数
				packageId:packageInfo.id,
				projectId:packageInfo.projectId, 
				offerFileListId:"0"
			},
			isShow:packageInfo.isOfferDetailedItem,//是否需要分项报价
			offerAttention:packageInfo.offerAttention,
			flieName: '#fileHtml',//分项报价DOM
	
		})
	}
} */
/*end报价*/