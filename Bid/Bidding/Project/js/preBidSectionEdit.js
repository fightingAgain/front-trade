var saveUrl = config.tenderHost + '/BidSectionController/saveBidSectionPretrial.do'; // 点击添加项目保存的接口
var reSaveUrl = config.tenderHost + '/BidExcepitonController/toTheTender.do'; // 重新招标保存的接口

var reBidder = config.tenderHost + '/BidSectionController/findSupplierList.do';//重新招标选择标段后查询标段下购买过文件的投标人列表
var reEditBidder = config.tenderHost + '/BidSectionController/findNewSupplierList.do';//重新招标编辑时标段下购买过文件的投标人列表

var getUrl = config.tenderHost + '/BidSectionController/getBidSectionPretrialInfo.do'; // 标段详情
var detailUrl = config.tenderHost + '/BidExcepitonController/getExcepiton.do'; // 旧标段详情
var id = '';//标段id
var bidSectionId = '';//重新招标时标段id
var isAgency; //是否东风咨询公司
var typeCode = "A";  //标段类型
var examType;  //资格审查方式
var source = "";  // 1是重新招标
var className="";
var bidderArr = [];//重新招标选择标段后查询标段下购买过文件的投标人
var isSubFile;//是否有提交招标（预审）文件
$(function(){
	// 获取连接传递的参数
 	if($.getUrlParam("tenderProjectId") && $.getUrlParam("tenderProjectId") != "undefined"){
		tenderProjectId =$.getUrlParam("tenderProjectId");
	}
	
	//资格审查方式
 	if($.getUrlParam("examType") && $.getUrlParam("examType") != "undefined"){
		examType =$.getUrlParam("examType");
	}
	//是否东风咨询公司
 	if($.getUrlParam("isAgency") && $.getUrlParam("isAgency") != "undefined"){
		isAgency =$.getUrlParam("isAgency");
	} else {
		isAgency = entryInfo().isAgency;
	}
	//招标项目类型
 	if($.getUrlParam("classCode") && $.getUrlParam("classCode") != "undefined"){
		typeCode = $.getUrlParam("classCode");
		if(typeCode == "C50"){
			$(".checkType").attr("selectName","checkType"+"C");
		} else {
			$(".checkType").attr("selectName","checkType"+typeCode);
		}
		initSelect(".checkType");
	}
 	//根据招标项目类型显示不同内容
	if(typeCode == "A" || typeCode == "B" || typeCode == "C" || typeCode == "C50"){
 		if(typeCode == "C50"){
			classifyChange("C");
		} else {
 			classifyChange(typeCode);
 		}
	}
	//是否公共资源
 	if($.getUrlParam("isPublicProject") && $.getUrlParam("isPublicProject") != "undefined"){
		isPublicProject =$.getUrlParam("isPublicProject");
		
		if(isPublicProject == 1){  //当招标项目为公共资源时，是否报名为否
			className = "TENDER_PROJECT_CLASSIFY_CODE";  //标段分类
			$(".aloneSetCheckShow").hide();
		} else {
			className = "TENDER_PROJECT_CLASSIFY_0CODE";  //标段分类
			if(isAgency == 1){
				$(".aloneSetCheckShow").show();
			} else {
				$(".aloneSetCheckShow").hide();
			}
		}
	}
 	//交易流程
	processChange($("[name='process']:checked").val()); 	
	if($.getUrlParam("source") && $.getUrlParam("source") != "undefined"){
		source =$.getUrlParam("source");
	}
	if(source == 1){
		$("#btnSave").show();
		$("#btnReSubmit").show();
		$("#btnSubmit").hide();
		$("[name='bidSectionName']").attr("readonly","readonly");
		$("[name='bidSectionName']").addClass("readonly");
		$(".bidCode").show();
		/*购买过招标文件的投标人是否需要再次购买*/
		$('.re_tender').show();
	} else {
		$("#btnSave").hide();
		$("#btnReSubmit").hide();
		$("#btnSubmit").show();
		$("[name='bidSectionName']").removeAttr("readonly");
		$("[name='bidSectionName']").removeClass("readonly");
		$(".bidCode").hide();
		$('.re_tender').hide();
	}
 	if($.getUrlParam("id") && $.getUrlParam("id") != "undefined"){
		id =$.getUrlParam("id");
		getDetail();
		if(source == 1){
			getReTenserList(id)
		}
		//判断标段有无已提交的招标文件/资格预审文件（预审项目撤回时，时判断资格预审文件），若“有”则页面限制相关字段不可编辑,data-disabled用于保存后添加disabled属性
		getHasFile('bid', id, function(id, isSub){
			if(isSub){
				isSubFile = isSub;
				$.each($('td'), function(index, item){
					if(!$(this).hasClass('allowEdit')){
						$(this).find('input').attr({'disabled': true, 'data-disabled': '*'});
						$(this).find('select').attr({'disabled': true, 'data-disabled': '*'});
						$(this).find('textarea').attr({'disabled': true, 'data-disabled': '*'});
					}
				})
			}
		});
	}
 	if($.getUrlParam("bidSectionId") && $.getUrlParam("bidSectionId") != "undefined"){
		bidSectionId =$.getUrlParam("bidSectionId");
		getDetail();
		if(source == 1){
			getReTenser(bidSectionId)
		}
		//判断标段有无已提交的招标文件/资格预审文件（预审项目撤回时，时判断资格预审文件），若“有”则页面限制相关字段不可编辑,data-disabled用于保存后添加disabled属性
		getHasFile('bid', bidSectionId, function(id, isSub){
			if(isSub){
				isSubFile = isSub;
				$.each($('td'), function(index, item){
					if(!$(this).hasClass('allowEdit')){
						$(this).find('input').attr({'disabled': true, 'data-disabled': '*'});
						$(this).find('select').attr({'disabled': true, 'data-disabled': '*'});
						$(this).find('textarea').attr({'disabled': true, 'data-disabled': '*'});
					}
				})
			}
		});
	}
	if(!id && !bidSectionId){
		$(".tenderProjectClassifyCodeTxt").dataLinkage({
			optionName:className,
			optionValue:typeCode,
			selectCallback:function(code){
				tenderProjectClassifyCode = code;
			}
		});
		$(".tenderProjectClassifyCodeTxt select:first").hide();
		$(".signUpShow").hide();
	}
	//source
 	
 	//保存
	$("#btnSave").click(function(){
//		if($('[data-pay=zgyswjf]:checked').val() == 1){
			for(var i = 0;i<bidderArr.length;i++){
				if($('[name="bidPayCosts['+i+'].isPreFee"]:checked').val() == undefined){
					parent.layer.alert('请选择是否免除投标人 '+bidderArr[i].enterpriseName + ' 的本次资格预审文件费用');
					return;
				}
				if($('[name="bidPayCosts['+i+'].isTenderFee"]:checked').val() == undefined){
					parent.layer.alert('请选择是否免除投标人 '+bidderArr[i].enterpriseName + ' 的本次招标文件费用');
					return;
				}
			}
//		}
		saveForm(true);

	});
	//重新招标提交
	$("#btnReSubmit").click(function(){
		if(checkForm($("#formName"))){//必填验证，在公共文件unit中
			if($('#pretrialCheckType').val() == 2){
				if(Number($('#pretrialPassNumber').val() < 3)){
					parent.layer.alert('限制人数需大于等于3');
					return
				}
			}
			for(var i = 0;i<bidderArr.length;i++){
				if($('[name="bidPayCosts['+i+'].isPreFee"]:checked').val() == undefined){
					parent.layer.alert('请选择是否免除投标人 '+bidderArr[i].enterpriseName + ' 的本次资格预审文件费用');
					return;
				}
				if($('[name="bidPayCosts['+i+'].isTenderFee"]:checked').val() == undefined){
					parent.layer.alert('请选择是否免除投标人 '+bidderArr[i].enterpriseName + ' 的本次招标文件费用');
					return;
				}
			}
			if(bidSectionId){
				getHasFile('bid', bidSectionId, function(){
					saveForm(false);
				}, '此标段已提交资格预审文件，修改标段信息后请及时更新对应资格预审文件内容');
			}else{
				saveForm(false);
			}
			
			// saveForm(false);
		}
		
	});
	
	$("[name='process']").click(function(){
		var val = $("[name='process']:checked").val();
		if(val == 2) {
			$("[name='pretrialGetFileType'][value=1]").prop("checked", "checked");
			$("[name='pretrialDeliverFileType'][value=1]").prop("checked", "checked");
			$("[name='pretrialOpenType'][value=2]").prop("checked", "checked");
			$("[name='pretrialReviewType'][value=2]").prop("checked", "checked");
		}
		processChange(val);
	});
	//招标文件获取方式
	$(".isOnline input:radio").change(function(){
		var val = $("[name='process']:checked").val();
		processChange(val);
	});
	//是否报名
	$("[name='signUp']").change(function(){
		var val = $(this).val();
		if(val == 1){
			$(".signUpShow").show();
		} else {
			$(".signUpShow").hide();
			$("[name='enterSignUp'][value='0']").prop("checked", "checked");
		}
	});
	pretrialChange($('[name=pretrialCheckType]').val())
	//评审办法
	$('[name=pretrialCheckType]').change(function(){
		var val = $(this).val();
		pretrialChange(val)
	})
	//招标文件是否出售，是否有图纸文件
	$(".pay").each(function(){
		displayInp(this);
	});
	$('.pay').change(function(){
		displayInp(this);		
	});
	//控制价是否发布
	controlPriceChange($("[name='isHasControlPrice']:checked").val());
	$("[name='isHasControlPrice']").change(function(){
		var val = $(this).val();
		controlPriceChange(val);
	});
	//是否联合体
	syndicatedChange($("[name='syndicatedFlag']:checked").val());
	$("[name='syndicatedFlag']").click(function(){
		var val = $("[name='syndicatedFlag']:checked").val();
		syndicatedChange(val);
	});
	isBidFile($('[name=isAdvanceBidFile]:checked').val());
	$("[name='isAdvanceBidFile']").click(function(){
		var val = $("[name='isAdvanceBidFile']:checked").val();
		isBidFile(val);
	});
	//关闭当前窗口
	$("#btnClose").click(function(){
		var index = parent.layer.getFrameIndex(window.name); 
		parent.layer.close(index); 
	});
	//提交
	$("#btnSubmit").click(function(){
		if(checkForm($("#formName"))){//必填验证，在公共文件unit中
			if($('#pretrialCheckType').val() == 2){
				if(Number($('#pretrialPassNumber').val() < 3)){
					parent.layer.alert('限制人数需大于等于3',function(ind){
						parent.layer.close(ind);
						$('#pretrialPassNumber').focus();
					});
					return
				}
			}
			if(id != ''){
				getHasFile('bid', bidSectionId, function(){
					saveForm();
				}, '此标段已提交资格预审文件，修改标段信息后请及时更新对应资格预审文件内容');
			}else{
				saveForm();
			}
		}
		
	});
})
 function passMessage(data){ 
 	$("[name='interiorTenderProjectCode']").val(data.interiorTenderProjectCode);
 	$("[name='tenderProjectName']").val(data.tenderProjectName);
 	if(!data.bidSectionId){
 		if(data.source != 1){
	 	$("[name='bidSectionName']").val(data.tenderProjectName);
	   	$("[name='interiorBidSectionCode']").val(data.interiorBidSectionCode);
	   }
	}
 }
 //交易流程
 function processChange(val){
 	if(val == 1){
		$("[name='pretrialGetFileType'][value=1]").prop("checked", "checked");
		$("[name='pretrialDeliverFileType'][value=1]").prop("checked", "checked");
		$("[name='pretrialOpenType'][value=1]").prop("checked", "checked");
		$("[name='pretrialReviewType'][value=1]").prop("checked", "checked");
		
		$("[name='pretrialOpenType'][value=1]").removeAttr("disabled");
		$("[name='pretrialReviewType'][value=1]").removeAttr("disabled");
		$("[name='pretrialGetFileType'][value=1]").removeAttr("disabled");
		$("[name='pretrialDeliverFileType'][value=1]").removeAttr("disabled");
		$(".isOnline").hide();
		//交易流程选择全流程线上，是否报名选择是，报名是否需要确认默认是，不可修改；
		/* 2022-08-04 屏蔽  是否报名默认否 */
		/* $('[name=enterSignUp][value=0]').attr("checked", "checked");
		$('[name=enterSignUp][value=1]').prop("checked", "checked");
		$('[name=signUp][value=1]').prop("checked", "checked");
		$('[name=signUp][value=0]').attr("checked", "checked"); */
	} else if(val == 2) {
		$(".isOnline input:radio").removeAttr("disabled");
		if($("[name='pretrialGetFileType']:checked").val() == 2){
			$("[name='pretrialDeliverFileType'][value=1]").attr("disabled", "disabled");
			$("[name='pretrialOpenType'][value=1]").attr("disabled", "disabled");
			$("[name='pretrialReviewType'][value=1]").attr("disabled", "disabled");
			
			$("[name='pretrialDeliverFileType'][value=2]").prop("checked", "checked");
			$("[name='pretrialOpenType'][value=2]").prop("checked", "checked");
			$("[name='pretrialReviewType'][value=2]").prop("checked", "checked");
		} else if($("[name='pretrialDeliverFileType']:checked").val() == 2) {
			$("[name='pretrialOpenType'][value=1]").attr("disabled", "disabled");
			$("[name='pretrialReviewType'][value=1]").attr("disabled", "disabled");
			
			$("[name='pretrialOpenType'][value=2]").prop("checked", "checked");
			$("[name='pretrialReviewType'][value=2]").prop("checked", "checked");
		} else if($("[name='pretrialOpenType']:checked").val() == 2) {
			$("[name='pretrialReviewType'][value=1]").attr("disabled", "disabled");
			$("[name='pretrialReviewType'][value=2]").prop("checked", "checked");
		}
		$(".isOnline").show();
		//交易流程选择线上线下相结合，是否报名默认是，不可修改，报名是否需要确认可以修改
		/* $('[name=enterSignUp][value=0]').removeAttr("disabled");
		$('[name=enterSignUp][value=1]').prop("checked", "checked");
		$('[name=signUp][value=1]').prop("checked", "checked");
		$('[name=signUp][value=0]').attr("disabled", "disabled"); */
	}
 }
 function OnInputs(e){
	MoneyInput(e,$("[name='priceUnit']").val());
}
 //费用
