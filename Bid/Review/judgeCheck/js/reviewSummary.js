var CheckTotalUrl=config.Reviewhost+"/ReviewControll/findCheckTotal.do";
var saveTotalUrl=config.Reviewhost+"/ReviewControll/saveTotalCheckResult.do";
var bidPriceCheckLists,bidCheckItemsLists;
var bidChecksLists = []
var reasonIndex = [];//需要输入修改原因的textarea下标
var mostCol = 0;//最多评审项
var rowspanHtml = '';
function reviewSummary(node){
    var flag = false;
    var param = {
        "method":'getSummaryData',
        "nodeType":node.nodeType
    };
    reviewFlowNode(param, function(data){
        reasonIndex = [];
        flag = true;
        loadContent('model/reviewSummary/content.html',function(){
            bidPriceCheckLists=data.bidPriceChecks;//投标人数数组
//          bidChecksLists = [];
            bidChecksLists=data.bidChecks;//评审大项
			for(var k = 0;k<data.bidChecks.length;k++){
				
				var bidCheckItems = []; 
				var treeList = data.bidChecks[k].bidCheckItems;
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
				/*var bidCheckItems = []; 
				var treeList = data.bidChecks[k].bidCheckItems;
				var treeArr = [];
				for(var i = 0;i<treeList.length;i++){
					if(!treeList[i].pid || treeList[i].pid == '0'){
						bidCheckItems.push(treeList[i]);
		//				treeList.splice(i,0)
					}else{
						treeArr.push(treeList[i])
					}
				}
				if(treeArr.length > 0){
					loopTree(treeArr);
				}
				function loopTree(primevalData){
					$.each(primevalData, function(index, item) {
                        if (primevalData.length < 1) {
                            return
                        }
						if(item){
                        var node = {
                            checkId: item.checkId,
                            id: item.id,
                            checkName: item.checkName,
                            checkStandard: (item.checkStandard ? item.checkStandard : ''),
                        };
                        if (item.isKey) {
                            node.isKey = item.isKey;
                        }
                        if (item.score) {
                            node.score = item.score;
                        }
                        if (item.expertIsKey) {
                            node.expertIsKey = item.expertIsKey;
                        }
                        if (item.expertScore != undefined) {
                            node.expertScore = item.expertScore;
                        }
                        if (item.fileChapterUrl) {
                            node.fileChapterUrl = item.fileChapterUrl;
                        }
                        if (item.fileChapterPage) {
                            node.fileChapterPage = item.fileChapterPage;
                        }
                        if (item.reason) {
                            node.reason = item.reason;
                        }
                        var isIn = false;//判断当前数据的父级是否在树结构中
                        function treeData(data, id) {
                            for (var i = 0; i < data.length; i++) {
                                if (data[i].id == id) {
                                    isIn = true
                                } else {
                                    if (data.bidCheckItems) {
                                        treeData(data.bidCheckItems, id)
                                    }
                                }
                            }
                        }

                        treeData(bidCheckItems, item.pid)
                        //若当前数据的父级是否在树结构中则 创建树结构 并删除当前数据
                        if (isIn) {
                            var pnode = item.pid && findParentNode(bidCheckItems, 'id', item.pid);
                            (pnode && (pnode.bidCheckItems || (pnode.bidCheckItems = [])) && pnode.bidCheckItems.push(node)) || bidCheckItems.push(node);
                            primevalData.splice(index, 1);
                            if (primevalData.length > 0) {
                                loopTree(primevalData)
                            }
                        }
                    }
					});
				}*/
				bidChecksLists[k].bidCheckItems = bidCheckItems;
				
			}

			/*console.log(data.bidChecks)
			var manageData = data.bidChecks;
            for(var i = 0;i<manageData.length;i++){
            	manageData[i].bidCheckItems = manageTerms(manageData[i].bidCheckItems)
            }
            
            bidChecksLists = manageData;*/
//          console.log(bidChecksLists)
            var bidCheckItemsObj = getCols(bidChecksLists);
            var bidCheckItemRow = getRows(bidCheckItemsObj.data);
//          console.log(bidCheckItemRow)
            bidChecksLists = bidCheckItemsObj.data;
            
            function eachCheck(data){
				for(var j = 0; j < data.length; j++){
					var e = data[j];
					if(e.bidChecks && e.bidChecks.length > 0){
						eachCheck(e.bidChecks);
					} else {
						e.bidChecks = [];
						var isExit = true;
						for(var i = 0; i < bidCheckItems.length; i++){
							if(e.id == bidCheckItems[i].checkId){
								e.bidChecks.push(bidCheckItems[i]);
								isExit = false;
							}
						}
						if(isExit){
							e.bidChecks = [{id:e.id, checkName:"", cols:bidCheckItemsObj.cols}];
						}
					}
					
				}
				
				return data;
				
			}
//          console.log(bidChecksLists)
            tableCheckTotal(data);
        });
	}, false);
    return flag;
}
//汇总页面渲染
function tableCheckTotal(data){
	$('#btn-box').html('');
	var list1 = '';
		
    if(data.isFinish==0&&isEnd==0  && data.isEdit == 1){
    	list1 +='<button id="savePriceCheckTotal" class="btn btn-primary btn-strong keyButton">提交</button></div>'
    }
    list1 +='<button id="relevant" class="btn btn-primary btn-strong">查看项目信息</button>';
	var list2='<table id="checkTotalTable" class="table table-bordered table-striped" style="margin-top:10px">'
		list2 += "<thead><tr>";
			list2 += "<th style='text-align:left' width='200px'>投标人名称</th>";
			list2 += "<th style='text-align:center' width='110px'>最终得分</th>";
			if(examType == 2){
                list2 += "<th style='text-align:right' width='100px'>"+(bidPriceCheckLists[0].otherBidPrice?"费率":"报价（"+bidderPriceUnit+'）'||'元）')+"</th>";
			}
			list2 += "<th style='text-align:center' width='75px'>淘汰</th>";
			list2 += "<th style='text-align:center' width='75px'>排名</th>";
			list2 += "<th style='text-align:center' width='75px'>候选人</th>";
			list2 += "<th style='text-align:center' width='200px'>修改原因</th>";
			list2 += "<th style='text-align:center' width='60px'>操作</th>";
		list2 += "</tr></thead>";
		var num=0,indexNum=0
		for(var s=0;s<bidChecksLists.length;s++){
			if(bidChecksLists[s].checkType==3){//打分项
				num++	
			}								
		};
		list2 += '<tbody>'
		for(var n=0;n<bidPriceCheckLists.length;n++){//投标人循环
			list2 += "<tr>";
			list2 += "<td style='text-align:left' width='200px'>"+ bidPriceCheckLists[n].enterpriseName +"</td>";							
			list2 += "<td style='text-align:center' width='75px'>"+getScore(bidPriceCheckLists[n].score)+"</td>";
            if(examType == 2) {
                list2 += "<td style='text-align:"+(bidPriceCheckLists[n].otherBidPrice?"left":"right")+"' width='"+(bidPriceCheckLists[n].otherBidPrice?"200":"100")+"px'><pre>" + (bidPriceCheckLists[n].otherBidPrice?bidPriceCheckLists[n].otherBidPrice:bidPriceCheckLists[n].totalCheck?bidPriceCheckLists[n].totalCheck:bidPriceCheckLists[n].bidPrice) + "</pre></td>";
            }
	    	list2 += "<td style='text-align:center' width='75px'>"+ (bidPriceCheckLists[n].isKey==1?'未淘汰':"淘汰") +"</td>";
	    	if(data.isFinish==0&&isEnd==0  && data.isEdit == 1){
	    		list2 += "<td style='text-align:center' width='75px'>"
	    		if(bidPriceCheckLists[n].isKey==1 && data.summaryType == 1){
	    			list2 +="<input style='width:60px' class='isorders orders"+ n +"' data-order='"+ bidPriceCheckLists[n].orders +"' data-index='"+n+"' type='number' value='"+ bidPriceCheckLists[n].orders +"' />"
	    		}else{
	    			list2 +='/'
	    		}				    		
	    		list2 +="</td>";
	    		if(data.summaryType == 1){
	    			if(bidPriceCheckLists[n].orders<4 ){
		    			list2 += "<td style='text-align:center' width='75px'><input type='checkbox' data-choose='"+bidPriceCheckLists[n].isKey+"' data-index='"+n+"' class='isCandidate isChoose"+ n +"' "+(bidPriceCheckLists[n].isKey==0?'disabled=""':'checked=""')+"/></td>";
		    			list2 += "<td style='text-align:center' width='100px'><textarea rows='2' class='isReason"+ n +"' style='padding:5px;resize:none;width:100%;'></textarea></td>";
			    	}else{
			    		list2 += "<td style='text-align:center' width='75px'><input type='checkbox' data-choose='0' data-index='"+n+"' class='isCandidate isChoose"+ n +"' "+(bidPriceCheckLists[n].isKey==0?'disabled=""':'')+"/></td>";
		    			list2 += "<td style='text-align:center' width='100px'><textarea rows='2' class='isReason"+ n +"' style='padding:5px;resize:none;width:100%;'></textarea></td>";
			    	}
	    		}else if(data.summaryType == 3){
	    			list2 += "<td style='text-align:center' width='75px'>/</td>";
	    			list2 += "<td style='text-align:center' width='100px'>/</td>";
	    		}
	    	}else if(data.isFinish==1){
	    		list2 += "<td style='text-align:center' width='75px'>"+ (bidPriceCheckLists[n].orders||"/")+"</td>";
	    		list2 += "<td style='text-align:center' width='75px'>"+ (bidPriceCheckLists[n].isChoose==0?"否":"是") +"</td>";
	    		list2 += "<td style='text-align:center' width='200px'>"+(bidPriceCheckLists[n].reason?bidPriceCheckLists[n].reason:'/')+"</td>";
	    	}
	    	list2 += '<td style="text-align:center" width="60px">'
	    	list2 += '<button type="button" class="btn btn-sm btn-primary btn_view_open " data-index="'+n+'"><span class="glyphicon glyphicon-chevron-down"></span></button>';
	    	list2 += '<button type="button" class="btn btn-sm btn-primary btn_view_close" data-index="'+n+'" style="display:none;"><span class="glyphicon glyphicon-chevron-up"></span></button>';
    		list2 += "</td></tr>";
    		
		}	
		list2 +='</tbody></table>';
	
	$('#reviewSummaryWarp').html(list2);
	setButton(list1);

	//修改排名
	$(".isorders").on('change',function(){
		var reg = /^[1-9]\d*$/;
		if($(this).val()!=""){
			if(!(reg.test($(this).val()))){
				top.layer.alert('温馨提示：排名只能为正整数');
				$(this).val("")
			}
		}
		var index = $(this).attr('data-index');
		changeReason($(this),$(this).val(),$('.isChoose'+index),$('.isChoose'+index).prop('checked'));
	});
	//修改默认的是否候选人
	$('.isCandidate').on('change',function(){
		var index  = $(this).attr('data-index');
		changeReason($('.orders'+index),$('.orders'+index).val(),$(this),$(this).val());
	});
}

