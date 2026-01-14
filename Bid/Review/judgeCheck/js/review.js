var zbwjAndTbwjListUrl=config.Reviewhost+"/ReviewControll/findZbwjAndTbwjList.do";//招投标文件
var allHtml="Review/df/publicPosttrial/judges/model/allReview.html";
var oneSummary='Review/judgeCheck/model/oneSummary.html';
var clnBidReportUrl='Review/judgeCheck/model/clnBidReport.html';
var reviewNode, suppliers, checkType, maxTotalScore, expertId;//评委当前评审项的投标人的评审情况（是否评审或提交评审）
var tree = '';
var allCheckItems = [];//所有评审分项
var allItemObjs = {}; //{checkItemid:checkName}
var bigTerm = [];//从中获取评审项相关状态
var saveResult = {};//临时存储结果
var experts;
var pdfPage = 1;
var zbwjUrl = '';
var zbwjIsOpen = false;//招标文件是否打开
var zbwjView,tbwjView;
var wantOpenTBFileUrl;//需要打开的投标文件地址
var wantOpenTBFilePage;//需要打开的投标文件页码
var isContrast = false;//是否横向对比（ 切投标人时选中的评审条款不变 ）第一次进入评审大项时为false,此时默认第一项选中
var contrastId = '';//横向对比的评审条款id
//标段评标
function review(node){
	saveResult = {};
//	saveTotleScore = {}
	//清空评委信息
	if(!node.nodeSubType || (reviewNode && node.nodeSubType != reviewNode.nodeSubType)){
        expertId = '';
	}

	var param = {
        "method":'findBidList',
        "nodeType":node.nodeType,
        "nodeSubType":node.nodeSubType
    };

	var content;
	//评标评委
	if(reviewRoleType == 1 || reviewRoleType == 2){
        content = 'model/review/content.html';
	}else{//非评委则需要通过评委列表查看
        content = 'model/review/not_expert_content.html';
        experts = getExperts();
        expertId = experts[0].expertId;
        param.expertId = expertId;
	}
	isContrast = false;
    var flag = false;
    reviewFlowNode(param, function(data){
        flag = true;
        reviewNode = node;
        if(data.isCompete == 1){
            suppliers = data.supplierDtos;
            $('#content').load(content,function(){
				zbwjIsOpen = false;//中间内容重载时设置未打开
				tbwjObj = [];
            	if(experts){
                    //显示评委列表
                    showExpertNav(experts, expertId);
				}else{
	                /*计算高度*/
	               	$('#content').css('height',($(window).height()-$('#contents .mainTable').height()-75)+'px');
	               	$('.review_left').css('height',($(window).height()-$('#contents .mainTable').height()-55-13-11)+'px');
	               	$('.review_middle').css('height',($(window).height()-$('#contents .mainTable').height()-55-11)+'px');
	               	$('#zbwjPdf').css('height',($(window).height()-$('#contents .mainTable').height()-55-11-95)+'px');
	               	$('#tbwjPdf').css('height',($(window).height()-$('#contents .mainTable').height()-55-11-95)+'px');
	               	$('.canvas_box').css('height',($(window).height()-$('#contents .mainTable').height()-55-11-95-16)+'px');
	               	$('.review_right').css('height',($(window).height()-$('#contents .mainTable').height()-55-11)+'px');
	               	$('#checkItemTree').css('height',($(window).height()-$('#contents .mainTable').height()-65-32-11)+'px');
	               	$('.review_standard_box').css('height',($(window).height()-$('#contents .mainTable').height()-75-170-215-11)+'px');
	               	$('.review_show').css('height',($(window).height()-$('#contents .mainTable').height()-127-42-11)+'px');
	               	$('#all_tbwj_box').css('height',($(window).height()-$('#contents .mainTable').height()-127-42-11)+'px');
				}
                var currBidders = [];
				for(var i = 0; i < data.supplierDtos.length; i++){
                    currBidders.push(data.supplierDtos[i])
				}
				showSupplierList(currBidders);
                getExpertCheckItem(data.supplierDtos[0].supplierId);
            });
        }else if(data.isCompete == 2){
            compete(data.isEnter, data.competeCheckId, data.supplierDtos, function(){
                review(node);
			});
        }
    }, false);
    return flag;
};



/**
 * 显示评委列表
 * @param experts
 */
function showExpertNav(experts, expertId){
	var html = "";
	for(var i=0; i < experts.length; i++){
		var open = ''
		if(expertId == experts[i].expertId){
            open += ' open'
		}
        html += '<div style="margin-bottom:10px;min-width:80px" data-expertId="'+experts[i].expertId+'" class="btn btn-default expertBtn'+open+'">'+experts[i].expertName+'</div>'
	}
	$("#expertNav").html(html);
}

/**
 * 渲染投标人列表
 * @param suppliers
 */
function showSupplierList(suppliers){
	var list='';
	
   	for(var i=0;i<suppliers.length;i++){
   		var resultKey = suppliers[i].supplierId;
   		/*本地存储结果与总分*/
   		saveResult[resultKey] = [];
   		var className = 'bidder';
        if(i==0){
            className += ' active';
        }
   		if(suppliers[i].checkState == 0){
   			className += ' saveReviewed';//保存
   		}else if(suppliers[i].checkState == 1){
   			className += ' isReviewed';//已评审
   		}else{
   			className += ' notReviewed';//未评审
   		}
   		list+='<li role="supplier" class="'+className+'" data-bidderId="'+suppliers[i].supplierId+'"><a href="#"  ria-controls="supplier" role="tab" data-toggle="tab">'+ suppliers[i].enterpriseName  +'</a></li>'
   	};
   	list += '<li style="clear: both;"></li><li style="clear: both;"></li>';
   
	$("#bidderList").html(list);
	var allWidth = 0;
	$.each($('#bidderList li'),function(index,item){
		allWidth += Number($(this).width()) + 2
	})
	if(allWidth > Number($('#bidderList').width())){
		/*$("#bidderList").prepend('<div class="ele_seize"></div>');
		$("#bidderList").append('<div class="ele_seize"></div>');*/
		$(".bidder_list_box").css({'padding':'0px 30px'})
		$('.go_left').show();
		$('.go_right').show();
	}else{
		$('.go_left').hide();
		$('.go_right').hide();
	}
}

