//访问路径
var url = top.config.bidhost;
var checkRemark;
var loadFile = top.config.bidhost + "/FileController/download.do"; //文件下载
var packageId = getUrlParam("packageId");
var projectId = getUrlParam("projectId");
var createType = getUrlParam("createType") //0自己本人创建  1非本人创建
var isAgents;
//评评审方式    0综合评分法   1最低评标价法
var checkPlan;// = getUrlParam("checkPlan");
//本页面获取的包件信息
var packageData;
var lwsorce;
var WORKFLOWTYPE;
var tab_id
$(function () {

	//获取数据
	getProjectData();

	//加载主页面请求数据
	InfoAndProjectCheck();
	//最低评标价法，无价格评审
	/*if(checkPlan == '1') {
		$("#liaPriceCheck").css('display', 'none');
	}*/
	//包件结束后，所有按钮皆不能操作
	if (packageData.isStopCheck == 1) {
		//$(".btn").hide();
		//$(".btntr").hide();
		$(".stopCheck").hide();
	}
	//$(".prieUnit").html(top.prieUnit);
	tabOne();
	if (createType == 1) {
		$(".isCreateType").hide()
	} else {
		$(".isCreateType").show()
	}
	//关闭
	$('html').on('click', '#btnClose', function () {
		var index = parent.layer.getFrameIndex(window.name);
		parent.layer.close(index);
	});
	$('#btnRefresh').click(function () {
		window.location.reload()
	})
});

//调用接口，读取页面信息
function InfoAndProjectCheck() {
	$.ajax({
		type: "post",
		url: url + "/ProjectReviewController/getProjectCheckInfo.do",
		data: {
			projectId: ProjectData.projectId,
			packageId: packageId,
			roleType: 0
		},
		async: false,
		success: function (data) {
			$("#projectCode").html(data.data.projectCode);
			$("#projectName").html(data.data.projectName);
			$("#packageName").html(data.data.packageName);
			$("#packageNum").html(data.data.packageNum);

			packageData = data.data;
			if (packageData.checkPlan == 0) {
				$("#checkPlan").html('综合评分法');
				$('.deviateNum').hide();
				$(".checkPlan").attr('colspan', '3')
			}
			if (packageData.checkPlan == 1) {
				$("#checkPlan").html('最低评标价法');
				$('.deviateNum').show();
				$('#deviateNum').html(packageData.deviate);
				$(".checkPlan").attr('colspan', '1')
			}
			if (packageData.checkPlan == 2) {
				$("#checkPlan").html('经评审的最低价法(价格评分)');
				$('.deviateNum').hide();
				$(".checkPlan").attr('colspan', '3')
			}
			if (packageData.shadowMarks && packageData.shadowMarks.length > 0) {
				$("#corresponding").show();
			}
			if (packageData.checkPlan == 3) {
				$("#checkPlan").html('最低投标价法');
				$('.deviateNum').show();
				$('#deviateNum').html(packageData.deviate);
				$(".checkPlan").attr('colspan', '1')
			}
			if (packageData.checkPlan == 5) {
				$("#checkPlan").html('经评审的最低投标价法');
				$('.deviateNum').show();
				$('#deviateNum').html(packageData.deviate);
				$(".checkPlan").attr('colspan', '1')
			}
			checkPlan = packageData.checkPlan;
			//加载动态tab
			insertTab(packageData);
			//默认加载第一个tab，清单报价
			ProjectCheckState(packageData); //评审进度
			BindCheckStateRestor(packageData); //退回记录
			if (packageData.stopCheckReason != "" && packageData.stopCheckReason != undefined) {
				$('#viewReason').html(packageData.stopCheckReason);
				$('#StopChecks').html('专家评委提出流标，');
				$('#StopCheckPw').hide();
				$('.StopCheck').show();
				if (createType == 1) {
					$('#StopCheck').hide()
				} else {
					$('#StopCheck').show()
				}
			} else {
				$('.StopCheck').hide();
				$('#StopCheck').hide();
				if (createType == 1) {
					$('#StopCheckPw').hide()
				} else {
					$('#StopCheckPw').show();
				}
				$('#viewReason').hide();
				/*if(packageData.checkResult=="已完成"){
					$('.StopCheck').hide();
					$('#StopCheck').hide();
					$('#StopCheckPw').hide();
				}*/
				if (packageData.bidResultType == 1) {//已存在结果通知书,无法流标
					$('.StopCheck').hide();
					$('#StopCheck').hide();
					$('#StopCheckPw').hide();
				}
			};
			if (packageData.isStopCheck == 1) {
				$('.StopCheck').show();
				$('#StopChecks').html('已流标，');
				$('#StopCheck').hide();
				$('#StopCheckPw').hide();
			}
			$("#downloadAllFile").show();
		}
	});
}
//只重新获取主数据，进度
function getData() {
	$.ajax({
		type: "get",
		url: url + "/ProjectReviewController/getProjectCheckInfo.do",
		data: {
			projectId: ProjectData.projectId,
			packageId: packageId,
			roleType: 0
		},
		async: false,
		success: function (data) {
			packageData = data.data;
		}
	});
}
var count = 0;
//点击tab加载对应数据
$("#myTab").on("click", "li", function (e) {
	$("#myTab li").removeClass('active');
	$(this).addClass('active');
	var contentdiv = $(this).attr('value');
	$("#myTabContent div").removeClass('show');
	$(contentdiv).addClass("show");
	tab_id=contentdiv.substring(1,33)
	switch (contentdiv) {
		case "#progress":
			count++;
			if (count >= 1) {
				InfoAndProjectCheck2();
			}
			ProjectCheckState(packageData); //评审进度
			BindCheckStateRestor(packageData); //退回记录
			break;
		case "#PackageOffer":
			offerData('PackageOffer');
			break;
		case "#PriceFile":
			offerData('PriceFile');
			break;
		case "#subentry":
			offerData('subentry');
			break;
		case "#PriceCheck":
			PriceCheck(); //加载价格评审和评审方法
			break;
		case "#PriceCheckTotal":
			PriceCheckTotal(packageData);
			break;
		case "#CheckReport":
			if (packageData.checkItem == "未完成") {
				$("#myTab li").removeClass('active');
				$("li[value='#progress']").addClass('active');
				$("#myTabContent div").removeClass('show');
				$("#progress").addClass("show");
				return top.layer.alert("评审汇总未完成，无法生成报告");
			}
			CheckReport(packageData);
			WORKFLOWTYPE = 'psbg';
			//findWorkflowCheckerAndAccp(packageData.projectId);
			findWorkflowCheckerAndAccp(packageData.checkReportId || packageData.projectId);
			break;
		case "#raterAsks":
			bindRaterAsks(packageData);
			break;
		case "#correspondings":
			corresponding(packageData.shadowMarks);
			break;
		default:
			//动态评审项  赋值
			var packageCheckLists = packageData.packageCheckLists;
			for (var i = 0; i < packageCheckLists.length; i++) {
				if (contentdiv == ("#" + packageCheckLists[i].id)) {
					insetItmeTab(packageCheckLists[i]);
					break;
				}
			}
			//二级切换
			var id = contentdiv.substr(1, contentdiv.length - 1);
			$("#Tab_" + id).on("click", "li", function (e) {
				$("#Tab_" + id + " li").removeClass('active');
				$(this).addClass('active');
				var contentdivdetail = $(this).attr('value');
				$("#TabContent_" + id + " div").removeClass('show');
				$(contentdivdetail).addClass("show");
			});
			break;
	}
});

//重新获取数据
function InfoAndProjectCheck2() {
	$.ajax({
		type: "post",
		url: url + "/ProjectReviewController/getProjectCheckInfo.do",
		data: {
			projectId: ProjectData.projectId,
			packageId: packageId,
			examCheckType: 2,
			roleType: 0
		},
		async: false,
		success: function (data) {
			packageData = data.data;
		}
	});

	tabOne();

}

function tabOne() {
	if (packageData.isShowAllOffer != undefined && packageData.isShowAllOffer == 1) {
		//采购人显示报价及报价文件
		if (packageData.packageCheckStates.length > 0 && packageData.packageCheckLists.length > 0) {
			if (packageData.packageCheckStates.length == (packageData.packageCheckLists.length * packageData.projectCheckers[0].checkerCount)) {
				$(".allOffer").show();
				$(".allOffers").show();
			} else {
				$(".allOffers").hide();
				$(".allOffer").hide();
			}
		} else {
			//不在采购人和代理机构页面显示报价及报价文件	
			$(".allOffers").hide();
			$(".allOffer").hide();
		}
	}
	if (packageData.isStopCheck == 1) {
		//$(".btntr").hide();
		$(".stopCheck").hide();
	}
	if (packageData.shadowMarks && packageData.shadowMarks.length > 0) {
		$("#corresponding").show();
	}
}

function getProjectData() {
	$.ajax({
		url: url + "/CheckController/getPurchaseCheck.do",
		data: {
			id: projectId,
			packageId: packageId,
		},
		async: false,
		success: function (data) {

			if (data.success) {
				if ($("#myTab li.active").text() == "项目预审") {
					types = 1;
				} else {
					types = 2;
				}
				ProjectData = data.data;
				isAgents = ProjectData.isAgent;
			}
		}
	});
}

//加载CheckLists选项卡
function insertTab(packageData) {
	var data = packageData.packageCheckLists; //评审项
	var strUl = "";
	var strdiv = "";
	for (var i = 0; i < data.length; i++) { //评审项目循环  大的tab绑定
		if (packageData.doubleEnvelope == 1) {
			strUl += "<li id='li_" + data[i].id + "' value='#" + data[i].id + "'>";
			strUl += "<a href='javascript:void(0)' data-toggle='tab'>" + data[i].checkName + (data[i].envelopeLevel == 1 ? '（第一封）' : '（第二封）') + "</a>";
			strUl += "</li>";
			strdiv += "<div class='tab-pane fade' id='" + data[i].id + "'>";
			strdiv += "</div>";
		} else {
			strUl += "<li id='li_" + data[i].id + "' value='#" + data[i].id + "'>";
			strUl += "<a href='javascript:void(0)' data-toggle='tab'>" + data[i].checkName + "</a>";
			strUl += "</li>";
			strdiv += "<div class='tab-pane fade' id='" + data[i].id + "'>";
			strdiv += "</div>";
		}
	}
	$("#lidiv").after(strUl);
	$("#PriceFile").after(strdiv);
	tabOne();
	var liList = []
	$("#myTab li").each(function () {
		if ($(this).css("display") != "none") {
			liList.push($(this).width())
		}
	});
	if (packageData.stopCheckReason != "" && packageData.stopCheckReason != undefined) {
		var longs = 160
	} else {
		var longs = 60
	}
	$("#fristTab").width($("#fristTabtd").width() - $("#pervAndnext").width() - longs);
	if ((eval(liList.join('+')) + liList.length * 4) >= $("#fristTab").width()) {
		$("#perv").show();
		$("#next").show();
		$("#myTab").width(eval(liList.join('+')) + liList.length * 4);
	} else {
		$("#perv").hide();
		$("#next").hide();
		$("#myTab").width("100%");
	}

}
var moveIndexs = 0;
$("#perv").on('click', function () {
	moveIndexs < 0 ? moveIndexs++ : moveIndexs = 0
	$("#myTab").stop().animate({
		'marginLeft': moveIndexs * 200
	})
})
$("#next").on('click', function () {
	-(Math.round($("#myTab").css('width').slice(0, -2) - $("#fristTab").width())) < Math.round($("#myTab").css('margin-left').slice(0, -2)) ? moveIndexs-- : ''
	$("#myTab").stop().animate({
		'marginLeft': moveIndexs * 200
	})
})

//刷新竞价起始价--参与竞价供应商最低价
function reloadStartPrice() {
	let startPrice = null;
	$('#supplierJoinInfo input[type=checkbox]:checked').each(function (i, v) {
		let price =parseFloat( $(this).data('price')) ;
		if (!startPrice || price < parseFloat(startPrice)) {
			startPrice = price;
		}
	});
	$('#startPrice').val(startPrice);
}

function startPriceChange(){
	let startPrice = $('#startPrice').data('price'), realStartPrice = $('#startPrice').val();
	if(parseFloat(startPrice) != parseFloat(realStartPrice)){
		$('.priceChangeReason').show();
	}else{
		$('.priceChangeReason').hide();
	}
}

//启动竞价
function startBidPrice(_this) {
	if(!$('#startPrice').val() || isNaN($('#startPrice').val())){
		return top.layer.alert("温馨提示：竞价起始价格式错误");
	}
	if(!(/^(([1-9][0-9]*)|(([0]\.\d{1,2}|[1-9][0-9]*\.\d{1,2})))$/.test($('#startPrice').val()))||parseFloat($('#startPrice').val())==0){ 
		parent.layer.alert("竞价起始价格必须大于零且最多两位小数"); 
		$(this).val("");
		
		return
	};
	let startPrice = $('#startPrice').data('price'), realStartPrice = $('#startPrice').val();
	if(!startPrice){
		$('#supplierJoinInfo input[type=checkbox]:checked').each(function (i, v) {
			let price = parseFloat( $(this).data('price'));
			if (!startPrice || price < parseFloat(startPrice)) {
				startPrice = price;
			}
		});
	}
	
	if(parseFloat(startPrice) != parseFloat(realStartPrice) && $('#startPriceChangeReason').val()==""){
		return top.layer.alert("温馨提示：竞价起始价修改原因不能为空");
	}
	let params = {
		packageId: packageId,
		startPrice: startPrice || realStartPrice,
		realStartPrice: realStartPrice,
		startPriceChangeReason: $('#startPriceChangeReason').val(),
		bidpriceStartTime: $('#bidpriceStartTime').val()
	}
	let notReason = false;
	let isChecked=new Array();
	$('#supplierJoinInfo input[type=checkbox]').each(function(i,_this){
		
		let reason = $(this).parent().parent().find('.reason').val();
		if(!_this.checked && reason==""){
			notReason = true;
			return false;
		}
		if(_this.checked){
			isChecked.push(i)
		}
		params['bidPriceResultList[' + i + '].supplierId'] = $(this).data('supplier');
		params['bidPriceResultList[' + i + '].joinBidprice'] = _this.checked? 1 : 0;
		!_this.checked && (params['bidPriceResultList[' + i + '].notJoinReason'] = reason);
	});
	if(notReason){
		return top.layer.alert("温馨提示：供应商不参与竞价原因不能为空");
	}
	if(isChecked.length==0){
		return top.layer.alert("温馨提示：至少选择一家供应商参与竞价");
	}
	var title=$(_this).data('name')
	top.layer.confirm("温馨提示：是否确定"+ title +"？", function (indexs) {
		$.ajax({
			type:'post',
			url:url+'/bidPriceController/startBidPrice.do',
			data: params,
			success: function (res) {
				if(res.success){
					$("#myTab li.active").click();
					top.layer.alert('启动竞价成功');
					top.layer.close(indexs)
				}else{
					top.layer.alert(res.message);
				}
				
			}
		})
	});
	
}
function submitResult() { 
	top.layer.confirm("温馨提示：是否确定提交竞价结果", function (indexs) {
		$.ajax({
			type: "post",
			url: url+"/bidPriceController/submitResult.do",
			data: {
				'packageId':packageId
			},
			dataType: "json",
			success: function (response) {
				if(response.success){
					parent.layer.alert('提交成功');
					$("#myTab li.active").click();
					$("#submitResult").hide();
					$("#startBidPrice").hide();
				}
			}
		});
	});
	
 }
