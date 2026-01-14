var entryUrl = config.tenderHost + '/getEmployeeInfo.do';  //获取登录人信息
var optionUrl = config.Syshost + '/SysDictController/findOptionsByName.do';	// 获取下拉框
var optionValueUrl = config.Syshost + '/OptionsController/getValue.do';	// 获取指定的值

var token = $.getUrlParam("Token");
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
//常用变量列表
if(!window.top.options){
	window.top.options = {
		// 项目类型
		projType: {optionName:"",val:{"0":"无", "1":"融资"}},
		
		//性别
		sex: {val:{"0":"男","1": "女"}},
		
		// 项目状态
		projState: {val:{"0":"未提交", "1":"审核中", "2":"审核通过", "3":"审核未通过"}},
		// 标室预约状态
		appointmentState: {val:{"0":"未提交", "1":"审核中", "2":"审核通过", "3":"审核未通过"}},
		
		//招标方式
		tenderType: {val:{"1":"公开招标", "2":"邀请招标", "9":"其他"}},
		
		//招标组织形式
		tenderOrgForm: {val:{"1":"自行招标", "2":"委托招标", "9":"其他"}},
		
		//资格审查方式
		examType:{val:{"1":"资格预审", "2":"资格后审"}},
		
		//开标方式
		bidOpenMethod:{val:{"1":"线上开标", "2":"线下开标"}},
		
		//公告性质
		noticeNature:{val:{"1":"正常公告", "2":"更正公告", "3":"重发公告", "9":"其他"}},
		
		//公告类型
		bulletinType:{val:{"1":"招标公告", "2":"资格预审公告", "3":"中标结果公告", "9":"其他"}},
		
		//接收状态
		receiveState:{val:{"0":"未接收", "1":"已接收", "2":"拒绝", "3":"驳回"}},
		
		//招标方式
		tenderMode:{val:{"1":"公开招标", "2":"邀请招标"}},
		
		//招标组织形式
		tenderOrganizeForm:{val:{"1":"自行招标", "2":"委托招标"}},
		
		//是否按招标项目评审
		isProjectCheck:{val:{"0":"否", "1":"是"}},
		
		//市场类型
		marketType:{val:{"df":"东风市场", "sh":"社会市场"}},
		
		//拟采用的评标办法
		pretrialCheckType:{val:{"1":"合格制", "2":"有限数量制", "3":"评审制"}},
		
		
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
		//评标办法
		checkType:{optionName:'CHECK_TYPE'},
		//证件类型
		identityCardType:{optionName:'ID_CARD_TYPE'},
		//保证金收取人
		depositCollect:{optionName:'DEPOSIT_COLLECT'},
		//异议阶段
		objectionType:{val:{"1":"资格预审文件","2":"资格文件开启","3":"资格评审","4":"招标文件","5":"开标","6":"评审","7":"中标候选人公示", "9": "项目异常公示"}},
		//项目类别
		relateCode:{val:{'0':'无','1':'固定资产类项目'}},
		
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
			initOPtion(this);
	});
}

//下拉框数据绑定,后台传值为数字是回显信息，要多次调用
function initOPtion(obj,val){
	obj =  $(obj);
	var name = obj.attr("selectName");
	var option = getOptions(name);
	var  optionHtml = "";
	if(option){
		for(var i in option){
			var selected = ""; 
			if(val == i){
				selected = 'selected';
			}
		 	optionHtml += '<option ' + selected + ' value="'+i+'">' + option[i] + '</option>';
		};
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
		  			options[name].val = {};
					for(var i in data.data){
						if(data.data[i].optionValue){
							var key = data.data[i].optionValue +"";
							options[name].val[key] = data.data[i].optionText
						}
					}
		  		}
		  	}
		})
	}
	return options[name].val;
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
			text = options[name].val[val];
		}else{
			if(options[name].optionName){
				var option = getOptions(name);
				text = option[val];
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
	ysxxkqjgsp:"预审线下开启结果审批",
	xxkbjgjl:"线下开标结果录入",
	yqhsp:"邀请函审核",
	zbycgs:"招标异常",
	psbgsp:"线下评审结果录入",
	yspsbgsp:"预审线下评审结果录入",
	zbjggs:"中标结果公示"
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
	/*var baseTime = Date.parse(new Date(time));
	var addDate = differTime(num);
	var newDate = baseTime + addDate;
	var lastTime = getMyDate(newDate)*/
	var startData =new Date(time); 
       startData.setDate(startData.getDate()+num);
    return   startData.Format("yyyy-MM-dd hh:mm")
//	return	lastTime
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
/*function getMyDate(str){  
	var oDate = new Date(str),  
		oYear = oDate.getFullYear(),  
		oMonth = oDate.getMonth()+1,  
		oDay = oDate.getDate(),  
		oHour = oDate.getHours(),  
		oMin = oDate.getMinutes(),  
		oSen = oDate.getSeconds(),  
		oTime = oYear +'-'+ getzf(oMonth) +'-'+ getzf(oDay) +' '+ getzf(oHour) +':'+ getzf(oMin);//最后拼接时间  
	return oTime;  
}; */
//补0操作
function getzf(num){  
    if(parseInt(num) < 10){  
        num = '0'+num;  
    }  
    return num;  
}

//日历

if($('.time').length > 0){
	$('.time').datetimepicker({
		step:1,
		lang:'ch',
		format:'Y-m-d H:i',
	});
}
$('.calendar_icon').click(function(){
	$(this).closest('div').find('input').focus();
});
