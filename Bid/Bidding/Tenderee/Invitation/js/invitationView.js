
/**

*  查看公告
*  方法列表及功能描述
*/

var viewUrl = config.tenderHost + "/BidInviteController/getbiderInviteInfo.do";	//查看地址
var replyUrl = config.tenderHost + '/BidInviteController/confirmReply.do';//供应商回复

var pageDownList= 'Bidding/BidFile/BidFileGet/model/FileDownloadList.html';//下载列表
var pageLinkEdit ='Bidding/BidFile/BidFileGet/model/DownloadLinkEdit.html';//采集个人信息
var payView= 'Bidding/BidFile/BidFileGet/model/PayFormChoose.html'; //缴费
var urlSignSupplier = config.tenderHost+'/SupplierSignController/findSupplierSignInfo.do';//供应商报名信息记录i--标段查询分页接口
var checkMessageUrl = config.Syshost + '/SupplierServiceChargeController/checkMessage.do';  //供应商缴纳平台服务费验证
var getProjectDetailUrl = config.tenderHost + '/TenderProjectController/findTenderProjectType.do';  //获取招标项目，标段基本信息

var fileDownload = config.FileHost + "/FileController/download.do";	//下载文件
var fullScreen = 'Bidding/BidNotice/Notice/model/fullScreenView.html';//全屏查看页面