/**
 * 分数显示效果
 * @param scor
 * @returns {*}
 */
function getScore(scor){
	if(scor){
		return scor
	}else if(scor == 0){
		return '0'
	}else{
		return '/'
	}
};

/*changeReason  判断是否输入原因
 * ele1  修改排名的元素
 * val1  修改后的排名值
 * ele2  修改的是否候选人的元素
 * val2  修改的是否候选人值
 * */
function changeReason(ele1,val1,ele2,val2){
	var candidate = '';
	var index  = ele2.attr('data-index');
	if(ele2.prop('checked')){
		candidate = 1;
	}else{
		candidate = 0;
	}
	if(ele1.val() != ele1.attr('data-order') || ele2.attr('data-choose') != candidate){
		if($.inArray(index,reasonIndex) == -1){
			reasonIndex.push(index)
		}
	}else{
		if($.inArray(index,reasonIndex) != -1){
			reasonIndex.splice($.inArray(index,reasonIndex),1);
		}
	}
}
/************************************   汇总详情         ***********************************************/
/*
 * 处理不固定级数的评审项思路：
 * 先处理数据，将每条数据要合并的行与列计算出来放入json数据中
 * 循环数据
 * 当i=0时，先看其在父级中是否为第一项，是则当前td不要，否则创建td， 判断其下子项，当有子项时多创建一个td
 * 当i!=0时，创建td，判断其下子项，当有子项时多创建一个td
 * 其中大量运用递归
 * */



