var token=sessionStorage.token;
var bidSectionId;//标段Id
var examType;
var nodeType, nodeSubType,bidType,reviewRoleType;//reviewRoleType //评标角色类型 1.评委  2.组长 3.招标监督人 4.项目经理 5.平台 6.监管部门监督人
var reviewFlowNodeUrl=config.Reviewhost+"/ReviewControll/review";//评标流程环节路由
var dowoloadFileUrl = config.FileHost + "/FileController/download.do"; //下载文件
var downLoadZip = config.tenderHost + '/BidRemarkController/biddingFilesLoad.do';
var tendersFileData=[],FileSupplementData=[],bidFileData=[],bondData=[],clarifyData=[],suppliersData=[],macData=[],bondData2=[],warnData=[];
var openData = [];
var jinurl=config.Reviewhost+"/ReviewControll/findCheckFlowInfo.do";//评标进度
var bidFileUrl = config.tenderHost + "/BidFileController/downloadFile.do";//投标文件
var pretrialFileUrl = config.tenderHost + "/PretrialFileController/downloadFile.do";//投标文件
var macListUrl=config.Reviewhost + "/BidOpeningMachineController/findBidOpeningMachineList.do";
var warnUrl = config.Reviewhost + '/BidOpeningMachineController/findRerviceWarningLink.do';//预警
var bidInfoUrl=config.Reviewhost + "/ProjectController/findBidSectionInfo.do";//标段信息
var bondUrl=config.depositHost +"/DepositController/managerLookSubmitSituation.do";//查看虚拟子帐号保证金递交情况
var msgUrl = "../../../Bond/cashViewList/model/tenderList.html"; // 查看
var bidFileBatchUrl= config.tenderHost + "/BidFileController/downloadFileBatch.do";
var bidFileBatchIsEndUrl= config.tenderHost + "/BidFileController/downloadFileBatchIsEnd.do";
var pretrialFileBatchUrl= config.tenderHost + "/PretrialFileController/downloadFileBatch.do";

var depositChannelType;//保证金缴纳渠道方式  1.线上  2.线下
var arrStyle1=[];
var arrStyle2=[]
var ABflag = false;
var showlist=[]
var fileUrl = '';//招标文件源文件地址
var owner;
var checkResult;
var isShowCard='1', isShowScreen='1';
var RenameData;//投标人更名信息
$(function(){
    bidSectionId=getUrlParam("bidSectionId");//标段Id
    examType=getUrlParam("examType");
    nodeType=getUrlParam("nodeType");
	nodeSubType=getUrlParam("nodeSubType");
	bidType = getUrlParam("bidType");
	reviewRoleType = getUrlParam("reviewRoleType");
	owner = getUrlParam("owner");
	RenameData = getBidderRenameMark(bidSectionId, token);//投标人更名信息
	warnLists();//预警
	macLists();
	$.ajax({
		type:"post",
		url:jinurl,
		async:false,
		beforeSend: function(xhr){
	       xhr.setRequestHeader("Token",token);
	    },
		data: {
			'bidSectionId':bidSectionId,
			'examType':examType,
		},
		success: function(res){
			if(res.success){
				//无评委签订承诺书时data无数据
				// if(res.data.checkResult == undefined){
				// 	if(reviewRoleType != '4'){// 4 项目经理
				// 		$('.bidFileBatch').hide();
				// 	}
				// };
				if(res.data.checkResult || res.data.checkResult == 0){
					checkResult = res.data.checkResult
				}
				if(res.data.checkResult == 0 || res.data.checkResult == undefined){ //0评标指令前  1 结束  2 已下达指令 3 评审环节流标（竞争性投票导致）
					$('#openList').css('display','none');
					$('#bidFileList').css('display','none');
					$('#bondList').css('display','none');
					// if(reviewRoleType != '4'){// 4 项目经理
						$('.bidFileBatch').hide();
					// }
				}else{
					$('#openList, #bidFileList, #bondList, .bidFileBatch, .bidderHide').show();
					$.ajax({
						type:"post",
						url:bondUrl,
						async:false,
						beforeSend: function(xhr){
							xhr.setRequestHeader("Token",token);
						},
						data: {
							'packageId':bidSectionId,
						},
						success: function(res){
							if(res.success){
								bondData2 = res.data.boList;
							}
						}
					});
				}
			}
		}
	});
	
	$.ajax({
		type:"post",
		url:bidInfoUrl,
		async:false,
		beforeSend: function(xhr){
			xhr.setRequestHeader("Token",token);
		},
		data: {
			'bidSectionId':bidSectionId,
		},
		success: function(res){
			if(res.success){
				depositChannelType = res.data.depositChannelType;
			}
		}
	});
		
	
	
	
	$('title').html(siteInfo.sysTitle);
	
	//查看
	$("#bondList").off("click", ".btnView").on("click", ".btnView", function() {
		var index = $(this).attr("data-index");
		openOnline(index);
	});

    getBidFile(function (data){
		if(data.projectAttachmentFiles.length > 0){
			tendersFileData = data.docClarifyItems.concat(data.projectAttachmentFiles);//招标文件及其他文件
		}else{
			tendersFileData = data.docClarifyItems;//招标文件
		}
        
		
        tendersFileLists();

        if(data.bidOpening){
            data.bidOpening.fileName = '开标一览表';
            openData.push(data.bidOpening);//开标一览表
			if(checkResult == 1 || checkResult == 2 || checkResult == 3){
				openLists();
			}
		}else{
            $('.openList').hide();
		}

        if(data.docClarifys && data.docClarifys.length>0){
            FileSupplementData=data.docClarifys;//招标文件变更补遗
            FileSupplementLists();
        }

        if(data.suppliers && data.suppliers.length>0){
            suppliersData=data.suppliers;//投标文件投标人
            bidFileLists();
			ABflag = true;
        }else{
            $('.bidFileList').hide();
			ABflag = false;
		}
		if(depositChannelType && depositChannelType == 1){
			if(bondData2 && bondData2.length>0){
				bondLists2(bondData2);
			}else{
				$('.bondList').hide();
			}
		}else{
			if(data.biddingDeposits && data.biddingDeposits.length>0){
				bondData=data.biddingDeposits;//保证金缴纳情况
				bondLists();
			}else{
				$('.bondList').hide();
			}
		}
		

        if(data.clarifys && data.clarifys.length>0){
            clarifyData=data.clarifys;//评标回复
            clarifyLists();
        }

        if(data.fileUrl){
            fileUrl = data.fileUrl;
            $('.tenderFile').show();
        }else{
            $('.tenderFile').hide()
        }

    });
	
 
	$.ajax({
		type:"post",
		url:findFileListByOrderUrl,
		async:false,
		beforeSend: function(xhr){
			xhr.setRequestHeader("Token",token);
		},
		data: {
			'packageId':bidSectionId
		},
		success: function(res){
			if(res.success){
				fileTable(res)
			}
		}
	});


	
});