//加载二级选项卡tab
var packageCheckItems;
var suppliers;
var checkItemInfos;
var offerFileData;
var nowpackageCheckList
var offerauctionData;
function insetItmeTab(packageCheckList) {
	//参数
	var para = {
		projectId: ProjectData.projectId,
		packageId: packageId,
		packageCheckListId: packageCheckList.id,
		checkerCount: packageData.projectCheckers[0].checkerCount,
		roleType: 0
	};
	//非第一个评审项时寻找上一个评审项id
	for (var i = 0; i < packageData.packageCheckLists.length; i++) {
		if (packageCheckList.id == packageData.packageCheckLists[i].id) {
			if (i != 0) {
				para.prePackageCheckListId = packageData.packageCheckLists[i - 1].id;
			} else {
				para.prePackageCheckListId = '';

			}
		}
	}
	// para.prePackageCheckListId = packageCheckList.id;
	$.ajax({
		type: "post",
		url: url + "/ProjectReviewController/getPackageCheckItem.do",
		data: para,
		async: false,
		success: function (data) {
			if (data.success) {
				data = data.data;
				offerauctionData= data.data;
				if (data.checkType == 4) {
					let body = $("#" + packageCheckList.id).empty();
					body.append(['<div class="panel panel-info">',
						'<div class="panel-heading">',
						'<h3 class="panel-title" style="padding: 10px 0 10px 10px;">',
						'竞价设置',
						'</h3>',
						'</div>',
						'<div class="panel-body bidSet">',
						'<div><label style="padding:10px;width:180px;text-align:right;">是否重新计算排名：</label>',
						'<label style="padding:10px">' + (!data.priceCheckMode ? '是' : '否') + '</label></div>',
						'<div><label style="padding:10px;width:180px;text-align:right;">竞价起始价计算方式：</label>',
						'<label style="padding:10px">' + ['参与竞价供应商最低报价', '未淘汰供应商最低报价', '参与报价供应商最低报价'][data.bidStartPriceFrom] + '</label></div>',
						'<div><label style="padding:10px;width:180px;text-align:right;">竞价起始价：</label>',
						(!data.bidPrice||(data.bidPrice&&data.bidPrice.bidpriceStatus != 0&&!data.bidPrice.resultSubmited)?'<input type="text" class="btn btn-default" id="startPrice" onchange="startPriceChange()" style="margin-right: 0;" data-price="' + (data.startPrice || '') + '" value="' + (data.startPrice || '') + '">'
						+'<span class="input-group-addon" style="display: inline;padding: 8px 12px;">元</span>':data.startPrice+'元')+ '</div>',
						'<div class="priceChangeReason" style="display:none;"><label style="padding:10px;width:180px;text-align:right;">竞价起始价修改原因：</label>',
						'<div style="display: inline-block;width: calc(100% - 180px);">',
						'<input type="text" class="form-control" id="startPriceChangeReason" value="' + (data.bidPrice && data.bidPrice.startPriceChangeReason || '') + '"></div></div>',
						'<div><label style="padding:10px;width:180px;text-align:right;">竞价开始时间：</label>',
						(!data.bidPrice||(data.bidPrice&&data.bidPrice.bidpriceStatus != 0&&!data.bidPrice.resultSubmited)?'<input type="text" autocomplete="off" id="bidpriceStartTime" class="btn btn-default ageinTime" value="' + (data.bidpriceStartTime || '') + '"><label style="color:red">注：竞价开始时间可为空，当为空时，启动竞价时间即为竞价开始时间.</label></div>':data.bidPrice.bidpriceStartTime),
						'</div>',
						function () {
							let table = $('<table class="table table-bordered" id="supplierJoinInfo"></table>');
							table.bootstrapTable({
								pagination: false,
								undefinedText: "",
								height: auto,
								data: data.bidPriceSuppliers,
								columns: [{
									title: '序号',
									width: '50px',
									align: 'center',
									formatter: function (value, row, index) {
										return index + 1;
									}
								}, {
									field: 'supplierName',
									title: '供应商名称',
									align: 'center'
								}, {
									field: 'priceTotal',
									title: '报价总价',
									align: 'right'
								},{
									field: 'joinBidprice',
									title: '参与竞价',
									width: '50px',
									align: 'center',
									formatter: function (value, row, index) {
										if(!data.bidPrice){
											return '<input type="checkbox" data-price='+ row.priceTotal +' data-supplier="'+ row.supplierId +'" ' + 
											((value == null || value == 1) && ' checked' || '') +
											(data.bidStartPriceFrom == 0 && ' onclick="reloadStartPrice()"' || '') + '>';
										}else{
											if(data.bidPrice.bidpriceStatus != 0&&!data.bidPrice.resultSubmited){
												return '<input type="checkbox" data-price='+ row.priceTotal +' data-supplier="'+ row.supplierId +'" ' + 
												((value == null || value == 1) && ' checked' || '') +
												(data.bidStartPriceFrom == 0 && ' onclick="reloadStartPrice()"' || '') + '>';
											}else{
												return value?'参与':'不参与'
											}
											
										}
										
									}
								}, {
									field: 'notJoinReason',
									title: '原因',
									formatter: function (value, row, index) {
										if(!data.bidPrice){
											return !!value || ('<input type="text" class="reason form-control" value="' + (value || '') + '">');
										}else{
											if(data.bidPrice.bidpriceStatus != 0&&!data.bidPrice.resultSubmited){
												return  ('<input type="text" class="reason form-control" value="' + (value || '') + '">');
											}else{
												return value
											}
											
										}
										
									}
								}]
							});
							return table.prop("outerHTML");
						}(),
						'<hr style="margin-top:0;">',
						'<div style="margin-bottom:10px;text-align:center;">',
						!data.bidPrice && '<button class="btn btn-primary" data-name="启动竞价" onclick="startBidPrice(this)">启动竞价</button>' || 
						(data.bidPrice.bidpriceStatus == 0 && '<button id="toSee" class="btn btn-primary" data-time="'+ data.bidPrice.bidpriceStartTime +'" onclick="toSee('+data.bidPrice.bidpriceTimes+')">查看竞价情况</button>' || 
						(!data.bidPrice.resultSubmited?'<button class="btn btn-primary" data-name="重新启动竞价" id="startBidPrice" onclick="startBidPrice(this)">重新启动竞价</button>':'')+'<button class="btn btn-primary" onclick="toSeeHistory('+data.bidPrice.bidpriceTimes+')">查看竞价记录</button>'),
						'</div>',
						'</div>',
						function () {
							if (data.bidPrice) {
								return ['<div class="panel panel-info">',
									'<div class="panel-heading">',
									'<h3 class="panel-title" style="padding: 10px 0 10px 10px;">',
									'竞价结果',
									'</h3>',
									'</div>',
									function () {
										if (!data.bidPrice.bidpriceStatus) {
											return '<div class="panel-body">竞价中，请耐心等候......</div>';
										} else if (data.bidPrice.bidpriceStatus == 1) {
											let table = $('<table class="table table-bordered"></table>');
											table.bootstrapTable({
												pagination: false,
												undefinedText: "",
												height: auto,
												data: data.bidPriceResults.sort(function (a,b){ return a.bidpriceRank-b.bidpriceRank; }),
												columns: [{
													field: 'bidpriceRank',
													title: '竞价排名',
													width: '80px',
													align: 'center'
												}, {
													field: 'supplierName',
													title: '供应商名称',
													align: 'center'
												}, {
													field: 'priceTotal',
													title: '报价总价',
													align: 'center'
												}, {
													field: 'bidpriceAmount',
													title: '竞价报价',
													align: 'right'
												}, {
													field: 'bidpriceNum',
													title: '竞价报价次数',
													align: 'center'
												}]
											});
											return table.prop("outerHTML")+'<hr style="margin-top:0;">'
											+(!data.bidPrice.resultSubmited&& '<div id="submitResult" style="margin-bottom:10px;text-align:center;"><button class="btn btn-primary" onclick="submitResult()">提交竞价结果</button></div>'|| '');
										} else if (data.bidPrice.bidpriceStatus == 2) {
											return '<div class="panel-body">竞价已流标，原因：' + data.failReason + '</div>';
										}else{
											return '';
										}
									}()
								].join('');
							}
							return '';
						}()
					].join(''));
					data.bidStartPriceFrom == 0 && reloadStartPrice();
					//竞价开始时间
					$('#bidpriceStartTime').datetimepicker({
						step:5,
						lang:'ch',
						format: 'Y-m-d H:i',		
						onShow:function(){
							var nowSysDate=top.$("#systemTime").html()+" "+top.$("#sysTime").html();
							$('#bidpriceStartTime').datetimepicker({						
								minDate:NewDateT(nowSysDate)
							})
						},		
					});
					
				} else {
					lwsorce = data.lowerScore;
					if (data.suppliers.length > 0) {
						offerFileData = data.offerFileList;
						packageCheckItems = data.packageCheckItems;
						suppliers = data.suppliers;
						checkItemInfos = data.checkItemInfos;
						var detaildiv = "<div>";
						var detaildivcenter = "";
						//评审方法&汇总方式
						switch (packageCheckList.checkType) {
							case 0:
								detaildivcenter += "<div><span style='color:red'>评审方法：合格制   " + (packageData.shadowMark == 1 ? (data[_index].isShadowMark == 1 ? "暗标" : "明标") : '') + "</br>";
								detaildivcenter += "汇总方式： 评委全体成员按照少数服从多数（" + (data.totalM || "二") + "分之" + (data.totalN || "一") + "）的原则判定评价标准是否合格。</br>1、若评审项为关键要求，任何一项不合格都将淘汰。</br>2、若评审项为一般要求，任何一项或多项不合格不影响评审结果，不做淘汰处理。</span>"
								detaildivcenter += "</div>";

								break;
							case 1:
								detaildivcenter += "<div><span style='color:red'>评审方法：评分制  权重值：" + packageCheckList.weight + (packageData.shadowMark == 1 ? (data[_index].isShadowMark == 1 ? "暗标" : "明标") : '') + "</br>";
								//if(packageCheckList.totalType == '0') {
								//if(packageData.projectCheckers[0].checkerCount >= packageCheckList.totalType){
								if (packageCheckList.totalType == 0) {
									detaildivcenter += "汇总方式： 评委全部的评分去掉一个最高分和最低分后计算出平均得分，即为供应商评审因素最后得分</span></div>";
								} else {
									detaildivcenter += "汇总方式： 评委全体成员评分计算出平均得分，即为供应商评审因素最后得分</span></div>";
								}
								break;
							case 2:
								detaildivcenter += "<div><span style='color:red'>评审方法：偏离制" + (packageData.shadowMark == 1 ? (data[_index].isShadowMark == 1 ? "暗标" : "明标") : '') + "</br>";
								detaildivcenter += "<span style='color:red'>该评审项允许最大偏离项数：" + (data.deviate || "") + '&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp';
								detaildivcenter += "<span style='color:red'>是否计入总数：" + (data.isSetTotal == 0 ? "计入总数" : "不计入总数") + '&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp';
								if (data.isSetTotal == 0) {
									detaildivcenter += "<span style='color:red'>是否加价：" + (data.isAddPrice == 0 ? "加价" : "不加价") + '&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp';
								}
								if (data.isAddPrice == 0) {
									detaildivcenter += "<span style='color:red'>偏离加价幅度：" + (data.addPrice || "") + "%</br>";
								}
								detaildivcenter += "汇总方式： 评委全体成员按照少数服从多数（" + (data.totalM || "二") + "分之" + (data.totalN || "一") + "）的原则判定评价标准是否合格。</br>1、若评审项为关键要求，任何一项偏离都将淘汰。</br>2、未勾选的评价项为一般要求，对这些一般要求的任何一项向下偏离将导致供应商报价上浮（采购文件中特别注明的条款，其报价的浮动按具体要求执行 ）</span></div>";
								break;
							case 3:
								detaildivcenter += "<div><span style='color:red'>评审方法：评分合格制" + (packageData.shadowMark == 1 ? (data[_index].isShadowMark == 1 ? "暗标" : "明标") : '') + "</br>";
								//if(packageCheckList.totalType == '0') {
								//if(packageData.projectCheckers[0].checkerCount >= packageCheckList.totalType){	
								if (packageCheckList.totalType == 0) {
									detaildivcenter += "汇总方式： 评委全部的评分去掉一个最高分和最低分后计算出平均得分，即为供应商评审因素最后得分";
								} else {
									detaildivcenter += "汇总方式： 评委全体成员评分计算出平均得分，即为供应商评审因素最后得分";
								}
								detaildivcenter += "</br>当最终得分低于" + (data.lowerScore || "") + "分时，供应商被淘汰";
								detaildivcenter += "</span></div>"
								break;
						}
						detaildiv += detaildivcenter;
						detaildiv += "<table id='TabContent_" + packageCheckList.id + "' class='tab-content table table-bordered'>";
						//					detaildiv += detaildivcenter;
						detaildiv += "</table>";

						detaildiv += "<div id='TabCehckItemInfo_" + packageCheckList.id + "'></div>";
						$("#" + packageCheckList.id).html(detaildiv);
						if (suppliers.length >= 15) {
							var auto = parent.$("#PackageInfo").height() - 300
						} else {
							var auto = 'auto'
						}
						$("#TabContent_" + packageCheckList.id).bootstrapTable({
							pagination: false,
							undefinedText: "",
							height: auto,
							data: suppliers,
							columns: [{
								title: '序号',
								width: '50px',
								cellStyle: {
									css: {
										"text-align": "center"
									}
								},
								formatter: function (value, row, index) {
									return index + 1;
								}
							}, {
								field: 'enterpriseName',
								title: '供应商'
							}, {
								field: 'deviateNum',
								title: packageCheckList.checkType == 2 ? '偏离项数' : '不合格关键项数',
							}, {
								field: 'isKeyScore',
								title: ((packageCheckList.checkType == 1 || packageCheckList.checkType == 3) ? '分值合计' : '是否合格'),
								formatter: function (value, row, index) {
									var detaildivcenter = "";
									if (packageCheckList.checkType == 1 || packageCheckList.checkType == 3) {
										detaildivcenter = row.score
									} else {
										if (row.isKey == 0) {
											detaildivcenter = "合格"
										} else {
											detaildivcenter = "不合格"
										}
									}
									return detaildivcenter
								}

							},
							{
								field: 'isOut',
								title: '是否合格',
								formatter: function (value, row, index) {
									var detaildivcenter = "";
									detaildivcenter = row.score
									if (row.isKey == 0) {
										detaildivcenter = "合格"
									} else {
										detaildivcenter = "不合格"
									}

									return detaildivcenter
								}

							},
							{
								field: 'supplierId',
								title: '评审文件',
								formatter: function (value, row, index) {
									var str = "";
									if (data.offerFileList.length > 0) {
										for (var h = 0; h < data.offerFileList.length; h++) {
											str = "";
											if (data.offerFileList[h].id == packageCheckList.id && data.offerFileList[h].supplierId == value) {
												str = data.offerFileList[h].fileName;
												break;
											} else {
												str = "无上传评审文件信息";
												//break;
											}
										}
									} else {
										str += "无上传评审文件信息";
									}
									return str
								}
							}, {
								field: 'supplierId',
								title: '操作',
								width: '50px',
								formatter: function (value, row, index) {
									var str = "";
									if (data.offerFileList.length > 0) {
										for (var h = 0; h < data.offerFileList.length; h++) {
											str = "";
											if (data.offerFileList[h].id == packageCheckList.id && data.offerFileList[h].supplierId == value) {
												str += "<a href='javascript:void(0)' onclick=downloadFile(" + h + ") class='btn-sm btn-primary download' style='text-decoration:none;'><span class='glyphicon glyphicon-arrow-down' aria-hidden='true'></span>下载</a>";
												break;
											} else {

											}
										}
									}
									return str
								}
							}
							]
						});
						// $("#TabContent_" + packageCheckList.id).bootstrapTable("load", suppliers); //重载数据
						$(".fixed-table-container").css('padding-bottom', '0')
						if (packageCheckList.checkType == 2 || packageCheckList.checkType == 0) {
							$("#TabContent_" + packageCheckList.id).bootstrapTable("showColumn", 'deviateNum'); //隐藏评审标准  
						} else {
							$("#TabContent_" + packageCheckList.id).bootstrapTable("hideColumn", 'deviateNum'); //隐藏评审标准  
						}
						if (packageCheckList.checkType == 3) {
							$("#TabContent_" + packageCheckList.id).bootstrapTable("showColumn", 'isOut'); //隐藏评审标准  
						} else {
							$("#TabContent_" + packageCheckList.id).bootstrapTable("hideColumn", 'isOut'); //隐藏评审标准  
						}

						//不合格/偏离  原因列表
						if (packageCheckList.checkType == 0 || packageCheckList.checkType == 2) {
							if (data.experts && data.checkItemInfoMaps) {
								for (var h = 0; h < data.experts.length; h++) {
									checkItemsList(data.experts, data.checkItemInfoMaps, packageCheckList.id, packageCheckList.checkType);
								}
							}
						}

					} else {
						top.layer.alert("温馨提示：所有报价供应商已全部淘汰！");
						$("#myTab li").removeClass('active');
						$("li[value='#progress']").addClass('active');
						$("#myTabContent div").removeClass('show');
						$("#progress").addClass("show");
						return;
					}
				}
			} else {
				top.layer.alert(data.message || "温馨提示：请在所有评委评审完成后查看此页！");
				$("#myTab li").removeClass('active');
				$("li[value='#progress']").addClass('active');
				$("#myTabContent div").removeClass('show');
				$("#progress").addClass("show");
				return;
			}
		}
	});

}

