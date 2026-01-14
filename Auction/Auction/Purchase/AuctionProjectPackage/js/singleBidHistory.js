var urlOfferHistoryInfo = top.config.AuctionHost + '/AuctionProjectPackageController/getPurchaseDetail.do';
var findCheck = top.config.AuctionHost + '/AuctionProjectPackageController/findAuctionSuperviseList.do';
var urlSaveSupervise = top.config.AuctionHost + '/AuctionSuperviseController/saveOrUpdateAuctionSupervise.do';
var WorkflowTypeUrl = top.config.AuctionHost + "/WorkflowController/findWorkflowCheckerByType.do" //项目审核人列表数据接口
var getOfferListUrl = top.config.AuctionHost + "/PurFileController/list.do"; //查看附件

var urlGetCheckReal = top.config.AuctionHost + "/WorkflowController/findWorkFlowRecords"; // 查询审核记录


//竞价项目
var urlViewAuctionInfo = top.config.AuctionHost + "/AuctionProjectPackageController/viewAuction.do";
var urlfindBidFileDownload = top.config.AuctionHost + "/BidFileDownloadController/findBidFileDownload.do" //采购文件下载记录明细
//最终报价接口
var urlUpdateLastMoney = top.config.AuctionHost + "/AuctionProjectPackageController/updateLastMoney.do";
var urlDownloadAuctionFile = top.config.FileHost + "/FileController/download.do"; //下载竞价文件地址
var urlHistoryInfo = "Auction/Auction/Purchase/AuctionProjectPackage/model/detailItemSupplier.html"
var url = window.location.search;
let urlGetResultAuditsUser = top.config.AuctionHost + "/WorkflowController/reviewApprovePerson"
var urlAuditProcess = top.config.AuctionHost + "/WorkflowController/checkJJCGWorkFlowOver"
//保存审核人
let urlSaveResultAudits = top.config.AuctionHost + "/WorkflowController/saveWorkflowAccepList.do"
//撤回审核人
let urlRealBack = top.config.AuctionHost + "/WorkflowController/recallWorkflow";
var singleOfferListUrl = top.config.AuctionHost + '/AuctionSfcSingleOfferesController/getSingleOriginatorOfferesList.do'
var LastThreeOfferUrl = top.config.AuctionHost + '/AuctionSfcSingleOfferesController/getLastThreeOfferes.do'
var urlLive0Check = top.config.AuctionHost + "/WorkflowController/addDataToJJCGRecord"


var excelExportUrl = top.config.AuctionHost + '/AuctionSfcSingleOfferesController/excelExport.do'
var downloadFileListUrl = top.config.AuctionHost + '/AuctionSfcSingleOfferesController/downloadFileList.do'


var projectId = getUrlParam("projectId");
var packageId = getUrlParam("id");
var createType = getUrlParam("createType") || 0;
var type = getUrlParam("type");
var tType = getUrlParam("tType");
var auctionOfferItems = []; //报价记录
var auctionDetaileItems = []; //明细记录
var tempAuctionOfferItems = [];
var tempAuctionOfferItems1 = [];
var tempAuctionDetailed = [];
var status; //业主代表审核状态
var itemState = "";
var AuctioningDetailedId = ""; //明细的id

var isWorkflow = ""; //是否有审核人  0 没有 1为有
var isCheck = false; //是否设置流程
var WORKFLOWTYPE = "psbg"; //申明项目公告类型
var isAgent = getUrlParam("isAgent");//是否代理项目
var supervisorCheck = true; //业主代表是否审核完毕
//查询采购审核
var workflowLevel = 0;
//是否为提交过审核人
var isReloadCheck = false;
var isEndCheck;

var detailedId = "";

