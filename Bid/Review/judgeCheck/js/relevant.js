var token=sessionStorage.token;
var bidSectionId;//标段Id
var examType;
var nodeType, nodeSubType;
var reviewFlowNodeUrl=config.Reviewhost+"/ReviewControll/review";//评标流程环节路由
var dowoloadFileUrl = config.FileHost + "/FileController/download.do"; //下载文件
var tendersFileData=[],FileSupplementData=[],bidFileData=[],bondData=[],clarifyData=[],suppliersData=[];
var openData = [];
var jinurl=config.Reviewhost+"/ReviewControll/findCheckFlowInfo.do";//评标进度
var bidFileUrl = config.tenderHost + "/BidFileController/downloadFile.do";//投标文件
var pretrialFileUrl = config.tenderHost + "/PretrialFileController/downloadFile.do";//投标文件
var bidUrl = config.Reviewhost + '/ProjectController/findBidSectionInfo.do';//标段相关信息
var isPublicProject;//是否公共资源

var fileUrl = '';//招标文件源文件地址
$(function(){
    bidSectionId=getUrlParam("bidSectionId");//标段Id
    examType=getUrlParam("examType");
    nodeType=getUrlParam("nodeType");
    nodeSubType=getUrlParam("nodeSubType");
    getBidInfo(bidSectionId,examType)
	$.ajax({
		type:"post",
		url:jinurl,
		async:true,
		beforeSend: function(xhr){
	       xhr.setRequestHeader("Token",token);
	    },
		data: {
			'bidSectionId':bidSectionId,
			'examType':examType,
		},
		success: function(res){
			if(res.success){
				if(res.data.checkResult == 0){
					$('#openList').css('display','none');
					$('#bidFileList').css('display','none');
					$('#bondList').css('display','none');
				}
			}
		}
	});
	$('title').html(siteInfo.sysTitle);

    getBidFile(function (data){
        tendersFileData = data.docClarifyItems;//招标文件
        tendersFileLists();

        if(data.bidOpening){
            data.bidOpening.fileName = '开标记录表';
            openData.push(data.bidOpening);//开标一览表
            openLists();
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
        }else{
            $('.bidFileList').hide();
		}

        if(data.biddingDeposits && data.biddingDeposits.length>0){
            bondData=data.biddingDeposits;//保证金缴纳情况
            bondLists();
        }else{
            $('.bondList').hide();
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
        "method":"findFiles",
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
                    top.layer.alert('温馨提示：'+res.message);
                }else{
                    top.layer.alert("温馨提示：接口不存在");
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
			align: "center",
			
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
//						content: top.config.FileHost + "/FileController/fileView.do?ftpPath=" + row.fileUrl+'&Token='+token
						content: siteInfo.sysUrl + '/media/js/pdfjs/web/viewer.html?file='+top.config.FileHost + '/fileView'+row.fileUrl
					})
				}
			},
			formatter: function(value, row, index) {
				var btn1="<a href='javascript:void(0)' class='btn-sm btn-primary' id='download' style='text-decoration:none'><span class='glyphicon glyphicon-download' aria-hidden='true'></span>下载</a>&nbsp;&nbsp;"
				var btn2="<a  href='javascript:void(0)' class='btn-sm btn-primary' id='picture' style='text-decoration:none'><span class='glyphicon glyphicon-picture' aria-hidden='true'></span>&nbsp预览</a>"
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
//						content: top.config.FileHost + "/FileController/fileView.do?ftpPath=" + row.pdfUrl+'&Token='+token
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
						// btn: ["关闭"],
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
						// btn: ["关闭"],
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
				return btn1 + btnLoad;
			},
		}
			
		]
	});
	$('#bidFileList').bootstrapTable("load",suppliersData); //重载数据
}
//保证金递交情况
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
					return '其他 ';
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
	var cashTable = $('#bondList')
    var columns = cashTable.bootstrapTable('getVisibleColumns');
    $('#cash-tip').remove();
    $('<p id="cash-tip" class="red" style="margin: 6px 12px;">当发现“' +columns[2].title+ '”标红显示，且与“' +columns[1].title+ '”相同时，可能是因为名称中带括号，系统区分全角和半角所致</p>').insertAfter(cashTable);
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
						// btn: ["关闭"],
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
//下载招标文件Zip
$('.tenderFile').click(function(){
	var filesname = tendersFileData[0].fileName.substring(0,tendersFileData[0].fileName.lastIndexOf("."));
	filesname = filesname + '.zip';
	var newUrl =dowoloadFileUrl+'?Token='+token + '&ftpPath=' + fileUrl + '&fname=' + filesname;
	window.location.href = encodeURI(newUrl);
});
function getBidInfo(id,type){
	$.ajax({
		type:"post",
		url:bidUrl,
		async:true,
		beforeSend: function(xhr){
	       xhr.setRequestHeader("Token",token);
	    },
		data: {
			'bidSectionId': id,
			'examType': type
		},
		success: function(res){
			if(res.success){
				//是否公共资源
				isPublicProject = res.data.isPublicProject;
				if(isPublicProject == 1){//公共资源没有招标文件变更，公共资源招标文件变更只能变更文件
					$('.bid_file').hide()
				}
//              callback(res.data)
            }else{
                if(res.message != '404'){
                    top.layer.alert('温馨提示：'+res.message);
                }else{
                    top.layer.alert("温馨提示：接口不存在");
                }
            }
		}
	});
}