function toSee(biddingTimes){
	var  biddingtimedata=$("#toSee").data('time');
	var nowSysDate=top.$("#systemTime").html()+" "+top.$("#sysTime").html();//当前系统时间
	if(NewDatefp(biddingtimedata)>NewDatefp(nowSysDate)){
		parent.layer.alert('温馨提示：竞价未开始');													
	}else{
		parent.layer.open({
			type: 2 //此处以iframe举例
			,title: '评审竞价情况'
			,area: ['1100px', '600px']
			,maxmin: true//开启最大化最小化按钮
			,content:'Auction/AuctionOffer/Agent/AuctionProjectPackage/model/OfferViewInfo.html?packageId='+packageId+'&biddingTimes='+biddingTimes
			,success:function(layero,index){    
				var iframeWind=layero.find('iframe')[0].contentWindow;       
			}
		});
	}
	
}
function toSeeHistory(biddingTimes){
	parent.layer.open({
		type: 2 //此处以iframe举例
		,title: '评审竞价历史记录'
		,area: ['1100px', '600px']
		,maxmin: true//开启最大化最小化按钮
		,content:'Auction/AuctionOffer/Agent/AuctionProjectPackage/model/OfferHistoryInfo.html?packageId='+packageId+'&biddingTimes='+biddingTimes
		,success:function(layero,index){    
			var iframeWind=layero.find('iframe')[0].contentWindow;       
		}
	});
}
//评委评审 不合格/偏离 原因表
function checkItemsList(expertList, cItems, pCheckListId, chType) {
	var strHtml = "</br>";
	strHtml += "<div>评委评审" + (chType == 0 ? "不合格" : "偏离") + "原因</div>";
	strHtml += "<div style='float: left;width:10%' class='checkItemReason'>";
	strHtml += "<ul id='checkInfoul_" + (pCheckListId) + "'style='padding-left:0px'>";
	for (var i = 0; i < expertList.length; i++) {
		strHtml += "<li id='checkInfoli_" + (pCheckListId + expertList[i].id) + "' style='list-style: none;' class=" + (i == 0 ? "infoClass" : "") + "><a href='javascript:void(0)' onclick='clickCheckItemRes(\"" + pCheckListId + "\",\"" + expertList[i].id + "\")' >" + expertList[i].expertName + "</a></li>";
	}
	strHtml += "</ul>";
	strHtml += "</div>";

	strHtml += "<div style='float: left;;width:90%'>";

	for (var i = 0; i < expertList.length; i++) {
		var infoMap = cItems[expertList[i].id];

		strHtml += "<table id='checkInfo_" + (pCheckListId + expertList[i].id) + "' class='table table-bordered checkInfoTable' width='680px' style='display:none'>";
		strHtml += "<tr>";
		strHtml += "<td width='150px'>供应商名称</td>";
		strHtml += "<td width='180px'>评审内容</td>";
		strHtml += "<td width='80px'>是否关键项</td>";
		strHtml += "<td>" + (chType == 0 ? "不合格" : "偏离") + "原因</td>";
		strHtml += "</tr>";
		for (var sup in infoMap) {
			var infoList = infoMap[sup];

			if (infoList != null && infoList.length > 0) {
				strHtml += "<tr>";

				strHtml += "<td rowspan='" + (infoList.length > 1 ? infoList.length : "") + "'>" + sup + "</td>";
				strHtml += "<td >" + infoList[0].checkTitle + "</td>";
				strHtml += "<td style='text-align:center'>" + (infoList[0].isKey == 0 ? "是" : "否") + "</td>";
				strHtml += "<td >" + infoList[0].reason || '' + "</td>";
				strHtml += "</tr>";

				if (infoList.length > 1) {

					for (var x = 1; x < infoList.length; x++) {
						strHtml += "<tr>";
						strHtml += "<td >" + infoList[x].checkTitle + "</td>";
						strHtml += "<td style='text-align:center'>" + (infoList[x].isKey == 0 ? "是" : "否") + "</td>";
						strHtml += "<td >" + infoList[x].reason || '' + "</td>";
						strHtml += "</tr>";
					}
				}

			} else {
				strHtml += "<tr>";
				strHtml += "<td >" + sup + "</td>";
				strHtml += "<td colspan='3'></td>";
				strHtml += "</tr>";
			}

			//console.info(sup+":"+infoMap[sup]);
		}
		strHtml += "</table>";

	}

	strHtml += "</div>";

	$("#TabCehckItemInfo_" + pCheckListId).html(strHtml);

	//默认显示第一个table
	$("#checkInfo_" + (pCheckListId + expertList[0].id) + "").show();
}

//评委评审 不合格/偏离 原因  切换评委点击事件
function clickCheckItemRes(pCheckId, expId) {
	$("#checkInfoul_" + pCheckId + " li").removeClass('infoClass');
	$("#checkInfoli_" + (pCheckId + expId) + "").addClass("infoClass");
	$(".checkInfoTable").hide();
	$("#checkInfo_" + (pCheckId + expId) + "").show();
}


function offerData(name) {
	$.ajax({
		type: "post",
		url: url + "/ProjectReviewController/getProjectSupplierOffer.do",
		data: {
			projectId: ProjectData.projectId,
			packageId: packageId,
			roleType: 0
		},
		async: false,
		success: function (data) {
			if (data.success) {
				if (name == "PackageOffer") {
					PackageOffer(data.data.offers); //供应商报价
					offerDetaileds(data.data.offerDetaileds); //报价详情
					packageDetaileds(data.data); //询比采购清单
				} else if (name == "PriceFile") {
					file(data.data.purFiles); //报价文件

					fileEnterprise(data.data); //报价供应商
				} else if (name == 'subentry') {
					subentrys(data.data.purOfferFiles)
				}

			}
		},
		error: function (err) {

		}
	});
}
//评审进度管理
function ProjectCheckState(packageData) {
	var packageCheckStates = packageData.packageCheckStates; //评委评审进度
	var packageCheckLists = packageData.packageCheckLists; //评审项目
	var projectCheckerItems = packageData.projectCheckerItems; //评委
	//表头
	var titletr = "<table class='table table-bordered'><tr>"
	titletr += "<th style='width:50px'>序号</th>"
	titletr += "<th>评委</th>"
	for (var x = 0; x < packageCheckLists.length; x++) {
		if (packageData.doubleEnvelope == 1) {
			titletr += "<th>" + packageCheckLists[x].checkName + (packageCheckLists[x].envelopeLevel == 1 ? '（第一封）' : '（第二封）') + "</th>";
		} else {
			titletr += "<th>" + packageCheckLists[x].checkName + "</th>";
		}

	}
	titletr += "<th>价格评审</th>"
	titletr += "<th>评审记录汇总</th>"
	titletr += "<th>评审报告</th>"
	titletr += "<th>审核</th>"
	titletr += "</tr>"
	//数据行
	if (projectCheckerItems.length > 0) {
		for (var x = 0; x < projectCheckerItems.length; x++) { //循环每个评委
			var tr = "<tr>";
			tr += "<td>" + (x + 1) + "</td>";
			tr += "<td>" + projectCheckerItems[x].checkerEmployeeName + "</td>"
			for (var i = 0; i < packageCheckLists.length; i++) { //循环评审项目
				var checkState = ""; //评审结果
				var _i,_j;
				for (var j = 0; j < packageCheckStates.length; j++) { //循环评审进度
					if(packageCheckLists[i].checkType!=4){
						//找到评审记录里面评委id和评审项对应的数据行
						if (projectCheckerItems[x].checkerEmployeeId == packageCheckStates[j].checkerEmployeeId && packageCheckLists[i].id == packageCheckStates[j].packageCheckListId) {
							checkState = !packageCheckStates[j].checkState ? "" : packageCheckStates[j].checkState;
						}
					}else{
						if(packageCheckLists[i].id == packageCheckStates[j].packageCheckListId){
							checkState = !packageCheckStates[j].checkState ? "" : packageCheckStates[j].checkState;
							_i=i;_j=j
						}
					}	
				}
				if(packageCheckLists[i].checkType!=4){
					//找到评审记录里面评委id和评审项对应的数据行
					if (checkState.length > 0) {
						tr += "<td><span style='color:green'>" + checkState + "</span></td>";
					} else {
						tr += "<td><span style='color:red'>未完成</span></td>";
					}
				}else{
					if(x==0){
						var rowspan = projectCheckerItems.length;
						if (checkState.length > 0) {
							tr += "<td rowspan='" + rowspan + "'><span style='color:green'>" + checkState + "</span></td>";
						} else {
							tr += "<td rowspan='" + rowspan + "'><span style='color:red'>未完成</span></td>";
						}
					}
					
				}
				
			}
			if (x == 0) {
				var rowspan = projectCheckerItems.length;
				if (packageData.priceCheck == "已完成") {
					tr += "<td rowspan='" + rowspan + "'><span style='color:green'>" + packageData.priceCheck + "</span></td>";
				} else {
					tr += "<td rowspan='" + rowspan + "'><span style='color:red'>" + packageData.priceCheck + "</span></td>";
				}
				if (packageData.checkItem == "已完成") {
					tr += "<td rowspan='" + rowspan + "'><span style='color:green'>" + packageData.checkItem + "</span></td>";
				} else {
					tr += "<td rowspan='" + rowspan + "'><span style='color:red'>" + packageData.checkItem + "</span></td>";
				}
				if (packageData.checkReport == "已完成") {
					tr += "<td rowspan='" + rowspan + "'><span style='color:green'>" + packageData.checkReport + "</span></td>";
				} else {
					tr += "<td rowspan='" + rowspan + "'><span style='color:red'>" + packageData.checkReport + "</span></td>";
				}
				if (packageData.checkResult == "已完成") {
					tr += "<td rowspan='" + rowspan + "'><span style='color:green'>" + packageData.checkResult + "</span></td>";
				} else {
					tr += "<td rowspan='" + rowspan + "'><span style='color:red'>" + packageData.checkResult + "</span></td>";
				}
			}
			tr += "</tr>";
			titletr += tr;
		}
	} else {
		titletr += "<tr><td colspan='" + (packageCheckLists.length + 6) + "'>没有找到匹配的记录</td></tr>";
	}
	//回退按钮
	if (projectCheckerItems.length > 0) {
		var isbackType = 0; //0不可退回  1可回退 2流标
		if (packageData.isStopCheck != 1 && (packageData.stopCheckReason == "" || packageData.stopCheckReason == undefined) && packageData.checkResult != "已完成" && createType != 1) {
			isbackType = 1;
		}

		if (packageData.isStopCheck == 1 && packageData.checkResult != "已完成" && createType != 1) {
			isbackType = 2;
		}
		if (isbackType == 1 || isbackType == 2) {
			titletr += "<tr class='btntr'>";
			titletr += "<td colspan='2'></td>";
			
			for (var x = 0; x < packageCheckLists.length; x++) {
				var isCheckState=false;
				for (var i = 0; i < packageCheckStates.length; i++) {
					if (packageCheckStates[i].packageCheckListId == packageCheckLists[x].id) {
						if (packageCheckStates[i].checkState == "已完成"){
							isCheckState=true;
						}
					}
				}
				titletr += "<td>"
				if (isCheckState) {
					titletr += (isbackType == 2 ? "" : "<a style='text-decoration: none;' class='btn btn-primary btn-sm openBreak' onclick='openBreak(\"" + packageCheckLists[x].id + "\",\"" + packageCheckLists[x].checkName + "\")'>退回到此阶段</a>");
				}
				titletr += "</td>"	
			}
			titletr += "<td>"
			if(packageData.priceCheck == "已完成"){
				titletr +=(isbackType == 2 ? "" : "<a style='text-decoration: none;' class='btn btn-primary btn-sm openBreak' onclick='openBreak(\"price\",\"价格评审\")'>退回到此阶段</a>")
			}		
			titletr += "</td>";
			titletr += "<td>"
			if(packageData.checkItem == "已完成"){
				titletr +="<a style='text-decoration: none;' class='btn btn-primary btn-sm openBreak' onclick='openBreak(\"item\",\"评审记录汇总\")'>退回到此阶段</a>"
			}
			titletr +="</td>";
			titletr += "<td>"
			if(packageData.checkReport == "已完成"){
				titletr +="<a style='text-decoration: none;' class='btn btn-primary btn-sm openBreak' onclick='openBreak(\"report\",\"评审报告\")'>退回到此阶段</a>"
			}
			titletr +="</td>";
			titletr += "<td>"
			if(packageData.checkResult == "已完成"){
				titletr +="<a style='text-decoration: none;' class='btn btn-primary btn-sm openBreak' onclick='openBreak(\"result\",\"报告审核\")'>退回到此阶段</a>"
			}
			titletr +="</td>";
			titletr += "</tr>";
		}

	}

	$("#ProjectCheckStateDiv").html(titletr + "</table>");
};

//加载项目回退记录
function BindCheckStateRestor(data) {

	data = data.projectCheckBacks;
	if (data.length > 0) {
		$(".ProjectCheckStateRestore").show();
		$("#ProjectCheckStateRestoreTalbe").bootstrapTable({
			data: data,
			columns: [{
				title: '序号',
				width: '50px',
				cellStyle: {
					css: {
						"text-align": "center"
					}
				},
				formatter: function (value, row, index) {
					return index + 1;
				}
			}, {
				field: 'backName',
				title: '恢复评审项'
			},
			{
				field: 'remark',
				title: '操作备注'
			},
			{
				field: 'employeeName',
				title: '操作人'
			}, {
				field: 'subDate',
				title: '操作时间'
			}
			]
		});
	}

}

var businessId = "";
//退回到此阶段按钮
function openBreak(backId, backName) {
	if (packageData.checkResult == "已完成") {
		return top.layer.alert("已提交审核，无法回退");
	}
	if (backId.length > 6) {
		var a = 0;
		for (var i = 0; i < packageData.packageCheckStates.length; i++) {
			if (packageData.packageCheckStates[i].packageCheckListId == backId) {
				if (packageData.packageCheckStates[i].checkState == "已完成")
					a++;
				break;
			}
		}
		if (a < 1) {
			return top.layer.alert("无需回退");
		}
	} else {
		switch (backId) {
			case "price":
				if (packageData.priceCheck == "未完成") {
					return top.layer.alert("无需回退");
				}
				break;
			case "item":
				if (packageData.checkItem == "未完成") {
					return top.layer.alert("无需回退");
				}
				break;
			case "report":
				if (packageData.checkReport == "未完成") {
					return top.layer.alert("无需回退");
				}
				break;
			case "result":
				if (packageData.checkResult == "未完成") {
					return top.layer.alert("无需回退");
				}
				break;
		}
	}
	
	businessId = "";
	breakProjectCheckMsg(backId, backName);

	businessId = "";
	breakProjectCheckMsg(backId, backName);
};

//验证是否可以退回评审报告
function breakProjectCheckMsg(backId, backName) {
	$.ajax({ //验证评审报告是否可以退回
		type: "get",
		url: url + "/ProjectCheckBackController/checkBackMessage.do",
		data: {
			projectId: packageData.projectId,
			packageId: packageData.packageId,
			examType: 1
		},
		async: false,
		success: function (res) {
			if (res.success) {
				var reslut = res.data;
				switch (reslut['strKey']) {
					case '801':
						businessId = reslut['strMessage'];
						//parent.layer.alert();
						break;
					default:
						break;
				}
			}
		},
		error: function (err) {
			parent.layer.alert("退回失败");
		}
	});

	if (businessId != "") {
		parent.layer.confirm('温馨提示：当前项目已经生成评审报告并且评审报告正在审核中，确认退回？', {
			btn: ['确定', '取消']
		}, function (index1, layero) {
			breakProject(backId, backName);
			parent.layer.close(index1);
		}, function (index2, layero) {
			parent.layer.close(index2);
		});
	} else {
		breakProject(backId, backName);
	}
}

//退回原因
function breakProject(backId, backName) {

	parent.layer.prompt({
		title: '请输入回退原因',
		formType: 2
	}, function (text, index) {
		saveBreak(backId, backName, text);
		parent.layer.close(index);
	});
}

//保存退信信息
function saveBreak(backId, backName, backRemark) {
	if (backRemark != "") {
		$.ajax({ //请求插入回退历史记录
			type: "get",
			url: url + "/ProjectCheckBackController/insertProjectCheckBack.do",
			data: {
				projectId: packageData.projectId,
				packageId: packageData.packageId,
				backName: backName,
				backId: backId,
				remark: backRemark,
				examType: 1,
				businessId: businessId
			},
			async: false,
			success: function (data) {
				if (data.success) {
					parent.layer.close(parent.layer.index);
					window.location.reload();
					parent.layer.alert("退回成功");
				} else {
					parent.layer.alert(data.message);
				}
			},
			error: function (err) {
				parent.layer.alert("退回失败");
			}
		});
	} else {
		parent.layer.alert("请输入退回原因");
	}
}

//清单报价
function PackageOffer(offers) {
	$("#PackageOfferTable").bootstrapTable({
		data: offers,
		columns: [{
			title: '序号',
			width: '50px',
			cellStyle: {
				css: {
					"text-align": "center"
				}
			},
			formatter: function (value, row, index) {
				return index + 1;
			}
		}, {
			field: 'enterpriseName',
			title: '供应商'
		},
		{
			field: 'saleTaxTotal',
			title: '最终报价',
		},
		{
			field: 'legalPerson',
			title: '法人/被授权人'
		},
		{
			field: 'linkTel',
			title: '联系方式'
		}
		]
	});
};

//包件详情
function packageDetaileds(packageDatas) {
	var packageDetaileds = packageDatas.packageDetaileds;
	$("#packageDetailedsTable").bootstrapTable({
		data: packageDetaileds,
		clickToSelect: true,
		onClickRow: function (row) {
			var offerDetaileds = packageDatas.offerDetaileds; //询比采购报价详情
			var newofferDetaileds = new Array();
			for (x in offerDetaileds) {
				if (offerDetaileds[x].packageDetailedId == row.id)
					newofferDetaileds.push(offerDetaileds[x]);
			}
			$('#offerDetailedsTable').bootstrapTable('load', newofferDetaileds);
		},
		onCheck: function (row) {
			var offerDetaileds = packageDatas.offerDetaileds; //询比采购报价详情
			var newofferDetaileds = new Array();
			for (x in offerDetaileds) {
				if (offerDetaileds[x].packageDetailedId == row.id)
					newofferDetaileds.push(offerDetaileds[x]);
			}
			$('#offerDetailedsTable').bootstrapTable('load', newofferDetaileds);
		},
		columns: [{
			radio: true,
			formatter: function (value, row, index) {
				if (index == 0) {
					var offerDetaileds = packageDatas.offerDetaileds; //询比采购报价详情
					var newofferDetaileds = new Array();
					for (x in offerDetaileds) {
						if (offerDetaileds[x].packageDetailedId == row.id)
							newofferDetaileds.push(offerDetaileds[x]);
					}
					$('#offerDetailedsTable').bootstrapTable('load', newofferDetaileds);
					return true;
				} else {
					return false
				};
			}
		},
		{
			title: '序号',
			width: '50px',
			cellStyle: {
				css: {
					"text-align": "center"
				}
			},
			formatter: function (value, row, index) {
				return index + 1;
			}
		}, {
			field: 'detailedName',
			title: '名称'
		}, {
			field: 'detailedVersion',
			title: '型号规格'
		}, {
			field: 'detailedCount',
			title: '数量'
		}, {
			field: 'detailedUnit',
			title: '单位'
		}
		]
	});
};

