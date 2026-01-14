var entryUrl = config.tenderHost + '/getEmployeeInfo.do';  //获取登录人信息
var optionUrl = config.Syshost + '/SysDictController/findOptionsByName.do';	// 获取下拉框
var optionValueUrl = config.Syshost + '/OptionsController/getValue.do';	// 获取指定的值

var modelOptionUrl = config.tenderHost + '/TempBidWebController/findTempBidWebList.do';//模板下拉框
var modelUrl =config.tenderHost + '/TempBidWebController/toTemplat.do';//模板地址

var findProjectDetailUrl = config.tenderHost + '/TenderProjectController/findTenderProjectType.do'

var urlCheckBlackList = config.Hgh + '/blackListController/checkBlackList';//黑名单接口

var widthCode = {"min-width":"200px", "word-wrap": "break-word", "word-break": "break-all", "white-space": "normal"};  //编码宽度可换行
var widthName = {"min-width":"300px", "word-wrap": "break-word", "word-break": "break-all", "white-space": "normal"};  //名称宽度可换行
var widthDate = {"width":"200px", "white-space":"nowrap"};  //时间不可换行
var widthState = {"width":"120px", "white-space":"nowrap"};  //状态不可换行
var widthNowrap = {"white-space":"nowrap"}; //操作不可换行



