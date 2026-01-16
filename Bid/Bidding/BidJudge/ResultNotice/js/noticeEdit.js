
/**
*  zhouyan 
*  2019-4-15
*  编辑、添加结果通知
*  方法列表及功能描述
*/



var sendMsgUrl = config.tenderHost + "/InFormController/inFormUser";//满意度调查发送短信的接口

var saveUrl = config.tenderHost + "/ResultNoticeController/save.do";	//保存地址
//var submitUrl = config.tenderHost + "/ResultNoticeController/subSave.do";	//提交地址
var isEvaluateUrl = config.JudgesHost + '/ProjectController/getProjectEvaluateState.do';//专家履职评价是否完成

var resiveUrl = config.tenderHost + "/BidWinCandidateController/findBidWinCandidate.do";	////新增详情地址
var recallUrl = config.tenderHost + "/ResultNoticeController/findResultNoticeByBidId.do";	//修改详情地址
//var modelUrl = config.tenderHost + "/TempBidWebController/findTempBidWebList.do";//获取模板地址
var tenderUrl = config.tenderHost + '/ResultNoticeController/findBidWinCandidateList.do';//查询当前标段所有中标人候选人及中标价
var reviseMoneyUrl = config.tenderHost + '/ResultNoticeController/saveItem.do';//修改价格后请求的接口
var countUrl = config.tenderHost + '/BidWinServiceFeeController/calculateWinServiceFee.do';//计算服务费

var serviceUrl = config.Syshost + '/EnterpriseChargesController/findSpeServiceCharges.do';//是否收取平台服务费
var bidInfoUrl = config.tenderHost + '/BidSectionController/getBidSectionInfo.do';//获取标段相关信息
var updatePriceUrl= config.tenderHost + '/ResultNoticeController/updateIsBidPrice.do';//修改中标人中标价格

var viewHtml = 'Bidding/BidJudge/ResultNotice/model/preview.html';//预览
var editHtml = 'Bidding/BidJudge/ResultNotice/model/edit.html';//中标通知书编辑
//var failEditHtml = 'Bidding/BidJudge/ResultNotice/model/failEdit.html';//落标通知书编辑

var publicId='';//数据id



var bidId='';//标段Id

var winnerPayType = '';//新增时缴纳方式 1. 固定金额、2.固定比例、3标准累进制
var payMoney = '';//收取金额
var payRatio = '';//只保存分数部分如10%，则只保存10

var supplierDtos;//	候选人列表
var winnerData = [];//中标人信息
var serviceFees = [];//计算时传给后台
var countType = '';//计算类型

var failData = [];//落标人信息
var tenderProjectClassifyCode;//标段类型 A 工程 B 货物 C 服务
var discount = 1;// 优惠系数
var modulus = 100;//费率
var bidWinNoticeId;
var priceUnit = '';//单位
var isWinCount;//中标人数量

var specialData;  //特殊平台服务费列表

var CAcf = null;  //实例化CA
var employeeInfo = entryInfo();
var fileUploads = null;
var filedata

