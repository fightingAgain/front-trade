//请求地址
var url = top.config.bidhost;
var JudgeId=[];
var thisFrame = parent.window.document.getElementById("packageclass").getElementsByTagName("iframe")[0].id;
var dcmt = parent.$('#'+thisFrame)[0].contentWindow;
//替换评委，id为数据行id
var tobeChangeExpertItemId = getUrlParam("id"),
	expertid = getUrlParam("expertid"),
	ProjectData = JSON.parse(sessionStorage.getItem('ProjectData')),
	expertsNumber = getUrlParam("expertsNumber"), //抽取数
	expertslength = getUrlParam("expertslength"); //已有评委数
	checkOrExtracts = getUrlParam("checkOrExtract"), //勾选还是替换	
	enterpriseIds=getUrlParam("enterpriseId"),
	isAgents=getUrlParam("isAgents"),
	titleType=getUrlParam("titleType")
	
$(function() {
    if(checkOrExtracts==0||checkOrExtracts==2){
    	$("#btnConfirm").show()    	
    }else if(checkOrExtracts==1){
    	$("#btnConfirm").hide()
    }
	$.getJSON('../../../../media/js/base/prov-city.json', function(data) {
		ProvinceData = data;
		var option = "<option value=''></option>";
		$("#Province").append(option);
		for(var i = 0; i < ProvinceData.length; i++) {
			option = "<option value='" + ProvinceData[i].code + "'>" + ProvinceData[i].name + "</option>";
			$("#Province").append(option);
		}
	});
	if(isAgents==0){
		$(".extracIsShow").hide();	
		$(".cols").attr('colspan','3');
	}else{
		$(".extracIsShow").show();
		$(".cols").attr('colspan','1')
		$('#extractType option').eq(1).attr('selected',true)
	}
	if(titleType=="cqpw"){
		$(".Divquerys").show();	
	}else{
		tableBae();
		$(".JudgeDiv").show();		
	}
});

//抽取按钮
$("#SbmJudge").click(function() {
	if($("#number").val() == "") {
		parent.layer.alert("请输入抽取数量");
		return false;
	}
//	if(~~$("#number").val()>(expertsNumber - expertslength)) {
//		parent.layer.alert("抽取数量不能大于剩余评委数");
//	} else {
		TakingExperts();
	//}
});

//取消按钮
$("#btn_cancle").click(function(){
	top.layer.close(parent.layer.getFrameIndex(window.name));
})

$("#btnConfirm").click(function(){
	TakingExperts() 
})
//抽取评委函数
function TakingExperts() {
	var para = {
		projectId: ProjectData.projectId,
		packageId: ProjectData.packageId,
		projectCheckerId: ProjectData.id,
		chooseNum: $("#number").val(),
		checkerCount: expertsNumber,
		enterpriseId: ProjectData.enterpriseId,
	};
	if($("#Province").val() && $("#Province").val() != '') {
		para.province = $("#Province").val();
	}
	if(checkOrExtracts==0||checkOrExtracts==2){//指定或者是业主评委
		if(JudgeId.length==0){
			parent.layer.alert("请勾选评委");
		    
		    return false;
		}
		for(var i = 0; i < JudgeId.length; i++) {
			para["expertList[" + i + "].id"] = JudgeId[i];
		}		
	}else if(checkOrExtracts==1){//替换
		
	}else{//抽取
		if(isAgents==0){
			para.extractType=0;
		}else{
			para.extractType=$("#extractType").val();
		}		
	}
	if($("#City").val() && $("#City").val() != '') {
		para.city = $("#City").val();
	}
	var dataTypeIds = $("#dataTypeId").val() && $("#dataTypeId").val().split(',');
	if(dataTypeIds.length>256){
		parent.layer.alert("专业类别数量超出");
		return false;
	}
	if(dataTypeIds && dataTypeIds.length > 0) {
		for(var i = 0; i < dataTypeIds.length; i++) {
			para["dataTypeIds[" + i + "]"] = dataTypeIds[i];
		}
	}
	
	if(getUrlParam("checkType")){
		para.checkType = getUrlParam("checkType");
	}
	
	$.ajax({
		type: "post",
		url: url + "/CheckController/getRandomExpert.do",
		data: para,
		success: function(data) {
			if(data.success) {	
				dcmt.bind();							
				parent.layer.close(parent.layer.getFrameIndex(window.name));
				parent.layer.alert("抽取成功");
			} else {
				parent.layer.alert(data.message);
			}
		}
	});
};

