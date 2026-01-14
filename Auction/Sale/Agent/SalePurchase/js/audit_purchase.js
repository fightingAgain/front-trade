var purchaseaData="";//项目的数据的参数
var filesData=[];//附件信息数据
var findPurchaseUrl=config.AuctionHost+'/ProjectReviewController/findAutionPurchaseInfo.do';//获取项目信息的接口
var searchUrlFile = config.AuctionHost + '/PurFileController/list.do'; //采购文件分页
var viewSupplierUrl="Auction/common/Agent/Purchase/model/viewSupplier.html"//查看邀请供应商的页面路径
var pricelist=config.AuctionHost +'/ProjectPriceController/findProjectPriceList.do'//费用查看
var addsupplier='Auction/Sale/Agent/SalePurchase/model/add_supplier.html'//邀请供应商的弹出框路径
var packagePrice = [];//费用信息
var WORKFLOWTYPE = "xmgg";
var projectSupplements=[];//最新一条且通过的补遗
var reg = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
var publicData=[];
var projectId=$.getUrlParam('projectId'),oldProjectId='';
//初始化
$(function(){
	//实例化编辑器
	new UEditorEdit({
		contentKey:'content',
		pageType:'view',
	})
	$("#btn_close").on("click", function () {
  	//	top.layer.closeAll();
		var index = parent.layer.getFrameIndex(window.name);
		top.layer.close(index);
	})
	Purchase();
	//设置项目组成员
	$('#projectMember').AddMembers({
		businessId:projectId?projectId:'',
		status:2,//1编辑   2 查看  3 采购人专区的代理项目
	});
	$("#browserUrl").attr('href',siteInfo.portalSite);
	$("#browserUrl").html(siteInfo.portalSiteUrl);
	$("#webTitle").html(siteInfo.sysTitle);
	if(sysEnterpriseId&&purchaseaData.project[0].projectSource==1){
		var arrlist = sysEnterpriseId.split(',');
		if(arrlist.indexOf(top.enterpriseId)!=-1){
			getDeposit();
		}
	}
});
function Purchase(){
   findWorkflowCheckerAndAccp(projectId);
   $.ajax({
	   	url:findPurchaseUrl,
	   	type:'get',
	   	//dataType:'json',
	   	async:false,
	   	//contentType:'application/json;charset=UTF-8',
	   	data:{
	   		'projectId':projectId
	   	},
	   	success:function(data){
	   		if(data.success){
	   			purchaseaData=data.data//获取的数据
				if(purchaseaData.project && purchaseaData.project.length>0 &&purchaseaData.project[0].oldProjectId){//推送的项目
					oldProjectId = purchaseaData.project[0].oldProjectId;
					$('#viewPushInfo').show();
				}
		   		if(purchaseaData.purFile.length>0){
		   			filesData=purchaseaData.purFile;
		   		}
		   		filesDataView()
		   		if(purchaseaData.projectSupplement.length>0){//存在补遗		
					for(var i=0;i<purchaseaData.projectSupplement.length;i++){
						if(purchaseaData.projectSupplement[i].checkState==2){//审核通过
							projectSupplements.push(purchaseaData.projectSupplement[i]) ;							
						}
					}				
				}
				mediaEditor.setValue(purchaseaData)
				initMediaVal(purchaseaData.options, {
					// stage: 'xmgg',
					from: 'jmjy',
					disabled: true,
					projectId: purchaseaData.projectId,
				})
	   		}
	   		
	   		
	   	},
	   	error:function(data){
	   		
	   	}
	 });
	 Supplement();
	 //渲染公告的数据
	 for(key in purchaseaData){
		$('#'+key).html(purchaseaData[key]);
    	if(reg.test(purchaseaData[key])){
			$('#'+key).html(purchaseaData[key].substring(0,16));
		}
	 }
	//渲染项目的数据
	for(key in purchaseaData.project[0]){
		$('#'+key).html(purchaseaData.project[0][key]);
    	if(reg.test(purchaseaData.project[0][key])){
			$('#'+key).html(purchaseaData.project[0][key].substring(0,16));
		}
	}
	$("#provinceName").html(purchaseaData.project[0].provinceName||'湖北省');	
	$("#cityName").html(purchaseaData.project[0].cityName||'襄阳市');	
	$("#agencyDepartmentName").html(purchaseaData.agencyDepartmentName||"无所属部门")
	$("#purchaserDepartmentName").html(purchaseaData.purchaserDepartmentName||"无所属部门");
	/* *************        采购项目分类、项目行业分类 （需求dfdzcg-3822）          ********** */
	if(purchaseaData.project[0].tenderProjectClassify){
		$("#tenderProjectClassify").dataLinkage({
			optionName: "SYS_PROJECT_CLASSIFY",
			optionValue: purchaseaData.project[0].tenderProjectClassify,
			status: 2,
			viewCallback: function(name) {
				$("#tenderProjectClassify").html(name)
			}
		});
	}
	if(purchaseaData.project[0].industriesType){
		$("#industriesType").dataLinkage({
			optionName: "INDUSTRIES_TYPE",
			optionValue: purchaseaData.project[0].industriesType,
			status: 2,
			viewCallback: function(name) {
				$("#industriesType").html(name)
			}
		});
	}
	/* *************        采购项目分类、项目行业分类 （需求dfdzcg-3822）   -end       ********** */
		if(purchaseaData.project[0].projectType==0){
			$('.engineering').show()
		}else{
			$('.engineering').hide()
		}
		if(projectSupplements.length>0){
			$('div[id]').each(function() {
				$(this).html(projectSupplements[0][this.id]);
				if(reg.test(projectSupplements[0][this.id])){
				$(this).html(projectSupplements[0][this.id].substring(0,16));
			}	
			});
		}
		$('#StartDate').html($("#noticeStartDate").html())
		$('#endDate').html($("#noticeEndDate").html())
		if(purchaseaData.autionProjectPackage.length>0){
			//包件的信息渲染
			$('div[id]').each(function(){
				$(this).html(purchaseaData.autionProjectPackage[0][this.id]);
			});
			$('#quotationType').html(purchaseaData.autionProjectPackage[0].quotationType == 1?'费率':purchaseaData.autionProjectPackage[0].quotationType== 0?'价格':'');
			$('#quotationMethod').html(purchaseaData.autionProjectPackage[0].quotationMethod == 1?'报单价':purchaseaData.autionProjectPackage[0].quotationMethod== 0?'报总价':'');
			if(purchaseaData.autionProjectPackage[0].quotationType == 1){
				$('.quotationTypeUnit').html('%');
			}else{
				$('.quotationTypeUnit').html('元');
			}
			//当为自由竞卖的时候限时显示
			if(purchaseaData.autionProjectPackage[0].auctionType==0){
				$("#timeLimits").show();
				$("#timeLimit").html(purchaseaData.autionProjectPackage[0].timeLimit)						
			}
			//当为单轮竞卖的时候隐藏显示，
			if(purchaseaData.autionProjectPackage[0].auctionType==1){
				$("#timeLimits").hide();		
			}
			//当为多轮竞卖2轮时
			if(purchaseaData.autionProjectPackage[0].auctionType==2){
				$("#auctionType_2").show();
				$("#auctionType_0").hide();
				$("#outSupplierd").html(purchaseaData.autionProjectPackage[0].outSupplier==0?'按实际报价供应商数淘汰':'按参与供应商数淘汰')
				$(".outSupplierp").html(purchaseaData.autionProjectPackage[0].outSupplier==0?'是指，每轮竞卖结束后，未报价的供应商直接淘汰，然后从实际报价供应商中淘汰报价低的供应商（即设置的每轮淘汰数，若报价相同，淘汰后报价者），剩余供应商进入下一轮；':'是指，每轮竞卖结束后，若未报价供应商数大于等于该轮淘汰数，则未报价供应商直接淘汰，剩余供应商进入下一轮，若未报价供应商数小于该轮淘汰数，则未报价供应商直接淘汰，然后从已报价供应商中淘汰报价低的供应商（设置的该轮淘汰数与未报价供应商的差，若报价相同，淘汰后报价者），剩余供应商进入下一轮。')
				//当为多轮竞卖3轮时
			}else if(purchaseaData.autionProjectPackage[0].auctionType==3){
				$("#auctionType_2").show();
				$("#auctionType_0").hide();	
				$("#outSupplierd").html(purchaseaData.autionProjectPackage[0].outSupplier==0?'按实际报价供应商数淘汰':'按参与供应商数淘汰')
				$(".outSupplierp").html(purchaseaData.autionProjectPackage[0].outSupplier==0?'是指，每轮竞卖结束后，未报价的供应商直接淘汰，然后从实际报价供应商中淘汰报价低的供应商（即设置的每轮淘汰数，若报价相同，淘汰后报价者），剩余供应商进入下一轮；':'是指，每轮竞卖结束后，若未报价供应商数大于等于该轮淘汰数，则未报价供应商直接淘汰，剩余供应商进入下一轮，若未报价供应商数小于该轮淘汰数，则未报价供应商直接淘汰，然后从已报价供应商中淘汰报价低的供应商（设置的该轮淘汰数与未报价供应商的差，若报价相同，淘汰后报价者），剩余供应商进入下一轮。')

			}else{
				$("#auctionType_0").show();
				$("#auctionType_2").hide();
			}	
			//当为0，1时不显示邀请供应商列表
			if(purchaseaData.isPublic>1){
				$('.publicTable').show();
				Publics()
			}else{
				$('.publicTable').hide()
			}
			//是否竞卖文件递交0为是1为否
			if(purchaseaData.isFile==0){
				$('.isFileDate').show()
			}else{
				$('.isFileDate').hide()
			};
			if(purchaseaData.autionProjectPackage[0].isPayDeposit==0){
				$("#isPayDeposit").html("需要缴纳");
				$('.isDepositShow').show();	
				$("#bankType").html(purchaseaData.autionProjectPackage[0].bankType == 1 ? "工商银行" : purchaseaData.autionProjectPackage[0].bankType == 2? "招商银行":'');
			}else{
				$("#isPayDeposit").html("不需要缴纳");
				$('.isDepositShow').hide();
			}
			if(purchaseaData.autionProjectPackage[0].isSellFile==0){
				$("#isSellFile").html("需要缴纳");
				$(".isSellShow").show();
				$('.isSellCols').attr('colspan','1')
			}else{
				$("#isSellFile").html("不需要缴纳")
				$(".isSellShow").hide();
				$('.isSellCols').attr('colspan','3');
			}
			if(purchaseaData.autionProjectPackage[0].auctionType==2&&purchaseaData.autionProjectPackage[0].outType==1){
				$(".third").hide();
				$(".thirds").hide();
				$(".Supplier").hide();
			}else if(purchaseaData.autionProjectPackage[0].auctionType==2&&purchaseaData.autionProjectPackage[0].outType==0){
				$(".Supplier").show();
				$(".third").hide();
				$(".thirds").hide();
			}else if(purchaseaData.autionProjectPackage[0].auctionType==3&&purchaseaData.autionProjectPackage[0].outType==1){
				$(".Supplier").hide();
				$(".thirds").show();
			}else if(purchaseaData.autionProjectPackage[0].auctionType==3&&purchaseaData.autionProjectPackage[0].outType==0){
				$(".Supplier").show();
				$(".third").show();
				$(".thirds").show();
			}
		}
		if(purchaseaData.auctionPackageDetailed.length>0){
			//设备信息的数据渲染
			$('div[id]').each(function(){
				$(this).html(purchaseaData.auctionPackageDetailed[0][this.id]);
			});
		};
		getProjectPrice();//费用信息		
		
	//start 招标代理服务费
	if(purchaseaData.autionProjectPackage&&purchaseaData.autionProjectPackage.length>0&&purchaseaData.autionProjectPackage[0].projectServiceFee){
		var projectServiceFee = purchaseaData.autionProjectPackage[0].projectServiceFee;
		var stHtml = '<td class="th_bg">采购代理服务费收取方式</td>'

    				+'<td><div id="collectType">'+(projectServiceFee.collectType==1?"标准累进制":(projectServiceFee.collectType==2?"其他":"固定金额"))+'</div></td>';
        if(projectServiceFee && projectServiceFee.collectType == 0){
        	stHtml += '<td class="th_bg">固定金额(元)</td>'

    				+'<td><div id="chargeMoney">'+projectServiceFee.chargeMoney +'</div></td>'
        } else if(projectServiceFee && projectServiceFee.collectType == 1){
        	if(projectServiceFee.isDiscount == 1){
        		stHtml +='<td class="th_bg">是否优惠</td><td>否</td>'
        	} else {
				stHtml+='<td class="th_bg">优惠系数（如8折输0.8）</td><td><div id="discountCoefficient">'+projectServiceFee.discountCoefficient+'</div></td>'
        	}

        }else if(projectServiceFee && projectServiceFee.collectType == 2){
        	stHtml +='<td class="th_bg">收取说明</td>'
			+'<td><div id="collectRemark">'+(projectServiceFee.collectRemark ? projectServiceFee.collectRemark : '-')+'</div></td>'
        }
        $(stHtml).appendTo(".agentBlock");
        $(".agentBlock").css("display", "table-row");
	}
	//end 招标代理服务费
}

