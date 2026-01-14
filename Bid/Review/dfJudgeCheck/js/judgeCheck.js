var bidSectionId = getUrlParam("bidSectionId");//标段Id
var examType = getUrlParam("examType");//评标会方式  1.资格预审  2.评标会
var bidSectionCode = getUrlParam("bidSectionCode");//评标会方式  1.资格预审  2.评标会
var flowUrl = config.Reviewhost + "/ReviewControll/getFlowInfo.do";
var expertsUrl = config.Reviewhost + "/ReviewControll/experts.do";
var reviewFlowNodeUrl = config.Reviewhost + "/ReviewControll/review.do";//评标流程环节路由
var flowInstructUrl = config.Reviewhost + '/ReviewControll/instruct.do';//下达指令
var getCompeteInfoUrl = config.Reviewhost + "/BidCompeteController/findBidCompeteInfo.do";//获取竞争性投票结果
var getSettingsUrl = config.tenderHost + '/CheckController/checkIsNew.do';//下达评标指令前验证是否还有评审项设置未提交
var competeHtml = "Review/dfJudgeCheck/model/compete.html";//竞争性投票
var summaryResult = 'Review/dfJudgeCheck/model/sunmmaryResultConfirm.html';//评审结果确认
var reasonSummer = 'Review/dfJudgeCheck/model/reasonConfirm.html';//评审原因确认
var bidSectionInfo			//标段信息
    , userInfo				//当前登录人信息
    , reviewRoleType			//评标角色类型 1.评委  2.组长 3.招标监督人 4.项目经理 5.平台 6.监管部门监督人
    , isEnd					//评审结束  0为未完成，1为完成  2.暂停
    , timeStep               //属性环节导航定时器;
    , isStopTab = false     //是否停止自动切换pollResult
    , currBidderId          //当前投标人
    , checkResult         //0评标指令前  1 结束  2 已下达指令
	, owner = getUrlParam("owner"); //是否自己创建的项目
var currNode = {};			//当前节点
var newestNode = {}			//最新节点
var currFunction, destructionFunction = function () { };
var isOpenVote = false;//当前是否打开了否决性投票
var CAcf = null;
var loginInfo = entryInfo();
var idCard = loginInfo.idCard;
var userName = loginInfo.userName;
var rules = false;//
var isOpenCompelet = false;//是否已打开竞争性页面
var bidCheckType;//评标办法
var isOpenSunmmary = false;//组长是否已打开汇总
var isOpenReason = false;//评委是否已打开原因确认
var isHasDetailedListFile;//是否有清单文件
var pretrialPassNumber;//预审有限数量制限制人数
var alertHaltReminder = false;//是否弹出停机提醒
var RenameData;//投标人更名信息
// function checkUserType() {
//     console.log(top);
//     // var idcard = top.loginInfo.idCard;
//     // var token = $.getToken()
//     // window.open('http://127.0.0.1:5500/index.html?idcard=' + idcard);
//     // 'isRemindByIdCardAndSectionCode';
//     var url = config.JudgesHost + '/SysExpertController/isRemindByIdCardAndSectionCode';
//     $.ajax({
//         type: "post",
//         url: url,
//         async: false,
//         data: {
//             idCard: idCard,
//             bidSectionCode: bidSectionCode
//         },
//         success: function (res) {
//             if (res.success) {
//                 console.log(res);
//                 if (res.data.isRemind == 1) {
//                     if (res.data.isExpert == 1) {
//                         openExpertLayer(1)
//                     } else {
//                         openExpertLayer(0)
//                     }
//                     // userInfo.tel
//                 }
//             }
//         },
//         error: function () {

//         },
//     })
// }

