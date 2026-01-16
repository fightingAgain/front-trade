var projectDataID="";//该条数据的项目id
var purchaseaData="";
var packageData="";//包件的数据容器
var publicData="";//邀请供应商数据的容器
var DetailedData="";//设备信息的数据容器
var packagePrice = [];//费用信息
var filesData=[];

var allProjectData=config.AuctionHost+'/ProjectSupplementController/findAutionPurchaseInfo';//项目数据的接口；
var findAutionPurchaseInfoUrl = config.AuctionHost+"/ProjectReviewController/findAutionPurchaseInfo.do";
var findProjectSupplementInfoUrl= config.AuctionHost + "/ProjectSupplementController/findProjectSupplementInfo";

var pricelist=config.AuctionHost +'/ProjectPriceController/findProjectPriceList.do'//费用查看
var getImgListUrl = config.AuctionHost + "/PurFileController/list.do"; //查看附件
var CheckList=config.AuctionHost+'/AuctionPackageDetailedController/findAuctionPackageDetailedList.do'//材料设备 查询
var WorkflowUrl = top.config.AuctionHost + "/WorkflowController/findWorkflowCheckerByType.do" //项目审核人列表数据接口
var saveChange = config.AuctionHost + '/ProjectSupplementController/saveProjectSupplement'; // 保存接口

var packagePrice = [];//费用信息
var viewSupplierUrl="Auction/common/Agent/Purchase/model/viewSupplier.html"//查看邀请供应商的页面路径
var auctionOutTypeData=[]//不限轮次淘汰方式
var WORKFLOWTYPE = "xmby";
var findOneInfo = config.AuctionHost + "/AuctionProjectPackageController/findOnePurchase.do";
var projectSupplements=[];//最新一条且通过的补遗
var reg = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;

var isChecker = 0;

var urlId = getUrlParam('id')
var viewType = getUrlParam('type')
var projectSourceCount = getUrlParam('projectSourceCount')
var globalInfo;
var isDfcm = false;//是否传媒自主采购项目
function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象  
	var r = window.location.search.substr(1).match(reg); // 匹配目标参数  
	if(r != null) return unescape(r[2]);
	return null; // 返回参数值  
}


