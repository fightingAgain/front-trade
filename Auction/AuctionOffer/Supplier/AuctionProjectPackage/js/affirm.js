var SupplierByProIdUrl=config.AuctionHost+'/AuctionPurchaseController/updateProjectSupplierByProId.do'
function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象  
	var r = window.location.search.substr(1).match(reg); // 匹配目标参数  
	if(r != null) return unescape(r[2]);
	return null; // 返回参数值  
}
var projectDataID=getUrlParam('projectId')
var subDate=sessionStorage.getItem('subDate');
var Num=sessionStorage.getItem('Num');
$("#affirTime").html(subDate)
function accept(){	
	updateSupplier(0);	 
};

function refuse(){
	parent.layer.confirm("是否确定拒绝", {
	  btn: ['是', '否'] //可以无限个按钮
	}, function(index){	
    updateSupplier(1);	
	 
	parent.layer.close(index)	  	
	}, function(index){
	   parent.layer.close(index)	  
	});
};

function updateSupplier(num){
	$.ajax({
	   	url:SupplierByProIdUrl,
	   	type:'post',
	   	dataType:'json',
	   	async:false,
	   	data:{
	   		'projectId':projectDataID,
	   		'isAccept':num
	   	},	   	
	   	success:function(data){	
	   		if(data.success){
	   			if(Num==0){
	   				
				 	var parentIfame=parent.iframeWin; 
				 	if(num==0){
				 		parentIfame.isAcceptsNone('接受');	 		
				 	}else{
				 		 parentIfame.isAcceptsNone('拒绝');
				 	}
				 	 
				 	 parent.$('#table').bootstrapTable(('refresh'));  
				 }else if(Num==1){
				 	parent.$('#projectPackage').bootstrapTable(('refresh'));		 		
			 		parent.openIfiame(parent.rowProId,parent.rowId,1);
				 }else if(Num==2){
				 	 parent.$("#AuctionFileList").bootstrapTable(('refresh'))	 	
				}
				parent.layer.close(parent.layer.getFrameIndex(window.name))	
	   		}else{
	   			parent.layer.alert(data.message);
	   		}
	   	}
	});
}