/**
 * 投标人对应的评价内容
 * @param bidderId
 */
function getExpertCheckItem(bidderId) {
    bidderId = bidderId || currBidderId;
	var param = {
        "method": 'getExpertCheckItem',
        "nodeType": reviewNode.nodeType,
        "nodeSubType": reviewNode.nodeSubType,
        "supplierId": bidderId
    };

	if(expertId){
        param.expertId = expertId;
	}
    reviewFlowNode(param, function (data) {
        maxTotalScore = data.score;
        checkType = data.checkType;
        currBidderId = bidderId;
        showCheckItem(data,bidderId);
    }, true);
};

/**
 * 显示打分详情
 * @param data
 */
function showCheckItem(data){
	//渲染评标内容表格样式；
	var btns ='';
	if(data.submitType!=1&&isEnd==0){
//      btns +="<button id='fileBtn' class='btn btn-primary btn-strong'>招投标文件</button>"
		if(reviewRoleType == 1 || reviewRoleType == 2){
            btns +="<button id='saveReviewBtn' class='btn btn-primary btn-strong keyButton'>保存</button>"
            btns +="<button id='submitReviewBtn' class='btn btn-primary  btn-strong keyButton'>提交</button>";
		}
	}else{
//      btns +="<button id='fileBtn' class='btn btn-primary  btn-strong'>招投标文件</button>"
	}
	if(experts){
		btns +="<button id='fileBtn' class='btn btn-primary  btn-strong'>招投标文件</button>"
	}
	/*if(isHasClnBid){
        btns +="<button id='clnBidReportBtn' class='btn btn-primary  btn-strong'>清标报告</button>"
	}*/

	// if(reviewRoleType == 2){
     //    btns+="<button id='allReviewBtn'  class='btn btn-primary btn-strong allReviewBtn'>其他评委的评标结果</button>";
	// }

	if(reviewRoleType != 1 && reviewRoleType != 2){
        btns += '<button id="oneSummary" type="button" class="btn btn-primary btn-strong keyButton">'+ reviewNode.nodeName +'的评标汇总</button>';
	}

    btns +='<button id="relevant" class="btn btn-primary btn-strong">查看项目信息</button>';
    // btns +='<button id="test" class="btn btn-primary btn-strong">pdfjs</button>';
	var totalScore ='';
	if(data.checkType==3){
        totalScore ='总分：';
		if(data.submitType!=1){
            totalScore+="<input readonly='readonly' type='number' style='display: inline;width:165px' value='"+(data.totalScore!=undefined?data.totalScore:"")+"' class='form-control supplierTotalScore'/>";
		}else{
            totalScore+=data.totalScore;
		}
        $("#totalScore").html(totalScore);
        $("#totalScore").show();
	}else{
        $("#totalScore").html("");
        $("#totalScore").hide();
	};
    $('#btn-box').html(btns);
    var height=''
	if(data.submitType==1){
		if(data.bidCheckItems.length>15){
			height='580';
		}
	}else{
		if(data.bidCheckItems.length>10){
			height='580';
		}
	}

    var columns = [{
		field: "xuhao",
		title: "序号",
		align: "center",
		halign: "center",
		width: "50px",
		formatter: function(value, row, index) {
			return index + 1;
		}
	},
		{
			field: "checkName",
			title: "评价内容",
			align: "left",
			halign: "left",
			width:'80',
			formatter: function(value, row, index) {
				return '<pre>'+ (value||'') +'</pre>'
			}

		},
		{
			field: "checkStandard",
			title: "评价标准",
			halign: "left",
			align: "left",
			width:'400',
			formatter: function(value, row, index) {
				return '<pre>'+ (value||'') +'</pre>'
			}

		}, {
			field: "isKey",
			title: data.checkType!=3?"是否关键要求":"分值",
			halign: "center",
			width:'80',
			align: "center",
			formatter: function(value, row, index) {
				if(data.checkType!=3){
					if(row.isKey == 1) {
						return '是'
					} else {
						return '否'
					}
				}else{
					return row.score
				}

			}
		},
		{
			field: 'itemScoreType',
			title: '打分类型',
			halign: "center",
			align: "center",
			width:'80',
			visible: data.checkType == 3,
			formatter: function(value) {
				if (value == '1') {
					return '主观分';
				} else if (value == '2') {
					return '客观分'
				}
			}
		},
		{
			field: "caoz",
			title: data.checkType!=3?"操作":"打分",
			halign: "center",
			align: "center",
			width:'150',
			events:{
				'change .supplierIskey':function(e,value, row, index){

				},
				'change .supplierScore':function(e,value, row, index){
					var resultL = 0;
					var reg = /(^(0|([1-9]\d*))\.\d{1,2}$)|(^(0|([1-9]\d*))$)/;
					if($(this).val()!=""){
						if(!(reg.test($(this).val()))){
							$(this).val("");
                            top.layer.alert('温馨提示：分值必须为大于等于零的数字,且小数点后面最多两位小数');
							return false;
						};
						if(parseFloat($(this).val())>parseFloat(row.score)){
							$(this).val("");
                            top.layer.alert('温馨提示：当前项打分不能超过'+row.score+'分');

							return false;
						};
					}
					$(".supplierScore").each(function(){
						if($.trim($(this).val()) != ''){
							resultL= resultL + Number($.trim($(this).val()));
						}

					})
					resultL = resultL.toFixed(2);
					$("#totalScore .supplierTotalScore").val(resultL)
				}
			},
			formatter: function(value, row, index) {
				if(data.checkType!=3){//不等于评分制0合格制、1偏离、2响应、3打分制
					var val
					if(data.submitType==1){//提交
						if(data.checkType==2){
							val=(row.expertIsKey==1?'响应':'不响应')
						}else if(data.checkType==0){
							val=(row.expertIsKey==1?'合格':'不合格')
						}else if(data.checkType==1){
							val=(row.expertIsKey==1?'未偏离':'偏离')
						}
					}else{//临时保存或撤回
						if(reviewRoleType == 1 || reviewRoleType == 2){
							val="<select class='form-control supplierIskey' data-id='"+row.id+"'>"
							if(data.checkType==2){
								val+="<option value='1' "+ (row.expertIsKey!=0?"selected='selected'":"") +" >响应</option>"
								val+="<option value='0' "+ (row.expertIsKey==0?"selected='selected'":"") +">不响应</option>"
							}else if(data.checkType==0){
								val+="<option value='1' "+ (row.expertIsKey!=0?"selected='selected'":"") +">合格</option>"
								val+="<option value='0' "+ (row.expertIsKey==0?"selected='selected'":"") +">不合格</option>"
							}else if(data.checkType==1){
								val+="<option value='1' "+ (row.expertIsKey!=0?"selected='selected'":"") +">未偏离</option>"
								val+="<option value='0' "+ (row.expertIsKey==0?"selected='selected'":"") +">偏离</option>"
							}
							val+="</select>"
						}else{
							val = ''
						}
					}
					return val
				}else{//等于评分制
					if(data.submitType==1){//临时保存
						return row.expertScore;
					}else{
						if(reviewRoleType == 1 || reviewRoleType == 2){
							return "<input   type='number' value='"+ (row.expertScore!=undefined?row.expertScore:"") +"' class='form-control supplierScore' data-id='"+row.id+"'/>"
						}else{
							return ''
						}
					}
				}

			}
		},
		{
			field: "reason",
			title: "原因",
			halign: "center",
			align: "center",
			width:'200',
			formatter: function(value, row, index) {
				if(data.submitType==1){//提交
					var account = '';
					if(value){
						var account = value.replace(/\n/g,"<br>");
					}
					return "<pre>"+(account||"")+"</pre>"
				}else{
					if(reviewRoleType == 1 || reviewRoleType == 2){
						return "<tableList style='max-height:80px;' type='text'class='form-control reason'>"+ (row.reason!=undefined?row.reason:"") +"</textarea>"
					}else{
						return ''
					}
				}
			}
		}
	];
	if(experts){
		$('#checkItemList').bootstrapTable({pagination: false, height:height, columns:columns});

	    $('#checkItemList').bootstrapTable('refreshOptions', {data:data.bidCheckItems, columns:columns});
	   // $('#checkItemList').bootstrapTable("load", data.bidCheckItems); //重载数据
	    if(!height){
			$('#tableList .fixed-table-body').css("height","auto");
		}
	}else{
		/*处理评审标准中的空格*/
		function manageStandard(data){
			for(var i = 0;i<data.length;i++){
				if(data[i].checkStandard){
					var cont = data[i].checkStandard;
					data[i].checkStandard = cont.replace(/\n/g,"<br>");
				}
			}
		}
		manageStandard(data.bidCheckItems)
		$('#checkItemTree').html('');
		tree = '';
		allCheckItems = [];
		bigTerm = data;
		var bidCheckItems = []; 
		var treeList = data.bidCheckItems;
		var tempCheckItems = {};
		for(var i = 0;i<treeList.length;i++){
			tempCheckItems[treeList[i].id] = treeList[i];
			treeList[i].bidCheckItems = [];
			if(!treeList[i].pid || treeList[i].pid == '0'){
				bidCheckItems.push(treeList[i]);
			}
		}
		for(var i = 0;i<treeList.length;i++){
			if(treeList[i].pid && treeList[i].pid != '0'){
				var temp = tempCheckItems[treeList[i].pid];
				if(temp != null){
					temp.bidCheckItems.push(treeList[i]);
				}else{
					bidCheckItems.push(treeList[i]);
				}
			}
		}
		creatTree(bidCheckItems,true);
		$.each($('.tree_has_son'), function() {
			$(this).next().find('li::before').css('content','--')
		});
		
		$('#checkItemTree').html(tree);
		isContrast = true;
		if(isContrast){
			$.each($('#checkItemTree li'),function(){
				if(contrastId == $(this).attr('data-id')){
					$(this).addClass('choose')
				}
			})
		}
		/*展示pdf,还是内容*/
		if(data.isAutoCalculate && data.isAutoCalculate == 1){
			$('#zbwjPdf').css('display','none');
			$('#review_show_cont').css('display','block');
			$('[aria-controls="zbwj_box"]').html('评分标准');
			$('.tbwj_li').css('display','none');
			$('.review_standard_box').css('display','none');
		}else{
			$('#zbwjPdf').css('display','block');
			$('.tbwj_li').css('display','block');
			$('[aria-controls="zbwj_box"]').html('招标文件');
			$('#review_show_cont').css('display','none');
			$('.review_standard_box').css('display','block');

			if(!zbwjIsOpen){//未打开时获取地址并加载
				getBidFile();
			}
		}
		creatReviewCont($('#checkItemTree .choose'));
	}

}
$('#content').on('click','.tbwj_li',function(){
	$('#tbwjPdf').attr('src', $('#tbwjPdf').attr('src'));
});
function findParentNode(nodes, attr, val) {
	if(!val) return false;
	for(var i = 0; i < nodes.length; i++) {
		if(nodes[i][attr] == val) {
			return nodes[i];
		}
		var node;
		if(nodes[i].bidCheckItems && nodes[i].bidCheckItems.length > 0) {
			node = findParentNode(nodes[i].bidCheckItems, attr, val);
			if(node) return node;

		}
	}
	return null;
};