//初始化
$(function(){
	new UEditorEdit({
		pageType: "view",
		contentKey:"remark"
	});
	//退出
	$("#btn_close").click(function () {
		var index = top.parent.layer.getFrameIndex(window.name);
		top.parent.layer.close(index);
	})
	// Purchase()
	if(urlId !=''){
		let p = {'id':urlId}
		showPurchse(p)
	}
	if(viewType=='view'){

	}

	$("#browserUrl").attr('href',siteInfo.portalSite);
    $("#browserUrl").html(siteInfo.portalSite);
	$("#webTitle").html(siteInfo.sysTitle);

	$('#btn_submit').click(function(){
		if(!projectDataID){
			parent.layer.alert('请先选择项目!');return false;
		}
		if(!$('#noticeEndDate').val()){
			parent.layer.alert('请选择公告截止时间!');return false;
		}
		if(!$('#askEndDate').val()){
			parent.layer.alert('请选择提出澄清截止时间!');return false;
		}
		if(!$('#answersEndDate').val()){
			parent.layer.alert('请选择答复截止时间!');return false;
		}
		if(!$('#auctionStartDate').val()){
			parent.layer.alert('请选择竞价开始时间!');return false;
		}
		if(isChecker == 1){
			let checkerId = $("#employeeId").val()
			if(!checkerId){
				parent.layer.alert('请选择审核人!');return false;
			}
		}
		if(isChecker == 1){
			let checkerId = $("#employeeId").val()
			if(!checkerId){
				parent.layer.alert('请选择审核人!');return false;
			}
		}
		var ueContent	= ue.getContent();
		ueContent = ueContent.replace(/<style[\s\S]*?<\/style>/ig,"");
		ueContent = ueContent.replace(/<\/?.+?\/?>/g,"");
		ueContent = ueContent.replace(/&nbsp;/ig,"");
		ueContent = ueContent.trim();
		if(ueContent==''){
			parent.layer.alert("请输入公告信息!");        		     		
			return false;
		}
		let params  ={
			'projectId':projectDataID,
			'checkState':0,
			'supplementType':0,
			'tenderType':'1', //1=竞价 2=竞卖
			'auctionStartDate':$('#auctionStartDate').val(),
			'noticeEndDate':$('#noticeEndDate').val(),
			'askEndDate':$('#askEndDate').val(),
			'answersEndDate':$('#answersEndDate').val(),
			'checkerId':$("#employeeId").val(),
			'remark':ue.getContent(),
			'editorValue':ue.getContent()
		}
		$.ajax({
			url:saveChange,
			type:'post',
			//dataType:'json',
			async:false,
			//contentType:'application/json;charset=UTF-8',
			data:params,
			success:function(res){
				if(res.success){
					parent.layer.closeAll()
					parent.layer.alert('公告变更提交成功!');
				}else{
					parent.layer.alert(res.message)
				}
				
			}
		});
	});
	$('#btn_close').click(function(){
		parent.layer.closeAll()
	});
})
function choseHistoryProject(){
	parent.layer.open({
	    type: 2 //此处以iframe举例
	    ,title: '历史变更记录'
	    ,area: ['1100px','600px']
	    ,content:'Auction/Auction/Purchase/AuctionChange/model/historyPurchasers.html?tenderType=1&projectId='+globalInfo.projectId
	    //,btn: ['关闭']
	    // ,maxmin: false //该参数值对type:1和type:2有效。默认不显示最大小化按钮。需要显示配置maxmin: true即可
		,resize: false //是否允许拉伸
	    ,success:function(layero,index){
	    	var iframeWind=layero.find('iframe')[0].contentWindow;
	    	iframeWind.du()
	    } 
  	});
}
function showPurchse(Data){
	time()
	// setSupplementChecker(); //添加审核人信息
	projectDataID = Data.id;
	findWorkflowCheckerAndAccp(projectDataID);
	$.ajax({
		url:findProjectSupplementInfoUrl,
		type:'post',
		//dataType:'json',
		async:false,
		//contentType:'application/json;charset=UTF-8',
		data:{
			'id':Data.id,
			'supplementType':3
		},
		success:function(findChangeData){
			globalInfo = findChangeData.data
			mediaEditor.setValue(globalInfo);
			$.ajax({
				url:findAutionPurchaseInfoUrl,
				type:'post',
				//dataType:'json',
				async:false,
				//contentType:'application/json;charset=UTF-8',
				data:{
					'projectId':findChangeData.data.projectId,
				},
				success:function(data){
					
					for(let item in data.data){
						if(item == 'project'){
							console.log(data.data.project[0])
							for(let p in data.data.project[0]){
								if(p=='employeeId') break
								if(p=='isAgent'){
									$('#'+p).html(data.data.project[0][p]==1?'是':'否')
								}else{
									$('#'+p).html(data.data.project[0][p])
								}
							}
						}else{
							$('#'+item).html(data.data[item])
						}
						if(item == 'noticeEndDate' || item == 'askEndDate' || item == 'answersEndDate' || item == 'auctionStartDate' || item == 'fileEndDate' || item == 'fileCheckEndDate'){
							$('#old'+item).html(data.data[item])
						}
					}
 
					if(data.data.isFile == 1){
						$('.isFileBool').hide()
					}else{
						$('.isFileBool').show()
					}
					
					//项目数据
					purchaseaData=data.data;	   		
					//邀请供应商的数据
					publicData=purchaseaData.projectSupplier;
					if(purchaseaData.autionProjectPackage.length>0){
						//包件信息的数据
						packageData=purchaseaData.autionProjectPackage;
						
						//设备信息的数据
						DetailedData=purchaseaData.auctionPackageDetailed
						
					}
					if(purchaseaData.projectSupplement.length>0){//存在补遗		
						for(var i=0;i<purchaseaData.projectSupplement.length;i++){
							projectSupplements.push(purchaseaData.projectSupplement[i]) ;
						}				
					}
					

					for(let citem in findChangeData.data){
						if(citem == 'remark'){
							$('#editor').html(findChangeData.data[citem])
						}else{
							$('#'+citem).html(findChangeData.data[citem]);
						}
					}

					initMediaVal(purchaseaData.options, {
						stage: 'xmby',
						disabled: true,
						projectId: projectDataID,
					})
				},
				error:function(data){
					parent.layer.alert("修改失败")
				}
			});
		}

	});

	// Supplement();
	 //渲染公告的数据
    $('div[id]').each(function(){
    	$(this).html(purchaseaData[this.id]);
    	if(reg.test(purchaseaData[this.id])){
			$(this).html(purchaseaData[this.id].substring(0,16));
		}
		
	});
	//渲染项目的数据
	$('div[id]').each(function(){
		$(this).html(purchaseaData.project[0][this.id]);
		if(reg.test(purchaseaData.project[0][this.id])){
			$(this).html(purchaseaData.project[0][this.id].substring(0,16));
		}		
	});
	if(projectSourceCount != "undefined" && projectSourceCount != null && projectSourceCount != "0") {
		$("#projectName").val(purchaseaData.project[0].projectName);
		$("#projectSourceCount").html('(第' + projectSourceCount + '次重新竞价)');
		$("#projectSourceCount").show();
	} else {
		$("#projectName").val(purchaseaData.project[0].projectName);
		$("#projectSourceCount").hide();
	}
	$("#provinceName").html(purchaseaData.project[0].provinceName||'湖北省');	
	$("#cityName").html(purchaseaData.project[0].cityName||'襄阳市');
	package()
	//当为0，1时不显示邀请供应商列表
	if(purchaseaData.isPublic>1){
		$('.publicTable').show();
		public()
	}else{
		$('.publicTable').hide()
	}
	if(purchaseaData.isPublic==0){		
		$("#isPublic").html("所有供应商");
	}
	if(purchaseaData.isPublic==1){
		$("#isPublic").html("所有本公司认证供应商");
	}
	if(purchaseaData.isPublic==2){
		$("#isPublic").html("仅限邀请供应商");
	}
	if(purchaseaData.isPublic==3){
		$("#isPublic").html("仅邀请本公司认证供应商");
		$("#isPublics3").show();
   	};
	//是否竞卖文件递交0为是1为否
	if(purchaseaData.isFile==0){
		$('.isFileDate').show()
	}else{
		$('.isFileDate').hide()
	}
	if(purchaseaData.project[0].projectType==0){
		$('.engineering').show()
	}else{
		$('.engineering').hide()
	}
	if(sysEnterpriseId&&purchaseaData.project[0].projectSource==1){
		var arrlist = sysEnterpriseId.split(',');
		if(arrlist.indexOf(top.enterpriseId)!=-1){
			getDeposit();
		}
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
}

//包件的按钮
function package(){
	if(packageData.length>0){
		var strHtml = "";
		for(i = 0; i < packageData.length; i++) {
			if(i==0){
				strHtml += "<button class='btn btn-default btn-primary packageBtn' onclick=setPackageInfo('" + i + "',this)>包件" + (i + 1) + "</button>";
			}else{
				strHtml += "<button class='btn btn-default packageBtn' onclick=setPackageInfo('" + i + "',this)>包件" + (i + 1) + "</button>";
			}
			
			if(i < packageData.length - 1) {
				strHtml += "&nbsp;&nbsp;&nbsp;&nbsp;";
			}		
		}
		$("#packageBtn").html(strHtml);
		
		setPackageInfo(0)		
	}
	
}

//根据按钮显示的包件信息
function setPackageInfo(obj,thiss) {
	$(thiss).addClass('btn-primary').siblings().removeClass('btn-primary')	
	auctionOutTypeData=[];
	var data = packageData[obj];
	purchaseaData.packageId=data.id
	for(var i=0;i<purchaseaData.auctionOutType.length;i++){
		if(purchaseaData.auctionOutType[i].packageId==packageData[obj].id){
			auctionOutTypeData.push(purchaseaData.auctionOutType[i]);
		}
	};
	$('div[id]').each(function(){
		$(this).html(data[this.id]);
	});
	$('#isOfferFile').html(data.isOfferFile==0?'提交报价文件':'不提交报价文件');
	if(data.isPayDeposit==0){
		$("#isPayDeposit").html("需要缴纳");
		$('.isDepositShow').show();		
	}else{
		$("#isPayDeposit").html("不需要缴纳");
		$('.isDepositShow').hide();
		
	}
	if(data.isSellFile==0){
		$("#isSellFile").html("需要缴纳");
		$(".isSellShow").show();
		$('.isSellCols').attr('colspan','1')
	}else{
		$("#isSellFile").html("不需要缴纳")
		$(".isSellShow").hide();
		$('.isSellCols').attr('colspan','3');
	}
	//当为自由竞卖的时候限时显示
	if(data.auctionType==0){
		$("#timeLimits").show();
		$("#timeLimit").html(data.timeLimit||'-');
		$("#maxAuctionTimes").show();
		$("#maxAuctionTime").html(data.maxAuctionTime||'-');
		if(data.auctionModel==0&&data.isPrice==0){
		$(".isPriceM").show();
		$(".isPrices").show();
		$(".isPriceH").show();					
		$(".isPriceL").attr('colspan','');
		}else{
			$(".isPriceM").hide();
			$(".isPrices").hide();
			$(".isPriceH").hide();
			$(".isPriceL").attr('colspan','3');				
		};
		
	}else if(data.auctionType==1){
		$("#timeLimits").hide();
		$("#maxAuctionTimes").hide();
		$(".isPriceM").hide();
		$(".isPriceL").attr('colspan','3');		
		if(data.auctionModel==0){
			$(".isPrices").show();
			if(data.isPrice==0){
				$(".isPriceH").show();
			}else{
				$(".isPriceH").hide();
			}
		}else{
			$(".isPrices").hide();
			$(".isPriceH").hide();
		}
	}else{
		$(".isPriceM").hide();
		
		if(data.isPrice==0){
			$(".isPrices").show();
			$(".isPriceH").show();
		}else{
			$(".isPriceH").hide();
			$(".isPrices").hide();
		}
		
		$(".isPriceL").attr('colspan','3');
		$('#isPriceReduction').html((data.isPriceReduction == 1)?'否':'是');
		/* 2、多轮竞价/不限轮次-设置竞价起始价-设置降价幅度 */
		if(data.auctionType == 2 || data.auctionType == 3 || data.auctionType == 4 ){//多轮/不限轮次
			if (data.isPrice == 0) {//设置竞价起始价
				$(".isPriceReduction").show();
				if(data.isPriceReduction == 0){//设置降价幅度
					$('.priceReduction').show();
					$('.isPriceReductionCols').attr('colspan','');
				}else{//不设置降价幅度
					$('.priceReduction').hide();
					$('.isPriceReductionCols').attr('colspan','3');
				}
			} else {//不设置竞价起始价
				$(".isPriceReduction").hide();
			}
			
		}else{
			$(".isPriceReduction").hide();
		}
	};
	//当为多轮竞卖2轮时
	if(data.auctionType==2){
		$("#auctionType_2").show();
		$("#auctionType_0").hide();	
		$(".auctionType_4").hide();
		$("#outSupplierd").html(packageData[obj].outSupplier==0?'按实际报价供应商数淘汰':'按参与供应商数淘汰')
		$(".outSupplierp").html(packageData[obj].outSupplier==0?'是指，每轮竞价结束后，未报价的供应商直接淘汰，然后从实际报价供应商中淘汰报价高的供应商（即设置的每轮淘汰数，若报价相同，淘汰后报价者），剩余供应商进入下一轮；':'是指，每轮竞价结束后，若未报价供应商数大于等于该轮淘汰数，则未报价供应商直接淘汰，剩余供应商进入下一轮，若未报价供应商数小于该轮淘汰数，则未报价供应商直接淘汰，然后从已报价供应商中淘汰报价高的供应商（设置的该轮淘汰数与未报价供应商的差，若报价相同，淘汰后报价者），剩余供应商进入下一轮。')

		//当为多轮竞卖3轮时
	}else if(data.auctionType==3){
		$("#auctionType_2").show();
		$("#auctionType_0").hide();	
		$(".auctionType_4").hide();
		$("#outSupplierd").html(packageData[obj].outSupplier==0?'按实际报价供应商数淘汰':'按参与供应商数淘汰')
		$(".outSupplierp").html(packageData[obj].outSupplier==0?'是指，每轮竞价结束后，未报价的供应商直接淘汰，然后从实际报价供应商中淘汰报价高的供应商（即设置的每轮淘汰数，若报价相同，淘汰后报价者），剩余供应商进入下一轮；':'是指，每轮竞价结束后，若未报价供应商数大于等于该轮淘汰数，则未报价供应商直接淘汰，剩余供应商进入下一轮，若未报价供应商数小于该轮淘汰数，则未报价供应商直接淘汰，然后从已报价供应商中淘汰报价高的供应商（设置的该轮淘汰数与未报价供应商的差，若报价相同，淘汰后报价者），剩余供应商进入下一轮。')

	}else{
		$("#auctionType_0").show();
		$("#auctionType_2").hide();
		$(".auctionType_4").hide();
	};
	if(data.auctionType==4){
		console.log(packageData[obj].outSupplier)
		$("#auctionType_2").hide();
		$("#auctionType_0").hide();
		$(".auctionType_4").show();
		$("#outSupplierb").html(packageData[obj].outSupplier==0?'按实际报价供应商数淘汰':'按参与供应商数淘汰')
		$(".outSupplierp").html(packageData[obj].outSupplier==0?'是指，每轮竞价结束后，未报价的供应商直接淘汰，然后从实际报价供应商中淘汰报价高的供应商（即设置的每轮淘汰数，若报价相同，淘汰后报价者），剩余供应商进入下一轮；':'是指，每轮竞价结束后，若未报价供应商数大于等于该轮淘汰数，则未报价供应商直接淘汰，剩余供应商进入下一轮，若未报价供应商数小于该轮淘汰数，则未报价供应商直接淘汰，然后从已报价供应商中淘汰报价高的供应商（设置的该轮淘汰数与未报价供应商的差，若报价相同，淘汰后报价者），剩余供应商进入下一轮。')

		auctionType_4(obj);
	}	
	if(data.auctionType==2&&data.outType==1){
		$(".third").hide();
		$(".thirds").hide();
		$(".Supplier").hide();
	}else if(data.auctionType==2&&data.outType==0){
		$(".Supplier").show();
		$(".third").hide();
		$(".thirds").hide();
	}else if(data.auctionType==3&&data.outType==1){
		$(".Supplier").hide();
		$(".thirds").show();
	}else if(data.auctionType==3&&data.outType==0){
		$(".Supplier").show();
		$(".third").show();
		$(".thirds").show();
	}
	isDfcm = checkPurchaserAgent(packageData[obj].id);
	//其它费用信息
	getProjectPrice(packageData[obj].id,packageData[obj].projectId);
	//设备信息
	auctionPackageDetailed(packageData[obj].id);
	filesDataView(packageData[obj].id);
	
	/*end代理服务费*/
	var projectServiceFee = purchaseaData.projectServiceFee;
	if(purchaseaData.openServiceFee == 1 && projectServiceFee){
		$("#agentBlock td").remove();
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
    				+'<td><div id="collectRemark">'+projectServiceFee.collectRemark+'</div></td>'
        }
        $(stHtml).appendTo("#agentBlock");
        $("#agentBlock").css("display", "table-row");
	}
	/*end代理服务费*/
}