var bidderPriceType ;//投标报价方式 1.金额  9费率
var rateUnit ;//费率单位
var rateRetainBit ;//费率保留位数(0~6)
var rateName ;//费率名称
var RenameData;//投标人更名信息
$(function(){
	bidId = $.getUrlParam('bidId');//公告列表中带过来的标段Id
	RenameData = getBidderRenameMark(bidId);//投标人更名信息
	resultNoticeCheckSatisfaction('4', '', bidId)//满意度评价
	getBidInfo(bidId);
//	if($.getUrlParam("id") && $.getUrlParam("id") != "undefined"){
//		 publicId = $.getUrlParam('id');//公告列表中带过来的ID
//		 
//	}else{
////		reviseNotice();//新增时信息反显
//		
//	};
	if($.getUrlParam("bidWinNoticeId") && $.getUrlParam("bidWinNoticeId") != "undefined"){
		 bidWinNoticeId = $.getUrlParam('bidWinNoticeId');//公告列表中带过来的ID
	}
	$('#bidSectionId').val(bidId);
	
	/*关闭*/
	$('#btnClose').click(function(){
		var index=parent.layer.getFrameIndex(window.name);
        parent.layer.close(index);
	});
	
	/*全屏*/
	$('.fullScreen').click(function(){
	   	parent.layer.open({
	        type: 2 
	        ,title: '编辑公示信息'
	        ,area: ['100%', '100%']
	        ,content: 'fullScreen.html'
	        ,resize: false
	        ,btn: ['确定', '取消']
	        ,success:function(layero,index){
	    	    var iframeWind=layero.find('iframe')[0].contentWindow; 
	//  	    iframeWind.editor.txt.html(editor.txt.html())
	        }
	        //确定按钮
	        ,yes: function(index,layero){
	        	var iframeWinds=layero.find('iframe')[0].contentWindow;
	//      	editor.txt.html(iframeWinds.editor.txt.html());
	            parent.layer.close(index);
	            
	        }
	        ,btn2: function(){
	          parent.layer.close();
	        }
	    });
	});
	//预览中标通知书
	$("#winningBid").on('click','.btn_view',function(){
		var index = $(this).attr('data-index');
		var titles = '预览中标通知书';
		var fileUrl=winnerData[index].resultNoticeItemFiles
		if(winnerData[index].id){		
			if(winnerData[index].isCompile&&winnerData[index].resultNotic){				
				preView(winnerData[index].resultNotic)
			}else  if(!(winnerData[index].isCompile)){
				previewPdf(fileUrl[0].url);
			}else{
				parent.layer.alert('还未编辑中标通知书！',{icon:7,title:'提示'})
			}
		}else{
			parent.layer.alert('还未编辑中标通知书！',{icon:7,title:'提示'})
		}
		
		
	});
	//预览落标通知书
	$("#failBid").on('click','.btn_view',function(){
		var index = $(this).attr('data-index');
		var titles = '预览结果通知书';
		var fileUrl=failData[index].resultNoticeItemFiles
		if(failData[index].id){
			if(failData[index].isCompile&&failData[index].resultNotic){
				preView(failData[index].resultNotic)
			} else if(!(failData[index].isCompile)){
				previewPdf(fileUrl[0].url);
			}else{
				parent.layer.alert('还未编辑结果通知书！',{icon:7,title:'提示'})
			}			
		}else{
			parent.layer.alert('还未编辑结果通知书！',{icon:7,title:'提示'})
		}
	});


	function preView(html){
		$.ajax({
	        type: "post",
	        url: config.Reviewhost+"/ReviewControll/previewPdf.do",
	        async: true,
	        data: {
	            'html': html
	        },
	        success: function(data){
	            if(data.success){
	            	viewPdf(data.data);
	            }
	        }
	    });
	}
	
	//选取费用计算规则
	$('#winnerList').on('change','.payType',function(){
//		parent.layer.alert('服务费计算规则将会发生改变，确定变更？',{icon:7,title:'提示'},function(index){
			var index = $(this).attr('data-index');
			var rulesValue = $(this).val();
//			var _this = this;
			console.log(winnerData,index)
			winnerData[index].calculation = rulesValue;
			winnerData[index].bidSectionId = bidId;
			winnerData[index].supplierId = winnerData[index].winCandidateId;
			
//			serviceFees = [];
			for(var i = 0;i<serviceFees.length;i++){
				if(serviceFees[i].supplierId == winnerData[index].winCandidateId){
					serviceFees[i].countType = rulesValue;
					delete serviceFees[i].newServiceFee;
					
				}
			}
			
			
			getCount(serviceFees)
//			setWinner(winnerData,winnerPayType,tenderProjectClassifyCode,discount,rulesValue);
			saveMoney(winnerData[index],function(id){
				$('#winningBid .winnerItems').eq(index).val(id);
				winnerData[index].id = id;
			})
//		})
	});
	//修改服务费
	$('#winnerList').on('click','.btnRevise, .btnService',function(){
		var dataIndex = $(this).attr('data-index');
		var dataType = $(this).attr('data-type');
		var _this = this;
		parent.layer.prompt({title: '请输入修改金额', formType: 0}, function(money, index){
			var reg = '';
			if(priceUnit==1){
				if(dataType == "pwServiceFee"){
					reg = /^[+-]?\d+(\.\d{1,2})?$/;
				} else {
					reg = /^[+-]?\d+(\.\d{1,6})?$/;
				}
			}else{
				reg = /^[+-]?\d+(\.\d{1,2})?$/;
			}
			if(!reg.test($.trim(money))){
				parent.layer.alert('请正确输入修改金额！')
			}else if(Number(money) < 0){
				parent.layer.alert('请重新输入！')
			}else{
				parent.layer.close(index);
			  	parent.layer.prompt({title: '请输入修改原因', formType: 2}, function(text, index){
			    	parent.layer.close(index);
			    	winnerData[dataIndex].bidSectionId = bidId;
			    	if(dataType == "pwServiceFee"){
			    		winnerData[dataIndex].pwServiceFee = money;
				    	winnerData[dataIndex].pwReson = text;
				    	
			    	} else {
				    	winnerData[dataIndex].newServiceFee = money;
				    	winnerData[dataIndex].reason = text;
				    	for(var i = 0;i<serviceFees.length;i++){
							if(serviceFees[i].supplierId == winnerData[dataIndex].winCandidateId){
								serviceFees[i].newServiceFee = winnerData[dataIndex].newServiceFee
							}
						}
				    	getCount(serviceFees)
			    	}
			    	saveMoney(winnerData[dataIndex],function(id){
			    		if(dataType=="pwServiceFee"){
			    			$(_this).closest('tr').find('.pwServiceFee').html(winnerData[dataIndex].pwServiceFee);
				    		$(_this).closest('tr').find('.pwReson').html(winnerData[dataIndex].pwReson);
			    		} else {
			    			$(_this).closest('tr').find('.reason').html(winnerData[dataIndex].reason);
			    		}
			    		$('#winningBid .winnerItems').eq(dataIndex).val(id);
						winnerData[dataIndex].id = id;
			    		
			    	});
			    	
			  	});
			}
		  	
		});
	})
});


//初始化文件上传
function initUpload(id,index){
	if(!fileUploads){
		fileUploads = new StreamUpload("#fileContent",{
			basePath:"/"+employeeInfo.enterpriseId+"/"+id+"/288",
			businessId: id,
			extFilters: [".pdf", ".cad", ".dwg", ".dxf", ".dwt",  ".png", ".jpg", ".gif", ".bmp"],  
			isPreview:true,
			businessTableName:'T_NOTICE',  //    项目表附件
			attachmentSetCode:'RESULT_NOTICE_FILE',
			changeFile:function(data){
				filedata=data				
			},
			addSuccess:function(path){
				parent.layer.alert('上传成功！');
				var timeArr=[]
				for(var i=0;i<filedata.length;i++){
					var subDate = new Date(filedata[i].createDate).getTime() / 1000;
					timeArr.push({
						time:subDate,
						index:i
					})
					if(filedata[i].url!==path){
						fileUploads.fileDel(i)
					}

				}
				if(filedata.length>1){
				var min = timeArr[0].time
				for(var t = 0; t < timeArr.length; t++) {
					var cur = timeArr[t].time;
					cur <= min ? min = cur : null
				}
				for(var e = 0; e < timeArr.length; e++) {	
					if(min == timeArr[e].time) {
						fileUploads.fileDel(timeArr[e].index)


					}
				}
			}
			}
		});
	}
}