var offerData = "";
var RenameData = {};//投标人更名信息
$(function () {
    RenameData = getBidderRenameData(projectId);//供应商更名信息
    getOfferInfo();
	getResultAuditsLive();
    getOfferFileInfo(projectId);
    //setPurchaseFileDownloadDetail(packageId);
    buyFileDetail(packageId); //购买文件记录
	if(isAgent == 1) {
		warnLists(packageId, 'jj', true,null,null,projectId,'1','1');
	}else{
		warnLists(packageId, 'jj', false,null,null,projectId,'1','1');
	}
    
    initBtnEvent()
    // testurl()
    // if (tType != null) {
    //     var result = JSON.parse(sessionStorage.getItem("auctionresult"));
    //     //		getMsg(result);
    // }
    // 竞价文件提交信息列表

    // WorkflowUrl();

    // detailItem();
	
    // if (createType == 1) {
    //     $(".modify").hide();
    //     $('.zzbj').attr('readonly', true);
    //     //$("#detailItemSupplier").hide();
    //     $("#againDetailItemSupplier").hide();
    //     $(".chooseSuppler").hide();
    //     $("#commitBtn").hide();
    // }
});
function initBtnEvent() {
    $('#btnExcelDownload').click(function () {
        var newUrl = excelExportUrl + "?packageId=" + packageId;
        window.location.href = $.parserUrlForToken(newUrl);
    })
    $('#btnFileListDownload').click(function () {
        var newUrl = downloadFileListUrl + "?packageId=" + packageId;
        window.location.href = $.parserUrlForToken(newUrl);
    })
    $("#btn_close").click(function () {
        var index = parent.layer.getFrameIndex(window.name);
        parent.layer.close(index);
    })
}
// 获取报价列表
function getOfferRank() {
    $.ajax({
        type: "post",
        url: singleOfferListUrl,
        data: { packageId: packageId },
        success: function (res) {
            console.log(res)
            var listData = res.data;
            listData = getEmployeeOfferFileList(listData, 'JJ_AUCTION_SGESUPPLIERTECH_OFFER', 'fileDatas')
            listData = getEmployeeOfferFileList(listData, 'JJ_AUCTION_SGESUPPLIER_OFFER', 'listFileDatas')
            $("#roundRank").bootstrapTable({
                undefinedText: "",
                paganization: false,
                columns: [{
                    title: '排名',
                    width: '50px',
                    align: 'center',
                    formatter: function (value, row, index) {
                        return index + 1;
                    }
                },
                {
                    field: 'supplierEnterpriseName',
                    title: '供应商',
                    align: 'center',
                    formatter:function(value, row, index){					
                        return showBidderRenameList(row.supplierEnterpriseId, value, RenameData, 'body')
                    }

                }, {
                    field: 'noTaxRateTotalPrice',
                    title: '报价总计(不含税)',
                    align: 'center'

                }, {
                    field: 'taxRate',
                    title: '税率(%)',
                    align: 'center'

                }, {
                    field: 'taxRateTotalPrice',
                    title: '报价总计(含税)',
                    align: 'center'

                }, {
                    field: 'offerTime',
                    title: '报价时间',
                    align: 'center'
                },
                {
                    title: '报价文件附件',
                    align: 'left',
                    formatter: function (value, row, index) {
                        var fileDatas = row.fileDatas;
                        if (fileDatas) {
                            var html = "<table class='table' style='border-bottom:none'>";
                            for (var i = 0; i < fileDatas.length; i++) {
                                html += "<tr>";
                                html += "<td>" + fileDatas[i].fileName + "</td>"
                                html += "<td  width='150px;'><span><a href='javascript:void(0)' class='btn btn-primary btn-xs' onclick='openAccessory(\"" + fileDatas[i].fileName + "\",\"" + fileDatas[i].filePath + "\")'>下载</a>&nbsp;"
                                // if (filesnames == 'PNG' || filesnames == 'JPG' || filesnames == 'JPGE' || filesnames == 'PDF') {
                                //     html += "<a href='javascript:void(0)' class='btn btn-primary btn-xs' onclick='previewFile(\"" + filePathArr[i] + "\")'>预览</a>"
                                // }
                                html += "</span></td></tr>";
                            }
                            html += "</table>";
                            return html;
                        } else {
                            return '暂无文件'
                        }
                    }
                },
                {
                    title: '清单文件附件',
                    align: 'left',
                    formatter: function (value, row, index) {
                        var listFileDatas = row.listFileDatas;
                        if (listFileDatas) {
                            var html = "<table class='table' style='border-bottom:none'>";
                            for (var i = 0; i < listFileDatas.length; i++) {
                                html += "<tr>";
                                html += "<td>" + listFileDatas[i].fileName + "</td>"
                                html += "<td  width='150px;'><span><a href='javascript:void(0)' class='btn btn-primary btn-xs' onclick='openAccessory(\"" + listFileDatas[i].fileName + "\",\"" + listFileDatas[i].filePath + "\")'>下载</a>&nbsp;"
                                // if (filesnames == 'PNG' || filesnames == 'JPG' || filesnames == 'JPGE' || filesnames == 'PDF') {
                                //     html += "<a href='javascript:void(0)' class='btn btn-primary btn-xs' onclick='previewFile(\"" + filePathArr[i] + "\")'>预览</a>"
                                // }
                                html += "</span></td></tr>";
                            }
                            html += "</table>";
                            return html;
                        } else {
                            return '暂无文件'
                        }
                    }
                }

                ]
            })
            $("#roundRank").bootstrapTable("load", listData);
        }
    });
}
function getEmployeeOfferFileList(employeeData, modelName, fileName) {
    employeeData.forEach(function (val, index) {
        $.ajax({
            type: "get",
            url: getOfferListUrl,
            async: false,
            data: {
                'modelId': packageId,
                'modelName': modelName,
                'employeeId': val.employeeId
            },
            datatype: 'json',
            success: function (res) {
                if (res.success) {
                    if (fileName) {
                        employeeData[index][fileName] = res.data;
                    } else {
                        employeeData[index].fileDatas = res.data;
                    }
                    $('#btnExcelDownload').show()
                    $('#btnFileListDownload').show()
                }
            }
        });
    })
    return employeeData;
}
function getOfferFileInfo(projectId) {
    $.ajax({
        type: "get",
        url: top.config.AuctionHost + "/AuctionFileController/findAuctionFileDetail.do",
        dataType: 'json',
        data: {
            projectId: projectId,
			'stage':'submit'
        },
        async: false,
        success: function (result) {
            if (result.success) {
                loadAuctionFileCheckState(result.data);
            } else {
                parent.layer.msg(result.message);
            }
        }
    })
}
function loadAuctionFileCheckState(data) {

    $("#AuctionFileCheck").bootstrapTable({
        pagination: false,
        undefinedText: "",
        columns: [{
            title: "序号",
            align: "center",
            halign: "center",
            width: "5%",
            formatter: function (value, row, index) {
                return index + 1;
            }
        }, {
            field: "enterpriseName",
            halign: "left",
            title: "供应商",
            formatter:function(value, row, index){					
                return showBidderRenameList(row.supplierId, value, RenameData, 'body')
            }
        },
        {
            halign: "center",
            title: "竞价文件",
            cellStyle: {
                css: {
                    "padding": "0px"
                }
            },
            formatter: function (value, row, index) {
				if( row.fileName){
					var fileNameArr = row.fileName.split(","); //文件名数组
					var filePathArr = row.filePath.split(",");
					// var filesnames = row.fileName.substring(row.fileName.lastIndexOf(".") + 1).toUpperCase();
					var html = "<table class='table' style='border-bottom:none'>";
					for (var j = 0; j < filePathArr.length; j++) {
					    var filesnames = filePathArr[j].substring(filePathArr[j].lastIndexOf(".") + 1).toUpperCase();
					    html += "<tr>";
					    html += "<td>" + fileNameArr[j] + "</td>"
					    html += "<td  width='150px;'><span><a href='javascript:void(0)' class='btn btn-primary btn-xs' onclick='openAccessory(\"" + fileNameArr[j] + "\",\"" + filePathArr[j] + "\")'>下载</a>&nbsp;"
					    if (filesnames == 'PNG' || filesnames == 'JPG' || filesnames == 'JPGE' || filesnames == 'PDF') {
					        html += "<a href='javascript:void(0)' class='btn btn-primary btn-xs' onclick='previewFile(\"" + filePathArr[j] + "\")'>预览</a>"
					    }
					    html += "</span></td></tr>";
					}
					html += "</table>";
					return html;
				}else{
					return '';
				}
            }
        },
        {
            title: "审核状态",
            align: "center",
            halign: "center",
            width: "10%",
            formatter: function (value, row, index) {
                if (row.checkState == 1) {
                    return "<div class='text-success'>合格</div>";
                } else if (row.checkState == 0) {
                    return "<div class='text-warning'>未审核</div>";
                } else {
                    return "<div class='text-danger'>不合格</div>";
                }
            }
        }
        ]
    })
    $("#AuctionFileCheck").bootstrapTable("load", data);
}