var entryData;
function entryInfo(){
	$.ajax({
		type:"post",
	  	url:entryUrl,
	  	async:false,
	  	beforeSend: function(xhr) {
			xhr.setRequestHeader("Token", sessionStorage.getItem('token'));
		},
	  	success: function(data){
	  		if(data.success){
	  			entryData = data.data
	  		}
	  	},
	  	error: function(){
	  		
	  	},
	})
	return entryData
}
var tenderTypeData={
	"A":"工程",
	"B":"货物",
	"C":"服务",
	"C50":"广宣类"
}
function getTenderType(val){
	var type = (val.substring(0,3) == "C50" ? "C50" : val.substring(0,1));
	return tenderTypeData[type];
}
//常用变量列表
if(!window.top.options){
	window.top.options = {
		// 项目类型
		projType: {optionName:"",val:{"0":"无", "1":"融资"}, isCustom:true},
		
		//性别
		sex: {val:{"0":"男","1": "女"}, isCustom:true},
		
		// 项目状态
		projState: {val:{"0":"未提交", "1":"审核中", "2":"审核通过", "3":"审核未通过","4":"已撤回"}, isCustom:true},
		// 标室预约状态
		appointmentState: {val:{"0":"未提交", "1":"审核中", "2":"审核通过", "3":"审核未通过"}, isCustom:true},
		
		//招标方式
		tenderType: {val:{"1":"公开招标", "2":"邀请招标", "9":"其他"}, isCustom:true},
		
		//招标组织形式
		tenderOrgForm: {val:{"1":"自行招标", "2":"委托招标", "9":"其他"}, isCustom:true},
		
		//资格审查方式
		examType:{val:{"1":"资格预审", "2":"资格后审"}, isCustom:true},
		
		//开标方式
		bidOpenMethod:{val:{"1":"线上开标", "2":"线下开标"}, isCustom:true},
		
		//公告性质
		noticeNature:{val:{"1":"正常公告", "2":"更正公告", "3":"重发公告", "9":"其他"}, isCustom:true},
		
		//公告类型
		bulletinType:{val:{"1":"招标公告", "2":"资格预审公告", "3":"中标结果公告", "9":"其他"}, isCustom:true},
		
		//接收状态
		receiveState:{val:{"0":"未接收", "1":"已接收", "2":"拒绝", "3":"驳回"}, isCustom:true},
		
		//招标方式
		tenderMode:{val:{"1":"公开招标", "2":"邀请招标"}, isCustom:true},
		
		//招标组织形式
		tenderOrganizeForm:{val:{"1":"自行招标", "2":"委托招标"}, isCustom:true},
		
		//是否按招标项目评审
		isProjectCheck:{val:{"0":"否", "1":"是"}, isCustom:true},
		
		//市场类型
		marketType:{val:{"SH":"社会市场", "DF":"东风市场"}, isCustom:true},
		
		//拟采用的评标办法
		pretrialCheckType:{val:{"1":"合格制", "2":"有限数量制", "3":"评审制"}, isCustom:true},
		
		//标室所在区域
		areaCode:{val:{"4206":"襄阳市", "4203":"十堰市", "4201":"武汉市", "6101":"西安市", "1101":"北京市", "1306":"保定市", "4401":"广州市", "5001":"重庆市"}, isCustom:true},
		
		
		//行政监督部门名称
		superviseDeptCode:{optionName:"SUPERVISE_DEPT_CODE"},
		
		//审核部门名称
		approveDeptCode:{optionName:'APPROVE_DEPT_CODE'},
		
		//资金来源
		fundSource:{optionName:"MONEY_FROM"},
		
		//襄樊行政区域
		regionCode:{optionName:"REGION_CODE"},
		
		//企业类别
		tendererCodeType:{optionName:"TENDERER_CODE_TYPE"},
		
		//行业分类
		industriesType:{optionName:"INDUSTRIES_TYPE"},
		//招标项目类型
		tenderProjectType:{optionName:"TENDER_PROJECT_TYPE"},
		//标段分类
		tenderProjectClassifyCode:{optionName:"TENDER_PROJECT_CLASSIFY_CODE"},
		//不进厂标段分类
		tenderProjectClassifyCode0:{optionName:"TENDER_PROJECT_CLASSIFY_0CODE"},
		
		//评标办法
		checkTypeA:{optionName:'CHECK_TYPE_A'},
		checkTypeB:{optionName:'CHECK_TYPE_B'},
		checkTypeC:{optionName:'CHECK_TYPE_C'},
		//证件类型
		identityCardType:{optionName:'ID_CARD_TYPE'},
		//保证金收取人
		depositCollect:{optionName:'DEPOSIT_COLLECT'},
		//异议阶段
//		objectionType:{val:{"1":"资格预审文件","2":"资格文件开启","3":"资格评审","4":"招标文件","5":"开标","6":"评审","7":"中标候选人公示"}, isCustom:true},
		objectionType:{val:{"1":"资格预审文件","4":"招标文件","5":"开标","7":"中标候选人公示"}, isCustom:true},
		//项目类别
		relateCode:{val:{'0':'无','1':'固定资产类项目'}, isCustom:true},
		
		//民族
		nation:{optionName:'NATION'},
		//政治面貌
		politicCountenance:{optionName:'POLITIC_COUNTENANCE'},
		//健康状况
		healthyStatu:{optionName:'HEALTHY_STATU'},
		//学历
		education:{optionName:'EDUCATION'},
		//学位
		academicDegree:{optionName:'ACADEMIC_DEGREE'},
		//职称
		professional:{optionName:'PROFESSIONAL'},
		//职业资格
		qualType:{optionName:'QUAL_TYPE'},
		//经济类型
		economicType:{optionName:'Economic'},
		//金额单位
		regCapCurrency:{optionName:'CURRENCY'},
		//企业行业分类
		industryType1:{optionName:'CATEGORY_CODE_LEVEL1'}, 
		industryType2:{optionName:'CATEGORY_CODE_LEVEL2'},
		industryType3:{optionName:'CATEGORY_CODE_LEVEL3'},
		
		//境外企业
		countryRegion:{optionName:'COUNTRY_CODE'},
		//媒体类型
		mediaName:{optionName:'PUBLISH_MEDIA_NAME'},
		
	}
}

options = window.top.options;

//下拉框数据绑定
function initData(){
	var option = '';
	for(var key in Enums){
		for(var ins in Enums[key]){
			option = '<option value="'+ins+'">' + Enums[key][ins] + '</option>';
			$("#" + key).append(option)
		}
	}
}
//下拉框数据绑定，后台传值为文字时，一次调用
function initSelect(obj){
	obj = obj ? obj : ".selectInit";
	obj =  $(obj);
	$.each(obj, function(item, obj) {
		var val = $(this).attr("data-value");
		if(!val && val != 0){
			initOPtion(this);
		} else {
			initOPtion(this, val);
		}
	});
}