//附件信息
function filesDataView(){
	if(filesData.length>7){
		var height='304'
	}else{
		var height=''
	}
	$('#filesData').bootstrapTable({
		pagination: false,
		undefinedText: "",
		height:height,
		columns: [{
				title: "序号",
				align: "center",
				halign: "center",
				width: "50px",
				formatter: function(value, row, index) {
					return index + 1;
				}
			},
			{
				field: "fileName",
				title: "文件名称",
				align: "left",
				halign: "left",

			},
			{
				field: "fileSize",
				title: "文件大小",
				align: "center",
				halign: "center",
				width:'100px',

			},			
			{
				field: "#",
				title: "操作",
				halign: "center",
				width:'50px',
				align: "center",
				events:{
					'click .openAccessory':function(e,value, row, index){
						var url = config.FileHost + "/FileController/download.do" + "?fname=" + row.fileName + "&ftpPath=" + row.filePath;
					    window.location.href =$.parserUrlForToken(url) ;
					}
				},
				formatter:function(value, row, index){				
					return '<button type="button" class="btn btn-sm btn-primary openAccessory">下载</button>'
				}
			},		
		]
	});
	$('#filesData').bootstrapTable("load", filesData);	
};
//邀请供应商
function add_supplier(){
	var PublicnowDate=top.$("#systemTime").html()+" "+top.$("#sysTime").html();
	if(NewDate(purchaseaData.noticeEndDate) <NewDate(PublicnowDate)){    	
		parent.layer.alert('公告截止时间已过，无法追加供应商');
		return;
	};
 	parent.layer.open({
        type: 2 //此处以iframe举例
        ,title: '追加邀请供应商'
        ,area: ['1100px', '600px']
        ,content:addsupplier
        ,success:function(layero,index){
        	var iframeWind=layero.find('iframe')[0].contentWindow;
        	iframeWind.du(purchaseaData.isPublic,projectId,purchaseaData.purchaserId,purchaseaData.supplierClassifyCode,'true');
        }             
     });
 }