//预览文件
function previewFile(filePath) {
    openPreview(filePath);
}

//下载文件
function openAccessory(fileName, filePath) {
    var newUrl = urlDownloadAuctionFile + "?ftpPath=" + filePath + "&fname=" + fileName;
    window.location.href = $.parserUrlForToken(newUrl);
}
//挂载采购文件下载记录请求
function setPurchaseFileDownloadDetail(uid) {
    //console.log(uid)
    $.ajax({
        type: "get",
        url: urlfindBidFileDownload,
        dataType: 'json',
        data: {
            "packageId": uid
        },
        async: false,
        success: function (result) {
            if (result.success) {
                setPurchaseFileDownloadDetailHTML(result.data) //有记录显示
            } else {
                //top.layer.alert(result.message);
            }
        }
    })
}
//挂载采购文件下载记录
function setPurchaseFileDownloadDetailHTML(data) {

    $("#PurchaseFileDownload").bootstrapTable({
        undefinedText: "",
        pagination: false,
        columns: [{
            title: "序号",
            align: "center",
            width: "50px",
            formatter: function (value, row, index) {
                return index + 1;
            }
        },
        {
            title: "企业名称",
            align: "left",
            field: "enterprise.enterpriseName",
            formatter:function(value, row, index){					
                return showBidderRenameList(row.enterpriseId, value, RenameData, 'body')
            }

        },
        {
            field: "purFile.fileName",
            align: "left",
            title: "文件名称",
        }, {
            field: "subDate",
            align: "center",
            title: "下载时间",
            width: "150",
        }, /*{
				title: "IP地址",
				align: "center",
				width: "100",
				field: 'ip'
			},
			{
				title: "地区",
				align: "center",
				width: "100",
				field: 'area'
			},*/
        {
            title: "联系人",
            align: "center",
            width: "50",
            field: 'linkMan'
        },
        {
            title: "手机号",
            align: "center",
            width: "100",
            field: 'linkTel'
        }, {
            title: "邮箱",
            align: "center",
            width: "150",
            field: 'linkEmail'
        }
        ]

    })
    $("#PurchaseFileDownload").bootstrapTable('load', data);
}
function getMsg(obj) {
	if(offerData.isStopCheck == 1){
		$("#commitBtn").hide();
	}else{
		if (type == 'commit') {
		    //展示提交按钮
		    $("#commitBtn").show();
		}
		status = obj.checkStatus;
		if (status == '未提交') {
		    $("#commitBtn").show();
		}
	}

    if (status == '已提交审核' || status == '审核通过') {
        // $('#freeDetailRank').bootstrapTable('hideColumn', 'bbb');
        // $('#freePackageRank').bootstrapTable('hideColumn', 'aaa');
        // $('#roundRank').bootstrapTable('hideColumn', 'ccc');
        $(".modify").hide();
        $('.zzbj').attr('readonly', true);

        $("#commitBtn").hide();
        //$(".employee").hide();
    }

    if (obj.itemState != undefined) {
        itemState = obj.itemState;
        if (itemState == '1' || itemState == '2' || itemState == '4') {
            //发布公示  审核中  审核通过  无需审核
            // $('#freeDetailRank').bootstrapTable('hideColumn', 'bbb');
            // $('#freePackageRank').bootstrapTable('hideColumn', 'aaa');
            // $('#roundRank').bootstrapTable('hideColumn', 'ccc');
            $(".modify").hide();
            $('.zzbj').attr('readonly', true);
            $("#commitBtn").hide();
            //$(".employee").hide();
        }


    }

    // if(status == '未提交' || status == '审核不通过' || (status == '无需审核' && (itemState=="" || itemState==3))){
    // 	$('#freeDetailRank').bootstrapTable('hideColumn', 'editReason');
    // 	$('#freePackageRank').bootstrapTable('hideColumn', 'editReason');
    // 	$('#roundRank').bootstrapTable('hideColumn', 'editReason');
    // }

}