// function openExpertLayer(type) {
//     if (type == 1) {
//         var content = '<div style="padding: 20px 20px 0;">' +
//             '<span style="color:red;">' + userName +'专家您好，请确认您的专家信息是否正确。</span>' +
//             '</div>';
//         top.layer.open({
//             type: 1,
//             offset: 'lb', //具体配置参考：offset参数项
//             content: content,
//             btn: ['去核实个人信息', '稍后再说'],
//             area: ['300px', '200px'],
//             btnAlign: 'c', //按钮居中
//             shade: 0, //不显示遮罩
//             yes: function (index) {
//                 var idcard = top.loginInfo.idCard;
//                 var token = $.getToken()
//                 window.open(siteInfo.expertIndexUrl + '?idcard=' + idcard);
//                 top.layer.close(index);
//             },
//             btn2: function (index) {
//                 top.layer.close(index);
//             }
//         });
//     } else {
//         var content = '<div style="padding: 20px 20px 0;">' +
//             '<span style="color:red;">诚恳邀请您注册申请为平台专家，接受邀请后，系统自动发送注册链接短信到您手机上。</span>' +
//             '</div>';
//         top.layer.open({
//             type: 1,
//             offset: 'lb', //具体配置参考：offset参数项
//             content: content,
//             btn: ['接受邀请', '以后再说'],
//             area: ['300px', '200px'],
//             btnAlign: 'c', //按钮居中
//             shade: 0, //不显示遮罩
//             yes: function (index) {
//                 var url = config.JudgesHost + '/SysExpertController/saveExpertRemind';
//                 $.ajax({
//                     type: "post",
//                     url: url,
//                     async: false,
//                     data: {
//                         bidSectionCode: bidSectionCode,
//                         idCard: idCard,
//                         remindType: 1,
//                         phone: userInfo.tel
//                     },
//                     success: function (res) {
//                         if (res.success) {
//                             top.layer.alert('已发送邀请短信至您的手机,请按短信说明完成注册.');
//                             top.layer.close(index);
//                         } else {
//                             top.layer.alert(res.message);
//                         }
//                     },
//                     error: function () {
//                         top.layer.alert('连接错误');

//                     },
//                 })
//             },
//             btn2: function (index) {
//                 var url = config.JudgesHost + '/SysExpertController/saveExpertRemind';
//                 $.ajax({
//                     type: "post",
//                     url: url,
//                     async: false,
//                     data: {
//                         bidSectionCode: bidSectionCode,
//                         idCard: idCard,
//                         remindType: 0,
//                         phone: userInfo.tel
//                     },
//                     success: function (res) {
//                         if (res.success) {
//                             top.layer.alert('操作成功.');
//                             top.layer.close(index);
//                         } else {
//                             top.layer.alert(res.message);
//                         }
//                     },
//                     error: function () {
//                         top.layer.alert('连接错误');
//                     },
//                 })
//             }
//         });
//     }

// }
if(examType == 2){
	$('.isShowTr').show();
}
function getFlowInfo(callback) {
    $.ajax({
        type: "post",
        url: flowUrl,
        async: false,
        beforeSend: function (xhr) {
            var token = $.getToken();
            xhr.setRequestHeader("Token", token);
            mask = null;
        },
        data: {
            'bidSectionId': bidSectionId,
            'examType': examType,
			'owner': owner
        },
        success: function (res) {
            if (res.success) {
                reviewRoleType = res.data.reviewRoleType;
                if (reviewRoleType == 1) {
                    parent.$('#isLeader').html('（评审组员）')
                } else if (reviewRoleType == 2) {
                    parent.$('#isLeader').html('（评审组长）')
                }
                isEnd = res.data.isEnd;
                checkResult = res.data.checkResult;
                callback(res.data.nodes);
            }
        }
    });
}

/**
 * 获取评委信息
 * @returns {*}
 */
function getExperts() {
    var experts;
    //获取标段详情
    $.ajax({
        type: "post",
        url: expertsUrl,
        async: false,
        data: {
            'bidSectionId': bidSectionId,
            'examType': examType
        },
        success: function (res) {
            if (res.success) {
                experts = res.data;
            }
        }
    });
    return experts;
}

var competeTask;

/**
 * 竞争性投票
 * @param data
 */
