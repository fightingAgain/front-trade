/*
 * @Author: your name
 * @Date: 2020-09-11 13:42:19
 * @LastEditTime: 2020-12-25 14:08:45
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \FrameWork_bf\bidPrice\Review\projectManager\js\PriceFile.js
 */ 
//报价文件供应商
var offerFileData=new Array();
var offersData=new Array();//提交报价表的供应商数组
var fileSource;//0供应商递交评审文件信息 1供应商递交报价表文件信息
$(function(){
	offerData();
})
function offerData() {
	$.ajax({
		type: "post",
		url: url + "/ReviewCheckController/getCheckOtherInfomation.do",
		data: {
			projectId: projectId,
			packageId: packageId,
			examType: examType
		},
		async: false,
		success: function (data) {
			if (data.success) {
                _THISID=_thisId
                offersData=data.data.offers;
				fileEnterprise()
			}else{
                parent.layer.alert(data.message);
				$("#"+_THISID).click();
            }
		},
		error: function (err) {

		}
	});
}
function fileEnterprise() {
	$("#fileEnterpriseTable").bootstrapTable({
		data: offersData,
		clickToSelect: true,
		columns: [
		{
			field: '#',
			title: '序号',
			width: '50px',
			cellStyle: {
				css: {
					"text-align": "center"
				}
			},
			formatter: function (value, row, index) {
				return index + 1;
			}
		}, {
			field: 'enterpriseName',
			title: '报价供应商名称'
		}, {
			field: 'shadowCode',
			title: '暗标编号'
		}
		]
	});
}