function passMessage(data,callback){
//	var payType = '';
//	if(data.payType	== 1){
//		payType = ' 固定金额';
//	}else if(data.payType	== 2){
//		payType = ' 固定比例';
//	}if(data.payType	== 3){
//		payType = ' 标准累进制';
//	};
//	for(var key in data){
//		$('#'+key).val(data[key]);
//		$('#payType').val(payType);
//		$("#tenderProjectType").val(getOptionValue('tenderProjectType',data.tenderProjectType));
//	};
//	tenderProjectClassifyCode = data.tenderProjectClassifyCode
//	winnerPayType = data.payType;
//	if(data.payMoney){
//		payMoney = data.payMoney;
//	};
//	if(data.discount){
//		$('#isCount').val('是');
//		discount = data.discount;
//	}else{
//		discount = 1;
//	}
//	if(data.payRatio){
//		payRatio = data.payRatio;
//	}
	
	
	/*保存*/
	$('#btnSave').click(function(){
		save(1,false,callback);
	})
	/*提交*/
	$('#btnSubmit').click(function(){
		resultNoticeCheckSatisfaction('4', '', bidId, function(){//满意度评价
			var idArr = [];
			var ele = '';
						
						
						for(var i = 0;i<isWinCount;i++){
				var bidPrice = $("#bidPrice" + i).val();
				if(!bidPrice){
					parent.layer.alert('温馨提示：中标价不能为空！', { icon: 5, title: '提示' });
					return;
				}
			}
			for(var i = 0;i<winnerData.length;i++){
				if(!winnerData[i].editState){
					idArr.push(winnerData[i].winCandidateName);
					ele = $('#collapseThree');
				}
			}
			for(var j = 0;j<failData.length;j++){
				if(!failData[j].editState){
					idArr.push(failData[j].winCandidateName);
					ele = $('#collapseFour');
				}
			}
			if(idArr.length>0){
				var msg = idArr.join('、')
				parent.layer.alert(msg+'还未编辑通知书！',{icon:7,title:'提示'},function(ind){
					parent.layer.close(ind);
					ele.collapse('show');
				})
			}else{
				if(checkForm($("#addNotice"))){//必填验证，在公共文件unit中
					if($("#addChecker").length <= 0){
						parent.layer.confirm('此流程未设置审批人，提交后将自动审核通过，是否确认提交', {
							title: '提交审核',
							btn: [' 是 ', ' 否 '],
							yes: function(layero, index) {
								getEvaluate(bidId, function(){
							        sendMessage(bidId,callback,index);
						        })
							},
							btn2:function(index, layero) {
								parent.layer.close(index);
							}
						})
					}else{
						parent.layer.alert('确认提交审核？',function(index){
							parent.layer.close(index);
						    getEvaluate(bidId, function(){
						  	    sendMessage(bidId,callback,index);
						    })
					    })
					}
				}
			}
		})
	})
	$("#winningBid").on('click','.btn_uplode',function(){
		var noticeId = $(this).closest('td').find('.winnerItems').val();
		var indexs = $(this).attr('data-index');
		if(!(winnerData[indexs].isCompile)){
			initUpload(noticeId,indexs);
			fileUploads.fileList();
			$('#fileLoad').trigger('click');
		}
	})
	//中标通知书编辑
	$("#winningBid").on('click','.btn_edit',function(){
		var indexs = $(this).attr('data-index');
		//黑名单验证
		var parm = checkBlackList(winnerData[indexs].winCandidateCode,tenderProjectClassifyCode,'d');
		if(parm.isCheckBlackList){
			parent.layer.alert(parm.message, {icon: 7,title: '提示'});
			return;
		}
		var toChild = {};//传给子级，子级提交时要保存的数据
		var noticeId = $(this).closest('td').find('.winnerItems').val();
		if(noticeId && noticeId != ''){
			toChild.id = noticeId;
		}
		toChild.bidSectionId = bidId;
		toChild.calculation = winnerData[indexs].calculation;	
		toChild.serviceFee = winnerData[indexs].serviceFee;	
		toChild.newServiceFee = winnerData[indexs].newServiceFee;	
    	toChild.isWinBidder = 1;
    	if(!winnerData[indexs].supplierId){
    		winnerData[indexs].supplierId = winnerData[indexs].winCandidateId
    	}
    	toChild.winCandidateId = winnerData[indexs].winCandidateId;
    	toChild.resultNotic = '';
    	toChild.bidPrice = winnerData[indexs].bidPrice;
    	toChild.priceCurrency = winnerData[indexs].priceCurrency;
		toChild.priceUnit = winnerData[indexs].priceUnit;
		if(winnerData[indexs].isCompile!=undefined){
			toChild.isCompile = winnerData[indexs].isCompile;
		}
		// if(winnerData[indexs].resultNotic!=undefined){
		// 	toChild.contents=winnerData[indexs].resultNotic
		// }
    	if(specialData){
    		toChild.pwServiceFee = winnerData[indexs].pwServiceFee;
    		toChild.pwReson = winnerData[indexs].pwReson ? winnerData[indexs].pwReson : "";
    	}
		var titles = '';
		titles = '编辑中标通知书'
		if(publicId == ''){
			save(0,false,callback,function(){
				toChild.resultNotice = publicId;
				openEdit(indexs,toChild,refreshCurrent, 1);
			})
		} else {
			toChild.resultNotice = publicId;
			openEdit(indexs,toChild,refreshCurrent, 1);
		}
		// }
	
		
		
	});
	$("#failBid").on('click','.btn_uplode',function(){
		var noticeId = $(this).closest('td').find('.failItems').val();
		var indexs = $(this).attr('data-index');
		if(!(failData[indexs].isCompile)){
			initUpload(noticeId,indexs);
			fileUploads.fileList();
			$('#fileLoad').trigger('click');
		}
	})
	
	//落标通知书编辑
	$("#failBid").on('click','.btn_edit',function(){
//		save(0)
		var indexs = $(this).attr('data-index');
		var toChild = {};//传给子级，子级提交时要保存的数据
		var noticeId = $(this).closest('td').find('.failItems').val();
		if(noticeId && noticeId != ''){
			toChild.id = noticeId;
		}
		
		toChild.bidSectionId = bidId;
//		toChild.resultNotice = publicId;
    	toChild.isWinBidder = 0;
    	if(!failData[indexs].supplierId){
    		failData[indexs].supplierId = failData[indexs].winCandidateId
    	}
    	toChild.winCandidateId = failData[indexs].winCandidateId;
    	toChild.resultNotic = '';
    	toChild.bidPrice = failData[indexs].bidPrice;
    	toChild.priceCurrency = failData[indexs].priceCurrency;
		toChild.priceUnit = failData[indexs].priceUnit;
		if(failData[indexs].isCompile!=undefined){
			toChild.isCompile = failData[indexs].isCompile;
		}
		// if(failData[indexs].resultNotic!=undefined){
		// 	toChild.contents=failData[indexs].resultNotic
		// }
		var titles = '';
		titles = '编辑结果通知书'
		console.log(toChild);
		if(publicId == ''){
			save(0,false,callback,function(){
				toChild.resultNotice = publicId;
				openEdit(indexs,toChild,refreshCurrent, 0);
			})
		} else {
			toChild.resultNotice = publicId;
			openEdit(indexs,toChild,refreshCurrent, 0);
		}
		// }
	

	});
	
	
	
	
	
	
	
	if(data.getForm == 'KZT'){
		bidId = data.id;
	}else{
		bidId = data.bidSectionId;//标段id
	}
	var proData = findProjectDetail(bidId);
	specialService(proData);
	examType = data.examType;
	reviseDetail(bidId,data.examType);
	//审核
	$("#approval").ApprovalProcess({
		url: top.config.tenderHost,
		businessId:publicId, 
		status:1,
		type:"zbjgtz",
	});
//	if(data.id){
//		reviseDetail(publicId);//修改时信息反显
//	}else{
//		getTender(data,winnerPayType,tenderProjectClassifyCode,discount)
//	}
};
function openEdit(indexs,toChild,refreshCurrent, isWin){
	var titles = "";
	if(isWin == 1){
		titles = "编辑中标通知书";
	} else {
		titles = "编辑结果通知书";
	}
	parent.layer.open({
		type: 2
		,title:titles
		,area: ['100%','100%']
		,resize: false
		,content: editHtml+'?isWin=' + isWin
		,closeBtn:0
		,success:function(layero,index){
    	    var iframeWind=layero.find('iframe')[0].contentWindow; 
//	  	    	iframeWind.editor.txt.html(texts);
  	    	
  	    	iframeWind.saveModel(indexs,toChild,refreshCurrent);
        }
	})
}
function refreshCurrent(id,ind,isWinner,isEdit){
	//if(isEdit==3){
		reviseDetail()
	//}
	if(isWinner == 1){
		if(isEdit == 1){
			$('#winningBid .tbody').eq(ind).find('.states').html('<span style="color:green">已编辑</span>');
			winnerData[ind].editState = '1';
		}
		$('#winningBid .tbody').eq(ind).find('.winnerItems').val(id);
		winnerData[ind].id = id;
		
	}else if(isWinner==0){
		if(isEdit == 1){
			$('#failBid .fail_tbody').eq(ind).find('.states').html('<span style="color:green">已编辑</span>');
			failData[ind].editState = '1';
		}
		$('#failBid .fail_tbody').eq(ind).find('.failItems').val(id);
		failData[ind].id = id;
		
	}
}
/*保存
	 * isCheck:0 不提示保存 1提示保存
	 */
