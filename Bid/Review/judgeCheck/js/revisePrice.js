var bidPriceChecksList=[],isFinish;
var correctionRatio = '';//	投标价修正比例
var priceType = '';//价格评审类型 1.投标价 2.投标价+缺漏项 3.投标价+缺漏项+偏离加价
var priceDetail =  [];//偏移加价详情信息
var retainNum = 0;
var canBe = true;//修正时输入的值能否通过验证，不能通过验证的话，无法提交
function revisePrice(node){
    var flag = false;
    var param = {
        "method":'getPriceCheck',
        "nodeType":node.nodeType
    };
    reviewFlowNode(param, function(data){
        flag = true;
        nodeType = node.nodeType;
        isFinish=data.isFinish;
        if(data.bidPriceChecks){
            bidPriceChecksList=data.bidPriceChecks;	//上一个环节未淘汰的投标人
        }
        priceType = data.priceType;//价格评审类型 1.投标价 2.投标价+缺漏项 3.投标价+缺漏项+偏离加价
		retainNum = data.bidderPriceDecimalPlaces;//投标报价保留的小数位数
		bidderPriceUnit = data.bidderPriceUnit;
        /* if(bidSectionInfo.priceUnit=="万元"){
            retainNum = 6;
        }else{
            retainNum = 2;
        } */
        if(priceType != 9){
	        if(isFinish != 1){
	            if(data.deviationPrices){
	                priceDetail = data.deviationPrices;
	            }
	            for(var i = 0;i < bidPriceChecksList.length;i++){
	                bidPriceChecksList[i].finalPrice = ownZero(bidPriceChecksList[i].finalPrice,retainNum);//最终报价或优惠价
	                bidPriceChecksList[i].fixCount = 0;//算术修正值
	                bidPriceChecksList[i].fixFinalPrice = bidPriceChecksList[i].finalPrice;//修正后总价
	                bidPriceChecksList[i].defaultItem = 0;//缺漏项
	                bidPriceChecksList[i].checkPrice = bidPriceChecksList[i].finalPrice;//评审价
	
	                bidPriceChecksList[i].deviatePrice = getDeviatePrice(bidPriceChecksList[i], priceDetail);//偏离加价
	
	                bidPriceChecksList[i].totalCheck = MathTools.add(bidPriceChecksList[i].checkPrice,bidPriceChecksList[i].deviatePrice,retainNum);//评审总价
	            }
	        }
	
	        correctionRatio = data.correctionRatio;//投标价修正比例
        }else{
        	/*if(isFinish != 1){
        		for(var i = 0;i < bidPriceChecksList.length;i++){
	                bidPriceChecksList[i].finalPrice = ownZero(bidPriceChecksList[i].finalPrice,retainNum);//最终报价或优惠价
	                bidPriceChecksList[i].fixCount = 0;//算术修正值
	                bidPriceChecksList[i].fixFinalPrice = bidPriceChecksList[i].finalPrice;//修正后总价
	                bidPriceChecksList[i].defaultItem = 0;//缺漏项
	                bidPriceChecksList[i].checkPrice = bidPriceChecksList[i].finalPrice;//评审价
	
	                bidPriceChecksList[i].deviatePrice = getDeviatePrice(bidPriceChecksList[i], priceDetail);//偏离加价
	
	                bidPriceChecksList[i].totalCheck = MathTools.add(bidPriceChecksList[i].checkPrice,bidPriceChecksList[i].deviatePrice,retainNum);//评审总价
	            }
        	}*/
        }
        if(data.isCompete!=undefined){
            if(data.isCompete==0){
                top.layer.alert('温馨提示：当前投标人不足3价，且不具有竞争性。');
            }else if(data.isCompete==1){
                /* if(bidSectionInfo.priceUnit=="万元"){
                    retainNum = 6;
                }else{
                    retainNum = 2;
                } */
                loadContent('model/revisePrice/content.html',function(){
                    showPriceList(data);
                });

            }else if(data.isCompete==2){
                compete(data.isEnter, data.competeCheckId, data.bidPriceChecks, function(){
                    revisePrice(node);
				});
            }
        }else{
            loadContent('model/revisePrice/content.html',function(){
                showPriceList(data);
            });
        }
    }, false);
    return flag;
}
function showPriceList(data){
//	$('#content').css('height',($(window).height()-$('#contents .mainTable').height()-75)+'px');
//	console.log(data)
	$('#btn-box').html('');
	var buts=""
	if(data.isFinish==0&&isEnd==0 && data.isEdit){
        buts+="<button class='btn btn-primary btn-strong keyButton'onclick='saveChecksList()'>提交</button>";
	};
    buts +='<button class="btn btn-primary btn-strong" id="relevant" style="margin-left:5px;">查看项目信息</button>';
    $('#btn-box').html(buts);
	// var list="";
	// list+='<table id="bidPriceChecksList" class="table table-bordered text-nowrap"></table>';
	// $("#content").html(list);
	var decimal = retainNum;
//	$('#content').css({'width':($(window).width()-220)+'px','overflow':'auto'});
	if(data.priceType != 9){
		//价格评标表格
		$("#bidPriceChecksList").bootstrapTable({
	//		showColumns: true,
			detailView: (data.priceType == 3)?true:false,   //父子表
			columns: [{
					field: '#',
					title: '序号',
					width: '50px',
					align: "center",
					formatter: function(value, row, index) {
						return index + 1;
					}
				}, {
					field: 'enterpriseName',
					title: '投标人',
					/*cellStyle:{
						css:{'min-width':'200px'}
					}*/
					
				},{
					field: 'finalPrice',
					title: '原投标价('+ bidderPriceUnit +')',
					width: '200px',	
					align: "center",
					formatter: function(value, row, index) {
						return value
					}
				},{
					field: 'fixCount',
					title: '算术修正值('+ bidderPriceUnit +')',
					width: '200px',	
					align: "center",
	//				visible:false,
					events:{
						'change .fixCount':function(e,value, row, index){
							canBe = true;
							var priceArr = mathNumber(row.finalPrice,$(this).val(),1,index);
							$('#fixFinalPrice_'+index).html(priceArr.fixFinalPrice);//修正后的投标价
							$('#checkPrice_'+index).html(priceArr.checkPrice);//评审价
							$('#deviatePrice_'+index).html(priceArr.deviatePrice);//偏离调整加价
							$('#totalCheck_'+index).html(priceArr.totalCheck);//	评审总价
							
						}
					},
					formatter: function(value, row, index) {
						if(isFinish==1){
							if(value!=undefined){
								return value
							}else{
								return '/'
							}
						}else{
							return "<input   type='number' value='"+ value +"' id='fixCount_"+ index +"' class='fixCount form-control'/>"
						}
					}
				},{
					field: 'countReason',
					title: '算术修正原因',
					cellStyle:{
						css:{'min-width':'150px'}
					},
					formatter: function(value, row, index) {
						if(isFinish==1){
							if(value!=undefined){
								return "<span class='reason_html'>"+value+"</span>"
							}else{
								return '-'
							}
						}else{
							return "<textarea style='max-height:80px;' type='text' id='fix_reason_"+ index +"' class='reason form-control'>"+ (row.countReason!=undefined?row.countReason:"") +"</textarea>"
						}
					}
				},{
					field: 'fixFinalPrice',
					title: '修正后投标价('+ bidderPriceUnit +')',
					width: '200px',	
					align: "center",				
					formatter: function(value, row, index) {
						if(isFinish==1){
							if(value!=undefined){
								return value
							}else{
								return '/'
							}
						}else{
							return "<div id='fixFinalPrice_"+ index +"' class='fixFinalPrice'>"+value+"</div>"
						}
					}
				},{
					field: 'defaultItem',
					title: '缺漏项修正('+ bidderPriceUnit +')',
					align: "center",
					visible:(data.priceType == 1)?false:true,
					width: '200px',	
					events:{
						'change .defaultItem':function(e,value, row, index){
							canBe = true;
							var priceArr = mathNumber(row.finalPrice,$(this).val(),2,index);
							$('#fixFinalPrice_'+index).html(priceArr.fixFinalPrice);//修正后的投标价
							$('#checkPrice_'+index).html(priceArr.checkPrice);//评审价
							$('#deviatePrice_'+index).html(priceArr.deviatePrice);//偏离调整加价
							$('#totalCheck_'+index).html(priceArr.totalCheck);//	评审总价
						}
					},
					formatter: function(value, row, index) {
						if(isFinish==1){
							if(value!=undefined){
								return value
							}else{
								return '/'
							}						
						}else{
							return "<input  type='number' value='"+ value +"' id='defaultItem_"+ index +"' class='defaultItem form-control'/>"
						}
					}
				},{
					field: 'reason',
					title: '缺漏项调整原因',
					cellStyle:{
						css:{'min-width':'150px'}
					},	
					visible:(data.priceType == 1)?false:true,
					formatter: function(value, row, index) {
						if(isFinish==1){
							if(value!=undefined){
								return "<span class='reason_html'>"+value+"</span>"
							}else{
								return '-'
							}
						}else{
							return "<textarea style='max-height:80px;' type='text' id='reason_"+ index +"' class='reason form-control'>"+ (row.reason!=undefined?row.reason:"") +"</textarea>"
						}
					}
				},{
					field: 'checkPrice',
					title: '评标价('+ bidderPriceUnit +')',
					width: '200px',	
					align: "center",
					formatter: function(value, row, index) {
						if(isFinish==1){
							if(value!=undefined){
								return value
							}else{
								return '/'
							}
						}else{
							return "<div id='checkPrice_"+ index +"' class='checkPrice'>"+value+"</div>"
						}
					}
				},
				{
					field: 'deviatePrice',
					title: '偏离加价 ('+ bidderPriceUnit +')',
					align: "center",
					width: '150px',	
					visible:(data.priceType == 3)?true:false,
					formatter: function(value, row, index) {
						if(isFinish==1){
							if(value!=undefined){
								return value
							}else{
								return '/'
							}
						}else{
							/*var deviatePrice = 0;
							if(row.deviateNum && row.deviateNum != 0){
								deviatePrice = (Number(row.finalPrice)*Number(row.deviateNum))/100;
							}*/
							return "<div id='deviatePrice_"+ index +"' class='deviatePrice'>"+value+"</div>"
	//						return "<input   type='number' value='"+ (value!=undefined?value:"") +"' id='deviatePrice_"+ index +"' class='deviatePrice form-control'/>"
						}
					}
					
				},{
					field: 'totalCheck',
					title: '最终评标价('+ bidderPriceUnit +')',
					width: '200px',	
					align: "center",
					formatter: function(value, row, index) {
						if(isFinish==1){
							if(value!=undefined){
								return value
							}else{
								return '/'
							}
						}else{
							/*var totalCheck = 0;
							if(row.deviateNum && row.deviateNum != 0){
								totalCheck = (Number(row.finalPrice)*(100+Number(row.deviateNum)))/100;
							}else{
								totalCheck = Number(row.finalPrice)
							}*/
							
							return "<div id='totalCheck_"+ index +"' class='totalCheck'>"+value+"</div>"
						}
					}
				}
			],
			//注册加载子表的事件。注意下这里的三个参数！
	        onExpandRow: function (index, row, $detail) {
	        	if(data.priceType == 3){
	        		sonTable(index, row, $detail);
	        	}
	        }
		});
		$('#bidPriceChecksList').bootstrapTable("load",bidPriceChecksList); //重载数据
		//设置bootstrapTable起始的高度
	    $('#bidPriceChecksList').bootstrapTable({ height:($(window).height()-$('#contents .mainTable').height()-75)+'px' });
	    $(".fixed-table-container").css({ height: ($(window).height()-$('#contents .mainTable').height()-75)+'px' });
		$('#bidPriceChecksListBox').css({ width:($(window).width()-230)+'px' });
		// bidPriceChecksListBox
	    //当表格内容的高度小于外面容器的高度，容器的高度设置为内容的高度，相反时容器设置为窗口的高度-160
	    /*if ($(".fixed-table-body table").height() < $(".fixed-table-container").height()) {
	        $(".fixed-table-container").css({ "padding-bottom": "0px", height: $(".fixed-table-body table").height() + 20 });
	        // 是当内容少时，使用搜索功能高度保持不变
	        $('#bidPriceChecksList').bootstrapTable('resetView', { height: "auto" });
	    } else {
	        $(".fixed-table-container").css({ height: ($(window).height()-$('#contents .mainTable').height()-75)+'px' });
	    }*/
	}else{
		var html = '';
		$('#bidPriceChecksList').addClass('price_rate_table')
		$('#bidPriceChecksList').html('');
		html += '<thead>';
			html += '<tr>';
				html += '<th style="width: 150px">投标人</th>';
				html += '<th style="width: 150px;">报价类型</th>';
				html += '<th style="width: 150px;text-align: right;">原报价</th>';
				html += '<th style="width: 100px;text-align: right;">算术修正</th>';
				html += '<th style="width: 150px;text-align: right;">修正后报价</th>';
				html += '<th style="width: 150px;">调整原因</th>';
			html += '</tr>';
		html += '</thead>';
		html += '<tbody>';
		for(var i = 0;i < bidPriceChecksList.length;i++){
			for(var j = 0;j < bidPriceChecksList[i].bidPriceCheckItems.length;j++){
				var priceList = bidPriceChecksList[i].bidPriceCheckItems[j];
				var priceType = '';
				if(priceList.priceType == 'BJ_KCF'){
					priceType = '勘测费报价';
				}else if(priceList.priceType == 'BJ_SJF'){
					priceType = '设计费报价';
				}else if(priceList.priceType == 'BJ_JAGCZJ'){
					priceType = '建安工程造价报价';
				}else if(priceList.priceType == 'TBBJFL'){
					priceType = '投标报价'
				}
				html += '<tr>';
					if(j == 0){
						html += '<td style="width: 150px;" rowspan="'+bidPriceChecksList[i].bidPriceCheckItems.length+'">'+bidPriceChecksList[i].enterpriseName+'</td>';
					}
					html += '<td style="width: 150px;">'+priceList.priceName+'</td>';
					html += '<td style="width: 150px;text-align: right;">'+priceList.finalPrice+'</td>';
					html += '<td style="width: 100px;text-align: right;">';
						if(isFinish == 1){
							html += priceList.fixCount?priceList.fixCount:'/'
						}else{
							html += "<input  type='number' value='0' id='' data-type='"+priceList.priceType+"' data-index='"+i+"' data-ind='"+j+"' class='form-control fixCount' />"
						}
					html += '</td>';
					html += '<td style="width: 150px;text-align: right;" class="fixFinalPrice">'+(isFinish == 1?priceList.fixFinalPrice:priceList.fixFinalPrice)+'</td>';
					html += '<td style="width: 150px;">';
						if(isFinish == 1){
							html += priceList.reason?priceList.reason:'/'
						}else{
							html += "<textarea style='max-height:80px;' type='text' id='reason_"+i+'_'+j+"' class='reason form-control'></textarea>"
						}
					html += '</td>';
				html += '</tr>';
			}
		}
		html += '</tbody>';
		$(html).appendTo('#bidPriceChecksList')
	}
	
};
//子表
function sonTable(index, row, $detail){
		var detailList =  [];//偏移加价详情信息
		var parentid = row.supplierId;
        var cur_table = $detail.html('<table></table>').find('table');
        for(var i = 0;i< priceDetail.length;i++){
        	if(priceDetail[i].supplierId == parentid){
        		detailList = priceDetail[i].deviationPriceDetails;
        	}
        };
        $(cur_table).bootstrapTable({
            queryParams: { id: parentid },
            columns: [
            {
                field: 'checkName',
                title: '评审项名称'
            }, {
                field: 'deviateNum',
                title: '偏离加价项数'
            }, {
                field: 'addPriceRatio',
                title: '加价幅度（%）'
            } ],
        });
        $(cur_table).bootstrapTable('load',detailList); //重载数据
}
/*价格评审类型 */
$('#contents').on('change','.price_rate_table .fixCount',function(){
	var index = $(this).attr('data-index');
	var priceIndex = $(this).attr('data-ind');
	var priceType = $(this).attr('data-type');
	var fixFinalPrice = '';//修正后报价
	var priceNum = $(this).val();//修正比例
	var reg = new RegExp("^[+-]?\\d+(\\.\\d{1,"+retainNum+"})?$","gim");
	canBe = true;
	if(!reg.test(priceNum)){
		$(this).val('0');
		canBe = false;
		top.layer.alert('温馨提示：算术修正值必须为数字,且小数点后面最多'+retainNum+'位小数');
	}else{
		fixFinalPrice = MathTools.add(bidPriceChecksList[index].bidPriceCheckItems[priceIndex].finalPrice,priceNum,retainNum);
		if(fixFinalPrice <= 0){
            top.layer.alert('温馨提示：修正的值不能超出-'+bidPriceChecksList[index].bidPriceCheckItems[priceIndex].finalPrice);
            $(this).val(bidPriceChecksList[index].bidPriceCheckItems[priceIndex].fixCount);
        }else{
            $(this).closest('tr').find('.fixFinalPrice').html(fixFinalPrice)
            bidPriceChecksList[index].bidPriceCheckItems[priceIndex].priceType = priceType;
            bidPriceChecksList[index].bidPriceCheckItems[priceIndex].fixCount = priceNum;//	算术修正
            bidPriceChecksList[index].bidPriceCheckItems[priceIndex].fixFinalPrice = fixFinalPrice;//修正后报价
        }
	}
})
function saveChecksList(){
	if(!canBe){
		return
	}
	
	
	for(var i=0;i<bidPriceChecksList.length;i++){
		if(priceType == 9){
			for(var j = 0;j < bidPriceChecksList[i].bidPriceCheckItems.length;j++){
				if(bidPriceChecksList[i].bidPriceCheckItems[j].fixCount && bidPriceChecksList[i].bidPriceCheckItems[j].fixCount != 0 && $.trim($('#reason_'+i+'_'+j).val()) == ''){
					top.layer.alert("温馨提示：请填写调整原因",function(ind){
						top.layer.close(ind);
						$('#reason_'+i+'_'+j).focus();
					});
					return false;
				}
				bidPriceChecksList[i].bidPriceCheckItems[j].reason = $('#reason_'+i+'_'+j).val();
			}
		}else{
			if($("#fixCount_"+i).val()!="" && $("#fixCount_"+i).val() != 0 && $("#fix_reason_"+i).val()==""){
				top.layer.alert("温馨提示：请填写算术修正原因",function(ind){
					top.layer.close(ind);
					$("#fix_reason_"+i).focus();
				});
				return false;
			}
			if($("#defaultItem_"+i).val()!="" && $("#defaultItem_"+i).val() != 0 && $("#defaultItem_"+i).val() != undefined && $("#reason_"+i).val()==""){
				top.layer.alert("温馨提示：请填写缺漏项调整原因",function(ind){
					top.layer.close(ind);
					$("#reason_"+i).focus();
				});
				return false;
			}
			bidPriceChecksList[i].countReason = $("#fix_reason_"+i).val();//缺漏项
			bidPriceChecksList[i].reason = $("#reason_"+i).val();//缺漏项
		}
	}
    var param = {
        "method":'saveBidPriceCheck',
        "nodeType":currNode.nodeType,
        'bidPriceChecks':bidPriceChecksList
    };
    reviewFlowNode(param, function(data){
        currFunction();
	},false);
}
/*mathNumber(firstPrice,modifyNum,type,index) 修改后计算所有的值
 * firstPrice  元投标价
 * modifyNum 修改的数值
 * type 修改的类型  1 算术修正值  2 缺漏项
 * index 修改的行数
 * 
 * */