//清单报价详情
function offerDetaileds(data) {
	$("#offerDetailedsTable").bootstrapTable({
		cache: false,
		data: data,
		columns: [{
			field: '#',
			title: '序号',
			width: '50px',
			cellStyle: {
				css: {
					"text-align": "center"
				}
			},
			formatter: function (value, row, index) {
				return index + 1;
			}
		}, {
			field: 'enterpriseName',
			title: '供应商名称'
		},
		{
			field: 'saleTaxTotal',
			title: '最终报价',
		},

		]
	});
};

//报价文件供应商
function fileEnterprise(packageDatas) {
	var offers = packageDatas.offers
	$("#fileEnterpriseTable").bootstrapTable({
		data: offers,
		clickToSelect: true,
		onClickRow: function (row) {
			var purFiles = packageDatas.purFiles;
			var files = new Array();
			for (x in purFiles) {
				if (purFiles[x].enterpriseId == row.supplierId)
					files.push(purFiles[x]);
			}
			$('#fileTable').bootstrapTable('load', files);
		},
		onCheck: function (row) {
			var purFiles = packageDatas.purFiles;
			var files = new Array();
			for (x in purFiles) {
				if (purFiles[x].enterpriseId == row.supplierId)
					files.push(purFiles[x]);
			}
			$('#fileTable').bootstrapTable('load', files);
		},
		columns: [{
			radio: true,
			formatter: function (value, row, index) {
				if (index == 0) {
					var purFiles = packageDatas.purFiles;
					var files = new Array();
					for (x in purFiles) {
						if (purFiles[x].enterpriseId == row.supplierId)
							files.push(purFiles[x]);
					}
					$('#fileTable').bootstrapTable('load', files);
					return true;
				} else {
					return false
				};
			}
		},
		{
			field: '#',
			title: '序号',
			width: '50px',
			cellStyle: {
				css: {
					"text-align": "center"
				}
			},
			formatter: function (value, row, index) {
				return index + 1;
			}
		}, {
			field: 'enterpriseName',
			title: '报价供应商名称'
		}
		]
	});
}

//报价文件
function file(data) {
	$("#fileTable").bootstrapTable({
		data: data,
		columns: [{
			field: '#',
			title: '序号',
			width: '50px',
			cellStyle: {
				css: {
					"text-align": "center"
				}
			},
			formatter: function (value, row, index) {
				return index + 1;
			}
		}, {
			field: 'fileName',
			title: '附件名称'
		}, {
			field: 'fileSize',
			title: '附件大小',
			width: '100px',
		}, {
			field: 'caoz',
			title: '操作',
			width: '80px',
			events: {
				'click .fileDownload': function (e, value, row, index) {
					var newUrl = $.parserUrlForToken(top.config.bidhost + "/FileController/download.do?ftpPath=" + row.filePath + "&fname=" + row.fileName)
					window.location.href = newUrl;
				}
			},
			formatter: function (value, row, index) {
				return "<a style='text-decoration: none;margin-right: 5px;' class='btn btn-primary btn-sm fileDownload'>下载</a>";
			}
		}]
	});
}
//分项报价文件
function subentrys(data) {
	$("#subentryTable").bootstrapTable({
		columns: [{
			field: '#',
			title: '序号',
			width: '50px',
			cellStyle: {
				css: {
					"text-align": "center"
				}
			},
			formatter: function (value, row, index) {
				return index + 1;
			}
		}, {
			field: 'userName',
			title: '报价供应商名称'
		}, {
			field: 'fileName',
			title: '附件名称'
		}, {
			field: 'fileSize',
			title: '附件大小',
			width: '100px',
		}, {
			field: 'caoz',
			title: '操作',
			width: '80px',
			events: {
				'click .fileDownload': function (e, value, row, index) {
					var newUrl = $.parserUrlForToken(top.config.bidhost + "/FileController/download.do?ftpPath=" + row.filePath + "&fname=" + row.fileName)
					window.location.href = newUrl;
				}
			},
			formatter: function (value, row, index) {
				return "<a style='text-decoration: none;margin-right: 5px;' class='btn btn-primary btn-sm fileDownload'>下载</a>";
			}
		}]
	});
	$("#subentryTable").bootstrapTable('load', data)
}
$("#downloadAllFile").click(function () {
	var newUrl = $.parserUrlForToken(top.config.bidhost + "/ProjectReviewController/downloadAllPurFile.do?projectId=" + ProjectData.projectId + "&packageId=" + packageId + "&examType=" + "1")
	window.location.href = newUrl;
});

/*==========   价格评审    ==========*/
var priceChecks;
var businessPriceSet;
var isDeviate = 0;
function PriceCheck() {
	$.ajax({
		type: "post",
		url: url + "/ProjectReviewController/getPriceCheckInfo.do",
		data: {
			projectId: ProjectData.projectId,
			packageId: packageId,
			checkPlan: checkPlan,
			checkerCount: packageData.projectCheckers[0].checkerCount,
			packageCheckListCount: packageData.packageCheckLists.length
		},
		success: function (resle) {
			if (!resle.success) {
				top.layer.alert(resle.message);
				$("#myTab li").removeClass('active');
				$("li[value='#progress']").addClass('active');
				$("#myTabContent div").removeClass('show');
				$("#progress").addClass("show");
				return;
			}
			data = resle.data;
			businessPriceSet = data.businessPriceSet;
			priceChecks = data.priceChecks;
			var priceCheckMode=data.priceCheckMode;
			if (data.priceCheckRemark) {
				$("#priceCheckRemark").val(data.priceCheckRemark)
			}
			if (data) {
				if (data.isPriceCheck != undefined && data.isPriceCheck == 0) {
					//项目经理提交价格评审
					$("#savediv").show();
					$("#showDeviates").hide();
				} else {
					//专家评委提交价格评审
					if (data.priceCheck == "未完成") {
						parent.layer.alert("温馨提示：专家评委还未提交价格评审");
						$("#myTab li").removeClass('active');
						$("li[value='#progress']").addClass('active');
						$("#myTabContent div").removeClass('show');
						$("#progress").addClass("show");
						return;
					}
					//$("#savediv").hide();	
				}
				if (data.isStopCheck == 1) {
					parent.layer.alert("温馨提示：该包件已流标");
					$("#myTab li").removeClass('active');
					$("li[value='#progress']").addClass('active');
					$("#myTabContent div").removeClass('show');
					$("#progress").addClass("show");
					$(".PriceCheckBtn").hide();
					return;
				}
				if (data.stopCheckReason != "" && data.stopCheckReason != undefined) {
					parent.layer.alert("温馨提示：该项目评委已申请流标，无法进行价格评审");
					$("#myTab li").removeClass('active');
					$("li[value='#progress']").addClass('active');
					$("#myTabContent div").removeClass('show');
					$("#progress").addClass("show");
					$(".PriceCheckBtn").hide();
					return;
				}
				isDeviate = data.isDeviate;

				if (data.isDeviate == 0) {
					$(".isDeviate").hide();
					$("#showDeviates").hide();
				}
				//价格评审表格
				if (checkPlan == 1 || checkPlan == 3) { //最低评标价法					
					//评审规则、
					var roleObj = {
						'name': [businessPriceSet.businessName || '无', '最低有效投标价法', '基准价评分法', '最低报价为基准价法', '价格比较法'],
						'content': [businessPriceSet.businessContent || '无', '商务报价得分=商务报价分值-N*最小挡扣分</br>N=[(报价总价-最低有效投标价)/最低有效投标价]/扣分的最小档次</br>说明</br>(1)、有效报价为基准价*(1+有效报价范围)和基准价*(1-有效报价范围)之间的报价</br>(2)、当N为小数时，直接进一取整',
						(businessPriceSet.basePriceRole == 0 ? '基准价=(参与应标的有效供应商总报价/有效供应商家数)*计价比例' : '去掉一个最高有效报价和一个最低有效报价后，再按“基准价=(参与应标的有效供应商总报价/有效供应商家数)*计价比例”计算') + '</br>N=[(供应商报价-基准价)/基准价]/基准价比例</br>商务报价得分= 权重值 *（基准分-|N*扣分值|）',
							'商务报价得分=商务报价分值-N*最小挡扣分</br>N=[(供应商报价-基准价)/基准价]/扣分的最小档次</br>说明:当N为小数时，直接进一取整',
							'偏离调整=累计偏离值*参与应标的供应商总报价*上浮比例</br>调整后最终总报价=参与应标的供应商总报价+偏离调整'
						]

					}
					$("#businessName").html("评分名称：" + roleObj.name[businessPriceSet.checkType]);

					$("#businessContent").html("商务报价计算公式：" + roleObj.content[businessPriceSet.checkType]);
					if (businessPriceSet.checkType == 3) $("#businessType").html("商务报价参数：每高于基准价" + businessPriceSet.reduceLevel + "%，扣" + businessPriceSet.reduceScore + "分,基准价：供应商最低报价*计价比例" + businessPriceSet.priceProportion + "%");
					if (businessPriceSet.checkType == 1) $("#businessType").html("商务报价参数：扣分的最小档次：" + businessPriceSet.reduceLevel + "%，最小档扣分：" + businessPriceSet.reduceScore + "分，基准价" + businessPriceSet.basePrice + "元，有效报价范围（基准价上下浮动比例）±" + businessPriceSet.offerRange + "%");
					if (businessPriceSet.checkType == 2) $("#businessType").html("商务报价参数：</br>"
						+ "基准分：" + businessPriceSet.baseScore + "分,计价比例：" + businessPriceSet.priceProportion + "%</br>"
						+ '当有效报价高于基准价时，基准价比例：' + businessPriceSet.basePriceProportionHigh + "%，扣分值：" + businessPriceSet.additionReduceScore1 + '分</br>'
						+ '当有效报价低于基准价时，基准价比例：' + businessPriceSet.basePriceProportionLow + "%，扣分值：" + businessPriceSet.additionReduceScore2 + '分</br>');
					if (businessPriceSet.checkType == 4) $("#businessType").html("上浮比例(一般要求下偏离致供应商报价上浮)：" + businessPriceSet.floatProportion + "%");
					if (data.priceCheck == "已完成") {
						$("#savediv").hide();
						if (isDeviate == 1) {
							$("#showDeviates").show();
						}
					}
				} else {
					//评审规则、
					var roleObj = {
						'name': [businessPriceSet.businessName || '无', '最低有效投标价法', '基准价评分法', '最低报价为基准价法', '价格比较法', '固定比例不取整法', '固定比例取整法', '固定差值法', '直接比较法', '评价算法'],
						'content': [businessPriceSet.businessContent || '无', '商务报价得分=商务报价分值-N*最小挡扣分</br>N=[(报价总价-最低有效投标价)/最低有效投标价]/扣分的最小档次</br>说明</br>(1)、有效报价为基准价*(1+有效报价范围)和基准价*(1-有效报价范围)之间的报价</br>(2)、当N为小数时，直接进一取整',
						(businessPriceSet.basePriceRole == 0 ? '基准价=(参与应标的有效供应商报价总价/有效供应商家数)*计价比例' : '去掉一个最高有效报价和一个最低有效报价后，再按“基准价=(参与应标的有效供应商报价总价/有效供应商家数)*计价比例”计算') + '</br>N=[(供应商报价-基准价)/基准价]/基准价比例</br>商务报价得分= 权重值 *（基准分-|N*扣分值|）',
							'商务报价得分=商务报价分值-N*最小挡扣分</br>N=[(供应商报价-基准价)/基准价]/扣分的最小档次</br>说明:当N为小数时，直接进一取整',
							'偏离调整=累计偏离值*参与应标的有效供应商报价总价*上浮比例</br>调整后最终总报价=参与应标的有效供应商报价总价+偏离调整',
							'A、供应商报价高于基准价时：</br>商务报价得分=(商务报价分值-|(基准价-报价)|/基准价*100*每1%减分值)*权重</br>B、供应商报价低于基准价时：</br>商务报价得分=(商务报价分值+|(基准价-报价)|/基准价*100*每1%加分值)*权重',
							'A、供应商报价高于基准价时：</br>商务报价得分=(商务报价分值-⌊ |(基准价-报价)|/基准价*100⌋*每1%减分值)*权重</br>B、供应商报价低于基准价时：</br>商务报价得分=(商务报价分值+⌊ |(基准价-报价)|/基准价*100⌋*每1%加分值)*权重</br>注：⌊ ⌋为向下取整符号',
							'商务报价得分=(商务报价分值-(报价-基准价)/(最高报价-基准价)*最多减分)*权重',
							'商务报价得分=基准价/报价*商务报价分值*权重',
							'A、供应商报价高于基准价时：</br>商务报价得分=商务报价分值-|(基准价-报价)|/基准价*100/每百分比减分*每百分比减分值</br>B、供应商报价低于基准价时，且在加分区间内：</br>商务报价得分=商务报价分值+|(基准价-报价)|/基准价*100/每百分比加分*每百分比加分值</br>C、供应商报价低于基准价时，在加分区间外部分：</br>商务报价得分=B项得分-(|(基准价-报价)|/基准价-加分区间/100)*100/每百分比减分*每百分比减分值</p>注：每种情况计算得出的分数需再乘以权重'
						]

					}
					$("#businessName").html("评分名称：" + roleObj.name[businessPriceSet.checkType]);
					if (checkPlan == 0) {
						$("#weight").html("权重：" + businessPriceSet.weight || "");
					}
					$("#businessContent").html("商务报价计算公式：</br>" + roleObj.content[businessPriceSet.checkType]);
					if (businessPriceSet.checkType == 3) $("#businessType").html("商务报价参数：每高于基准价" + businessPriceSet.reduceLevel + "%，扣" + businessPriceSet.reduceScore + "分,基准价：供应商最低报价*计价比例" + businessPriceSet.priceProportion + "%");
					if (businessPriceSet.checkType == 1) $("#businessType").html("商务报价参数：扣分的最小档次：" + businessPriceSet.reduceLevel + "%，最小档扣分：" + businessPriceSet.reduceScore + "分，基准价" + businessPriceSet.basePrice + "元，有效报价范围（基准价上下浮动比例）±" + businessPriceSet.offerRange + "%");
					if (businessPriceSet.checkType == 2) $("#businessType").html("商务报价参数：</br>"
						+ "基准分：" + businessPriceSet.baseScore + "分，计价比例：" + businessPriceSet.priceProportion + "%</br>"
						+ '当有效报价高于基准价时，基准价比例：' + businessPriceSet.basePriceProportionHigh + "%，扣分值：" + businessPriceSet.additionReduceScore1 + '分</br>'
						+ '当有效报价低于基准价时，基准价比例：' + businessPriceSet.basePriceProportionLow + "%，扣分值：" + businessPriceSet.additionReduceScore2 + '分</br>');
					if (businessPriceSet.checkType == 4) $("#businessType").html("上浮比例(一般要求下偏离致供应商报价上浮)：" + businessPriceSet.floatProportion + "%");
					if (businessPriceSet.checkType == 5 || businessPriceSet.checkType == 6) {
						var businessTypeStr = "商务报价分值：" + businessPriceSet.baseScore + "分</br>";
						if (businessPriceSet.basePriceType == 3) {
							businessTypeStr += "基准价计算范围：手动输入基准价，";
							businessTypeStr += "基准价：" + businessPriceSet.basePrice + "</br>";
						} else {
							if (businessPriceSet.basePriceType == 1) {
								businessTypeStr += "基准价计算范围：计算价格评审环节中有效供应商的报价</br>";
							} else if (businessPriceSet.basePriceType == 2) {
								businessTypeStr += "基准价计算范围：计算所有供应商的报价</br>";
							}
							if (businessPriceSet.basePriceRole == 2) {
								businessTypeStr += "基准价计算方式：有效报价供应商家数大于N时，去掉一个最高和最低报价的算术平均值乘以计价比例=" + businessPriceSet.priceProportion + "%,有效报价供应商家数小于N（含）时，所有有效供应商报价的算术平均值乘以计价比例，N=" + businessPriceSet.supplierTotal + "</br>";
							} else if (businessPriceSet.basePriceRole == 3) {
								businessTypeStr += "基准价计算方式：有效报价的最低报价为基准价</br>";
							} else {
								businessTypeStr += "基准价计算方式：</br>";
							}
						}
						businessTypeStr += "供应商报价每高于基准价1%减" + businessPriceSet.additionReduceScore1 + "分，最多减" + businessPriceSet.maxDownScore + "分：</br>";
						businessTypeStr += "供应商报价每低于基准价1%加" + businessPriceSet.additionReduceScore2 + "分，最多加" + businessPriceSet.maxUpScore + "分：</br>";
						$("#businessType").html(businessTypeStr);
					}
					if (businessPriceSet.checkType == 7) {
						var businessTypeStr = "商务报价分值：" + businessPriceSet.baseScore + "分</br>";
						if (businessPriceSet.basePriceType == 1) {
							businessTypeStr += "基准价计算范围：计算价格评审环节中有效供应商的报价</br>";
						} else if (businessPriceSet.basePriceType == 2) {
							businessTypeStr += "基准价计算范围：计算所有供应商的报价</br>";
						} else {
							businessTypeStr += "基准价计算范围：</br>";
						}
						businessTypeStr += "基准价计算方式：有效报价的最低报价为基准价</br>";
						businessTypeStr += "减分值，最多减" + businessPriceSet.maxDownScore + "分：</br>";
						$("#businessType").html(businessTypeStr);
					}
					if (businessPriceSet.checkType == 8) {
						var businessTypeStr = "商务报价分值：" + businessPriceSet.baseScore + "分</br>";
						if (businessPriceSet.basePriceType == 1) {
							businessTypeStr += "基准价计算范围：计算价格评审环节中有效供应商的报价</br>";
						} else if (businessPriceSet.basePriceType == 2) {
							businessTypeStr += "基准价计算范围：计算所有供应商的报价</br>";
						} else {
							businessTypeStr += "基准价计算范围：</br>";
						}
						businessTypeStr += "基准价计算方式：有效报价的最低报价为基准价</br>";
						$("#businessType").html(businessTypeStr);
					}
					if (businessPriceSet.checkType == 9) {
						var businessTypeStr = "商务报价分值：" + businessPriceSet.baseScore + "分</br>";
						if (businessPriceSet.basePriceType == 3) {
							businessTypeStr += "基准价计算范围：手动输入基准价，";
							businessTypeStr += "基准价：" + businessPriceSet.basePrice + "</br>";
						} else {
							if (businessPriceSet.basePriceType == 1) {
								businessTypeStr += "基准价计算范围：计算价格评审环节中有效供应商的报价</br>";
							} else if (businessPriceSet.basePriceType == 2) {
								businessTypeStr += "基准价计算范围：计算所有供应商的报价</br>";
							}
							if (businessPriceSet.basePriceRole == 2) {
								businessTypeStr += "基准价计算方式：有效报价供应商家数大于N时，去掉一个最高和最低报价的算术平均值乘以计价比例=" + businessPriceSet.priceProportion + "%,有效报价供应商家数小于N（含）时，所有有效供应商报价的算术平均值乘以计价比例，N=" + businessPriceSet.supplierTotal + "</br>";
							} else if (businessPriceSet.basePriceRole == 3) {
								businessTypeStr += "基准价计算方式：有效报价的最低报价为基准价</br>";
							} else {
								businessTypeStr += "基准价计算方式：</br>";
							}
						}
						businessTypeStr += "供应商报价每高于基准价" + businessPriceSet.basePriceProportionHigh + "%减" + businessPriceSet.additionReduceScore1 + "分</br>";
						businessTypeStr += "供应商报价低于基准价，且在加分区间" + businessPriceSet.addScoreScope + "%内(含)，每" + businessPriceSet.basePriceProportionLow + "%加" + businessPriceSet.additionReduceScore2 + "分，最多加" + businessPriceSet.maxUpScore + "分：</br>";
						businessTypeStr += "供应商报价低于基准价，且在加分区间" + businessPriceSet.addScoreScope + "%外，超出部分每" + businessPriceSet.basePriceScale + "%减" + businessPriceSet.basePriceNumber + "分";
						$("#businessType").html(businessTypeStr);
					}
					if (data.priceCheck == "已完成") {
						$("#savediv").hide();
						if (isDeviate == 1) {
							$("#showDeviates").show();
						}
					}
				}
				var columnList = [];
				columnList.push({
					field: '#', title: '序号', width: '50px',
					formatter: function (value, row, index) {
						return index + 1;
					}
				});
				columnList.push({ field: 'enterpriseName', title: '供应商' });
				columnList.push({
					field: 'isOut', title: '淘汰', align: 'center',
					formatter: function (value, row, index) {
						return value == 0 ? "<span type='text' id='isOut_" + row.supplierId + "' value='0'>否</span>" : "<span type='text' id='isOut_" + row.supplierId + "' value='1'>是</span>";
					}
				});
				columnList.push({
					field: 'saleTaxTotal', title: '报价总价',
					formatter: function (value, row, index) {
						return "<span type='text' id='saleTaxTotal_" + row.supplierId + "' value='" + (row.saleTaxTotal || '') + "'>" + (row.saleTaxTotal || '') + "</span>";
					}
				});
				columnList.push({
					field: 'fixCount', title: '算数修正值', width: '100px',
					formatter: function (value, row, index) {
						if (data.priceCheck == "未完成") {
							if (row.isOut == 0) {
								//未淘汰
								return "<input style='width:80px;' onchange='fixCount(\"" + 'fixCount' + "\",\"" + row.supplierId + "\")'  type='text' id='fixCount_" + row.supplierId + "' value='" + 0 + "'></input>";
							} else {
								return "<input style='width:80px;display:none' type='text' id='fixCount_" + row.supplierId + "' value=''/><span>/</span>";
							}


						} else {
							return value;
						}
					}
				});
				columnList.push({
					field: 'fixFinalPrice', title: '修正后总价',
					formatter: function (value, row, index) {
						if (data.priceCheck == '未完成') {
							if (row.isOut == 0) {
								return "<span type='text' id='fixFinalPrice_" + row.supplierId + "' value='" + (row.saleTaxTotal || '') + "'>" + (row.saleTaxTotal || '') + "</span>";

							} else {
								return "<input style='width:80px;display:none' class='fixFinalPrice' type='text' id='fixFinalPrice_" + row.supplierId + "' value=''/><span>/</span>";
							}
						} else {
							return value;
						}

					}
				});
				columnList.push({
					field: 'defaultItem', title: '缺漏项加价', width: '100px',
					formatter: function (value, row, index) {
						if (data.priceCheck == "未完成") {
							if (row.isOut == 0) {
								return "<input style='width:80px;' onchange='defaultItem(\"" + row.supplierId + "\")' type='text' id='defaultItem_" + row.supplierId + "' value='" + 0 + "'></input>";
							} else {
								return "<input style='width:80px;display:none' type='text' id='defaultItem_" + row.supplierId + "' value=''/><span>/</span>";

							}
						} else {
							return value;
						}
					}
				});
				if (checkPlan == 1) {
					columnList.push({
						field: 'deviateNum', title: '计入总数偏离项数',
						formatter: function (value, row, index) {
							if (data.priceCheck == '未完成') {
								if (row.isOut == 0) {
									return "<span type='text' id='deviateNum_" + row.supplierId + "' value='" + (row.deviateNum || '0') + "'>" + (row.deviateNum || '0') + "</span>";

								} else {
									return "<span style='width:80px;display:none' type='text' id='deviateNum_" + row.supplierId + "' value='" + (row.deviateNum || '0') + "'>" + (row.deviateNum || '0') + "</span><span>/</span>";
								}
							} else {
								return value;
							}

						}
					});
				}
				if (checkPlan == 1 || checkPlan == 3) {
					columnList.push({
						field: 'deviatePrice', title: '偏离加价',
						formatter: function (value, row, index) {
							if (data.priceCheck == "未完成") {
								if (businessPriceSet.checkType == 0) {
									if (row.isOut == 0) {
										return "<input type='text' id='deviatePrice_" + row.supplierId + "' onchange='fixCount(\"" + 'deviatePrice' + "\",\"" + row.supplierId + "\")' value='0'></input>";
									} else {
										return "<input type='hidden' id='deviatePrice_" + row.supplierId + "' value=''></input><span>/</span>";
									}
								} else {
									if (row.isOut == 0) {
										return "<span type='text' id='deviatePrice_" + row.supplierId + "' value='" + (row.deviatePrice || 0) + "'>" + (row.deviatePrice || 0) + "</span>";
									} else {
										return "<span type='text' id='deviatePrice_" + row.supplierId + "' value=''>/</span>";
									}
								}
							} else {
								return value;
							}
						}
					});
				}
				columnList.push({
					field: 'totalCheck', title: '评审总价', width: '180px',
					formatter: function (value, row, index) {
						if (data.priceCheck == "未完成") {
							if(businessPriceSet.checkType == 0) {
								if (row.isOut == 0) {
									return "<input type='text' onchange='fixCount(\"" + 'totalCheck' + "\",\"" + row.supplierId + "\")' id='totalCheck_" + row.supplierId + "' value='" + (row.saleTaxTotal || '') + "'></input>";
								} else {
									return "<input type='hidden' id='totalCheck_" + row.supplierId + "' value=''></input><span>/</span>";
								}
							}else{
								if(row.isOut == 0){
									return "<span type='text' id='totalCheck_" + row.supplierId + "' value='" + (value || row.saleTaxTotal) + "'>" + (value || row.saleTaxTotal) + "</span>";
								}else{
									
									return "<span type='text' id='totalCheck_" + row.supplierId + "' value=''>/</span>";
								}	
							}
							
						} else {
							return value;
						}
					}
				});
				if (checkPlan != 1 && checkPlan != 3) {
					columnList.push({
						field: 'score', title: '商务报价得分', width: '150px',
						formatter: function (value, row, index) {
							if (data.priceCheck == "未完成") {
								if (businessPriceSet.checkType == 0) {
									if (row.isOut == 0) {
										return "<input type='text' id='score_" + row.supplierId + "' value='" + (row.score || '') + "'></input>";
									} else {
										return "<input style='display:none' type='text' id='score_" + row.supplierId + "' value=''></input><span>/</span>";
									}

								} else {
									if (row.isOut == 0) {
										return "<span type='text' id='score_" + row.supplierId + "' value='" + (row.score || '') + "'>" + (row.score || '') + "</span>";
									} else {
										return "<input style='display:none' type='text' id='score_" + row.supplierId + "' value=''></input><span>/</span>";
									}


								}
							} else {
								return value;
							}
						}
					});
				}
				columnList.push({
					field: 'reason', title: '调整原因', width: '150px',
					formatter: function (value, row, index) {
						if (data.priceCheck == "未完成") {
							if (row.isOut == 0) {
								return "<input type='text' id='reason_" + row.supplierId + "' value=''></input>";
							} else {
								return "<input style='display:none' type='text' id='reason_" + row.supplierId + "' value=''></input><span>/</span>";
							}
						} else {
							return value;
						}
					}
				});
				//价格评审表格
				$("#PriceCheckTalbe").bootstrapTable({
					columns: columnList
				});
				$("#PriceCheckTalbe").bootstrapTable("load", priceChecks);
			}
		}
	});
};

