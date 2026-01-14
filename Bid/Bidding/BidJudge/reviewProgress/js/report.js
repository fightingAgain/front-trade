/**
 * 2019-04-18 by hwf
 */
var findBidCheckScoresUrl = config.tenderHost +  "/BidCheckReportController/findBidCheckScores.do";
var buildCheckReportUrl = config.tenderHost + "/BidCheckReportController/buildCheckReport.do";

var packageId = "",
	examType = "";

var suppliersList;
var expertMembers; 
var bidCheckItemDtos;
var bidCheckItems;

var dtosData = {};

var parentFun;
$(function(){
	if(getUrlParam("packageId") && getUrlParam("packageId") != "undefined"){
		packageId =  getUrlParam("packageId");
	};
	if(getUrlParam("examType") && getUrlParam("examType") != "undefined"){
		examType =  getUrlParam("examType");
	};
	
	findBidCheckScores();
	
	$("#btnClose").click(function(){
		var index = parent.layer.getFrameIndex(window.name); 
		parent.layer.close(index); 
	})
	
	$(".btnRecordSubmit").click(function(){
		buildCheckReport();
	});
});

//提交
function buildCheckReport(){
	var supplierInfo = [];
	var item = {};
	var bidderNum = 0;
	for(var i = 0; i < suppliersList.length; i++){
		item = {};

		if($("#reviewRecord tr[data-id='"+suppliersList[i].supplierId+"']").find('.isBidder').is(':checked')){
			item.winCandidateOrder = 1;
			bidderNum ++;
			
			item.bidSectionId = packageId;
			item.examType = examType;
			item.winCandidateId = suppliersList[i].supplierId;
			item.winCandidateName = suppliersList[i].supplierName;
			item.priceFormCode = suppliersList[i].priceFormCode;
			item.priceCurrency = suppliersList[i].priceCurrency;
			item.priceUnit = suppliersList[i].priceUnit;
			item.score = suppliersList[i].score;
			item.bidPrice = suppliersList[i].bidPrice;
			var sort = $("#reviewRecord tr[data-id='"+suppliersList[i].supplierId+"']").find(".sort").val();
			item.winCandidateOrder = sort.replace(/,/g,'') != "" ? sort : (i+1);
			
			supplierInfo.push(item);
		}
		
	}

	if(bidderNum == 0){
		parent.layer.alert("请选择候选人");
		return;
	}
	$.ajax({
		url: buildCheckReportUrl,
     	type: "post",
     	data:{
     		bidSectionId: packageId,
			examType: examType,
     		bidWinCandidates: supplierInfo
     	},
     	success: function (data) {
         	if(data.success == false){
        		parent.layer.alert(data.message);
        		return;
        	}
         	parent.layer.alert(data.message);
         	var index = parent.layer.getFrameIndex(window.name); 
			parent.layer.close(index); 
			parentFun();
     	},
     	error: function (data) {
         	parent.layer.alert("加载失败");
     	}
	});
}

//父页面调用的方法
function passMessage(callback){
	parentFun = callback;
}

//查询汇总
function findBidCheckScores(){
	$.ajax({
		url: findBidCheckScoresUrl,
     	type: "post",
     	data:{
     		bidSectionId:packageId,
     		examType:examType
     	},
     	success: function (data) {
         	if(data.success == false){
        		parent.layer.alert(data.message);
        		return;
        	}
         	var arr = data.data;
         	reviewFormat(arr);
         
     	},
     	error: function (data) {
         	parent.layer.alert("加载失败");
     	}
	});
}
	