function mathNumber(firstPrice,modifyNum,type,index){
//	var arr = bidPriceChecksList[index];
//	var retainNum = 0;
	var reg = '';
	var fixFinalPrice = '';//修正后总价
//	var defaultItem = '';//缺漏项
	var checkPrice = '';//评审价
	var deviatePrice = '';//偏离调整加价
	var totalCheck = '';//评审总价
//	var wanderPrice = '';//偏离的价格
	if(modifyNum == ''){
		modifyNum = 0
	}
	reg = new RegExp("^[+-]?\\d+(\\.\\d{1,"+retainNum+"})?$","gim");
	if(type == 1){//算术修正值
		
		
		/* if(bidSectionInfo.priceUnit=="万元"){
			reg = /^[+-]?\d+(\.\d{1,6})?$/;
		}else{
			reg = /^[+-]?\d+(\.\d{1,2})?$/;
		} */
		//输入值的正则验证
		if(!reg.test(modifyNum)){
			$('#fixCount_'+index).val("");
			top.layer.alert('温馨提示：算术修正值必须为数字,且小数点后面最多'+retainNum+'小数');
			modifyNum = 0;
			canBe = false;
		}
		
		//判断修正值是否在修正比例之内
		if(Number(firstPrice)*Number(correctionRatio) < Math.abs(Number(modifyNum))){
			top.layer.alert('温馨提示：算术修正值大于修正比例：'+ (Number(correctionRatio)*100).toFixed(0) + "%");
//			$('#fixCount_'+index).val("");
//			modifyNum = 0;
			canBe = true;
		}
		fixFinalPrice = MathTools.add(firstPrice,modifyNum?modifyNum:'0',retainNum);//修正后总价
		//判断修正值是否在修正范围内 
		if(fixFinalPrice.indexOf('-') != -1 || Number(fixFinalPrice) == 0){
			top.layer.alert('温馨提示：算术修正值最小值不能小于或等于'+ (-bidPriceChecksList[index].finalPrice));
			$('#fixCount_'+index).val("");
			modifyNum = 0;
			fixFinalPrice = MathTools.add(firstPrice,modifyNum,retainNum);//修正后总价
			canBe = false;
		}
		bidPriceChecksList[index].fixCount = modifyNum;
		checkPrice = MathTools.add(fixFinalPrice,$("#defaultItem_"+index).val()?$("#defaultItem_"+index).val():'0',retainNum);//评审价
		
	}else if(type == 2){
		fixFinalPrice = $('#fixFinalPrice_'+index).html();
		/* if(bidSectionInfo.priceUnit=="万元"){
			reg = /^(([1-9][0-9]*)|(0))(\.[0-9]{1,6})?$/;
		}else{
			reg = /^(([1-9][0-9]*)|(0))(\.[0-9]{1,2})?$/;
		} */
		if(!reg.test(modifyNum)){	
			$('#defaultItem_'+index).val("");
			top.layer.alert('温馨提示：缺漏项必须为大于等于零的数字,且小数点后面最多'+retainNum+'小数');
			$('#defaultItem_'+index).val("");
			modifyNum = 0;
			canBe = false;
		}
		bidPriceChecksList[index].defaultItem = modifyNum
		checkPrice = MathTools.add(fixFinalPrice,modifyNum,retainNum);//评审价
	}
    bidPriceChecksList[index].fixFinalPrice = fixFinalPrice;
    bidPriceChecksList[index].checkPrice = checkPrice;

    deviatePrice = getDeviatePrice(bidPriceChecksList[index], priceDetail);//偏离加价

    bidPriceChecksList[index].deviatePrice = deviatePrice;

	totalCheck = MathTools.add(checkPrice,deviatePrice,retainNum);//评审总价
	bidPriceChecksList[index].totalCheck = totalCheck;
	/*arr = {
		'fixFinalPrice':fixFinalPrice,//修正后总价
		'checkPrice':checkPrice,//评审价
		'deviatePrice':deviatePrice,//偏离调整加价
		'totalCheck':totalCheck		//评审总价
	}*/
	return bidPriceChecksList[index]
}
/*ownZero(val,num)  自动补零
 * val  获取的值
 * num 要保留的小数位数
 * */