/**
 * 获取招投标文件
 * @param callback
 */
function getBidFile(callback){
    var param = {
        "bidSectionId":  bidSectionId,
        "examType": examType,
        "nodeType":nodeType,
        "method":"findDFFiles",
		"owner":owner
    };
    if(nodeSubType && nodeSubType !='undefined'){
        param.nodeSubType = nodeSubType;
    }

    //获取标段详情
    $.ajax({
        type:"post",
        url:reviewFlowNodeUrl,
        beforeSend: function(xhr){
            xhr.setRequestHeader("Token",token);
        },
        data:param,
        success:function(res){
            if(res.success){
                callback(res.data)
            }else{
                if(res.message != '404'){
                    top.layer.alert(res.message);
                }else{
                    top.layer.alert("接口不存在");
                }
            }
        }
    });
}

//招标文件
function tendersFileLists(){
	
	$('#tendersFileList').bootstrapTable({
		pagination: false,
		undefinedText: "",
		columns: [
		{
		    field: "xuhao",
			title: "序号",
			align: "center",
			halign: "center",
			width: "50px",
			formatter: function(value, row, index) {
				return index + 1;
			},
		
		},
		{
			field: "fileName",
			title: "文件名称",
			align: "left",
			halign: "left",									
		},
		{
			field: "xz",
			title: "操作",
			
			width: "160px",
			events:{
				'click #download':function(e,value, row, index){
					var filesnames = row.fileName.substring(0,row.fileName.lastIndexOf("."));
					var newUrl =dowoloadFileUrl+'?Token='+token + '&ftpPath=' + row.fileUrl + '&fname=' + filesnames;
					window.location.href = encodeURI(newUrl);
				},
				'click #picture':function(e,value, row, index){
					top.layer.open({
						type: 2,
						area: ['100%', '100%'],
						btn: ["关闭"],
						maxmin: false,
						resize: false,
						title: "预览",
						// content: top.config.FileHost + "/FileController/fileView.do?ftpPath=" + row.fileUrl+'&Token='+token
						content: siteInfo.sysUrl + '/media/js/pdfjs/web/viewer.html?file='+top.config.FileHost + '/fileView'+row.fileUrl
					})
				}
			},
			formatter: function(value, row, index) {
				var btn1="<a href='javascript:void(0)' class='btn-sm btn-primary' id='download' style='text-decoration:none;margin-right:10px;'><span class='glyphicon glyphicon-download' aria-hidden='true'></span>下载</a>"
				var btn2="<a  href='javascript:void(0)' class='btn-sm btn-primary' id='picture' style='text-decoration:none'><span class='glyphicon glyphicon-picture' aria-hidden='true'></span>&nbsp预览</a>";
				var postfix = row.fileName.substring(row.fileName.lastIndexOf(".")+1,row.fileName.length);
				var str = btn1;
				if(postfix == 'pdf' || postfix == 'PDF' || postfix == 'jpg' || postfix == 'JPG' || postfix == 'png' || postfix == 'PNG'){
					str += btn2
				}
				return str;
			},
		}
		]
	});
	$('#tendersFileList').bootstrapTable("load",tendersFileData); //重载数据
};
//开标一览表
function openLists(){
	
	$('#openList').bootstrapTable({
		pagination: false,
		undefinedText: "",
		columns: [
		{
		    field: "xuhao",
			title: "序号",
			align: "center",
			halign: "center",
			width: "50px",
			formatter: function(value, row, index) {
				return index + 1;
			},
		
		},
		{
			field: "fileName",
			title: "文件名称",
			align: "left",
			halign: "left",									
		},
		{
			field: "xz",
			title: "操作",
			align: "center",
			
			width: "160px",
			events:{
				'click .download':function(e,value, row, index){
					var filesnames = row.fileName;
					var newUrl =dowoloadFileUrl+'?Token='+token + '&ftpPath=' + row.pdfUrl + '&fname=' + filesnames;
					window.location.href = encodeURI(newUrl);
				},
				'click .picture':function(e,value, row, index){
					top.layer.open({
						type: 2,
						area: ['100%', '100%'],
						btn: ["关闭"],
						maxmin: false,
						resize: false,
						title: "预览",
						// content: top.config.FileHost + "/FileController/fileView.do?ftpPath=" + row.pdfUrl+'&Token='+token
						content: siteInfo.sysUrl + '/media/js/pdfjs/web/viewer.html?file='+top.config.FileHost + '/fileView'+row.pdfUrl,
					})
				}
			},
			formatter: function(value, row, index) {
				var btn1="<a href='javascript:void(0)' class='btn-sm btn-primary download' style='text-decoration:none'><span class='glyphicon glyphicon-download' aria-hidden='true'></span>下载</a>&nbsp;&nbsp;"
				var btn2="<a  href='javascript:void(0)' class='btn-sm btn-primary picture' style='text-decoration:none'><span class='glyphicon glyphicon-picture' aria-hidden='true'></span>&nbsp预览</a>"
				return btn1+btn2;
			},
		}
		]
	});
	$('#openList').bootstrapTable("load",openData); //重载数据
};
//招标文件补遗
function FileSupplementLists(){
	$('#FileSupplementList').bootstrapTable({
		pagination: false,
		undefinedText: "",
		columns: [
		{
		    field: "xuhao",
			title: "序号",
			align: "center",
			halign: "center",
			width: "50px",
			formatter: function(value, row, index) {
				return index + 1;
			},
		
		},
		{
			field: "docName",
			title: "标题",
			align: "left",
			halign: "left",	
		},
		{
			field: "isChange",
			title: "是否变更",
			align: "left",
			halign: "left",	
			formatter: function(value, row, index) {
				if(row.isChange==1&&row.isReplenish==0){
					return '招标文件变更';
				};
				if(row.isChange==0&&row.isReplenish==1){
					return '时间变更';
				}
				if(row.isChange==1&&row.isReplenish==1){
					return '招标文件变更/时间变更';
				}
			},
		},
		{
			field: "xz",
			title: "操作",
			align: "center",
			width: "80px",
			events:{
				'click #download':function(e,value, row, index){
					top.layer.open({
						type: 2,
						area: ['1000px', '600px'],
						btn: ["关闭"],
						maxmin: false,
						resize: false,
						title: "查看",
						content: 'Supplement.html?id='+row.id+'&Token='+token
					})
				}
			},
			formatter: function(value, row, index) {
				var btn1="<a href='javascript:void(0)' class='btn-sm btn-primary' id='download' style='text-decoration:none'><span class='glyphicon glyphicon-eye-open'></span>查看</a>"				
				return btn1;
			},
		}	
		]
	});
	$('#FileSupplementList').bootstrapTable("load",FileSupplementData); //重载数据
}
//投标文件投标人
function bidFileLists(){
	$('#bidFileList').bootstrapTable({
		pagination: false,
		undefinedText: "",
		columns: [
		{
		    field: "xuhao",
			title: "序号",
			align: "center",
			halign: "center",
			width: "50px",
			formatter: function(value, row, index) {
				return index + 1;
			},
		},{
			field: "enterpriseName",
			title: "投标人",
			align: "left",
			halign: "left",	
			formatter: function(value, row, index) {
				return showBidderRenameMark(row.id, value, RenameData, 'mainTable');
			},
		},{
			field: "xz",
			title: "操作",
			align: "center",
			width: "200px",
			events:{
				'click .viewFile':function(e,value, row, index){
					top.layer.open({
						type: 2,
						area: ['1000px', '600px'],
						btn: ["关闭"],
						maxmin: false,
						resize: false,
						title: "查看",
						content: 'bidFile.html?id='+row.id+'&Token='+token
					})
				},
				'click .downLoadAll':function(e,value, row, index){
					if(examType == 2){
                        $(this).attr('href',bidFileUrl+'?Token='+token + '&bidFileId=' + row.fileId)
					}else{
                        $(this).attr('href',pretrialFileUrl+'?Token='+token + '&bidFileId=' + row.fileId)
                    }


				}
			},
			formatter: function(value, row, index) {
				var btn1="<a href='javascript:void(0)' class='btn-sm btn-primary viewFile' style='text-decoration:none'><span class='glyphicon glyphicon-eye-open'></span>查看</a>"	;
				var btnLoad = '<a  href="#" class="btn-sm btn-primary downLoadAll" style="margin-left: 10px;text-decoration:none">下载投标文件</a>';
				if(checkResult == 1 || checkResult == 2 || checkResult == 3){
					return btn1 + btnLoad;
				}else{
					return '';
				}
				
			},
		}
			
		]
	});
	$('#bidFileList').bootstrapTable("load",suppliersData); //重载数据
}
//保证金递交情况   线下
function bondLists(){
	$('#bondList').bootstrapTable({
		pagination: false,
		undefinedText: "",
		columns: [
		{
		    field: "xuhao",
			title: "序号",
			align: "center",
			halign: "center",
			width: "50px",
			formatter: function(value, row, index) {
				return index + 1;
			},
		},{
			field: "bidderName",
			title: "投标人",
			align: "left",
			halign: "left",									
		},{
			field: "depositMoney",
			title: "缴纳金额（元）",
			align: "right",
//			halign: "left",									
		},{
			field: "subTime",
			title: "缴纳时间",
			align: "left",
			halign: "left",									
		},{
			field: "depositChannel",
			title: "缴纳渠道",
			align: "left",
			halign: "left",
			formatter: function(value, row, index) {
				if(value==1){
					return '资金现金 ';
				}
				if(value==2){
					return '银行保函 ';
				}
				if(value==3){
					return '担保 ';
				}
				if(value==4){
					return '电汇 ';
				}
				if(value==5){
					return '汇票  ';
				}
				if(value==6){
					return '支票  ';
				}
				if(value==7){
					return '虚拟子账户  ';
				}
				if(value==9){
					return '其他  ';
				}
				
			}
		},{
			field: "depositStatus",
			title: "提交状态",
			align: "left",
			halign: "left",	
			formatter: function(value, row, index) {
				if(value==0){
					return '临时保存 ';
				}
				if(value==1){
					return '提交审核 ';
				}
				if(value==2){
					return '审核通过 ';
				}
				if(value==3){
					return '驳回 ';
				}
				if(value==4){
					return '撤回  ';
				}				
			},
		},
			
		]
	});
	$('#bondList').bootstrapTable("load",bondData); //重载数据
}