function compete(isEnter, competeCheckId, bidders, bidType, isBlind, callback) {
    $('#content').html("");
    if (isEnter == 0) {
		if(isOpenCompelet){
			return
		};
		isOpenCompelet = true;
        top.layer.open({
            type: 2,
            title: "竞争性投票",
            area: ['1000px', '600px'],
            resize: false,
            content: competeHtml,
            success: function (layero, index) {
                var iframeWin = layero.find('iframe')[0].contentWindow;
                iframeWin.competeList(bidSectionId, examType, competeCheckId, bidders, bidType, isBlind, function () {
					isOpenCompelet = false;
                    getCompete(competeCheckId, callback);
                });
            },
			end: function(layero, index){
				isOpenCompelet = false;
			}
        });
    } else {
        top.layer.alert('温馨提示：其他专家还未对竞争性投票，请稍等。');
    }
    if (!competeTask) {
        competeTask = setInterval(function () {
            getCompete(competeCheckId, callback);
        }, 15000);
    }
}

/**
 * 获取竞争性投票结果
 * @param checkId
 * @param callback
 */
function getCompete(checkId, callback) {
    $.ajax({
        type: "post",
        url: getCompeteInfoUrl,
        data: {
            bidSectionId: bidSectionId,
            examType: examType,
            checkId: checkId
        },
        success: function (res) {
            if (res.success) {
                var flag = false;
                if (!res.data) {
                    flag = true;
                } else {
                    if (res.data.resultType) {
                        flag = true;
                        if (callback) {
                            callback();
                        }

                    } else if (res.data.resultType == 0) {
                        flag = true;
                    }
                }
                if (flag) {
                    if (competeTask) {
                        clearInterval(competeTask);
                        competeTask = null;
                    }
                }
            }
        }
    });

}

/**
 * 评标请求接口
 * @param param
 * @param callback
 * @param async
 * @returns {*}
 */
function reviewFlowNode(param, callback, async, isConsole) {
    param.bidSectionId = bidSectionId;
    param.examType = examType;
	param.owner = owner;
    async = async ? true : false;
    //获取标段详情
    $.ajax({
        type: "post",
        url: reviewFlowNodeUrl,
        async: async,
        data: param,
        success: function (res) {
			$('#savePriceCheckTotal').attr('disabled',false);
            if (res.success) {
                if (res.data && res.data.pollResult == 0) {
                    if (!isOpenVote) {
                        if (!res.data.myPollResult) {
                            isVoteview()
                        } else {
                            top.layer.alert('本轮投票还未结束，请等待！');
                        }
                    }

                } else {
                    callback(res.data)
                }

            } else {
                if (res.message != '404') {
                     top.layer.alert(res.message);
                /* if(isConsole){
                        console.log(res.message)
                    }else {
                        top.layer.alert(res.message);
                    }*/
                } else {
                   // top.layer.alert("接口不存在");
                }
            }
        }
    });
}

/**
 *	下达指令
 * @param instruct
 */
function flowiInstruct(instruct, callback) {
    $.ajax({
        type: "post",
        url: flowInstructUrl,
        async: true,
        data: {
            'bidSectionId': bidSectionId,
            'examType': examType,
            'instruct': instruct
        },
        success: function (data) {
            if (data.success) {
				callback();
            } else {
                top.layer.alert(data.message);
            }
        }
    });
};

/**
 * 显示评标环节导航栏
 * @param flowNodes
 */