function saveForm(param, isCheck,submit,callback,back){
	$.ajax({
		type:"post",
		url: saveUrl,
		async:false,
        dataType: "json",//预期服务器返回的数据类型
        data: param,
        success: function(data){
        	if (data.success) {
        		publicId = data.data;
        		if(callback){
        			callback()
        		}
        		if(back){
        			back()
        		}
//      		parent.$('#tableList').bootstrapTable('refresh');
        		
        		if(isCheck == 1){
        			parent.layer.alert("保存成功！", {icon: 6,title: '提示'});
        		}
        		if(submit){
        			parent.layer.alert("提交成功！", {icon: 6,title: '提示'});
        			var index=parent.layer.getFrameIndex(window.name);
            		parent.layer.close(index);
        		}
    		}else{
            	parent.layer.alert(data.message, {icon: 5,title: '提示'});
            }
        },
        error: function() {
        	if(isCheck == 1){
				parent.layer.alert("保存失败！", {icon: 5,title: '提示'});
			}
        }
	});
};
/*保存
 * isCheck:0 不提示保存 1提示保存
 */
function save(isCheck,submit,callback,back){
	if(submit){
		if(!CAcf){
			CAcf = new CA({
				target:"#addNotice",
				confirmCA:function(flag){ 
					if(!flag){  
						return;
					}
					var param = parent.serializeArrayToJson($("#addNotice").serializeArray());;
					if(publicId != ''){
						param.id = publicId;
					};
					param.isSubmit = 1;
					param.examType = 2;
					saveForm(param, isCheck,submit,callback,back);
				}
			});
		}
		CAcf.sign();
	} else {
		var param = parent.serializeArrayToJson($("#addNotice").serializeArray());;
		if(publicId != ''){
			param.id = publicId;
//			param =$.param({'id':publicId}) + '&' +$('#addNotice').serialize();
		};
		if(submit){
			param.isSubmit = 1;
		};
		param.examType = 2;
		saveForm(param, isCheck,submit,callback,back);
	}
	
	
};

//新增时获取候选人信息
function getTender(data,type,code,discount){
	$.ajax({
		type:"post",
		url:tenderUrl,
		async:true,
		data: {
			'bidWinNoticeId': data.bidWinNoticeId,
			'bidSectionId': data.bidSectionId,
		},
		success: function(res){
			if(res.success){
				var candidateData = res.data;
				priceUnit = candidateData[0].priceUnit;
				$('#priceUnit').val(candidateData[0].priceUnit);
				$('#priceCurrency').val(candidateData[0].priceCurrency);
				for(var i = 0;i<candidateData.length;i++){
					if(candidateData[i].isWinBidder == 1){
						winnerData.push(candidateData[i])
					}else{
						failData.push(candidateData[i])
					}
				};
				
				serviceFees = [];
				if(winnerData.length > 0){
					for(var i = 0;i<winnerData.length;i++){
						var obj = {};
						obj.winPrice = winnerData[i].bidPrice;
						obj.priceUnit = winnerData[i].priceUnit;
						obj.supplierId = winnerData[i].winCandidateId;
						obj.supplierName = winnerData[i].winCandidateName;
						obj.tenderProjectType = data.tenderProjectType;
						obj.discount = discount;
						obj.payType = data.payType;
						//固定金额的金额
						if(data.payMoney){
							obj.payMoney = data.payMoney;
						}
						//固定比例的比例
						if(data.payRatio){
							obj.payRatio = data.payRatio;
						}
						if(data.tenderProjectType){
							obj.countType = '1';
						}
						serviceFees.push(obj);
					}
				}
				getCount(serviceFees);
				winnerNoticeHtml(winnerData);
				failNoticeHtml(failData,winnerData.length)
				
			}
		}
	});
};
//获取计算结果
function getCount(arr){
	$.ajax({
		type:"post",
		url:countUrl,
		async:false,
		data: {
			serviceFees: arr
		},
		success: function(data){
			if(data.success){
//				console.log(winnerData);
//				console.log(data.data);
				for(var i = 0;i<winnerData.length;i++){
					for(var j = 0;j<data.data.serviceFeeDtos.length;j++){
						if(winnerData[i].winCandidateId == data.data.serviceFeeDtos[j].supplierId){
							winnerData[i].serviceFee = data.data.serviceFeeDtos[j].serviceFee;
							winnerData[i].newServiceFee = data.data.serviceFeeDtos[j].newServiceFee;
							winnerData[i].process = data.data.serviceFeeDtos[j].process;
							winnerData[i].serviceFeeAll = data.data.serviceFeeAll;
						}
					}
				}
				setWinner(winnerData,arr[0].payType,arr[0].tenderProjectType,arr[0].discount);
			}else{
				parent.layer.alert(data.message)
			}
		}
	});
}
/*中标人
 * data：中标人数据
 * type：缴纳方式 1. 固定金额、2.固定比例、3标准累进制
 * code：标段类型  A 工程 B 货物 C 服务
 * discount： 优惠系数
 * changeValue： 选取的费用计算规则
 */