//下拉框数据绑定,后台传值为数字是回显信息，要多次调用
function initOPtion(obj,val){
	obj =  $(obj);
	var name = obj.attr("selectName");
	var option = getOptions(name);
	var  optionHtml = "";
	if(option){
		var selected = ""; 
		if(option.isCustom){
			for(var i in option.val){
				if(val == i){
					selected = 'selected';
				} else {
					selected = "";
				}
				optionHtml += '<option ' + selected + ' value="'+i+'">' + option.val[i] + '</option>';
			}
		}else {
			for(var i = 0; i < option.val.length; i++){
				if(val == option.val[i].optionValue){
					selected = 'selected';
				} else {
					selected = "";
				}
		 		optionHtml += '<option ' + selected + ' value="'+option.val[i].optionValue+'">' + option.val[i].optionText + '</option>';
		 	}
		}
		obj.html(optionHtml);
	}
}
//下拉框反显
function getOptions(name){
	if(!options[name].val){
		if(options[name].optionName == 'TENDER_PROJECT_CLASSIFY_CODE'){
			options[name].optionName = 'TENDER_PROJECT_CLASSIFY_0CODE';
		}
		$.ajax({
			type:"post",
		  	url:optionUrl,
		  	async:false,
		  	data:{"optionName":options[name].optionName},
		  	success: function(data){
		  		if(data.success){
		  			 options[name].val = data.data;
		  			options[name].txt = {};
					for(var i in data.data){
						if(data.data[i].optionValue){
							var key = data.data[i].optionValue +"";
							options[name].txt[key] = data.data[i].optionText
						}
					}
		  		}
		  	}
		})
	}
	return options[name];
}

/*
 * 获取option的值
 * name: 下拉框的名称
 * val:返回的值
*/
function getOptionValue(name,val){
	var text = null;
	if(options[name]){
		if(options[name].val){
			if(options[name].isCustom){
				text = options[name].val[val];
			} else {
				text = options[name].txt[val];
			}
		}else{
			if(options[name].optionName){
				var option = getOptions(name);
				if(option.isCustom){
					text = option.val[val];
				} else {
					text = option.txt[val];
				}
				
			}else{
				alert("请配置option."+name+"的optionName");
			}
		}
	}else{
		alert("请配置option."+name);
	}
	return text;
}

/*
 * 回显option的值
 * ele: 元素id,class....
 * val:返回的值
*/
function optionValueView(ele,val){
	ele =  $(ele);
	var name = ele.attr("optionName");
	if(name){
		ele.html(getOptionValue(name, val));
	}else{
		ele.html(val);
	}
}
/*下拉框默认回显
 *  ele: 元素id,class....
 * valu:默认反显的option的value值
 */
function selectDefault(ele,valu){
	var options = $(ele).find('option');
	for(var i= 0;i<options.length;i++){
		if($(options[i]).val() == valu){
			options[i].selected=true;
		}
	}
}


//审核类型
var reviewTypeData = {
	xmsp:"项目",
	zbxmsp:"招标项目",
	zbwjsp:"招标文件",
	bcsm:"补充说明",
	jggs:"招标采购结果公示",
	hxrgs:"招标采购候选人公示",
	zbjgtz:"中标结果通知",
	kzjsp:"控制价",
	xjcggg:"询价采购公告",
	zbcggg:"招标采购公告",
	xxkbjgjl:"线下开标结果录入",
	yqhsp:"邀请函审核",
	zbycgs:"招标异常",
	psbgsp:"线下评审结果录入",
	zbjggs:"中标结果公示",
	ysjggs:'预审结果',
	ysjgtz:'预审结果通知',
	yscggg:'预审公告',
	zgyswjsp:'资格预审文件审批',
	gdsp:'项目资料归档审批'
}

