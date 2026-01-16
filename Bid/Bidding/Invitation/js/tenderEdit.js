/**
 *  编辑、添加邀请函
 *  方法列表及功能描述
 */
var saveUrl = config.tenderHost + "/BidInviteController/save.do";	//保存地址
var modelOptionUrl = config.tenderHost + '/WordToHtmlController/findTempBidFileList.do'; //模板下拉框

var haveInfoUrl = config.tenderHost + '/NoticeController/findAllInfoByBidSectionId.do';//相关信息回显
var resiveUrl = config.tenderHost + '/BidInviteController/getInviteByBidId.do';//数据回显接口


var roomOrderHtml = 'Bidding/Invitation/model/roomOrder.html';//预约会议室
var modelUrl = config.tenderHost + '/WordToHtmlController/wordToHtml.do'; //模板地址
var bidDetailHtml = "Bidding/BidIssuing/roomOrder/model/bidView.html"; //查看标段详情页面
var enterprisePage = "Bidding/Model/enterpriseList.html"; //投标人页面
var preBidderHtml = "Bidding/Invitation/model/preEnterpriseList.html"; //预审合格的投标人列表
var fullScreen = 'Bidding/BidNotice/Notice/model/fullScreenView.html';//全屏查看页面

var tenderProjectId = ''; //招标项目id
var bidDetail; //从父级传过来的标段详情
var id = ''; //公告列表中带过来的ID
var bidId = ''; //一对一时的标段Id
var projectAttachmentFiles = []; //存放附件信息并传给后台