function setWinner(data,type,code,discount,changeValue){
	var unit = '';
	var multiple = 1;//取整时的倍数 万元 10000 、元 1
//	var multiple = 1;
	if(data[0].priceUnit == 1){
		unit = '（万元/人民币）';
		multiple = 10000;
		$("#priceUnitTxt").html("万元");
	}else if(data[0].priceUnit == 0){
		unit = '（元/人民币）';
		$("#priceUnitTxt").html("元");
	} 
	/* if(bidderPriceType == 1){
		if(data[0].priceUnit == 0){
			unit = '（元/人民币）';
			$("#priceUnitTxt").html("元");
		}else if(data[0].priceUnit == 1){
			unit = '（万元/人民币）';
			multiple = 10000;
			$("#priceUnitTxt").html("万元");
		};
	}else if(bidderPriceType == 9){
		unit = '（'+rateUnit+'）';
		$("#priceUnitTxt").html(rateUnit);
	} */
	
	if(data[0].priceCurrency == "156"){
		$("#priceCurrencyTxt").html("人民币");
	}
	var html = '';
	$('#winnerList').html('');
	html = '<tr>'
		+'<th style="min-width: 50px;text-align: center;">序号</th>'
		+'<th style="min-width: 200px;text-align: left;">中标人名称</th>';
	if(bidderPriceType == 9){
		html +=	'<th style="width: 150px;text-align: left;">'+rateName+'('+rateUnit+')'+'</th>'
	}
	/* var serviceUnit = '';
	if(type == 1){
		serviceUnit ='（元/人民币）';
	}else{
		serviceUnit = unit;
	}
	 */
	html +=	'<th style="width: 150px;text-align: left;">中标价'+unit+'</th>'
		+'<th style="width: 200px;text-align: center;">选取费用计算规则</th>'
		+'<th style="width: 150px;text-align: left;">中标服务费'+unit+'</th>'
		+'<th style="width: 150px;text-align: left;">实缴服务费'+unit+'</th>'
		+'<th>修改原因</th>';
	if(specialData && specialData.id){
		html += '<th style="width: 200px;text-align: center;">平台服务费（元/人民币）</th>';
		html += '<th>平台服务费修改原因</th>';
	}
	html += '<th style="min-width: 230px;text-align: center;">操作</th></tr>';
	
	var totalMoney = 0 ;//总费用
	var countProcess = '';//计算过程
	var countProcessArr = [];//计算过程
	var specialMoney;  //特殊平台服务费
	for(var i = 0;i<data.length;i++){
		isWinCount = data.length; 
		var options = '';
		var price = Number(data[i].bidPrice);//中标价
		var lastFee = '';//优惠后服务费用
		if(specialData){
			specialMoney = specialPriceChange(data[i].bidPrice, data[i].priceUnit);
			if(data[i].pwServiceFee == undefined && data[i].pwServiceFee != 0){
				winnerData[i].pwServiceFee = specialMoney;
//				data[i].pwServiceFee = specialMoney;
			}
		}
		
		if(type == 1){
//			data[i].serviceFee = payMoney;
			options = '固定金额'
		}else if(type == 2){
//			data[i].serviceFee = (Math.ceil(Number(data[i].bidPrice*multiple)*payRatio))/(100*multiple);
			options = '固定比例'
		}else if(type == 3){
			if(code.indexOf('A') != -1){
				if(data[i].calculation == 1 || !data[i].calculation){
					countType = '1';
					options = '<select class="form-control payType" name="" data-index="'+i+'">'
					+'<option value="1">工程标准收费费率</option>'
					+'<option value="4">服务标准收费费率</option>'
					+'</select>';
				}else if(data[i].calculation == 4){
					countType = '4';
					options = '<select class="form-control payType" name="" data-index="'+i+'">'
					+'<option value="1">工程标准收费费率</option>'
					+'<option value="4" selected>服务标准收费费率</option>'
					+'</select>';
				}
				
			}else if(code.indexOf('B') != -1){
				countType = '1';
				options = '<select class="form-control payType" name="" ><option value="1">货物标准收费费率</option></select>';
				
			}else if(code.indexOf('C') != -1){
				
				options = '<select class="form-control payType" name="" data-index="'+i+'">'
					+'<option value="4">服务标准收费费率</option>'
					+'<option value="1">广告标准费率</option>'
					+'<option value="2">非广告标准费率</option>'
					+'<option value="3">日产收费标准</option></select>';
				if(data[i].calculation == 4 || !data[i].calculation){
					countType = '4';
					options = '<select class="form-control payType" name="" data-index="'+i+'">'
					+'<option value="4">服务标准收费费率</option>'
					+'<option value="1">广告标准收费费率（旧）</option>'
					+'<option value="2">非广告标准收费费率（旧）</option>'
					+'<option value="3">日产收费标准</option></select>';
					
				}else if(data[i].calculation == 1){
					countType = '1';
					options = '<select class="form-control payType" name="" data-index="'+i+'">'
					+'<option value="4">服务标准收费费率</option>'
					+'<option value="1" selected>广告标准收费费率（旧）</option>'
					+'<option value="2">非广告标准收费费率（旧）</option>'
					+'<option value="3">日产收费标准</option></select>';
					
				}else if(data[i].calculation == 2){
					countType = '2';
					options = '<select class="form-control payType" name="" data-index="'+i+'">'
					+'<option value="4">服务标准收费费率</option>'
					+'<option value="1">广告标准收费费率（旧）</option>'
					+'<option value="2" selected>非广告标准收费费率（旧）</option>'
					+'<option value="3">日产收费标准</option></select>';
					
					
				}else if(data[i].calculation == 3){
					countType = '3';
					options = '<select class="form-control payType" name="" data-index="'+i+'">'
					+'<option value="4">服务标准收费费率</option>'
					+'<option value="1">广告标准收费费率（旧）</option>'
					+'<option value="2">非广告标准收费费率（旧）</option>'
					+'<option value="3" selected>日产收费标准</option></select>';
					
				}
				
			}
			
			
		};
		
		/* if(!data[i].bidPrice){
			data[i].bidPrice = '';
		} */
		var input = "";
		/* if(bidderPriceType == 1){
			input = '<input type="text" class="form-control" name="" value="'+data[i].bidPrice+'" onblur="updateBidPrice()" id="bidPrice"/>';
		}else if(bidderPriceType == 9){
			input = '<input type="text" class="form-control" name="" onblur="updateBidPrice()" id="bidPrice"/>';
		} */
		var supId =data[i].supplierId?data[i].supplierId:data[i].winCandidateId;
		input = '<input type="text" class="form-control" name="" value="'+((data[i].bidPrice || data[i].bidPrice == 0)?data[i].bidPrice:"")+'" onblur=updateBidPrice("' +i+ '","' +data[i].id+ '","' +supId+ '","' +priceUnit+ '") id="bidPrice'+i+'"/>';
		
		countProcess += '<div style="padding: 5px 0;">'+data[i].process+'</div>';
		countProcessArr.push(data[i].process);
		html += '<tr>'
			+'<td style="width: 50px;text-align: center;">'+(i+1)+'</td>'
			+'<td style="min-width: 200px;text-align: left;">'+showBidderRenameMark(data[i].winCandidateId, data[i].winCandidateName, RenameData, 'addNotice')+'<input type="hidden" name="" value="'+data[i].winCandidateId+'"/></td>'
		if(bidderPriceType == 9){
			html +=	'<td style="width: 150px;text-align: right;">'+data[i].otherBidPrice+'</td>'
		}	
		html +='<td style="width: 150px;text-align: right;">'+input+'</td>'
			+'<td style="width: 200px;text-align: center;">'+options+'</td>'
			+'<td style="width: 150px;text-align: right;" class="serviceMoney">'+data[i].serviceFee+'</td>'
			+'<td style="width: 150px;text-align: right;" class="payMoney">'+data[i].newServiceFee+'</td>'
			+'<td style="width: 200px;text-align: center;" class="reason">'+(data[i].reason?data[i].reason:'')+'</td>';
		if(specialData){
			html += '<td style="width: 200px;text-align: center;" class="pwServiceFee">'+(data[i].pwServiceFee?data[i].pwServiceFee:"")+'</td>'
				+'<td style="width: 200px;text-align: center;" class="pwReson">'+(data[i].pwReson?data[i].pwReson:'')+'</td>';
		}
		html += '<td style="width: 100px;text-align: center;">';
		if(specialData){
			html += '<button  type="button" class="btn btn-primary btn-xs btnService" data-index="'+i+'" data-type="pwServiceFee"><span class="glyphicon glyphicon-edit"></span>修改平台服务费</button>';
		}
		html += '<button  type="button" class="btn btn-primary btn-xs btnRevise" data-index="'+i+'" data-type="newServiceFee"><span class="glyphicon glyphicon-edit"></span>修改服务费</button>'
			+'</td>'
			
		+'</tr>';
	};
	//总服务费
	$('#countProcess').html(countProcess);
	$('#rules').val(countProcessArr.join(','));
	$('#serviceFeeAll').val(data[0].serviceFeeAll)
	
	
	$(html).appendTo('#winnerList');
};

