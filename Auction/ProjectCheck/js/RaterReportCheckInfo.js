WORKFLOWTYPE = "psbg"; //申明项目公告类型

var id = $.query.get("key"); //主键id 项目id
var packageId = $.query.get("packageId"); //主键id 项目id
var projectId = $.query.get("projectId"); //主键id 项目id
var edittype = $.query.get("edittype"); //查看还是审核detailed查看  audit审核
var tenderType = $.query.get("tenderType"); //查看项目结果类型
var examType = $.query.get("examType"); //评审类型
//访问路径
var url = top.config.AuctionHost;

var urlFindProjectReviewInfo = top.config.AuctionHost + "/ManagerCheckController/findManagerCheckProgress.do";
var loadFile = top.config.FileHost + "/FileController/download.do"; //文件下载
var packageData; //本页面获取的包件信息
var isOfferDetailedItem;
var offersData=new Array();
var offerDetailedData=new Array();
var packageDetailedData=new Array();
var purFilesData=new Array();
var purOfferFilesData=new Array();
var fileSource;//0供应商递交评审文件信息 1供应商递交报价表文件信息
var viewpackage; //查看包件页面地址
$(function() {

	if(edittype == "detailed") {
		$("#btn_submit").hide();
		$("#tableWorkflow").hide();
	}
	InfoAndProjectCheck(id);
	//查询审核等级和审核人
	findWorkflowCheckerAndAccp(id);
})

//调用接口，读取页面信息
function InfoAndProjectCheck(keyId) {
	$.ajax({
		type: "get",
		url: urlFindProjectReviewInfo,
		data: {
			projectId: projectId,
			packageId: packageId,
			examType:examType,
			roleType: "0",
			checkReportId:keyId||''
		},
		async: false,
		success: function(data) {
			$("#projectCode").html(data.data.projectCode);
			$("#projectName").html(data.data.projectName);
			$("#packageName").html(data.data.packageName);
			$("#packageNum").html(data.data.packageNum);

			packageData = data.data;
			
			if(packageData.isAgent==0){
				viewpackage='Auction/common/Purchase/Purchase/model/viewPackage.html';
			}else{
				viewpackage='Auction/common/Agent/Purchase/model/viewPackage.html';
			}

			if(examType == 0){
				$("#lidiv").hide();
				$("#listOffer").hide();
				$("#myTab li:last-child").addClass("active");
				$("#myTabContent div").removeClass('show');		
				CheckReport();
				$("#CheckReport").addClass("show");
			}else{
				getPriceList();
				if(!quotationData){
					return;
				}
				
				isOfferDetailedItem = data.data.isOfferDetailedItem;
				getQuotationList();
				$("#offerAttention").html(data.data.offerAttention ? data.data.offerAttention : "");
				
			}
			
			
		}
	});
}