//替换评委按钮事件
function CheckItem(id) {
	parent.layer.prompt({
		title: '请输入替换原因',
		formType: 2
	}, function(text, index) {
		$.ajax({
			type: "get",
			url: url + "/CheckController/replaceExpert.do",
			data: {
				projectId: ProjectData.projectId,
				packageId: ProjectData.packageId,
				id: tobeChangeExpertItemId,
				checkerEmployeeId: id,
				tempEmployeeId: expertid,
				changeReason: text,
				checkType:getUrlParam("checkType")
			},
			success: function(data) {
				if(data.success) {
					//获得抽取的数据行
					dcmt.bind();
					parent.layer.close(parent.layer.getFrameIndex(window.name));
					parent.layer.close(index);
					parent.layer.alert("替换成功");
				} else {
					parent.layer.alert(data.message);
				}
			}
		});
	});
}

//查询按钮
$("#btnQuery").click(function() {
	$("#Judgetable").bootstrapTable("refresh");
});

//设置查询条件
function queryParams(params) {
	var para = {
		projectId: ProjectData.projectId,
		packageId: ProjectData.packageId,
		enterpriseId:enterpriseIds,
		checkType : getUrlParam("checkType"),
		pageNumber: params.offset / params.limit + 1,
		pageSize: params.limit,
		offset:params.offset, // SQL语句偏移量
	}
	if(checkOrExtracts!=undefined){
		para.checkOrExtract=checkOrExtracts
	}
	if($("#nameorcode").val()!=''){
		para[$("#selecttype").val()] = $("#nameorcode").val();	
	}
	return para;
}

function tableBae(){
	$("#Judgetable").bootstrapTable({
		url: url + '/CheckController/findEnterpriseExperts.do',
		pagination: true, //是否分页
		sidePagination: 'server', //设置为服务器端分页
		clickToSelect: true, //是否启用点击选中行
		queryParams: queryParams, //参数
		uniqueId: 'id',	
		onLoadSuccess: function(data) {
			if(checkOrExtracts == 0||checkOrExtracts==2) {
				$("#Judgetable").bootstrapTable("hideColumn", "#");
			}else{
				$("#Judgetable").bootstrapTable("hideColumn", "checked");
			}
		},
		columns: [{
				field: 'checked',
				checkbox:true,
				formatter: function (i,row) { // 每次加载 checkbox 时判断当前 row 的 id 是否已经存在全局 Set() 里   				
	                if($.inArray(row.id,JudgeId)!=-1){// 因为 判断数组里有没有这个 id
		                    return {
		                        checked : true               // 存在则选中
		                    }
		                }
	                
	            }
				
			},{
				field: 'id',
				title: '序号',
				width: '50px',
				cellStyle: {
					css: {
						"text-align": "center"
					}
				},
				formatter: function(value, row, index) {
					return index + 1;
				}
			},
			{
				field: 'expertName',
				title: '成员姓名',
				width: '100px'
			},
			{
				field: 'identityCardType',
				title: '证件类型',
				width: '100px',
				formatter: function(value, row, index) {
					switch(row.identityCardType) {
						case "0":
							return "身份证";
							break;
						case "1":
							return "军官证";
							break;
						case "2":
							return "护照";
							break;
					}
				}
			},
			{
				field: 'identityCardNum',
				title: '证件编号',
				width: '180px'
			},
			{
				field: 'expertTel',
				title: '手机号',
				width: '120px'
			},
			{
				field: 'companyName',
				title: '所在单位',
				align: 'left',
			}, 
			{
				field: 'provinceName',
				title: '省份',
				
			}, {
				field: 'cityName',
				title: '城市',				
			},
			{
				field: 'dataTypes',
				title: '专业',
				align: 'left',
				cellStyle: {
					css: {
						'text-overflow': 'ellipsis',
						'white-space': 'nowrap',
						'max-width': '200px',
						'overflow': 'hidden'
					}
				}
			},
			{
				field: '#',
				title: '操作',
				width: '70px',
				formatter: function(value, row, index) {
					return "<a href='javascript:void(0)' type='button' class='btn-sm btn-primary' style='text-decoration: none;' onclick='CheckItem(\"" + row.id + "\")'>选择</a>";
				}
			}
		]
	});
};
$('#Judgetable').on('uncheck.bs.table check.bs.table check-all.bs.table uncheck-all.bs.table',function(e,rows){
        var datas = $.isArray(rows) ? rows : [rows];        // 点击时获取选中的行或取消选中的行
        examine(e.type,datas); // 保存到全局 Array() 里
});