function commitMsg() {
    top.layer.confirm('你确定提交吗？', {
        btn: ['确定', '取消'] //按钮
    }, function () {
        var sup = {
            projectId: projectId,
            packageId: packageId,
            checkState: '2' //已提交
        }

        $.ajax({
            type: "post",
            url: urlSaveSupervise,
            data: sup,
            async: false,
            dataType: "json",
            success: function (ret) {
                if (ret.success) {
                    parent.$('#OfferList').bootstrapTable('refresh');
                    var index = parent.layer.getFrameIndex(window.name);
                    parent.layer.close(index);
                    //					top.layer.closeAll();
                    top.layer.alert("提交竞价采购情况成功")
                } else {
                    parent.layer.alert("提交竞价采购情况失败！");
                    return;
                }
            }
        });
    })
}
// 获取页面顶部数据 以及部分其他数据
function getOfferInfo() {
    //getCheckList();
    $.ajax({
        url: urlViewAuctionInfo,
        data: {
            packageId: packageId,
            state: 1,
            tenderType: 1,
        },
        async: false,
        success: function (res) {
            if (res.success) {
                var data = res.data;
                offerData = data;
                getMsg(data)
                $("td[id]").each(function () {
                    $(this).html(data[this.id]);

                    //竞价方式
                    if (this.id == "auctionType" && data[this.id] == 7) {
                        $(this).html('单项目竞价')
                    }
                });
                // //判断是否发布结果通知书0为未发布
                // if (offerData.isSendResult == 0) {
                //     if (offerData.isRecItemFile == 0) {
                //         $("#detailItemSupplier").show();
                //     } else {
                //         $("#againDetailItemSupplier").show();
                //     }
                // }

                // 报价排名
                $("#offerRank").html("<table id='roundRank'></table>");
                getOfferRank()
                // $("#offerRecord").html("<div style='width:40%;float: left;'><table id='roundItem'></table></div><div style='width: 60%;float: left;'><table id='roundRecord'></table></div>");
                // roundRank();
                // roundRecord();
                // roundItem();
                //	$("#detail").bootstrapTable("load",)	
                //是否需要业主代表确认及业主代表
                if (data.auctionSupervise.isSupervise == 1) {
                    if (typeof (data.auctionSupervise.userName) != "undefined") {
                        $("#employeeName").html(data.auctionSupervise.userName);
                        $("#checkMes").show();
                        $("#checkPerson").show();
                        getCheckList();
                    } else {
                        $("#employeeName").html("未设置");
                    }
                } else {
                    $("#employeeName").html("无需业主代表");
                }
            }
        }
    });
}
//设置查询条件
function queryParams(params) {
    return {
        'projectId': projectId,
        'packageId': packageId,
    }
}
function getCheckList() {
    $("#checkList").bootstrapTable('destroy');
    //加载数据
    $("#checkList").bootstrapTable({
        url: findCheck,
        dataType: 'json',
        method: 'get',
        cache: false, // 是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
        locale: "zh-CN",
        pagination: false, // 是否启用分页
        showPaginationSwitch: false, // 是否显示 数据条数选择框
        clickToSelect: true, //是否启用点击选中行
        search: false, // 不显示 搜索框
        classes: 'table table-bordered', // Class样式
        queryParams: queryParams, // 请求参数，这个关系到后续用到的异步刷新
        silent: true, // 必须设置刷新事件
        striped: true,
        columns: [
            [{
                //field: 'Id',
                title: '序号',
                align: 'center',
                width: '50px',
                formatter: function (value, row, index) {
                    return index + 1; //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
                }
            },
            {
                field: 'checkState',
                title: '审核状态',
                align: 'center',
                width: '160',
                formatter: function (value, row, index) {
                    if (row.checkState == '0') {
                        return "<span>无需审核</span>";
                    } else if (row.checkState == '1') {
                        supervisorCheck = false;
                        return "<span>未提交</span>";
                    } else if (row.checkState == '2') {
                        return "<span>已提交</span>";
                    } else if (row.checkState == '3') {
                        return "<span>审核通过</span>";
                    } else if (row.checkState == '4') {
                        return "<span>审核未通过</span>";
                    }
                }
            },
            {
                field: 'checkContent',
                title: '审核意见',
                align: 'left'

            },
            {
                field: 'userName',
                title: '审核人',
                align: 'center',
                width: '160'
            },
            {
                field: 'checkDate',
                title: '操作时间',
                align: 'center',
                width: '160'
            }
            ]
        ]
    });
}