/**
 * 评标打分
 * @param bidderId
 * @param submitType
 * @returns {boolean}
 */
function saveScore(bidderId,submitType){
//	console.log(saveResult);
	var isSave=true, index, hasReason = true;
	var totaleScore = 0;
	var param={
        "method":'saveReview',
        "nodeType":reviewNode.nodeType,
        "nodeSubType":reviewNode.nodeSubType,
		'supplierId':bidderId,
		'submitType':submitType,
		'expertCheckItems':[]
	};
	/*********  本地存储中取数据  ************/
	$.each(saveResult, function(key,value) {
		if(bidderId == key){
			param.expertCheckItems=saveResult[key];
			if(checkType==3){
                for(var m = 0;m<saveResult[key].length;m++){
                	if(submitType == 1){
                		if(!saveResult[key][m].score && saveResult[key][m].score != 0){
                            top.layer.alert('温馨提示：“'+allItemObjs[saveResult[key][m].checkItemId]+'”没有打分');
                            isSave = false;
                            return false;
						}
					}
                    if(saveResult[key][m].score){
                        var reg = /(^(0|([1-9]\d*))(\.\d{1,2})?$)/;
                        if(!(reg.test(saveResult[key][m].score))){
                            top.layer.alert('温馨提示：“'+allItemObjs[saveResult[key][m].checkItemId]+'”无效打分');
                            isSave = false;
                            return false;
                        }
                        totaleScore += Number(saveResult[key][m].score);
					}
                }
                totaleScore = totaleScore.toFixed(2);
                param.totalScore = totaleScore;
			}
		}
	});
	if(!isSave){
		return isSave;
	}
//	console.log(param)
	for(var i = 0;i<allCheckItems.length;i++){
		var isIn = false;
		for(var j = 0;j<param.expertCheckItems.length;j++){
			if(allCheckItems[i].id == param.expertCheckItems[j].checkItemId ){
				isIn = true
			}
		}
		if(!isIn){
			isSave=false;
			index=i;
		}
	}
	if(checkType!=3){//非打分项
		for(var j = 0;j<param.expertCheckItems.length;j++){
			if(param.expertCheckItems[j].isKey != 1 &&  (!param.expertCheckItems[j].reason || $.trim(param.expertCheckItems[j].reason) == '')){
				hasReason = false;
				index=j;
			}
		}
	}
	if(submitType==1){
		if(isSave==false){
            top.layer.alert('温馨提示：评审条款 '+allCheckItems[index].checkName+' 还未评审');
		}
		if(!hasReason){
			var isText = '';
			if(checkType==0){
                isText="不合格";
            }else if(checkType==1) {
                isText="偏离";
            }else if(checkType==2){
                isText="不响应";
            };
            top.layer.alert('温馨提示：请输入评审条款  '+allCheckItems[index].checkName+' '+isText+ ' 的原因');
			return false
		}
		if(checkType==3){
			if(parseFloat(totaleScore)>parseFloat(maxTotalScore)){
                top.layer.alert('温馨提示：总分不能超过'+maxTotalScore);
				return false;
			}			
		}
	}
	
    reviewFlowNode(param, function(data){
        if(submitType==0){
            top.layer.alert('温馨提示：保存成功');
            $('#reviewWarp #bidderList .active').addClass('saveReviewed').removeClass('notReviewed');
        }else if(submitType==1){
            top.layer.alert('温馨提示：提交成功');
            $('#reviewWarp #bidderList .active').addClass('isReviewed').removeClass('notReviewed').removeClass('saveReviewed');
            getExpertCheckItem(bidderId);
        }
        for(var i = 0;i<suppliers.length;i++){
            if(suppliers[i].supplierId == bidderId){
                suppliers[i].checkState = submitType;
                break;
            }
        }
    }, false);
}

