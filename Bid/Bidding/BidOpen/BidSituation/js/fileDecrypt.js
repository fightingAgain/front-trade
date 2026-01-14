/**
*  zhouyan 
*  2019-3-11
*  开标情况列表（项目经理）
*  方法列表及功能描述
*/

var findBidOpenFileUrl  = config.tenderHost + "/BidOpeningDecryptDetailsController/findBidOpeningFilePage.do";  //分页查询投标解密文件记录

var packageId;  //标段iD
var arrs;

$(function(){
	
	if($.getUrlParam("packageId") && $.getUrlParam("packageId") != "undefined") {
		packageId = $.getUrlParam("packageId");
		getDetail();
	}
	
	/*关闭*/
	$('#btnClose').click(function(){
		var index=parent.layer.getFrameIndex(window.name);
        parent.layer.close(index);
	})
	
})


function getDetail(){
	$.ajax({
         url: findBidOpenFileUrl,
         type: "post",
         data: {
         	packageId:packageId, //bidOpeningConfigurationId
         },
         success: function (data) {
         	if(data.success == false){
        		parent.layer.alert(data.message);
        		return;
        	}
         	if(data.rows.length>0){
         		arrs = data.rows;
         		getOpenFileTable(arrs);
         	}
         },
         error: function (data) {
             parent.layer.alert("请求失败");
         }
     });
	
}

function getOpenFileTable(arrs) {
	$('#bidList').bootstrapTable({
		pagination: false,
		undefinedText: "",
		columns: [{
			title: "序号",
			align: "center",
			halign: "center",
			width: "50px",
			formatter: function(value, row, index) {
				return index + 1;
			}
		}, {
			field: "enterpriseName",
			title: "投标人",
			align: "left",
		},{
			field: "openingStartDate",
			title: "解密开始时间",
			align: "center",
			width: "200px"
		},{
			field: "openingEndDate",
			title: "解密结束时间",
			align: "center",
			width: "200px"
		},{
			field: "decryptResult",
			title: "解密情况",
			align: "center",
			width: "200px",
			formatter: function(value, row, index) {
				if(value == 0){ //0为解密成功，1为解密失败
					return "解密成功";
				}else if(value == 1){
					return "解密失败";
				}
			}
		},{
			field: "isConfirmOffer",
			title: "报价确认情况",
			width: '200px',
			halign: "center",
			align: "center",
			formatter: function(value, row, index) {
				if(value == 0){ //0为未确认，1为已确认
					return "未确认";
				}else if(value == 1){
					return "已确认";
				}
			}

		}]
	});
	$('#bidList').bootstrapTable("load", arrs); //重载数据
};