var historyView = 'Bidding/Tenderee/Invitation/model/historyView.html';//查看历史邀请函
var historyUrl = config.tenderHost + '/BidInviteController/getTendererHistoryList.do';//投标人查看历史邀请
//var printHtml = 'Bidding/Tenderee/Invitation/model/print.html';//打印
var fileUploads = null; //文件上传
var timeState = '';//	邀请函是否结束 当前时间大于邀请函截止时间 为0 小于邀请函截止时间为1
var replyState = "";  //回复状态0为未确认 1为放弃投标 2为同意投标
//var signState;  //报名状态
var nowData = top.$('#systemTime').html() + " " + top.$('#sysTime').html();//当前时间
var startTime = '';//文件获取开始时间
var endTime = '';//文件获取截止时间
var bidSectionId = ''; //标段id
var bidFileId; //招标文件id
var projectId;
var getFileType = 1;//报名方式 1 线上  2 线下
var id = '';//邀请函id
var bidInviteId = '';
var proData;  //招标项目标段基本信息
var callback;
var tenderProjectType;
var isGather = false;
$(function(){
	
	new UEditorEdit({
		uploadServer: top.config.tenderHost,
		pageType: 'view',
		contentKey: 'bidInviteIssueContent'
	});
	
	bidSectionId = $.getUrlParam('id');//邀请函id
//	var bidInviteId = $.getUrlParam('bidInviteId');//邀请函原始id
//	var signState = $.getUrlParam('signState');//邀请函原始id
//	getFileType = $.getUrlParam('getFileType');
//	var replyState = $.getUrlParam('replyState');//回复状态
//	$('[name="bidInviteId"]').val(id);
	if($.getUrlParam('special') && $.getUrlParam('special') != undefined){
		if($.getUrlParam('special') =='VIEW'){
			$('.makeKnown').remove();
		}
	}
	if($.getUrlParam('timeState') && $.getUrlParam('timeState') != undefined){
		timeState = $.getUrlParam('timeState');
		if(timeState == 0){//时间状态 0为邀请回复截止时间小于当前时间 1为邀请回复截止时间大于当前时间
			$('.makeKnown').hide();
			$('.signState').hide();
			$('#endDate').hide();
			$('#btnClose').html('<span class="glyphicon glyphicon-remove"></span>关闭');
		}
	}
	
	/*关闭*/
	$("body").on("click", '#btnClose', function(){
		var index=parent.layer.getFrameIndex(window.name);
        parent.layer.close(index);
	});
	
	/*打印*/
	$("body").on("click", "#btnPrint", function(){
		var oldContent = $("body").html();
		preview(1,oldContent)
	});
	
	$.ajax({
		type:"post",
		url:viewUrl,
		async:false,
		data: {
			'bidSectionId':bidSectionId,
			'examType': '2'
		},
		dataType: "json",//预期服务器返回的数据类型
		success: function(data){
			
			if(data.success == false){
        		parent.layer.alert(data.message);
        		return;
        	}
			var dataSource = data.data;
			id = dataSource.id;
			$('[name="bidInviteId"]').val(dataSource.inviteId);
			bidInviteId = dataSource.inviteId;
			startTime = dataSource.docGetStartTime;//文件获取开始时间
			endTime = dataSource.docGetEndTime;//文件获取截止时间
			bidFileId = dataSource.bidDocClarifyId;//文件id
			projectId = dataSource.projectId;
			if(!fileUploads){
				fileUploads = new StreamUpload("#fileContent",{
					businessId: dataSource.id,
					status:2
				});
			}
			//文件回显
			if(dataSource.projectAttachmentFiles && dataSource.projectAttachmentFiles.length > 0){
				fileUploads.fileHtml(dataSource.projectAttachmentFiles);
			}else{
				$('#fileContent').html('无')
			}
			for(var key in dataSource){
            	$("#" + key).html(dataSource[key]);
          	}
			$('#endDate').html('购标截止时间：'+dataSource.docGetEndTime);
			
			if(dataSource.states == 1){//标段状态 0.编辑 1.生效 2.撤回 3.招标完成 4.流标 5.重新招标
				if(dataSource.replyState && dataSource.replyState == 2){//回复状态 接受/拒绝 0为未确认 1为放弃投标 2为同意投标
					$('.makeKnown').hide();
					$('.signState').show();
					$('#endDate').show();
				}else if(dataSource.replyState && dataSource.replyState == 1){
					$('.makeKnown').hide();
					$('.signState').hide();
					$('#endDate').hide();
				}else{
					$('.makeKnown').show();
					$('.signState').hide();
					$('#endDate').hide();
					$('#btnClose').html('<span class="glyphicon glyphicon-remove"></span>关闭');
				}
				if(GetTime(nowData) > GetTime(dataSource.answersEndDate)){//当前时间大于邀请函回复截止时间
					$('.makeKnown').hide();
					$('.signState').hide();
					$('#endDate').hide();
					$('#btnClose').html('<span class="glyphicon glyphicon-remove"></span>关闭');
				}
			}else{
				$('.makeKnown').hide();
				$('.signState').hide();
				$('#endDate').hide();
			}
			if(dataSource.signUpType == 2){//报名方式   1.线上报名    2.线下报名
				$('.signState').hide();
			}
			
			mediaEditor.setValue(dataSource);
//			$('#bidInviteIssueContent').html(dataSource.bidInviteIssueContent);
			
		},
		error: function(){
			parent.layer.alert("数据加载失败！");
		}
	});
	/*邀请函历史*/
	$.ajax({
		type:"post",
		url:historyUrl,
		async:true,
		data: {
			'inviteId':bidInviteId,	//原始邀请函id
			'notId':id		//需要过滤的id
			
		},
		dataType: "json",//预期服务器返回的数据类型
		success: function(data){
			if(data.success){
				historyTable(data.data);
			}
		},
		error: function(){
			parent.layer.alert("数据加载失败！");
		}
	});
})	
//获取列表信息
function passMessage(data,callbackParm){
	callback = callbackParm;
	tenderProjectType = data.tenderProjectType;
	$('#interiorBidSectionCode').html(data.interiorBidSectionCode)
	$('#bidSectionName').html(data.bidSectionName);
	//同意投标
	$("body").on("click", '#btnAgree', function(){
		//黑名单验证
		var parm = checkBlackList(entryInfo().enterpriseCode,tenderProjectType,'c');
		if(parm.isCheckBlackList){
			parent.layer.alert(parm.message, {icon: 7,title: '提示'});
			return;
		}
		
		parent.layer.confirm('确定同意投标?', {icon: 3, title:'询问'}, function(ind){
			reply('2', id, callback)
		})
	});
	//放弃投标
	$("body").on("click", '#btnGiveUp', function(){
		/* parent.layer.confirm('确定放弃投标?', {icon: 3, title:'询问'}, function(ind){
			reply('1', id, callback)
		}) */
		 //询问框
		parent.layer.open({
			title: '询问',
			icon: 3,
			area: ['500px', '200px'],
			content: '<span style="color: red;font-size:large;font-weight: bold;">警示：</span>'+'<span style="font-size:large;">您现在选择的是</span>'+'<span style="color: red;font-size: large;font-weight: bold;">放弃投标，放弃投标后将可能无法参与本项目后续的任何操作</span>',
			btn:['我再考虑','下决心放弃投标'],
			yes:function(ind,layero){
				parent.layer.close(ind);
			},
			btn2:function(ind,layero){
				parent.layer.open({
					title: '询问',
					icon: 3,
					area: ['500px', '200px'],
					content: '<span style="color: red;font-size:large;font-weight: bold;">警示：最后机会，</span>'+'<span style="font-size:large;">如再次选择</span>'+'<span style="color: red;font-size: large;font-weight: bold;">放弃投标，您将彻底失去参与本项目的投标机会</span>',
					btn:['我再考虑','放弃投标'],
					yes:function(inde,layero){
						parent.layer.close(inde);
					},
					btn2:function(inde,layero){
						reply('1', id, callback)
					}
				});
			}
		});
	});
	//购标
	$("#getFile").click(function(){
		//黑名单验证
		var parm = checkBlackList(entryInfo().enterpriseCode,tenderProjectType,'d');
		if(parm.isCheckBlackList){
			parent.layer.alert(parm.message, {icon: 7,title: '提示'});
			return;
		}
		
		if(GetTime(nowData) > GetTime(startTime) && GetTime(nowData) < GetTime(endTime)){
			if(bidFileId){
				proData = getProjectDetail(bidSectionId);
				checkMessage();
				//getOrder(callback);
			}else{
				parent.layer.alert('温馨提示：该标段还未上传招标文件')
			}
		}else if(GetTime(nowData) < GetTime(startTime)){
			parent.layer.alert('温馨提示：还未到文件获取时间，请确定文件获取开始时间')
		}else if(GetTime(nowData) > GetTime(endTime)){
			parent.layer.alert('温馨提示：文件获取时间已过')
		}
		
	});
	
}