//保证金递交情况  线上
function bondLists2(data){
	$('#bondList').bootstrapTable({
		pagination: false,
		undefinedText: "",
		columns: [
			[{
					field: 'xh',
					title: '序号',
					align: 'center',
					width: '50',
					formatter: function(value, row, index) {
						return index + 1;
					},
				},
				{
					field: 'bidderName',
					title: '投标人名称',
					align: 'left',
					// width:'12%'
				},
				{
					field: 'paymentList',
					title: '投标人来款账号名称',
					align: 'left',
					formatter: function(value, row, index) {
						let str = ''
						for(let i=0;i<value.length;i++){
							if(value[i].paymentNameFlag==1){
								if(value[i].paymentName){
									str+='<font color="red">'+value[i].paymentName+'</font>、'
								}
							}else{
								if(value[i].paymentName){
									str+=value[i].paymentName+'、'
								}
							}
						}
						str = str.substr(0, str.length - 1)
						return str
					}
				},
				{
					field: '',
					title: '投标人来款账号',
					align: 'left',
					formatter: function(value, row, index) {
						let str = ''
						for(let i=0;i<row.paymentList.length;i++){
							if(row.paymentList[i].payerAccountNumFlag==1){
								if(row.paymentList[i].payerAccountNum){
									str+='<font color="red">'+row.paymentList[i].payerAccountNum+'</font>、'
								}
							}else{
								if(row.paymentList[i].payerAccountNum){
									str+=row.paymentList[i].payerAccountNum+'、'
								}
							}
						}
						str = str.substr(0, str.length - 1)
						return str
					}
				},
				{
					field: 'virtualSubaccount',
					title: '虚拟子账号',
					align: 'left',
					// width: '130'
				},
				{
					field: 'paymentFrequency',
					title: '来款次数',
					align: 'left',
					// width: '130'
				},
				{
					field: 'submitStatus',
					title: '是否递交',
					align: 'left',
					formatter: function (value, row, index) {
						if(row.submitStatus == "0"){
							return "否";
						} else if(row.submitStatus == "1"){
							return "是";
						}
	
					}
				},
				{
					field: 'cz',
					title: '操作',
					align: 'left',
					formatter: function(value, row, index) {
						var strSee = '<button  type="button" class="btn btn-primary btn-sm btnView" data-index="' + index + '"><span class="glyphicon glyphicon-eye-open"></span>查看递交情况</button>';
						return strSee;
					}
				},
	
			]
		]
	});
	$('#bondList').bootstrapTable("load",bondData2); //重载数据
	var cashTable = $('#bondList')
    var columns = cashTable.bootstrapTable('getVisibleColumns');
    $('#cash-tip').remove();
    $('<p id="cash-tip" class="red" style="margin: 6px 12px;">当发现“' +columns[2].title+ '”标红显示，且与“' +columns[1].title+ '”相同时，可能是因为名称中带括号，系统区分全角和半角所致</p>').insertAfter(cashTable);
}

