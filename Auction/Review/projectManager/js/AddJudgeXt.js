
var typeIdList="";//项目类型的ID
var typeNameList="";//项目类型的名字
var typeCodeList="";//项目类型编号
var itemTypeId=[]//项目类型的ID
var itemTypeName=[]//项目类型的名字
var itemTypeCode=[]//项目类型编号
var saveurl=top.config.AuctionHost+'/ExpertController/saveExpertForProject.do';
var checkUrl = top.config.AuctionHost + "/CheckController/verifyTime.do";
var successL="";
var enterpriseId=getUrlParam("enterpriseId");
var isAgent=getUrlParam("isAgent");
$(function(){
	setProvince();
	getEmployee();
});
//$("#Province").on('change',function(){
//	$("#provinceName").val($(this).find("option:selected").attr("data-value"))
//})
//$("#City").on('change',function(){
//	$("#cityName").val($(this).find("option:selected").attr("data-value"))
//})
var interpriceType;//1代表sys 2 代表judges
function dataType(){
//	var Id1=sysEnterpriseId.indexOf('6a21e3d8d37b48b9b039298c65e47ef7')
	/* if(sysEnterpriseId.indexOf(enterpriseId)>-1){
		if(isAgent){
			if(isAgent==0){
		   var viewhtml='view/projectType/projectType.html?interpriceType=1&select=1&type=1'
		}else if(isAgent==1){
		  var viewhtml='view/projectType/projectType.html?interpriceType=2&select=1&type=1'
		}
		}else{
			var viewhtml='view/projectType/projectType.html?interpriceType=1&select=1&type=1'
		}
		
	}else{
		var viewhtml='view/projectType/projectType.html?interpriceType=1&select=1&type=1'
		
		
	} */
	var viewhtml='view/projectType/projectType.html?interpriceType=2&select=1&type=1'
	sessionStorage.setItem('dataTypeId', JSON.stringify(typeIdList));
	top.layer.open({
		type: 2,
		title: '添加专业类别',
		area: ['450px', '600px'],
		maxmin: false, //该参数值对type:1和type:2有效。默认不显示最大小化按钮。需要显示配置maxmin: true即可
		resize: false, //是否允许拉伸
		closeBtn: 1,
		content: viewhtml,// type,0为供应商类型，1为专家评委类型，2为项目类型,select 0为单选，1为多选
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
				parent.parent.layer.alert("请选择至少一个专业")
	        	return
			}
			if(dataTypeList.length>20){
				parent.parent.layer.alert("专业不能超过20个")
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
			top.layer.close(index)
		}
	
	});
}

function formBtn(projectId){
	// 组建评委环节，“添加评委”时选择专业分类以修改后专业为准，
	// 若评委已存在（目前通过手机号校验），
	// 保存时提示“评委手机号已被使用，请确认是否覆盖已有信息”，选择“是”则保存最新添加的数据（原数据记录从专家库删除，逻辑删除）
	var expertTel = $("#form input[name='expertTel']").val();

	$.ajax({
		url:top.config.AuctionHost+'/ExpertController/validateExpertTel.do?expertTel=' + expertTel + "&projectId=" + projectId,
		type:'post',
		async:true,
		success:function(data){
			if(data.success==true){
				confirmExpertTel(data.data);
			}else{
				parent.layer.alert(data.message)
			}
		},
		error:function(){
			parent.layer.alert("添加失败")
		}
	});

}

function confirmExpertTel(data) {
	if (data == 'true'){
		parent.layer.confirm("评委手机号已被使用，请确认是否覆盖已有信息", {
			btn: ['是', '否'] //按钮
		}, function(index1) {
			saveExpertForProject();
			parent.layer.close(index1);
		});
	}

	if (data == 'false'){
		saveExpertForProject();
	}
}


function saveExpertForProject() {
	$.ajax({
		url:saveurl,
		type:'post',
		//dataType:'json',
		async:false,
		//contentType:'application/json;charset=UTF-8',
		data:$("#form").serialize()+"&checkType=" +(getUrlParam("checkType")|| ""),
		success:function(data){
			if(data.success==true){
				successL=true;
				parent.layer.alert("添加成功");
				sessionStorage.setItem('getExpertData', JSON.stringify(data.data));
				top.parent.layer.close(parent.layer.getFrameIndex(window.name));
				parent.$('#relationPurchaser').bootstrapTable(('refresh'));
			}else{
				successL=false;
				parent.layer.alert(data.message);
			}
			parent.$('#relationPurchaser').bootstrapTable(('refresh'));
		},
		error:function(){
			parent.layer.alert("添加失败");
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