function reply(result, vid, callback){
		var arr = {};
		var replyResut = result;
		arr.inviteState = result;
		arr.bidInviteId = vid;
		$.ajax({
			type: "post",
			url: replyUrl,
			async: true,
			data: arr,
			success: function(data){
				if(data.success){
					parent.layer.alert('回复成功！',{icon:6,title:'提示'},function(index){
						parent.layer.close(index);
					})
					if(replyResut == 2){
						if(getFileType == 1){
							$('.signState').show();
							$('#endDate').show();
						}else{
							$('.signState').hide();
							$('#endDate').hide();
						}
						
					}else if(replyResut == 1){
						$('.signState').hide();
						$('#endDate').hide();
					}
					$('.makeKnown').hide();
					if(callback){
						callback()
					}
//					parent.$('#tableList').bootstrapTable('refresh');
				}else{
					parent.layer.alert(data.message)
				}
			}
		})
//	}
};
function preview(oper,html){
	if (oper < 10){
		$("#gz").css("right","100px");
		bdhtml=window.document.body.innerHTML;//获取当前页的html代码
		sprnstr="<!--startprint"+oper+"-->";//设置打印开始区域
		eprnstr="<!--endprint"+oper+"-->";//设置打印结束区域
		prnhtml=bdhtml.substring(bdhtml.indexOf(sprnstr)+18); //从开始代码向后取html
		prnhtml=prnhtml.substring(0,prnhtml.indexOf(eprnstr));//从结束代码向前取html
		window.document.body.innerHTML=prnhtml;
		window.print();
		window.document.body.innerHTML=bdhtml;
		$("#gz").css("right","10px");
	} else {
		window.print();
	}
	document.body.innerHTML = html;
}

/***
 * 获取招标项目，标段信息
 * @param {Object} id  标段id
 */
function getProjectDetail(id){
	var rst;
	$.ajax({
		type:"post",
		url:getProjectDetailUrl,
		async:false,
		data:{bidSectionId: id},
		success:function(data){
			if(!data.success){
				top.layer.alert('温馨提示：' + data.message);
				return;
			}
			rst = data.data;
		}
	});
	return rst;
}

/***
 * 供应商缴纳平台服务费验证 
 */
function checkMessage(){
	$.ajax({
		type: "post",
		url: checkMessageUrl,
		async: false,
		data:{
			packageId:bidSectionId,
			enterpriseId: (entryData ? entryData.enterpriseId : entryInfo().enterpriseId),
			agentEnterpriseId: proData.agencyEnterprisId,
			contractReckonPrice: proData.contractReckonPrice,
			priceUnit: proData.priceUnit
		},
		success: function(res) {
			if(!res.success) {
				parent.layer.alert('温馨提示：' + res.message);
				return;
			}
			var item = res.data;
			if(item.strKey == null){
				getOrder(callback)
			}else{
				top.layer.confirm('温馨提示：购买<strong>招标</strong>文件后，需缴纳平台服务费（<a style="color: #337ab7;"  href="'+ platformFeeNoticeUrl +'" target="_blank">点击这里查看平台服务费收费标准</a>）才能<strong>下载招标文件。确认要购买招标文件吗？</strong>',{title:'提示'},function(index){
					top.layer.close(index)
					getOrder(callback)
				})
			}
		}
	});
}