function linkTable(index){
	var experts = getExperts();
	for(var s=0;s<bidChecksLists.length;s++){
		var bidChecksData = {
			maxLevel:0,
			levelData:{},
			minData:[]
		};
		eachChildren(bidChecksLists[s].bidCheckItems,0,bidChecksData)
//		console.log(mostCol)
	};
	var list='<table class="table table-bordered table-striped">'
	list += "<tr>";
//					list += "<td style='text-align:left' width='200px'>投标人名称</td>";
	list += "<td style='text-align:center' width='120px'>评标项</td>";
	list += "<td style='text-align:center' colspan='"+mostCol+"' width='400px'>评标内容</td>";
	for(var i = 0; i < experts.length; i++) {
		list += "<td style='text-align:center' width='100px'>得分" + (i + 1) + "</br>(" + experts[i].expertName + ")</td>";
	}			
	list += "<td style='text-align:center' width='110px'>评审结果</td>";
	list += "</tr>";
	for(var s=0;s<bidChecksLists.length;s++){	//评审大项循环				
		list += "<tr>";		
		/****** 计算最多评审项 *****/
		var itemMost = '';
		var bidChecksData = {
			maxLevel:0,
			levelData:{},
			minData:[]
		};
		itemMost = eachChildren(bidChecksLists[s].bidCheckItems,0,bidChecksData)
		list += "<td style='text-align:left' class='1111' width='200px' rowspan='"+ (bidChecksLists[s].checkType==3?bidChecksData.minData.length+1:bidChecksData.minData.length) +"'>"+bidChecksLists[s].checkName+"</td>";						
		var firstData = bidChecksData.levelData[1];
		var hasIndex = '';
		var childNum = 0;
//		console.log(firstData)
		for(var z=0;z<firstData.length;z++){//循环具体评审项
			if(z==0){
				var col = mostCol;
				if(firstData[z].bidCheckItems && firstData[z].bidCheckItems.length > 0){
					list += "<td style='text-align:left' class='2222' colspan='"+firstData[z].cols+"' rowspan='"+firstData[z].rows+"' width='200px'>"+firstData[z].checkName+"</td>";
					for(var g = 0;g<firstData[z].bidCheckItems.length;g++){
						var dataList = firstData[z].bidCheckItems[g];
						function creatFirstTr(data){
							if(data.bidCheckItems && data.bidCheckItems.length > 0){
								for(var t = 0;t<data.bidCheckItems.length;t++){
									if(t == 0){
										list += "<td style='text-align:left' class='999' colspan='"+data.cols+"' rowspan='"+data.rows+"' width='200px'>"+data.checkName+"</td>";
										creatFirstTr(data.bidCheckItems[0])
									}else{
										creaTermTr(data.bidCheckItems[t],t)
									}
								}
							}else{
								firstColsId = data.id;
								list += "<td style='text-align:left' class='2222' colspan='"+data.cols+"' rowspan='"+data.rows+"' width='200px'>"+data.checkName+"</td>";
								for(var i = 0; i < experts.length; i++) {//循环评委
						       		for(var bs=0;bs<bidPriceCheckLists[index].expertCheckItems.length;bs++){	//	评审大项结果				       			
						       			if(bidPriceCheckLists[index].expertCheckItems[bs].checkItemId==firstColsId){
						       				if(experts[i].expertId==bidPriceCheckLists[index].expertCheckItems[bs].expertId){
						       					var scors=getScore(bidPriceCheckLists[index].expertCheckItems[bs].score);
						       					if(bidChecksLists[s].checkType==3){					       						
							       				    list += "<td style='text-align:center' width='100px'>"+(scors?scors:'/')+"</td>";
							       				}else{
							       					var isk=bidPriceCheckLists[index].expertCheckItems[bs].isKey;
							       					if(isk == undefined ||isk===""){
							       						list += "<td style='text-align:center' width='100px'>/</td>";
							       					}else{
							       						if(bidChecksLists[s].checkType==0){
									       					list += "<td style='text-align:center' width='100px'>"+(isk==1?'合格':"不合格")+"</td>";
									       				}else if(bidChecksLists[s].checkType==1){
									       				
									       					list += "<td style='text-align:center' width='100px'>"+(isk==1?'未偏离':"偏离")+"</td>";
									       				}else if(bidChecksLists[s].checkType==2){								       					
									       					list += "<td style='text-align:center' width='100px'>"+(isk==1?'响应':"不响应")+"</td>";
									       				}
							       					}
							       					
							       				} 
						       				}						       				
						       			}
						       		}						       											
								}
					       		var checkLastResults = '';
					       		for(var x = 0;x<bidPriceCheckLists[index].checkLastResults.length;x++){
						   			if(bidPriceCheckLists[index].checkLastResults[x].checkId == bidChecksLists[s].id){
						   				checkLastResults = bidPriceCheckLists[index].checkLastResults[x];
									}
						       	}
					       		if(checkLastResults){
					       			if(bidChecksLists[s].checkType==3){
							       			var checkScor = getScore(checkLastResults.score);
						   				    list += "<td style='text-align:center' width='75px' rowspan='"+ (bidChecksLists[s].checkType==3?bidChecksData.minData.length+1:bidChecksData.minData.length) +"'>"+(checkScor?checkScor:'/')+"</td>";
						   				}else{
						   					var isk=checkLastResults.isKey;
						   					if(isk===undefined||isk===""){
						   						list += "<td style='text-align:center' width='75px' rowspan='"+ (bidChecksLists[s].checkType==3?bidChecksData.minData.length+1:bidChecksData.minData.length) +"'>/</td>";
						   					}else{
						   						if(bidChecksLists[s].checkType==0){
							       					list += "<td style='text-align:center' width='75px' rowspan='"+ (bidChecksLists[s].checkType==3?bidChecksData.minData.length+1:bidChecksData.minData.length) +"'>"+(isk==1?'合格':"不合格")+"</td>";
							       				}else if(bidChecksLists[s].checkType==1){
							       				
							       					list += "<td style='text-align:center' width='75px' rowspan='"+ (bidChecksLists[s].checkType==3?bidChecksData.minData.length+1:bidChecksData.minData.length) +"'>"+(isk==1?'未偏离':"偏离")+"</td>";
							       				}else if(bidChecksLists[s].checkType==2){								       					
							       					list += "<td style='text-align:center' width='75px' rowspan='"+ (bidChecksLists[s].checkType==3?bidChecksData.minData.length+1:bidChecksData.minData.length) +"'>"+(isk==1?'响应':"不响应")+"</td>";
							       				}
						   					}
						   					
						   				}
					       		}else{
					       			list += "<td style='text-align:center' width='75px' rowspan='"+ (bidChecksLists[s].checkType==3?bidChecksData.minData.length+1:bidChecksData.minData.length) +"'>/</td>";
					       		}
							    if(s==0){
							    	list += "</tr>";	
								};
							}
						}
						if(g == 0){
//							console.log(dataList)
							var firstColsId = '';
							creatFirstTr(dataList)
							/*function creatFirstTr(data){
								if(data.bidCheckItems && data.bidCheckItems.length > 0){
									list += "<td style='text-align:left' class='999' colspan='"+data.cols+"' rowspan='"+data.rows+"' width='200px'>"+data.checkName+"</td>";
									creatFirstTr(data.bidCheckItems[0])
								}else{
									firstColsId = data.id;
									list += "<td style='text-align:left' class='2222' colspan='"+data.cols+"' rowspan='"+data.rows+"' width='200px'>"+data.checkName+"</td>";
								}
							};
							creatFirstTr(dataList);*/
							
						}else{
							creaTermTr(dataList,g)
						}
					}
				}else{
	        		list += "<td style='text-align:left' class='2222' colspan='"+firstData[z].cols+"' rowspan='"+firstData[z].rows+"' width='200px'>"+firstData[z].checkName+"</td>";
		       		for(var i = 0; i < experts.length; i++) {//循环评委
			       		for(var bs=0;bs<bidPriceCheckLists[index].expertCheckItems.length;bs++){	//	评审大项结果				       			
			       			if(bidPriceCheckLists[index].expertCheckItems[bs].checkItemId==firstData[z].id){
			       				if(experts[i].expertId==bidPriceCheckLists[index].expertCheckItems[bs].expertId){
			       					var scors=getScore(bidPriceCheckLists[index].expertCheckItems[bs].score);
			       					if(bidChecksLists[s].checkType==3){					       						
				       				    list += "<td style='text-align:center' width='100px'>"+(scors?scors:'/')+"</td>";
				       				}else{
				       					var isk=bidPriceCheckLists[index].expertCheckItems[bs].isKey;
				       					if(isk == undefined ||isk===""){
				       						list += "<td style='text-align:center' width='100px'>/</td>";
				       					}else{
				       						if(bidChecksLists[s].checkType==0){
						       					list += "<td style='text-align:center' width='100px'>"+(isk==1?'合格':"不合格")+"</td>";
						       				}else if(bidChecksLists[s].checkType==1){
						       				
						       					list += "<td style='text-align:center' width='100px'>"+(isk==1?'未偏离':"偏离")+"</td>";
						       				}else if(bidChecksLists[s].checkType==2){								       					
						       					list += "<td style='text-align:center' width='100px'>"+(isk==1?'响应':"不响应")+"</td>";
						       				}
				       					}
				       					
				       				} 
			       				}						       				
			       			}
			       		}						       											
					}
		       		var checkLastResults = '';
		       		for(var x = 0;x<bidPriceCheckLists[index].checkLastResults.length;x++){
			   			if(bidPriceCheckLists[index].checkLastResults[x].checkId == bidChecksLists[s].id){
			   				checkLastResults = bidPriceCheckLists[index].checkLastResults[x];
						}
			       	}
		       		if(checkLastResults){
		       			if(bidChecksLists[s].checkType==3){
				       			var checkScor = getScore(checkLastResults.score);
			   				    list += "<td style='text-align:center' width='75px' rowspan='"+ (bidChecksLists[s].checkType==3?bidChecksData.minData.length+1:bidChecksData.minData.length) +"'>"+(checkScor?checkScor:'/')+"</td>";
			   				}else{
			   					var isk=checkLastResults.isKey;
			   					if(isk===undefined||isk===""){
			   						list += "<td style='text-align:center' width='75px' rowspan='"+ (bidChecksLists[s].checkType==3?bidChecksData.minData.length+1:bidChecksData.minData.length) +"'>/</td>";
			   					}else{
			   						if(bidChecksLists[s].checkType==0){
				       					list += "<td style='text-align:center' width='75px' rowspan='"+ (bidChecksLists[s].checkType==3?bidChecksData.minData.length+1:bidChecksData.minData.length) +"'>"+(isk==1?'合格':"不合格")+"</td>";
				       				}else if(bidChecksLists[s].checkType==1){
				       				
				       					list += "<td style='text-align:center' width='75px' rowspan='"+ (bidChecksLists[s].checkType==3?bidChecksData.minData.length+1:bidChecksData.minData.length) +"'>"+(isk==1?'未偏离':"偏离")+"</td>";
				       				}else if(bidChecksLists[s].checkType==2){								       					
				       					list += "<td style='text-align:center' width='75px' rowspan='"+ (bidChecksLists[s].checkType==3?bidChecksData.minData.length+1:bidChecksData.minData.length) +"'>"+(isk==1?'响应':"不响应")+"</td>";
				       				}
			   					}
			   					
			   				}
		       		}else{
		       			list += "<td style='text-align:center' width='75px' rowspan='"+ (bidChecksLists[s].checkType==3?bidChecksData.minData.length+1:bidChecksData.minData.length) +"'>/</td>";
		       		}
				    if(s==0){
				    	list += "</tr>";	
					};
				}
            }else{
          		creaTermTr(firstData[z],z)
           	}                      	
	       	if(bidChecksLists[s].checkType==3){//打分项
	       		if(z==firstData.length-1){
		       		list += "<tr>";	
                	list += "<td style='text-align:left' width='200px' colspan='"+mostCol+"'>总分</td>";
			       	for(var i = 0; i < experts.length; i++) {
			       		if(bidPriceCheckLists[index].expertChecks!=undefined&&bidPriceCheckLists[index].expertChecks.length>0){
			       			for(var bs=0;bs<bidPriceCheckLists[index].expertChecks.length;bs++){
				       			if(experts[i].expertId==bidPriceCheckLists[index].expertChecks[bs].expertId&&bidPriceCheckLists[index].expertChecks[bs].checkId==bidChecksLists[s].id){
				       				list += "<td style='text-align:center' width='100px'>"+getScore(bidPriceCheckLists[index].expertChecks[bs].score)+"</td>";
				       			}
				       		}
			       		}else{
			       			list += "<td style='text-align:center' width='100px'>/</td>";
			       		}								       		
					}
			       	list += "</tr>";
		       	}
       		}
	       	function creaTermTr(data,indexs){
      			if(indexs != 0){
          			if(data.bidCheckItems && data.bidCheckItems.length > 0){
          				list += "<tr>";
						list += "<td style='text-align:left' class='"+indexs+"_0' colspan='"+data.cols+"' rowspan='"+data.rows+"' width='200px'>"+data.checkName+"</td>";
						for(var x = 0; x < data.bidCheckItems.length;x++){
          					if(x == 0){
          						if(data.bidCheckItems[x].bidCheckItems && data.bidCheckItems[x].bidCheckItems.length > 0){
          							list += "<td style='text-align:left' class='"+indexs+"_1' colspan='"+data.bidCheckItems[x].cols+"' rowspan='"+data.bidCheckItems[x].rows+"' width='200px'>"+data.bidCheckItems[x].checkName+"</td>";
          							for(var p = 0; p < data.bidCheckItems[x].bidCheckItems.length;p++){
          								creaTermTr(data.bidCheckItems[x].bidCheckItems[p],p)
          							}
          						}else{
	          						list += "<td style='text-align:left' class='"+indexs+"_1' colspan='"+data.bidCheckItems[x].cols+"' rowspan='"+data.bidCheckItems[x].rows+"' width='200px'>"+data.bidCheckItems[x].checkName+"</td>";
							       	for(var i = 0; i < experts.length; i++) {
							       		for(var bs=0;bs<bidPriceCheckLists[index].expertCheckItems.length;bs++){						       			
							       			if(bidPriceCheckLists[index].expertCheckItems[bs].checkItemId==data.bidCheckItems[x].id){
							       				if(experts[i].expertId==bidPriceCheckLists[index].expertCheckItems[bs].expertId){
							       					var scors=getScore(bidPriceCheckLists[index].expertCheckItems[bs].score);
							       					
							       					if(bidChecksLists[s].checkType==3){		       						
								       				    list += "<td style='text-align:center' width='100px'>"+(scors?scors:'/')+"</td>";
								       				}else{
								       					var isk=bidPriceCheckLists[index].expertCheckItems[bs].isKey;
								       					if(isk===undefined||isk===""){
								       						list += "<td style='text-align:center' width='100px'>/</td>";
								       					}else{
								       						if(bidChecksLists[s].checkType==0){
										       					list += "<td style='text-align:center' width='100px'>"+(isk==1?'合格':"不合格")+"</td>";
										       				}else if(bidChecksLists[s].checkType==1){
										       				
										       					list += "<td style='text-align:center' width='100px'>"+(isk==1?'未偏离':"偏离")+"</td>";
										       				}else if(bidChecksLists[s].checkType==2){								       					
										       					list += "<td style='text-align:center' width='100px'>"+(isk==1?'响应':"不响应")+"</td>";
										       				}
								       					}
								       					
								       				} 
							       				}						       				
							       			}
							       		}						       											
									}	
								}
								list += "</tr>";
          					}else{
          						creaTermTr(data.bidCheckItems[x],x)
          					}
          				}
          			}else{
          				list += "<tr>";
						list += "<td style='text-align:left' class='444' colspan='"+data.cols+"' rowspan='"+data.rows+"' width='200px'>"+data.checkName+"</td>";
				       	for(var i = 0; i < experts.length; i++) {
				       		for(var bs=0;bs<bidPriceCheckLists[index].expertCheckItems.length;bs++){						       			
				       			if(bidPriceCheckLists[index].expertCheckItems[bs].checkItemId==data.id){
				       				if(experts[i].expertId==bidPriceCheckLists[index].expertCheckItems[bs].expertId){
				       					var scors=getScore(bidPriceCheckLists[index].expertCheckItems[bs].score);
				       					
				       					if(bidChecksLists[s].checkType==3){		       						
					       				    list += "<td style='text-align:center' width='100px'>"+(scors?scors:'/')+"</td>";
					       				}else{
					       					var isk=bidPriceCheckLists[index].expertCheckItems[bs].isKey;
					       					if(isk===undefined||isk===""){
					       						list += "<td style='text-align:center' width='100px'>/</td>";
					       					}else{
					       						if(bidChecksLists[s].checkType==0){
							       					list += "<td style='text-align:center' width='100px'>"+(isk==1?'合格':"不合格")+"</td>";
							       				}else if(bidChecksLists[s].checkType==1){
							       				
							       					list += "<td style='text-align:center' width='100px'>"+(isk==1?'未偏离':"偏离")+"</td>";
							       				}else if(bidChecksLists[s].checkType==2){								       					
							       					list += "<td style='text-align:center' width='100px'>"+(isk==1?'响应':"不响应")+"</td>";
							       				}
					       					}
					       					
					       				} 
				       				}						       				
				       			}
				       		}						       											
						}					       				
				       	list += "</tr>";
          			}
      			}
      		}
		}	
		if((firstData.length==1||!firstData)&&s!=0){
			list += "</tr>";
		}	
		
	}
	list += '</table>'
	$('.linkBox'+index).html(list);
};
$('#content').on('input','textarea',function(e){
	$(e.target).css('height', 'auto').css('height', this.scrollHeight + 'px');
});
function canSubmitCheck(callback) {
    var actionUrl = config.Reviewhost + '/RaterAskListController/checkNotAnswerAsk';
    var canSubmit = true;
    $.ajax({
        url: actionUrl,
        data: {
            packageId: bidSectionId,
            examType: examType
        },
        async: false,
        type: 'post',
        success: function(res) {
            if(res.success) {
                canSubmit = !!res.data;
            }
        }
    });
    if (!canSubmit) {
        parent.layer.confirm('存在未答复的问题，是否确认汇总？确认后供应商无法再答复！', {
            icon: 3,
            title: '询问',
            btn: ['确认', '取消'] //可以无限个按钮
        }, function (index) {
            parent.layer.close(index);
            callback && callback();
        }, function(index) {
            parent.layer.close(index);
        })
    } else {
        callback && callback();
    }
}
//提交审核
$("#btn-box").on('click','#savePriceCheckTotal', function(){

    if(reasonIndex.length>0){
        for(var e = 0;e<reasonIndex.length;e++){
            if($.trim($('.isReason'+reasonIndex[e]).val()) == ''){
                top.layer.alert('温馨提示：请输入修改原因',function(ind){
                    top.layer.close(ind);
                    $('.isReason'+reasonIndex[e]).focus();
                })
                return
            }
        }
    }
    var checkLastResults = [];

    for(var i=0;i<bidPriceCheckLists.length;i++){
        if(bidPriceCheckLists[i].isKey==1){
            if($(".orders"+i).val()==""){
                top.layer.alert('温馨提示：排名不能为空');
                return;
            }
        };
        var isChoose;
        if($(".isChoose"+i).is(':checked')==true){
            isChoose=1;
        }else{
            isChoose=0;
        }
        checkLastResults.push({
            supplierId:bidPriceCheckLists[i].supplierId,
            isKey:bidPriceCheckLists[i].isKey,
            score:bidPriceCheckLists[i].score,
            orders:$(".orders"+i).val(),
            reason:$(".isReason"+i).val(),
            isChoose:isChoose
		});
    };
    var param = {
        "method":'saveSummaryData',
        "nodeType":currNode.nodeType,
		"checkLastResults":checkLastResults
    };
	canSubmitCheck(function() {
    //IE下停止刷新列表防止PDF遮住弹出层，无法下一步操作
    isStopTab = true;
    reviewFlowNode(param, function(data){
        top.layer.alert('温馨提示：提交成功',function(ind){
            isStopTab = false;
            currFunction();
            top.layer.close(ind)
        });
	});
    isStopTab = false;
	})
});

