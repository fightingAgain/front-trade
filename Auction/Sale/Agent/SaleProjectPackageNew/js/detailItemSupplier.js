// 表格初始化
var checkboxed = new Array();  //全局数组
var supplierListUrl= parent.config.AuctionHost+"/AuctionOfferController/findItemFileSuppliers.do";
var projectId = getUrlParam("projectId");
var packageId = getUrlParam("packageId");
$(function(){
	initTable();
})
function initTable() {
	$('#table').bootstrapTable({
		method: 'GET', // 向服务器请求方式
		contentType: "application/x-www-form-urlencoded", // 如果是post必须定义
		url:supplierListUrl, // 请求url	
		//data:Json,
		cache: false, // 是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
		striped: true, // 隔行变色
		dataType: "json", // 数据类型
		queryParams: queryParams, // 请求参数，这个关系到后续用到的异步刷新		
		columns: [{
			checkbox:true,
			formatter: function (i,row) { // 每次加载 checkbox 时判断当前 row 的 id 是否已经存在全局 Set() 里   				
                if(row.isSubmitItemFile==1){// 因为 判断数组里有没有这个 id
                    return {
                        checked : true               // 存在则选中
                    }
                }
            }
		},
		{
			field: 'enterpriseName',
			title: '企业名称',
			align: 'left',			
		},
		
		],
	});
};
// 分页查询参数，是以键值对的形式设置的
function queryParams(params) {
	var rowDate={
		// 'enterpriseName': $('#search_3').val(), // 请求时向服务端传递的参数	
        'packageId':packageId	
	};
	return rowDate
	
};
// 搜索按钮触发事件
$("#eventquery").click(function() {
		$('#table').bootstrapTable(('refresh')); // 很重要的一步，刷新url！	
});
$("#btn_submit").on('click',function(){
	var thisFrame = parent.window.document.getElementById("packageclass").getElementsByTagName("iframe")[0].id;
	var dcmt = parent.$('#' + thisFrame)[0].contentWindow;
    var para={
		'packageId':packageId,
		'supplierId':''
	};
	var row=$("#table").bootstrapTable('getSelections');
	if(row.length==0){
		parent.layer.alert("请选择需提交分项报价的供应商");
		return;
	}
	for(var i=0;i<row.length;i++){
		if(i==(row.length-1)){
			para.supplierId+=row[i].supplierId;
		}else{
			para.supplierId+=row[i].supplierId+',';
		}	
	}	
    $.ajax({
    	type:"post",
    	url:top.config.AuctionHost+"/AuctionOfferController/updateItemFileSuppliers.do",
    	async:true,
    	data:para,
    	success:function(res){
    		if(res.success){  
				dcmt.$("#detailItemSupplier").hide();	
				dcmt.$("#againDetailItemSupplier").show();
				dcmt.$('#detailItem').bootstrapTable('refresh');					
				parent.layer.close(parent.layer.getFrameIndex(window.name));
				parent.layer.alert('选择成功')
    		}
    	}
    });
   
})

$("#btn_close").on('click',function(){
	parent.layer.close(parent.layer.getFrameIndex(window.name)); 
})