$(".isDeviate").on('click', function () {
	parent.layer.open({
		type: 2,//此处以iframe举例
		title: '偏离项明细',
		btn: ["关闭"],
		area: ['1100px', '600px'],
		content: "Auction/common/Purchase/ReportCheck/deviateInfo.html?packageId=" + packageId + '&projectId=' + ProjectData.projectId,
		success: function (layero, index) {
		}
	});
})
//文件下载
function downloadFile(h) {
	var newUrl = loadFile + "?ftpPath=" + offerFileData[h].filePath + "&fname=" + offerFileData[h].fileName;
	window.location.href = $.parserUrlForToken(newUrl);
}
//算数修正值改变时间
function fixCount(typeName, supplierId) {
	//判断输入的值是否为数字
	var fixCount = $("#" + typeName + "_" + supplierId + "").val(),deviatePrice=$("#deviatePrice_" + supplierId + "").attr("value");
	if (typeName == "fixCount" || typeName == 'baseCheckPrice' || typeName == 'deviatePrice') {
		if (typeName == "fixCount") {
			if (fixCount != "" && !(/^[+-]?(([0-9][0-9]*)|(([0]\.\d{1,2}|[0-9][0-9]*\.\d{1,2})))$/.test(fixCount))) {
				parent.layer.alert("算数修正值只能是数字(不限正负)且最多两位小数");
				$("#" + typeName + "_" + supplierId + "").val("");
				return;
			};
			fixCount = fixCount || 0;
			//修正后报价：报价总价 + 算术修正值;
			var prices = (Number($("#saleTaxTotal_" + supplierId + "").attr('value')) + parseFloat(fixCount));

		} else if (typeName == "baseCheckPrice") {
			if (fixCount != "" && !(/^(([1-9][0-9]*)|(([0]\.\d{1,2}|[1-9][0-9]*\.\d{1,2})))$/.test(fixCount))||parseFloat(fixCount)==0) {
				parent.layer.alert("评审基础价必须大于零且最多两位小数");
				$("#" + typeName + "_" + supplierId + "").val("");
				return;
			};
			fixCount = fixCount || 0;
			//修正后报价：评审基础价 + 算术修正值 ；
			var prices = (Number($("#fixCount_" + supplierId + "").val()) + parseFloat(fixCount));
		} else {
			if (fixCount != "" && !(/^[+-]?(([0-9][0-9]*)|(([0]\.\d{1,2}|[0-9][0-9]*\.\d{1,2})))$/.test(fixCount))) {
				parent.layer.alert("偏离加价只能是数字(不限正负)且最多两位小数");
				$("#" + typeName + "_" + supplierId + "").val("");
				return;
			};
			deviatePrice=$("#" + typeName + "_" + supplierId + "").val()
			fixCount = fixCount || 0;
			var prices = Number($("#fixFinalPrice_" + supplierId + "").text());			
		}
		var price = roundFun(prices, (top.prieNumber || 2));
		if (price < 0) {
			parent.layer.alert("修正后总价不得小于零");
			$("#" + typeName + "_" + supplierId + "").val("")
			return;
		}
		$("#fixFinalPrice_" + supplierId + "").attr("value", price);
		$("#fixFinalPrice_" + supplierId + "").text(price);
		var defaultItem = $("#defaultItem_" + supplierId + "").val();
		defaultItem = defaultItem || 0;
		//评审总价 :修正后报价 + 偏离加价 + 缺漏项；
		prices = (Number(price) + Number(deviatePrice|| 0) + parseFloat(defaultItem));
		var price = roundFun(prices, (top.prieNumber || 2));
		if (price < 0) {
			parent.layer.alert("评审总价不得小于零");
			$("#" + typeName + "_" + supplierId + "").val("");
			return;
		}
		$("#totalCheck_" + supplierId + "").val(price);
		$("#totalCheck_"+supplierId+"").attr("value",price);
		$("#totalCheck_"+supplierId+"").text(price);
	} else if (typeName == 'totalCheck') {
		if (fixCount != "" && !(/^(([1-9][0-9]*)|(([0]\.\d{1,2}|[1-9][0-9]*\.\d{1,2})))$/.test(fixCount))||parseFloat(fixCount)==0) {
			parent.layer.alert("评审总价必须大于零且最多两位小数");
			$("#" + typeName + "_" + supplierId + "").val("");
			return;
		};
	} else if (typeName == 'finalDiscountPrice') {
		if (fixCount != "" && !(/^(([1-9][0-9]*)|(([0]\.\d{1,2}|[1-9][0-9]*\.\d{1,2})))$/.test(fixCount))||parseFloat(fixCount)==0) {
			parent.layer.alert("最终优惠价必须大于零且最多两位小数");
			$("#" + typeName + "_" + supplierId + "").val("");
			return;
		};
		return
	}
}
//缺漏项改变事件
function defaultItem(supplierId) {
	//判断输入的值是否为数字
	var defaultItem = $("#defaultItem_" + supplierId + "").val();
	if (defaultItem != "" && !(/^[+-]?(([0-9][0-9]*)|(([0]\.\d{1,2}|[0-9][0-9]*\.\d{1,2})))$/.test(defaultItem))) {
		parent.layer.alert("缺漏项加价只能是数字(不限正负)且最多两位小数");
		$("#defaultItem_" + supplierId + "").val("")
		return;
	};
	defaultItem = defaultItem || 0;
	//评审总价 :修正后报价 + 偏离加价 + 缺漏项；
	var prices = (Number($("#fixFinalPrice_" + supplierId + "").attr("value") || 0) + Number($("#deviatePrice_" + supplierId + "").attr("value") || 0) + parseFloat(defaultItem));
	var price = roundFun(prices, (top.prieNumber || 2))
	if (price < 0) {
		parent.layer.alert("评审总价不得小于零");
		$("#defaultItem_" + supplierId + "").val("")
		return;
	}
	$("#totalCheck_" + supplierId + "").val(price);
	$("#totalCheck_"+supplierId+"").attr("value",price);
	$("#totalCheck_"+supplierId+"").text(price);
}
//保存价格评审
function savepriceChecks() {
	for (var i = 0; i < priceChecks.length; i++) {
		if (priceChecks[i].isOut == 0) {
			if (checkPlan == 1 || checkPlan == 3) {
				if ($("#deviatePrice_" + priceChecks[i].supplierId).val() != "" && priceChecks[i].isOut == 0 && checkPlan == 1) {
					if (!/^((\d+\.\d*[0-9]\d*)|(\d*[0-9]\d*\.\d+)|(\d*[0-9]\d*))$/.test($("#deviatePrice_" + priceChecks[i].supplierId).val())) {
						top.layer.alert(priceChecks[i].enterpriseName + "的偏离调整加价只能是数字");
						return false;
					}

				}

			} else {
				if (businessPriceSet.checkType == 0) {
					if ($("#score_" + priceChecks[i].supplierId).val() == '' && priceChecks[i].isOut == 0) {
						top.layer.alert('请输入' + priceChecks[i].enterpriseName + "的商务报价得分");
						return false;
					}
					if (!/^((\d+\.\d*[0-9]\d*)|(\d*[0-9]\d*\.\d+)|(\d*[0-9]\d*))$/.test($("#score_" + priceChecks[i].supplierId).val()) && priceChecks[i].isOut == 0) {
						top.layer.alert(priceChecks[i].enterpriseName + "的商务报价得分只能是纯数字");
						return false;
					}
					if (parseInt($("#score_" + priceChecks[i].supplierId).val()) > (100 * parseFloat(businessPriceSet.weight)) && priceChecks[i].isOut == 0) {
						top.layer.alert(priceChecks[i].enterpriseName + "的商务报价得分超出最大范围" + (100 * parseFloat(businessPriceSet.weight)));
						return false;
					}
				}
			}
			if(businessPriceSet.checkType == 0){
				if ($("#totalCheck_" + priceChecks[i].supplierId).val().length == '' && priceChecks[i].isOut == 0) {
					top.layer.alert('请输入' + priceChecks[i].enterpriseName + "的评审总价");
					return false;
				}
	
				if (!/^((\d+\.\d*[0-9]\d*)|(\d*[0-9]\d*\.\d+)|(\d*[0-9]\d*))$/.test($("#totalCheck_" + priceChecks[i].supplierId).val()) && priceChecks[i].isOut == 0) {
					top.layer.alert(priceChecks[i].enterpriseName + "的评审总价只能是数字");
					return false;
				}
			}
			
			// if ($("#finalChecked_" + priceChecks[i].supplierId).is('checked') == true) {
			// 	if ($("#finalDiscountPrice_" + priceChecks[i].supplierId).val() == "") {
			// 		top.layer.alert('请输入' + priceChecks[i].enterpriseName + "的最终优惠价");
			// 		return false;
			// 	} else {
			// 		if (!/^((\d+\.\d*[0-9]\d*)|(\d*[0-9]\d*\.\d+)|(\d*[0-9]\d*))$/.test($("#finalDiscountPrice_" + priceChecks[i].supplierId).val())) {
			// 			top.layer.alert(priceChecks[i].enterpriseName + "的评审总价只能是数字,且最多两位小数");
			// 			return false;
			// 		}
			// 	}

			// }
			var saleTaxTotal = $("#saleTaxTotal_" + priceChecks[i].supplierId + "").attr("value");//报价总价
			if(businessPriceSet.checkType == 0){
				var totalCheck = $("#totalCheck_" + priceChecks[i].supplierId + "").val();//评审总价
			}else{
				var totalCheck = $("#totalCheck_"+priceChecks[i].supplierId+"").attr("value");;//评审总价
			}
			if (parseFloat(totalCheck) != parseFloat(saleTaxTotal)) {
				if ($("#reason_" + priceChecks[i].supplierId).val() == '') {
					top.layer.alert("请输入" + priceChecks[i].enterpriseName + "的调整原因");
					return false;
				}
			}
		}
	}
	var para = savepriceData();
	$.ajax({
		type: "POST",
		url: url + "/WaitCheckProjectController/priceCheck.do",
		data: para,
		async: true,
		success: function (data) {
			if (data.success) {
				$("#savediv").hide();
				PriceCheck();
				if (isDeviate == 1) {
					$("#showDeviates").show();
				}
				top.layer.alert('提交成功!');
			} else {
				if (data.message) {
					top.layer.alert(data.message);
				} else {
					top.layer.alert("提交失败");
				}
			}
		}
	});
}
//价格评审提交数据
function savepriceData() {
	var para = {};
	for (var i = 0; i < priceChecks.length; i++) {
		para['priceChecks[' + i + '].projectId'] = packageData.projectId;
		para['priceChecks[' + i + '].packageId'] = packageData.packageId;
		para['priceChecks[' + i + '].supplierId'] = priceChecks[i].supplierId;
		para['priceChecks[' + i + '].checkPlan'] = checkPlan;
		para['priceChecks[' + i + '].isOut'] = $("#isOut_" + priceChecks[i].supplierId).attr("value");
		if ($("#isOut_" + priceChecks[i].supplierId).attr("value") == 0) {
			para['priceChecks[' + i + '].fixCount'] = $("#fixCount_" + priceChecks[i].supplierId).val() || 0;
			para['priceChecks[' + i + '].defaultItem'] = $("#defaultItem_" + priceChecks[i].supplierId).val() || 0;
			para['priceChecks[' + i + '].fixFinalPrice'] = $("#fixFinalPrice_" + priceChecks[i].supplierId).html();
			para['priceChecks[' + i + '].reason'] = $("#reason_" + priceChecks[i].supplierId).val();
			para['priceChecks[' + i + '].saleTaxTotal'] = $("#saleTaxTotal_" + priceChecks[i].supplierId).attr("value");
			if (checkPlan == 1 || checkPlan == 3) {
				para['priceChecks[' + i + '].deviateNum'] = $("#deviateNum_" + priceChecks[i].supplierId).html();
				if (businessPriceSet.checkType == 0) {
					para['priceChecks[' + i + '].deviatePrice'] = $("#deviatePrice_" + priceChecks[i].supplierId).val() || 0;
					para['priceChecks[' + i + '].totalCheck'] = $("#totalCheck_" + priceChecks[i].supplierId).val();
				} else {
					para['priceChecks[' + i + '].deviatePrice'] = $("#deviatePrice_" + priceChecks[i].supplierId).attr("value") || 0;
					para['priceChecks[' + i + '].totalCheck'] = $("#totalCheck_" + priceChecks[i].supplierId).attr("value");
				}
			} else {
				if (businessPriceSet.checkType == 0) {
					para['priceChecks[' + i + '].score'] = $("#score_" + priceChecks[i].supplierId).val();
					para['priceChecks[' + i + '].totalCheck'] = $("#totalCheck_" + priceChecks[i].supplierId).val();
				} else {
					para['priceChecks[' + i + '].score'] = $("#score_" + priceChecks[i].supplierId).attr("value");
					para['priceChecks[' + i + '].totalCheck'] = $("#totalCheck_" + priceChecks[i].supplierId).attr("value");
				}
			}
		} else {
			if (checkPlan == 1 || checkPlan == 3) {
				para['priceChecks[' + i + '].deviateNum'] = $("#deviateNum_" + priceChecks[i].supplierId).html();

			}
			para['priceChecks[' + i + '].saleTaxTotal'] = $("#saleTaxTotal_" + priceChecks[i].supplierId).html();
		}

		if (priceChecks[i].id) {
			para['priceChecks[' + i + '].id'] = priceChecks[i].id
		};
	}
	para.priceCheckRemark = $("#priceCheckRemark").val();
	return para;
}
/*==========   价格评审 END   ==========*/
/*==========   评审记录汇总   ==========*/
var CheckTotals;
function PriceCheckTotal(packageData) {
	$.ajax({
		type: "post",
		url: url + "/ProjectReviewController/getPriceCheckTotal.do",
		data: {
			projectId: packageData.projectId,
			packageId: packageData.packageId,
			checkPlan: checkPlan
		},
		async: false,
		success: function (data) {
			CheckTotals = data.data;
			var priceCheckTotals = data.data.priceCheckTotals;

			if (CheckTotals.checkReport) {
				packageData.checkReport = CheckTotals.checkReport;
			}
			//按钮控制
			if (CheckTotals && CheckTotals.priceCheck == '已完成') {
				if (CheckTotals.stopCheckReason != "" && CheckTotals.stopCheckReason != undefined && CheckTotals.isStopCheck != 1) {
					parent.layer.alert("温馨提示：该项目评委已申请流标，无法进行评审汇总");
					$("#myTab li").removeClass('active');
					$("li[value='#progress']").addClass('active');
					$("#myTabContent div").removeClass('show');
					$("#progress").addClass("show");
					$(".PriceCheckBtn").hide();
					return;
				}
				if (CheckTotals.checkItem == '已完成') {
					if (CheckTotals.checkReports != undefined && CheckTotals.checkReports.length > 0) {
						checkRemark = CheckTotals.checkReports[0].checkRemark
					}
					$("#savePriceCheckTotal").attr("disabled", true);
					$("#savePriceCheckTotal").css("pointer-events", "none");
					$("#editReport").attr("disabled", false);
					//$("#editReport").css("pointer-events", "none");
					$("#checkPlace").val(priceCheckTotals[0].checkPlace);
					$("#checkPlace").attr("disabled", true);
					$("#checkDate").val(priceCheckTotals[0].checkDate);
					$("#checkDate").attr("disabled", true);
					$("#checkRemark").val(priceCheckTotals[0].checkRemark);
					$("#checkRemark").attr("disabled", true);
				} else {
					if (priceCheckTotals && priceCheckTotals.length > 0) {
						$("#checkPlace").val(priceCheckTotals[0].checkPlace);
						$("#checkDate").val(priceCheckTotals[0].checkDate);
						$("#checkRemark").val(priceCheckTotals[0].checkRemark);
					}
				}
				$(".PriceCheckBtn").show();
				if (CheckTotals.checkReport == "已完成") {
					$("#generateReport").attr("disabled", true);
					$("#generateReport").css("pointer-events", "none");
					$("#editReport").attr("disabled", true);
					$("#editReport").css("pointer-events", "none");
				} else {
					$("#editReport").attr("disabled", false);
					$("#editReport").css("pointer-events", "auto");
				}
				//有评审记录时，暂时历史记录
				var checkItem;
				if (CheckTotals.priceCheckItems && CheckTotals.priceCheckItems.length > 0) {
					checkItem = CheckTotals.priceCheckItems;
				} else {
					checkItem = CheckTotals.priceChecks;
				}
				if (checkPlan == '1' || checkPlan == 3) {
					$("#checkTotalTable").bootstrapTable({
						columns: [{
							field: '#',
							title: '序号',
							width: '50px',
							cellStyle: {
								css: {
									"text-align": "center"
								}
							},
							formatter: function (value, row, index) {
								return index + 1;
							}
						}, {
							field: 'enterpriseName',
							title: '供应商名称'
						},
						{
							field: 'isOut',
							title: '淘汰',
							width: '80px',
							align: 'center',
							halign: 'center',
							formatter: function (value, row, index) {
								return value == 1 ? "<span id='isOut_" + row.supplierId + "' value='1'>是</sapn>" : "<span id='isOut_" + row.supplierId + "' value='0'>否</sapn>";
							}
						}, {
							field: 'saleTaxTotal',
							title: '供应商报价',
							width: '150px'
						}, {
							field: 'fixCount',
							title: '算数修正值',
						}, {
							field: 'fixFinalPrice',
							title: '修正后总价',
						},
						//							{
						//								field: 'totalCheck',
						//								title: '最终报价(万元)',
						//								width: '150px'
						//							},
						{
							field: 'defaultItem',
							title: '缺漏项加价',
						},
						{
							field: 'deviateNum',
							title: '计入总数偏离项数',
							align: 'center',
							width: '100px'
						},
						{
							field: 'deviatePrice',
							title: '偏离加价',
							width: '150px'
						},/*
							{
								field: 'score',
								title: '商务报价得分',
							},*/
						{
							field: 'totalCheck',
							title: '评审总价',
							width: '150px'
						},
						{
							field: 'reason',
							title: '调整原因',
						},
						{
							field: 'supplierOrder',
							title: '排名',
							align: 'center',
							halign: 'center',
							width: '80px',
							formatter: function (value, row, index) {
								if (CheckTotals.checkItem == '已完成') {
									if (row.isOut == 1) { //淘汰							
									} else {
										return value;
									}									
								} else {
									if (row.isOut == 1) { //淘汰
										return "<input type='hidden' id='supplierOrder_" + row.supplierId + "' style='width:100%' value='" + (value || index + 1) + "'/><span>/</span>";
									} else {

										return "<input type='text' class='supplierOrder' id='supplierOrder_" + row.supplierId + "' style='width:100%' value='" + (value || index + 1) + "'/>";
									}

								}
							}
						},
						{
							field: 'isChoose',
							title: '候选人',
							width: '80px',
							align: 'center',
							halign: 'center',
							formatter: function (value, row, index) {
								if (CheckTotals.checkItem == '已完成') {
									return value == 0 ? "否" : "是";
								} else {
									if (row.isOut == 1) { //淘汰
										return "<input type='hidden' id='isChoose_" + row.supplierId + "'  disabled='disabled'/><span>/</span>";

									} else {
										if (index <= 2) {
											return "<input type='checkbox' class='isChoose' id='isChoose_" + row.supplierId + "' checked='checked' />";
										} else {
											return "<input type='checkbox' class='isChoose' id='isChoose_" + row.supplierId + "'  />";
										}
									}

								}

							}
						}
						]
					});
					$("#checkTotalTable").bootstrapTable("load", checkItem);
					if (checkPlan == 3) {
						$("#checkTotalTable").bootstrapTable("hideColumn", 'deviatePrice');
					}
				} else {
					var html = '';
					var checker = CheckTotals.experts; //评委
					var list=[]
					for(var i=0;i<CheckTotals.packageCheckLists.length;i++){
						if(CheckTotals.packageCheckLists[i].checkType!=4){
							list.push(CheckTotals.packageCheckLists[i])
						}						
					}					
					var priceChecks = CheckTotals.priceChecks; //打分情况
					if (priceChecks) {
						html += "<tbody><tr>";
						html += "<td style='text-align:left' width='200px'>供应商名称</td>";
						html += "<td style='text-align:center' width='120px'>评审项</td>";
						html += "<td style='text-align:center' width='400px'>评审内容</td>";
						for (var i = 0; i < checker.length; i++) {
							html += "<td style='text-align:center' width='100px'>得分" + (i + 1) + "</br>(" + checker[i].expertName + ")</td>";
						}
						html += "<td style='text-align:center' width='90px'>分项平均分</td>";
						html += "<td style='text-align:center' width='120px'>分项平均总得分</td>";
						html += "<td style='text-align:center' width='110px'>商务报价得分</td>";
						html += "<td style='text-align:center' width='75px'>淘汰</td>";
						html += "<td style='text-align:center' width='80px'>总分</td>";
						html += "<td style='text-align:center' width='70px'>排名</td>";
						html += "<td style='text-align:center' width='75px'>候选人</td>";
						html += "</tr>";

						//跨行条数
						var enterpriseRowspan = 0;
						for (var x = 0; x < list.length; x++) { //评审项
							enterpriseRowspan += list[x].packageCheckItems.length;
							if (list[x].checkType == 1 || list[x].checkType == 3) enterpriseRowspan++;
						}
						for (var i = 0; i < priceChecks.length; i++) {
							if (list && list.length > 0) {
								html += "<tr>";
								html += "<td style='text-align:left;' " + (enterpriseRowspan > 0 ? "rowspan='" + enterpriseRowspan + "'" : "") + ">" + priceChecks[i].enterpriseName + "</td>";
								for (var x = 0; x < list.length; x++) { //评审项
									var item = list[x].packageCheckItems;
									for (var z = 0; z < item.length; z++) { //评审内容
										if (z != 0) {
											html += "<tr>";
										};
										if (z == 0) {
											if (item.length == 1 && x != 0) {
												html += "<tr>";
											}
											html += "<td style='text-align:center'" + ((list[x].checkType == 1 || list[x].checkType == 3) ? "rowspan='" + (item.length + 1) + "'" : "rowspan='" + item.length + "'") + ">" + list[x].checkName + "</td>";
										};
										html += "<td style='text-align:left'>" + item[z].checkTitle + "</td>";
										for (var e = 0; e < checker.length; e++) { //评委
											//html += "<td style='text-align:center'>" + (priceChecks[i].expertScores[checker[e].id][item[z].id] || '/') + "</td>";
											if (priceChecks[i].expertScores && typeof (priceChecks[i].expertScores[checker[e].id][item[z].id]) != "undefined") {
												html += "<td style='text-align:center'>" + (priceChecks[i].expertScores[checker[e].id][item[z].id] || '/') + "</td>";
											} else {
												html += "<td style='text-align:center'>/</td>";
											}
										}

										if (list[x].checkType == 1 || list[x].checkType == 3) {
											if (priceChecks[i].expertScores) {
												if (typeof (priceChecks[i].expertScores[list[x].id]) != "undefined") {
													html += "<td style='text-align:center'>" + (priceChecks[i].expertScores[item[z].id] || '/') + "</td>";
												} else {
													html += "<td style='text-align:center'>/</td>";
												}
											} else {
												html += "<td style='text-align:center'>/</td>";
											}
										} else {
											if (list[x].checkType == 0) {
												if (priceChecks[i].expertScores) {
													if (typeof (priceChecks[i].expertScores[list[x].id]) != "undefined") {
														html += "<td style='text-align:center'>" + (priceChecks[i].expertScores[item[z].id] == 0 ? "符合" : "不符合") + "</td>";
													} else {
														html += "<td style='text-align:center'>/</td>";
													}
												} else {
													html += "<td style='text-align:center'>/</td>";
												}
											} else if (list[x].checkType == 2) {
												if (priceChecks[i].expertScores) {
													if (typeof (priceChecks[i].expertScores[list[x].id]) != "undefined") {
														html += "<td style='text-align:center'>" + (priceChecks[i].expertScores[item[z].id] == 0 ? "合格" : "不合格") + "</td>";
													} else {
														html += "<td style='text-align:center'>/</td>";
													}
												} else {
													html += "<td style='text-align:center'>/</td>";
												}
											}
										}

										if (z == 0) {
											if (list[x].checkType == 1 || list[x].checkType == 3) {//评分制
												if (priceChecks[i].expertScores) {
													if (typeof (priceChecks[i].expertScores[list[x].id]) != "undefined") {
														if (list[x].checkType == 3) {
															var teps = Number(priceChecks[i].expertScores[list[x].id]);
														} else {
															var teps = (Number(priceChecks[i].expertScores[list[x].id]) * Number((list[x].weight || "1")));
														}
														var tep = roundFun(teps, (top.prieNumber || 2));
														html += "<td style='text-align:center'" + ((list[x].checkType == 1 || list[x].checkType == 3) ? "rowspan='" + (item.length + 1) + "'" : "rowspan='" + item.length + "'") + ">" + (tep || '/') + "</td>"
													} else {
														html += "<td style='text-align:center'" + ((list[x].checkType == 1 || list[x].checkType == 3) ? "rowspan='" + (item.length + 1) + "'" : "rowspan='" + item.length + "'") + ">/</td>"
													}
												} else {
													html += "<td style='text-align:center'" + ((list[x].checkType == 1 || list[x].checkType == 3) ? "rowspan='" + (item.length + 1) + "'" : "rowspan='" + item.length + "'") + ">/</td>"
												}
											} else {//合格制

												if (list[x].checkType == 0) {
													if (priceChecks[i].expertScores) {
														if (typeof (priceChecks[i].expertScores[list[x].id]) != "undefined") {
															html += "<td style='text-align:center' " + ((list[x].checkType == 1 || list[x].checkType == 3) ? "rowspan='" + (item.length + 1) + "'" : "rowspan='" + item.length + "'") + ">" + (priceChecks[i].expertScores[list[x].id] == 0 ? "符合" : "不符合") + "</td>";
														} else {
															html += "<td style='text-align:center'" + ((list[x].checkType == 1 || list[x].checkType == 3) ? "rowspan='" + (item.length + 1) + "'" : "rowspan='" + item.length + "'") + ">/</td>"
														}
													} else {
														html += "<td style='text-align:center'" + ((list[x].checkType == 1 || list[x].checkType == 3) ? "rowspan='" + (item.length + 1) + "'" : "rowspan='" + item.length + "'") + ">/</td>"
													}
												} else if (list[x].checkType == 2) {//偏离制
													if (priceChecks[i].expertScores) {
														if (typeof (priceChecks[i].expertScores[list[x].id]) != "undefined") {
															html += "<td style='text-align:center'" + ((list[x].checkType == 1 || list[x].checkType == 3) ? "rowspan='" + (item.length + 1) + "'" : "rowspan='" + item.length + "'") + ">" + (priceChecks[i].expertScores[list[x].id] == 0 ? "合格" : "不合格") + "</td>";
														} else {
															html += "<td style='text-align:center'" + ((list[x].checkType == 1 || list[x].checkType == 3) ? "rowspan='" + (item.length + 1) + "'" : "rowspan='" + item.length + "'") + ">/</td>"
														}
													} else {
														html += "<td style='text-align:center' " + ((list[x].checkType == 1 || list[x].checkType == 3) ? "rowspan='" + (item.length + 1) + "'" : "rowspan='" + item.length + "'") + ">/</td>"
													}
												}
											}

										};
										if (z != 0) {
											html += "</tr>";
										} else {
											/*if(x==list.length-1&&item.length==1 && list[x].checkType == 1){
												html += "/<tr>";
											}*/

											if (item.length == 1 && x != 0) {
												html += "</tr>";
											}
										}
										if (x == 0 && z == 0) {
											html += "<td style='text-align:center' " + (enterpriseRowspan > 0 ? "rowspan='" + enterpriseRowspan + "'" : "") + ">" + (priceChecks[i].score || '/') + "</td>";

											html += "<td style='text-align:center' " + (enterpriseRowspan > 0 ? "rowspan='" + enterpriseRowspan + "'" : "") + ">" + (priceChecks[i].isOut ? "<span id='isOut_" + priceChecks[i].supplierId + "' value='1'>是</sapn>" : "<span id='isOut_" + priceChecks[i].supplierId + "' value='0'>否</sapn>") + "</td>";
											html += "<td style='text-align:center' " + (enterpriseRowspan > 0 ? "rowspan='" + enterpriseRowspan + "'" : "") + "><span id='total_" + priceChecks[i].supplierId + "' value='" + priceChecks[i].total + "'>" + (priceChecks[i].total || '') + "</sapn>" + "</td>";
											if (CheckTotals.checkItem == '已完成') {
												if (priceChecks[i].isOut == 1) {
													html += "<td style='text-align:center' " + (enterpriseRowspan > 0 ? "rowspan='" + enterpriseRowspan + "'" : "") + ">/</td>";
												} else {
													html += "<td style='text-align:center' " + (enterpriseRowspan > 0 ? "rowspan='" + enterpriseRowspan + "'" : "") + ">" + (priceChecks[i].supplierOrder || '') + "</td>";
												}
												html += "<td style='text-align:center' " + (enterpriseRowspan > 0 ? "rowspan='" + enterpriseRowspan + "'" : "") + ">" + (priceChecks[i].isChoose ? "是" : "否") + "</td>";
											} else {

												if (priceChecks[i].isOut == 1) { //1淘汰，0否
													html += "<td style='text-align:center;' " + (enterpriseRowspan > 0 ? "rowspan='" + enterpriseRowspan + "'" : "") + "><input type='hidden' style='width:80px' id='supplierOrder_" + priceChecks[i].supplierId + "' value='" + (priceChecks[i].supplierOrder || (i + 1)) + "'>/</td>";

													html += "<td style='text-align:center' " + (enterpriseRowspan > 0 ? "rowspan='" + enterpriseRowspan + "'" : "") + "><input type='hidden' id='isChoose_" + priceChecks[i].supplierId + "' disabled='disabled'>/</td>";
												} else {
													html += "<td style='text-align:center;' " + (enterpriseRowspan > 0 ? "rowspan='" + enterpriseRowspan + "'" : "") + "><input type='text' style='width:80px' class='supplierOrder' id='supplierOrder_" + priceChecks[i].supplierId + "' value='" + (priceChecks[i].supplierOrder || (i + 1)) + "'></td>";

													if (i <= 2) {
														html += "<td style='text-align:center' " + (enterpriseRowspan > 0 ? "rowspan='" + enterpriseRowspan + "'" : "") + "><input type='checkbox' class='isChoose' id='isChoose_" + priceChecks[i].supplierId + "' checked></td>";
													} else {
														html += "<td style='text-align:center' " + (enterpriseRowspan > 0 ? "rowspan='" + enterpriseRowspan + "'" : "") + "><input type='checkbox' class='isChoose' id='isChoose_" + priceChecks[i].supplierId + "'></td>";
													}

												}
											}
											html += "</tr>";
										}
									}
									if (list[x].checkType == 1 || list[x].checkType == 3) {
										html += "<tr><td style='text-align:center'>得分</td>";
										for (var e = 0; e < checker.length; e++) {
											if (priceChecks[i].expertScores && typeof (priceChecks[i].expertScores[checker[e].id][list[x].id]) != "undefined") {
												html += "<td  style='text-align:center' >" + (priceChecks[i].expertScores[checker[e].id][list[x].id] || '/') + "</td>";
											} else {
												html += "<td style='text-align:center'>/</td>";
											}
											//html += "<td  style='text-align:center' >" + (priceChecks[i].expertScores[checker[e].id][list[x].id] || '/') + "</td>";
										}

										if (priceChecks[i].expertScores) {
											html += "<td  style='text-align:center' >" + (priceChecks[i].expertScores[list[x].id] || '/') + "</td>";
										} else {
											html += "<td style='text-align:center'>/</td>";
										}
										//html += "<td  style='text-align:center' >" + (priceChecks[i].expertScores[list[x].id] || '/') + "</td>";
										html += "</tr>";
									}
								}
							}
						}
					}
					$("#checkTotalTable").html(html + '</tbody>');
				}
			} else {
				top.layer.alert("价格评审未完成！");
				$("#myTab li").removeClass('active');
				$("li[value='#progress']").addClass('active');
				$("#myTabContent div").removeClass('show');
				$("#progress").addClass("show");
			}
		}
	});
};

