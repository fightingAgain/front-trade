var SupplierByProIdUrl=config.AuctionHost+'/AuctionPurchaseController/updateProjectSupplierByProId.do'

function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象  
	var r = window.location.search.substr(1).match(reg); // 匹配目标参数  
	if(r != null) return unescape(r[2]);
	return null; // 返回参数值  
}
var projectDataID=getUrlParam('projectId')
var userName=sessionStorage.getItem('userName');
var subDate=sessionStorage.getItem('subDate');
var Num=sessionStorage.getItem('Num');
$("#userName").html(userName);
function accept(){	
	updateSupplier(0);
	
	 
};

function refuse(){
	var tip1 = '<div style="font-size:18px;font-weight:bold;"><span style="color:#f00">警示：</span>您现在选择的是<span style="color:#f00">拒绝邀请，拒绝邀请后将可能无法参与本项目后续的任何操作</span></div>';
	var tip2 = '<div style="font-size:18px;font-weight:bold;"><span style="color:#f00">警示：最后机会，</span>如再次选择<span style="color:#f00">拒绝邀请，您将彻底失去参与本项目的报价机会</span></div>';
	parent.layer.confirm(tip1,{
		icon: 3,
		area: ['500px', '200px'],
		btn:["我再考虑","下决心拒绝邀请"],
		btn1:function(idx){
	        parent.layer.close(idx);
	    },
	    btn2:function(){
		 	parent.layer.confirm(tip2,{
				icon: 3,
				area: ['500px', '200px'],
		 		btn:["我再考虑","拒绝邀请"],
		 		btn1:function(idx1){
			 		parent.layer.close(idx1);
				}, 
				btn2:function(idx1) {
					updateSupplier(1);
					parent.layer.close(idx1);
				}
			});
		}
	});
};

function updateSupplier(nums){
	$.ajax({
	   	url:SupplierByProIdUrl,
	   	type:'post',
	   	dataType:'json',
	   	async:false,
	   	data:{
	   		'projectId':projectDataID,
	   		'isAccept':nums
	   	},	   	
	   	success:function(data){	
	   		if(data.success){
	   			if(Num==0){	   				
				 	var parentIfame=parent.iframeWin; 
				 	if(nums==0){
				 		parentIfame.isAcceptsNone('接受');	 		
				 	}else{
				 		 parentIfame.isAcceptsNone('拒绝');
				 	}				 	 
				 	 parent.$('#table').bootstrapTable(('refresh'));  
				 }else if(Num==1){
				 	parent.$('#projectPackage').bootstrapTable(('refresh'));		 		
			 		parent.openIfiame(parent.rowProId,parent.rowId,parent.rowProId.tenders);
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