var fileUploads = null; //上传文件
var inviteStates = {};  //供应商答复状态
var entertBiderData = {};  //已确认到场的企业
var biderData = [];  //供应商列表
var step = 5; //时间插件间隔分钟数
var bidInviteId = '';//邀请函id
var inviteId = '';//邀请函原始id
//var isTender;//是否只编辑供应商0：否，1：是
var tenderProjectType; //招标项目类型
var CAcf = null;  //实例化CA
var isLaw = '';//是否依法0 否 1 是
var examType = '';//资格审查方式
var RenameData;//投标人更名信息
$(function() {
	new UEditorEdit({
		uploadServer: top.config.tenderHost,
		pageType: 'view',
		contentKey: 'bidInviteIssueContent'
	});
//	id = $.getUrlParam('id'); //公告列表中带过来的ID
	bidId = $.getUrlParam('id'); //公告列表中带过来的标段Id
	$('#bidId').val(bidId); //标段Id
	// examType = $.getUrlParam('examType'); //资格审查方式
//	isTender = $.getUrlParam('isTender');//是否只编辑供应商0：否，1：是
    getRelevant(bidId);
    getRoomList(bidId,'2');
	RenameData = getBidderRenameMark(bidId);//投标人更名信息
	if($.getUrlParam('bidInviteId') && $.getUrlParam('bidInviteId') != undefined){//邀请函id
		bidInviteId = $.getUrlParam('bidInviteId');
	}
	if($.getUrlParam('bidInviteHistoryId') && $.getUrlParam('bidInviteHistoryId') != undefined){//原始邀请函id
		bidInviteHistoryId = $.getUrlParam('bidInviteHistoryId');
		
	}
	reviseNotice(bidId)
	$("#bulletinDuty").val(entryInfo().userName);
	//审核
	/*$("#approval").ApprovalProcess({
		url: top.config.tenderHost,
		businessId: id,
		status: 1,
		type: "zbyqsh",
	});*/
	//预约会议室
	$('#orderRoom').click(function(){
		roomEdit(bidId)
	})
	//选择邀请供应商
	$("#btnBider").click(function() {
		openEnterprise();
	});
	// 移除供应商
	$("#biderBlock").on("click", ".btnDelBider", function(){
		var index = $(this).attr("data-index"); 
		parent.layer.confirm('确定删除该投标人？',{icon:3,title:'询问'},function(ind){
			parent.layer.close(ind);
			biderData.splice(index, 1);
			$("#biderBlock").html("");
			enterpriseHtml(biderData);
		})
		
	});

	//下拉列表数据初始化
	initSelect('.select');


	if(!fileUploads){
		fileUploads = new StreamUpload("#fileContent",{
			businessId: bidInviteId,
			status:2
		});
	}

	/*全屏*/
	$('.fullScreen').click(function(){
		var content = $('#bidInviteIssueContent').html();
	   	parent.layer.open({
	        type: 2 
	        ,title: '查看公告信息'
	        ,area: ['100%', '100%']
	        ,content: fullScreen
	        ,resize: false
	        ,btn: ['关闭']
	        ,success:function(layero,index){
	        	var body = parent.layer.getChildFrame('body', index);
	    	    var iframeWind=layero.find('iframe')[0].contentWindow; 
	    	    body.find('#noticeContent').html(content);
	        }
	        //确定按钮
	        ,yes: function(index,layero){
	            parent.layer.close(index);
	            
	        }
	    });
	})
	//	editor.txt.html('xjkasj')


	
});
//保存state：0:保存，1：提交审核
function save(state,callback) {
	if(state == 1){
		if(!CAcf){
			CAcf = new CA({
				target:"#addNotice",
				confirmCA:function(flag){ 
					if(!flag){  
						return;
					}
					savePost(state,callback);
				}
			});
		}
		CAcf.sign();
	} else {
		savePost(state, callback);
	}
}
function savePost(state, callback){
	var bidCodes = [];
	var arr = parent.serializeArrayToJson($("#addNotice").serializeArray());
	for(var i = 0; i < $('.bidCodes').length; i++) {
		bidCodes.push($('.bidCodes').eq(i).html())
	}
	arr.isEditEnterprise = 1;
	var noticeMedia = '襄阳市人民政府门户网站;襄阳市公共资源交易网;湖北省公共资源交易电子服务平台';
	
	var param;
	if(state == 1) {
		arr.isSubmit = 1;
	}
	console.log(arr)
	$.ajax({
		type: "post",
		url: saveUrl,
		async: false,
		dataType: "json", //预期服务器返回的数据类型
		data: arr,
		beforeSend: function(xhr) {
			var token = $.getToken();
			xhr.setRequestHeader("Token", token);
		},
		success: function(data) {
			if(data.success) {
				bidInviteId = data.data;
//				$('[name="inviteId"]').val(bidInviteId);
				if(callback){
        			callback();
        		}
//					if(!bidInviteHistoryId){
//						bidInviteHistoryId = data.data;
//						$('#bidInviteHistoryId').val(data.data);
//					}
				parent.layer.alert("提交成功！", {
					icon: 1,
					title: '提示'
				});
				var index = parent.layer.getFrameIndex(window.name);
				parent.layer.close(index);
//				parent.$('#tableList').bootstrapTable('refresh');
			}else{
				parent.layer.alert(data.message)
			}
		},
		error: function() {
			parent.layer.alert("提交失败！");
		}

	});
}

