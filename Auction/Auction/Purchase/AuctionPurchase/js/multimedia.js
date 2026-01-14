var sendUrl = config.Syshost+"/OptionsController/list.do"; 
var dataTypeId =JSON.parse(sessionStorage.getItem('dataTypeId'));//此次已经选中的数据
var zTreeObj;
var nodes = [];
var zNode = [];
//页面初始化
$(document).ready(function() {
	zNodes = setNodes();
	zTreeObj = $.fn.zTree.init($("#experItem"), setting, zNodes);	
	//勾选已经选中的值	
	if(typeof(dataTypeId) != "undefined" && dataTypeId != null && dataTypeId != ""){
		dataTypeId = dataTypeId.split(',');	
		var nodes = zTreeObj.transformToArray(zTreeObj.getNodes());
		$.each(nodes,function(i,node){
			if(dataTypeId.contain(node.id)){
				zTreeObj.checkNode(node,true,false);
			} 
		});
	}
	
});

//获取最终选择的数据并返回
function btnSubmit(){
	var treeObj = $.fn.zTree.getZTreeObj("experItem");
	return treeObj.getCheckedNodes(true)//在提交表单之前将选中的checkbox收集
}

var setting = {	
	data:{
		simpleData:{
			enable: true,
			idKey: "code",
			//pIdKey: "optionValue",
			rootPId: ""
		}
	},
	check:{
		enable:true,
		chkStyle:'checkbox',
		chkboxType:{"Y":"s","N":"ps"}
	}
};

function setNodes(){//0为供应商类型，1为专家评委类型，2为项目类型
	$.ajax({
        url:sendUrl ,
        type:"post",
		async:false,
        dataType:"json",
		data:{
			"optionName":"PUBLISH_MEDIA_NAME"
			},
		success: function(result){	
			console.log(result)
			if(result.success){
				for(var i=0;i<result.data.length;i++){
					nodes.push({
						id:result.data[i].id,
						code:result.data[i].optionValue,
						name:result.data[i].optionText						
					})
				}				
			}
		}
	})
	return nodes;
}