function ownZero(val,num){
//	console.log(val)
	var arr = val.split('.');
	var leng = 0;
	if(arr.length == 1){
		leng = num;
		if(leng != 0){
			val += '.';
		}
	}else{
		leng = num-((arr[1].split('')).length);
	}
	if(leng != 0){
		for(var i = 0;i<leng;i++){
			val += '0'
		}
	}
	return val 
}

//获取偏离价
function getDeviatePrice(bidPriceChecks, priceDetail){
    var deviatePrice = 0;
    if(bidPriceChecks.deviateNum){
        var decimal = 100;
        if(retainNum == 6){
            decimal = 1000000;
        }else if(retainNum == 2){
            decimal = 100;
        }
        for(var i=0; i<priceDetail.length; i++){
            if(priceDetail[i].supplierId == bidPriceChecks.supplierId){
                for(var j=0; j < priceDetail[i].deviationPriceDetails.length; j++){
                    if(priceDetail[i].deviationPriceDetails[j].deviateNum>0){
                        deviatePrice = deviatePrice + Number((Math.floor(Number(bidPriceChecks.checkPrice)*decimal*priceDetail[i].deviationPriceDetails[j].deviateNum*priceDetail[i].deviationPriceDetails[j].addPriceRatio)/(100*decimal)).toFixed(retainNum));
                    }
                }
            }
        }
        if(deviatePrice > 0){
            deviatePrice = deviatePrice.toFixed(retainNum);
        }
    }
    return deviatePrice;
}