function getResultAuditsLive() {
    var table = $("#resultAuditList");
    $.ajax({
        type: "post",
        url: top.config.AuctionHost + '/WorkflowController/findjjcgjgWorkflowLevel',
        async: false,
        success: function (res) {
            if (res.success) {
                if (res.data) {
					if(offerData.isStopCheck == 1){
						$("#doCheck").hide();
					}else{
						$("#doCheck").show();
					}
                    workflowLevel = res.data.workflowLevel;
                    getCheckReal();
                    if (workflowLevel > 0) {
                        $("#resultAuditResMsg").show();
                        $("#resultAuditListTable").show();
                    }
                    for (var i = 1; i <= workflowLevel; i++) {
                        var str = "";
                        switch (i) {
                            case 1:
                                str = "一"
                                break;
                            case 2:
                                str = "二"
                                break;
                            case 3:
                                str = "三"
                                break;
                            case 4:
                                str = "四"
                                break;
                        }
						/*
						var tr = document.createElement("tr");
						tr.innerHTML = "<td  class = 'th_bg' style= 'text-align: left;'>" + str + "级审核员" + "</td>";
						var td = document.createElement("td");
						td.hidden = true;
						td.innerHTML = "<input hidden='true'  id=" + "selectLv" + i + "    style='width: 100%;height: 100%;border: none;'readonly  /> "
						tr.append(td);
						var td2 = document.createElement("td");
						td2.innerHTML = "<input   id=" + "selectLvName" + i + "  onclick = 'selectClick(this.id)'    style='width: 100%;height: 100%;border: none;'readonly  /> "
						tr.append(td2);
						table.append(tr)
						*/
                        var html = "<tr>"
                        html += "<td  class = 'th_bg'  style= 'text-align: left;'>" + str + "级审核员" + "</td>";
                        html += "<td hidden='true'>"
                        html += "<input hidden='true' class='form-control'  id=" + "selectLv" + i + "    style='width: 100%;height: 100%;'readonly  /> ";
                        html += "</td>"
                        html += "<td>"
                        html += "<input class='form-control'  id=" + "selectLvName" + i + "  onclick = 'selectClick(this.id)'    style='width: 100%;height: 100%;'readonly  /> ";
                        html += "</td>"
                        html += "</tr>"
                        table.append(html)
                    }
                    getResultAuditsUser();
                    auditProcess();
                }
            }
        }
    });

}