function  reviewFormat(data){
	$("#reviewRecord tr").remove();
	
	suppliersList = data.suppliersList;
	expertMembers = data.expertMembers;
	bidCheckFirst = data.bidChecks;
//	bidCheckItemDtos = data.bidCheckItemDtos;
	allExpertCheckAndItem = data.allExpertCheckAndItem;
	bidCheckItems = data.bidCheckItems;
	


	bidCheckItems = getJsonTree(data.bidCheckItems, 0); 
	var bidCheckItemsObj = getCols(bidCheckItems);
	bidCheckItems = bidCheckItemsObj.data;

	
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
	
	var bidChecksColObj = getCols(data.bidChecks);
	var bidChecks = eachCheck(bidChecksColObj.data);

	var bidChecksObj = getRows(bidChecks);
	bidChecks = bidChecksObj.data;
	

	
	var html = '<tr>'
				+'<th rowspan="2">供应商</th>'
				+'<th rowspan="2" colspan="'+bidChecksColObj.cols+'">评审项</th>'
				+'<th rowspan="2" colspan="'+bidCheckItemsObj.cols+'">评审内容</th>'
				+'<th rowspan="2">评审标准</th>'
				+'<th colspan="'+(expertMembers.length) * 2+'" style="text-align:center">评委</th>'
//				+'<th rowspan="2" style="width:100px;">评审结果</th>'
				+'<th rowspan="2">淘汰</th>'
				+'<th rowspan="2" style="width:80px;text-align:center">总分</th>'
				+'<th rowspan="2" style="width:50px;text-align:center">排名</th>'
				+'<th rowspan="2" style="width:50px;text-align:center">候选人</th>'
				+'</tr><tr>';
	for(var i = 0; i < expertMembers.length; i++){
		html += '<td style="text-align:center; width:100px;" colspan="2">'+expertMembers[i].expertName+'</td>';
	}
	html += '</tr>'
	for(var i = 0; i < suppliersList.length; i++){
		suppliersList[i].rows = bidChecksObj.rows;
		suppliersList[i].cols = 1;
//		suppliersList[i].bidChecks = bidChecks;
		html += '<tr data-id="'+suppliersList[i].supplierId+'">';
		html += '<td rowspan="'+suppliersList[i].rows+'" colspan="'+suppliersList[i].cols+'">'+suppliersList[i].supplierName+'</td>';
		if(bidChecks && bidChecks.length > 0){
			html += formatHtml(bidChecks, suppliersList[i].supplierId);
		}
		html += '</tr>'
	}
	
	$(html).appendTo("#reviewRecord");
	var str = "", isKey="";
	for(var i = 0; i < suppliersList.length; i++){
		str = "";
		if(suppliersList[i].isKey && suppliersList[i].isKey == 0){
			str += '<td rowspan="'+suppliersList[i].rows+'" style="word-break:normal">'+(suppliersList[i].reason ? suppliersList[i].reason : "/")+'</td>'
			+'<td rowspan="'+suppliersList[i].rows+'" style="text-align:center;">'+(suppliersList[i].score ? suppliersList[i].score : "/")+'</td>'
			+'<td rowspan="'+suppliersList[i].rows+'" style="text-align:center;">'+(i+1)+'</td>'
			+'<td rowspan="'+suppliersList[i].rows+'" style="text-align:center;">/</td>';
		} else {
			str += '<td rowspan="'+suppliersList[i].rows+'" style="word-break:normal">否</td>'
			+'<td rowspan="'+suppliersList[i].rows+'" style="text-align:center;">'+(suppliersList[i].score || suppliersList[i].score==0 ? suppliersList[i].score : "/")+'</td>'
			+'<td rowspan="'+suppliersList[i].rows+'" style="text-align:center;"><input type="text" class="sort" style="width:50px;" class="form-control" value="'+(i+1)+'"></td>'
			+'<td rowspan="'+suppliersList[i].rows+'" style="text-align:center;"><input class="isBidder" type="checkbox"></td>';
			
		}
		
		$(str).appendTo("tr[data-id='"+suppliersList[i].supplierId+"']");
	}
	
}