function displayInp(obj){  
	var name = $(obj).attr("name");  
	var pay_input =	$(obj).closest("tr").find(".pay_input");
	if($("[name='"+name+"']:checked").val() == 0){  
		pay_input.val("");
		pay_input.removeAttr("datatype");
		$(obj).closest("tr").find(".costShow").hide();
	}else{ 
		pay_input.attr("datatype", "positiveNum");
		$(obj).closest("tr").find(".costShow").show();
	}
	if(typeCode == "A"){
		if($("[name='projectCosts[2].isPay']:checked") == 1){
			$("[name='projectCosts[2].payMoney']").attr("datatype", "positiveNum");
		}
	} else {
		$("[name='projectCosts[2].payMoney']").removeAttr("datatype");
	}
};
 //标段分类选择
 function classifyChange(val){
 	if(val == "A"){
		//工程建设招投标以元为单位；非工程可以万元
		$("[name='contractReckonPrice']").attr("datatype", "positiveNum");
		$("[name='priceUnit']").val("0");
		$("[name='priceUnit']").attr("disabled", "disabled");
		//工程建设招投标以人民币为单位；非工程可选择其他币种
		$("[name='currencyCode']").val("156");
		$("[name='currencyCode']").attr("disabled", "disabled");
		
		// 拟采用评标办法
//		$("[name='checkType']").html(checkTypeData);
//		$("[name='checkType'] option").each(function(){
//			if($(this).attr("value") > 3){
//				$(this).remove();
//			}
//		});
	} else {
		$("[name='contractReckonPrice']").attr("datatype", "positiveNum");
		$("[name='priceUnit']").val("1");
		$("[name='priceUnit']").attr("disabled", "disabled");
		$("[name='currencyCode']").removeAttr("disabled");
		// 拟采用评标办法
//		$("[name='checkType']").html(checkTypeData);
//		$("[name='checkType'] option").each(function(){
//			if($(this).attr("value") <= 3){
//				$(this).remove();
//			}
//		});
	}
	if(val == "A"){
		if(examType == 2){
			if(isPublicProject == 1){  //当招标项目为公共资源时，是否报名为否
				$("[name='signUp'][value=0]").prop("checked", "checked");
				$("[name='signUp'][value=1]").attr("disabled", "disabled");
				$("[name='enterSignUp'][value='0']").prop("checked", "checked");
				$(".signUpShow").hide();
			}
		}
	}
 	
 	
 	
 	if(val == "A"){
 		if($('[name=isAdvanceBidFile]:checked').val() == 1){
 			$(".projectShow").show();
 		}else{
 			$(".projectShow").hide();
 		}
	} else{
		$(".projectShow").hide();
	}
 }
  //控制价是否发布
 function controlPriceChange(val){
 	if(val == 0){
 		$(".controlShow").hide();
 		$("[name='isHasControlPrice'][value=0]").attr("checked", "checked");
 	} else {
 		$(".controlShow").show();
 		$("[name='isHasControlPrice'][value=1]").attr("checked", "checked");
 	}
 }
 //是否联合体投标
 function syndicatedChange(val){
 	if(val == 0){
		$(".syndMain").hide();
		$("[name='consortiumBidding']").attr("disabled", "true");
		$("[name='consortiumBidding']").removeAttr("datatype");
	} else {
		$(".syndMain").show();
		$("[name='consortiumBidding']").removeAttr("disabled");
		$("[name='consortiumBidding']").attr("datatype", "*");
	}
 };
 //预审评审办法
 function pretrialChange(val){
 	if(val == 2){
		$('.limitNum').show();
		$('#pretrialPassNumber').attr('datatype','num');
	}else{
		$('.limitNum').hide();
		$('#pretrialPassNumber').removeAttr('datatype');
	}
 }
 //是否提前编制招标文件
 function isBidFile(val){
 	if(val == 1){
 		$('.abvMakeFile').show();
 		if(typeCode == "A"){
 			$('.projectShow').show();
 		}else{
 			$('.projectShow').hide();
 		}
 	}else{
 		$('.abvMakeFile').hide();
 		$('.projectShow').hide();
 	}
 }