function updateBidPrice(i,id,supplierId,priceUnit){
	var bidPrice = $("#bidPrice"+i).val();
	var rateNum;
	
	if(priceUnit && priceUnit == 1){
		rateNum = 6;
	}else if(priceUnit && priceUnit == 0){
		rateNum = 2;
	} 
	
	var reg =  new RegExp("^[+-]?\\d+(\\.\\d{1,"+rateNum+"})?$","gim");
	 if(!reg.test(bidPrice)){
		$("#bidPrice"+i).val('');
		parent.layer.alert("温馨提示：请输入正确金额！", { icon: 5, title: '提示' });
		return;
	}
	if(!bidPrice){
		parent.layer.alert('温馨提示：中标价不能为空！', { icon: 5, title: '提示' });
		return;
	}
	if(!publicId){
		save(1,false);
	}
	$.ajax({
		type: "post",
		url: updatePriceUrl,
		async: true,
		data: {
			'id': id,
			'resultNotice':publicId,
			'bidSectionId':bidId,
			'supplierId':supplierId,
			'bidPrice':bidPrice,
		},
		success: function (data) {
			if (data.success) {
				reviseDetail(bidId,2);
			} else {
				parent.layer.alert('修改中标价失败!', { icon: 5, title: '提示' });
			}
		}
	});
}


//计算过程
function process(dom){
	var  procedureArr = dom.split(',');
	var procedure = '';
	for(var i = 0;i<procedureArr.length;i++){
		procedure += '<div style="padding: 5px 0;">'+procedureArr[i]+'</div>'
	}
	return procedure
}
//中标通知
function winnerNoticeHtml(data){
	
	$('#winningBid').html('');
	var html = "";
	var filesType
	html = '<tr>'
		+'<th style="width: 50px;text-align: center;">序号</th>'
		+'<th>投标人名称</th>'
		+'<th style="width: 100px;text-align: center;">中标情况</th>'
		+'<th style="width: 100px;text-align: center;">状态</th>'
		+'<th style="width: 150px;text-align: center;">操作</th>'
	+'</tr>';
	for(var i = 0;i<data.length;i++){
		if(data[i].id){
			if(data[i].resultNotic){
				winnerData[i].editState = 1
			}else if(!(data[i].isCompile)){
				winnerData[i].editState = 1
			}
		}else{
			winnerData[i].editState = ""	
		}
		// data[i].resultNotic ? winnerData[i].editState = 1 : "";
		if(data[i].isCompile==undefined||data[i].isCompile){
			html += "<tr data-id='"+data[i].winCandidateId+"' class='tbody'>"
				+"<td style='width: 50px;text-align: center;'>"+(i+1)+"</td>"
				+"<td>"+showBidderRenameMark(data[i].winCandidateId, data[i].winCandidateName, RenameData, 'addNotice')+"</td>"
				+"<td style='width: 100px;text-align: center;'>是</td>"
				+"<td style='width: 150px;text-align: center;' class='states'>"+(data[i].resultNotic?'<span style="color:green;">已编辑</span>':'未编辑')+"</td>"
				+"<td style='width: 150px;text-align: center;'>"
					+"<input type='hidden' class='winnerItems'  name='resultNoticeItems["+i+"].id' value='"+(data[i].id?data[i].id:'')+"'/>"
					+"<button type='button' class='btn btn-primary btn-sm btn_edit'  data-index='"+i+"'><span class='glyphicon glyphicon-edit'></span>编辑</button>"
					+"<button type='button' class='btn btn-primary btn-sm btn_view' data-index='"+i+"'><span class='glyphicon glyphicon-eye-open'></span>预览</button>"
				+"</td>"
			+"</tr>";
		}else{
			html += "<tr data-id='"+data[i].winCandidateId+"' class='tbody'>"
			+"<td style='width: 50px;text-align: center;'>"+(i+1)+"</td>"
			+"<td>"+showBidderRenameMark(data[i].winCandidateId, data[i].winCandidateName, RenameData, 'addNotice')+"</td>"
			+"<td style='width: 100px;text-align: center;'>是</td>"
			+"<td style='width: 150px;text-align: center;' class='states'>"+(!(data[i].isCompile)?'<span style="color:green;">已上传</span>':'未编辑')+"</td>"
			+"<td style='width: 150px;text-align: center;'>"
				+"<input type='hidden' class='winnerItems'  name='resultNoticeItems["+i+"].id' value='"+(data[i].id?data[i].id:'')+"'/>"
				// +"<button type='button' id='fileUp' class='btn btn-primary btn-sm btn_uplode' data-index='"+i+"' class='"+!(data[i].isCompile)+"?none':''><span class='glyphicon glyphicon-editglyphicon'>重新上传</span></button>"
				+"<button type='button' class='btn btn-primary btn-sm btn_edit'  data-index='"+i+"'><span class='glyphicon glyphicon-edit'></span>编辑</button>"
				+"<button type='button' id='fileLoad'  style='display: none;' data-index='"+i+"'></button>"
				+"<button type='button' class='btn btn-primary btn-sm btn_view' data-index='"+i+"'><span class='glyphicon glyphicon-eye-open'></span>预览</button>"
			+"</td>"
		+"</tr>";
		}
	
	};
	$(html).appendTo('#winningBid');

}

