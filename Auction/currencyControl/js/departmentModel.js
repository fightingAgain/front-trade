/*
 * @Author: your name
 * @Date: 2020-06-28 16:26:30
 * @LastEditTime: 2021-01-12 09:39:54
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \FrameWork_bf\bidPrice\currencyControl\js\department.js
 */ 
var sendUrl = config.Syshost + '/EnterpriseController/findDepsByEnterpriseId.do'; 
var url = window.location.search;
var zTreeObj;
var nodes = [];
var zNode = [];
var dataTypeList=[];
var dataTypeId;
function employee(uid,callEmployeeBack,mnuid,isMust){
    zNodes = setNodes(uid);
	zTreeObj = $.fn.zTree.init($("#experItem"), setting, zNodes);
	//勾选已经选中的值	
	if(typeof(mnuid) != "undefined" && mnuid != null && mnuid != ""){
		dataTypeId = mnuid.split(',');	
		var nodes = zTreeObj.transformToArray(zTreeObj.getNodes());
		$.each(nodes,function(i,node){
			if(dataTypeId.contain(node.id)){
				zTreeObj.checkNode(node,true,false);
			} 
		});
    }
    //临时保存
    $("#btn_bao").click(function() {
		var treeObj = $.fn.zTree.getZTreeObj("experItem");
		var info = [];
		var nodes= treeObj.getCheckedNodes(true);
		if(nodes.length>1){
			parent.layer.alert('只能选择一个为所属部门')

			return false;
		}
		for(var i = 0; i < nodes.length; i++){
			if(nodes[i].children==undefined) {
				//不是父节点
				info.push(nodes[i]);
			}else{
				parent.layer.alert('请选择最下级部门为所属部门')

				return false;
			}
			
		}
		if(info.length==0){
			parent.layer.alert('选择采购部门');
			return;
		}
        callEmployeeBack(info)
        var index=top.parent.layer.getFrameIndex(window.name);
        top.parent.layer.close(index);	
    })
}

//退出
$("#btn_close").click(function() {
	var index=top.parent.layer.getFrameIndex(window.name);
    top.parent.layer.close(index);
})
//获取最终选择的数据并返回
function btnSubmit(){
	var treeObj = $.fn.zTree.getZTreeObj("experItem");
	
	var info = [];
	var nodes= treeObj.getCheckedNodes(true);
	for(var i = 0; i < nodes.length; i++){
		if(nodes[i].children!=undefined) {
			//不是父节点
			info.push(nodes[i]);
		}
	}
	return info;//在提交表单之前将选中的checkbox收集
}

var setting = {	
    data: {
        simpleData: {
            enable: true,
            idKey: "id",
            pIdKey: "parentDeptId",
            rootPId: "0"
        },
        key: {
            name: 'departmentName'
        }
    },
	check:{
		enable:true,
		chkStyle:'radio',
		chkboxType:{"Y":"s","N":"ps"}
	}
};

function setNodes(uid){//0为供应商类型，1为专家评委类型，2为项目类型
	$.ajax({
        url:sendUrl ,
        type:"post",
  		async:false,
        dataType:"json",
		data:{
            'danweiguid':uid,	
        },
		success: function(result){	
		
			if(result.success){
				nodes = result.data.departments;
			}
		}
	})
	return nodes;
}