/*
  * 表单提交
  * isSave: true保存， false提交  
  */
 function saveForm(isSave) {
 	
 	var arr = {}, tips="";
 	
 	var url = "";
 	/* 有预审文件时移除所有的，没有时走原来逻辑 */
 	if(isSubFile){
 		$.each($('td'), function(index, item){
 			$(this).find('[data-disabled="*"]').removeAttr('disabled');
 		})
 	}else{//无
 		$('input[type=radio][name=pretrialOpenType]').prop('disabled',false);
 		$('input[type=radio][name=pretrialReviewType]').prop('disabled',false);
 	}
 	arr = parent.serializeArrayToJson($("#formName").serializeArray());
 	for(var key in arr){
 		arr[key] = $.trim(arr[key]);//去前后空格
 	}
 	
 
 	if(source == 1){
 		url = reSaveUrl;
 		if(!isSave){
 			arr.isSubmit = 1;
 		}
   		arr.examType = examType;
 		arr.bidSectionId = bidSectionId;
 	} else {
 		url = saveUrl;
 	} 	
 	
 	if(id != ""){
 		arr.id = id;
 	}
 	if(!arr.currencyCode || !arr.priceUnit){
 		arr.priceUnit = $("[name='priceUnit']").val();
 		arr.currencyCode = $("[name='currencyCode']").val();
 	}
   	arr.tenderProjectClassifyCode = tenderProjectClassifyCode;
 	arr.tenderProjectId = tenderProjectId;
 	
 	/*******报名默认不报名（功能未开发完）********/
// 	arr.signUp = 0;
// 	arr.enterSignUp = 0;
 	/***************************/
	$.ajax({
         url: url,
         type: "post",
         data: arr,
         success: function (data) {
			 if(isSubFile){
			 	$.each($('td'), function(index, item){
			 		$(this).find('[data-disabled="*"]').attr('disabled', true);
			 	})
			 };
         	if(data.success == false){
        		parent.layer.alert(data.message);
        		return;
        	}
         	id = data.data;
            
            if(source == 1){
            	if(!isSave){
            		var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
					parent.layer.close(index); //再执行关闭 
            	} else {
            		parent.layer.alert("保存成功",{icon:1,title:"提示"});
            	}
            	window.parent.$('#tableList').bootstrapTable('refresh');
            }else {
            	parent.layer.alert("添加成功",{icon:1,title:"提示"});
				window.parent.frames[0].bidSectionList();
				var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
				parent.layer.close(index); //再执行关闭 
			}
			 
         },
         error: function (data) {
             parent.layer.alert("加载失败");
         }
	});
 };
 //标段详情
 function getDetail() {
 	var url = "", data={};
	if(bidSectionId != ""){
 		url = detailUrl;
 		data = {bidSectionId:bidSectionId}
 	}
	if(id != ""){
 		url = getUrl;
		data = {id:id}
 	}
	
 	
     $.ajax({
         url: url,
         type: "post",
         data: data,
         async:false,
         success: function (data) {
         	if(data.success == false){
        		parent.layer.alert(data.message);
        		return;
        	}
         	var arr = data.data;
         	for(var key in arr){
         		if(key == "projectCosts"){
         			formatCost(arr[key]);
         		} else if(key == "checkType"){
         			if($("[name='checkType'] option[value='"+arr[key]+"']").length > 0){
         				$("[name='checkType']").val(arr[key]);
         			}
         		} else if(key == "pretrialCheckType"){
         			$("[name='pretrialCheckType']").val(arr[key]);
         			pretrialChange(arr[key]);
         		} else if(key == "syndicatedFlag"){
         			$("[name='syndicatedFlag'][value='"+arr[key]+"']").prop("checked", "checked");
         			syndicatedChange(arr[key]);
         		} else if(key == "isHasControlPrice"){
					controlPriceChange(arr[key]);
				}else {
            		var newEle = $("[name='"+key+"']")
            		if(newEle.prop('type') == 'radio'){
            			newEle.val([arr[key]]);

            		}else if(newEle.prop('type') == 'checkbox'){
            			newEle.val(arr[key]?arr[key].split(','):[]);
            		}else{
            			newEle.val(arr[key]);
            		}
            	}
				
           	}
         	var codes = typeCode;
			if(arr.tenderProjectClassifyCode && typeCode == (arr.tenderProjectClassifyCode.substring(0, 3) == "C50" ? "C50" : arr.tenderProjectClassifyCode.substring(0, 1))){
				codes = arr.tenderProjectClassifyCode;
			}
			
				$(".tenderProjectClassifyCodeTxt").dataLinkage({
					optionName:className,
					optionValue:codes,
					selectCallback:function(code){
						tenderProjectClassifyCode = code;
					}
					
				});
				$(".tenderProjectClassifyCodeTxt select:first").hide();
           	

           	if((arr.pretrialGetFileType == 1 && arr.pretrialDeliverFileType == 1 && arr.pretrialOpenType == 1 && arr.pretrialReviewType == 1) || (!arr.pretrialGetFileType && !arr.pretrialDeliverFileType && !arr.pretrialOpenType && !arr.pretrialReviewType)){
           		$(".isOnline").hide();
           		$("[name='process'][value=1]").prop("checked", true);
           	} else {
           		
				
				if($("[name='pretrialGetFileType']:checked").val() == 1){
					$("[name='pretrialDeliverFileType'][value=1]").removeAttr("disabled");
				} else {
					$("[name='pretrialDeliverFileType'][value=1]").attr("disabled", "disabled");
				}
				$("[name='pretrialOpenType'][value=1]").attr("disabled", "disabled");
				$("[name='pretrialReviewType'][value=1]").attr("disabled", "disabled");
				$(".isOnline").show();
           		$("[name='process'][value=2]").prop("checked", true);
           	}
           	processChange($("[name='process']:checked").val());
         	if(arr.signUp || arr.signUp == "0"){
				$("[name='signUp'][value='"+arr.signUp+"']").prop("checked", "checked");
				if(arr.signUp == 1){
					$(".signUpShow").show();
				} else {
					$("[name='enterSignUp'][value='0']").prop("checked", "checked");
					$(".signUpShow").hide();
				}
			}
         },
         error: function (data) {
             parent.layer.alert("请求失败");
         }
     });
};