//点击tab加载对应数据
$("#myTab").on("click", "li", function(e) {
	$("#myTab li").removeClass('active');
	$(this).addClass('active');
	var contentdiv = $(this).children("a")[0].hash;
	$("#myTabContent div").removeClass('show');
	$(contentdiv).addClass("show");

	var id = contentdiv.substr(1, contentdiv.length - 1);
	$("#Tab_" + id + " li").removeClass('active');
	$("#Tab_" + id + " li").first().addClass('active');
	$("#TabContent_" + id + " div").removeClass('show');
	$("#TabContent_" + id + " div").first().addClass('show');
	$("#Tab_" + id).on("click", "li", function(e) {
		$("#Tab_" + id + " li").removeClass('active');
		$(this).addClass('active');
		var contentdivdetail = $(this).children("a")[0].hash;
		$("#TabContent_" + id + " div").removeClass('show');
		$(contentdivdetail).addClass("show");
	});

	switch($(this).children("a")[0].text) {
		case "清单报价":
			getPriceList();
			if(!quotationData){
				return;
			}
			getQuotationList();
			$("#offerAttention").html(data.data.offerAttention ? data.data.offerAttention : "");
			isOfferDetailedItem = data.data.isOfferDetailedItem;
			break;
		case "报价文件":
			offerData()
			break;
		case "评审报告":
			CheckReport();
			break;
		default:
			break;
	}
});
function offerData() {
	$.ajax({
		type: "post",
		url: url + "/ReviewCheckController/getCheckOtherInfomation.do",
		data: {
			projectId: projectId,
			packageId: $.query.get("packageId"),
			examType: examType
		},
		async: false,
		success: function (data) {
			if (data.success) {
                offersData=data.data.offers;
                offerDetailedData=data.data.offerDetaileds;
                packageDetailedData=data.data;
                purFilesData=data.data.purFiles;
                purOfferFilesData=data.data.purOfferFiles;	
				fileSource=data.data.fileSource;
				if(fileSource==1&&examType==1){
					viewAjax();	
				}
				fileEnterprise();
			}else{
                parent.layer.alert(data.message);				
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
			title: '报价供应商名称'
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
			packageId: $.query.get("packageId"),
			examType: examType,
		},
		dataType: "json",
		success: function (response) {
			if(response.success){
				if(response.data){
					offerFileData=response.data.offerPriceFiles;					
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
	if(fileSource==1&&examType==1){
		if(packageData.doubleEnvelope==1){
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
		if(packageData.isOpenDarkDoc==1){
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
					'click .download':function(e,value, row, index){				   
						var fileIndex = $(this).attr('data-index');			 
						var item = row.offerDataList[fileIndex];
						window.location.href=$.parserUrlForToken(loadFile+'?ftpPath='+item.filePath+'&fname='+item.fileName)
					},                          
				},
				formatter: function(value, row, index) {
					var html=[];
					var offerDataList = [];
					if(offerData){
						for(var i=0;i<offerData.length;i++){
							if(offerData[i].packageCheckListId==row.id){
								row.offerData=offerData[i];
								if (offerData[i].filePath) {
									offerDataList.push(offerData[i]);
								}
							}
						} 
					}
					row.offerDataList = offerDataList;
					if(row.offerData){
						if(offerDataList.length){
							for(let i = 0 ; i < offerDataList.length; i++) {
								var el = offerDataList[i];
								html.push('<button title="' + el.fileName + '" data-index="' + i + '" type="button" class="btn btn-xs btn-default download"><span class="glyphicon glyphicon-download"></span>' + el.fileName + '</button>');
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
			}, {
				field: 'fileSize',
				title: '附件大小',
				width: '100px',
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

function CheckReport(){
	$.ajax({
		type: "post",
		url: url + "/ReviewReportController/getCheckReposts.do",
		data: {
			projectId: projectId,
			packageId: $.query.get("packageId"),
			examType:examType,
		},
		async: false,
		success: function (rec) {
			if(rec.success){
				if (rec.data && rec.data.checkReport != undefined && rec.data.checkReports.length > 0) {
					//data.data.checkReport == '已完成'
					var repData = rec.data.checkReports;
					$("#CheckReportTable").bootstrapTable({
						//data: packageData.checkReports,
						columns: [{
							field: '#',
							title: '序号',
							width: '50px',
							cellStyle: {
								css: {
									"text-align": "center"
								}
							},
							formatter: function(value, row, index) {
								return index + 1;
							}
						}, {
							field: 'reportUrl',
							title: '评审报告',
							align: 'center',
							cellStyle: {
								css: {
									"text-align": "center"
								}
							},
							formatter: function(value, row, index) {
								return packageData.packageName + "_评审报告";
							}
						}, {
							field: 'id',
							title: '下载',
							width: '150px',
							align: 'center',
							cellStyle: {
								css: {
									"text-align": "center"
								}
							},
							events:{
								'click .pdfPreview':function(e,value, row, index){
									previewPdf(row.reportUrl);
								},
								'click .download':function(e,value, row, index){
									var str2= packageData.packageName.replace(/[\!\|\~\`\#\$\%\^\&\*\"\?]/g, ' ');
									var newUrl = top.config.FileHost + "/FileController/download.do?ftpPath=" + row.reportUrl + "&fname=" + str2 + "_评审报告.pdf";
									window.location.href = $.parserUrlForToken(newUrl);
								}
							},
							formatter: function(value, row, index) {
								return "<a href='javascript:void(0)' class='btn-sm btn-primary pdfPreview' style='text-decoration:none;'><span class='glyphicon glyphicon-picture' aria-hidden='true'></span>预览</a>&nbsp;"+
									   "<a href='javascript:void(0)' class='btn-sm btn-primary download' style='text-decoration:none;'><span class='glyphicon glyphicon-arrow-down' aria-hidden='true'></span>下载</a>";
							}
						}]
					});
					$("#CheckReportTable").bootstrapTable("load", repData)
				}
				
			}
			
		}
	});
}

// 查看项目详情
$("#viewProject").on('click',function(){
	parent.layer.open({
        type: 2 //此处以iframe举例
        ,title:'查看项目信息'
        ,area: ['1000px', '600px']
        ,maxmin: true //开启最大化最小化按钮
        ,content:'Auction/common/Agent/Purchase/model/viewPurchase.html?projectId='+projectId+'&isRater=1'
    });
})
// 查看包件详情
$("#viewpackage").on('click',function(){
	parent.layer.open({
        type: 2 //此处以iframe举例
        ,title: '查看包件'
        ,area: ['1000px', '600px']
		,maxmin: true//开启最大化最小化按钮
        ,content:viewpackage+'?isRater=1'
        ,success:function(layero,index){    
        	var iframeWind=layero.find('iframe')[0].contentWindow;
        	iframeWind.du(packageData.packageId,examType);	
        }
        
    });
})