
var bidSectionId=getUrlParam("bidSectionId");//标段Id
var examType=getUrlParam("examType");//评标会方式  1.资格预审  2.评标会
var flowUrl=config.Reviewhost+"/ReviewControll/getFlowInfo.do";
var expertsUrl=config.Reviewhost+"/ReviewControll/experts.do";
var reviewFlowNodeUrl=config.Reviewhost+"/ReviewControll/review.do";//评标流程环节路由
var flowInstructUrl=config.Reviewhost + '/ReviewControll/instruct.do';//下达指令
var getCompeteInfoUrl=config.Reviewhost+"/BidCompeteController/findBidCompeteInfo.do";//获取竞争性投票结果
var competeHtml="Review/judgeCheck/model/compete.html";//竞争性投票
var contentsHeight;
var bidSectionInfo			//标段信息
    ,userInfo				//当前登录人信息
    ,reviewRoleType			//评标角色类型 1.评委  2.组长 3.招标监督人 4.项目经理 5.平台 6.监管部门监督人
	,isEnd					//评审结束  0为未完成，1为完成  2.暂停
    ,timeStep               //属性环节导航定时器;
    ,isStopTab = false     //是否停止自动切换
    ,currBidderId          //当前投标人
    ,isHasClnBid = false;          //是否有清标环节
var currNode = {};			//当前节点
var newestNode = {}	;		//最新节点
var currFunction, destructionFunction = function(){};
var tbwjObj = [];//投标文件章节存储，减少请求
var bidderPriceUnit;//投标报价单位

function getFlowInfo(callback){
    $.ajax({
        type: "post",
        url: flowUrl,
        async: false,
        beforeSend: function(xhr){
            var token = $.getToken();
            xhr.setRequestHeader("Token",token);
            mask = null;
        },
        data: {
            'bidSectionId': bidSectionId,
            'examType': examType
        },
        success: function (res) {
            if (res.success) {
                reviewRoleType = res.data.reviewRoleType;
                if(reviewRoleType == 1){
                    parent.$('#isLeader').html('（评审组员）')
				}else if(reviewRoleType == 2){
                    parent.$('#isLeader').html('（评审组长）')
				}
                isEnd = res.data.isEnd;
                callback(res.data.nodes);
            }else{
            	top.layer.alert('温馨提示：'+res.message,function(index){
            		if(res.message == '评审已暂停'){
            			top.layer.closeAll();
            			parent.$('#tableList').bootstrapTable('refresh');
            		}else{
            			top.layer.close(index);
            		}
            		
            	});
            }
        }
    });
}

/**
 * 获取评委信息
 * @returns {*}
 */