function viewFileBtn(currBidderId){
	var surl="model/showBidFile.html";
	sessionStorage.setItem('bidSectionId',bidSectionId);
	sessionStorage.setItem('supplierId',currBidderId);
	sessionStorage.setItem('examType',examType);
	sessionStorage.setItem('gid',reviewNode.nodeSubType);
	window.open(surl, "_blank");
}

/**
 * 获取当前投标人
 * @returns
 */
function getCurrBidders(){
    return suppliers;
}

function allReview(){
	top.layer.open({
		type: 2,
		title: "其他评委的评标结果",
		area: ['1000px', '600px'],
		resize: false,
		content: allHtml+'?bidSectionId='+bidSectionId+'&examType='+examType,
		success:function(layero, index){
			var iframeWin = layero.find('iframe')[0].contentWindow;	
			iframeWin.supplierLists(checkType,0,suppliers)
		},
	});
}


$('#content').on('click','.bidder', function(){
	var isShow = $('#review_show_cont').css('display')
	emptyReview(isShow)
    getExpertCheckItem($(this).attr("data-bidderId"));
});

$('#content').on('click','.expertBtn', function(){
	expertId=$(this).attr("data-expertId");
    $(this).addClass('open').siblings().removeClass('open');
    getExpertCheckItem();
});

$('#btn-box').on('click','#fileBtn', function(){
    viewFileBtn(currBidderId);
})

$('#btn-box').on('click','#saveReviewBtn', function(){
    saveScore(currBidderId, 0);
})

$('#btn-box').on('click','#submitReviewBtn', function(){
    saveScore(currBidderId, 1);
})

$('#btn-box').on('click','#allReviewBtn', function(){
    allReview();
});

$('#btn-box').on('click','#oneSummary', function(){
    top.layer.open({
        type: 2,
        title: reviewNode.nodeName +"评标汇总",
        area: ['1000px', '600px'],
        resize: false,
        content: oneSummary+'?bidSectionId='+bidSectionId+'&examType='+examType+'&bidCheckId='+reviewNode.nodeSubType+'&checkType='+checkType,
        success:function(layero, index){
            var iframeWin = layero.find('iframe')[0].contentWindow;
        },
    });
});

$('#btn-box').on('click','#clnBidReportBtn', function(){
    openClnBidReport();
});

function openClnBidReport(){
    top.layer.open({
        type: 2,
        title: "清标报告",
        area: ['100%', '100%'],
        resize: false,
        content: clnBidReportUrl+'?bidSectionId='+bidSectionId+'&examType='+examType,
        success:function(layero, index){
            var iframeWin = layero.find('iframe')[0].contentWindow;
            iframeWin.passMessage($.getToken());
        },
    });

}