/*function differTime(time){
	var second = time*24*60*60*1000;
	return second
}*/
/*根据规则自动设定其他时间默认值；
 * time：基础时间
 * num：要设定的时间与基础时间之间相差的天数
 */
function automatic(time,num){
	time.replace(/\-/g,"/");
	var startData =new Date(time); 
       startData.setDate(startData.getDate()+num);
    return   startData.Format("yyyy-MM-dd hh:mm")
};
/*根据规则自动设定其他时间默认值；
 * time：基础时间
 * num：要设定的时间与基础时间之间相差的小时
 */
function autoHoure(time,num){
	time.replace(/\-/g,"/");
	var startData =new Date(time); 
    startData.setHours(startData.getHours()+num);
    return startData.Format("yyyy-MM-dd hh:mm")
};

//补0操作
function getzf(num){  
    if(parseInt(num) < 10){  
        num = '0'+num;  
    }  
    return num;  
}

//日历
var nowDate = top.$("#systemTime").html() + " " + top.$("#sysTime").html();
//开始时间
$('.time').click(function(){
	WdatePicker({
		el:this,
		dateFmt:'yyyy-MM-dd HH:mm',
		minDate:nowDate
	})
	
});

$('.calendar_icon').click(function(){
	$(this).closest('div').find('input').focus();
});

/**
 * 数值输入限制方法
 * @param {Object} e  文本元素
 * @param {Object} num  小数位数
 */

function priceInput(e, num){
	var regu = /^[0-9]+\.?[0-9]*$/;
	if(e.value != "") {
		if(!regu.test(e.value)) {
			parent.layer.alert("请输入正确的数字");
			e.value = e.value.substring(0, e.value.length - 1);
			e.value = "";
			e.focus();
		} else {
			if(num == 0) {
				if(e.value.indexOf('.') > -1) {
					e.value = e.value.substring(0, e.value.length - 1);
					e.focus();
				}
			}
			if(e.value.indexOf('.') > -1) {
				if(e.value.split('.')[1].length > num) {
					e.value = e.value.substring(0, e.value.length - 1);
					e.focus();
				}
			}
		}
	}
};
/**
 * 金额输入限制方法
 * @param {Object} e  文本元素
 * @param {Object} num  金额单位   0是元    1是万元
 */

function MoneyInput(e, unit){
	var num;
	var regu = "";
	if(unit == 1){
		regu = /^(([1-9][0-9]{0,13})|(0))(\.[0-9]{1,6})?$/;
		num = 6;
	} else {
		regu = /^(([1-9][0-9]{0,13})|(0))(\.[0-9]{1,2})?$/;
		num = 2;
	}
	
	if(e.value != "") {
		if(!regu.test(e.value)) {
			parent.layer.alert("请输入正确的数字");
			e.value = "";
			e.focus();
		}
	}
};
//时间
function NewDate(str){  
  if(!str){  
    return 0;  
  }  
  arr=str.split(" ");  
  d=arr[0].split("-");  
  t=arr[1].split(":");
  var date = new Date();   
  date.setUTCFullYear(d[0], d[1] - 1, d[2]);   
  date.setUTCHours(t[0]-8, t[1], t[2], 0);
  return date.getTime();  
}
//文件大小换算
function changeUnit(size){
	var num = Number(size);
	if(num >= 1024 * 1024 * 1024) {
		return (num/1024/1024/1024).toFixed(2) + "G";
	} else if(num >= 1024 * 1024 && num < 1024 * 1024 * 1024){
		return (num/1024/1024).toFixed(2) + "M";
	} else if(num >= 1024 && num < 1024*1024) {
		return (num/1024).toFixed(2) +"KB";
	} else { 
		return num + "B";
	}
}
/*
 * 输入验证
 * maxLength: 最大输入长度
 * type: 
 * number 纯数字
 * numLetter 数字与字母
 */