function showFlowNode(flowNodes) {
    //0.未开始 1.进行中 2.进行中，不可编辑 3.结束 4.自动结束（可以跳过环节） 5.流标后不需要评标 6.评审组长汇总确认 7.评委输入原因
    var html = '';
    var className;
    var progressNode = null;
    for (var i = 0; i < flowNodes.length; i++) {
        if (flowNodes[i].status == 1 || flowNodes[i].status == 2 || flowNodes[i].status == 3 || flowNodes[i].status == 6 || flowNodes[i].status == 7) {
            className = 'handle-list';
			if(reviewRoleType == 1 || reviewRoleType == 2){
				if(flowNodes[i].status == 6){
					$('#reverseReviewBtn').hide();
					if(reviewRoleType == 2 && !isOpenSunmmary){
						openSunmmaryResult(flowNodes[i].nodeType, flowNodes[i].nodeSubType);
					}
				}else if(flowNodes[i].status == 7){
					$('#reverseReviewBtn').hide();
					let pram = {
						"method": "isSubObjectiveReason",
						"nodeType": flowNodes[i].nodeType,
						"nodeSubType": flowNodes[i].nodeSubType
					}
					reviewFlowNode(pram, function(data) {
						if(data){
							openReasonSummer(flowNodes[i].nodeType, flowNodes[i].nodeSubType);
						}
					});
				}else{
					$('#reverseReviewBtn').show();
				}
			}
        } else {
            className = 'no-click';
        }
        var data_nodeSubType = "";
        if (flowNodes[i].nodeSubType) {
            data_nodeSubType = " data-nodeSubType=" + flowNodes[i].nodeSubType;
        }
        if (flowNodes[i].nodeType == "" || flowNodes[i].nodeType == "progress") {
            progressNode = '<li class="' + className + '" data-nodeType="' + flowNodes[i].nodeType + '"' + data_nodeSubType + '>' + flowNodes[i].nodeName + '</li>';
        } else {
			if(flowNodes[i].nodeType == "dishonestList" || flowNodes[i].nodeType == "clearBidding"  || flowNodes[i].nodeType == 'queryRep'){
				html += '<li class="' + className + '" data-nodeType="' + flowNodes[i].nodeType + '"' + data_nodeSubType + '>' + flowNodes[i].nodeName + '</li>';
			}else{
				html += '<li class="flow ' + className + '" data-nodeType="' + flowNodes[i].nodeType + '"' + data_nodeSubType + '>' + flowNodes[i].nodeName + '</li>';
			}
		}
    }

    if (progressNode) {
        html += progressNode;
    }

    if (reviewRoleType == 1 || reviewRoleType == 2) {
        html += '<li class="handle-list" data-nodeType="clarify">评标提问</li>';
    } else if (reviewRoleType == 3) {
        html += '<li class="handle-list" data-nodeType="clarify">查看提问</li>';
    } else {
        html += '<li class="handle-list" data-nodeType="clarify">查看提问</li>';
    }

    $(".flowNodeList").html(html);
	var heights=parent.$("#layerPackage").height();
	$(".flowNodeList").height(heights-100);
    activities();
}

