var searchUrl = parent.config.bidhost + "/BidFileController/findFileListByOrder.do";
var urlfindBidFileDownload = top.config.bidhost + "/BidFileDownloadController/findBidFileDownload.do" //查询文件下载记录
var BidFileDownloadUrl='Auction/common/Supplier/Purchase/model/view_DownloadReport.html'//添加下载记录页面
var checkTimeOutUrl = parent.config.bidhost + "/BidFileController/checkFileTimeOut.do";
var urlchang=parent.config.bidhost + "/BidFileController/findBidFileList.do";
var dowoloadFileUrl = config.bidhost + '/FileController/download.do';//下载采购文件
var examType = getUrlParam("examType");
var fileType = getUrlParam("fileType");
var status ="";
var checkType = getUrlParam("checkType")||0; //1 后审
var packageId = getUrlParam("packageId");
var isSellFile ;
var isSellPriceFile ;
var sellFileState;
var packageDate=[];
var packageSource="";
var messages="",price;
var packageData
function tableShow(){
	
	
	if(fileType == 1){
		$("#textName").text("文件下载");
		$("#textLoadName").text("文件下载记录");
		$("#textChangeName").text("文件变更记录");
		
	}
	$.ajax({
		type:"get",
		url: parent.config.bidhost + "/OfferController/findFileDownloadInfo.do",
		async:false,
		data:{
			'packageId':packageId,
			'examType':fileType
		},
		success:function(res){
			if(res.success){
				packageData = res.data;
				packageSource=packageData.packageSource;
				status=packageData.status;
				price=packageData.price;
				if(packageData.encipherStatus == 1 && examType == 1){
					$('#encipherStatus').show();
					$('#tenderClient').attr('href', top.tenderClient);
				}
			}
		}
	});
	$('label').each(function() {
	
		$(this).text(packageData[this.id]);
	});
	
	if(checkType){//预审后审  或者  后审
		//后审
		isSellFile = packageData.isSellFile;
		//预审后审
		isSellPriceFile = packageData.isSellPriceFile; //预审后审
		
		if(examType == 0){
			//预审后审
			sellFileState = isSellPriceFile;
		}else{
			//后审
			sellFileState = isSellFile;
		}
		
		if(sellFileState == 0){
			//出售 ,显示出售时间
			if(examType == 0){
				$("#times1").show();
			}else{
				$(".ready").html("价格评审");
				$("#times").show();
			}
				
			
		}
	}else{
		//预审
		isSellFile = packageData.isSellFile;   //预审评审
		
		sellFileState = isSellFile;
		
		if(isSellFile ==0){
			//出售 ,显示出售时间
			$("#times").show();	
		}
	}; 
	//加载文件
	initFileList();
	//加载下载文件记录
	initFileLoadList();
	initFileChangeList();
}
var rowDatas=""
window.operateEvents = { //添加一个按钮对应的事件
	
	"click #btnDown": function(e, value, row, index) {	
		rowDatas=row;
		
		//发售  判断发售时间
		if(checkType){ //预审后审 或者 后审					
			//预审后审 
			if(isSellPriceFile ==0 && examType == 0){
				if(packageData.sellFileTimePriceState==0){
					parent.layer.alert("温馨提示：文件发售将于"+packageData.sellPriceFileStartDate+"开始，请继续关注，谢谢！");
					return;
				}
				
				if(status == 0 && packageData.sellFileTimePriceState==2){
					parent.layer.alert("温馨提示：感谢参与该项目的采购，文件发售已结束，请继续关注其它项目，谢谢！");
					return;
				}
				
				checkTimeOut(1,0);//预审后审 
				if(messages == 1){
					
					return false;
				}
			}
			
			//后审
			if(isSellFile ==0 && examType == 1){
				if(packageData.sellFileTimeState==0){
					parent.layer.alert("温馨提示：文件发售将于"+packageData.sellFileStartDate+"开始，请继续关注，谢谢！");
					return;
				}
				
				if(status == 0 && packageData.sellFileTimeState==2){
					parent.layer.alert("温馨提示：感谢参与该项目的采购，文件发售已结束，请继续关注其它项目，谢谢！");
					return;
				}
				checkTimeOut(1,1);////后审
				if(messages == 1){
					
					return false;
				}
			}
			
		}else{ 
			//预审
			if(isSellFile ==0 && examType == 0){
				if(packageData.sellFileTimeState==0){
					parent.layer.alert("温馨提示：文件发售将于"+packageData.sellFileStartDate+"开始，请继续关注，谢谢！");
					return;
				}
				
				if(status == 0 && packageData.sellFileTimeState==2){
					parent.layer.alert("温馨提示：感谢参与该项目的采购，文件发售已结束，请继续关注其它项目，谢谢！");
					return;
				}
				checkTimeOut(0,0);
				if(messages == 1){						
					return false;
				}
			}
			
		}
		var mon = "";
		if(checkType){
			//预审后审  或  后审
			mon = "采购文件费";
			var title=findServiceCharges()=="YES"?"温馨提示：购买询比采购文件后，需缴纳平台服务费（<a href='"+ platformFeeNoticeUrl +"' target ='_blank'>点击这里查看平台服务费收费标准</a>）才能报价。确认要购买询比采购文件吗？":"温馨提示：当前项目需支付采购文件费，是否确认要支付询比采购文件?"
		}else{
			//预审
			mon = "资格预审文件费";
			var title=findServiceCharges()=="YES"?"温馨提示：购买资格预审文件后，需缴纳平台服务费（<a href='"+ platformFeeNoticeUrl +"' target ='_blank'>点击这里查看平台服务费收费标准</a>）才能递交资格申请文件。确认要购买资格预审文件吗？":"温馨提示：当前项目需支付资格预审文件，是否确认支付资格预审文件?"
		};						
		top.layer.confirm(title, function(indexsmm) {
			//生成订单
			$.ajax({
				type: "post",
				url: top.config.bidhost + "/OrderController/isPayOrderInfo.do",
				data: {
					projectId:  packageData.projectId,
					packId: packageId,
					prefixOrder:orderSoruc.sys,
					moneyType:mon,
				},
				async: false,
				success: function(data) {
					if(!data.success) {	
							
						payMoney(packageId,data.message,'Ordertable',callbackPaymm);
						parent.layer.close(indexsmm)
						//parent.pay(data.message,'Ordertable',callbackPaymm)	
					}
				}
			})
		});	
	
	},
			
	"click #btnDownFree": function(e, value, row, index) {
		if(checkType){ //预审后审 或者 后审		
			if(isSellPriceFile !=0 &&examType == 0){
				checkTimeOut(1,0);//预审后审 
				if(messages == 1){
					return false;
				}
			}
			if(isSellFile ==!0 && examType == 1){
				checkTimeOut(1,1);////后审
				if(messages == 1){
					
					return false;
				}
			}
			
		}else{ 
			//预审
			if(isSellFile ==!0 && examType == 0){
				checkTimeOut(0,0);
				if(messages == 1){						
					return false;
				}
			}
			
		}
		if(examType == 0 || (examType == 1 && packageData.islink == 1)){
			parent.layer.open({
				type:2 //此处以iframe举例
				,title:'下载文件'
				,area:['500px','600px']
				,resize:false
				,content:BidFileDownloadUrl+'?examType='+checkType+'&type=1&projectId='+packageData.projectId+'&packageId='+packageId+'&isPayDeposit='+packageData.isPayDeposit
				,success:function(layero,indexs){
					var iframeWind=layero.find('iframe')[0].contentWindow; 
					iframeWind.rowData=row;
				} 
			});
		}else{
			var newUrl = dowoloadFileUrl + "?ftpPath=" + row.filePath + '&fname=' + row.fileName
			window.location.href = $.parserUrlForToken(newUrl);
		}
	}
};
window.operateEventsChange = { //添加一个按钮对应的事件
	
	"click #btnDown": function(e, value, row, index) {	
		rowDatas=row;
		rowDatas.projectId=packageData.projectId;
		parent.layer.confirm('温馨提示：此为历史变更文件，是否确定购买',function(_index){
			//发售  判断发售时间
			if(checkType){ //预审后审 或者 后审					
				//预审后审 
				if(isSellPriceFile ==0 && examType == 0){
					if(packageData.sellFileTimePriceState==0){
						parent.layer.alert("温馨提示：文件发售将于"+packageData.sellPriceFileStartDate+"开始，请继续关注，谢谢！");
						return;
					}
					
					if(status == 0 && packageData.sellFileTimePriceState==2){
						parent.layer.alert("温馨提示：感谢参与该项目的采购，文件发售已结束，请继续关注其它项目，谢谢！");
						return;
					}
					
					checkTimeOut(1,0);//预审后审 
					if(messages == 1){
						
						return false;
					}
				}
				
				//后审
				if(isSellFile ==0 && examType == 1){
					if(packageData.sellFileTimeState==0){
						parent.layer.alert("温馨提示：文件发售将于"+packageData.sellFileStartDate+"开始，请继续关注，谢谢！");
						return;
					}
					
					if(status == 0 && packageData.sellFileTimeState==2){
						parent.layer.alert("温馨提示：感谢参与该项目的采购，文件发售已结束，请继续关注其它项目，谢谢！");
						return;
					}
					checkTimeOut(1,1);////后审
					if(messages == 1){
						
						return false;
					}
				}
				
			}else{ 
				//预审
				if(isSellFile ==0 && examType == 0){
					if(packageData.sellFileTimeState==0){
						parent.layer.alert("温馨提示：文件发售将于"+packageData.sellFileStartDate+"开始，请继续关注，谢谢！");
						return;
					}
					
					if(status == 0 && packageData.sellFileTimeState==2){
						parent.layer.alert("温馨提示：感谢参与该项目的采购，文件发售已结束，请继续关注其它项目，谢谢！");
						return;
					}
					checkTimeOut(0,0);
					if(messages == 1){						
						return false;
					}
				}
				
			}
			var mon = "";
			if(checkType){
				//预审后审  或  后审
				mon = "采购文件费";
			}else{
				//预审
				mon = "资格预审文件费";
			};
			$.ajax({
				type: "post",
				url: top.config.bidhost + "/OrderController/isPayOrderInfo.do",
				data: {
					projectId:  packageData.projectId,
					packId: packageId,
					prefixOrder:orderSoruc.sys,
					moneyType:mon,
				},
				async: false,
				success: function(data) {
					if(!data.success) {				
						payMoney(packageId,data.message,'Ordertable',callbackPaymm);	
						//parent.pay(data.message,'Ordertable',callbackPaymm)
					}
				}
			})
			parent.layer.close(_index)
		})
	},		
	"click #btnDownFree": function(e, value, row, index) {
		row.projectId=packageData.projectId;
		if(checkType){ //预审后审 或者 后审		
			if(isSellPriceFile !=0 &&examType == 0){
				checkTimeOut(1,0);//预审后审 
				if(messages == 1){
					return false;
				}
			}
			if(isSellFile ==!0 && examType == 1){
				checkTimeOut(1,1);////后审
				if(messages == 1){
					
					return false;
				}
			}
			
		}else{ 
			//预审
			if(isSellFile ==!0 && examType == 0){
				checkTimeOut(0,0);
				if(messages == 1){						
					return false;
				}
			}
			
		}
		
		parent.layer.confirm('温馨提示：此为历史变更文件，是否确定下载',function(_index){
			if(packageData.islink == 1){
				parent.layer.open({
					type:2 //此处以iframe举例
					,title:'下载文件'
					,area:['500px','600px']
					,resize:false
					,content:BidFileDownloadUrl+'?examType='+checkType+'&type=1&projectId='+packageData.projectId+'&packageId='+packageId+'&isPayDeposit='+packageData.isPayDeposit
					,success:function(layero,indexs){
						var iframeWind=layero.find('iframe')[0].contentWindow; 					
						iframeWind.rowData=row;						
					} 
				});
			}else{
				var newUrl = dowoloadFileUrl + "?ftpPath=" + row.filePath + '&fname=' + row.fileName
				window.location.href = $.parserUrlForToken(newUrl);
			}
			parent.layer.close(_index)
		})
			
	}
}
function callbackPaymm(status,orderId){
	if(status==3){
		if(packageData.islink == 1){
			parent.layer.open({
				type:2 //此处以iframe举例
				,title:'下载文件'
				,area:['500px','600px']
				,resize:false
				,content:BidFileDownloadUrl+'?examType='+checkType+'&type=1&projectId='+packageData.projectId+'&packageId='+packageId+'&isPayDeposit='+packageData.isPayDeposit
				,success:function(layero,index){
					var iframeWind=layero.find('iframe')[0].contentWindow; 		          
					iframeWind.rowData=rowDatas;
					tableShow()
	//		        	window.location.reload()
					parent.$('#signBuyFileList').bootstrapTable('refresh');
				} 
			});
		}else{
			var newUrl = dowoloadFileUrl + "?ftpPath=" + rowDatas.filePath + '&fname=' + rowDatas.fileName
			window.location.href = $.parserUrlForToken(newUrl);
		}
	}
}
function AddFunction(value, row, index) { //把需要创建的按钮封装到函数中
	if(sellFileState == 1){
		//无需缴费
		return [
			'<button type="button" id="btnDownFree" class="btn btn-xs btn-primary"><span class="glyphicon glyphicon-arrow-down" aria-hidden="true"></span>下载</button>',
		].join("")
	}else{
		//要交费
		if(status == 0){
			if(price == 0){
				return [
					'<button type="button" id="btnDownFree" class="btn btn-xs btn-primary"><span class="glyphicon  glyphicon-down" aria-hidden="true"></span>下载</button>',
				].join("")
			}else{
				return [
					'<button type="button" id="btnDown" class="btn btn-xs btn-primary"><span class="glyphicon  glyphicon-ok" aria-hidden="true"></span>购买</button>',
				].join("")
			}
		}else{
			return [
				'<button type="button" id="btnDownFree" class="btn btn-xs btn-primary"><span class="glyphicon glyphicon-arrow-down" aria-hidden="true"></span>下载</button>',
			].join("")	
		}
		
	}
	
}

	
function initFileList(){
	var para = {
		'packageId':packageId,
		'fileState':1,//供应商查看‘确认提交’状态的文件
		'enterpriseType':'06'
		//'modelName':"JJ_PUR_PROJECT_PACKAGE",
		//'examType':examType
	};		
	if(checkType){
		//预审后审  或  后审
		para.examType = 1;
	}else{
		//预审
		para.examType = 0;
	}
	var flieData;
	$.ajax({
		type:"get",
		url:searchUrl,
		async:false,
		data:para,
		success:function(res){
			if(res.success){
				flieData=res.data
			}
		}
	});
	if(flieData.length>6){
		var heisue="267"
	}else{
		var heisue=""
	}
	$("#fileList").bootstrapTable({			
			columns: [{
				field: 'xh',
				title: '序号',
				align: 'center',
				width: '50px',
				formatter: function(value, row, index) {
					return index+1;
				}
			}, {
				field: 'fileName',
				title: '文件名',
				align: 'left',
			}, {
				field: "type",
				title: "文件类型",
				visible: examType==1?true:false,
				align: "center",
				formatter:function(value, row, index){
					if(row.isClearFile == 1){
						return '清单文件'
					}else{
						return '采购文件'
					}	 
				}	
			},{
				field: 'fileSize',
				title: '文件大小',
				align: 'left',
			},{
				field: 'action',
				title: '操作',
				align: 'center',
				width: '120px',
				formatter: AddFunction, //表格中添加按钮
				events: operateEvents, //给按钮注册事件
			}]
	});
	$("#fileList").bootstrapTable('load',flieData)
}