/*
 * 打开查看窗口（线上虚拟子帐号查看保证金递交情况）
 * 
 */
function openOnline(index) {
	var rows = $('#bondList').bootstrapTable('getData')[index];
	top.layer.open({
		type: 2,
		title: '查看详情',
		area: ['100%', '100%'],
		maxmin: false,
		resize: false,
		closeBtn: 1,
		content: msgUrl+'?tenderType=4&id='+rows.bidSectionId+'&bidderId='+rows.bidderId,
		success: function(layero, index) {
			var iframeWin = layero.find('iframe')[0].contentWindow;
			//调用子窗口方法，传参
			iframeWin.passMsg(rows);
		}
	});
}
//澄清回复
function clarifyLists(){
	$('#clarifyList').bootstrapTable({
		pagination: false,
		undefinedText: "",
		columns: [
			{
				field: "xuhao",
				title: "序号",
				align: "center",
				halign: "center",
				width: "50px",
				formatter: function(value, row, index) {
					return index + 1;
				}
			},{
				field: "clarifyTitle",
				title: "标题",
				align: "left",
				halign: "left",									
			},{
				field: "enterpriseName",
				title: "澄清发起人",
				align: "left",
				halign: "left",	
				formatter: function (value, row, index) {
					return showBidderRenameMark(row.supplierId, value, RenameData, 'mainTable');
				}
			},{
				field: "createTime",
				title: "澄清时间",
				align: "left",
				halign: "left",									
			},{
			field: "xz",
			title: "操作",
			align: "left",
			halign: "left",	
			width: "80px",
			events:{
				'click #download':function(e,value, row, index){
					top.layer.open({
						type: 2,
						area: ['1000px', '600px'],
						btn: ["关闭"],
						maxmin: false,
						resize: false,
						title: "查看",
						content: 'clarifyInfo.html?id='+row.id+'&Token='+token+'&type='+row.type
					})
				}
			},
			formatter: function(value, row, index) {
				var btn1="<a href='javascript:void(0)' class='btn-sm btn-primary' id='download' style='text-decoration:none'><span class='glyphicon glyphicon-eye-open'></span>查看</a>"				
				return btn1;
			},
			}
		]
	});
	$('#clarifyList').bootstrapTable("load",clarifyData); //重载数据
}

//投标文件投标人
function macLists(val){
	$.ajax({
		type:"post",
		url:macListUrl,
		async:true,
		beforeSend: function(xhr){
			xhr.setRequestHeader("Token",token);
		},
		data: {
			'bidSectionId':bidSectionId,
			'examType':examType,
			'ip':val
		},
		success: function(res){
			if(res.success){
				macData=res.rows;
				console.log(macData)
				for(var i=0;i<macData.length;i++){
					showlist=macData[i].showList
					for(var j=i+1; j<macData.length; j++){
						if(macData[i].ip==macData[j].ip){ //第一个等同于第二个
							arrStyle1.push(macData[i].ip)
						}
					}
				}
				tableMac()
				// tableMac2()
                ipshowlist(showlist)
			}
		}
	});

	

}
function ipshowlist(showlist){
	console.log(showlist)
	var html='<p style="color:red">表中“/”表示无值，红字标识信息为系统检测到不同投标人的重复数据（仅供参考），绿字标识信息为咨询有限公司对外提供服务的公用电脑或公用外网IP地址数据。</p>'
    for(var s=0;s<showlist.length;s++){
    	html +='<p>'
    	if(showlist[s].ipType==1){
    		html +='网卡物理地址：'
    	}else if(showlist[s].ipType==2){
    		html +=' 外网IP：'
    	}else if(showlist[s].ipType==3){
    		html +=' 硬盘序列号：'
    	}
    	html +=showlist[s].ipParam
    	html +='，'+showlist[s].remarks+'</p>'
    }
	//<<专家评审页面增加操作说明 >>  最新评审时间在该功能上线时间后的标段/包件展示该说明，之前的不展示  2024.2.2
	//描述不准确，且规定内容易变更，删除描述    2024.5.8
	// if(getExplainState(bidSectionId, examType) == 1){
	// 	html += '<p style="color:red">根据《汽车集团有限公司电子采购招投标过程信息监管规定》，有下列情形的，应认定为串通投标行为：1.电子交易系统CA证书号相同的；2.下载或者上传采购招投标文件的IP地址相同的；3.MAC地址相同的；4.硬盘序列号相同的；5.施工项目工程造价软件锁序列号相同的；6.法律法规或公司制度规定的其它串通投标情形。</p>'
 //    }
	$("#ipshowlist").html(html);
//						<p>外网IP:10.192.168.1，咨询（武汉）工程有限公司外网地址</p>
}