//提交结果-评审记录汇总
$("#savePriceCheckTotal").click(function () {

	if (CheckTotals.priceCheck == "未完成") {
		top.layer.alert("价格评审未完成，不能进行评审记录汇总");
		return false;
	}
	if (packageData.checkItem == "已完成") {
		top.layer.alert("评审记录汇总已完成");
		return false;
	}
	var checkPlace = $("#checkPlace").val();
	var checkDate = $("#checkDate").val();
	if(checkPlace == "") {
		top.layer.alert("请输入评审地点");
		return false;
	}
	if (checkPlace.length > 60) {
		top.layer.alert("评审地点不得超过60个字");
		return false;
	}
	if(checkDate == "") {
		top.layer.alert("请选择评审时间");
		return false;
	}
	var r = new RegExp("^((([0-9]{3}[1-9]|[0-9]{2}[1-9][0-9]{1}|[0-9]{1}[1-9][0-9]{2}|[1-9][0-9]{3})-(((0[13578]|1[02])-(0[1-9]|[12][0-9]|3[01]))|((0[469]|11)-(0[1-9]|[12][0-9]|30))|(02-(0[1-9]|[1][0-9]|2[0-8]))))|((([0-9]{2})(0[48]|[2468][048]|[13579][26])|((0[48]|[2468][048]|[3579][26])00))-02-29))\\s+([0-1]?[0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])$");		
	if(checkDate!=""&&!r.test(checkDate)){
		parent.layer.alert('请输入正确格式的日期');
		return;
	}
	var para = {
		projectId: ProjectData.projectId,
		packageId: packageId,
		checkPlace: checkPlace,
		checkDate: checkDate,
		itemState: '0',
		examType: 1
	};

	if (CheckTotals.priceCheckItems && CheckTotals.priceCheckItems.length > 0) { //有打分记录
		for (var i = 0; i < CheckTotals.priceCheckItems.length; i++) {
			para['priceCheckItems[' + i + '].id'] = CheckTotals.priceCheckItems[i].id;
			para['priceCheckItems[' + i + '].supplierId'] = CheckTotals.priceCheckItems[i].supplierId;
			para['priceCheckItems[' + i + '].supplierOrder'] = $("#supplierOrder_" + CheckTotals.priceCheckItems[i].supplierId).val();
			para['priceCheckItems[' + i + '].isOut'] = $("#isOut_" + CheckTotals.priceCheckItems[i].supplierId).attr('value');
			if (checkPlan == '0' || checkPlan == '2') {
				para['priceCheckItems[' + i + '].total'] = $("#total_" + CheckTotals.priceCheckItems[i].supplierId).attr('value');
			}
			if ($("#isChoose_" + CheckTotals.priceCheckItems[i].supplierId).is(":checked")) { //选中  
				para['priceCheckItems[' + i + '].isChoose'] = "1";
			} else {
				para['priceCheckItems[' + i + '].isChoose'] = "0";
			}
		}
	} else {
		for (var i = 0; i < CheckTotals.priceChecks.length; i++) {
			para['priceCheckItems[' + i + '].supplierId'] = CheckTotals.priceChecks[i].supplierId;
			para['priceCheckItems[' + i + '].supplierOrder'] = $("#supplierOrder_" + CheckTotals.priceChecks[i].supplierId).val();
			para['priceCheckItems[' + i + '].isOut'] = $("#isOut_" + CheckTotals.priceChecks[i].supplierId).attr('value');
			if (checkPlan == '0' || checkPlan == '2') {
				para['priceCheckItems[' + i + '].total'] = $("#total_" + CheckTotals.priceChecks[i].supplierId).attr('value');
			}
			if ($("#isChoose_" + CheckTotals.priceChecks[i].supplierId).is(":checked")) { //选中  
				para['priceCheckItems[' + i + '].isChoose'] = "1";
			} else {
				para['priceCheckItems[' + i + '].isChoose'] = "0";
			}
		}
	}

	if ($("#checkRemark") && $("#checkRemark").val().length > 0) {
		para.checkRemark = $("#checkRemark").val();
	}

	//console.log(para);
	$.ajax({
		type: "post",
		url: url + "/PriceCheckTotalController/savePriceCheckTotal.do",
		data: para,
		async: true,
		//		beforeSend: function() {
		//			$('#savePriceCheckTotal').attr("disabled", true);
		//		},
		success: function (data) {
			if (data.success) {
				//window.location.reload();
				$("#myTab li").removeClass('active');
				$("li[value='#PriceCheckTotal']").addClass('active');
				$("#myTabContent div").removeClass('show');
				$("#PriceCheckTotal").addClass("show");
				$('#savePriceCheckTotal').removeAttr("disabled");

				$(".isChoose").attr("disabled", true);
				$(".supplierOrder").attr("disabled", true);

				$('#savePriceCheckTotal').attr("disabled", true);
				$('#checkPlace').attr("disabled", true);
				$('#checkDate').attr("disabled", true);
				$('#checkRemark').attr("disabled", true);
				packageData.checkItem = "已完成";
				top.layer.alert("提交成功");
			} else {
				$('#savePriceCheckTotal').removeAttr("disabled");
				packageData.checkItem = "未完成";
				if (data.message) {
					top.layer.alert(data.message);
				} else {
					top.layer.alert("提交失败");
				}
			}
		},
		error: function (err) {
			$('#savePriceCheckTotal').removeAttr("disabled");
		}
	});
});
$('#editReport').on('click', function () {
	if (packageData.checkItem == "未完成") {
		top.layer.alert("评审汇总未完成无法生成评审报告");
		return false;
	}
	if (packageData.checkReport == "已完成") {
		top.layer.alert("评审报告已生成");
		return false;
	}
	top.layer.open({
		type: 2,
		title: "编辑报告",
		area: ['100%', '100%'],
		content: 'Auction/common/Purchase/ReportCheck/editReport.html',
		success: function (layero, index) {
			var iframeWind = layero.find('iframe')[0].contentWindow;
			iframeWind.edit(ProjectData.projectId, ProjectData.packageId, 1, checkRemark)
		},

	});
})
//生成报告-评审记录汇总
$("#generateReport").click(function () {
	if (packageData.checkItem == "未完成") {
		top.layer.alert("评审汇总未完成无法生成评审报告");
		return false;
	}
	if (packageData.checkReport == "已完成") {
		top.layer.alert("评审报告已生成");
		return false;
	}
	var index = top.layer.load(0, {
		shade: false
	});
	$.ajax({
		type: "post",
		url: url + "/WaitCheckProjectController/produceProjectCheckResultPdf.do",
		data: {
			projectId: ProjectData.projectId,
			packageId: ProjectData.packageId,
			examType: 1,
			itemState: "0"
		},
		success: function (data) {
			top.layer.close(index);
			if (data.success) {
				$("#generateReport").attr("disabled", true);
				$("#generateReport").css("pointer-events", "none");
				//并且给下载按钮添加下载功能
				$("#generateReport").attr("disabled", true);
				$("#generateReport").css("pointer-events", "none");

				//重新获取按钮值
				PriceCheckTotal(packageData)
				top.layer.alert("生成成功");
			} else {
				if (data.message) {
					top.layer.alert(data.message);
				} else {
					top.layer.alert("生成失败");
				}
			}
		},
		error: function (err) {
			top.layer.alert("生成失败");
			top.layer.close(index);
		}
	});
});