/****************        评审项        ****************/
function creatTree(data,isFirst){
	tree += '<ul class="tree_ul">'
	for(var i = 0;i<data.length;i++){
		if(isFirst && i == 0){
			if(data[i].bidCheckItems && data[i].bidCheckItems.length > 0){
				tree += '<li class="tree_li tree_has_son" data-id="'+data[i].id+'" data-checkId="'+data[i].checkId+'" data-checkStandard="'+data[i].checkStandard+'">'+data[i].checkName+'</li>';
				creatTree(data[i].bidCheckItems,true);
			}else{
				if(!isContrast){
					contrastId = data[i].id;
				}
				tree += '<li class="tree_li '+(isContrast?'':'choose')+'" data-id="'+data[i].id+'" data-checkId="'+data[i].checkId+'" data-checkStandard="'+data[i].checkStandard+'">'+data[i].checkName+'</li>';
				allCheckItems.push(data[i])
			}
		}else{
			if(data[i].bidCheckItems && data[i].bidCheckItems.length > 0 ){
				tree += '<li class="tree_li tree_has_son" data-id="'+data[i].id+'" data-checkId="'+data[i].checkId+'" data-checkStandard="'+data[i].checkStandard+'">'+data[i].checkName+'</li>';
				creatTree(data[i].bidCheckItems,false)
			}else{
				tree += '<li class="tree_li" data-id="'+data[i].id+'" data-checkId="'+data[i].checkId+'" data-checkStandard="'+data[i].checkStandard+'">'+data[i].checkName+'</li>';
				allCheckItems.push(data[i])
			}
		}
        allItemObjs[data[i].id] = data[i].checkName;
	}
	tree += '</ul>';
	/*tree += '<ul class="tree_ul">'
	for(var i = 0;i<data.length;i++){
		tree += '<li class="tree_li" data-id="'+data[i].id+'" data-checkId="'+data[i].checkId+'" data-checkStandard="'+data[i].checkStandard+'">'+data[i].checkName+'</li>';
		if(data[i].bidCheckItems && data[i].bidCheckItems.length > 0 ){
			creatTree(data[i].bidCheckItems)
		}else{
			allCheckItems.push(data[i])
		}
	}
	tree += '</ul>';*/
	/******   已经保存过的数据 存至本地存储       *****/
	$.each(saveResult, function(key,value) {
		if($('#bidderList .active').attr('data-bidderid') == key){
			for(var i = 0;i<allCheckItems.length;i++){
				var obj = {};
				var isCover = true;
				if(saveResult[key].length > 0){
					for(var n = 0;n<saveResult[key].length;n++){
						if(saveResult[key][n].checkItemId == allCheckItems[i].id){
							isCover = false;
						}
					}
				}

				if(allCheckItems[i].expertIsKey || allCheckItems[i].expertIsKey == 0){
					obj.checkItemId = allCheckItems[i].id;
					obj.isKey = allCheckItems[i].expertIsKey;
					if(allCheckItems[i].reason){
						obj.reason = allCheckItems[i].reason;
					}
				}else if(allCheckItems[i].expertScore != undefined){
					obj.checkItemId = allCheckItems[i].id;
					obj.score = allCheckItems[i].expertScore;
					if(allCheckItems[i].reason){
						obj.reason = allCheckItems[i].reason;
					}
				}else{
					isCover = false;
				}
				if(isCover){
					saveResult[key].push(obj);
				}
			}
		}
	});
}
$('#content').on('click','.tree_li',function(){
	contrastId = $(this).attr('data-id');
	creatReviewCont($(this))
});
$('#content').on('click','.tbwj_li',function(){
	if(wantOpenTBFileUrl){
		creatTBWJ(wantOpenTBFileUrl,wantOpenTBFilePage);
	}
});