/*修改时信息回显*/
function reviseDetail(dataId,type){
	winnerData = [];
	failData = [];
	$.ajax({
		type:"post",
		url:recallUrl,
		data: {
			'examType':2,
			'bidSectionId':bidId
		},
		async:false,
		dataType: 'json',
		success: function(data){
			if(data.success == false){
        		parent.layer.alert(data.message,{icon:7,title:'提示'},function(index){
        			parent.layer.closeAll();
        		});
        		return;
			}		
			if(data.data){
				var dataSource = data.data;
				var payMethod = '';
				if(dataSource.id){
					publicId = dataSource.id;
				}
				if(dataSource.payType	== 1){
					payMethod = ' 固定金额';
					$(".payMoney").show();
				}else if(dataSource.payType	== 2){
					payMethod = ' 固定比例';
					$(".payRatio").show();
				}if(dataSource.payType	== 3){
					payMethod = ' 标准累进制';
				};
				if(dataSource.discount){
					$('#isCount').val('是');
					discount = dataSource.discount;
				}else{
					discount = 1;
					//暂默认回显
					$('#isCount').val('是');
					dataSource.discount = 1;
				};
				for(var key in dataSource){
					if(key == 'isManual'){
						$('[name=isManual]').val([dataSource[key]]);
					}else{
						$("#" + key).val(dataSource[key]);
					}
	            	$("#tenderProjectType").val(getTenderType(dataSource.tenderProjectType));
	            	
	          	};
	          	
	          	tenderProjectClassifyCode = dataSource.tenderProjectClassifyCode
				winnerPayType = dataSource.payType;
				var candidateData = '';
				if(dataSource.resultNoticeItems.length > 0){
					candidateData = dataSource.resultNoticeItems;
				}else{
					candidateData = dataSource.bidWinCandidates
				}
	//			console.log(winnerData)
	          	if(candidateData.length > 0){
	          		// priceUnit = candidateData[0].priceUnit;
	          		for(var i = 0;i<candidateData.length;i++){
						if(candidateData[i].isWinBidder == 1){
							winnerData.push(candidateData[i])
						}else{
							failData.push(candidateData[i])
						}
					};
				  }
	//        	console.log(winnerData)
				
				// $('#priceUnit').val(candidateData[0].priceUnit);
				$('#priceCurrency').val(candidateData[0].priceCurrency);
				$('#payType').val(payMethod);
				if(dataSource.rules){
					$('#countProcess').html(process(dataSource.rules));
				}
				setWinner(winnerData,winnerPayType,dataSource.tenderProjectType,discount);
				serviceFees = [];
				if(winnerData.length > 0){
					for(var i = 0;i<winnerData.length;i++){
						var obj = {};
						obj.winPrice = winnerData[i].bidPrice;
						obj.priceUnit = winnerData[i].priceUnit;
						obj.supplierId = winnerData[i].winCandidateId;
						obj.supplierName = winnerData[i].winCandidateName;
						obj.tenderProjectType = dataSource.tenderProjectType;
						obj.discount = discount;
						obj.payType = dataSource.payType;
						//固定金额的金额
						if(dataSource.payMoney){
							obj.payMoney = dataSource.payMoney;
						}
						//固定比例的比例
						if(dataSource.payRatio){
							obj.payRatio = dataSource.payRatio;
						}
						if(winnerData[i].calculation){
							obj.countType = winnerData[i].calculation;
						}else{
							obj.countType = '1';
						}
						obj.newServiceFee = winnerData[i].newServiceFee;
						serviceFees.push(obj);
					}
				}
				getCount(serviceFees);
				winnerNoticeHtml(winnerData);
				failNoticeHtml(failData,winnerData.length)
			}
			
		},
		error: function (data) {            
			parent.layer.alert("请求失败")      
		},                                   
	});
	
};
//落标通知
function failNoticeHtml(data,len){
	$('#failBid').html('');
	var html = "";
	html = '<tr>'
		+'<th style="width: 50px;text-align: center;">序号</th>'
		+'<th>投标人名称</th>'
		+'<th style="width: 100px;text-align: center;">中标情况</th>'
		+'<th style="width: 100px;text-align: center;">状态</th>'
		+'<th style="width: 150px;text-align: center;">操作</th>'
	+'</tr>';
	for(var i = 0;i<data.length;i++){
		if(data[i].id){
			if(data[i].resultNotic){
				failData[i].editState = 1
			}else if(!(data[i].isCompile)){
				failData[i].editState = 1
			}
		}else{
			failData[i].editState = ""	
		}		
		// data[i].resultNotic ? failData[i].editState = 1 : "";
		if(data[i].isCompile==undefined||data[i].isCompile){	
		html += "<tr class='fail_tbody' data-id='"+data[i].winCandidateId+"'>"
			+"<td style='width: 50px;text-align: center;'>"+(i+1)+"</td>"
			+"<td>"+showBidderRenameMark(data[i].winCandidateId, data[i].winCandidateName, RenameData, 'addNotice')+"</td>"
			+"<td style='width: 100px;text-align: center;'>否</td>"
			+"<td style='width: 150px;text-align: center;' class='states'>"+(data[i].resultNotic?'<span style="color:green;">已编辑</span>':'未编辑')+"</td>"
			+"<td style='width: 150px;text-align: center;'>"
				+"<input type='hidden' class='failItems'  name='resultNoticeItems["+(Number(len)+i)+"].id' value='"+(data[i].id?data[i].id:'')+"'/>"
				+"<button type='button' class='btn btn-primary btn-sm btn_edit' data-index='"+i+"'><span class='glyphicon glyphicon-edit'></span>编辑</button>"
				+"<button type='button' class='btn btn-primary btn-sm btn_view' data-index='"+i+"'><span class='glyphicon glyphicon-eye-open'></span>预览</button>"
			+"</td>"
		+"</tr>";
		}else{
			html += "<tr class='fail_tbody' data-id='"+data[i].winCandidateId+"'>"
			+"<td style='width: 50px;text-align: center;'>"+(i+1)+"</td>"
			+"<td>"+showBidderRenameMark(data[i].winCandidateId, data[i].winCandidateName, RenameData, 'addNotice')+"</td>"
			+"<td style='width: 100px;text-align: center;'>否</td>"
			+"<td style='width: 150px;text-align: center;' class='states'>"+(!(data[i].isCompile)?'<span style="color:green;">已上传</span>':'未编辑')+"</td>"
			+"<td style='width: 150px;text-align: center;'>"
				+"<input type='hidden' class='failItems'  name='resultNoticeItems["+(Number(len)+i)+"].id' value='"+(data[i].id?data[i].id:'')+"'/>"
				// +"<button type='button' id='fileUp' class='btn btn-primary btn-sm btn_uplode' data-index='"+i+"' class='"+!(data[i].isCompile)+"?none':''><span class='glyphicon glyphicon-editglyphicon'>重新上传</span></button>"
				+"<button type='button' class='btn btn-primary btn-sm btn_edit'  data-index='"+i+"'><span class='glyphicon glyphicon-edit'></span>编辑</button>"
				+"<button type='button' id='fileLoad' style='display: none;'></button>"
				+"<button type='button' class='btn btn-primary btn-sm btn_view' data-index='"+i+"'><span class='glyphicon glyphicon-eye-open'></span>预览</button>"
			+"</td>"
		+"</tr>";
		}
	};
	$(html).appendTo('#failBid');
	
};
//修改中标服务费的保存
function saveMoney(data,callback){
	$.ajax({
		type:"post",
		url:reviseMoneyUrl,
		async:false,
		data: data,
		success: function(data){
			if(data.success){
				if(callback){
					callback(data.data)
				}
			}
		}
	});
}
//查询特殊平台服务费
function specialService(proData){
	$.ajax({
		type:"post",
		url:serviceUrl,
		async:false,
		data: {enterpriseId:proData.enterpriseId, agentEnterpriseId:proData.agencyEnterprisId, contractReckonPrice:proData.contractReckonPrice, priceUnit:proData.priceUnit},
		success: function(data){
			if(!data.success){
				top.layer.alert(data.message);
				return;
			}
			if(data.data){
				if(data.data.id){
					specialData = data.data;
				}
			}
			
		}
	});
}