//汇总详情展开
$('#content').on('click','.btn_view_open',function(){
    $(this).closest('td').find('.btn_view_close').show();
    if($(this).closest('tr').next().hasClass('son')){
        $(this).closest('tr').next().remove();
    }
    var index = $(this).attr('data-index');
    var colspan = 7;
    if(examType == 2){
        colspan = 8;
	}
    var newTr = '<tr class="son"><td colspan="'+colspan+'"><div class="linkBox'+index+'"></div></td></tr>';
    $(this).closest('tr').after(newTr);
    linkTable(index);
    $(this).hide();
});

//汇总详情收起
$('#content').on('click','.btn_view_close',function(){
    $(this).closest('td').find('.btn_view_open').show();
    if($(this).closest('tr').next().hasClass('son')){
        $(this).closest('tr').next().remove();
    }
    $(this).hide();
})
/**********       处理json数据为树形结构       **********/
function manageTerms(data){
	var bidCheckItems = []; 
	$.each(data, function(index, item) {
		var node = {
//			checkId: item.checkId,
			id: item.id,
			checkName: item.checkName,
			checkStandard: item.checkStandard,
		};
		if(item.isKey){
			node.isKey = item.isKey;
		}
		if(item.score){
			node.score = item.score;
		}
		if(item.expertIsKey){
			node.expertIsKey = item.expertIsKey;
		}
		if(item.expertScore){
			node.expertScore = item.expertScore;
		}
		if(item.fileChapterUrl){
			node.fileChapterUrl = item.fileChapterUrl;
		}
		var pnode = item.pid && findParentNode(bidCheckItems, 'id', item.pid);
		(pnode && (pnode.bidCheckItems || (pnode.bidCheckItems = [])) && pnode.bidCheckItems.push(node)) || bidCheckItems.push(node);
	});
	return bidCheckItems 
}
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
/************       处理数据         ***********/
function eachChildren(bidChecks, level, bidChecksData){
	var col = 0;
	var row = 0;
	if(bidChecks && bidChecks.length>0){
		level = level== undefined  ? 1:level+1;
		if(bidChecksData.maxLevel < level){
			bidChecksData.maxLevel = level;
		}
		if(mostCol < level){
			mostCol = level;
		}
		for(var i=0; i< bidChecks.length; i++){
			bidChecks[i].level = level;
			bidChecks[i].col = eachChildren(bidChecks[i].bidCheckItems, bidChecks[i].level, bidChecksData);
			
			if(!bidChecksData.levelData[bidChecks[i].level]){
				bidChecksData.levelData[bidChecks[i].level]=[];
			}
			bidChecksData.levelData[bidChecks[i].level].push(bidChecks[i]);
			
			if(!bidChecks[i].bidCheckItems || bidChecks[i].bidCheckItems.length ==0){
				bidChecksData.minData.push(bidChecks[i]);
				bidChecks[i].row = bidChecks[i].level;
				bidChecks[i].colspan = mostCol - bidChecks[i].level + 1;
			}else{
				bidChecks[i].row = 0;
				bidChecks[i].colspan = 1;
			}
			if(bidChecks[i].col == 0){
				bidChecks[i].col = 1
				
			}
			col += bidChecks[i].col; 
		}
	}
	return col;
}
/**
 * 获取树的每一级别所占的列数
*/
function getCols(treeData) {
    var floor = 0;
    var max = 0;
    function each (data, floor) {
        for(var j = 0; j < data.length; j++){
        	var e = data[j];
            e.floor = floor
            if (floor > max) {
                max = floor
            }
            if (e.bidChecks && e.bidChecks.length > 0) {
                each(e.bidChecks, floor + 1)
            }
            if(e.bidCheckItems && e.bidCheckItems.length > 0){
            	if(e.bidCheckItems[0].checkName && e.bidCheckItems[0].checkName != ""){
            		each(e.bidCheckItems, floor + 1);
            	} else {
            		
            		e.checkStandard = "";
            		
            		for(var i = 0; i < e.bidCheckItems.length; i++){
            			e.checkStandard += e.bidCheckItems[i].checkStandard;

						if(e.bidCheckItems[i].rangeMin || e.bidCheckItems[i].rangeMin == 0){
							e.checkStandard += " (" + e.bidCheckItems[i].rangeMin + " - " + e.bidCheckItems[i].rangeMax + "分)";
						} else {
							e.checkStandard += e.bidCheckItems[i].rangeMax || e.bidCheckItems[i].rangeMax == 0 ? " (" + e.bidCheckItems[i].rangeMax + "分)" : "";
						}
						e.checkStandard += "<br/>";
            		}
            		e.bidCheckItems = [];
            	}
            }
        }
    }
    each(treeData,1);
    
    function setCols (data) {
       for(var j = 0; j < data.length; j++){
        	var e = data[j];
            e.cols = 1;
            if (e.bidChecks && e.bidChecks.length > 0) {
                setCols(e.bidChecks);
            } else if (e.bidCheckItems && e.bidCheckItems.length > 0) {
                setCols(e.bidCheckItems);
            } else {
            	e.cols = max + 1 - e.floor;
            }
        }
    }
    setCols(treeData);

    return {data:treeData, cols:max};
}
function getRows(data){
	var rowAll = 0, colAll = 0;
	for(var i = 0; i < data.length; i++){
		var rows = 0;
		var cols = 0;
		if(data[i].bidChecks && data[i].bidChecks.length > 0){
			rows += getRows(data[i].bidChecks).rows;
		} else if(data[i].bidCheckItems && data[i].bidCheckItems.length > 0){
			rows += getRows(data[i].bidCheckItems).rows;
		} else {
			rows += 1;
		}
		data[i].rows = rows;
		rowAll += rows;
	}
	
	return {rows:rowAll, data:data};
}