function creatReviewCont(ele){
	var obj = {};
//	var _this = this;
	$.each($('#checkItemTree .tree_li'), function() {
		$(this).removeClass('choose')
	});
	$(ele).addClass('choose');
	for(var m = 0;m < allCheckItems.length;m++){
		if($(ele).attr('data-id') == allCheckItems[m].id){
			obj = allCheckItems[m]
		}
	}
//	console.log()
	/****  已经评审过的数据覆盖  ****/
	$.each(saveResult, function(key,val) {
		if(key == $('#bidderList .active').attr('data-bidderid')){
			for(var m = 0;m < saveResult[key].length;m++){
				if(saveResult[key][m].checkItemId == obj.id){
					if(saveResult[key][m].isKey){
						obj.expertIsKey = saveResult[key][m].isKey
					}
					if(saveResult[key][m].score != undefined){
						obj.expertScore = saveResult[key][m].score
					}
					if(saveResult[key][m].reason){
						obj.reason = saveResult[key][m].reason
					}
					
				}
			}
		}
	});
	
	if($.isEmptyObject(obj)){
		var isShow = $('#review_show_cont').css('display')
		emptyReview(isShow)
	}else{
		$('.review_standard_tit').html('评价标准：')
		
		var handle = '';//操作
		var isKeyReason = '';//原因
		$('.review_handle_box').html('');
		$('.review_reason').html('');
		
		if(bigTerm.checkType != 3){//非打分项
			$('.review_key_title').html('是否关键要求：');
			
			
			if(obj.isKey == 1) {
				$('.review_key_cont').html('是');
			}else{
				$('.review_key_cont').html('否');
			}
			handle += '<span class="review_handle_title">操作：</span>';
			isKeyReason += '<div class="review_reason_title">原因：</div>';
			if(bigTerm.submitType==1){//提交
				
				if(bigTerm.checkType==2){
					handle += (obj.expertIsKey==1?'<span class="review_handle">响应</span>':'<span class="review_handle">不响应</span>')
				}else if(bigTerm.checkType==0){
					handle += (obj.expertIsKey==1?'<span class="review_handle">合格</span>':'<span class="review_handle">不合格</span>')
				}else if(bigTerm.checkType==1){
					handle += (obj.expertIsKey==1?'<span class="review_handle">未偏离</span>':'<span class="review_handle">偏离</span>')
				}
				if(obj.expertIsKey != 1){
					var account = '';
					if(obj.reason){
						account = obj.reason;
						account = account.replace(/\n/g,"<br>")
					}
					// isKeyReason += '<div style="height:185px;" class="review_reason_cont">'+account+'</div>';
				}
				isKeyReason += '<div style="height:185px;" class="review_reason_cont">'+(obj.reason?obj.reason: '')+'</div>';
			}else{//临时保存或撤回
				handle += "<select class='form-control supplierIskey' data-id='"+obj.id+"' style='display: inline-block;width: 100px;'>"
				if(bigTerm.checkType==2){
					handle += "<option value='1' "+ (obj.expertIsKey!=0?"selected='selected'":"") +" >响应</option>"
					handle += "<option value='0' "+ (obj.expertIsKey==0?"selected='selected'":"") +">不响应</option>"
				}else if(bigTerm.checkType==0){
					handle += "<option value='1' "+ (obj.expertIsKey!=0?"selected='selected'":"") +">合格</option>"
					handle += "<option value='0' "+ (obj.expertIsKey==0?"selected='selected'":"") +">不合格</option>"
				}else if(bigTerm.checkType==1){
					handle += "<option value='1' "+ (obj.expertIsKey!=0?"selected='selected'":"") +">未偏离</option>"
					handle += "<option value='0' "+ (obj.expertIsKey==0?"selected='selected'":"") +">偏离</option>"
				}
				handle += "</select>";
				isKeyReason += '<textarea  style="height:185px;resize:none;" class="form-control review_reason_cont" >'+(obj.reason?obj.reason: '')+'</textarea>';
			}
			$('.review_reason').css('height','215px');
		}else{//打分项
			$('.review_key_title').html('分值：');
			$('.review_key_cont').html(obj.score);
			handle += '<span class="review_handle_title">打分：</span>';
			if(bigTerm.submitType==1){//临时保存
				handle += '<span>'+(obj.expertScore!=undefined?obj.expertScore:"")+'</span>' ;
				if(obj.reason){
					var account = '';
					account = obj.reason;
					account = account.replace(/\n/g,"<br>")
					isKeyReason += '<div class="review_reason_title">计算过程：<button type="button" class="btn btn-sm btn-primary progress_large">查看</button></div>';
					isKeyReason += '<div style="height:'+($(window).height()-$('#contents .mainTable').height()-75-180)+'px;" class="review_reason_cont">'+account+'</div>';
					$('.review_reason').css('height',($(window).height()-$('#contents .mainTable').height()-75-125)+'px');
				}
	//			handle += '<div>'+obj.expertScore+'</span>' ;
			}else{
				handle +=  "<input type='number' value='"+ (obj.expertScore!=undefined?obj.expertScore:"") +"' class='form-control supplierScore' data-id='"+obj.id+"' data-score='"+obj.score+"'/>"
				if(obj.reason){
					isKeyReason += '<div class="review_reason_title">计算过程：<button type="button" class="btn btn-sm btn-primary progress_large">查看</button></div>';
					isKeyReason += '<textarea style="height:'+($(window).height()-$('#contents .mainTable').height()-75-180)+'px;resize:none;" class="form-control review_reason_cont">'+(obj.reason?obj.reason: '')+'</textarea>';
					$('.review_reason').css('height',($(window).height()-$('#contents .mainTable').height()-75-125)+'px');
				}
				
	//			handle +=  "<textarea style='max-height:80px;' type='text'class='form-control reason'>"+ (obj.reason!=undefined?obj.reason:"") +"</textarea>"
			}
		}
		
		$(handle).appendTo('.review_handle_box');
		$(isKeyReason).appendTo('.review_reason');
		$('.supplierScore').focus();
		var newUrl=config.FileHost + "/fileView" + obj.fileChapterUrl+'#scrollbars=0&toolbar=0&statusbar=0';

       /* if(obj.fileChapterPage){
            $('.file_chapter_page').css('display','block');
            $('.file_chapter_page .file_chapter_page_data').html(obj.fileChapterPage);
            var objRegExp= /^\d+$/;
            if(objRegExp.test(obj.fileChapterPage+"")){
                newUrl = newUrl + "&page="+obj.fileChapterPage;
			}
        }else{
            $('.file_chapter_page').css('display','none');
            $('.file_chapter_page .file_chapter_page_data').html('');
        }*/
        if(obj.fileChapterUrl){
			var fileUrl = config.FileHost + '/fileRangeView'+ obj.fileChapterUrl+'#scrollbars=0&toolbar=0&statusbar=0';
			pdfPage = obj.fileChapterPage;
			if(obj.fileChapterUrl != $("#tbwjPdf").attr('data-url')){
				
				// tbwjView = new pdfjs_Extend('tbwjPdf',{url: fileUrl,pageNum: pdfPage});
				// $("#tbwjPdf").attr('src',"about:blank");
				// $("#tbwjPdf").attr('src','../pdfjs/web/viewer.html?file='+config.FileHost + '/fileView'+obj.fileChapterUrl + '&page='+pdfPage+'&top=150&zoom=1');
				//判断该pdf是否打开过，若打开过则显示对应的元素，若无，创建元素并打开且存入本地对象（本地缓存）
				if($('.tbwj_li').hasClass('active')){
					creatTBWJ(obj.fileChapterUrl, pdfPage);
				}else{
					//需要打开的投标文件地址
					wantOpenTBFileUrl = obj.fileChapterUrl;
					wantOpenTBFilePage = pdfPage;
				}
			}else{
				var a = document.getElementById("tbwjPdf");
				var pdfViewer = a.contentWindow.PDFViewerApplication.pdfViewer;
				if(pdfPage !== pdfViewer.currentPageNumber.toString() && pdfPage !== pdfViewer.currentPageLabel) {
					// PDFViewerApplication.toolbar.setPageNumber(pdfViewer.currentPageNumber, pdfViewer.currentPageLabel);
					pdfViewer.currentPageLabel = pdfPage;
				}
			}
		}
		$('.review_standard').html(obj.checkStandard);
		$('#review_show_cont').html(obj.checkStandard);
		/*差判断条件 不是评审项时*/
		if(bigTerm.checkType != 3){
			if(obj.reason){
				temporarySave($('.supplierIskey').val(),bigTerm.checkType,obj.reason)
			}else{
				temporarySave($('.supplierIskey').val(),bigTerm.checkType)
			}
		}else{
			if(obj.reason){
				temporarySave($('.supplierScore').val(),bigTerm.checkType,obj.reason)
			}else{
				temporarySave($('.supplierScore').val(),bigTerm.checkType)
			}
		}
	}
}
function creatTBWJ(url, page){
	$("#tbwjPdf").attr('src',"about:blank");
	$("#tbwjPdf").attr('src',siteInfo.sysUrl + '/media/js/pdfjs/web/viewer.html?file='+config.FileHost + '/fileView'+url + '&page='+page+'&top=150&zoom=1');
	$("#tbwjPdf").attr('data-url',url);
	// if(tbwjObj.length == 0){
	// 	var obj_short = {'wj_url': url, 'id':'tbwjPdf_0', 'page': page};
	// 	tbwjObj.push(obj_short);
	// 	pdfPage = page;
	// 	$("#tbwjPdf_0").attr('src',"about:blank");

	// 	$("#tbwjPdf_0").attr('src','../pdfjs/web/viewer.html?file='+config.FileHost + '/fileView'+url + '&page='+pdfPage+'&top=150&zoom=1');
	// }else{
	// 	var is_open = false;//是否打开过
	// 	var open_index;
	// 	for(var i = 0; i<tbwjObj.length; i++){
	// 		if(tbwjObj[i].wj_url == url){
	// 			is_open = true;
	// 			open_index = i;
	// 		}
	// 	}
	// 	if(is_open){
	// 		$('#tbwjPdf_' + open_index).show().siblings().hide();
	// 		// if(tbwjObj[open_index].page != page){
	// 			var a = document.getElementById("tbwjPdf_" + open_index);
	// 			var pdfViewer = a.contentWindow.PDFViewerApplication.pdfViewer;

	// 			if(page !== pdfViewer.currentPageNumber.toString() && page !== pdfViewer.currentPageLabel) {
	// 				// PDFViewerApplication.toolbar.setPageNumber(pdfViewer.currentPageNumber, pdfViewer.currentPageLabel);
	// 				pdfViewer.currentPageLabel = page;
	// 			}
	// 		// }
			
	// 	}else{
	// 		var obj_short = {'wj_url': url, 'id':'tbwjPdf', 'page': page};
			
	// 		$.each($('#all_tbwj_box .review_tb_show'),function(){
	// 			$(this).hide();
	// 		})
	// 		pdfPage = page;
	// 		var new_iframe = '<iframe  width="100%" height="100%" id="tbwjPdf_'+tbwjObj.length+'" src="../pdfjs/web/viewer.html?file='+config.FileHost+'/fileView'+url +'&page='+pdfPage+'&top=150&zoom=1" class="review_tb_show"></iframe>';
	// 		tbwjObj.push(obj_short);
	// 		$(new_iframe).appendTo('#all_tbwj_box');
	// 		$(new_iframe).show();
	// 	}
	// } 
}
/******************   建立本地存储结果    *******************/
function temporarySave(val,type,reson){
	var obj = {};
	var saveTerm = $('.choose').attr('data-id');//评审项id
	var saveSupplierId = $('#bidderList .active').attr('data-bidderid');//投标人id
	$.each(saveResult, function(key,value) {
		if(key == saveSupplierId){
			/*查询本地存储中是否已有该评审项的结果*/
			var hasReview = false;
			var index = '';
			if(saveResult[key].length > 0){
				for(var i = 0;i<saveResult[key].length;i++){
					if(saveResult[key][i].checkItemId == saveTerm){
						hasReview = true;
						index = i;
					}
				}
			}
			if(type != 3){
				obj.isKey = val;
			}else{
				obj.score = val;
			}
			if(reson){
				obj.reason = reson;
			}
			obj.checkItemId = saveTerm;
			if(hasReview){
				saveResult[key][index] = obj;
			}else{
				saveResult[key].push(obj)
			}
		}
	});
};
$('#content').on('change','.supplierIskey',function(){
	temporarySave($(this).val(),bigTerm.checkType,$('.review_reason_cont').val())
})
$('#content').on('change','.supplierScore',function(){
	var standardScore = $(this).attr('data-score');
	if(Number($(this).val()) > Number(standardScore)){
		$(this).val('');
        top.layer.alert('温馨提示：得分不能超过标准分值--'+standardScore);
	}else{
		temporarySave($(this).val(),bigTerm.checkType,$('.review_reason_cont').val())
	}
})
$('#content').on('change','.review_reason_cont',function(){
	if(bigTerm.checkType != 3){
		temporarySave($('.supplierIskey').val(),bigTerm.checkType,$(this).val())
	}else{
		temporarySave($('.supplierScore').val(),bigTerm.checkType,$(this).val())
	}
})
/********         清空评审区          ********/
function emptyReview(isShow){
	if(isShow){
		if(isShow == 'block'){
			$('#tbwjPdf').css('display','none');
		}else{
			$('#tbwjPdf').css('display','block');
		}
		$('#review_show_cont').css('display',isShow);
	}
	
	$('#review_show_cont').html('');
	$('.review_standard_tit').html('');
	$('.review_standard').html('');
	$('.review_key_title').html('');
	$('.review_key_cont').html('');
	$('.review_handle_box').html('');
    $('.review_reason').html('');
    $('.file_chapter_page').css('display','none');


	
//	$('.review_key_title').html('');
}
/******************       获取招标文件       ******************/
function getBidFile(){
	$.ajax({
		type:"post",
		url:zbwjAndTbwjListUrl,
		/*beforeSend: function(xhr){	      
	       xhr.setRequestHeader("Token",token);	    
	    },*/
		async:true,
		data: {
			'examType':examType,				
			'bidSectionId': bidSectionId
		},
		success: function(data){
			if(data.success){
				pdfPage = '2';
				zbwjIsOpen = true;//打开时变量赋值
				var fileUrl=config.FileHost + "/fileRangeView" + data.data.docClarifyItem.fileUrl+'#scrollbars=0&toolbar=0&statusbar=0';
				// var zbwjView = new pdfjs_Extend('pdf_view_box',{url: fileUrl,pageNum: 900});
				// pdfjs_Extend('zbwjPdf', fileUrl, 1)
				// zbwjView = new pdfjs_Extend('zbwjPdf',{url: fileUrl,pageNum: 1});
				$("#zbwjPdf").attr('src',siteInfo.sysUrl + '/media/js/pdfjs/web/viewer.html?file='+config.FileHost + '/fileView'+data.data.docClarifyItem.fileUrl);
//				$("#zbwjPdf").attr('src',fileUrl);
				zbwjUrl = config.FileHost + '/fileView'+data.data.docClarifyItem.fileUrl;

			}else{
                top.layer.alert('温馨提示：'+data.message)
			}
		}
	});
}