function tableMac(){
	$('#macList').bootstrapTable({
		pagination: false,

		undefinedText: "/",
		columns: [
		{
		    field: "xuhao",
			title: "序号",
			align: "center",
			halign: "center",
			width: "50px",
			formatter: function(value, row, index) {
				return index + 1;
			},
		},{
			field: "bidderName",
			title: "投标人",
			align: "left",
			formatter: function (value, row, index) {
				return showBidderRenameMark(row.bidderId, value, RenameData, 'mainTable');
			}
		},
		// {
		// 	field: "ip",
		// 	title: "IP地址",
		// 	align: "left",
		// 	halign: "left",
		// 	cellStyle:function(value, row, index){
		// 		if(arrStyle1.length <= 0){
		// 			return {
		// 				css: {
		// 					"background": '#FFF',
		// 					"min-width": "120px",
		// 					"word-wrap": "break-word",
		// 					"word-break": "break-all",
		// 					"white-space": "normal"
		// 				}
		// 			}
		// 		}else{
		// 			for(a=0;a<arrStyle1.length;a++){
		// 				if(value==arrStyle1[a]){
		// 					return {
		// 						css: {
		// 							"background": 'red',
		// 							"min-width": "120px",
		// 							"word-wrap": "break-word",
		// 							"word-break": "break-all",
		// 							"white-space": "normal"
		// 						}
		// 					}
		// 				}else{
		// 					return {
		// 						css: {
		// 							"background": '#FFF',
		// 							"min-width": "120px",
		// 							"word-wrap": "break-word",
		// 							"word-break": "break-all",
		// 							"white-space": "normal"
		// 						}
		// 					}
		// 				}
		// 			}
		// 		}
		// 	}								
		// },
		{
			field: "mac",
			title: "物理地址",
			align: "left",
			halign: "left",	
			cellStyle: {
				css: {
					"min-width": "120px",
					"word-wrap": "break-word",
					"word-break": "break-all",
					"white-space": "normal"
				}
			},
			formatter: function(value,row,index) {
				if(row.macFlag==1){
					return '<div class="ipBox"><span class="red">'+row.mac+'</span></div>'
				}else if(row.macFlag==2){
					return '<div class="ipBox"><span class="green">'+row.mac+'</span></div>'
				}else{
					return '<div class="ipBox"><span class="default">'+row.mac+'</span></div>'
				}
			}
		},
		{
			field: "caCertificate",
			title: "CA证书序列号",
			align: "center",
			cellStyle: {
				css: {
					"min-width": "120px",
					"word-wrap": "break-word",
					"word-break": "break-all",
					"white-space": "normal"
				}
			},
			formatter: function(value, row, index) {
				if(value == undefined){
					return "/";
				}else{
					if(row.caCertificateFlag==1){
						return '<div class="ipBox"><span class="red">'+row.caCertificate+'</span></div>'
					}else if(row.caCertificateFlag==2){
						return '<div class="ipBox"><span class="green">'+row.caCertificate+'</span></div>'
					}else{
						return '<div class="ipBox"><span class="default">'+row.caCertificate+'</span></div>'
					}
				}
			}		
		},
		{
			field: "encryptionDog",
			title: "造价软件加密锁号",
			align: "center",
			cellStyle: {
				css: {
					"min-width": "120px",
					"word-wrap": "break-word",
					"word-break": "break-all",
					"white-space": "normal"
				}
			},	
			formatter: function(value, row, index) {
				if(value == undefined || value == '/'){
					return "/";
				}else{
					if(row.encryptionDogFlag==1){
						return '<div class="ipBox"><span class="red">'+value+'</span></div>'
					}else if(row.encryptionDogFlag==2){
						return '<div class="ipBox"><span class="green">'+value+'</span></div>'
					}else{
						return '<div class="ipBox"><span class="default">'+value+'</span></div>'
					}
				}
			}				
		},
		{
			field: "downIpList",
			title:((examType == 2)?"招标文件下载IP":"资格预审文件下载IP") ,
			// title: "资格预审文件下载IP",
			align: "left",
			halign: "left",	
			cellStyle: {
				css: {
					"width": "370px",
					"word-wrap": "break-word",
					"word-break": "break-all",
					"white-space": "normal"
				}
			},
			formatter: function(value,row,index) {
				let str = '<div class="ipBox">';
				for(let i=0; i<value.length;i++){
					if(value[i].flag==1){
						str+='<span class="red">'+value[i].ip+'</span>'
					}else if(value[i].flag==2){
						str+='<span class="green_wrap"><span class="green">'+value[i].ip+'</span><span>（'+value[i].remarks+'）</span></span>'
					}else{
						str+='<span class="default">'+value[i].ip+'</span>'
					}
				}
				str +='</div>';
				return str
			}								
		},
		{
			field: "uploadIpList",
			title: ((examType == 2)?"投标文件上传IP":"资格预审申请文件上传IP"),
			// title: "资格预审申请文件上传IP",
			align: "left",
			halign: "left",	
			cellStyle: {
				css: {
					"width": "370px",
					"word-wrap": "break-word",
					"word-break": "break-all",
					"white-space": "normal"
				}
			},	
			formatter: function(value,row,index) {
				let str = '<div class="ipBox">';
				for(let i=0; i<value.length;i++){
					if(value[i].flag==1){
						str+='<span class="red">'+value[i].ip+'</span>'
					}else if(value[i].flag==2){
						str+='<span class="green_wrap"><span class="green">'+value[i].ip+'</span><span>（'+value[i].remarks+'）</span></span>'
					}else{
						str+='<span class="default">'+value[i].ip+'</span>'
					}
				}
				str +='</div>';
				return str
			}	
		},
		{
			field: "decryptIpList",
			title: '开标解密IP',
			visible: ((isShowScreen=='0'&&examType == 2)?true: false),
			align: "left",
			halign: "left",	
			cellStyle: {
				css: {
					"width": "370px",
					"word-wrap": "break-word",
					"word-break": "break-all",
					"white-space": "normal"
				}
			},	
			formatter: function(value,row,index) {
				let str = '<div class="ipBox">';
				for(let i=0; i<value.length;i++){
					if(value[i].flag==1){
						str+='<span class="red">'+value[i].ip+'</span>'
					}else if(value[i].flag==2){
						str+='<span class="green_wrap"><span class="green">'+value[i].ip+'</span><span>（'+value[i].remarks+'）</span></span>'
					}else{
						str+='<span class="default">'+value[i].ip+'</span>'
					}
				}
				str +='</div>';
				return str
			}	
		},
		{
			field: "payId",
			title: "购标情况支付用户ID",
			align: "center",
			cellStyle: {
				css: {
					"min-width": "120px",
					"word-wrap": "break-word",
					"word-break": "break-all",
					"white-space": "normal"
				}
			},
			formatter: function(value, row, index) {
				if(value == undefined || value == '/'){
					return "/";
				}else{
					if(row.payIdFlag==1){
						return '<div class="ipBox"><span class="red">'+value+'</span></div>'
					}else if(row.payIdFlag==2){
						return '<div class="ipBox"><span class="green">'+value+'</span></div>'
					}else{
						return '<div class="ipBox"><span class="default">'+value+'</span></div>'
					}
				}
			}
		},
	{
			field: "disknum",
			title: "硬盘序列号",
			align: "center",
			cellStyle: {
				css: {
					"min-width": "120px",
					"word-wrap": "break-word",
					"word-break": "break-all",
					"white-space": "normal"
				}
			},
			formatter: function(value, row, index) {
				if(value == undefined || value == '/'){
					return "/";
				}else{
					if(row.disknumFlag==1){
						return '<div class="ipBox"><span class="red">'+value+'</span></div>'
					}else if(row.disknumFlag==2){
						return '<div class="ipBox"><span class="green">'+value+'</span></div>'
					}else{
						return '<div class="ipBox"><span class="default">'+value+'</span></div>'
					}
				}
			}
		}/*	,
		{
			field: "boardnum",
			title: "主板序列号",
			align: "center",
			cellStyle: {
				css: {
					"min-width": "120px",
					"word-wrap": "break-word",
					"word-break": "break-all",
					"white-space": "normal"
				}
			},									
		},
		{
			field: "cpunum",
			title: "CPU序列号",
			align: "center",
			cellStyle: {
				css: {
					"min-width": "120px",
					"word-wrap": "break-word",
					"word-break": "break-all",
					"white-space": "normal"
				}
			},									
		},
		*/
		]
	});
	$('#macList').bootstrapTable("load",macData); //重载数据;
}

