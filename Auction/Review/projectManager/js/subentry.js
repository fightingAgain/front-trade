/*
 * @Author: your name
 * @Date: 2020-09-11 11:42:31
 * @LastEditTime: 2020-09-22 09:53:10
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \FrameWork_bf\bidPrice\Review\projectManager\js\subentry.js
 */ 
//分项报价文件
$(function(){
	offerData();
    subentrys(purOfferFilesData)
})
function subentrys(data) {
	$("#subentryTable").bootstrapTable({
		columns: [{
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
			field: 'userName',
			title: '报价供应商名称'
		}, {
			field: 'fileName',
			title: '附件名称'
		}, {
			field: 'fileSize',
			title: '附件大小',
			width: '100px',
		}, {
			field: 'caoz',
			title: '操作',
			width: '80px',
			events: {
				'click .fileDownload': function (e, value, row, index) {
					var newUrl = $.parserUrlForToken(top.config.FileHost + "/FileController/download.do?ftpPath=" + row.filePath + "&fname=" + row.fileName)
					window.location.href = newUrl;
				}
			},
			formatter: function (value, row, index) {
				return "<a style='text-decoration: none;margin-right: 5px;' class='btn btn-primary btn-sm fileDownload'>下载</a>";
			}
		}]
	});
	$("#subentryTable").bootstrapTable('load', data)
}