/*修改时信息回显*/
function reviseNotice(dataId) {
	$.ajax({
		type: "post",
		url: resiveUrl,
		data: {
			'bidSectionId': dataId
		},
		dataType: 'json',
		success: function(data) {
			if(data.success == false) {
				parent.layer.alert(data.message);
				return;
			}else{
				var dataSource = data.data;
				bidInviteId = dataSource.id;
				if(dataSource.inviteId){
					inviteId = dataSource.inviteId;
					$('[name=inviteId]').val(inviteId)
				}
//				noticeNature = dataSource.bidInviteIssueNature;
				tenderProjectId = dataSource.tenderProjectId;
				//供应商回显
				if(dataSource.bidInviteEnterprises) {
					
					biderData = dataSource.bidInviteEnterprises;
					for(var i = 0;i<biderData.length;i++){
						biderData[i].danweiguid = biderData[i].enterpriseId;
						if(biderData[i].inviteState == 2 || biderData[i].inviteState == 1){
							biderData[i].isDisabled = true;
						}else{
							biderData[i].isDisabled = false;
						}
					}
					//记录投标人答复状态
					for(var i = 0;i < biderData.length;i++){
						inviteStates[biderData[i].enterpriseId] = biderData[i].inviteState;
						//缓存已答复的企业
						if(biderData[i].inviteState == 2){
							entertBiderData[biderData[i].enterpriseId] = biderData[i];
						}
					}
					enterpriseHtml(dataSource.bidInviteEnterprises);
				}
				//文件回显
				if(dataSource.projectAttachmentFiles) {
					projectAttachmentFiles = dataSource.projectAttachmentFiles;
					fileUploads.fileHtml(projectAttachmentFiles);
				}
				for(var key in dataSource) {
					if(key == "deliverFileType"){	//投标文件递交方式	1.线上递交    2.线下递交
						if(dataSource.deliverFileType == '1'){
		     				dataSource.deliverFileType = '线上递交'
		     			}else if(dataSource.deliverFileType == '2'){
		     				dataSource.deliverFileType = '线下递交'
		     			}
//		     			console.log(dataSource.deliverFileType)
		     			$("#" + key).html(dataSource.deliverFileType);
					} else {
						$("#" + key).val(dataSource[key]);
					}
				}
				// $('[name="bidInviteIssueContent"]').val(dataSource.bidInviteIssueContent)
				// $('#bidInviteIssueContent').html(dataSource.bidInviteIssueContent)
				mediaEditor.setValue(dataSource);
			}
		},
		error: function(data) {
			parent.layer.alert("请求失败")
		},
	});

}




