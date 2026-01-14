var uid="";
var gid=""
var projecturl='Auction/Auction/Purchase/AuctionPurchase/model/againAddProject.html'
// var pageAuctionProjectPackage=config.AuctionHost+'/AuctionProjectPackageController/pageAuctionProjectPackage.do';
var pageAuctionProjectPackage=config.AuctionHost+'/AuctionProjectPackageController/findStopPackPageList.do';
function selet(){

	parent.layer.open({
        type: 2 //此处以iframe举例
        ,title: '添加项目'
        ,area: ['1200px', '650px']
        ,content:projecturl
        // ,btn: ['确定重新竞价','取消'] 
        //确定按钮
		,success: function(layero, index) {
			var iframeWin=layero.find('iframe')[0].contentWindow; 
			iframeWin.passMessage(function(){
				uid=iframeWin.checkboxed.id
				gid=iframeWin.checkboxed.projectId
				$("#projectName").html(iframeWin.checkboxed.project.projectName);
				$("#projectCode").html(iframeWin.checkboxed.project.projectCode);
				$("#purchaserName").html(iframeWin.checkboxed.purchaserName);
				$("#purchaserAddress").html(iframeWin.checkboxed.purchaserAddress);
				$("#purchaserLinkmen").html(iframeWin.checkboxed.purchaserLinkmen);
				$("#purchaserTel").html(iframeWin.checkboxed.purchaserTel);
				$.ajax({
				  	url:pageAuctionProjectPackage,
							   	type:'get',
							   	dataType:'json',
							   	//contentType:'application/json;charset=UTF-8',
							   	data:{
							   		"projectId":iframeWin.checkboxed.projectId
							   	},
							   	success:function(data){ 			   		
							   		into(data.rows)
							   	}	
							  }); 
				parent.layer.close(index);
			})
		}
        ,yes: function(index,layero){           
         var iframeWin=layero.find('iframe')[0].contentWindow;       
         uid=iframeWin.checkboxed.id
         gid=iframeWin.checkboxed.projectId
         $("#projectName").html(iframeWin.checkboxed.project.projectName);
         $("#projectCode").html(iframeWin.checkboxed.project.projectCode);
         $("#purchaserName").html(iframeWin.checkboxed.purchaserName);
         $("#purchaserAddress").html(iframeWin.checkboxed.purchaserAddress);
         $("#purchaserLinkmen").html(iframeWin.checkboxed.purchaserLinkmen);
         $("#purchaserTel").html(iframeWin.checkboxed.purchaserTel);
         $.ajax({
		   	url:pageAuctionProjectPackage,
			   	type:'get',
			   	dataType:'json',
			   	//contentType:'application/json;charset=UTF-8',
			   	data:{
			   		"projectId":iframeWin.checkboxed.projectId
			   	},
			   	success:function(data){ 			   		
			   		into(data.rows)
			   	}	
			  }); 
         parent.layer.close(index);
        },
        btn2:function(){
        	
        } 
      });
}
var check_val = [];
var dase=""
function du(){	
	var allSelect = $('#tablebjb').bootstrapTable('getAllSelections');
	for(var i=0;i<allSelect.length;i++){
		check_val.push([allSelect[i].id])
	}
	dase=check_val.join(",")
}
function into(data){
	$('#tablebjb').bootstrapTable({
		pagination: false,
		undefinedText: "",
		height:'304',
		columns: [
			{
				checkbox:true,				
			},{
				title: "序号",
				align: "center",
				halign: "center",
				width: "50px",
				formatter: function(value, row, index) {
					return index + 1;
				}
			},
			{
				field: "packageName",
				title: "包件名称",
				align: "left",
				halign: "left",

			},
			{
				field: "packageNum",
				title: "包件编号",
				align: "center",
				halign: "center",
				width:'200px',

			},
		]
	});
	$('#tablebjb').bootstrapTable("load", data);
};
function passMessage(callback){
	$("#btn_close").on("click", function () {
		parent.layer.close(parent.layer.getFrameIndex(window.name));
	});
	$('#btn_submit').click(function(){
		callback();
	});
}