function tableMac2(){
	$('#macList2').bootstrapTable({
		pagination: false,

		undefinedText: "/",
		columns: [
		{
		    field: "xuhao",
			title: "序号",
			align: "center",
			halign: "center",
			width: "50px",
			formatter: function(value, row, index) {
				return index + 1;
			},
		},{
			field: "bidderName",
			title: "投标人",
			align: "left",
			formatter: function (value, row, index) {
				return showBidderRenameMark(row.bidderId, value, RenameData, 'mainTable');
			}
		},
		{
			field: "mac",
			title: "物理地址",
			align: "left",
			halign: "left",	
			cellStyle: {
				css: {
					"min-width": "120px",
					"word-wrap": "break-word",
					"word-break": "break-all",
					"white-space": "normal"
				}
			},	
			formatter: function(value,row,index) {
				if(row.macFlag==1){
					return '<div class="ipBox"><span class="red">'+row.mac+'</span></div>'
				}else if(row.macFlag==2){
					return '<div class="ipBox"><span class="green">'+row.mac+'</span></div>'
				}else{
					return '<div class="ipBox"><span class="default">'+row.mac+'</span></div>'
				}
				
			}
		},
		{
			field: "caCertificate",
			title: "CA证书序列号",
			align: "center",
			cellStyle: {
				css: {
					"min-width": "120px",
					"word-wrap": "break-word",
					"word-break": "break-all",
					"white-space": "normal"
				}
			},
			formatter: function(value, row, index) {
				if(value == undefined){
					return "/";
				}else{
					return value;
				}
			}		
		},
		{
			field: "encryptionDog",
			title: "造价软件加密锁号",
			align: "center",
			cellStyle: {
				css: {
					"min-width": "120px",
					"word-wrap": "break-word",
					"word-break": "break-all",
					"white-space": "normal"
				}
			},	
			formatter: function(value, row, index) {
				if(value == undefined){
					return "/";
				}else{
					return value;
				}
			}				
		},
		{
			field: "downIpList",
			// title: "招标文件下载IP",
			title: "资格预审文件下载IP",
			align: "left",
			halign: "left",	
			cellStyle: {
				css: {
					"width": "370px",
					"word-wrap": "break-word",
					"word-break": "break-all",
					"white-space": "normal"
				}
			},
			formatter: function(value,row,index) {
				let str = '<div class="ipBox">';
				for(let i=0; i<value.length;i++){
					if(value[i].flag==1){
						str+='<span class="red">'+value[i].ip+'</span>'
					}else if(value[i].flag==2){
						str+='<span class="green_wrap"><span class="green">'+value[i].ip+'</span><span>（'+value[i].remarks+'）</span></span>'
					}else{
						str+='<span class="default">'+value[i].ip+'</span>'
					}
				}
				str +='</div>';
				return str
			}								
		},
		{
			field: "uploadIpList",
			// title: "投标文件上传IP",
			title: "资格预审申请文件上传IP",
			align: "left",
			halign: "left",	
			cellStyle: {
				css: {
					"width": "370px",
					"word-wrap": "break-word",
					"word-break": "break-all",
					"white-space": "normal"
				}
			},	
			formatter: function(value,row,index) {
				let str = '<div class="ipBox">';
				for(let i=0; i<value.length;i++){
					if(value[i].flag==1){
						str+='<span class="red">'+value[i].ip+'</span>'
					}else if(value[i].flag==2){
						str+='<span class="green_wrap"><span class="green">'+value[i].ip+'</span><span>（'+value[i].remarks+'）</span></span>'
					}else{
						str+='<span class="default">'+value[i].ip+'</span>'
					}
				}
				str +='</div>';
				return str
			}	
		}
		]
	});
	$('#macList2').bootstrapTable("load",macData); //重载数据;
}



function searchip(){
	var val=$("#ip").val()
	macLists(val)
}
 
//下载招标文件Zip
$('.tenderFile').off("click").click(function(){
	var filesname = tendersFileData[0].fileName.substring(0,tendersFileData[0].fileName.lastIndexOf("."));
	filesname = filesname + '.zip';
	var newUrl =downLoadZip+'?Token='+token + '&bidSectionId=' + bidSectionId + '&examType=' + examType;
	// var newUrl =dowoloadFileUrl+'?Token='+token + '&ftpPath=' + fileUrl + '&fname=' + filesname;
	window.location.href = encodeURI(newUrl);
})

//一键打包下载投标文件Zip
$('.bidFileBatch').off("click").click(function(){
	if(examType == 2){
		if(ABflag){
			var newUrl = bidFileBatchIsEndUrl+'?Token='+token + '&bidSectionId=' + bidSectionId;
			window.location.href = encodeURI(newUrl);
		}else{
			var newUrl = bidFileBatchUrl+'?Token='+token + '&bidSectionId=' + bidSectionId;
			window.location.href = encodeURI(newUrl);
		}
	}else{
		var newUrl = pretrialFileBatchUrl+'?Token='+token + '&bidSectionId=' + bidSectionId;
		window.location.href = encodeURI(newUrl);
	}
})
 
var findFileListByOrderUrl = config.depositHost +'/FileController/findFileListByOrder';

