/*
 */ 
//报价文件供应商
var offerFileData=new Array();
$(function(){
	offerData();
	fileEnterprise();
	if(fileSource==1&&examType==1){
		viewAjax();
		$(".isEname").html('报价文件')
	}else{
		if(examType==1){
			$(".isEname").html('报价文件')
		}else{
			$(".isEname").html('资格预审申请文件')
		}
		
	}
})
function fileEnterprise() {
	if(offersData.length>0){
		var RenameData = getBidderRenameData(packageId);//供应商更名信息
	}
	$("#fileEnterpriseTable").bootstrapTable({
		data: offersData,
		clickToSelect: true,
		onClickRow: function (row) {
			$('#fileTable').bootstrapTable(('destroy')); // 很重要的一步，刷新url！				
			file(row.offerFileList)		
				
		},
		onCheck: function (row) {	
			$('#fileTable').bootstrapTable(('destroy')); // 很重要的一步，刷新url！				
			file(row.offerFileList)
			// $('#fileTable').bootstrapTable('load', files);
		},
		columns: [{
			radio: true,
			formatter: function (value, row, index) {
				if (index == 0) {	
					$('#fileTable').bootstrapTable(('destroy')); // 很重要的一步，刷新url！						
					file(row.offerFileList)	
					
					return true;
				} else {
					return false
				};
			}
		},
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
			title: '报价供应商名称',
			formatter: function(value, row, index){
				return showBidderRenameList(row.supplierId, row.enterpriseName, RenameData, 'body')
			}
		}
		]
	});
}
function viewAjax(){
	$.ajax({
		type: "post",
		url: url + '/offerPriceFile/queryDataList.do',
		async:false,
		data:{
			projectId: projectId,
			packageId: packageId,
			examType: examType,
		},
		dataType: "json",
		success: function (response) {
			if(response.success){
				if(response.data){
					offerFileData=response.data.offerPriceFiles;
					file()
				}
				          
			}
		}
	});
}
//报价文件
function file(offerData) {
	var column=new Array();
	column=[
		{
			field: 'xh',
			title: '序号',
			align: 'center',
			width: '50px',
			formatter: function(value, row, index) {				 
				return index + 1;  //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
			}
		}	
	]
	if(fileSource==1||examType==1){
		if(progressList.doubleEnvelope==1){
			column.push(
				{
					field: 'doubleEnvelope',
					title: '双信封',
					align: 'center',
					width: '180px',
					formatter: function(value, row, index) {
						var str=(row.doubleEnvelope==1?'第一信封':'第二信封');		 
						return str
					}
				}
			)
		}
		column.push(
			{
				field: 'bidFileName',
				title: '报价文件名称',
				align: 'center',
				width: '150px',
				
			}
		)
		column.push(
			{
				field: 'mustUpload',
				title: '必须上传',
				align: 'center',
				width: '80px',
				formatter: function(value, row, index) {	
					var str=(row.mustUpload==1?'是':'否');			                          
					return str
				}
			}
		) 
		if(progressList.isOpenDarkDoc==1){
			column.push(
				{
					field: 'darkMark',
					title: '暗标',
					align: 'center',
					width: '80px',
					formatter: function(value, row, index) {	
						var str=(row.darkMark==1?'是':'否');			                          
						return str
					}
				}
			)
		}
		column.push(
			{
				field: 'files',
				title: '操作',
				align: 'left',
				width: '150',
				events:{ 
					//调用下载
					'click .download': function (e, value, row, index) {
						var fileIndex = $(this).attr('data-index');			 
						var item = row.offerDataList[fileIndex];
						window.location.href=$.parserUrlForToken(loadFile+'?ftpPath='+item.filePath+'&fname='+item.fileName)
					},                          
				},
				formatter: function(value, row, index) {
					var html=[];
					var offerDataList = [];
					for(var i=0;i<offerData.length;i++){
						if(offerData[i].packageCheckListId==row.id){
							row.offerData=offerData[i];
							if (offerData[i].filePath) {
								offerDataList.push(offerData[i]);
							}
						}
					}
					row.offerDataList = offerDataList;
					if(row.offerData){
						if(offerDataList.length){
							for(let i = 0 ; i < offerDataList.length; i++) {
								var el = offerDataList[i];
								html.push('<button data-index="' + i + '" type="button" class="btn btn-xs btn-default download"><span class="glyphicon glyphicon-download"></span>' + el.fileName + '</button>');
							}
						}else{
							if(row.offerData.isShowDoubleFile==0){
								html.push('<span class="text-danger">未解封</span>')
							}else{
								if(row.offerData.isShadowOver==0){
									html.push('<span class="text-danger">暗标,请点击一键打包下载</span>')
								}
							}
							
							
						}
						
																	
					}                               
					return html.join("")   
				}
			}
		);
	}else{
		column.push(
			{
				field: 'fileName',
				title: '附件名称'
			},{
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
			}
		)	
	}
	$("#fileTable").bootstrapTable({
		columns: column
	});
	if(fileSource==1&&examType==1){
		$('#fileTable').bootstrapTable('load', offerFileData);
	}else{
		$('#fileTable').bootstrapTable('load', offerData);
	}
}