function getExperts(){
    var experts;
    //获取标段详情
    $.ajax({
        type:"post",
        url:expertsUrl,
        async:false,
        beforeSend: function(xhr){
            var token = $.getToken();
            xhr.setRequestHeader("Token",token);
            mask = null;
        },
        data:{
            'bidSectionId':bidSectionId,
            'examType': examType
        },
        success:function(res){
            if(res.success){
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
function compete(isEnter, competeCheckId, bidders, callback){
    $('#content').html("");
    if(isEnter==0){
		top.layer.open({
            type: 2,
            title: "竞争性投票",
            area: ['1000px', '600px'],
            resize: false,
            content: competeHtml,
            success:function(layero, index){
                var iframeWin = layero.find('iframe')[0].contentWindow;
                iframeWin.competeList(bidSectionId,examType,competeCheckId,bidders, function(){
                    getCompete(competeCheckId,callback);
                });
            },
        });
    }else{
        top.layer.alert('温馨提示：其他专家还未对竞争性投票，请稍等。');
    }
    if(!competeTask){
        competeTask = setInterval(function () {
            getCompete(competeCheckId,callback);
        }, 15000);
    }
}

/**
 * 获取竞争性投票结果
 * @param checkId
 * @param callback
 */
function getCompete(checkId, callback){
    $.ajax({
        type:"post",
        url:getCompeteInfoUrl,
        beforeSend: function(xhr){
            var token = $.getToken();
            xhr.setRequestHeader("Token",token);
            mask = null;
        },
        data:{
            bidSectionId : bidSectionId,
            examType : examType,
            checkId : checkId
        },
        success:function(res){
            if(res.success){
                var flag = false;
                if(!res.data){
                    flag = true;
                }else{
                    if(res.data.resultType) {
                        flag = true;
                        callback();
                    }else if(res.data.resultType == 0){
                        flag = true;
                    }
                }
                if(flag){
                    if(competeTask){
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
function reviewFlowNode(param, callback, async){
    param.bidSectionId = bidSectionId;
    param.examType = examType;
    async = async ? true : false;
    //获取标段详情
    $.ajax({
        type:"post",
        url:reviewFlowNodeUrl,
        async:async,
        data:param,
        success:function(res){
            if(res.success){
                callback(res.data)
            }else{
                if(res.message != '404'){
                	top.layer.alert('温馨提示：'+res.message,function(index){
	            		if(res.message == '评审已暂停'){
	            			top.layer.closeAll();
	            			top.$('#tableList').bootstrapTable('refresh');
	            		}else{
	            			top.layer.close(index);
	            		}
	            		
	            	});
                }else{
                    top.layer.alert("温馨提示：接口不存在");
                }
            }
        }
    });
}

/**
 *	下达指令
 * @param instruct
 */
function flowiInstruct(instruct, callback){
    $.ajax({
        type:"post",
        url:flowInstructUrl,
        async:true,
        data:{
            'bidSectionId': bidSectionId,
            'examType':examType,
            'instruct':instruct
        },
        success: function(data){
            if(data.success){
				callback();
            }else{
                top.layer.alert('温馨提示：'+res.message);
            }

        }
    });
};

/**
 * 显示评标环节导航栏
 * @param flowNodes
 */
function showFlowNode(flowNodes){
	//0.未开始 1.进行中 2.进行中，不可编辑 3.结束 4.自动结束（可以跳过环节） 5.流标后不需要评标
	var html_box='';
	var html_li='';
	var className;
	if(flowNodes.length > 0){
		html_box += '<li class="step_title"><div style="box-shadow: 5px 0px 0px #81b0d8 inset;">评审准备</div></li><li class="step_content_0"></li>';
		html_box += '<li class="step_title"><div style="box-shadow: 5px 0px 0px #81b0d8 inset;">初步评审</div></li><li class="step_content_1"></li>';
		html_box += '<li class="step_title"><div style="box-shadow: 5px 0px 0px #81b0d8 inset;">详细评审</div></li><li class="step_content_2"></li>';
		html_box += '<li class="step_title"><div style="box-shadow: 5px 0px 0px #81b0d8 inset;">评标结果</div></li><li class="step_content_98"></li>';
		html_box += '<li class="step_title"><div style="box-shadow: 5px 0px 0px #81b0d8 inset;">澄清、说明或补正</div></li><li class="step_content"></li>';
		html_box += '<li class="step_title"><div style="box-shadow: 5px 0px 0px #81b0d8 inset;">评标管理</div></li><li class="step_content_99"></li>';
		$(".flowNodeList").html(html_box);
		var progressIndex = '';
	    for (var i=0; i < flowNodes.length; i++){
	    	var html = '';
	    	if(flowNodes[i].status == 1 || flowNodes[i].status == 2 || flowNodes[i].status == 3){
	            className = 'handle-list';
			}else{
	            className = 'no-click';
			}
			if(flowNodes[i].nodeType == 'cleanBidder'){
	            isHasClnBid = true;
	        }
	        var data_nodeSubType = "";
			if(flowNodes[i].nodeSubType){
	            data_nodeSubType = " data-nodeSubType="+flowNodes[i].nodeSubType;
	        }
			if(flowNodes[i].stage == '0'){
				html = '<li class="step_li flow '+className+'" data-nodeType="'+flowNodes[i].nodeType+'"'+ data_nodeSubType+'>'+flowNodes[i].nodeName+'</li>';
				$(html).appendTo('.step_content_0');
				$('.step_content_0').closest('li').prev().css('display','block')
			}
			if(flowNodes[i].stage == '1'){
				html = '<li class="step_li flow '+className+'" data-nodeType="'+flowNodes[i].nodeType+'"'+ data_nodeSubType+'>'+flowNodes[i].nodeName+'</li>';
				$(html).appendTo('.step_content_1')
				$('.step_content_1').closest('li').prev().css('display','block')
			}
			if(flowNodes[i].stage == '2'){
				html = '<li class="step_li flow '+className+'" data-nodeType="'+flowNodes[i].nodeType+'"'+ data_nodeSubType+'>'+flowNodes[i].nodeName+'</li>';
				$(html).appendTo('.step_content_2')
				$('.step_content_2').closest('li').prev().css('display','block')
			}
			if(flowNodes[i].stage == '98'){
				html = '<li class="step_li flow '+className+'" data-nodeType="'+flowNodes[i].nodeType+'"'+ data_nodeSubType+'>'+flowNodes[i].nodeName+'</li>';
				$(html).appendTo('.step_content_98')
				$('.step_content_98').closest('li').prev().css('display','block')
			}
			if(flowNodes[i].stage == '99'){
				html = '<li class="step_li '+className+'" data-nodeType="'+flowNodes[i].nodeType+'"'+ data_nodeSubType+'>'+flowNodes[i].nodeName+'</li>';
				$(html).appendTo('.step_content_99')
				$('.step_content_99').closest('li').prev().css('display','block')
			}
		}
		if(reviewRoleType == 1 || reviewRoleType == 2){
	        html_li = '<li class="step_li handle-list" data-nodeType="clarify">评标提问</li>';
		}else if(reviewRoleType == 3){
	        html_li = '<li class="step_li handle-list" data-nodeType="clarify">查看提问</li>';
		}else{
	        html_li = '<li class="step_li handle-list" data-nodeType="clarify">查看提问</li>';
		}
		$(html_li).appendTo('.step_content');
		$('.step_content').closest('li').prev().css('display','block')
	}else{
		html_box += '<li class="step_title"><div style="box-shadow: 5px 0px 0px #81b0d8 inset;">澄清、说明或补正：</div></li><li class="step_content"></li>';
		if(reviewRoleType == 1 || reviewRoleType == 2){
	        html_li = '<li class="step_li handle-list" data-nodeType="clarify">评标提问</li>';
		}else if(reviewRoleType == 3){
	        html_li = '<li class="step_li handle-list" data-nodeType="clarify">查看提问</li>';
		}else{
	        html_li = '<li class="step_li handle-list" data-nodeType="clarify">查看提问</li>';
		}
		$(".flowNodeList").html(html_box);
		$(html_li).appendTo('.step_content');
		$('.step_content').closest('li').prev().css('display','block')
	}
	
	$('.flowNodeList').css('height',($(window).height()-75)+'px');
    activities();
}

$(function(){
    bidSectionInfo = getBidsectionInfo(bidSectionId);
	bidderPriceUnit = bidSectionInfo.bidderPriceUnit;
    userInfo = entryInfo();
	var heights=parent.$("#layerPackage").height();
    contentsHeight = ($(window).height()-60)+'px';
	$("#contents").height(contentsHeight);
    $('#contents .mainTable div[id]').each(function(){
        $(this).html(bidSectionInfo[this.id]);
    });
    

    schedule(startNavTask);
//  $('#content').height(($(window).height()-$('#contents .mainTable').height()-75)+'px');
	//getStep(jindu);
})
//评标流程点击事件
$(".flowNodeList").on('click','.handle-list',function(){
	$("#contents").height(($(window).height()-60)+'px');
    var flowNodeFunction;
    var node = {};			//
    node.nodeType = $(this).attr('data-nodeType');
    node.nodeSubType = $(this).attr('data-nodeSubType');
    node.nodeName = $(this).text();
	if(node.nodeType=='clarify' || node.nodeType=='progress'){//查看澄清和进度时不自动跳转
        isStopTab = true;
	}else{
        isStopTab = false;
        startNavTask();
    };

	if(window[node.nodeType]){
        flowNodeFunction = function(){
            destructionFunction();
            return window[node.nodeType](node);
        }
    }

    if(flowNodeFunction){
    	var _this = this;
    	$.each($('.step_li'), function() {
    		$(this).removeClass('open')
    	});
        $(_this).addClass('open');
        currFunction = function(){
            if(flowNodeFunction()){
                currNode = node;
            }else{
				//当前点击为评标内容时判断上次显示的是否评标内容，否则内容清空
				// if(node.nodeType == 'review'){
				// 	if(!$('#content').attr('data-change')){
				// 		$('#content').html("");
				// 		$('#content').attr('data-change','true');
				// 	}
				// }else{
				// 	$('#content').attr('data-change','false');
				// 	 $('#content').html("");
				// }
                $('#content').html("");
            }
        }
        currFunction();
    }
});

$("#btnRefresh").on('click',function(){
    var isJump = schedule();
    if(!isJump){
    	currFunction();
    }
})

//评标总进度
function schedule(callback){
	var isJump = false;
    getFlowInfo(function(flowNodes){
        showFlowNode(flowNodes);
        var flag = false;		//当前节点是否可以点击
        var previous;  //上一个
        var curr;	   //当前
        var list = $(".flowNodeList .flow");
        list.each(function(index, i){
        	var that = $(this)
			if(that.hasClass("handle-list")){
                previous = curr;
                curr = that;
                if(currNode.nodeType == 'clarify' || currNode.nodeType == 'progress'){
                    flag = true;
                }else if(currNode.nodeType){
                	if(curr.attr('data-nodeType') == currNode.nodeType && curr.attr('data-nodeSubType') == currNode.nodeSubType){
                        flag = true;
					}
				}
			}
		});
        if(curr){
            var newest = {
                nodeType:curr.attr('data-nodeType')
            };
            if(curr.attr('data-nodeSubType')){
                newest.nodeSubType = curr.attr('data-nodeSubType');
            }

            //当前环节不能点击（撤回）
            if(!flag ){
                tabReviewNav(curr);
            }else{
                //如果不是第一次（非页面记载第一次）
                if(currNode.nodeType && newestNode.nodeType){
                    if(currNode.nodeType != 'clarify' || currNode.nodeType != 'progress'){
                        //当前环节是上一次的最后一个环节
                        if(currNode.nodeType == newestNode.nodeType){
                            //有详细环节分类
                            if(currNode.nodeSubType && newestNode.nodeSubType){
                                //当前环节是上一次检测的最后一项， 且最新一次环节有变化
                                if(currNode.nodeSubType == newestNode.nodeSubType && !(newest.nodeType == newestNode.nodeType && newest.nodeSubType == newestNode.nodeSubType)){
                                    isJump = tabReviewNav(curr);
                                }
                            }else if(!(newest.nodeType == newestNode.nodeType)){
                                isJump = tabReviewNav(curr);
                            }
                        }else{
//                      	tabReviewNav(curr);
                        }
                    }
                }else{
                    isJump = tabReviewNav(curr);
                }
            }

            //设置最新的环节
            newestNode = newest;
            if(callback){
                callback();
            }

        }
	});
	return isJump;
}

/**
 * 切换环节
 * @param dom
 */
function tabReviewNav(dom){
    if(!isStopTab){
        dom.click();
        return true;
    }
    return false;
}

function activities(){
	if(currNode.nodeType){
	    var select = "[data-nodeType="+currNode.nodeType+"]";
	    if(currNode.nodeSubType){
            select +=  "[data-nodeSubType="+currNode.nodeSubType+"]";
        }
	    $.each($('.step_li'), function() {
    		$(this).removeClass('open')
    	});
        $(select).addClass('open');
	}
}

/**
 * 加载内容
 * @param htmlPath
 */
function loadContent(htmlPath, callback){
    $('#content').load(htmlPath,callback);
}

/**
 * 加载按钮
 * @param htmlPath
 * @param callback
 */
function loadButton(htmlPath){
    $('#btn-box').load(htmlPath);
}

/**
 * 设置底部按钮
 * @param buttonsHtml
 */
function setButton(buttonsHtml){
    $('#btn-box').html(buttonsHtml);
}

$('#btn-box').on('click','#relevant',function(){
	relevant()
});

$("#btnClose").on('click',function(){
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

function relevant(){
    var surl="./model/relevant"+examType+".html?bidSectionId="+bidSectionId+"&examType="+examType+"&nodeType="+currNode.nodeType+"&nodeSubType="+currNode.nodeSubType;
    window.open(surl, "_blank");
}

function viewBidFile(){
	var surl="./model/tenderFile.html?bidSectionId="+bidSectionId+"&examType="+examType;
	window.open(surl, "_blank");
}
/*************       页面传参       *******************/
function passMessage(data,callback){
	//关闭
	$("#btnClose").click(function(){
		callback();
		var index = top.layer.getFrameIndex(window.name); 
		top.layer.close(index); 
	});
}