function keyTest(ele,type,maxLength,tips){
	var regu = '';
	var testType = {
		'number': /^[0-9][0-9]*$/,
		'numLetter':/^[a-zA-Z0-9][a-zA-Z0-9]*$/,
		'mobile': /^1[3456789]\d{9}$/
	};
	for(var key in testType){
		if(key == type){
			regu = testType[key]
		}
	}
	if(regu == ''){
		alert('请配置验证类型');
		return
	}
	if(ele.value != "") {
		if(regu.test(ele.value)) {
			if(maxLength) {
				if(ele.value.length > maxLength) {
					ele.value = ele.value.substring(0, ele.value.length - 1);
					ele.focus();
				}
			}
		} else {
			if(tips){
				parent.layer.alert(tips,function(ind){
					parent.layer.close(ind);
					ele.focus();
					ele.value = '';
				});
			}else{
				parent.layer.alert("请输入正确的值",function(ind){
					parent.layer.close(ind);
					ele.focus();
					ele.value = '';
				});
			}
			
		}
	}
}
/*
 * 输入长度验证
 * maxLength: 最大输入长度
 */
function maxTest(ele,maxLength,isEmpty){
//	console.log(ele.value.length)
	if(ele.value != "") {
		if(ele.value.replace(/\s+/g,"").length > maxLength) {
//			ele.value = ele.value.substring(0, maxLength - 1);
			$(ele).addClass('red');
			layer.alert('输入长度超过限制长度'+maxLength+'位');
			if(isEmpty){
				ele.value = '';
			}
		}else{
			$(ele).removeClass('red');
		}
	}
}

//var noticeMedia = {
//	'001':'东风电子采购网站',
//	'000':'中国招标投标公共服务平台',
//	'002':'湖北省公共资源交易电子服务平台',
//	'003':'襄阳市公共交易平台',
//	'006':'广州公共资源交易公共服务平台',
//	'007':'武汉公共资源交易服务网',
//	'005':'中国采购与招标网'
//};



/***
 * 公告发布媒体
 * 1）	依法必招的项目强制勾选中国招标投标公共服务平台，不可修改；非依法必招的项目默认勾选，可以修改。
 * 2）	所有项目均强制勾选东风交易中心（企采平台），仅一种情况除外：邀请类项目后续的公示公告默认勾选，可以修改。
 * @param {Object} para
 */
function initMedia(para){
	var noticeMedia;
	noticeMedia = getOptions("mediaName").txt;

	var options = {
		target:".media-box",
		isDisabled:false,  //是否可选
		check:"",  //选中的类型 
		proType:{}  //项目属性examType资格审查方式 tenderMode 1为公开招标，2为邀请招标 isLaw是否依法 0-否   1是 isPublicProject是否公共资源项目  0否  1是
		
	}
	$.extend(options, para);
	$(options.target).html("");
	if(options.check == ""){
		options.check = [];
	} else {
		options.check = options.check.split(",");
	}
	var html = "";
	if(options.check.length == 0){
		options.check = ["000", "001"]
//		if(options.isPublicProject == 1){
//			options.check = ["003", "000","001"];
//		} else {
//			if(options.isLaw == 1){
//				options.check = ["001", "000"]
//			} else {
//				options.check = ["001"];
//			}
//		}
	}
	var checked = false;
	for(var key in noticeMedia){
		checked = false;
		for(var i = 0; i < options.check.length; i++){
			if(key == options.check[i]){
				checked = true;
				break;
			}
		}
		var isDisabled = options.isDisabled ? 'disabled=disabled' : '';
		if(options.proType.isLaw == 1 && !options.isDisabled){    //依法
			if(options.proType.tenderMode == 1 && key == "000"){
				isDisabled = 'disabled="disabled"';
			}
			if(options.proType.tenderMode == 1 && key == "001"){  //公开招标
				isDisabled = 'disabled="disabled"';
			}
		}
		html += '<div><input type="checkbox" class="noticeMedia '+(isDisabled ? "mediaDisabled" : "")+'" '+isDisabled+' '+(checked?'checked=checked':'')+' name="noticeMedia" value="'+key+'" style="margin-right: 5px;"/>'+noticeMedia[key]+'</div>';
	}
	$(html).appendTo(options.target);
}

