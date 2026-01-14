var items;
	
function du(data){
	for(var key in data) {
		$("[id='" + key + "']").html(data[key]);
		if(key == 'createTime' ){
			var vu = data[key].split(" ")[0];
			$("[id='" + key + "']").html(vu);
		}
		if(key == 'isDeal'){
			if(data[key] == 0){
				$("[id='" + key + "']").html('<span style="color: red;">未成交</span>');
			}else if(data[key] == 1){
				$("[id='" + key + "']").html('<span style="color: green;">已成交</span>');
			}
		}else if(key == 'state'){
			if(data[key] == 0){
				$("[id='" + key + "']").html('<span style="color: red;">失败</span>');
			}else if(data[key] == 1){
				$("[id='" + key + "']").html('<span style="color: green;">成功</span>');
			}
		}else if(key == 'projectType'){
			if(data[key] == 0){
				$("[id='" + key + "']").html('询价');
			}
		}else if(key == 'pushRecordItems'){
			items = data[key] ;
			if(items){
				initDataTab(items);
			}
		}
		
	}
}


//表格初始化
function initDataTab(items) {
	$('#listDetail').bootstrapTable({
		pagination: false,
		undefinedText: "",
		showLoading: false, //隐藏数据加载中提示状态
		columns: [{
				title: "序号",
				align: "center",
				halign: "center",
				width: "50px",
				formatter: function(value, row, index) {
					return index + 1;
				}
			},
			{
				field: "userName",
				title: "推送人",
				align: "left",
				halign: "left"
			},
			{
				field: "subDate",
				title: "推送时间",
				align: "center",
				halign: "center",
				width : "180",
			},
			{
				field: "result",
				title: "推送结果",
				align: "center",
				halign: "center",
				width : "100",
				formatter: function(value, row, index) {
					if(value == 0) { ; 
						return "失败"
					} else if(value == 1){
						return "成功"; 
					}
				}
			},{
				field: "message",
				title: "返回信息",
				align: "left",
				halign: "left"
			}
		]
	});
	$('#listDetail').bootstrapTable("hideLoading"); //隐藏数据加载中提示状态
	$('#listDetail').bootstrapTable("load", items); //重载数据
}


// 关闭
$("#btnClose").on('click',function(){
	var index=top.parent.layer.getFrameIndex(window.name);
    top.parent.layer.close(index);
})