//添加人员回调函数
function callBackEmployee(ids, names) {
    layer.closeAll();

    $("#" + selectInputId).val(names);

    let id = selectInputId.replace("Name", "");

    $("#" + id).val(ids);

}

//回显采购
function getResultAuditsUser() {
    $.ajax({
        type: "get",
        dataType: 'json',
        url: urlGetResultAuditsUser,
        async: false,
        data: {
            'businessId': packageId
        },
        success: function (res) {
            if (res.success) {
                let js = res.data;
                for (var i = 0; i < js.length; i++) {
                    let j = js[i];
                    let workflowLevel = j.workflowLevel;
                    let name = j.userName;
                    let employeeId = j.employeeId;
                    let eid = i + 1;
                    $("#selectLvName" + eid).val(name);
                    $("#selectLvName" + eid).attr("disabled", "disabled");
                    $("#selectLv" + eid).val(employeeId);
                    //$("#checkReload").show()
                    $("#doCheck").hide()
                }
                if (js.length > 0) {
                    $("#selectLvName" + 1).attr("disabled", "disabled");
                    $("#selectLvName" + 2).attr("disabled", "disabled");
                    $("#selectLvName" + 3).attr("disabled", "disabled");
                    $("#selectLvName" + 4).attr("disabled", "disabled");
                    if (workflowLevel > 0) {
                        isReloadCheck = true;
                        $("#checkReload").hide()
                    }
                }
                if (js.length > 0) {
                    $("#againDetailItemSupplier").hide();
                    $(".rebut").hide();
                }

            }

        }
    })
}

function selectClick(e) {
    selectInputId = e;
    layer.open({
        type: 2,
        area: ['800px', '550px'],
        maxmin: false, //该参数值对type:1和type:2有效。默认不显示最大小化按钮。需要显示配置maxmin: true即可
        resize: false, //是否允许拉伸
        scrollbar: false, // 父页面 滚动条禁止
        // content: '/Auction/Auction/Agent/AuctionProjectPackage/model/getResultAuditList.html',
        content: 'getResultAuditList.html',
        title: '选择流程审批人员',
        success: function (layero, index) {
            var body = parent.layer.getChildFrame('body', index);
            var iframeWin = layero.find('iframe')[0].contentWindow;
            //			iframeWin.$("#employeeId").val(employeeId);
            iframeWin.BindWorkflowCheckerInfo();
        }
    });
}