$('#content').on('click','.go_left',function(){
	var ul_location = Number($("#bidderList").scrollLeft())
 	$("#bidderList").scrollLeft(ul_location-100);
})
$('#content').on('click','.go_right',function(){
	var ul_location = Number($("#bidderList").scrollLeft())
	$("#bidderList").scrollLeft(ul_location + 100);
})
$('#content').on('click','.progress_large',function(){
	var html = $('.review_reason_cont').html().replace(/\n/g,"<br>");
    top.layer.open({
		type: 1,
		title: '计算过程',
		area: ['1000px', '600px'],
		content: '<div style="padding:10px;">'+html+'</div>',
		resize: false,
		success:function(layero, index){
//			var iframeWin = layero.find('iframe')[0].contentWindow;
//			console.log(iframeWin)
			//调用子窗口方法，传参
		}
	})
}) 
$('#btn-box').on('click','#test',function(){
	top.layer.open({
		type: 2,
		title: 'pdf预览',
		area: ['100%', '100%'],
		content: 'Review/judgeCheck/model/pdftest.html?zbwjUrl='+ zbwjUrl,
		resize: false,
		success:function(layero, index){
//			var iframeWin = layero.find('iframe')[0].contentWindow;
//			console.log(iframeWin)
			//调用子窗口方法，传参
		}
	})
})
/* *****************            招投标文件预览            ******************** */






