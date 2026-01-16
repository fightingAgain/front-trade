/*

 */
var url = top.config.AuctionHost;
var loadFile = top.config.FileHost + "/FileController/download.do"; //文件下载
var packageId = getUrlParam("packageId");//包件id
var projectId = getUrlParam("projectId");//项目id
var expertIds = getUrlParam("expertId");//评委id
var examType = getUrlParam("examType");//资格审查方式
var createType = getUrlParam("createType"); //0自己本人创建  1非本人创建
var tenderType = getUrlParam("tenderType");//采购方式
var isAgent = getUrlParam("isAgent");//是否代理项目
var _thisId = 'progress';//当前菜单id
var _THISID = "";//当前点击菜单id，当点击进入之后运行成功了即可赋值，不成功即为上一个点击菜单的id；
var _checkType = "";//评审类型
var thisFrame = parent.window.document.getElementById("packageclass").getElementsByTagName("iframe")[0].id;
var dcmt = parent.$('#' + thisFrame);//获取父级id
var isStopCheck = "";//是否项目失败
var offersData = new Array();
var offerDetailedData = new Array();
var packageDetailedData = new Array();
var purFilesData = new Array();
var purOfferFilesData = new Array();
var checkPlan;//评审方式：0综合评分法，1最低评标价法，3最低投标价法，2、经评审的最低价法(价格评分) 4、经评审的最高投标价法 5经评审的最低投标价法
var progressList;//进度对象
var liData = new Array();
var fileSource;
var changType = true;
var keepNum = "";
var quotePriceUnit; //报价单位
var keepNum = "";
var isLeader, isPriceCheck, isTotalCheck;//isLeader评委  空无评委组长 0不是评委组长 1是组长; isPriceCheck价格评审执行人0 项目经理 1 评委; isTotalCheck评审汇总执行人 0 项目经理 1 评委
var alertHaltReminder = false, timeStep;//是否已弹出停机提醒、定时器
var signTimer="";
var userInfo = entryInfo();
//初始化
$(function () {
    var _h = parent.$('#' + thisFrame).height();
    $("#menu").height(_h - 95);

    getData();
    if (examType == 1) {
        getPriceUnit(); //报价单位
    }
    // 页面切换点击事件
    $(document).off("click", '#menu .keEdit,#menu .nowEdit').on('click', '#menu .keEdit,#menu .nowEdit', function () {
		$('#btnSign, #btnConfirm, #btnSignReport').hide();
        $("#detaildivList").html("")//头部内容清空

        $(this).addClass('xEdit').siblings().removeClass('xEdit');//选择标签添加选中样式
        var thisPage = $(this).attr("data-url");//获取标签对应的页面路径
        _thisId = this.id;//获取标签id
        getData();//调用
        if ((examType == 1 && progressList.doubleEnvelope == 1 && this.id == "PriceFile") && (((progressList.isAutoOrder == 0 || !progressList.isAutoOrder) && (progressList.isRecommendExpert == 1 && progressList.recommendStatus == '已完成' || progressList.isSendMess == 1)) || (progressList.isAutoOrder == 1 && progressList.autoReOrderShow == 1))) {
            $(".envelopeLevelFile").show();
            if (progressList.isShowOfferTab != 1) {
                $('.envelopeLevelFile2').show();
            }
        } else {
            $(".envelopeLevelFile").hide();
            $(".envelopeLevelFile2").hide();
        }
        _checkType = $(this).attr("data-checktype")//如果存在评审类型获取评审类型
        if (typeof (thisPage) != "undefined") {
			if(progressList && progressList.isAutoOrder == 1 && (!progressList.autoReOrderShow || progressList.autoReOrderShow == 0)){
				if(!progressList.isRecommendExpert || progressList.isRecommendExpert === 0){
					$('#projectData').addClass('xEdit').siblings().removeClass('xEdit');//选择标签添加选中样式
					thisPage = 'projectData.html';
					_thisId = 'projectData';
				}
			}
			if(_thisId == 'signPromise'){
				if(signTimer && signTimer != ''){
					clearInterval(signTimer);
					signTimer = '';
					$('#btnSign').html('<span class="glyphicon glyphicon-saved"></span>签章');
				};
			}
			$('#reportContent').html('');//用load()方法跳转对应的页面
            $('#reportContent').load(thisPage);//用load()方法跳转对应的页面
        }
        if (_thisId.length == 32 || _thisId == "priceCheck") {//当为评审项或者价格评审时，
            $("#topHeader").css('min-height', '120px')//头部高度为200
            $("#reportContent").height(_h - 205);//显示内容的高度
        } else {
            $("#topHeader").css('min-height', '80px');
            $("#reportContent").height(_h - 174);//显示内容的高度
        }
    });

    _thisId = liData[0].id;
    $("#" + _thisId).click();
    offerData();
    $("#btnRefresh").on('click', function () {
		/* if(_THISID == 'signPromise'){
			if(signTimer != ''){
				clearInterval(signTimer);
			};
		} */
        $("#" + _THISID).click();
    })
    //关闭
    $('html').on('click', '#btnClose', function () {
        var index = parent.layer.getFrameIndex(window.name);
        parent.layer.close(index);
    });
    if (examType == 1) {
        $('.examTypeName').html('采购文件下载')
    } else {
        $('.examTypeName').html('资格预审文件下载')
    }
})
//只重新获取主数据，进度
function getData() {
    $.ajax({
        type: "get",
        url: url + "/ExpertCheckController/findExpertCheckProgress.do",
        data: {
            projectId: projectId,
            packageId: packageId,
            expertId: expertIds,
            examType: examType
        },
        async: false,
        success: function (response) {
            if (response.success) {
                progressList = response.data;
                isStopCheck = progressList.isStopCheck;
                isAllOut = progressList.isAllOut;
                if(examType==1){
                    checkPlan = progressList.checkPlan;                   
                }else{
                    checkPlan = progressList.examCheckPlan;
                } 
				startNavTask(progressList.checkResult);
				isLeader = progressList.isLeader;
				if(isLeader == 1){
					parent.$('#isLeader').html('（评审组长）');
				}else if(isLeader === 0){
					parent.$('#isLeader').html('（评审组员）')
				}
				if(progressList.keepNum != undefined){
				    keepNum = progressList.keepNum;
				}
				isPriceCheck = progressList.isPriceCheck;
				isTotalCheck = progressList.isTotalCheck;
				//自动评审指令且 （无推选时已发送评委抽取短信 或 有推选组长且已推选） 或 （手动评审指令）已下达评审指令
				if(((progressList.isAutoOrder == 0 || !progressList.isAutoOrder) && ((progressList.isSendMess == 1 && progressList.isRecommendExpert == 0) || (progressList.isRecommendExpert == 1 && progressList.recommendStatus == "已完成"))) || (progressList.isAutoOrder == 1 && progressList.autoReOrderShow == 1)){
					$('#fileCheck, #downloadAllFile').show();
				}else{
					$('#fileCheck, #downloadAllFile').hide();
				};
				if(progressList.isAutoOrder == 1 && (!progressList.autoReOrderShow || progressList.autoReOrderShow == 0)){
					if(isAgent == 1){//代理
						$('.tipsOfStart').html('提示：评审还未开始，请等待项目经理下达评审指令......');
					}else{//自采
						$('.tipsOfStart').html('提示：评审还未开始，请等待采购员下达评审指令......');
					}
				}else{
					$('.tipsOfStart').html('');
				}
                if (isStopCheck == 1) {
                    // 评审组长不再弹框提示
                    // 评审组长显示项目失败
                    if (isLeader == 1) {
                        $('#StopChecks').html('已项目失败，'); 
                        $('#viewReason').html(progressList.stopCheckReason?progressList.stopCheckReason:"");
                        $(".showNTB").show();
                    } else {
                        parent.layer.alert("温馨提示：该包件已项目失败!");
                    }
                    $('.isStopCheck').hide();
                    $('input').attr('disabled', true);
                } else {
                    if (progressList.stopCheckReason != "" && progressList.stopCheckReason != undefined) {
                        parent.layer.alert("温馨提示：该项目已申请项目失败!");
                        $('.isStopCheck').hide();
                        $('input').attr('disabled', true);


                    } else {
                        if (progressList.checkReport == "已完成") {
                            $('#stopCheck').hide();
                        } else {
                            $('#stopCheck').show();
                        }
                    };

                }
            }
        }
    });
    menuList();
    fandChangCheckState(packageId);

}
//渲染左侧菜单
function menuList() {
    var data = new Array();
	//判断评审步骤能否点击
	var canClick = false;//能否点击
	var sysDate = top.$("#systemTime").html() + " " + top.$("#sysTime").html();
	var nowDate = Date.parse(new Date(sysDate.replace(/\-/g, "/"))); //公告发布时间
	var startDate = Date.parse(new Date(progressList.checkEndDate.replace(/\-/g, "/")));
	if(progressList.isAutoOrder == 0 || !progressList.isAutoOrder){//0自动  1 手动  2已下达评审指令
		if(progressList.isRecommendExpert == 1){//是否推选组长 0否1是
			if(progressList.recommendStatus == "已完成"){
				canClick = true
			}
		}else{
			if(progressList.isSendMess==1 && nowDate > startDate){
				canClick = true
			}
		}
	}else if(progressList.isAutoOrder == 1 && progressList.autoReOrderShow == 1){//已下达评审指令
		canClick = true
	}
    //判断评审设置是否设置了可以查看项目信息
    if (progressList.isShowProject == 0) {
        data.push(
            {
                "name": "项目信息",
                "url": "projectData.html",
                'id': 'projectData',
                'typeClass': 'keEdit',
            }
        )
    }
	if(progressList.isNeedSignPromise == 1){
		data.push(
		    {
		        "name": "签订承诺书",
		        "url": "signPromise.html",
		        'id': 'signPromise',
		        'typeClass':'keEdit',
		    }
		)
		if(progressList.isRecommendExpert == 1){//是否推选组长 0否1是
			data.push(
			    {
			        "name": "推选组长",
			        "url": "recommendLeader.html",
			        'id': 'recommendLeader',
			        'typeClass': progressList.signIn == '已完成'?'keEdit':'bkEdit',
			    }
			)
		}
	}else{
		if(progressList.isRecommendExpert == 1){//是否推选组长 0否1是
			data.push(
			    {
			        "name": "推选组长",
			        "url": "recommendLeader.html",
			        'id': 'recommendLeader',
			        'typeClass': 'keEdit',
			    }
			)
		}
	}
	if(isAgent == 1 || isAgent == 0){
		data.push({
		    "name": "政府失信名单查询",
		    'id': 'dishonestList',
		    "url": "dishonestList.html",
		    'typeClass': !canClick ? 'bkEdit' : 'keEdit',
		});
	}
	if (progressList.isNeedClear == 1) {//有清单
		data.push({
		    "name": "清标",
		    'id': 'clearBidding',
		    "url": "clearBidding.html",
		    'typeClass': !canClick ? 'bkEdit' : 'keEdit',
		});
	}
	if(progressList.isNeedQueryRep == 1){
		data.push({
			"name": "查重",
			'id': 'queryRep',
			"url": "queryRep.html",
			'typeClass': !canClick ? 'bkEdit' : 'keEdit',
		});
	}
	if(isLeader == 1){
		data.push(
			{
				"name": "进度管理",
				"url": "progress.html",
				'id':'progress',  
				'typeClass': !canClick?'bkEdit':'keEdit',
			}   
		)
	}
    if (examType == 1) {

        if (progressList.doubleEnvelope == 1) {
            if (progressList.isShowOfferTab != 1) {
                data.push({
                    "name": "报价一览表",
                    'id': 'quotation',
                    "url": "quotation.html",
                    'typeClass': !canClick ? 'bkEdit' : 'keEdit',
                });
            }
        } else {
            if (progressList.projectCheckers[0].isShowOffer == 1 && (progressList.packageCheckLists && progressList.packageCheckLists[progressList.packageCheckLists.length - 1].isCheckFinish == '已完成')) {
                data.push({
                    "name": "报价一览表",
                    'id': 'quotation',
                    "url": "quotation.html",
                    'typeClass': !canClick ? 'bkEdit' : 'keEdit',
                });

            } else if (progressList.projectCheckers[0].isShowOffer == 0) {
                data.push({
                    "name": "报价一览表",
                    'id': 'quotation',
                    "url": "quotation.html",
                    'typeClass': !canClick ? 'bkEdit' : 'keEdit',
                });

            }
        }
        data.push(
            {
                "name": "报价文件",
                'id': 'PriceFile',
                "url": "PriceFile.html",
                'typeClass': !canClick ? 'bkEdit' : 'keEdit',

            }
        )
        var isShowCode = false
        if (progressList.isOpenDarkDoc == 1 && progressList.packageCheckLists.length > 0) {
            if (isStopCheck == 1 || isAllOut == 1) {
                isShowCode = true
            } else {

                if ((progressList.darkSupCode == 1 && progressList.checkItem == "已完成")) {
                    isShowCode = true
                } else {
                    var isShadowMarkData = [];
                    for (var i = 0; i < progressList.packageCheckLists.length; i++) {
                        if (progressList.packageCheckLists[i].isShadowMark == 1) {
                            isShadowMarkData.push(progressList.packageCheckLists[i])
                        }
                    }
                    if ((progressList.darkSupCode == 0 && isShadowMarkData.length > 0 && isShadowMarkData[isShadowMarkData.length - 1].isCheckFinish == "已完成")) {
                        isShowCode = true
                    }
                }
            }
            if (isShowCode) {
                data.push(
                    {
                        "name": "暗标编号对应关系",
                        'id': 'corresponding',
                        "url": "corresponding.html",
                        'typeClass': !canClick ? 'bkEdit' : 'keEdit',

                    }
                )
            }
        }
    }
    if (examType == 0) {
        data.push(
            {
                "name": "资格预审申请文件",
                'id': 'PriceFile',
                "url": "PriceFile.html",
                'typeClass': !canClick ? 'bkEdit' : 'keEdit',

            }
        )
    }

    for (var i = 0; i < progressList.packageCheckLists.length; i++) { //评审项目循环  大的tab绑定
        var className = ""
		if(progressList.isAutoOrder == 1 && (!progressList.autoReOrderShow || progressList.autoReOrderShow == 0)){//0自动  1 手动  2已下达评审指令
			className ="bkEdit" 
		}else{
			if (i == 0) {
				//自动、需推选组长、组长推选未完成
				if((!progressList.isAutoOrder || progressList.isAutoOrder == 0) && progressList.isRecommendExpert == 1 && progressList.recommendStatus == "未完成"){//自动下达
					className ="bkEdit"
				}else{
					if (progressList.packageCheckLists[i].isCheckFinish == "未完成") {
					    className = "nowEdit"
					} else {
					    className = "keEdit"
					}
				}
			    
			} else if (i > 0) {
			    if (progressList.packageCheckLists[i].checkType == 4) {
			        if (progressList.packageCheckLists[i].isCheckFinish == "未完成") {
			            className = "bkEdit"
			        } else {
			            className = "keEdit"
			        }
			    } else {
			        if (progressList.packageCheckLists[i - 1].isCheckFinish == "未完成") {
			            className = "bkEdit"
			        } else {//最后一个评审项
			            if (progressList.packageCheckLists[i].isCheckFinish == "未完成") {
			                className = "nowEdit"
			            } else {
			                className = "keEdit"
			            }
			        }
			    }
			}
		}
        
        data.push(
            {
                "name": progressList.packageCheckLists[i].checkName + ((examType == 1 && progressList.doubleEnvelope == 1) ? '</br><i class="text-danger">(第' + top.sectionToChinese(progressList.packageCheckLists[i].envelopeLevel) + '信封)</i>' : ''),
                "url": "packageCheckList.html",
                'id': progressList.packageCheckLists[i].id,
                'checkType': progressList.packageCheckLists[i].checkType,
                'typeClass': className,
            }
        )
    }
    if (examType == 1 && progressList.isShowOfferTab != 1) {
		var priceCheckType = 'bkEdit';
		//isPriceCheck 价格评审执行人  0 项目经理  1 组长
		if(progressList.packageCheckLists[progressList.packageCheckLists.length - 1].isCheckFinish == '未完成'){
			priceCheckType = 'bkEdit'
		}else{
			if(progressList['priceCheck'] == '未完成'){
				if(isLeader == 1 && isPriceCheck == 1){
					priceCheckType = 'nowEdit'
				}
			}else{
				priceCheckType = 'keEdit'
			}
		}
        data.push(
            {
                "name": "价格评审" + ((examType == 1 && progressList.doubleEnvelope == 1) ? '</br><i class="text-danger">(第二信封)</i>' : ''),
                "url": "PriceCheck.html",
                'id': 'priceCheck',
                'typeClass': priceCheckType,
            }
        )
    }
	var checkTotalType = 'bkEdit';
	//isTotalCheck 评审汇总执行人  0 项目经理  1 组长
	if(isStopCheck==1||isAllOut==1){
		if(isTotalCheck == 1 ){
			if(progressList['checkItem'] == '未完成'){
                if(isLeader == 1){
                    checkTotalType = 'nowEdit'
                }
            }else{
                checkTotalType = 'keEdit'
            }
		}
	}else{
		if(examType==1){
			if(progressList['priceCheck'] == '已完成'){
				if(progressList['checkItem'] == '未完成'){
					if(isLeader == 1 && isTotalCheck == 1){
						checkTotalType = 'nowEdit'
					}
				}else{
					checkTotalType = 'keEdit'
				}
			}
		}else{
			if(progressList.packageCheckLists[progressList.packageCheckLists.length-1].isCheckFinish=='已完成'){
				if(progressList['checkItem'] == '未完成'){
					if(isLeader == 1 && isTotalCheck == 1){
						checkTotalType = 'nowEdit'
					}
				}else{
					checkTotalType = 'keEdit'
				}
			}
		}
		
	}
    data.push(
        {
            "name": "评审记录汇总",
            "url": "PriceCheckTotal.html",
            'id': 'PriceCheckTotal',
            'typeClass': checkTotalType,
        }
    )
    if (progressList.projectCheckers[0].isShowReport == 0) {
        data.push(
            {
                "name": "评审报告",
                "url": "CheckReport.html",
                'id': 'CheckReport',
                'typeClass': isStopCheck == 1 ? 'keEdit' : (progressList['checkReport'] == "未完成" ? 'bkEdit' : 'keEdit'),
            }
        )
    }
    data.push(
        {
            "name": "评审澄清",
            "url": "raterAsks.html",
            'id': 'raterAsks',
            'typeClass': (progressList.isAutoOrder == 1 && (!progressList.autoReOrderShow || progressList.autoReOrderShow == 0) || !canClick) ? 'bkEdit' : 'keEdit',
        }
    )
    liData = data;
    var liStr = "";
    // 遍历生成主菜单
    for (var i = 0; i < data.length; i++) {
        liStr += '<li class="' + data[i].typeClass + '" id="' + data[i].id + '" data-checktype="' + (data[i].checkType || "") + '"  data-url="' + data[i].url + '">'
        liStr += '<span>'
        liStr += data[i].name
        liStr += '</span>'
        liStr += '</li>'
    };
    $("#menu").html(liStr);
    $("#" + _thisId).addClass('xEdit');

}

