var ue;
var historyCheckState;
function findBusinessPriceSet() {
	if (historyCheckState == 'undefined') {
		historyCheckState = ''
	}
	$.ajax({
		url: config.bidhost + '/PriceSetHistoryController/findBusinessPriceSet.do',
		type: 'get',
		dataType: 'json',
		async: false,
		//contentType:'application/json;charset=UTF-8',
		data: {
			"packageId": packageInfo.id,
			"checkState": historyCheckState,
			"examType": packageInfo.examType,
			"flagType": flagType,
		},
		success: function (data) {
			if (data.success) {
				businessPriceSetData = data.data;
				flagType = businessPriceSetData.flagType
				businessPriceSet()
			} else {
				parent.layer.alert("温馨提示：" + data.message);
				var index = parent.layer.getFrameIndex(window.name);
				top.layer.close(index);
				return;
			}
		}
	});
}
function businessPriceSet() {
	if (businessPriceSetData != "" && businessPriceSetData != undefined) {
		if (businessPriceSetData.packageId == packageInfo.id) {
			$("input[name='isShowPriceSet'][value='" + businessPriceSetData.isShowPriceSet + "']").prop('checked', true);
			if (businessPriceSetData.checkType == 0) {
				$("#businessName").val(businessPriceSetData.businessName);

			}
			//$("#weight").val(businessPriceSetData.weight);
			$("#businessContent").val(businessPriceSetData.businessContent);
			if (businessPriceSetData.checkType == 1) {
				$('#reduceLevel').val(businessPriceSetData.reduceLevel);
				$('#reduceScore').val(businessPriceSetData.reduceScore);
				$('#basePrice').val(businessPriceSetData.basePrice);
				$('#offerRange').val(businessPriceSetData.offerRange);

			} if (businessPriceSetData.checkType == 2) {
				$("input[name='basePriceRole'][value='" + businessPriceSetData.basePriceRole + "']").attr("checked", true);
				$("input[name='basePriceType'][value='"+businessPriceSetData.basePriceType+"']").attr("checked",true);
				$('#baseScore').val(businessPriceSetData.baseScore);
				$('#basePriceProportionHigh').val(businessPriceSetData.basePriceProportionHigh);
				$('.percentageHigh').html(businessPriceSetData.basePriceProportionHigh)
				$('#additionReduceScore1').val(businessPriceSetData.additionReduceScore1);
				$('.fenHigh').html(businessPriceSetData.additionReduceScore1)
				$('#basePriceProportionLow').val(businessPriceSetData.basePriceProportionLow);
				$('.percentageLow').html(businessPriceSetData.basePriceProportionLow)
				$('#additionReduceScore2').val(businessPriceSetData.additionReduceScore2);
				$('.fenLow').html(businessPriceSetData.additionReduceScore2)
			} else if (businessPriceSetData.checkType == 3) {
				$('#reduceLevels').val(businessPriceSetData.reduceLevel);
				$('#reduceScores').val(businessPriceSetData.reduceScore);
				$("input[name='basePriceType'][value='"+businessPriceSetData.basePriceType+"']").attr("checked",true);
			}
			if (businessPriceSetData.checkType == 5 || businessPriceSetData.checkType == 6) {
				$('#baseScore').val(businessPriceSetData.baseScore);
				$('input[name="basePriceType"]').eq(businessPriceSetData.basePriceType == undefined ? '99' : businessPriceSetData.basePriceType - 1).attr('checked', true);
				$('#basePrice').val(businessPriceSetData.basePrice);
				$('input[name="basePriceRole"]').eq(businessPriceSetData.basePriceRole == undefined ? '99' : businessPriceSetData.basePriceRole - 2).attr('checked', true);
				$('#priceProportion').val(businessPriceSetData.priceProportion);
				$('#supplierTotal').val(businessPriceSetData.supplierTotal);
				$('#additionReduceScore1').val(businessPriceSetData.additionReduceScore1);
				$('#maxDownScore').val(businessPriceSetData.maxDownScore);
				$('#additionReduceScore2').val(businessPriceSetData.additionReduceScore2);
				$('#maxUpScore').val(businessPriceSetData.maxUpScore);
				basePriceTypeClick(businessPriceSetData.basePriceType);
			}
			if (businessPriceSetData.checkType == 7) {
				$('#baseScore').val(businessPriceSetData.baseScore);
				$('input[name="basePriceType"]').eq(businessPriceSetData.basePriceType == undefined ? '99' : businessPriceSetData.basePriceType - 1).attr('checked', true);
				$('input[name="basePriceRole"]').eq(businessPriceSetData.basePriceRole == undefined ? '99' : businessPriceSetData.basePriceRole - 2).attr('checked', true);
				$('#maxDownScore').val(businessPriceSetData.maxDownScore);
			}
			if (businessPriceSetData.checkType == 8) {
				$('#baseScore').val(businessPriceSetData.baseScore);
				$('input[name="basePriceType"]').eq(businessPriceSetData.basePriceType == undefined ? '99' : businessPriceSetData.basePriceType - 1).attr('checked', true);
			}
			if (businessPriceSetData.checkType == 9) {
				$('#baseScore').val(businessPriceSetData.baseScore);
				$('input[name="basePriceType"]').eq(businessPriceSetData.basePriceType == undefined ? '99' : businessPriceSetData.basePriceType - 1).attr('checked', true);
				$('#basePrice').val(businessPriceSetData.basePrice);
				$('input[name="basePriceRole"]').eq(businessPriceSetData.basePriceRole == undefined ? '99' : businessPriceSetData.basePriceRole - 2).attr('checked', true);
				$('#priceProportion').val(businessPriceSetData.priceProportion);
				$('#supplierTotal').val(businessPriceSetData.supplierTotal);
				$('#basePriceProportionHigh').val(businessPriceSetData.basePriceProportionHigh);
				$('#additionReduceScore1').val(businessPriceSetData.additionReduceScore1);
				$('#addScoreScope').val(businessPriceSetData.addScoreScope);
				$('#basePriceProportionLow').val(businessPriceSetData.basePriceProportionLow);
				$('#additionReduceScore2').val(businessPriceSetData.additionReduceScore2);
				$('#maxUpScore').val(businessPriceSetData.maxUpScore);
				$('#basePriceScale').val(businessPriceSetData.basePriceScale);
				$('#basePriceNumber').val(businessPriceSetData.basePriceNumber);
				basePriceTypeClick(businessPriceSetData.basePriceType);
			}
			$('#priceProportion').val(businessPriceSetData.priceProportion);
			$('#floatProportion').val(businessPriceSetData.floatProportion);
		};

	};

};
function priceExaminel(_b) {
	var scoreTypes = "";
	if (_b == 0) {
		scoreTypes +=
			'<input  type="radio" name="checkType" value="0" onclick="scoreTypeBtnl(0)"/>自定义评分法' +
			'<input type="radio" name="checkType" value="1" onclick="scoreTypeBtnl(1)"/>最低有效投标价法' +
			'<input  type="radio" name="checkType" value="2" onclick="scoreTypeBtnl(2)"/>基准价评分法' +
			'<input  type="radio" name="checkType" value="3" onclick="scoreTypeBtnl(3)"/>最低报价为基准价法' +
			'</br><input type="radio" name="checkType" value="5" onclick="scoreTypeBtnl(5)"/>固定比例不取整法' +
			'<input  type="radio" name="checkType" value="6" onclick="scoreTypeBtnl(6)"/>固定比例取整法' +
			'<input  type="radio" name="checkType" value="7" onclick="scoreTypeBtnl(7)"/>固定差值法' +
			'<input  type="radio" name="checkType" value="8" onclick="scoreTypeBtnl(8)"/>直接比较法' +
			'<input  type="radio" name="checkType" value="9" onclick="scoreTypeBtnl(9)"/>评价算法'
		$('#scoreType').html(scoreTypes);
	} else if (_b == 1 || _b == 2 || _b == 3 || _b == 4 || _b == 5) {
		scoreTypes += '<input  type="radio" name="checkType" value="0" onclick="scoreTypeBtnl(0)"/>自定义计算法'
		$('#scoreType').html(scoreTypes);
	}
	if (businessPriceSetData != null) {
		$('input[name="checkType"][value="' + businessPriceSetData.checkType + '"]').prop('checked', true);
		if (businessPriceSetData.checkType != undefined) {
			scoreTypeBtnl(businessPriceSetData.checkType);
		}
	}
}
function scoreTypeBtnl(_c) {
	var Assessment = "";
	//自定义评分法
	if (_c == 0) {
		Assessment += '<tr>'
			+ '<td class="th_bg">自定义名称<i class="red">*</i></td>'
			+ '<td colspan="' + ($('#checkPlan').html() == '综合评分法' ? "1" : "3") + '">'
			+ '<div style="position:relative;width:300px">'
			+ '<select id="selectTemp" size="1" class="form-control"></select>'
			+ '<input type="text" id="businessName" name="businessName" style="width: 265px;height: 29px;padding: 6px 12px;position: absolute;left: 2px;bottom: 1px;border: none;border-radius:2px ;">'
			+ '</div>'
			+ '</td>'
			+ '<td class="' + ($('#checkPlan').html() == '综合评分法' ? "" : "none") + ' th_bg">权重值（0~1）<i class="red">*</i></td>'
			+ '<td class="' + ($('#checkPlan').html() == '综合评分法' ? "" : "none") + '" ><input class="form-control" type="text" name="weight"  id="weight" readonly="readonly"/></td>'
			+ '</tr>'
			+ '<tr>'
			+ '<td class="th_bg">商务报价计算方法<i class="red">*</i></td>'
			+ '<td colspan="3" style="text-align:left"><script id="editor" type="text/plain" style="width:100%;height:200px;"></script><input type="hidden" name="businessContent" id="businessContent"/></td>'
			+ '</tr>'

	};
	//最低有效投标价法
	if (_c == 1) {
		Assessment += '<tr>'
			+ '<input class="form-control" type="hidden" name="businessName" value="最低有效投标价法"/>'
			+ '<td class="th_bg">权重值（0~1）<i class="red">*</i></td>'
			+ '<td><input class="form-control" type="text" name="weight"  id="weight" readonly="readonly"/></td>'
			+ '<td style="text-align: left;" colspan="2">商务报价分值=100</td>'
			+ '</tr>'
			+ '<tr>'
			+ '<td colspan="4" style="text-align: left;"><strong>最低有效投标价评分</strong></td>'
			+ '</tr>'
			+ '<tr>'
			+ '<td rowspan="3" class="th_bg">1、商务报价参数<i class="red">*</i></td>'
			+ '</tr>'
			+ '<tr>'
			+ '<td style="text-align: left;">'
			+ '<div class="input-group">'
			+ '<div class="input-group-addon">扣分的最小档次：</div>'
			+ '<input type="text" class=" form-control priceNumber" name="reduceLevel" id="reduceLevel"/>'
			+ '<div class="input-group-addon">%</div>'
			+ '</div>'
			+ '</td>'
			+ '<td colspan="2"  style="text-align: left;">'
			+ '<div class="input-group" style="width:100%">'
			+ '<div class="input-group-addon">最小档扣分：</div>'
			+ '<input type="text" class=" form-control priceNumber" name="reduceScore" id="reduceScore"/>'
			+ '<div class="input-group-addon">分</div>'
			+ '</div>'

			+ '</td>'
			+ '</tr>'
			+ '<tr>'
			+ '<td style="text-align: left;">'
			+ '<div class="input-group">'
			+ '<div class="input-group-addon">基准价：</div>'
			+ '<input type="text" class="form-control number" name="basePrice" id="basePrice"/>'
			// +'<div class="input-group-addon"></div>'
			+ '</div>'
			+ '</td>'
			+ '<td colspan="2" style="text-align: left;">'
			+ '<div class="input-group" style="width:100%">'
			+ '<div class="input-group-addon">有效报价范围（基准价上下浮动比例）：±</div>'
			+ '<input type="text" class=" form-control priceNumber" name="offerRange" id="offerRange"/>'
			+ '<div class="input-group-addon">%</div>'
			+ '</div>'
			+ '</td>'
			+ '</tr>'
			+ '<tr>'
			+ '<td class="th_bg">2、商务报价得分计算公式</td>'
			+ '<td colspan="4" style="text-align: left;" class="red">'
			+ '<p><strong>商务报价得分</strong>=商务报价分值-N*最小挡扣分</p>'
			+ '<p><strong>N</strong>=[(总报价-最低有效投标价)/最低有效投标价]/扣分的最小档次</p>'
			+ '<p>说明</p>'
			+ '<p>(1)、有效报价为基准价*(1+有效报价范围)和基准价*(1-有效报价范围)之间的报价</p>'
			+ '<p>(2)、当N为小数时，直接进一取整</p>'
			+ '</td>'
			+ '</tr>'
	};
	//基准价评分法
	if (_c == 2) {
		Assessment += '<tr>'
			+ '<input class="form-control" type="hidden" name="businessName" value="基准价评分法"/>'
			+ '<td class="th_bg">权重值（0~1）<i class="red">*</i></td>'
			+ '<td colspan="3"><input class="form-control" type="text" style="width:200px" name="weight"  id="weight" readonly="readonly"/></td>'
			+ '</tr>'
			+ '<tr>'
			+ '<td colspan="4" style="text-align: left;"><strong>基准价评分</strong></td>'
			+ '</tr>'
			+ '<tr>'
			+ '<td rowspan="6" class="th_bg">1、商务报价参数<i class="red">*</i></td>'
			+ '</tr>'
			+'<tr>'
				+'<td >基准价计算范围<i class="red">*</i></td>' 
				+'<td colspan="2" style="text-align: left;" >' 
					+'<div>' 
						+'<input type="radio" name="basePriceType" value="1" onclick="basePriceTypeClick(1)"/>计算价格评审环节中有效供应商的报价</br>' 
						+'<input type="radio" name="basePriceType" value="2" onclick="basePriceTypeClick(2)"/>计算所有供应商的报价</br>' 
					+'</div>' 
				+'</td>' 
			+'</tr>'
			+ '<tr>'
			+ '<td >计算规则<i class="red">*</i></td>'
			+ '<td colspan="2" style="text-align: left;" >'
			+ '<input type="radio" name="basePriceRole" value="0" />规则一：基准价=参与应标的有效供应商报价总价/有效供应商家数<br/>'
			+ '<input type="radio" name="basePriceRole" value="1" />规则二：去掉一个最高有效报价和一个最低有效报价后，再按规则一计算'
			+ '</td>'
			+ '</tr>'
			+ '<tr>'
			+ '<td style="text-align: left;">'
			+ '<div class="input-group" >'
			+ '<div class="input-group-addon">基准分：</div>'
			+ '<input type="text" class=" form-control fenzhi priceNumber" name="baseScore" id="baseScore"/>'
			+ '<div class="input-group-addon">分</div>'
			+ '</div>'
			+ '</td>'
			+ '<td style="text-align: right;"><i class="red">*</i>计价比例</td>'
			+ '<td style="text-align: left;">'
			+ '<div class="input-group" >'
			+ '<input type="text" class=" form-control priceNumber" name="priceProportion" id="priceProportion"/>'
			+ '<div class="input-group-addon">%</div>'
			+ '</div>'
			+ '</td>'
			+ '</tr>'
			+ '<tr>'
			+ '<td colspan="3" style="text-align: left;"><i class="red">*</i>当有效报价高于基准价时，每高于基准价<input type="text" class="searched priceNumber"  name="basePriceProportionHigh" id="basePriceProportionHigh"/>%，扣<input type="text" class="fenzhi1 searched" name="additionReduceScore1" id="additionReduceScore1"/>分</td>'
			+ '</tr>'
			+ '<tr>'
			+ '<td colspan="3" style="text-align: left;"><i class="red">*</i>当有效报价低于基准价时，每低于基准价<input type="text" class="searched priceNumber" name="basePriceProportionLow" id="basePriceProportionLow"/>%，扣<input type="text" class="fenzhi2 searched" name="additionReduceScore2" id="additionReduceScore2"/>分</td>'
			+ '</tr>'
			+ '<tr>'
			+ '<td class="th_bg">2、商务报价得分计算公式</td>'
			+ '<td colspan="3" style="text-align: left;" class="red">'
			+ '<p><strong>基准价</strong>=(参与应标的有效供应商报价总价/有效供应商家数)*计价比例</p>'
			+ '<p><strong>N</strong>=[(有效供应商报价-基准价)/基准价]/基准价比例</p>'
			//+'<p>每高于基准价<span class="percentageHigh"></span>%扣<span class="fenHigh"></span>分，低于基准价<span class="percentageLow"></span>%扣<span class="fenLow"></span>分；低于0分按0分计</p>'
			+ '<p><strong>商务报价得分</strong>=权重值*（基准分-|N*扣分值|）</p>'
			+ '</td>'
			+ '</tr>'
	};
	//最低报价为基准法
	if (_c == 3) {
		Assessment += '<tr>'
			+ '<input class="form-control" type="hidden" name="businessName" value="最低报价为基准法"/>'
			+ '<td class="th_bg">权重值（0~1）<i class="red">*</i></td>'
			+ '<td style="width:500px;"><input class="form-control" type="text" name="weight"  id="weight" readonly="readonly" style="width:200px" /></td>'
			+ '<td style="text-align: left;" colspan="2">商务报价分值=100</td>'
			+ '</tr>'
			+ '<tr>'
			+ '<td colspan="4" style="text-align: left;"><strong>最低报价为基准价评分</strong></td>'
			+ '</tr>'
			+ '<tr>'
			+ '<td rowspan="3" class="th_bg">1、商务报价参数<i class="red">*</i></td>'
			+ '</tr>'
			+'<tr>'
				+'<td >基准价计算范围<i class="red">*</i></td>' 
				+'<td colspan="2" style="text-align: left;" >' 
					+'<div>' 
						+'<input type="radio" name="basePriceType" value="1" onclick="basePriceTypeClick(1)"/>计算价格评审环节中有效供应商的报价</br>' 
						+'<input type="radio" name="basePriceType" value="2" onclick="basePriceTypeClick(2)"/>计算所有供应商的报价</br>' 
					+'</div>' 
				+'</td>' 
			+'</tr>'
			+ '<tr>'
			+ '<td style="text-align: left;">'
			+ '每高于基准价'
			+ '<input type="text" class="searched priceNumber" name="reduceLevel" style="width:100px" id="reduceLevels"/>%，'
			+ '扣<input type="text" class="searched priceNumber" name="reduceScore" style="width:100px" id="reduceScores"/>分。</td>'
			+ '<td style="text-align: left;" colspan="2">'
			+ '基准价：供应商最低报价*计价比例<input type="text" class="searched" style="width:60px" name="priceProportion" id="priceProportion"/>%'
			+ '</td>'
			+ '</tr>'
			+ '<tr>'

			+ '</tr>'
			+ '<tr>'
			+ '<td class="th_bg">2、商务报价得分计算公式</td>'
			+ '<td colspan="3" style="text-align: left;" class="red">'
			+ '<p><strong>商务报价得分</strong>=商务报价分值-N*最小挡扣分</p>'
			+ '<p><strong>N</strong>=[(供应商报价-基准价)/基准价]/扣分的最小档次</p>'
			+ '<p>说明：当N为小数时，直接进一取整</p>'
			+ '</td>'
			+ '</tr>'
	};

	//价格比较法
	if (_c == 4) {
		Assessment += '<tr>'
			+ '<input class="form-control" type="hidden" name="businessName" value="价格比较法"/>'
			+ '<td colspan="4" style="text-align: left;"><strong>价格比较法：</strong>1、商务报价参数</td>'
			+ '</tr>'
			+ '<tr>'
			+ '<td class="th_bg" >上浮比例(一般要求下偏离致供应商报价上浮)<i class="red">*</i></td>'
			+ '<td style="text-align: left;" colspan="3">'
			+ '<div class="input-group">'
			+ '<input type="text" class=" form-control priceNumber" name="floatProportion" id="floatProportion"/>'
			+ '<div class="input-group-addon">%</div>'
			+ '</div>'
			+ '</td>'
			+ '</tr>'
			+ '<tr>'
			+ '<td class="th_bg">2、商务报价计算公式</td>'
			+ '<td colspan="3" style="text-align: left;" class="red">'
			+ '<p>偏离调整=累计偏离值*参与应标的有效供应商报价总价*上浮比例</p>'
			+ '<p>调整后最终总报价=参与应标的有效供应商报价总报价+偏离调整</p>'
			+ '</td>'
			+ '</tr>'
	};
	//固定比例不取整法
	if (_c == 5) {
		Assessment += '<tr>' +
			'<input class="form-control" type="hidden" name="businessName" value="固定比例不取整法"/>' +
			'<td class="th_bg">权重值（0~1）<i class="red">*</i></td>' +
			'<td><input class="form-control" type="text" style="width:200px" name="weight"  id="weight" readonly="readonly"/></td>' +
			'<td class="th_bg">商务报价分值<i class="red">*</i></td>' +
			'<td><input type="text" class="form-control priceNumber" style="width:200px;display:inline" name="baseScore" id="baseScore" /></td>' +
			'</tr>' +
			'<tr>' +
			'<td colspan="4" style="text-align: left;"><strong>固定比例取整法</strong></td>' +
			'</tr>' +
			'<tr>' +
			'<td id="tdRows" rowspan="4" class="th_bg">1、商务报价参数<i class="red">*</i></td>' +
			'</tr>' +
			'<tr>' +
			'<td >基准价计算范围<i class="red">*</i></td>' +
			'<td colspan="2" style="text-align: left;" >' +
			'<div>' +
			'<input type="radio" name="basePriceType" value="1" onclick="basePriceTypeClick(1)"/>计算价格评审环节中有效供应商的报价</br>' +
			'<input type="radio" name="basePriceType" value="2" onclick="basePriceTypeClick(2)"/>计算所有供应商的报价</br>' +
			'<input type="radio" name="basePriceType" value="3" onclick="basePriceTypeClick(3)"/>手动输入基准价，基准价：<input type="text" class="form-control number" style="width: 120px;display:inline" name="basePrice" id="basePrice" />' +
			'</div>' +
			'</td>' +
			'</tr>' +
			'<tr id="trbasePriceCalcuType">' +
			'<td >基准价<i class="red">*</i></td>' +
			'<td colspan="2" style="text-align: left;" >' +
			'<div>' +
			'<input type="radio" name="basePriceRole" value="2" onclick="basePriceRoleClick(2)"/>有效报价供应商家数大于N时，去掉一个最高和最低报价的算术平均值乘以计价比例=' +
			'<input type="text" class="form-control priceNumber" style="width: 60px;display:inline" name="priceProportion" id="priceProportion" />%</br>' +
			'&nbsp;&nbsp;有效报价供应商家数小于N（含）时，所有有效供应商报价的算术平均值乘以计价比例，N=' +
			'<input type="text" class="form-control priceNumber" style="width: 60px;display:inline" name="supplierTotal" id="supplierTotal" />（N≥3）</br>' +
			'<input type="radio" name="basePriceRole" value="3" onclick="basePriceRoleClick(3)"/>有效报价的最低报价为基准价' +
			'</div>' +
			'</td>' +
			'</tr>' +
			'<tr>' +
			'<td >商务报价得分<i class="red">*</i></td>' +
			'<td colspan="2" style="text-align: left;" >' +
			'<div>' +
			'供应商报价每高于基准价1%减' +
			'<input type="text" class="form-control priceNumber" style="width: 60px;display:inline" name="additionReduceScore1" id="additionReduceScore1"/>分，' +
			'最多减' +
			'<input type="text" class="form-control priceNumber" style="width: 60px;display:inline" name="maxDownScore" id="maxDownScore" />分</br>' +
			'供应商报价每低于基准价1%加' +
			'<input type="text" class="form-control priceNumber" style="width: 60px;display:inline" name="additionReduceScore2" id="additionReduceScore2" />分，' +
			'最多加' +
			'<input type="text" class="form-control priceNumber" style="width: 60px;display:inline" name="maxUpScore" id="maxUpScore" />分</br>' +
			'</div>' +
			'</td>' +
			'</tr>' +
			'<tr>' +
			'<td class="th_bg">2、商务报价得分计算公式</td>' +
			'<td colspan="3" style="text-align: left;" class="red" name="businessContent" id="businessContent">' +
			'<p>A、供应商报价高于基准价时：</br>' +
			'商务报价得分=(商务报价分值-|(基准价-报价)|/基准价*100*每1%减分值)*权重</br></br>' +
			'B、供应商报价低于基准价时：</br>' +
			'商务报价得分=(商务报价分值+|(基准价-报价)|/基准价*100*每1%加分值)*权重</p></br>' +
			'</td>' +
			'</tr>'
	};

	//固定比例取整法
	if (_c == 6) {
		Assessment += '<tr>' +
			'<input class="form-control" type="hidden" name="businessName" value="固定比例取整法"/>' +
			'<td class="th_bg">权重值（0~1）<i class="red">*</i></td>' +
			'<td><input class="form-control" type="text" style="width:200px" name="weight"  id="weight" readonly="readonly"/></td>' +
			'<td class="th_bg">商务报价分值<i class="red">*</i></td>' +
			'<td><input type="text" class="form-control priceNumber" style="width:200px;display:inline" name="baseScore" id="baseScore" /></td>' +
			'</tr>' +
			'<tr>' +
			'<td colspan="4" style="text-align: left;"><strong>固定比例取整法</strong></td>' +
			'</tr>' +
			'<tr>' +
			'<td id="tdRows" rowspan="4" class="th_bg">1、商务报价参数<i class="red">*</i></td>' +
			'</tr>' +
			'<tr>' +
			'<td >基准价计算范围<i class="red">*</i></td>' +
			'<td colspan="2" style="text-align: left;" >' +
			'<div>' +
			'<input type="radio" name="basePriceType" value="1" onclick="basePriceTypeClick(1)"/>计算价格评审环节中有效供应商的报价</br>' +
			'<input type="radio" name="basePriceType" value="2" onclick="basePriceTypeClick(2)"/>计算所有供应商的报价</br>' +
			'<input type="radio" name="basePriceType" value="3" onclick="basePriceTypeClick(3)"/>手动输入基准价，基准价：<input type="text" class="form-control number" style="width: 120px;display:inline" name="basePrice" id="basePrice" />' +
			'</div>' +
			'</td>' +
			'</tr>' +
			'<tr id="trbasePriceCalcuType">' +
			'<td >基准价<i class="red">*</i></td>' +
			'<td colspan="2" style="text-align: left;" >' +
			'<div>' +
			'<input type="radio" name="basePriceRole" value="2" onclick="basePriceRoleClick(2)"/>有效报价供应商家数大于N时，去掉一个最高和最低报价的算术平均值乘以计价比例=' +
			'<input type="text" class="form-control priceNumber" style="width: 60px;display:inline" name="priceProportion" id="priceProportion" />%</br>' +
			'&nbsp;&nbsp;有效报价供应商家数小于N（含）时，所有有效供应商报价的算术平均值乘以计价比例，N=' +
			'<input type="text" class="form-control priceNumber" style="width: 60px;display:inline" name="supplierTotal" id="supplierTotal" />（N≥3）</br>' +
			'<input type="radio" name="basePriceRole" value="3" onclick="basePriceRoleClick(3)"/>有效报价的最低报价为基准价' +
			'</div>' +
			'</td>' +
			'</tr>' +
			'<tr>' +
			'<td >商务报价得分<i class="red">*</i></td>' +
			'<td colspan="2" style="text-align: left;" >' +
			'<div>' +
			'供应商报价每高于基准价1%减' +
			'<input type="text" class="form-control priceNumber" style="width: 60px;display:inline" name="additionReduceScore1" id="additionReduceScore1"/>分，' +
			'最多减' +
			'<input type="text" class="form-control priceNumber" style="width: 60px;display:inline" name="maxDownScore" id="maxDownScore" />分</br>' +
			'供应商报价每低于基准价1%加' +
			'<input type="text" class="form-control priceNumber" style="width: 60px;display:inline" name="additionReduceScore2" id="additionReduceScore2" />分，' +
			'最多加' +
			'<input type="text" class="form-control priceNumber" style="width: 60px;display:inline" name="maxUpScore" id="maxUpScore" />分</br>' +
			'</div>' +
			'</td>' +
			'</tr>' +
			'<tr>' +
			'<td class="th_bg">2、商务报价得分计算公式</td>' +
			'<td colspan="3" style="text-align: left;" class="red" name="businessContent" id="businessContent">' +
			'<p>A、供应商报价高于基准价时：</br>' +
			'商务报价得分=(商务报价分值-⌊ |(基准价-报价)|/基准价*100⌋*每1%减分值)*权重</br></br>' +
			'B、供应商报价低于基准价时：</br>' +
			'商务报价得分=(商务报价分值+⌊ |(基准价-报价)|/基准价*100⌋*每1%加分值)*权重</p></br>' +
			'注：⌊ ⌋为向下取整符号</br></br>' +
			'</td>' +
			'</tr>'
	};

	//固定差值法
	if (_c == 7) {
		Assessment += '<tr>' +
			'<input class="form-control" type="hidden" name="businessName" value="固定差值法"/>' +
			'<td class="th_bg">权重值（0~1）<i class="red">*</i></td>' +
			'<td><input class="form-control" type="text" style="width:200px" name="weight"  id="weight" readonly="readonly"/></td>' +
			'<td class="th_bg">商务报价分值<i class="red">*</i></td>' +
			'<td><input type="text" class="form-control priceNumber" style="width:200px;display:inline" name="baseScore" id="baseScore" /></td>' +
			'</tr>' +
			'<tr>' +
			'<td colspan="4" style="text-align: left;"><strong>固定差值法</strong></td>' +
			'</tr>' +
			'<tr>' +
			'<td rowspan="4" class="th_bg">1、商务报价参数<i class="red">*</i></td>' +
			'</tr>' +
			'<tr>' +
			'<td >基准价计算范围<i class="red">*</i></td>' +
			'<td colspan="2" style="text-align: left;" >' +
			'<div>' +
			'<input type="radio" name="basePriceType" value="1" onclick="basePriceTypeClick(1)"/>计算价格评审环节中有效供应商的报价</br>' +
			'<input type="radio" name="basePriceType" value="2" onclick="basePriceTypeClick(2)"/>计算所有供应商的报价</br>' +
			'</div>' +
			'</td>' +
			'</tr>' +
			'<tr id="trbasePriceCalcuType">' +
			'<td >基准价<i class="red">*</i></td>' +
			'<td colspan="2" style="text-align: left;" >' +
			'<div>' +
			'<input type="radio" name="basePriceRole" value="3" checked="checked"/>有效报价的最低报价为基准价' +
			'</div>' +
			'</td>' +
			'</tr>' +
			'<tr>' +
			'<td >商务报价得分<i class="red">*</i></td>' +
			'<td colspan="2" style="text-align: left;" >' +
			'<div>' +
			'最多减分' +
			'<input type="text" class="form-control priceNumber" style="width: 60px;display:inline" name="maxDownScore" id="maxDownScore" />分' +
			'</div>' +
			'</td>' +
			'</tr>' +
			'<tr>' +
			'<td class="th_bg">2、商务报价得分计算公式</td>' +
			'<td colspan="3" style="text-align: left;" class="red" name="businessContent" id="businessContent">' +
			'商务报价得分=(商务报价分值-(报价-基准价)/(最高报价-基准价)*最多减分)*权重</br>' +
			'</td>' +
			'</tr>'
	};

	//直接比较法
	if (_c == 8) {
		Assessment += '<tr>' +
			'<input class="form-control" type="hidden" name="businessName" value="直接比较法"/>' +
			'<td class="th_bg">权重值（0~1）<i class="red">*</i></td>' +
			'<td><input class="form-control" type="text" style="width:200px" name="weight"  id="weight" readonly="readonly"/></td>' +
			'<td class="th_bg">商务报价分值<i class="red">*</i></td>' +
			'<td><input type="text" class="form-control priceNumber" style="width:200px;display:inline" name="baseScore" id="baseScore" /></td>' +
			'</tr>' +
			'<tr>' +
			'<td colspan="4" style="text-align: left;"><strong>直接比较法</strong></td>' +
			'</tr>' +
			'<tr>' +
			'<td rowspan="3" class="th_bg">1、商务报价参数<i class="red">*</i></td>' +
			'</tr>' +
			'<tr>' +
			'<td >基准价计算范围<i class="red">*</i></td>' +
			'<td colspan="2" style="text-align: left;" >' +
			'<div>' +
			'<input type="radio" name="basePriceType" value="1" onclick="basePriceTypeClick(1)"/>计算价格评审环节中有效供应商的报价</br>' +
			'<input type="radio" name="basePriceType" value="2" onclick="basePriceTypeClick(2)"/>计算所有供应商的报价</br>' +
			'</div>' +
			'</td>' +
			'</tr>' +
			'<tr id="trbasePriceCalcuType">' +
			'<td >基准价<i class="red">*</i></td>' +
			'<td colspan="2" style="text-align: left;" >' +
			'<div>' +
			'<input type="radio" name="basePriceRole" value="3" checked="checked"/>有效报价的最低报价为基准价' +
			'</div>' +
			'</td>' +
			'</tr>' +
			'<tr>' +
			'<td class="th_bg">2、商务报价得分计算公式</td>' +
			'<td colspan="3" style="text-align: left;" class="red" name="businessContent" id="businessContent">' +
			'商务报价得分=基准价/报价*商务报价分值*权重</br>' +
			'</td>' +
			'</tr>'
	};

	//评价算法
	if (_c == 9) {
		Assessment += '<tr>' +
			'<input class="form-control" type="hidden" name="businessName" value="评价算法"/>' +
			'<td class="th_bg">权重值（0~1）<i class="red">*</i></td>' +
			'<td><input class="form-control" type="text" style="width:200px" name="weight"  id="weight" readonly="readonly"/></td>' +
			'<td class="th_bg">商务报价分值<i class="red">*</i></td>' +
			'<td><input type="text" class="form-control priceNumber" style="width:200px;display:inline" name="baseScore" id="baseScore" /></td>' +
			'</tr>' +
			'<tr>' +
			'<td colspan="4" style="text-align: left;"><strong>评价算法</strong></td>' +
			'</tr>' +
			'<tr>' +
			'<td id="tdRows" rowspan="4" class="th_bg">1、商务报价参数<i class="red">*</i></td>' +
			'</tr>' +
			'<tr>' +
			'<td >基准价计算范围<i class="red">*</i></td>' +
			'<td colspan="2" style="text-align: left;" >' +
			'<div>' +
			'<input type="radio" name="basePriceType" value="1" onclick="basePriceTypeClick(1)"/>计算价格评审环节中有效供应商的报价</br>' +
			'<input type="radio" name="basePriceType" value="2" onclick="basePriceTypeClick(2)"/>计算所有供应商的报价</br>' +
			'<input type="radio" name="basePriceType" value="3" onclick="basePriceTypeClick(3)"/>手动输入基准价，基准价：<input type="text" class="form-control number" style="width: 120px;display:inline" name="basePrice" id="basePrice" />' +
			'</div>' +
			'</td>' +
			'</tr>' +
			'<tr id="trbasePriceCalcuType">' +
			'<td >基准价<i class="red">*</i></td>' +
			'<td colspan="2" style="text-align: left;" >' +
			'<div>' +
			'<input type="radio" name="basePriceRole" value="2" onclick="basePriceRoleClick(2)"/>有效报价供应商家数大于N时，去掉一个最高和最低报价的算术平均值乘以计价比例=' +
			'<input type="text" class="form-control priceNumber" style="width: 60px;display:inline" name="priceProportion" id="priceProportion" />%</br>' +
			'&nbsp;&nbsp;有效报价供应商家数小于N（含）时，所有有效供应商报价的算术平均值乘以计价比例，N=' +
			'<input type="text" class="form-control priceNumber" style="width: 60px;display:inline" name="supplierTotal" id="supplierTotal" />（N≥3）</br>' +
			'<input type="radio" name="basePriceRole" value="3" onclick="basePriceRoleClick(3)"/>有效报价的最低报价为基准价' +
			'</div>' +
			'</td>' +
			'</tr>' +
			'<tr>' +
			'<td >商务报价得分<i class="red">*</i></td>' +
			'<td colspan="2" style="text-align: left;" >' +
			'<div>' +
			'供应商报价每高于基准价' +
			'<input type="text" class="form-control priceNumber" style="width: 60px;display:inline" name="basePriceProportionHigh" id="basePriceProportionHigh" />' +
			'%减' +
			'<input type="text" class="form-control priceNumber" style="width: 60px;display:inline" name="additionReduceScore1" id="additionReduceScore1" />分</br>' +
			'供应商报价低于基准价≤' +
			'<input type="text" class="form-control priceNumber" style="width: 60px;display:inline" name="addScoreScope" id="addScoreScope" onchange="maxUpScoreChange()"/>' +
			'%时，' +
			'每低于基准价' +
			'<input type="text" class="form-control priceNumber" style="width: 60px;display:inline" name="basePriceProportionLow" id="basePriceProportionLow" onchange="maxUpScoreChange()"/>' +
			'%加' +
			'<input type="text" class="form-control priceNumber" style="width: 60px;display:inline" name="additionReduceScore2" id="additionReduceScore2" onchange="maxUpScoreChange()"/>分，' +
			'最多加' +
			'<input type="text" class="form-control priceNumber" style="width: 60px;display:inline" name="maxUpScore" id="maxUpScore" readonly="readonly"/>分</br>' +
			'报价低于基准价加分区间外时' +
			'超出部分每超出于基准价' +
			'<input type="text" class="form-control priceNumber" style="width: 60px;display:inline" name="basePriceScale" id="basePriceScale"/>' +
			'%减' +
			'<input type="text" class="form-control priceNumber" style="width: 60px;display:inline" name="basePriceNumber" id="basePriceNumber" />分</br>' +
			'</div>' +
			'</td>' +
			'</tr>' +
			'<tr>' +
			'<td class="th_bg">2、商务报价得分计算公式</td>' +
			'<td colspan="3" style="text-align: left;" class="red" name="businessContent" id="businessContent">' +
			'<p>A、供应商报价高于基准价时：</br>' +
			'商务报价得分=商务报价分值-|(基准价-报价)|/基准价*100/每百分比减分*每百分比减分值</br></br>' +
			'B、供应商报价低于基准价时，且在加分区间内：</br>' +
			'商务报价得分=商务报价分值+|(基准价-报价)|/基准价*100/每百分比加分*每百分比加分值</p></br>' +
			'C、供应商报价低于基准价时，在加分区间外部分：</br>' +
			'商务报价得分=B项得分-(|(基准价-报价)|/基准价-加分区间/100)*100/每百分比减分*每百分比减分值</p></br>' +
			'注：每种情况计算得出的分数需再乘以权重' +
			'</td>' +
			'</tr>'
	};
	$('#Assessment').html(Assessment);

	setTimeout(function () {
		if (packageInfo.checkPlan == 0) {
			if (packageCheckListInfo.length > 0) {
				var WeightTotalData = []//权重的数组
				for (var d = 0; d < packageCheckListInfo.length; d++) {
					if (packageCheckListInfo[d].checkType == 1) {
						WeightTotalData.push(packageCheckListInfo[d].weight * 1000)
					} else {
						WeightTotalData.push(0)
					};
				}
				WeightTotalnum = eval(WeightTotalData.join('+'));
				WeightsTotal = WeightTotalnum / 1000;
			} else {
				WeightsTotal = 0
			};
			var businessWeight = (1000 - WeightsTotal * 1000) / 1000;
			$("#weight").val(businessWeight)
		} else {
			$("#weight").val("1")
		}
	}, 500)
	businessPriceSet()
	$(".number").on("change", function () {
		if ($(this).val() != "") {
			if (!(/^((\d+\.\d*[0-9]\d*)|(\d*[0-9]\d*\.\d+)|(\d*[0-9]\d*))$/.test($(this).val()))) {
				parent.layer.alert("请输入正数");
				$(this).val("");
				return
			};
			$(this).val(parseFloat($(this).val()).toFixed(top.prieNumber || 2));
		}
	});
	$(".priceNumber").on('change', function () {
		if ($(this).val() != "") {
			//			if(!(/^[+]{0,1}(\d+)$|^[+]{0,1}(\d+\.\d+)$/.test($(this).val()))){
			if (!(/^\d+(.\d{1,2})?$/.test($(this).val()))) {
				parent.layer.alert("请输入正数");
				$(this).val("");
				return;
			}
			if ($(this).val() == 0) {
				parent.layer.alert("请输入大于零的正数");
				$(this).val("");
				return;
			}
		}
	})
	if (_c == 0) {
		//实例化编辑器
		//建议使用工厂方法getEditor创建和引用编辑器实例，如果在某个闭包下引用该编辑器，直接调用UE.getEditor('editor')就能拿到相关的实例
		UE.delEditor('editor'); //先删除之前实例的对象
		ue = UE.getEditor('editor');
		ue.ready(function () {
			ue.setContent(businessPriceSetData.businessContent || "");
			// ue.execCommand('insertHtml', businessPriceSetData.businessContent);
		});
		selectTemp()
	} else {
		UE.delEditor('editor'); //先删除之前实例的对象
	}
};
//基准价计算范围切换事件
function basePriceTypeClick(value) {
	if (value == 3) {
		$("#Assessment").find("#trbasePriceCalcuType").hide();
		$("#Assessment").find("#tdRows").attr("rowspan", "3");
		$("#Assessment").find("#basePrice").removeAttr("readonly");
	} else if (value == 1 || value == 2) {
		$("#Assessment").find("#trbasePriceCalcuType").show();
		$("#Assessment").find("#tdRows").attr("rowspan", "4");
		$("#Assessment").find("#basePrice").val("");
		$("#Assessment").find("#basePrice").attr("readonly", "readonly");
	} else {
		$("#Assessment").find("#trbasePriceCalcuType").show();
		$("#Assessment").find("#tdRows").attr("rowspan", "4");
		$("#Assessment").find("#basePrice").val("");
		$("#Assessment").find("#basePrice").removeAttr("readonly");
	}
};
//基准价切换事件
function basePriceRoleClick(value) {
	if (value == 3) {
		$("#Assessment").find("#priceProportion").val("");
		$("#Assessment").find("#priceProportion").attr("readonly", "readonly");
		$("#Assessment").find("#supplierTotal").val("");
		$("#Assessment").find("#supplierTotal").attr("readonly", "readonly");
	} else {
		$("#Assessment").find("#priceProportion").removeAttr("readonly");
		$("#Assessment").find("#supplierTotal").removeAttr("readonly");
	}
};
//计算评标法最大加分值
function maxUpScoreChange() {
	var _addScoreScope = $("#Assessment").find("#addScoreScope").val();
	var _basePriceProportionLow = $("#Assessment").find("#basePriceProportionLow").val();
	var _additionReduceScore2 = $("#Assessment").find("#additionReduceScore2").val();
	if (_addScoreScope == "" || _basePriceProportionLow == "" || _additionReduceScore2 == "") {
		return;
	}
	$("#Assessment").find("#maxUpScore").val(Math.floor(_addScoreScope / _basePriceProportionLow * _additionReduceScore2 * 100) / 100);
}
function selectTemp() {
	var bankMsg = [];
	$.ajax({
		type: "post",
		url: config.bidhost + '/tempBusinessPriceSetController/findListByExamType',
		datatype: 'json',
		async: false,
		data: {
			'examType': 1,
			'checkPlan': packageInfo.checkPlan,
		},
		success: function (data) {
			if (data.success) {
				bankMsg = data.data;
				var options = '';
				if (bankMsg.length > 0) {
					for (var i = 0; i < bankMsg.length; i++) {
						options += '<option value="' + bankMsg[i].id + '">' + bankMsg[i].businessName + '</option>'
					};
					$("#selectTemp").html(options)
					if (!businessPriceSetData && businessPriceSetData == undefined) {
						$("#businessName").val(bankMsg[0].businessName);
						$("#businessContent").val(bankMsg[0].businessContent);
						ue.ready(function () {
							ue.setContent(bankMsg[0].businessContent);
							// ue.execCommand('insertHtml', bankMsg[0].businessContent);								
						});
					} else {
						$("#selectTemp").val(businessPriceSetData.businessName)
					}
				}
			}
		}
	});
	$("#selectTemp").on('change', function () {
		var text = $("#selectTemp").val();
		var selectedIndex = $('option:selected', '#selectTemp').index();
		$("#businessName").val(bankMsg[selectedIndex].businessName);
		if (selectedIndex >= 0) {
			$("#businessContent").val(bankMsg[selectedIndex].businessContent);
			ue.ready(function () {
				ue.setContent(bankMsg[selectedIndex].businessContent);
				// ue.execCommand('insertHtml', bankMsg[selectedIndex].businessContent);						
			});

		}
	})
}