// function pdfjs_Extend(ele, _url, page){
// 	$('#' + ele + ' .the-canvas').attr('id', ele + '_canvas')
// 	var url = _url;
// 	var pdfDoc = null,
// 		pageNum = Number(page),
// 		pageRendering = false,
// 		pageNumPending = null,
// 		scale = 1.5,
// 		rotate = 0,
// 		canvas = document.getElementById(ele + '_canvas'),
// 		// canvas = $('#' + ele + '_canvas'),
// 		ctx = canvas.getContext('2d');
	
// 	/**
// 	 * Get page info from document, resize canvas accordingly, and render page.
// 	 * @param num Page number.
// 	 */
// 	$('#' + ele).on('change','.page_num',function(){
// 		queueRenderPage(Number($(this).val()))
// 	})
// 	/* $('#page_num').change(function(){
// 		renderPage(Number($(this).val()))
// 	}) */
// 	function renderPage(num) {
// 		pageRendering = true;
// 		// Using promise to fetch the page
// 		pdfDoc.getPage(num).then(function (page) {
// 			var viewport = page.getViewport(scale,rotate);
// 			canvas.height = viewport.height;
// 			canvas.width = viewport.width;
	
// 			// Render PDF page into canvas context
// 			var renderContext = {
// 				canvasContext: ctx,
// 				viewport: viewport
// 			};
// 			var renderTask = page.render(renderContext);
	
// 			// Wait for rendering to finish
// 			renderTask.promise.then(function () {
// 				pageNum = num;
// 				pageRendering = false;
// 				if (pageNumPending !== null) {
// 					// New page rendering is pending
// 					renderPage(pageNumPending);
// 					pageNumPending = null;
// 				}
// 			});
// 		});
	
// 		// Update page counters
// 		$('#' + ele + ' .page_num').val(num)
// 		// document.getElementById('page_num').textContent = num;
// 	}
	
// 	/**
// 	 * If another page rendering in progress, waits until the rendering is
// 	 * finised. Otherwise, executes rendering immediately.
// 	 */
// 	function queueRenderPage(num) {
// 		if (pageRendering) {
// 			pageNumPending = num;
// 		} else {
// 			renderPage(num);
// 		}
// 	}
	
// 	/**
// 	 * Displays previous page.
// 	 */
// 	function onPrevPage() {
// 		if (pageNum <= 1) {
// 			return;
// 		}
// 		pageNum--;
// 		queueRenderPage(pageNum);
// 	}
// 	$('#' + ele + ' .prev').on('click', onPrevPage)
// 	// document.getElementById('prev').addEventListener('click', onPrevPage);
	
// 	/**
// 	 * Displays next page.
// 	 */
// 	function onNextPage() {
// 		if (pageNum >= pdfDoc.numPages) {
// 			return;
// 		}
// 		pageNum++;
// 		queueRenderPage(pageNum);
// 	}
// 	$('#' + ele + ' .next').on('click', onNextPage)
// 	// document.getElementById('next').addEventListener('click', onNextPage);
	
// 	 //放大
// 	$('#' + ele).on('click','.enlarge', function(){
// 		scale += 0.1;
// 		queueRenderPage(pageNum);
// 	});

// 	//缩小
// 	$('#' + ele).on('click','.letting', function(){
// 		scale -= 0.1;
// 		queueRenderPage(pageNum);
// 	});
// 	//旋转
// 	$('#' + ele).on('click','.pdf_rotate', function(){
// 		rotate += 90;
// 		queueRenderPage(pageNum);
// 	});
// 	/**
// 	 * Asynchronously downloads PDF.
// 	 */
// 	PDFJS.getDocument({url:url,rangeChunkSize:64*1024,disableAutoFetch:true,endPage: 10}).then(function(pdfDoc_) {
// 		pdfDoc = pdfDoc_;
// 		$('#' + ele + ' .page_count').text(pdfDoc.numPages)
// 		// document.getElementById('page_count').textContent = pdfDoc.numPages;
	
// 		// Initial/first page rendering
// 		renderPage(pageNum);
// 	});
// }