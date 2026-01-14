var getAreaUrl = config.bidhost + "/AreaController/getArea.do";
$(function(){
	
	$("#province").change(function(){
		GetRegion.setCity($(this).val());
	})
})

var GetRegion = {
	regionData:"",
	getArea: function(){
		$.ajax({
			url: getAreaUrl,
         	type: "post",
         	async:false,
         	success: function (data) {
	         	if(data.success == false){
	        		parent.layer.alert(data.message);
	        		return;
	        	}
	         	var arr = data.data;
         		GetRegion.regionData = GetRegion.getJsonTree(arr);
         		GetRegion.setProvince();
         	},
         	error: function (data) {
             	parent.layer.alert("加载失败");
         	}
     	});
	},
	getJsonTree: function(data, parentId) {
	    var itemArr = [];   
	    for (var i = 0; i < data.length; i++) {
	        var node = data[i];
	        if (node.pcode == parentId) {
	            var newNode = {};
	            newNode = node;
//	            var keys = node.val;
//	            var name = node.valDescCn;
//	            console.log(keys);
//	            newNode[keys] = name;
	            newNode.nodes = GetRegion.getJsonTree(data, node.val);
	            itemArr.push(newNode);
	        }
	    }
	    return itemArr;
	},
	setProvince:function(code){
		if($("#province").length == 0){ return;}
		var html = "";
		for(var i = 0; i < GetRegion.regionData.length; i++){
			html += '<option value="'+GetRegion.regionData[i].val+'">'+GetRegion.regionData[i].valDescCn+'</option>'	
		}
		$(html).appendTo("#province");
		if(code != ""){
			$("#province").val(code);
		}
		GetRegion.setCity($("#province").val());
	},
	setCity:function(pid){
		if($("#city").length == 0){ return;}
		var html = "";
		$("#city option:gt(0)").remove();
		if(pid == ""){
			return;
		}
		var curNode;
		for(var i = 0; i < GetRegion.regionData.length; i++){
			curNode = GetRegion.regionData[i];
			if(curNode.val == pid){ 
				for(var j = 0; j < curNode.nodes.length; j++){
					html += '<option value="'+curNode.nodes[j].val+'">'+curNode.nodes[j].valDescCn+'</option>'
				}
			}
		}
		$(html).appendTo("#city");
	},
	cityCodeToProvince:function(cityCode){
		if(cityCode == ""){
			return;
		}
		var curNode;
		for(var i = 0; i < GetRegion.regionData.length; i++){
			curNode = GetRegion.regionData[i];
			for(var j = 0; j < curNode.nodes.length; j++){
				if(cityCode == curNode.nodes[j].val){
					$("#province").val(curNode.val);
					GetRegion.setCity(curNode.val);
					$("#city").val(cityCode);
					break;
				}
			}
		}
	},
	codeToStr:function(cityCode, target){
		if(cityCode == ""){
			return;
		}
		if(GetRegion.regionData == ""){
			GetRegion.getArea();
		}
		var curNode; 
		for(var i = 0; i < GetRegion.regionData.length; i++){
			curNode = GetRegion.regionData[i];
			for(var j = 0; j < curNode.nodes.length; j++){
				if(cityCode == curNode.nodes[j].val){
					target.html(curNode.valDescCn + " - " + curNode.nodes[j].valDescCn);
				}
			}
		}
	}
}