var itemTypeId=[];
$("#dataTypeName").click(function() {
	sessionStorage.setItem("dataTypeId", JSON.stringify(itemTypeId.toString()));
	top.layer.open({
		type: 2,
		title: '添加专业类别',
		area: ['450px', '600px'],
		maxmin: false, //该参数值对type:1和type:2有效。默认不显示最大小化按钮。需要显示配置maxmin: true即可
		resize: false, //是否允许拉伸
		closeBtn: 1,
		content: 'view/projectType/projectType.html?type=1&select=1', // type,0为供应商类型，1为专家评委类型，2为项目类型,select 0为单选，1为多选
		btn: ['确定', '取消'],
		scrolling: 'no',
		success: function(layero, index) {
			var iframeWind = layero.find('iframe')[0].contentWindow;
		},
		yes: function(index, layero) {
			var iframeWin = layero.find('iframe')[0].contentWindow;
			var dataTypeList = iframeWin.btnSubmit() //触发事件得到选中的项目类型的值
			//iframeWin.dataTypeList为所选项目类型返回的数组
			//从这里开始都是不必要的，
			if(dataTypeList.length == 0) {
				parent.layer.alert("请选择一条项目类型")
				return
			}
			itemTypeId = [] //项目类型的ID
			itemTypeName = [] //项目类型的名字
			itemTypeCode = [] //项目类型编号

			for(var i = 0; i < dataTypeList.length; i++) {
				itemTypeId.push(dataTypeList[i].id)
				itemTypeName.push(dataTypeList[i].name)
				itemTypeCode.push(dataTypeList[i].code)
			};
			typeIdList = itemTypeId.join(",") //项目类型的ID
			typeNameList = itemTypeName.join(",") //项目类型的名字
			typeCodeList = itemTypeCode.join(",") //项目类型编号
			$("#dataTypeName").val(typeNameList)
			$("#dataTypeId").val(typeIdList)
			$("#dataTypeCode").val(typeCodeList)
			top.layer.close(index)
		}

	});
});

/** 
 * 取得url参数 
 */
function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象  
	var r = window.location.search.substr(1).match(reg); // 匹配目标参数  
	if(r != null) return unescape(r[2]);
	return null; // 返回参数值  
}
function examine(type, datas) {
	if(type.indexOf('uncheck') == -1) {
		$.each(datas, function(i, v) {
			JudgeId.indexOf(v.id) == -1 ? JudgeId.push(v.id):-1;　　　　
		});
	} else {
		$.each(datas, function(i, v) {
			JudgeId.splice(JudgeId.indexOf(v.id), 1); //删除取消选中行
		});
	}
};