//附件信息列表
function filesDataView(uid) {
	var tr = ""
	$.ajax({
		type: "get",
		url: getImgListUrl,
		async: false,
		data: {
			'modelId':uid,
			'modelName':'JJ_AUCTION_PROJECT_PACKAGE'		
		},
		datatype: 'json',
		success: function(data) {
			if(data.success==true){
				filesData=data.data				
			}
		}
	});
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
					return '<button  class="btn btn-sm btn-primary openAccessory">下载</button>'
				}
			},		
		]
	});
	$('#filesData').bootstrapTable("load", filesData);	
};

//查询费用信息
function getProjectPrice(packageId,projectId){
	$.ajax({
		url:pricelist,
		type:'get',
		dataType:'json',
		async:false,
		//contentType:'application/json;charset=UTF-8',
		data:{
			"packageId":packageId,
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
					 }else{
						 $('.DepositPriceShow').show();
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
				 if(packagePrice[i].priceName == '平台服务费'){
					$("#price3").html(packagePrice[i].price);
				}
			 }
		 }

		}  
 	});
}

//设备信息的数据
function auctionPackageDetailed(uid){
	var checkListData=[];//把包件ID相同的设备信息放到一个数组中，
	$.ajax({
	   	url:CheckList,
	   	type:'post',
	   	dataType:'json',
	   	async:false,
	   	//contentType:'application/json;charset=UTF-8',
	   	data:{
	   		'packageId':uid
	   	},
	   	success:function(data){
	   		if(data.success){
	   			checkListData=data.data
	   		}	
	   	}
	 });	 
	if(checkListData.length>7){
		var height='304'
	}else{
		var height=''
	}
	$('#PackageDetailedList').bootstrapTable({
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
				field: "detailedName",
				title: isDfcm?"物料名称":"材料设备名称",
				align: "left",
				halign: "left",

			},
			{
				field: "brand",
				title: "品牌要求",
				align: "center",
				halign: "center",
				width:'100px',
				visible: isDfcm?false:true,

			},
			{
				field: "detailedVersion",
				title: "型号规格",
				halign:"center",
				width:'100px',
				align: "center",
				formatter:function(value, row, index){
				 return	 (value==undefined||value=="")?"暂无型号":value
				}

			}, {
				field: "technology",
				title: "材料工艺",
				halign: "center",
				visible: isDfcm?true:false,
				width: '100px',
				align: "center",

			},{
				field: "detailedCount",
				title: "数量",
				halign: "center",
				width:'100px',
				align: "center",
				
			},
			{
				field: "detailedUnit",
				title: "单位",
				halign: "center",
				width:'100px',
				align: "center"
			},{
				field: "manner",
				title: "方式",
				visible: isDfcm?true:false,
				halign: "center",
				width: '100px',
				align: "center",
				formatter: function (value, row, index) {
					//1  购买、2 租赁、3制作
					if(value == '1'){
						return '购买'
					}else if(value == '2'){
						return '租赁'
					}else if(value == '3'){
						return '制作'
					}
				}

			},{
				field: "budget",
				title: "采购预算（元）",
				halign: "center",
				width:'100px',
				align: "center",
				formatter:function(value, row, index){
				if(value==undefined){
					var budget="暂无预算"
				}else{
					var budget=value;
				};
				return budget
				}
			},
			{
				field: "detailedContent",
				title: isDfcm?"补充说明":"备注",
				halign: "left",
				align: "left",
			}			
		]
	});
	$('#PackageDetailedList').bootstrapTable("load", checkListData);
}