function formatHtml(data, supplierId){ 
	var html = "";
	for(var i = 0; i < data.length; i++){
		if(i != 0){
			html += '<tr>';
		}
		html += '<td rowspan="'+data[i].rows+'" colspan="'+data[i].cols+'">'+data[i].checkName+'</td>';
		if(data[i].checkLevel == 1){
			html += '<td style="word-break:normal;white-space:normal">' + (data[i].checkStandard ? data[i].checkStandard : "/");
			
			html += '</td>';
			
			for(var j = 0; j < expertMembers.length; j++){
				for(var m = 0; m < allExpertCheckAndItem.length; m++){
					var value = allExpertCheckAndItem[m];
					if(expertMembers[j].id == value.expertId && supplierId == value.supplierId){ 
						if(value.expertCheckItems && value.expertCheckItems.length > 0){
							for(var k = 0; k < value.expertCheckItems.length; k++){
								if(data[i].id == value.expertCheckItems[k].checkItemId){ 
									var item = value.expertCheckItems[k];
									var theKey = "/";
									if(item.score && item.score != ""){
										theKey = item.score;
										html += '<td style="text-align:center;">'+theKey+'</td>';
										if(k == 0){
											html += '<td style="text-align:center;" rowspan="'+value.expertCheckItems.length+'">' + value.score + "</td>";
										}
									} else {
										if(item.isKey == 0){
											theKey = "不合格";
										} else if(item.isKey == 1) {
											theKey = "合格";
										}
										html += '<td colspan="2" style="text-align:center;">'+theKey+'</td>';
									}
									
									
								}
							}
						} else {
							if(data[i].id == value.checkId){
								var theKey = "";
								if(value.score && value.score != ""){
									theKey = value.score;
								} else {
									if(value.isKey == 0){
										theKey = "不合格";
									} else if(value.isKey == 1) {
										theKey = "合格";
									}
								}
								html += '<td colspan="2" style="text-align:center;">'+theKey+'</td>';
							}
						}
						
					}
					
				}
				
			}
	} else {
		if(data[i].bidChecks && data[i].bidChecks.length > 0){
			html += formatHtml(data[i].bidChecks, supplierId);
		} else {
			if(data[i].bidCheckItemDtos && data[i].bidCheckItemDtos.length > 0){
				html += formatHtml(data[i].bidCheckItemDtos, supplierId);
			} else {
				html += '<td></td>';
				for(var j = 0; j < expertMembers.length; j++){
					for(var m = 0; m < allExpertCheckAndItem.length; m++){
						var value = allExpertCheckAndItem[m];
						if(expertMembers[j].id == value.expertId && supplierId == value.supplierId){ 
							
								if(data[i].id == value.checkId){
									var theKey = "";
									if(value.score && value.score != ""){
										theKey = value.score;
									} else {
										if(value.isKey == 0){
											theKey = "不合格";
										} else if(value.isKey == 1) {
											theKey = "合格";
										}
									}
									html += '<td colspan="2" style="text-align:center;">'+theKey+'</td>';
								}
							}
							
						
						
					}
				}
			}
		}
	}
//		if(i != 0){
			html += '</tr>';
//		}
	}
	return html;
}

/**
 *  转成树形结构
 * @param {Object} data
 * @param {Object} parentId
 */


function getJsonTree(data, parentId) {
    var itemArr = [];   
    var _this = this;
    for (var i = 0; i < data.length; i++) {
        var node = data[i];
        if(!node.pid){
        	node.pid = 0;
        }
        if(node.pid == parentId) {
        	var newNode = {};
	        newNode = node;
	        newNode.bidCheckItemDtos = _this.getJsonTree(data, node.id);
            itemArr.push(newNode);
        }
    }
    return itemArr;
}


/**
 * 获取树的每一级别所占的列数
*/
function getCols(treeData) {
    let floor = 0
    let max = 0
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
            if(e.bidCheckItemDtos && e.bidCheckItemDtos.length > 0){
            	if(e.bidCheckItemDtos[0].checkName && e.bidCheckItemDtos[0].checkName != ""){
            		each(e.bidCheckItemDtos, floor + 1);
            	} else {
            		
            		e.checkStandard = "";
            		
            		for(var i = 0; i < e.bidCheckItemDtos.length; i++){
            			e.checkStandard += e.bidCheckItemDtos[i].checkStandard;

						if(e.bidCheckItemDtos[i].rangeMin || e.bidCheckItemDtos[i].rangeMin == 0){
							e.checkStandard += " (" + e.bidCheckItemDtos[i].rangeMin + " - " + e.bidCheckItemDtos[i].rangeMax + "分)";
						} else {
							e.checkStandard += e.bidCheckItemDtos[i].rangeMax || e.bidCheckItemDtos[i].rangeMax == 0 ? " (" + e.bidCheckItemDtos[i].rangeMax + "分)" : "";
						}
						e.checkStandard += "<br/>";
            		}
            		e.bidCheckItemDtos = [];
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
            } else if (e.bidCheckItemDtos && e.bidCheckItemDtos.length > 0) {
                setCols(e.bidCheckItemDtos);
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
		} else if(data[i].bidCheckItemDtos && data[i].bidCheckItemDtos.length > 0){
			rows += getRows(data[i].bidCheckItemDtos).rows;
		} else {
			rows += 1;
		}
		data[i].rows = rows;
		rowAll += rows;
	}
	
	return {rows:rowAll, data:data};
}