/***
 * 判断平台服务费类型
 * @param {Object} money 中标价
 * 单位全部转换成元，便于计算
 */
function specialPriceChange(money, priceUnit){
	var specialMoney;
	money = Number(money);
	if(priceUnit == 1){
		money = money * 10000;
	}
	if(specialData.isOpen == 2){
		if(specialData.takenMode == 1){
			specialMoney = specialData.chargesValue;
		} else {
			specialMoney = specialData.chargesValue * 0.01 * money;
		}
	}
	return specialMoney;
}

/**********************将标段的Id值发送到后端,判断是否发送短信，如果没有就发送短信，有就不需要发送短信***************/

function sendMessage(bidSectionId,callback,indexs){
	$.ajax({
		type:"post",
	    url: sendMsgUrl,
	    async:false,
	    data:{
			'relationId':bidSectionId,
			'messageType':1,
		},
		success:function(data){
			if(data.success) {
				
				if(data.data){
					
					parent.layer.alert(data.data,{closeBtn: 0}, function(index){
						parent.layer.close(index);
						save(0,true,callback);

									  
					});
				}
				else{
					save(0,true,callback);
				}
				
			}
		}
	});
}
/**********************        根据标段id获取标段相关信息         ********************/
function getBidInfo(id){
	$.ajax({
		type:"post",
		url:bidInfoUrl,
		async:false,
		data: {
			'id': id
		},
		success: function(data){
			if(data.success){
				if(data.data){
					var arr = data.data;
					/* var payType = '';
					if(arr.payType	== 1){
						payType = ' 固定金额';
					}else if(arr.payType	== 2){
						payType = ' 固定比例';
					}if(arr.payType	== 3){
						payType = ' 标准累进制';
					};
					for(var key in arr){
						$('#'+key).val(arr[key]);
						$('#payType').val(payType);
						$("#tenderProjectType").val(getOptionValue('tenderProjectType',arr.tenderProjectType));
					};
					tenderProjectClassifyCode = arr.tenderProjectClassifyCode
					winnerPayType = arr.payType;
					if(arr.payMoney){
						payMoney = arr.payMoney;
					};
					if(arr.discount){
						$('#isCount').val('是');
						discount = arr.discount;
					}else{
						discount = 1;
					}
					if(arr.payRatio){
						payRatio = arr.payRatio;
					} */
					bidderPriceType = arr.bidderPriceType;
					rateUnit = arr.rateUnit;
					rateRetainBit = arr.rateRetainBit;
					rateName = arr.rateName;
					tenderProjectType = arr.tenderProjectType;
					priceUnit = arr.priceUnit;
					$('#priceUnit').val(priceUnit);
				}
			}else{
				top.layer.alert(data.message)
			}
		}
	});
}
/* *********************************     专家履职评价是否完成     ******************************** */
function getEvaluate(id,callback){
	$.ajax({
		type:"post",
		url:isEvaluateUrl,
		async:true,
		data: {
			'bidSectionId': id
		},
		success: function(data){
			if(data.success){
				if(data.data && data.data == 1){
					callback()
				}else{
					top.layer.alert('温馨提示：评委履职情况评价表还未完成！')
				}
			}else{
				top.layer.alert('温馨提示：'+data.message)
			}
		}
	});
}