//格式化费用
function formatCost(data){ 
	for(var i = 0; i < data.length; i++){ 
		for(var j = 0; j < data.length; j++){ 
			if(data[i].costName == $("[name='projectCosts["+j+"].costName']").val()){
				for(var key in data[i]){
					if(key == "isPay"){
						$("[name='projectCosts["+j+"]."+key+"'][value="+data[i][key]+"]").prop("checked", "checked");
						displayInp("[name='projectCosts["+j+"]."+key+"']");
						
					} else if(key == "payType") {
						$("[name='projectCosts["+j+"]."+key+"']").val(data[i][key]);
						winBid(data[i][key], data[i].discount);
						
					} else {
						$("[name='projectCosts["+j+"]."+key+"']").val(data[i][key]);
					}
				}
				break;
			}
		}
		
	}
	if(examType == 2){
		$("[name='projectCosts[3].payMoney']").removeAttr("datatype");
	}
	if(typeCode == "A"){
		if($("[name='projectCosts[2].isPay']:checked") == 1){
			$("[name='projectCosts[2].payMoney']").attr("datatype", "positiveNum");
		}
	} else {
		$("[name='projectCosts[2].payMoney']").removeAttr("datatype");
	}
}
/*新增时查询购买过招标文件的投标人是否需要再次购买列表*/
function getReTenser(bid){
	$.ajax({
		type:"post",
		url:reBidder,
		async:true,
		data: {
			'bidSectionId':bid
		},
		success: function(data){
			if(data.success){
				if(data.data.length > 0){
					bidderArr = data.data;
					reTenderList(data.data);
				}
			}else{
				parent.layer.alert(data.message)
			}
		}
	});
}
/*编辑时查询购买过招标文件的投标人是否需要再次购买列表*/
function getReTenserList(bid){
	$.ajax({
		type:"post",
		url:reEditBidder,
		async:true,
		data: {
			'bidSectionId':bid
		},
		success: function(data){
			if(data.success){
				if(data.data.length > 0){
					bidderArr = data.data;
					reTenderList(data.data);
				}
			}else{
				parent.layer.alert(data.message)
			}
		}
	});
}
//重新招标选择标段后查询标段下购买过文件的投标人列表
function reTenderList(data){
	var tHtml = '';
	for(var i = 0;i<data.length;i++){
		var able = false;
		if(data[i].isCanDownload && data[i].isCanDownload == 1){
			able = true
		}
		tHtml += '<tr>';
			tHtml += '<td style="width: 50px;text-align: center;">'+(i+1)+'</td>';
			tHtml += '<td>'+data[i].enterpriseName+'</td>';
			tHtml += '<td style="width: 220px;">';
				tHtml += '<input type="hidden" name="bidPayCosts['+i+'].enterpriseId" value="'+data[i].enterpriseId+'"/>';
				tHtml += '<input type="hidden" name="bidPayCosts['+i+'].enterpriseName" value="'+data[i].enterpriseName+'"/>';
				tHtml += '<label style="padding-right: 20px;margin-bottom: 0;">';
            		tHtml += '<input type="radio" name="bidPayCosts['+i+'].isPreFee" '+(data[i].isPreFee == 1?"checked":"")+' class="isPreFee isCost" value="1" style="vertical-align: -2px;margin-right: 5px;" />是';
            	tHtml += '</label>';
                tHtml += '<label style="padding-right: 20px;margin-bottom: 0;">'
                	tHtml += '<input type="radio" name="bidPayCosts['+i+'].isPreFee" '+(data[i].isPreFee == '0'?"checked":"")+' class="isPreFee isCost" value="0" style="vertical-align: -2px;margin-right: 5px;" />否';
                tHtml += '</label>';
			tHtml += '</td>';
			tHtml += '<td style="width: 200px;">';
				tHtml += '<label style="padding-right: 20px;margin-bottom: 0;">';
            		tHtml += '<input type="radio" '+((data[i].isCanDownload && data[i].isCanDownload == 1)?"":"disabled")+' name="bidPayCosts['+i+'].isTenderFee" '+(data[i].isTenderFee == 1?"checked":"")+' class="isTenderFee isCost" value="1" style="vertical-align: -2px;margin-right: 5px;" />是';
            		if(!(data[i].isCanDownload && data[i].isCanDownload == 1)){
            			tHtml += '<input type="hidden" name="bidPayCosts['+i+'].isTenderFee" value="0"/>'
            		}
            	tHtml += '</label>';
                tHtml += '<label style="padding-right: 20px;margin-bottom: 0;">'
                	tHtml += '<input type="radio" '+((data[i].isCanDownload && data[i].isCanDownload == 1)?"":"disabled checked")+' name="bidPayCosts['+i+'].isTenderFee" '+(data[i].isTenderFee == '0'?"checked":"")+' class="isTenderFee isCost" value="0" style="vertical-align: -2px;margin-right: 5px;" />否';
                tHtml += '</label>';
			tHtml += '</td>';
		tHtml += '</tr>';
	}
	$(tHtml).appendTo('#re_tender tbody');
}