function initFileLoadList(){
	$("#fileLoadList").bootstrapTable({
			url: urlfindBidFileDownload,
			dataType: 'json',
			method: 'get',
			locale: "zh-CN",
			showPaginationSwitch: false, // 是否显示 数据条数选择框
			search: false, // 不显示 搜索框
			cache: false, // 是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
			sidePagination: 'server', // 服务端分页
			classes: 'table table-bordered', // Class样式
			queryParams: {
				'packageId':packageId,
				'examType':fileType,
				'isSupplier':1   //是否是供应商查询  0为否  1为是
			}, //查询条件参数
			striped: true,
			columns: [{
				title: "序号",
				align: "center",
				width: "50px",
				formatter: function(value, row, index) {
					return index + 1;
				}
			},
			/*{
				title: "企业名称",
				align: "left",
				field: "enterprise.enterpriseName"

			},*/
			{
				field: "purFile.fileName",
				align: "left",
				title: "文件名称",
			}, {
				field: "subDate",
				align: "center",
				title: "下载时间",
				width: "150",
			}, {
				title: "联系人",
				align: "center",
				width: "90",
				field: 'linkMan'
			},{
				title: "手机号",
				align: "center",
				width: "100",
				field: 'linkTel'
			},{
				title: "邮箱",
				align: "center",
				width: "150",
				field: 'linkEmail'
			}]
		});
}
function initFileChangeList(){
	var changData;
	$.ajax({
		type:"get",
		url:urlchang,
		async:false,
		data:{
			'packageId':packageId,
			'examType':fileType,
			'fileState':2   //是否是供应商查询  0为否  1为是
		},
		success:function(res){
			if(res.success){
				changData=res.data
			}
		}
	});
	if(changData.length>6){
		var heisue="267"
	}else{
		var heisue=""
	}
	$("#fileChangeList").bootstrapTable({	
			height:heisue,
			columns: [{
				title: "序号",
				align: "center",
				width: "50px",
				formatter: function(value, row, index) {
					return index + 1;
				}
			},{
				field: 'fileName',
				title: '文件名',
				align: 'left',
			}, {
				field: "type",
				title: "文件类型",
				visible: examType==1?true:false,
				align: "center",
				formatter:function(value, row, index){
					if(row.isClearFile == 1){
						return '清单文件'
					}else{
						return '采购文件'
					}	 
				}	
			},{
				field: 'fileSize',
				title: '文件大小',
				align: 'left',
			},{
				field: 'editDate',
				title: '变更时间',
				align: 'left',
			},{
				field: 'action',
				title: '操作',
				align: 'center',
				width: '120px',
				visible: false,
				formatter: AddFunction, //表格中添加按钮
				events: operateEventsChange, //给按钮注册事件
			}]
		});
		$("#fileChangeList").bootstrapTable('load',changData)
}


function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象  
	var r = window.location.search.substr(1).match(reg); // 匹配目标参数  
	if(r != null) return unescape(r[2]);
	return null; // 返回参数值  
}

//验证文件发售时间
function checkTimeOut(purExamType,examType){
	messages = 1;  //modify by hwf 2020-12-17, 默认为0，修改为1
	$.ajax({
		url: checkTimeOutUrl,
		type: 'post',
		async: false,
		data: {
			packageId:packageId,
			purExamType:purExamType,
			examType:examType,
		},
		success: function(data) {	
			
			if(data.success) {
				messages= 0;					
			}else{
				messages= 1;
				parent.layer.alert(data.message);
			}
		}
	});
}
//是否有平台服务费
function findServiceCharges(){
	var isSetServiceCharges="";
	$.ajax({
			type: "post",
			url: config.Syshost+'/EnterpriseChargesController/findServiceCharges.do',
			datatype: 'json',
			data:{
				'packageId':packageId
			},
			async: false,
			success: function(data) {
				if(data.success) {
					for(var i=0;i<data.data.length;i++){
						if(data.data[i].optionName=="平台服务费"){
							isSetServiceCharges=data.data[i].optionText;														
						}						
						
					}				
				}
				
		}
	})
	return isSetServiceCharges	
}