//预览
$("#viewCheckReport").click(function () {
	if (CheckTotals.checkReport == '已完成') {
		//window.open($.parserUrlForToken(top.config.bidhost + "/FileController/fileView.do?ftpPath=" + CheckTotals.checkReports[0].reportUrl));
		previewPdf(CheckTotals.checkReports[0].reportUrl);
	} else {
		top.layer.alert("评审报告未生成！");
	}
});
function viewCheckReport(reportUrl) {
	previewPdf(reportUrl);
}
//下载
$("#downloadCheckReport").click(function () {
	if (CheckTotals.checkReport == '已完成') {
		window.open($.parserUrlForToken(top.config.bidhost + "/FileController/download.do?ftpPath=" + CheckTotals.checkReports[0].reportUrl + "&fname=" + packageData.packageName + "_评审报告"));
	} else {
		top.layer.alert("评审报告未生成！");
	}
});
$('#checkDate').datetimepicker({
	step: 5,
	lang: 'ch',
	format: 'Y-m-d H:i:s',
});
/*==========   评审记录汇总 END  ==========*/
/*==========   评审报告   ==========*/
function CheckReport(data) {
	$.ajax({
		type: "post",
		url: url + "/ProjectReviewController/getPriceCheckTotal.do",
		data: {
			projectId: packageData.projectId,
			packageId: packageData.packageId,
			checkPlan: checkPlan
		},
		async: false,
		success: function (rec) {
			if (rec.data && rec.data.checkReport != undefined && rec.data.checkReports.length > 0) {
				if (rec.data.checkReport) {
					packageData.checkReport = rec.data.checkReport;
				}
				var isNeedSure=rec.data.isNeedSure;
				if(rec.data.experts){
					var experts=rec.data.experts;		
				}else{
					var experts=new Array()
				}
						
				if(isNeedSure==1){
					$("#isNeedSureShow").show();
					$("#isNeedSure").bootstrapTable({
						//data: repData,
						columns: [{
							title: '序号',
							width: '50px',
							cellStyle: {
								css: {
									"text-align": "center"
								}
							},
							formatter: function (value, row, index) {
								return index + 1;
							}
						},{
							title: '评委名称',
							align: 'center',			
							formatter: function (value, row, index) {
								return row.expertName
								
							}
						},{
							title: '确认状态',
							align: 'center',			
							formatter: function (value, row, index) {
								if(row.sureReport==1){
									return "同意";
								}else if(row.sureReport===0){
									return "不同意";
								}else{
									return "未确认";
								}
								
							}
						},{
							title: '确认时间',
							align: 'center',			
							formatter: function (value, row, index) {
								if(row.sureDate){
									return row.sureDate;
								}else{
									return ''
								}
							}
						},{
							title: '确认原因',
							align: 'center',			
							formatter: function (value, row, index) {
								if(row.sureReason){
									return row.sureReason;
								}else{
									return ''
								}
							}
						}]
					});
					$('#isNeedSure').bootstrapTable("load", experts);
				}
				//data.data.checkReport == '已完成'
				var repData = rec.data.checkReports;
				if (repData[0].isCheck != undefined && ((repData[0].isCheck == 3 && rec.data.checkReport == '未完成') || (repData[0].isCheck != 3 && rec.data.checkReport == '已完成'))) {
					$("#CheckReportTable").bootstrapTable({
						//data: repData,
						columns: [{
							title: '序号',
							width: '50px',
							cellStyle: {
								css: {
									"text-align": "center"
								}
							},
							formatter: function (value, row, index) {
								return index + 1;
							}
						}, {
							title: '评审报告',
							align: 'center',
							cellStyle: {
								css: {
									"text-align": "center"
								}
							},
							formatter: function (value, row, index) {
								return packageData.packageName + "_评审报告";
							}
						}, {
							field: 'operate',
							title: '操作',
							width: '100px',
							align: 'center',
							cellStyle: {
								css: {
									"text-align": "center"
								}
							},
							events: {
								'click .download': function (e, value, row, index) {
									var newUrl = top.config.bidhost + "/FileController/download.do?ftpPath=" + row.reportUrl + "&fname=" + packageData.packageName + "_评审报告.pdf";
									window.location.href = $.parserUrlForToken(newUrl);
								}
							},
							formatter: function (value, row, index) {
								var btn = "<a href='javascript:void(0)' class='btn btn-xs btn-primary download' style='text-decoration:none;'><span class='glyphicon glyphicon-arrow-down' aria-hidden='true'></span>下载</a>"
									+ "<a class='btn btn-primary btn-xs' onclick=viewCheckReport(\"" + row.reportUrl + "\") href='javascript:void(0)'><span class='glyphicon glyphicon-picture' aria-hidden='true'></span>预览</a>";
								return btn
							}
						}, {
							field: 'isCheck',
							title: '审核',
							width: '150px',
							align: 'center',
							formatter: function (value, row, index) {
								if (row.isCheck == 2) {
									return "<div><label class='text-success'>审核通过</label></div>"
								} else if (row.isCheck == 3) {
									return "<div><label class='text-success'>审核不通过</label></div>";
									//return "<div id='submitCheckReport'><button onclick='subAudit(this)' class='btn  btn-primary PriceCheckBtn subAudit btn-xs'>重新提交</button></div>";
								} else if (row.isCheck == 0) {
									return "<div id='submitCheckReport'><button onclick='subAudit(this)' class='btn   btn-primary PriceCheckBtn subAudit btn-xs'>提交审核</button></div>";
								} else if (row.isCheck == 4) {
									return "<div><label class='text-warning'>审核中</label></div>"
								}
							}
						}]
					});
					$(".PriceCheckBtn").show();

					$('#CheckReportTable').bootstrapTable("load", repData);

					if (repData[0].isCheck == 3) {
						//审核不通过
						$('#CheckReportTable').bootstrapTable('hideColumn', 'operate');
					}
				} else {
					top.layer.alert("评审报告未生成！");
					$("#myTab li").removeClass('active');
					$("li[value='#progress']").addClass('active');
					$("#myTabContent div").removeClass('show');
					$("#progress").addClass("show");
				}


			} else {
				top.layer.alert("评审报告未生成！");
				$("#myTab li").removeClass('active');
				$("li[value='#progress']").addClass('active');
				$("#myTabContent div").removeClass('show');
				$("#progress").addClass("show");
			}
		}
	});
}
//提交审核
function subAudit(button, index) {
	//	console.log(button);
	//	console.log(packageId);
	//	console.log(ProjectData.projectId);
	$.ajax({
		url: top.config.bidhost + "/WorkflowController/findWorkflowCheckerByType.do",
		type: 'get',
		dataType: 'json',
		async: false,
		data: {
			"workflowLevel": 0,
			"workflowType": "psbg"
		},
		success: function (data) {
			var option = ""
			//判断是否有审核人		   	  
			if (data.message == 0) {
				top.layer.confirm('温馨提示：该流程未设置审批节点，您是否继续提交？', function () {
					$.ajax({
						url: top.config.bidhost + "/CheckReportController/saveCheckForCheckReport.do",
						type: "post",
						data: {
							projectId: ProjectData.projectId,
							packageId: packageId,
							examType: 1,
							level: 9
						},
						dataType: "json",
						success: function (data) {
							if (data.success) {
								
								window.location.reload();
								top.layer.msg("提交成功");
							} else {
								top.layer.alert("提交失败:" + data.message);
							}
						}
					})
				});
			} else if (data.message == 2) {
				parent.layer.alert("找不到该级别的审批人,请在项目审批管理中设置审核人");
				$(button).attr("disabled", true);
			} else if (data.success == true) {
				option = "<option value=''>请选择审核人员</option>"
				for (var i = 0; i < data.data.length; i++) {
					option += '<option value="' + data.data[i].employeeId + '">' + data.data[i].userName + '</option>'
				}
				sessionStorage.setItem("option", JSON.stringify(option));

				top.layer.open({
					type: 2,
					title: '请选择审核人',
					area: ['450px', '200px'],
					maxmin: false, //该参数值对type:1和type:2有效。默认不显示最大小化按钮。需要显示配置maxmin: true即可
					resize: false, //是否允许拉伸
					closeBtn: 1,
					content: 'Auction/common/Purchase/ReportCheck/ChooseChecker.html',
					btn: ['确定', '取消'],
					scrolling: 'no',
					yes: function (index, layero) {
						var iframeWin = layero.find('iframe')[0].contentWindow;
						var checkerId = iframeWin.btnSubmit();

						if (checkerId == "") {
							top.layer.alert("请选择审核人！");
							return;
						}
						$.ajax({
							url: top.config.bidhost + "/CheckReportController/saveCheckForCheckReport.do",
							type: "post",
							data: {
								employeeId: checkerId,
								projectId: ProjectData.projectId,
								packageId: packageId,
								examType: 1,
								level: 1
							},
							dataType: "json",
							success: function (data) {								
								if (data.success) {									
									window.location.reload();
									top.layer.msg("提交成功");
								} else {
									top.layer.alert("提交失败:" + data.message);
								}
								top.layer.close(index);
							}
						})
					}
				});
			}
		}
	});
}
/*==========   评审报告END   ==========*/
/*==========   评审澄清   ==========*/
function bindRaterAsks(packageData) {
	var strUlHtml = '<div id="divsd">'
	strUlHtml += "<div style='width: 100%;overflow:hidden;float:left' id='ulTab_'>"
	strUlHtml += "<ul id='raterAsksTab' class='nav nav-tabs' style='border-top: 0px solid;'>";
	for (var i = 0; i < packageData.offers.length; i++) {
		if (i == 0) {
			strUlHtml += "<li class='active' onclick='raterAsksbtn(\"" + packageData.offers[i].supplierId + "\")'>";
		} else {
			strUlHtml += "<li onclick='raterAsksbtn(\"" + packageData.offers[i].supplierId + "\")'>";
		}
		strUlHtml += "<a href='#raterAsks_" + packageData.offers[i].supplierId + "' data-toggle='tab'>" + packageData.offers[i].enterpriseName + "</a>";
		strUlHtml += "</li>";
	}
	strUlHtml += "</ul>";
	strUlHtml += "</div>";
	strUlHtml += '<button type="button" class="btn btn-default" id="perv_" style="width: 40px;height: 40px;margin: 0px;"><<</button>'
	strUlHtml += '<button type="button" class="btn btn-default" id="next_" style="width: 40px;height: 40px;margin: 0px;">>></button>'
	strUlHtml += "<div id='raterAsksTabContent' class='tab-content' style='float:left;width: 100%;'>";
	strUlHtml += "<div style='margin: 5px;'>供应商互动提问 <span style='color: red;'>温馨提示：评审委员会可以要求供应商进行澄清说明，所有澄清问题的提出与答复均在本页面在线完成</span></div>";
	strUlHtml += "<div style='width: 100%;height: 450px; border: 1px #ddd solid;' id='TabContent'>";

	strUlHtml += "</div>";
	strUlHtml += "</div>";
	$("#raterAsks").html(strUlHtml);
	var liList = []
	$("#raterAsksTab li").each(function () {
		liList.push($(this).width())
	})
	if (eval(liList.join('+')) + packageData.offers.length * 2 >= $("#divsd").width()) {
		$("#perv_").show();
		$("#next_").show();
		$("#ulTab_").width($("#divsd").width() - 80)
		$("#raterAsksTab").width(eval(liList.join('+')) + packageData.offers.length * 4);
	} else {
		$("#perv_").hide();
		$("#next_").hide();
		$("#ulTab_").width('100%')
		$("#raterAsksTab").width('100%');
	}

	var moveIndex = 0;
	$("#perv_").on('click', function () {
		moveIndex < 0 ? moveIndex++ : moveIndex = 0
		$("#raterAsksTab").stop().animate({
			'marginLeft': moveIndex * 120
		})

	})
	$("#next_").on('click', function () {
		-($("#raterAsksTab").css('width').slice(0, -2) - $("#divsd").width()) < $("#raterAsksTab").css('margin-left').slice(0, -2) ? moveIndex-- : ''
		$("#raterAsksTab").stop().animate({
			'marginLeft': moveIndex * 120
		})

	})
	raterAsksbtn(packageData.offers[0].supplierId);
}
function raterAsksbtn(uid) {
	var strDivContentHtml = "";
	strDivContentHtml += "<div style='overflow-y:scroll;height:400px' id='messageDiv_" + uid + "'>";
	strDivContentHtml += "</div>";
	strDivContentHtml += "<div style='width: 100%;' class='isShowRaterAsks'>";
	strDivContentHtml += "<a href='#' style='margin-left:5px;float:left' type='button' class='btn btn-primary btn-sm' onclick='refresh(\"" + uid + "\")'>刷新</a>";
	strDivContentHtml += "<a href='#' style='margin-left:5px;float:left' type='button' class='btn btn-primary btn-sm' onclick='automaticRefresh(\"" + uid + "\")' id='automaticRefresh_" + uid + "'>自动刷新</a>";
	strDivContentHtml += "</div>";

	$("#TabContent").html(strDivContentHtml);
	refresh(uid);
	//点击tab加载对应数据
	$("#raterAsksTab").on("click", "li", function (e) {
		$("#raterAsksTab li").removeClass('active');
		$(this).addClass('active');
		var contentdiv = $(this).children("a")[0].hash;
		$("#raterAsksTabContent div").removeClass('show');
		$(contentdiv).addClass("show");
		//$(contentdiv).scrollTop($(contentdiv)[0].scrollHeight);
	});

}
//查看附件
function viewFiles(id) {
	top.layer.open({
		type: 2,
		title: "查看澄清回复附件",
		area: ['600px', '400px'],
		btn: ["关闭"],
		content: $.parserUrlForToken('Auction/common/Expert/JudgesScore/ShowFilelist.html') + '&id=' + id
	});
}
//刷新
function refresh(supplierId) {
	$.ajax({
		type: "post",
		url: url + "/RaterAskController/findRaterAskList.do",
		data: {
			projectId: packageData.projectId,
			packageId: packageId,
			examType: 1,
			roleType: "0"
		},
		beforeSend: function (xhr) {
			var token = $.getToken();
			xhr.setRequestHeader("Token", token);

		},
		success: function (data) {
			if (data.success) {
				var data = data.data;
				var strDivHtml = "";
				for (var i = 0; i < data.length; i++) {
					if (supplierId == data[i].supplierId) {
						if (typeof (data[i].answerId) == "undefined") {
							strDivHtml += "<span>提问人：" + data[i].raterName + "</span></br>";
							strDivHtml += "<span>提问内容：" + data[i].askContent + "</span></br>";
							strDivHtml += "<span>提问时间：" + data[i].askDate + "</span></br>";
							strDivHtml += "<span>答复内容：<c style='color:red'>未答复</c></span></br></br>";
						} else {
							strDivHtml += "<span>提问人：" + data[i].raterName + "</span></br>";
							strDivHtml += "<span>提问内容：" + data[i].askContent + "</span></br>";
							strDivHtml += "<span>提问时间：" + data[i].askDate + "</span></br>";
							strDivHtml += "<span>答复内容：" + data[i].answerContent + "</span></br>";
							strDivHtml += "<span>答复时间：" + data[i].answerDate + "</span></br>";
							strDivHtml += "<span>答复附件：<a href='#' onclick='viewFiles(\"" + data[i].id + "\")' >查看附件</a></span></br></br>";
						}

					}
				}
				$("#questionsContent_" + supplierId).val("");
				$("#messageDiv_" + supplierId).html(strDivHtml);
				$('#messageDiv_' + supplierId).scrollTop($("#messageDiv_" + supplierId)[0].scrollHeight);
				if (data.length > 0 && data[0].checkReport == 1) {
					$(".isShowRaterAsks").hide();
					$("#btnDeleteRaterAsk").hide();
				}
			}
		}
	});
}
//自动刷新
var isAutomaticRefresh = false;
var timer;