/***
 * 获取标段信息
 * @param {Object} id  标段id
 */
function findProjectDetail(id){
	var rst;
	$.ajax({
		type:"post",
		url:findProjectDetailUrl,
		async:false,
		data:{bidSectionId: id},
		success:function(data){
			var arr = data.data;
			if(!data.success){
				top.layer.alert(data.message);
				return;
			}
			rst = data.data;
		}
	});
	return rst;
}


//模板列表
function modelOption(para){
	$.ajax({
		type:"post",
		url:modelOptionUrl,
		async:true,
		data:para,
		success:function(data){
			var arr = data.data;
			if(data.success){
				var option="";
				option = '<option value="">请选择模板</option>';
				for(var i=0;i<arr.length;i++){
					option += '<option data-model-id="'+arr[i].id+'" data-model-url="'+arr[i].url+'">'+arr[i].tempName+'</option>';
					
				}
				$('#noticeTemplate').append(option);
			}
		}
	});
}

//生成模版
function modelHtml(para){
	ue.setContent('');
	var index = parent.layer.load();
	$.ajax({
		type:"post",
		url:modelUrl,
		async:true,
		data:para,
		success:function(data){
			if(data.success){
				ue.setContent(data.data);
				parent.layer.close(index); 
			}else{
				parent.layer.close(index);
			}
		}
	});
	
}
//时间转换
function GetTime(time) {
	var date = new Date(time.replace(/\-/g,"/")).getTime();
	return date;
};

/**
*  2020-12-21
*  黑名单验证
*/	
function showTip(link,data){
	/**
	 link:              tip:
	a)报名：				“贵公司被东风汽车集团（或企业名称）列入黑名单，禁止业务领域是xxx，禁入有效期为xxx，不能参加该项目投标”
	b)邀请：				“该投标人被东风汽车集团（或企业名称）列入黑名单，禁止业务领域是xxx，禁入有效期为xxx，不能参加该项目投标”
	b1)全选邀请：		“xxx被东风汽车集团（或企业名称）列入黑名单，禁止业务领域是xxx，禁入有效期为xxx，不能参加该项目投标”
	c)被邀请：			“贵公司被东风汽车集团（或企业名称）列入黑名单，禁止业务领域是xxx，禁入有效期为xxx，不能参加该项目投标”
	d)下载\购买招标文件：“贵公司被东风汽车集团（或企业名称）列入黑名单，禁止业务领域是xxx，禁入有效期为xxx，不能参加该项目投标”
	e)递交投标文件：		“贵公司被东风汽车集团（或企业名称）列入黑名单，禁止业务领域是xxx，禁入有效期为xxx，不能参加该项目投标”
	f)开标：				“贵公司被东风汽车集团（或企业名称）列入黑名单，禁止业务领域是xxx，禁入有效期为xxx，不能参加该项目投标”
	g)确定中标人：		“该投标人被东风汽车集团（或企业名称）列入黑名单，禁止业务领域是xxx，禁入有效期为xxx，不能被确定为中标人”
	h)中标结果通知书：	“该投标人被东风汽车集团（或企业名称）列入黑名单，禁止业务领域是xxx，禁入有效期为xxx，无法发送中标通知书”
	 */
	//接口开发者反馈:永久禁止和最新禁用时间会在第一条
	var message='';
	switch(link){
		case 'a': 
		case 'c':
		case 'd':
		case 'e':
		case 'f':
			message = '贵公司被【'+ data.data["0"].createdEnterPriseName +'】列入黑名单，禁止业务领域是【'+ data.data["0"].projectType +'】，禁入有效期为【'+ data.data["0"].limitDate +'】，不能参加该项目投标';
			//parent.layer.alert( '贵公司被【'+ data.data["0"].createdEnterPriseName +'】列入黑名单，禁止业务领域是【'+ data.data["0"].projectType +'】，禁入有效期为【'+ data.data["0"].limitDate +'】，不能参加该项目投标');
			break;
		case 'b':
			message = '该投标人被【'+ data.data["0"].createdEnterPriseName +'】列入黑名单，禁止业务领域是【'+ data.data["0"].projectType +'】，禁入有效期为【'+ data.data["0"].limitDate +'】，不能参加该项目投标';
			//parent.layer.alert( '该投标人被【'+ data.data["0"].createdEnterPriseName +'】列入黑名单，禁止业务领域是【'+ data.data["0"].projectType +'】，禁入有效期为【'+ data.data["0"].limitDate +'】，不能参加该项目投标');
			break;
		case 'b1':
			message = '【'+data.data["0"].enterpriseName +'】被【'+ data.data["0"].createdEnterPriseName +'】列入黑名单，禁止业务领域是【'+ data.data["0"].projectType +'】，禁入有效期为【'+ data.data["0"].limitDate +'】，不能参加该项目投标';
			//parent.layer.alert( '【'+data.data["0"].enterpriseName +'】被【'+ data.data["0"].createdEnterPriseName +'】列入黑名单，禁止业务领域是【'+ data.data["0"].projectType +'】，禁入有效期为【'+ data.data["0"].limitDate +'】，不能参加该项目投标');
			break;
		case 'g':
			message = '该投标人被【'+ data.data["0"].createdEnterPriseName +'】列入黑名单，禁止业务领域是【'+ data.data["0"].projectType +'】，禁入有效期为【'+ data.data["0"].limitDate +'】，不能被确定为中标人';
			//parent.layer.alert( '该投标人被【'+ data.data["0"].createdEnterPriseName +'】列入黑名单，禁止业务领域是【'+ data.data["0"].projectType +'】，禁入有效期为【'+ data.data["0"].limitDate +'】，不能被确定为中标人');
			break;
		case 'h':
			message = '该投标人被【'+ data.data["0"].createdEnterPriseName +'】列入黑名单，禁止业务领域是【'+ data.data["0"].projectType +'】，禁入有效期为【'+ data.data["0"].limitDate +'】，无法发送中标通知书'; 
			//parent.layer.alert( '该投标人被【'+ data.data["0"].createdEnterPriseName +'】列入黑名单，禁止业务领域是【'+ data.data["0"].projectType +'】，禁入有效期为【'+ data.data["0"].limitDate +'】，无法发送中标通知书');
			break;
		default:
			message = '不存在该环节提示信息';
			//parent.layer.alert( '不存在该环节提示信息');
	}
	return message;
}