$(function () {
    bidSectionInfo = getBidsectionInfo(bidSectionId);
	var token = $.getToken();
	RenameData = getBidderRenameMark(bidSectionId, token);//投标人更名信息
	bidCheckType = bidSectionInfo.checkType;
	//当项目采用的评标办法为最低价法时，包括：最低投标价法、最低评标价法、经评审的最低投标价法（日产）、经评审的最低投标价法（非日产）
	if(bidSectionInfo.checkType == 3 || bidSectionInfo.checkType == 4|| bidSectionInfo.checkType == 5|| bidSectionInfo.checkType == 6|| bidSectionInfo.checkType == 7|| bidSectionInfo.checkType == 8){
		rules = true
	};
	isHasDetailedListFile = bidSectionInfo.isHasDetailedListFile;
	pretrialPassNumber = bidSectionInfo.pretrialPassNumber;
    userInfo = entryInfo();
    var heights = parent.$("#layerPackage").height();
    var widths = parent.$("#layerPackage").width();
    $("#contents").height(heights - 100);
    $("#contents").width(widths - 220);
    $(".flowNodeList").height(heights - 100);
    window.addEventListener('resize', function () {
        var heights = parent.$("#layerPackage").height();
        var widths = parent.$("#layerPackage").width();
        $("#contents").height(heights - 100);
        $(".flowNodeList").height(heights - 100);
        if (widths < 500) {
            return;
        }
        $("#contents").width(widths - 220);

        var allWidth = 0;

        $.each($("#bidderList li"), function (index, item) {
            allWidth += Number($(this).width()) + 2;
        })

        if (allWidth > $("#bidderList").width()) {
            $("#bidderList-box").css({ 'padding': '0 30px' })
            $(".control-btn").show();
        } else {
            $("#bidderList-box").css({ 'padding': '0 0' })
            $(".control-btn").hide();
            $("#left-btn").click();
        }
    })
    // $(window).resize(function () {
    //     var heights = parent.$("#layerPackage").height();
    //     var widths = parent.$("#layerPackage").width();
    //     $("#contents").height(heights - 100);
    //     $(".flowNodeList").height(heights - 100);
    //     if (widths < 500) {
    //         return;
    //     }
    //     $("#contents").width(widths - 220);

    //     var allWidth = 0;

    //     $.each($("#bidderList li"), function (index, item) {
    //         allWidth += Number($(this).width()) + 2;
    //     })

    //     if (allWidth > $("#bidderList").width()) {
    //         $("#bidderList-box").css({ 'padding': '0 30px' })
    //         $(".control-btn").show();
    //     } else {
    //         $("#bidderList-box").css({ 'padding': '0 0' })
    //         $(".control-btn").hide();
    //         $("#left-btn").click();
    //     }
    // });

    $('#contents .mainTable div[id]').each(function () {
        $(this).html(bidSectionInfo[this.id]);
    });
	if(bidSectionInfo.controlPrice){
		$('#controlPriceUnit').show();
		$("#controlPrice").html(digitToThousands(bidSectionInfo.controlPrice.toString()));
		$("#controlPriceUpper").html(bidSectionInfo.controlPriceUpper);
	}else{
		$("#controlPrice").html('无');
		$('#controlPriceUnit').hide();
	};
	if(bidSectionInfo.tenderProjectClassifyCode){
		if (bidSectionInfo.isPublicProject == 1) {
			$("#tenderProjectClassifyCode").attr("optionName", "tenderProjectClassifyCode");
		} else {
			$("#tenderProjectClassifyCode").attr("optionName", "tenderProjectClassifyCode0");
		}
		optionValueView($("#tenderProjectClassifyCode"), bidSectionInfo.tenderProjectClassifyCode);
	};
    schedule(startNavTask);
    //getStep(jindu);
    // checkUserType();
})
//评标流程点击事件
$(".flowNodeList").on('click', '.handle-list', function () {

    var node = {};			//
    node.nodeType = $(this).attr('data-nodeType');
    node.nodeSubType = $(this).attr('data-nodeSubType');
    node.nodeName = $(this).text();
    if (node.nodeType == 'clarify'  || node.nodeType == 'dishonestList' || node.nodeType == 'clearBidding' || node.nodeType == 'queryRep') {//查看澄清时不自动跳转
        isStopTab = true;
    } else {
        isStopTab = false;
        startNavTask();
    };
	
    if (window[node.nodeType]) {
        flowNodeFunction = function () {
            destructionFunction();
            return window[node.nodeType](node);
        }
    }

    if (flowNodeFunction) {
        $(this).addClass('open').siblings().removeClass('open');
        currFunction = function () {
            if (flowNodeFunction()) {
                currNode = node;
            } else {
                $('#content').html("");
            }
        }
        currFunction();
    }
});

$("#btnRefresh").on('click', function () {
    schedule();
    currFunction();

	if(currNode.nodeType == "signPromise") {
		console.log(currNode)
		let pram = {
			"method": "getHisReport",
			"nodeType": "reviewReport",
			"bidSectionId": currNode.bidSectionId,
			"examType": currNode.examType
		}
		reviewFlowNode(pram, function(data) {
			currFunction();
		}, false);
	}

})