function automaticRefresh(supplierId) {
	isAutomaticRefresh = !isAutomaticRefresh;
	if (isAutomaticRefresh) {
		$("#automaticRefresh_" + supplierId).html("取消刷新");
		timer = setInterval(function () {
			refresh(supplierId);
		}, 1000)
	} else {
		$("#automaticRefresh_" + supplierId).html("自动刷新");
		clearInterval(timer);
	}
}
/*==========   评审澄清END   ==========*/
//包件评审结束
$(".StopCheckBtn").click(function () {
	getData();
	if (packageData.stopCheckReason != "" && packageData.stopCheckReason != undefined && packageData.stopCheckSource == 1) {
		//专家发起流标,项目经理确认
		top.layer.confirm("温馨提示：流标后该包件将作废，是否确定流标？", function (indexs) {
			$.ajax({
				type: "post",
				url: url + "/ProjectReviewController/setIsStopCheck.do",
				data: {
					id: packageId,
					isStopCheck: 1,
					stopCheckReason: packageData.stopCheckReason,
					examType: 1
				},
				async: true,
				success: function (data) {
					if (data.success) {
						window.location.reload();
						top.layer.alert("操作成功");
						parent.layer.close(indexs);
					} else {
						top.layer.alert(data.message);
					}
				}
			});
		})
	} else {
		//项目经理发起流标
		if (packageData.checkResult == '未完成') {
			//评审报告未审核完成之前,评委若有打分记录则由评委发起
			if (packageData.checkItemInfos.length > 0) {
				top.layer.alert("温馨提示：专家已打分，无法发起流标");
				return
			}
		}

		top.layer.confirm("温馨提示：流标后该包件将作废，是否确定流标？", function (indexs) {
			parent.layer.close(indexs);
			parent.layer.prompt({
				title: '请输入流标原因',
				formType: 2
			}, function (text, index) {
				if (text.trim() == "") {
					parent.layer.alert('请填写流标原因');

					return
				}
				$.ajax({
					type: "post",
					url: url + "/ProjectReviewController/setIsStopCheck.do",
					data: {
						id: packageId,
						isStopCheck: 1,
						stopCheckReason: text.trim(),
						examType: 1
					},
					async: true,
					success: function (data) {
						if (data.success) {
							window.location.reload();
							top.layer.alert("操作成功");
						} else {
							top.layer.alert(data.message);
						}
					}
				});
				parent.layer.close(index);
			});
		});
	}
})
/** 
 * 取得url参数 
 */
function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象  
	var r = window.location.search.substr(1).match(reg); // 匹配目标参数  
	if (r != null) return unescape(r[2]);
	return null; // 返回参数值  
}

function getNowFormatDate() {
	var date = new Date();
	var seperator1 = "-";
	var seperator2 = ":";
	var month = date.getMonth() + 1;
	var strDate = date.getDate();
	if (month >= 1 && month <= 9) {
		month = "0" + month;
	}
	if (strDate >= 0 && strDate <= 9) {
		strDate = "0" + strDate;
	}
	var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate +
		" " + date.getHours() + seperator2 + date.getMinutes() +
		seperator2 + date.getSeconds();
	return currentdate;
}
/** 
 * 暗标供应商对应关系
 */
function corresponding(data) {
	$("#correspondingsTable").bootstrapTable({
		data: data,
		columns: [{
			title: '序号',
			width: '50px',
			cellStyle: {
				css: {
					"text-align": "center"
				}
			},
			formatter: function (value, row, index) {
				return index + 1;
			}
		}, {
			field: 'enterpriseName',
			title: '供应商名称',
			align: 'center',
			cellStyle: {
				css: {
					"text-align": "center"
				}
			},

		}, {
			field: 'shadowCode',
			title: '暗标编号',
			align: 'center',
			cellStyle: {
				css: {
					"text-align": "center"
				}
			},

		}]
	});
}
function NewDateT(str){  
	if(!str){  
	  return 0;  
	}  
	arr=str.split(" ");  
	d=arr[0].split("-");  
	t=arr[1].split(":");
	var date = new Date(); 
   
	date.setUTCFullYear(d[0], d[1] - 1, d[2]);   
	date.setUTCHours(t[0]-8, t[1], t[2], 0);
	return date;  
}
 //时间转换是的IE和谷歌都可以判断日期大小
 function NewDatefp(str){  
	if(!str){  
	    return 0;  
	}  
	var timeDATE=new Date(Date.parse(str.replace(/-/g, "/"))).getTime()
	return  timeDATE;  
} 