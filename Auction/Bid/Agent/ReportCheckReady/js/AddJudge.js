
var typeIdList="";//项目类型的ID
var typeNameList="";//项目类型的名字
var typeCodeList="";//项目类型编号
var itemTypeId=[]//项目类型的ID
var itemTypeName=[]//项目类型的名字
var itemTypeCode=[]//项目类型编号
var saveurl=top.config.Syshost+'/ExpertController/saveExpertForProject.do';
var checkUrl = top.config.bidhost + "/CheckController/verifyTime.do";
var successL=""

$(function(){
	var url = window.location.href.split('index')[0];
	url = url.split('0502')[0];
	$.getJSON(url+'media/js/base/prov-city.json',function(data){
		ProvinceData = data;
		var option = "<option value=''></option>";
		$("#Province").append(option);
		for (var i= 0; i < ProvinceData.length; i++) {
			option = "<option value='" + ProvinceData[i].code + "'>" + ProvinceData[i].name + "</option>";
			$("#Province").append(option);
		}
	});
});
function dataType(){
	sessionStorage.setItem('dataTypeId', JSON.stringify(typeIdList));
	top.layer.open({
		type: 2,
		title: '添加专业类别',
		area: ['450px', '600px'],
		maxmin: false, //该参数值对type:1和type:2有效。默认不显示最大小化按钮。需要显示配置maxmin: true即可
		resize: false, //是否允许拉伸
		closeBtn: 1,
		content: 'view/projectType/projectType.html?type=1&select=1',// type,0为供应商类型，1为专家评委类型，2为项目类型,select 0为单选，1为多选
		btn:['确定','取消'],
		scrolling:'no',
		success:function(layero, index){
		   var iframeWind=layero.find('iframe')[0].contentWindow;	        	        
		},
		yes:function(index,layero){
			var iframeWin=layero.find('iframe')[0].contentWindow;
			var dataTypeList=iframeWin.btnSubmit()//触发事件得到选中的项目类型的值
			//iframeWin.dataTypeList为所选项目类型返回的数组
			//从这里开始都是不必要的，
			if(dataTypeList.length==0){
				parent.layer.alert("请选择至少一个专业")
	        	return
			}
			if(dataTypeList.length>20){
				parent.layer.alert("专业不能超过20个")
	        	return
			}
			itemTypeId=[]//项目类型的ID
			itemTypeName=[]//项目类型的名字
			itemTypeCode=[]//项目类型编号
			
			
			for(var i=0;i<dataTypeList.length;i++){
				itemTypeId.push(dataTypeList[i].id)	
				itemTypeName.push(dataTypeList[i].name)
				itemTypeCode.push(dataTypeList[i].code)
			};	
			typeIdList=itemTypeId.join(",")//项目类型的ID
			typeNameList=itemTypeName.join(",")//项目类型的名字
			typeCodeList=itemTypeCode.join(",")//项目类型编号
			$("#dataTypeName").val(typeNameList)
			$("#dataTypeId").val(typeIdList)
			$("#dataTypeCode").val(typeCodeList)
			top.layer.close(parent.layer.getFrameIndex(window.name))
		}
	
	});
}

function formBtn(){
	/*$.ajax({
	   	type: "post",
		url: checkUrl,
		data: {
			projectId: getUrlParam("projectId"),
			type: 3
		},
		async: true,
	   	success:function(data){ 
	   		if(!data.data){
	   			
	   		}else {
				top.layer.alert(data.data);
			}
	   	},
	   	error:function(){
	   		parent.layer.alert("添加失败")
	   	}
   });*/
   
   $.ajax({
	   	url:saveurl,
	   	type:'post',
	   	//dataType:'json',
	   	async:false,
	   	//contentType:'application/json;charset=UTF-8',
	   	data:$("#form").serialize()+"&checkType = 1",
	   	success:function(data){ 
	   		if(data.success==true){
	   			successL=true
	   		    parent.layer.alert("添加成功")	
	   		    sessionStorage.setItem('getExpertData', JSON.stringify(data.data));
	   		}else{
	   			successL=false
	   			parent.layer.alert(data.message)	
	   		}
	   	},
	   	error:function(){
	   		parent.layer.alert("添加失败")
	   	}
   });
}

/** 
 * 取得url参数 
 */
function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象  
	var r = window.location.search.substr(1).match(reg); // 匹配目标参数  
	if(r != null) return unescape(r[2]);
	return null; // 返回参数值  
}