//验证是否购买平台服务费
function checkService(isCanDownload, callback){
	checkServiceCost({
		projectId:projectId,
		packId:bidSectionId,
		enterpriseId:entryData ? entryData.enterpriseId : entryInfo().enterpriseId,
		isCanDownload:isCanDownload,
		paySuccess:function(data, isService){
			if(data){
				if(isService){
					getOrder();
				} else {
					if(callback){
						callback();
					} else {
						getOrder();
					}
				}
			} else {
				top.layer.alert("支付失败");
			}
		}
	});
}
function getOrder(callback){
	$.ajax({
         url: urlSignSupplier,//查询存在报名记录
         type: "post",
         data: {packageId:bidSectionId},
         success: function (data) {
         	if(data.success == false){
        		parent.layer.alert(data.message);
        		return;
        	}
         	if(data.success == true){
         		var getData = data.data;
         		if(getData.hasInfo == 1 ){
         			if(getData.canDownload == 1){
//       				checkService(true, function(){ 
	         				var width = top.$(window).width() * 0.7;
							var height = top.$(window).height() * 0.6;
				    		parent.layer.open({
								type: 2,
								title: "招标文件",
								area: [width + 'px', height + 'px'],
								resize: false,
								content: pageDownList+ "?packageId=" + bidSectionId+ '&bidFileId=' + bidFileId,
								success:function(layero, index){
									var iframeWin = layero.find('iframe')[0].contentWindow;
									iframeWin.passMessage({
										projectId:projectId,
										bidSectionId:bidSectionId
									}, isGather);
								}
							});
//						});
         			}else{
         				getGoodsList({enterpriseId:entryData ? entryData.enterpriseId : entryInfo().enterpriseId, packId:bidSectionId}, function(data){
							if(data.success){
								getOrder();
								if(callback){
									callback()
								}
							}
						});
//       				checkService(false);
	         		}
         		} else if(getData.hasInfo == 2){
         			parent.layer.alert("您当前报名未完成，需要报名完成才能获取招标文件");
         		} else{
					var width = top.$(window).width() * 0.6;
					var height = 400;
					parent.layer.open({
						type: 2,
						title: "下载人信息采集",
						area: [width + 'px', height + 'px'],
						resize: false,
						content: pageLinkEdit + "?packageId=" + bidSectionId+ '&bidFileId=' + bidFileId,
						success:function(layero, index){
							var iframeWin = layero.find('iframe')[0].contentWindow;
							iframeWin.getMethod(function(){
								isGather = true;
								getOrder()
							});
						}
					});
         		}
         	}
         },
         error: function (data) {
             parent.layer.alert("加载失败",{icon: 3,title: '提示'});
         }
     });
}
function GetTime(time) {
	var date = new Date(time.replace(/\-/g,"/")).getTime();
	return date;
};

	/*
	 * 查看公告历史详情
	 * 
	 * */
	$('#historyInvalid').on('click','.btnView',function(){
		var historyId = $(this).closest('td').attr('data-notice-id');//历史邀请函ID
		parent.layer.open({
			type: 2,
			title: "邀请函信息",
			area: ['80%', '80%'],
			content: historyView + "?id=" + historyId,
			resize: false,
			success: function(layero, index){
				
			}
		});
	})
	
	// 公告历史表格
	function historyTable(data){
		
		$("#historyInvalid tbody").html('');
		var html='';
		for(var i = 0;i<data.length;i++){
			html = $('<tr>'
			+'<td style="width:50px;text-align:center">'+(i+1)+'</td>'
			+'<td>'+data[i].bidInviteTitle+'</td>'
			+'<td style="width: 200px;text-align:center">'+data[i].bidInviteIssueTime+'</td>'
			+'<td style="width: 100px;text-align:center" data-notice-id="'+data[i].id+'"><button type="button" class="btn btn-primary btn-sm btnView"><span class="glyphicon glyphicon-eye-open"></span>查看</button>'
			+'</td></tr>');
			$("#historyInvalid tbody").append(html);
		}
		
	}