$("#doCheck").click(function () {
    if (supervisorCheck) {
        if (workflowLevel == 0) {
            top.layer.confirm('温馨提示：该流程未设置审批节点，您是否继续提交？', function () {
                $.ajax({
                    type: "post",
                    url: urlLive0Check,
                    data: { 'businessId': packageId },
                    success: function (res) {
                        parent.layer.msg(res.message);

                        var index = parent.layer.getFrameIndex(window.name);
                        top.layer.close(index);
                    }
                })
            });
        } else {
            var data = [];
            var js = "";

            for (var i = 1; i <= workflowLevel; i++) {
                let workflowLevel = $("#selectLv" + i).val();
                if (workflowLevel.length == 0) {
                    parent.layer.alert("添加审批人员！");
                    return false;
                }
                let p = {
                    "employIds": $("#selectLv" + i).val(),
                    'level': i
                }
                data.push(p);

                // js = JSON.stringify(data)
            }

            $.ajax({
                type: "post",
                dataType: 'json',
                url: urlSaveResultAudits,
                async: false,
                data: {
                    'levelList': JSON.stringify({
                        'levelMsg': data,
                        'packageId': packageId
                    })
                },
                success: function (res) {

                    if (res.success) {
                        var index = parent.layer.getFrameIndex(window.name);
                        top.layer.close(index);
                    } else {
                        parent.layer.msg(res.message);
                    }

                }
            });
        }

    } else {
        parent.layer.alert("业主代表未审核完毕，不能提交采购审核！");
    }
})

//审核撤回
$("#checkReload").click(function () {
    parent.layer.confirm('温馨提示：确定要撤回？', {
        btn: ['是', '否'] //可以无限个按钮
    }, function (index, layero) {
        $.ajax({
            type: "post",
            dataType: 'json',
            url: urlRealBack,
            async: false,
            data: {
                'businessId': packageId,
                'workflowResult': 2
            },
            success: function (res) {
                if (res.success) {
                    parent.layer.msg("撤回成功！");
                    location.reload();
                } else {
                    parent.layer.msg(res.message);
                }
            }
        })
        parent.layer.close(index);
    }, function (index) {
        parent.layer.close(index)
    });


});

function auditProcess() {
    $.ajax({
        type: "get",
        url: urlAuditProcess,
        async: false,
        data: { 'businessId': packageId },
        success: function (res) {
            if (res.success) {
                isEndCheck = true
                if (isReloadCheck && offerData.isStopCheck != 1) {
                    $("#checkReload").show();
                }
            } else {
                $("#checkReload").hide();
                $("#doCheck").hide();
                $("#selectLvName" + 1).attr("disabled", "disabled");
                $("#selectLvName" + 2).attr("disabled", "disabled");
                $("#selectLvName" + 3).attr("disabled", "disabled");
                $("#selectLvName" + 4).attr("disabled", "disabled");
                parent.layer.alert("采购审核流程已完成！");
                isEndCheck = false
            }
        }
    });
   
}
 //回显审核意见
 function getCheckReal() {
	$(".checkRecord").css("display","table-row");
	$("#biddingApprovalList").bootstrapTable({
		url: urlGetCheckReal,
		dataType: 'json',
		method: 'get',
		cache: false, // 是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
		locale: "zh-CN",
		pagination: false, // 是否启用分页
		showPaginationSwitch: false, // 是否显示 数据条数选择框
		clickToSelect: true, //是否启用点击选中行
		search: false, // 不显示 搜索框
		classes: 'table table-bordered', // Class样式
		queryParams: { 'businessId': packageId }, // 请求参数，这个关系到后续用到的异步刷新
		silent: true, // 必须设置刷新事件
		striped: true,
		columns: [{
			//field: 'Id',
			title: '序号',
			align: 'center',
			width: '50px',
			formatter: function (value, row, index) {
				return index + 1; //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
			}
		},
		{
			field: 'workflowResult',
			title: '审核状态',
			align: 'center',
			width: '160',
			formatter: function (value, row, index) {
				if (row.workflowResult == '0') {
					return "<span>审核通过</span>";
				} else if (row.workflowResult == '1') {
					return "<span>审核不通过</span>";
				} else if (row.workflowResult == '2') {
					return "<span>已撤销</span>";
				}

			}
		},
		{
			field: 'workflowContent',
			title: '审核意见',
			align: 'left'

		},
		{
			field: 'userName',
			title: '审核人',
			align: 'center',
			width: '160'
		},
		{
			field: 'subDate',
			title: '操作时间',
			align: 'center',
			width: '160'
		}
		]

	});
}