function offerData(name) {
    $.ajax({
        type: "post",
        url: url + "/ReviewCheckController/getCheckOtherInfomation.do",
        data: {
            projectId: projectId,
            packageId: packageId,
            examType: examType
        },
        async: false,
        success: function (data) {
            if (data.success) {
                offersData = data.data.offers;
                offerDetailedData = data.data.offerDetaileds;
                packageDetailedData = data.data;
                purFilesData = data.data.purFiles;
                purOfferFilesData = data.data.purOfferFiles;
                fileSource = data.data.fileSource;
                _THISID = _thisId;
            }
        },
        error: function (err) {

        }
    });
}
//一键打包
$("#downloadAllFile").click(function () {
    var newUrl = $.parserUrlForToken(top.config.AuctionHost + "/ReviewCheckController/downloadAllPurFile.do?projectId=" + projectId + "&packageId=" + packageId + "&examType=" + examType)
    window.location.href = newUrl;
});
//一键打包
$(".envelopeLevelFile").click(function () {
    var _envelopeLevel = $(this).data('envelopelevel')
    var newUrl = $.parserUrlForToken(top.config.AuctionHost + "/ReviewCheckController/downloadAllPurFile.do?projectId=" + projectId + "&packageId=" + packageId + "&examType=" + examType + '&envelopeCount=' + _envelopeLevel)
    window.location.href = newUrl;
});
//一键打包
$(".envelopeLevelFile2").click(function () {
    var _envelopeLevel = $(this).data('envelopelevel')
    var newUrl = $.parserUrlForToken(top.config.AuctionHost + "/ReviewCheckController/downloadAllPurFile.do?projectId=" + projectId + "&packageId=" + packageId + "&examType=" + examType + '&envelopeCount=' + _envelopeLevel)
    window.location.href = newUrl;
});
$("#fileCheck").click(function () {
    var newUrl = $.parserUrlForToken(top.config.AuctionHost + "/ProjectReviewController/downloadPurFile.do?projectId=" + projectId + "&packageId=" + packageId + "&examType=" + examType)
    window.location.href = newUrl;
});
//一键流标
$("#stopCheck").click(function () {
    top.layer.confirm("温馨提示:项目失败后该包件将作废,是否确定申请项目失败?", function (indexs) {
        parent.layer.close(indexs);
        parent.layer.prompt({
            title: '请输入项目失败原因',
            formType: 2
        }, function (text, index) {
            if (text == "") {
                top.layer.alert('请输入项目失败原因');

                return
            }
            $.ajax({
                type: "post",
                url: url + "/ProjectReviewController/setIsStopCheck.do",
                data: {
                    id: packageId,
                    projectId: projectId,
                    stopCheckReason: text,
                    examType: examType,
                    expertId: expertIds
                },
                async: true,
                success: function (data) {
                    if (data.success) {
                        window.location.reload();
                        top.layer.alert("提交项目失败申请成功");
                        $('input').attr('disabled', true);
                        $('button').attr('disabled', true)
                    } else {
                        top.layer.alert(data.message);
                    }
                }
            });
            parent.layer.close(index);
        });
    });
});
//正负数字的正则表达式
var re = new RegExp("^[+-]?(([0-9][0-9]*)|(([0]\\.\\d{1,2}|[0-9][0-9]*\\.\\d{1,2})))$");
//大于0的数字的正则表达式
var rm = new RegExp("^(([1-9][0-9]*)|(([0]\\.\\d{1,2}|[1-9][0-9]*\\.\\d{1,2})))$");
var weiChnise = '两';
var priceInte = 15;//价格的整数位数
/*************start获取报价信息****************/
function getPriceUnit() {
    $.ajax({
        url: top.config.AuctionHost + "/NegotiationController/findPriceList.do",
        dataType: 'json',
        data: {
            packageId: packageId
        },
        async: false,
        success: function (data) {
            if (!data.success) {
                top.layer.alert(data.message);
                return;
            };
            if (data.data && data.data.quotePriceUnit) {
                quotePriceUnit = (data.data.quotePriceName ? data.data.quotePriceName + "（" : "") + data.data.quotePriceUnit + (data.data.quotePriceName ? "）" : "");
            } else {
                quotePriceUnit = "元";
            };

            if (data.data && data.data.pointNum != undefined) {
                pointNum = data.data.pointNum
            } else {
                pointNum = 2
            };
			priceInte = 15 - Number(pointNum);
            if (pointNum == 0) {
                var ss = "^[+-]?([0-9][0-9]*)$";
                var rs = "^[1-9][0-9]*$";
                weiChnise = '零'
            } else {
                //正负数字的正则表达式
                var ss = "^[+-]?(\\b(?:0|[1-9][0-9]*)\\b|(([0]\\.\\d{1," + pointNum + "}|\\b(?:0|[1-9][0-9]*)\\b.\\d{1," + pointNum + "})))$";
                // var ss="[+-]?\\b(?:0|[1-9][0-9]*)\\b"
                //大于0的数字的正则表达式
                var rs = "^(([1-9][0-9]*)|(([0]\\.\\d{1," + pointNum + "}|[1-9][0-9]*\\.\\d{1," + pointNum + "})))$";
                weiChnise = (pointNum == 2 ? '两' : top.sectionToChinese(pointNum))
            }
            re = new RegExp(ss);

            rm = new RegExp(rs);


        },
        error: function () {
            parent.layer.alert("温馨提示：请求失败");
        }
    });
}

function fandChangCheckState(packageId) {

    $.ajax({
        type: "post",
        url: top.config.AuctionHost + '/PriceSetHistoryController/findBusinessPriceCheckState',
        async: false,
        dataType: "json", //预期服务器返回的数据类型
        data: {
            'packageId': packageId
        },
        success: function (data) {
            if (!data.success) {
                top.layer.alert("温馨提示：" + data.message);
                var index = parent.layer.getFrameIndex(window.name);
                top.layer.close(index);
            } else {
                changType = false;
            }
        },
        error: function () {
            top.layer.alert("温馨提示：" + data.message);
        }
    });
}
/*************end获取报价信息****************/
function reviewFlowNode(param, url, callback){
	param.packageId = packageId;
	param.examType = examType;
	$.ajax({
	    type: "post",
	    url: url,
	    data: param,
	    async: false,
	    success: function (response) {
	        if (response.success) {
				callback(response.data)
	        }else{
				top.layer.alert(response.message);
			}
	    }
	});
}