//当有邀请供应商的时候显示邀请供应商的列表
function public(){
	if(publicData.length>7){
     	var height="304"
     }else{
     	var height=""
     }
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
				field: "isAcceptText",
				title: "确认状态",
				halign: "center",
				width:'100px',
				align: "center",
				formatter:function(value, row, index){					
					if(value=="接受"){
						var isAccept="<div class='text-success' style='font-weight:bold'>"+value+"</div>"
					}else if(value=="拒绝"){
						var isAccept="<div class='text-danger' style='font-weight:bold'>"+value+"</div>"
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
			   		          +'<a class="btn-sm btn-primary" href="javascript:void(0)" style="text-decoration:none;margin-right:10px" onclick="viewSupplier('+ index +')">查看</a>'			   		         
			   		          +'</div>'
		     		return Tdr
				}
			}			
		]
	});
	
	$('#tableList').bootstrapTable("load", publicData); //重载数据
	$("#fixed-table-loading").hide();
};

//查看邀请供应商信息
function viewSupplier(i){	
	parent.layer.open({
        type: 2 //此处以iframe举例
        ,title: '查看'
        ,area: ['700px', '500px']
        ,content:viewSupplierUrl
        ,success:function(layero,index){
        	var iframeWind=layero.find('iframe')[0].contentWindow;//获取包件弹出框整个对象
        	iframeWind.du(publicData[i])//弹出框弹出时初始化     	
        }
        
      });
};			
function auctionType_4(obj){
	if(auctionOutTypeData.length>0){
           var strHtml=""; 
             strHtml='<tr>'
                        +'<td rowspan="'+ (auctionOutTypeData.length+4) +'" class="th_bg">淘汰方式</td>'
						+'<td style="text-align: left;" colspan="4">'
							+'(1)、首轮报价供应商数'+(auctionOutTypeData[0].countType==0?'大于等于':'大于')+auctionOutTypeData[0].countValue+'家时，'						
							+'每轮淘汰'+  auctionOutTypeData[0].outValue +'家供应商；'
							+'<span style="'+(auctionOutTypeData[0].countValue==0?'':'display:none')+'">，每轮至少保留'+auctionOutTypeData[0].keepValue+'家供应商；</span>'
						+'</td>'
					+'</tr>'
					if(auctionOutTypeData.length>2){
						for(var i=1;i<auctionOutTypeData.length-1;i++){
						    strHtml += '<tr><td style="text-align: left;" colspan="4">('+(i+1)+')、首轮报价供应商数'
						    strHtml += (auctionOutTypeData[i-1].countType == 0?'小于':'小于等于')
							strHtml += auctionOutTypeData[i-1].countValue
							strHtml += '且' +(auctionOutTypeData[i].countType==0?'大于等于':'大于')
							strHtml += auctionOutTypeData[i].countValue
							strHtml += '家时，每轮淘汰'
							strHtml += auctionOutTypeData[i].outValue
							strHtml += '家供应商；</td>'
							strHtml +='</tr>'
						}
					}
				if(auctionOutTypeData[0].countValue!=0&&auctionOutTypeData[0].countValue!=undefined){
						strHtml +='<tr>'
						strHtml +='<td style="text-align: left;" colspan="4">'
						if(auctionOutTypeData.length>2){
						strHtml +='('+ auctionOutTypeData.length +')、首轮报价供应商数'+(auctionOutTypeData[auctionOutTypeData.length-2].countType==0?'小于':'小于等于')
						}else{
						strHtml +='('+ auctionOutTypeData.length +')、首轮报价供应商数'+(auctionOutTypeData[0].countType==0?'小于':'小于等于')
						}
						strHtml +=auctionOutTypeData[auctionOutTypeData.length-1].countValue+'家时，每轮淘汰'
						strHtml +=auctionOutTypeData[auctionOutTypeData.length-1].outValue+'家；'
						strHtml +='</td>'
						strHtml +='</tr>'
						strHtml +='<td style="text-align: left;" colspan="4">'
						strHtml +='('+ (auctionOutTypeData.length+1) +')、每轮至少保留'+ auctionOutTypeData[auctionOutTypeData.length-1].keepValue +'家供应商；'
						strHtml +='</td>'
						strHtml +='<tr>'
						strHtml +='</tr>'
						
				}
           	         strHtml +='<tr>'           	                         
           	         strHtml +='<td colspan="4" style="text-align: left;">'
           	         strHtml +='('+ (auctionOutTypeData.length+2) +')、当剩余供应商数小于等于淘汰家数与保留家数之和时'+(packageData[obj].lastOutType==1?'每轮淘汰1家直至剩余'+auctionOutTypeData[auctionOutTypeData.length-1].keepValue+'家。':'一轮淘汰，保留'+ auctionOutTypeData[auctionOutTypeData.length-1].keepValue +'家。')
           	         strHtml +='</td>'
           	         strHtml +='</tr>'
           	   $("#tbOutType").html(strHtml);	
	           	       
					 			
			}
}

//原项目保证金转移到本项目
function getDeposit(){
	$("#depositHtml").deposit({			
		status:2,//1为编辑2为查看
		tenderType:1,
		parameter:{//接口调用的基本参数
			projectId:projectDataID,
			projectForm:1,
		},
		packageData:[
			{
				projectId:projectDataID, 
				projectForm:1
			}
		]
	})
}