//评标总进度
function schedule(callback) {
    getFlowInfo(function (flowNodes) {
        showFlowNode(flowNodes);
        var flag = false;		//当前节点是否可以点击
        var previous;  //上一个
        var curr;	   //当前
        var list = $(".flowNodeList .flow");
        list.each(function (index, i) {
            var that = $(this)
            if (that.hasClass("handle-list")) {
                previous = curr;
                curr = that;
				if(currNode.nodeType == 'clarify' || currNode.nodeType == 'progress'   || currNode.nodeType == 'dishonestList' || currNode.nodeType == 'clearBidding' || currNode.nodeType == 'queryRep'){
                    flag = true;
                } else if (currNode.nodeType) {
                    if (((curr.attr('data-nodeType') == currNode.nodeType) && (curr.attr('data-nodeSubType') == currNode.nodeSubType))==true) {
                        flag = true;
                    }
                }
            }
        });

        var newest = {
            nodeType: curr.attr('data-nodeType')
        };
        if (curr.attr('data-nodeSubType')) {
            newest.nodeSubType = curr.attr('data-nodeSubType');
        }

        //当前环节不能点击（撤回）
        if (!flag) {
            tabReviewNav(curr);
        } else {
            //如果不是第一次（非页面记载第一次）
			if(currNode.nodeType && newestNode.nodeType){
                if(currNode.nodeType != 'clarify' && currNode.nodeType != 'progress'  && currNode.nodeType != 'dishonestList' && currNode.nodeType != 'clearBidding' && currNode.nodeType != 'queryRep'){
                    if(currNode.nodeType == newestNode.nodeType){                        //有详细环节分类
                        if (currNode.nodeSubType && newestNode.nodeSubType) {
                            //当前环节是上一次检测的最后一项， 且最新一次环节有变化
                            if (currNode.nodeSubType == newestNode.nodeSubType && !(newest.nodeType == newestNode.nodeType && newest.nodeSubType == newestNode.nodeSubType)) {
                                tabReviewNav(curr);
                            }
                        } else if (!(newest.nodeType == newestNode.nodeType)) {
                            tabReviewNav(curr);
                        }
                    }
                }
            } else {
                tabReviewNav(curr);
            }
        }

        //设置最新的环节
        newestNode = newest;
		haltReminder();
        if (callback) {
            callback();
        }
    });
}

/**
 * 切换环节
 * @param dom
 */
function tabReviewNav(dom) {
    if (!isStopTab) {
        dom.click();
    }
}

function activities() {
    if (currNode.nodeType) {
        var select = "[data-nodeType=" + currNode.nodeType + "]";
        if (currNode.nodeSubType) {
            select += "[data-nodeSubType=" + currNode.nodeSubType + "]";
        }
        $(select).addClass('open').siblings().removeClass('open');
    }
}

/**
 * 加载内容
 * @param htmlPath
 */
function loadContent(htmlPath, callback) {
    $('#content').load(htmlPath, callback);
}

/**
 * 加载按钮
 * @param htmlPath
 * @param callback
 */
function loadButton(htmlPath) {
    $('#btn-box').load(htmlPath);
}

/**
 * 设置底部按钮
 * @param buttonsHtml
 */
function setButton(buttonsHtml) {
    $('#btn-box').html(buttonsHtml);
}

$('#btn-box').on('click', '#relevant', function () {
    relevant()
});

$("#btnClose").on('click', function () {
    var index = top.layer.getFrameIndex(window.name);
    top.layer.close(index);
});

/**
 * 启动刷新环节导航定时器
 */
function startNavTask() {
    if (!timeStep) {
        var time = 30000;
        //测试时调整刷新速度
        // if(reviewRoleType == 4){
        //     time = 10000;
        // }
        timeStep = setInterval(function () {
            schedule();
        }, time);
    }
}

/**
 * 启动刷新环节导航定时器
 */
function stopNavTask() {
    if (timeStep) {
        clearInterval(timeSet);
        timeSet = null;
    }
}

/****************************          查看招标文件         ***************************/

function relevant() {
    // console.log(bidSectionInfo.bidType);
    var surl = "./model/relevant" + examType + ".html?bidSectionId=" + bidSectionId + "&examType=" + examType + "&nodeType=" + currNode.nodeType + "&nodeSubType=" + currNode.nodeSubType + "&bidType=" + bidSectionInfo.bidType + "&reviewRoleType=" + reviewRoleType + '&owner=' + owner;
    window.open(surl, "_blank");
}