function checkBlackList(enterpriseCode,projectType,link) {
	//var projectType = '';//业务类型 工程A 货物B 服务C 广宣C50
	//var enterpriseCode = '';//供应商信用编码
	var tenderType = 4;//采购方式 4；招标项目
	var platformCode = '00270009';//广宣平台编码 
	/**
	BLACL_INFO_PLATFORM_CODE_DF("00270007","东风业务咨询管理系统"),
	BLACL_INFO_PLATFORM_CODE_GX("00270009","广宣采购平台"),
	BLACK_INFO_PLATFORM_CODE_QC("07100003","企采平台"),
	**/
	//var link;//环节 不同环节调用黑名单验证，提示不同信息
	var isCheckBlackList = false;//黑名单验证状态 true:存在于黑名单中 false:不存在于黑名单中 默认false
	var message ='';
	var parm ={};
	projectType = projectType.substring(0,3) == "C50" ? "C50" : projectType.substring(0,1);
	 $.ajax({
	     url: urlCheckBlackList,
		 async:false, //关闭异步
	     type: "get", //借口定义的get方法
	     data: {enterpriseCode:enterpriseCode,
				platformCode:platformCode,
				projectType:projectType,
				tenderType:tenderType},
	     success: function (data) {
			if(data.success){
				//在黑名单中，状态为true
				isCheckBlackList=true;
				//根据环节，提示不同信息
				message = showTip(link,data);
			}
			else{
				console.log(data.message);
				isCheckBlackList=false;
			}
		 },
	     error: function (data) {
			parent.alert("验证失败");
	     }
	 });
	parm.isCheckBlackList = isCheckBlackList;
	parm.message =message;
	return parm;
}

