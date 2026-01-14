var sendUrl = config.tenderHost + '/findDataTypeList.do'; 
var dataTypeId =JSON.parse(sessionStorage.getItem('dataTypeId'));//此次已经选中的数据
var selectBox = "radio"; //默认为多选
var zTreeObj;
var nodes = [];
var zNode = [];
var dataList = [];
var dataTypeList=[];
var expertFrom = getUrlParam("expertFrom");
var projectId = getUrlParam("projectId");

var typeCode;
//页面初始化
$(document).ready(function() {
	if($.getUrlParam("typeCode") && $.getUrlParam("typeCode") != "undefined"){
		typeCode =$.getUrlParam("typeCode");
		
	}
	setNodes(tree);
});

function tree(zNodes){
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
}

//获取最终选择的数据并返回
function btnSubmit(){
	var treeObj = $.fn.zTree.getZTreeObj("experItem");
	var info = [];
	var nodes= treeObj.getCheckedNodes(true);
	for(var i = 0; i < nodes.length; i++){
		if(!nodes[i].isParent) {
			info.push(nodes[i]);
		}
	}
//	console.log(info[0].getParentNode().getParentNode());
	var name;
	var nameData = [];
	if(info.length > 0 &&　info[0].getParentNode()){
		name = info[0].getParentNode();
		

		nameData.unshift({name:name.name, code:name.code}, {name:info[0].name, code:info[0].code});
		var i = 0;
		while(true){
			
			if(name.getParentNode()){
				name = name.getParentNode();
				nameData.unshift({name:name.name, code:name.code});
				
			} else {
				break;
			}
		}
	}
	
	
	return nameData;
}

var setting = {	
	data:{
		simpleData:{
			enable: true,
			idKey: "code",
			pIdKey: "pCode",
			rootPId: ""
		}
	},
	check:{
		enable:true,
		chkStyle:selectBox,
		chkboxType:{"Y":"s","N":"ps"},
		radioType: "all"
	}
};

function setNodes(callback){
	$.ajax({
        url:sendUrl ,
        type:"post",
  		async:false,
        dataType:"json",
        data:{expertFrom:expertFrom},
		success: function(result){	
			if(result.success){
                var tree = []
                var typesTree = {};
				var nodes = result.data;
				dataList = nodes;
                for(var i in nodes){
                    typesTree[nodes[i].id]=nodes[i];
                    if(nodes[i].pid == "0"){
                        tree.push(nodes[i]);
                    }
				}
                
                for(var i in typesTree){
					var parent = typesTree[typesTree[i].pid];
                    if(parent){
                        if(!parent.children){
                            parent.children = [];
                        }
                        parent.children.push(typesTree[i]);
                    }
                }
                for(var i = 0; i < tree.length; i++){
                	if(tree[i].code == typeCode){
                		callback(tree[i].children);
                		break;
                	}
                }
                
			}
		}
	});
	
	return nodes;
}