function viewBidFile() {
    var surl = "./model/tenderFile.html?bidSectionId=" + bidSectionId + "&examType=" + examType;
    window.open(surl, "_blank");
}
/*************       页面传参       *******************/
function passMessage(data, callback) {
    //关闭
    $("#btnClose").click(function () {
        callback();
        var index = top.layer.getFrameIndex(window.name);
        top.layer.close(index);
    });
}
/***********      否决性       ***********/
function isVoteview(isblind) {
    var noteType = $('.flowNodeList .open').attr('data-nodesubtype')
    top.layer.open({
        type: 2,
        title: "否决性投票",
        area: ['900px', '600px'],
        resize: false,
        content: vodeHtml + '?bidSectionId=' + bidSectionId + '&examType=' + examType + '&nodeType=' + newestNode.nodeType + '&isblind=' + isblind,
        success: function (layero, index) {
            var iframeWin = layero.find('iframe')[0].contentWindow;
            iframeWin.passMessage(currNode);
            isOpenVote = true;

        },
        end: function () {
            isOpenVote = false;
        }
    });
};
/**************          下达评标指令前验证是否还有评审项设置未提交            ****************/
function testSettingsIsComplete(callback){
	$.ajax({
	    type: "post",
	    url: getSettingsUrl,
	    async: true,
	    data: {
	        'bidSectionId': bidSectionId,
	        'examType': examType
	    },
	    success: function (data) {
	        if (data.success) {
				if(data.data){
					callback();
				}else{
					top.layer.confirm('温馨提示：评审项设置中存在未提交评审项，请确认是否继续下达评标指令？',{icon:7,title:'询问',btn:['继续下达','取消操作']},
					function(index){
						callback();
					},function(index) {
						top.layer.close(index);
					});
				}
	        } else {
	            top.layer.alert(data.message);
	        }
	    }
	});
}
/**************          下达评标指令前验证是否还有评审项设置未提交   --end         ****************/
/* ***************                  评审确认                      ************************* */
function openSunmmaryResult(noType, node){
	if(isOpenSunmmary){
		return
	}
	top.layer.open({
		type: 2,
		// title: reviewNode.nodeName + "评标汇总",
		title: "评标汇总",
		area: ['100%', '100%'],
		resize: false,
		content: summaryResult + '?bidSectionId=' + bidSectionId + '&examType=' + examType + '&nodeType=' + noType + '&nodeSubType=' + node,
		success: function (layero, index) {
		    var iframeWin = layero.find('iframe')[0].contentWindow;
		    iframeWin.passMessage(function(){
				$("#btnRefresh").click();
			});
		    isOpenSunmmary = true;
		},
		end: function () {
		    isOpenSunmmary = false;
		}
	});
}
//原因
function openReasonSummer(noType, node){
	if(isOpenReason){
		return
	}
	top.layer.open({
		type: 2,
		// title: reviewNode.nodeName + "评标汇总",
		title: "评分原因",
		area: ['100%', '100%'],
		resize: false,
		content: reasonSummer + '?bidSectionId=' + bidSectionId + '&examType=' + examType + '&nodeType=' + noType + '&nodeSubType=' + node,
		success: function (layero, index) {
			isOpenReason = true;
		    var iframeWin = layero.find('iframe')[0].contentWindow;
		    iframeWin.passMessage(function(){
		    	$("#btnRefresh").click();
		    });
		    
		
		},
		end: function () {
		    isOpenReason = false;
		}
	});
}
//是否显示提示信息
function getExplainState(id, exam){
	var result;
	$.ajax({
	 	type:"post",
	   	url: top.config.Reviewhost + '/ReviewControll/getShowExplainState.do', //获取登录人信息,
		data: {
			'bidSectionId': bidSectionId,
			'examType': examType
		},
	   	async:false,
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
/* 停机提醒 */
function haltReminder(){
	if(isEnd != 1 && !alertHaltReminder){
		$.ajax({
		 	type:"post",
		   	url: top.config.Syshost + '/ShutdownReminderController/quearyReview.do', //查询当前是否处于 停机提醒范围，如果没有 就查询 15分钟后,
		   	async: true,
		   	success: function(data){
		   		if(data.success){
					if(data.data){
						top.layer.alert((data.data.remark + '(停机时间：' + data.data.startDate.substring(0, 16) + '至' + data.data.endDate.substring(0, 16) + ')'),{title:'系统停机提示'});
						alertHaltReminder = true;
					}
		   		}else{
					top.layer.alert(data.message)
				}
		   	},
		   	error: function(){
		   		
		   	},
		});
	}
}