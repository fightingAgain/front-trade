function montageHtml() {
	var stHtml = '<tr>' +
		'<td colspan="4" style="font-weight: bold;" class="active">包件基本信息</td>' +
		'</tr>' +
		'<tr>' +
		'<td style="width:200px;"  class="th_bg">包件名称</td>' +
		'<td  style="text-align: left;width:280px;">' +
		'<div id="packageName"></div>' +
		'</td>' +
		'<td style="width:200px;"  class="th_bg">包件编号</td>' +
		'<td style="text-align: left;">' +
		'<div id="packageNum"></div>' +
		'</td>' +
		'</tr>' +
		'<tr>' +
		'<td style="width:200px;"  class="th_bg">项目类型</td>' +
		'<td style="text-align: left;">' +
		'<div id="dataTypeName"></div>' +
		'</td>' +
		'<td style="width:200px;"  class="th_bg">评审方法</td>' +
		'<td style="text-align: left;">' +
		'<div id="checkPlan"></div>' +
		'</td>' +
		'</tr>'
	stHtml += '<tr id="isSetServiceCharges">' +
		'<td  class="th_bg " style="width:200px;">平台服务费(元)</td>' +
		'<td  style="text-align: left;" >' +
		'<div id="pricept"></div>' +
		'</td>' +
		'<td class="th_bg">发布媒体</td>' +
		'<td colspan="3" style="text-align: left;">' +
		'<div id="optionNamesdw"></div>' +
		'</td>'
	'</tr>'
	stHtml += '<tr>'
	if(examType == 0 && packageInfo.examCheckPlan == 1) {
		stHtml += '<td style="width:200px;" class="th_bg">最多保留供应商数</td>' +
			'<td style="text-align: left;" colspan="3">' +
			'<div id="keepNum"></div>' +
			'</td>'
		stHtml += '</tr>'
	}
	stHtml += '<td style="width:200px;" class="th_bg">是否需要报名</td>' +
		'<td style="text-align: left;" ' + (packageInfo.isSign == 0 ? 'colspan="3"' : 'colspan="1"') + '>' +
		'<div id="isSign"></div>' +
		'</td>'
	if(packageInfo.isSign == 1 && packageInfo.isSignCheck == 0) {
		stHtml += '<td style="width:200px;" class="th_bg isNoSignCheck">报名是否需要确认</td>'
		stHtml += '<td style="text-align: left;" class="isNoSignCheck">'
		stHtml += '<div id="isSignCheck"></div>'
		stHtml += '</td>'
	} else if(packageInfo.isSign == 1 && packageInfo.isSignCheck == 1) {
		stHtml += '<td style="width:200px;" class="th_bg isNoSignCheck">报名是否需要确认</td>'
		stHtml += '<td style="text-align: left;" class="isNoSignCheck">'
		stHtml += '<div id="isSignCheck"></div>'
		stHtml += '</td>'
	}+
	'</tr>' +
	'<tr class="isNoSign">' +
	'<td style="width:200px;" class="th_bg">是否需要缴纳报名费</td>' +
	'<td style="text-align: left;" class="colspan3">' +
	'<div id="isPaySign"></div>' +
	'</td>' +
	'<td  class="th_bg isSignDateNone" style="width:200px;">报名费(元)</td>' +
	'<td  style="text-align: left;" class="isSignDateNone">' +
	'<div id="priceBm"></div>' +
	'</td>' +
	'</tr>'
	stHtml += '</tr>'
	stHtml += '<tr>'
	stHtml += '<td style="width:200px;" class="th_bg">是否发售' + (examType == 0 ? '资格预审' : '报价') + '文件</td>' +
		'<td style="text-align: left;" ' + (packageInfo.isSellFile == 1 ? 'colspan="3"' : 'colspan="1"') + '>' +
		'<div id="isSellFile"></div>' +
		'</td>'
	if(packageInfo.isSellFile == 0) {
		stHtml += '<td class="th_bg" style="width:200px;">' + (examType == 0 ? '资格预审' : '报价') + '文件(元)</td>' +
			'<td style="text-align: left;">' +
			'<div id="price"></div>' +
			'</td> '
	}
	stHtml += '</tr>'
	//start招标代理服务费
	if(packageInfo.projectServiceFee && packageInfo.projectServiceFee.collectType == 0) {
		stHtml += '<tr>' +
			'<td class="th_bg">采购代理服务费收取方式</td>' +
			'<td><div id="collectType"></div></td>' +
			'<td class="th_bg">固定金额(元)</td>' +
			'<td><div id="chargeMoney"></div></td>' +
			'</tr>'
	} else if(packageInfo.projectServiceFee && packageInfo.projectServiceFee.collectType == 1) {
		stHtml += '<tr>' +
			'<td class="th_bg">采购代理服务费收取方式</td>' +
			'<td><div id="collectType"></div></td>'
		if(packageInfo.projectServiceFee.isDiscount == 1) {
			stHtml += '<td class="th_bg">是否优惠</td><td>否</td>'
		} else {
			stHtml += '<td class="th_bg">优惠系数（如8折输0.8）</td><td><div id="discountCoefficient"></div></td>'
		}
		stHtml += '</tr>';
	} else if(packageInfo.projectServiceFee && packageInfo.projectServiceFee.collectType == 2) {
		stHtml += '<tr>' +
			'<td class="th_bg">采购代理服务费收取方式</td>' +
			'<td><div id="collectType"></div></td>' +
			'<td class="th_bg">收取说明</td>' +
			'<td><div id="collectRemark" style="word-break:break-all;"></div></td>' +
			'</tr>'
	}
	//end招标代理服务费
	stHtml += '<tr>' +
		'<td style="width:200px;" class="th_bg">公开范围</td>' +
		'<td style="text-align: left;"colspan="3">' +
		'<div id="isPublic"></div>' +
		'</td>' +
		'</tr>'
	if(packageInfo.isPublic == 3) {
		stHtml += '<tr>' +
			'<td style="width:200px;" class="th_bg">供应商分类</td>' +
			'<td style="text-align: left;" colspan="3">' +
			'<div id="supplierClassifyName"></div>' +
			'</td>' +
			'</tr>'
	}
	if(packageInfo.isPayDeposit == 0) {
		stHtml += '<tr>' +
			'<td class="th_bg">保证金缴纳方式</td>' +
			'<td>' +
			'<div id="payMethod"></div>' +
			'</td>' +
			'<td class="th_bg">保证金金额(元)</td>' +
			'<td>' +
			'<div id="priceBz"></div>' +
			'</td>' +
			'</tr>'
		stHtml += '<tr class="isDepositShow DepositPriceShow">' +
			'<td class="th_bg">保证金收取机构</td>' +
			'<td >' +
			'<div id="agentType"></div>' +
			'</td>' +
			'<td class="th_bg">保证金账户名</td>' +
			'<td>' +
			'<div id="bankAccount"></div>' +
			'</td>' +
			'</tr>' +
			'<tr class="isDepositShow DepositPriceShow">' +
			'<td class="th_bg">保证金开户银行</td>' +
			'<td>' +
			'<div id="bankName"></div>' +
			'</td>' +
			'<td class="th_bg">保证金账号</td>' +
			'<td>' +
			'<div id="bankNumber"></div>' +
			'</td>' +
			'</tr>'
	}
	if(packageInfo.options.length > 0) {
		stHtml += '<tr >' +
			'<td class="th_bg">发布媒体</td>' +
			'<td colspan="3" style="text-align: left;">' +
			'<div id="optionNamesdw"></div>' +
			'</td>' +
			'</tr>'
	}
	$("#montage").html(stHtml);

}