//当有邀请供应商的时候显示邀请供应商的列表
function Publics() {
	var PublicnowDate=top.$("#systemTime").html()+" "+top.$("#sysTime").html();
	if(NewDate(purchaseaData.noticeEndDate) >NewDate(PublicnowDate)){    	
		$(".addSupplier").show();
		$(".sendMsg").show();
	};
	var Publicid=[];
	$.ajax({
		type:"post",
		url: top.config.AuctionHost+"/ProjectSupplierController/findProjectSupplierList.do",
		async:false,
		data:{			
			'projectId':projectId,
			'tenderType':2
		},
		success:function(resx){
			if(resx.success){
				publicData=resx.data				
				for(var i=0;i<publicData.length;i++){
			     	Publicid.push(publicData[i].supplierId);    	
			    };
			    sessionStorage.setItem('keysjd', JSON.stringify(Publicid));//邀请供应商的id缓存    				
			}
		}
	});
	if(publicData.length>7){
		var height="304"
	}else{
		var height=""
	}
	var RenameData = getBidderRenameData(projectId);//投标人更名信息
	$('#tableList').bootstrapTable({
		pagination: false,
		undefinedText: "",
		height:height,
		columns: [{
				title: "序号",
				align: "center",
				halign: "center",
				width: "50px",
				formatter: function(value, row, index) {
					return index + 1;
				}
			},
			{
				field: "enterprise.enterpriseName",
				title: "企业名称",
				align: "left",
				halign: "left",	
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
				width: "120px",
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
				width:'120px',
				formatter:function(value, row, index){					
					var Tdr='<div class="btn-group">'
						Tdr+='<a class="btn-sm btn-primary" href="javascript:void(0)" style="text-decoration:none;margin-right:10px" onclick="viewSupplier('+ index +')">查看</a>'
						if(row.isAccept!=0&&row.isAccept!=1 && !$('#tableList').hasClass('tableOfJD')){
							if(NewDate(purchaseaData.noticeEndDate) > NewDate(PublicnowDate)){    	
								Tdr+='<a class="btn-sm btn-danger" href="javascript:void(0)" style="text-decoration:none" onclick=supplierDelet(\"'+ row.id+'\","'+ index +'")>删除</a>'
							};
						}					
					Tdr+='</div>'
		     		return Tdr
				}
			}			
		]
	});
	
	$('#tableList').bootstrapTable("load", publicData); //重载数据
};
//删除供应商
function supplierDelet(uid){
	var PublicnowDate=top.$("#systemTime").html()+" "+top.$("#sysTime").html();
	if(NewDate(purchaseaData.noticeEndDate) <NewDate(PublicnowDate)){    	
		parent.layer.alert('公告截止时间已过，无法删除');
		return;
	};
	parent.layer.confirm('确定要删除该供应商', {
	  btn: ['是', '否'] //可以无限个按钮
	}, function(index, layero){		
		$.ajax({
		type:"get",
		url: top.config.AuctionHost+"/ProjectSupplierController/deleteProjectSupplier.do",
		async:false,
		data:{
			'id':uid
		},
		success:function(res){
			if(res.success){
				Publics();
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
};
//查看邀请供应商信息
function viewSupplier(i,dThis){	
	//sessionStorage.setItem('publicData', JSON.stringify(purchaseaData.projectSupplier[i]));//当前供应商的数据缓存
	parent.layer.open({
        type: 2 //此处以iframe举例
        ,title: '查看'
        ,area: ['650px', '400px']
        ,content:viewSupplierUrl
        ,success:function(layero,index){
        	var iframeWind=layero.find('iframe')[0].contentWindow;//获取包件弹出框整个对象
        	iframeWind.du(purchaseaData.projectSupplier[i])//弹出框弹出时初始化     	
        }
        
      });
};
//追加供应商发送短信
$(".sendMsg").on('click',function(){
	var PublicnowDate=top.$("#systemTime").html()+" "+top.$("#sysTime").html();
	if(NewDate(purchaseaData.noticeEndDate) <NewDate(PublicnowDate)){    	
		parent.layer.alert('公告截止时间已过，无法发送短信');
		return;
	};
	parent.layer.confirm('是否确认发送短信', {
		btn: ['是', '否'] //可以无限个按钮
	  }, function(index, layero){		
		  $.ajax({
		  type:"get",
		  url: top.config.AuctionHost+"/ProjectSupplierController/sendMsgProjectSupplier.do",
		  async:false,
		  data:{
			'projectId':projectId,
			'tenderType':1
		  },
		  success:function(res){
			  if(res.success){
				 parent.layer.alert('短信发送成功')	
				 Publics();		
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
function getProjectPrice(){
	$.ajax({
	   	url:pricelist,
	   	type:'get',
	   	dataType:'json',
	   	async:false,
	   	//contentType:'application/json;charset=UTF-8',
	   	data:{
	   		"projectId":projectId,
	   	},
	   	success:function(data){	 
	   		packagePrice=data.data;
	   		if(packagePrice.length>0){	
   				for(var i=0;i<packagePrice.length;i++){	
					if(packagePrice[i].priceName == '项目保证金'){
						if(packagePrice[i].payMethod==0){
							$('.DepositPriceShow').hide();
							$("#payMethod").html('虚拟子账号');
							$('.type_offline').show();									
						}else{
							$('.DepositPriceShow').show();
							$('.type_offline').hide();
							$("#payMethod").html('指定账号');
							if(packagePrice[i].agentType==0){
								$("#agentType").html("平台")
							}
							if(packagePrice[i].agentType==1){
								$("#agentType").html("代理机构")
							}
							if(packagePrice[i].agentType==2){
								$("#agentType").html("采购人")
							}
							$("#bankAccount").html(packagePrice[i].bankAccount);
							$("#bankName").html(packagePrice[i].bankName);
							$("#bankNumber").html(packagePrice[i].bankNumber);					
						}
						$("#price1").html(packagePrice[i].price);
					}
					if(packagePrice[i].priceName == '竞价采购文件费'){
						$("#price2").html(packagePrice[i].price);
					}
				}
		    }

	   	}  
	});
}
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
//原项目保证金转移到本项目
function getDeposit(){
	$("#depositHtml").deposit({			
		status:2,//1为编辑2为查看
		tenderType:2,
		parameter:{//接口调用的基本参数
			projectId:projectId,
			projectForm:2,
		},
		packageData:[
			{
				projectId:projectId, 
				projectForm:2
			}
		]
	})
}
/* 查看派项信息 */
$('#viewPushInfo').click(function(){
	/* 方法在公共文件public中 */
	viewPushInfoP(oldProjectId, purchaseaData.project[0].bidValue1)
});