function passMessage(data,callback) {
	var newData = [];
	newData.push(data);
	bidDetail = newData;
	//将标段相关信息保存到页面的隐藏域，提交的时候需要提交到后台
	for(var key in data) {
		$('[data-name=' + key + ']').val(data[key]);
	}
//	bidId = data.id;
	tenderProjectId = data.tenderProjectId;
	/*提交*/
	$('#btnSubmit').click(function() {
		
		var bidOpenTime = Date.parse(new Date($('#bidOpenTime').val())); //开标时间
		var noticeSendTime = Date.parse(new Date($('#noticeSendTime').val())); //公告发布时间
		var docGetStartTime = Date.parse(new Date($('#docGetStartTime').val())); //文件获取开始时间
		var docGetEndTime = Date.parse(new Date($('#docGetEndTime').val())); //文件获取截止时间
		var bidDocReferEndTime = Date.parse(new Date($('#bidDocReferEndTime').val())); //申请文件递交截止时间

		if(docGetStartTime < noticeSendTime) {
			parent.layer.alert('招标文件获取时间应在公告发布时间后！');
			return
		}
		if(docGetEndTime < docGetStartTime) {
			parent.layer.alert('招标文件获取截止时间应在招标文件获取时间后！');
			return
		}
		if(docGetEndTime > bidDocReferEndTime) {
			parent.layer.alert('投标文件递交截至时间应在招标文件获取截止时间 后！');
			return;
		} else if(bidDocReferEndTime > bidOpenTime) {
			parent.layer.alert('申请文件递交截止时间应在开标之前');
			return;
		}
		
		if(checkForm($("#addNotice"))) { //必填验证，在公共文件unit中
			if(isLaw == 1){
				if(biderData.length < 3){
					parent.layer.alert('依法招标项目至少有3个投标人！',function(ind){
						parent.layer.close(ind);
						$('#collapseSix').collapse('show');
					})
					return
				}
			}else if(isLaw == 0){
				if(biderData.length == 0){
					parent.layer.alert('请选择投标人！',function(ind){
						parent.layer.close(ind);
						$('#collapseSix').collapse('show');
					})
					return;
				}
			}
			//投标人黑名单验证
			if(biderData!=null && biderData.length>0){
				var strHtml ='';
				var flag = false;
				for(var i = 0;i<biderData.length;i++){
					var parm = checkBlackList(biderData[i].organNo,tenderProjectType,'b1');
					if(parm.isCheckBlackList){
						flag = true;
						strHtml += parm.message;
						strHtml += "<br/>";
					}
				}
				if(flag){
					parent.layer.alert(strHtml,{icon: 7,title: '提示'});
					return;
				}
			}
			
			parent.layer.alert('确认提交审核？', function(index) {
				save(1,callback);
				
				parent.layer.close(index);
			})
		}
	})
	/*关闭*/
	$('#btnClose').click(function() {
		var index = parent.layer.getFrameIndex(window.name);
		parent.layer.close(index);
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
  date.setUTCHours(t[0]-8, t[1], t[2], 0);
  return date;  
}

/*
 * 打开供应商页面
 */
function openEnterprise() {
	var jumpHtml = '';
	jumpHtml = preBidderHtml; //预审后审合并用一个页面
	//if (examType == 1) {
	//	jumpHtml = preBidderHtml;
	//} else {
	//	jumpHtml = enterprisePage;
	//}
	var width = $(parent).width() * 0.9;
	var height = $(parent).height() * 0.9;
	top.layer.open({
		type: 2,
		title: "投标人",
		area: [width + 'px', height + 'px'],
		resize: false,
		content: jumpHtml+ '?bidId='+ bidId,
		success: function(layero, index) {
			var iframeWin = layero.find('iframe')[0].contentWindow;

			iframeWin.passMessage({
				isMulti: true,
				biderData: biderData,
				enterpriseType: 3,
				callback: enterpriseCallback,
				isDisabled: true,
				examType: examType, //1:预审 else：后审
				tenderProjectType: tenderProjectType //招标项目类型
			}); //调用子窗口方法，传参

		}
	});
}

/*
 * 同级页面返回参数
 */
function enterpriseCallback(data) {
	var temporaryData = biderData;//临时存储编辑也投标人
	biderData = [];
	//	biderData = data;
	for (var i = 0; i < data.length; i++) {
		biderData.push(data[i])
		for(var j = 0; j < temporaryData.length; j++){
			var contrastId = '';
			temporaryData[j].enterpriseId?contrastId = temporaryData[j].enterpriseId:temporaryData[j].id?contrastId = temporaryData[j].id:'';
			if(contrastId == data[i].danweiguid){//若临时存储的数据与选中的数据相同则取用临时存储数据
				if($('#enterpriseTab .person').eq(i).hasClass('can_change')){
					biderData[i].enterprisePerson = $('#enterpriseTab .person').eq(i).val();
					biderData[i].enterprisePersonTel = $('#enterpriseTab .personTel').eq(i).val();
				}
			}
		}
	}
	
	enterpriseHtml(biderData);
}

/**
 * 供应商
 * @param {Object} data
 */
function enterpriseHtml(data) {
//	console.log(data)
	var html = "";
	if($("#enterpriseTab").length == 0) {
		html += '<table id="enterpriseTab" class="table table-bordered" style="margin-top: 5px;">'
                	+'<tr data-id="' + data.enterpriseId + '">'
                		+'<th style="width:50px;text-align:center;">序号</th>'
                		+'<th>企业名称</th>'
                		+'<th style="width: 300px;text-align:center;">企业编码</th>'
                		+'<th style="width: 180px;text-align:center;">联系人<i class="red">*</i></th>'
                		+'<th style="width: 180px;text-align:center;">联系方式<i class="red">*</i></th>'
                		+'<th style="width: 180px;text-align:center;">回复状态</th>'
                		+'<th style="width: 100px;text-align:center;">操作</th>'
                	+'</tr>';
	}
	for(var i = 0; i < data.length; i++) {
		var btnRemove = '';
		var inviteState = '';
		var code = '';
		var person = '';
		var personTel = '';
		if(!data[i].enterpriseId){
			data[i].enterpriseId = data[i].id;
		}
		if (!data[i].inviteState) {
			data[i].inviteState = 0;
		}
		if(data[i].inviteState == 0){
			inviteState = '未回复';
			btnRemove = '<button type="button" data-index="'+i+'" class="btn btn-danger btn-sm btnDelBider"><span class="glyphicon glyphicon-remove"></span>移除</button>'
		}else if(data[i].inviteState == 2){
			inviteState = '<span style="color:green">同意投标</span>'
		}else if(data[i].inviteState == 1){
			inviteState = '<span style="color:red">放弃投标</span>'
		}
		if(data[i].enterpriseCode){
			code = data[i].enterpriseCode;
		}else if(!data[i].enterpriseCode && data[i].legalCode){
			code = data[i].legalCode;
		}else if(!data[i].enterpriseCode && !data[i].legalCode){
			code = '';
		}
		
		if(data[i].enterprisePerson){
			person = data[i].enterprisePerson;
		}else if(!data[i].enterprisePerson && data[i].legalContact){
			person = data[i].legalContact;
		}else if(!data[i].enterprisePerson && !data[i].legalContact){
			person = '';
		}
		if(data[i].enterprisePersonTel){
			personTel = data[i].enterprisePersonTel;
		}else if(!data[i].enterprisePersonTel && data[i].legalContactPhone){
			personTel = data[i].legalContactPhone;
		}else if(!data[i].enterprisePersonTel && !data[i].legalContactPhone){
			personTel = '';
		}
		var legalName = data[i].enterpriseName ? data[i].enterpriseName : data[i].legalName;
		if(!data[i][0]){
			html += '<tr>'
            		html += '<td style="width:50px;text-align:center;">' + (i+1) + '</td>'
            		html += '<td>' + showBidderRenameMark(data[i].enterpriseId, legalName, RenameData, 'addNotice') + '<input type="hidden" name="bidInviteEnterprises['+i+'].enterpriseId" value="'+data[i].enterpriseId+'"/></td>'
            		html += '<td style="width: 300px;text-align:center;">' + code + '<input type="hidden" name="bidInviteEnterprises['+i+'].inviteState" value="'+data[i].inviteState+'"/></td>'
            		html += '<td style="width: 180px;text-align:center;"><input type="hidden" class="person" name="bidInviteEnterprises[' + i + '].enterprisePerson" value="'+person+'"/>' + person + '</td>'
            		html += '<td style="width: 180px;text-align:center;"><input type="hidden" class="personTel" name="bidInviteEnterprises[' + i + '].enterprisePersonTel" value="'+personTel+'"/>' + personTel + '</td>'
            		html += '<td style="width: 180px;text-align:center;">' + inviteState + '<input type="hidden" name="bidInviteEnterprises['+i+'].messageState" value="'+(data[i].messageState!=undefined?data[i].messageState:0)+'"/></td>'
            		html += '<td style="width: 100px;text-align:center;">'+btnRemove+'</td>'
            	html += '</tr>';
		}else{
			html += '<tr>'
        		html += '<td style="width:50px;text-align:center;">' + (i+1) + '</td>'
        		html += '<td>' + showBidderRenameMark(data[i].enterpriseId, legalName, RenameData, 'addNotice') + '<input type="hidden" name="bidInviteEnterprises['+i+'].enterpriseId" value="'+data[i].enterpriseId+'"/></td>'
        		html += '<td style="width: 300px;text-align:center;">' + code + '<input type="hidden" name="bidInviteEnterprises['+i+'].inviteState" value="'+data[i].inviteState+'"/></td>'
        		html += '<td style="width: 180px;text-align:center;"><input type="text"  maxlength="11" datatype="*" errormsg="温馨提示:请输入联系人!" class="form-control person can_change" name="bidInviteEnterprises[' + i + '].enterprisePerson" value="'+person+'"/></td>'
        		html += '<td style="width: 180px;text-align:center;"><input type="text"  maxlength="11" datatype="mobile" errormsg="温馨提示:请输入正确的手机号!" class="form-control personTel" name="bidInviteEnterprises[' + i + '].enterprisePersonTel" value="'+personTel+'"/></td>'
        		html += '<td style="width: 180px;text-align:center;">' + inviteState + '<input type="hidden" name="bidInviteEnterprises['+i+'].messageState" value="'+(data[i].messageState!=undefined?data[i].messageState:0)+'"/></td>'
        		html += '<td style="width: 100px;text-align:center;">'+btnRemove+'</td>'
        	html += '</tr>';
		}
		
	}

	if($("#enterpriseTab").length == 0) {
		html += '</table>';
		$("#biderBlock").html("");
		$(html).appendTo("#biderBlock");
	} else {
		$("#enterpriseTab tr:gt(0)").remove();
		$(html).appendTo("#enterpriseTab");
	}
};



//获取项目、招标项目、标段相关信息
function getRelevant(bidId){
	$.ajax({
		type:"post",
		url:haveInfoUrl,
		async:true,
		data: {
			'id': bidId
		},
		success: function(data){
			if(data.success){
				var arr = data.data;
				msgInfo=JSON.parse(JSON.stringify(data.data));
				tenderProjectType = arr.tenderProjectType;
				isLaw = arr.isLaw;
				examType = arr.examType;
				for(var key in arr){
					if(key == "tenderProjectType"){
	         			$("#tenderProjectTypeTxt").dataLinkage({
							optionName:"TENDER_PROJECT_TYPE",
							optionValue:arr[key],
							status:2,
							viewCallback:function(name){
								$("#tenderProjectTypeTxt").html(name)
							}
						});
					}else{
						if(key == "deliverFileType"){	//投标文件递交方式	1.线上递交    2.线下递交
							if(arr.deliverFileType == '1'){
			     				arr.deliverFileType = '线上递交'
			     			}else if(arr.deliverFileType == '2'){
			     				arr.deliverFileType = '线下递交'
			     			}
						}else if(key == "bidType"){	//1为明标，2为暗标
							if(arr.bidType == '1'){
			     				arr.bidType = '是'
			     			}else if(arr.bidType == '2'){
			     				arr.bidType = '否'
			     			}
						}else if(key == "syndicatedFlag"){	//1为是，2为否
							if(arr.syndicatedFlag == '1'){
			     				arr.syndicatedFlag = '允许'
			     			}else if(arr.syndicatedFlag == '0'){
			     				arr.syndicatedFlag = '不允许'
			     			}
						}else if(key == "signUpType"){	//报名方式 1.线上报名 2.线下报名
							if(arr.signUpType == '1'){
			     				arr.signUpType = '线上获取'
			     			}else if(arr.signUpType == '2'){
			     				arr.signUpType = '线下获取'
			     			}
						}else if(key == "bidOpenType"){	//1为线上开标，2为线下开标
							if(arr.bidOpenType == '1'){
			     				arr.bidOpenType = '线上开标'
			     			}else if(arr.bidOpenType == '2'){
			     				arr.bidOpenType = '线下开标'
			     			}
						}else if(key == "bidCheckType"){	//1线，2为线下
							if(arr.bidCheckType == '1'){
			     				arr.bidCheckType = '线上评审'
			     			}else if(arr.bidCheckType == '2'){
			     				arr.bidCheckType = '线下评审'
			     			}
						}else if(key == "examType"){	//1为资格预审，2为资格后审
							if(arr.examType == '1'){
			     				arr.examType = '资格预审'
			     			}else if(arr.examType == '2'){
			     				arr.examType = '资格后审'
			     			}
						}else if(key == "tenderMode"){	//1为资格预审，2为资格后审
							if(arr.tenderMode == '1'){
			     				arr.tenderMode = '公开招标'
			     			}else if(arr.tenderMode == '2'){
			     				arr.tenderMode = '邀请招标'
			     			}
						}
						else if(key == "priceUnit"){	//1为资格预审，2为资格后审
							if(arr.priceUnit == '1'){
			     				arr.priceUnit = '万元'
			     			}else if(arr.priceUnit == '2'){
			     				arr.priceUnit = '元'
			     			}
						}else if(key == 'projectCosts'){
							if(arr.projectCosts.length == 0){
								$('.price').html('无');
							}else{
								if( arr.projectCosts[0].costName == '招标文件费'){
									if(arr.projectCosts[0].isPay == 0){
										$('.price').html('无');
									}else if(arr.projectCosts[0].isPay == 1){
										$('.price').html(arr.projectCosts[0].payMoney);
									}
								}
							}
						}else if(!arr.projectCosts){
							$('.price').html('无');
						}
						$('#'+key).html(arr[key]);
						optionValueView("#"+key,arr[key]);//下拉框信息反显
					}
					
				}
			}
		}
	});
};