// 附件列表
function fileTable(res) {

	$('#fileTables').bootstrapTable({
		data:res.data,
		pagination: false, // 是否启用分页
		search: false, // 不显示 搜索框
		classes: 'table table-bordered', // Class样式
		clickToSelect: true, //是否启用点击选中行
		silent: true, // 必须设置刷新事件
		undefinedText: "",

		showLoading: false, //隐藏数据加载中提示状态(在弹窗页面中使用bootstrapTable会产生此问题,需做此设置)
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
				field: "supplierName",
				title: "上传供应商",
				align: "left",
				halign: "left"
			},
			{
				field: "fileName",
				title: "文件名称",
				align: "left",
				halign: "left"
			},
			{
				field: "fileSize",
				title: "文件大小",
				align: "center",
				halign: "center"
			},
			{
				field: "subDate",
				title: "创建时间",
				align: "center",
				halign: "center"
			},
			{
				field: "",
				title: "操作",
				width: '200px',
				halign: "center",
				align: "center",
				
				formatter: function(value, row, index) {
					// var filesnames = row.fileName.substring(row.fileName.lastIndexOf(".") + 1).toUpperCase();
					var mixtbody = ""
					mixtbody += "<a href='javascript:void(0)' class='btn btn-primary btn-xs'  style=\"color:#FFFFFF\" onclick='fileDownload(\"" + row.filePath + "\",\"" + row.fileName + "\")'>下载</a>&nbsp;&nbsp";
					return mixtbody
				}

			}
		]
	});
}
/* *************************           预警          ********************** */
//投标文件投标人
function warnLists(){
	$.ajax({
		type:"post",
		url:warnUrl,
		async:false,
		beforeSend: function(xhr){
			xhr.setRequestHeader("Token",token);
		},
		data: {
			'packageId':bidSectionId,
		},
		success: function(res){
			if(res.success){
				warnData=res.data;
				var supplierLinkData = getHideSupplierLinkBiddingCard(bidSectionId,examType);
				isShowCard=supplierLinkData.isShowCard||supplierLinkData.isShowCard==0?supplierLinkData.isShowCard:1;
				isShowScreen=supplierLinkData.isShowScreen||supplierLinkData.isShowScreen==0?supplierLinkData.isShowScreen:1;
				tableWarn()
			}
		}
	});
}
function tableWarn(){
	$('#warningList').bootstrapTable({
		pagination: false,
	
		undefinedText: "/",
		columns:[
			{
				field: "xuhao",
				title: "序号",
				align: "center",
				halign: "center",
				width: "50px",
				formatter: function(value, row, index) {
					return index + 1;
				},
			},{
				field: "supplierName",
				title: "投标人",
				align: "left",
				formatter: function (value, row, index) {
					return showBidderRenameMark(row.supplierId, value, RenameData, 'mainTable');
				}
			},{
				field: "supplierLinkMens",
				title: "联系人",
				align: "left",
				cellStyle: {
					css: {
						"min-width": "80px",
						"word-wrap": "break-word",
						"word-break": "break-all",
						"white-space": "normal"
					}
				},
				formatter: function(value,row,index) {
					if(value){
						let str = '<div class="ipBox">';
						for(let i=0; i<value.length;i++){
							if(value[i].valueFlag==1){
								str+='<span class="red">'+(value[i].value?value[i].value:'')+'</span>'
							}else if(value[i].valueFlag==2){
								str+='<span class="green_wrap"><span class="green">'+(value[i].value?value[i].value:'')+'</span></span>'
							}else{
								str+='<span class="default">'+(value[i].value?value[i].value:'')+'</span>'
							}
						}
						str +='</div>';
						return str
					}else{
						return '/'
					}
				}
			},{
				field: "supplierLinkPhones",
				title: "手机号",
				align: "left",
				cellStyle: {
					css: {
						"min-width": "120px",
						"word-wrap": "break-word",
						"word-break": "break-all",
						"white-space": "normal"
					}
				},
				formatter: function(value,row,index) {
					if(value){
						let str = '<div class="ipBox">';
						for(let i=0; i<value.length;i++){
							if(value[i].valueFlag==1){
								str+='<span class="red">'+(value[i].value?value[i].value:'')+'</span>'
							}else if(value[i].valueFlag==2){
								str+='<span class="green_wrap"><span class="green">'+(value[i].value?value[i].value:'')+'</span></span>'
							}else{
								str+='<span class="default">'+(value[i].value?value[i].value:'')+'</span>'
							}
						}
						str +='</div>';
						return str
					}else{
						return '/'
					}
				}
			},{
				field: "supplierLinkEmails",
				title: "邮箱号",
				align: "left",
				cellStyle: {
					css: {
						"min-width": "120px",
						"word-wrap": "break-word",
						"word-break": "break-all",
						"white-space": "normal"
					}
				},
				formatter: function(value,row,index) {
					if(value){
						let str = '<div class="ipBox">';
						for(let i=0; i<value.length;i++){
							if(value[i].valueFlag==1){
								str+='<span class="red">'+value[i].value+'</span>'
							}else if(value[i].valueFlag==2){
								str+='<span class="green_wrap"><span class="green">'+value[i].value+'</span></span>'
							}else{
								str+='<span class="default">'+value[i].value+'</span>'
							}
						}
						str +='</div>';
						return str
					}else{
						return '/'
					}
				}
			},
			{
				field: 'linkCardTypes',
				title: '下载联系人证件类型',
				align: 'center',
				visible: isShowCard=='0'?true: false,
				formatter: function(value) {
					if(value){
						let str = '';
						for(let i=0; i<value.length;i++){
							if (value[i].value == '1') {
								str += '护照<br>'
							} else if (value[i].value == '0') {
								str += '身份证<br>'
							}
						}
						return str
					}else{
						return '/'
					}
				}
			},
			{
				field: "linkCards",
				title: "下载联系人证件号",
				visible: isShowCard=='0'?true: false,
				align: "left",
				// cellStyle: function(value, row, index) {
				// 	if(row.supplierLinkCardFlag==1){
				// 		return {css:{'white-space':'nowrap',"width":"150px","background-color":"#ffe7e7","color":"red"}}
				// 	}else if(row.supplierLinkCardFlag==2){
				// 		return {css:{'white-space':'nowrap',"width":"150px","background-color":"#d4ffd3","color":"green"}}
				// 	}else{
				// 		return {css:{'white-space':'nowrap',"width":"150px"}}
				// 	}
				// },
				formatter: function(value) {
					if(value){
						let str = '<div class="ipBox">';
						for(let i=0; i<value.length;i++){
							if(value[i].valueFlag==1){
								str+='<span class="red">'+(value[i].value?value[i].value:'')+'</span>'
							}else if(value[i].valueFlag==2){
								str+='<span class="green_wrap"><span class="green">'+(value[i].value?value[i].value:'')+'</span></span>'
							}else{
								str+='<span class="default">'+(value[i].value?value[i].value:'')+'</span>'
							}
						}
						str +='</div>';
						return str
					}else{
						return '/'
					}
				}
				
			},
			{
				field: "bidderProxy",
				title: "投标人代表",
				align: "left",
				cellStyle: {
					css: {
						"min-width": "100px",
						"word-wrap": "break-word",
						"word-break": "break-all",
						"white-space": "normal"
					}
				},
				formatter: function(value,row,index) {
					if(value){
						return '<div class="ipBox"><span class="'+(row.bidderProxyFlag==1?'red':row.bidderProxyFlag==2?'green':'default')+'">'+value+'</span></div>';
					}
				}
			},{
				field: 'bidderProxyCardType',
				title: '证件类型',
				align: 'center',
				formatter: function(value) {
					if (value == '1') {
						return '护照'
					} else if (value == '0') {
						return '身份证'
					}
				}
			}, 
			{
				field: "bidderProxyCard",
				title: "证件号码",
				align: "left",
				cellStyle: {
					css: {
						"min-width": "100px",
						"word-wrap": "break-word",
						"word-break": "break-all",
						"white-space": "normal"
					}
				},
				formatter: function(value,row,index) {
					if(value){
						return '<div class="ipBox"><span class="'+(row.bidderProxyCardFlag==1?'red':row.bidderProxyCardFlag==2?'green':'default')+'">'+value+'</span></div>';
					}
				}
			},
			{
				field: "projectLeader",
				title: "项目负责人",
				align: "left",
				halign: "left",	
				cellStyle: {
					css: {
						"min-width": "120px",
						"word-wrap": "break-word",
						"word-break": "break-all",
						"white-space": "normal"
					}
				},
				formatter: function(value,row,index) {
					if(value){
						return '<div class="ipBox"><span class="'+(row.projectLeaderFlag==1?'red':row.projectLeaderFlag==2?'green':'default')+'">'+value+'</span></div>';
					}
				}
			},
			{
				field: 'projectLeaderCardType',
				title: '证件类型',
				align: 'center',
				formatter: function(value) {
					if (value == '1') {
						return '护照'
					} else if (value == '0') {
						return '身份证'
					}
				}
			},
			{
				field: "projectLeaderCard",
				title: "证件号码",
				align: "left",
				cellStyle: {
					css: {
						"min-width": "100px",
						"word-wrap": "break-word",
						"word-break": "break-all",
						"white-space": "normal"
					}
				},
				formatter: function(value,row,index) {
					if(value){
						return '<div class="ipBox"><span class="'+(row.projectLeaderCardFlag==1?'red':row.projectLeaderCardFlag==2?'green':'default')+'">'+value+'</span></div>';
					}
				}
			},
			{
				field: 'registerLinkMen',
				title: '注册联系人',
				visible: isShowCard=='0'?true: false,
				align: 'center',
				cellStyle: function(value, row, index) {
					if(row.registerLinkMenFlag==1){
						return {css:{'white-space':'nowrap',"width":"150px","background-color":"#ffe7e7","color":"red"}}
					}else if(row.registerLinkMenFlag==2){
						return {css:{'white-space':'nowrap',"width":"150px","background-color":"#d4ffd3","color":"green"}}
					}else{
						return {css:{'white-space':'nowrap',"width":"150px"}}
					}
				}
			}, {
			    field: 'registerLinkPhone',
			    title: '注册联系人手机号',
				visible: isShowCard=='0'?true: false,
			    align: 'center',
				cellStyle: function(value, row, index){
					if(row.registerLinkPhoneFlag==1){
						return {css:{'white-space':'nowrap',"width":"150px","background-color":"#ffe7e7","color":"red"}}
					}else if(row.registerLinkPhoneFlag==2){
						return {css:{'white-space':'nowrap',"width":"150px","background-color":"#d4ffd3","color":"green"}}
					}else{
						return {css:{'white-space':'nowrap',"width":"150px"}}
					}
				},
			},{
			    field: 'registerLinkCardType',
			    title: '注册联系人证件类型',
			    align: 'center',
				visible: isShowCard=='0'?true: false,
				formatter: function(value) {
					if (value == '1') {
						return '护照'
					} else if (value == '0') {
						return '身份证'
					}
				}
			},  {
			    field: 'registerLinkCard',
			    title: '注册联系人证件号',
				visible: isShowCard=='0'?true: false,
			    align: 'center',
				cellStyle: function(value, row, index){
					if(row.registerLinkCardFlag==1){
						return {css:{'white-space':'nowrap',"width":"150px","background-color":"#ffe7e7","color":"red"}}
					}else if(row.registerLinkCardFlag==2){
						return {css:{'white-space':'nowrap',"width":"150px","background-color":"#d4ffd3","color":"green"}}
					}else{
						return {css:{'white-space':'nowrap',"width":"150px"}}
					}
				},
			}
		]
	});
	$('#warningList').bootstrapTable("load",warnData); //重载数据;
};
function isShowSupplierInfo(id, exam, stage, callback){
	$.ajax({
	 	type:"post",
	   	url: top.config.OpenBidHost + '/HideBidController/getHideData.do', //获取登录人信息,
		data: {
			'bidSectionId': id,
			'examType':exam,
			'stage': 'review'
		},
		beforeSend: function(xhr){
			xhr.setRequestHeader("Token",token);
		},
	   	async:false,
	   	success: function(data){
	   		if(data.success){
				if(data.data.isShowSupplier == 1 || data.data.isShowBidFile ==1){
					$('.bidderHide').show();
				}
	   		}else{
				top.layer.alert(data.message)
			}
	   	},
	   	error: function(){
	   		
	   	},
	})
}
//是否显示提示信息
function getExplainState(id, exam){
	var result;
	$.ajax({
	 	type:"post",
	   	url: top.config.Reviewhost + '/ReviewControll/getShowExplainState.do', //获取登录人信息,
		data: {
			'bidSectionId': id,
			'examType':exam,
		},
	   	async:false,
		beforeSend: function(xhr){
			xhr.setRequestHeader("Token",token);
		},
	   	success: function(data){
	   		if(data.success){
				result = data.data;
	   		}else{
				top.layer.alert(data.message)
			}
	   	},
	   	error: function(){
	   		
	   	},
	});
	return result;
}