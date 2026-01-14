

var offerTableObj = {};
var fileUp; //报价
/*start报价表  调用报价封装方法  不需要单独提交*/
function offerFormData() {
	$("#offerForm").offerForm({
		viewURL:top.config.AuctionHost+'/PackagePriceListHisController/findPackageQuateList',//回显接口
		parameter:{//接口调用的基本参数
			packageId:packageInfo.id,
			bidFileCheckId:offerTableObj.fileCheckId,
			projectId:packageInfo.projectId, 
      examType: examType,
		},
    status: (typeof type === 'undefined' || type == "VIEW"? 2 : 1),//1为编辑2为查看
    // attachmentData:[],//传入回显报价表
		// offerSubmit:'.offerBtn',//提交按钮类名
		tableName:'offerTable'//表格名称
	})
}
//分项报价附件  不需要单独提交
function fileList(){
  if (!fileUp) {
    // 查询分项报价信息
    $.ajax({
      type: "get",
      url: config.AuctionHost+"/BidFileController/findBidFileCheckList",
      data: {
        'id':offerTableObj.fileCheckId,
      },
      async:false,
      dataType: "json",
      success: function (response) {
        if (response.success) {
          var resData = response.data
          offerTableObj.isOfferDetailedItem = resData[0].isOfferDetailedItem
          offerTableObj.offerAttention = resData[0].offerAttention
        }
      }
    });

    fileUp = $("#fileList").fileList({
      status: (typeof type === 'undefined' || type == "VIEW" ? 2 : 1),//1为编辑2为查看
      fileListUrl: top.config.AuctionHost + "/TempOfferFileHisController/findTempOfferFile", //文件列表
			parameter:{//接口调用的基本参数
				packageId:packageInfo.id,
				bidFileCheckId:offerTableObj.fileCheckId,
				projectId:packageInfo.projectId, 
        offerFileListId: "0",
        examType: examType,
			},
			// offerSubmit:'.offerBtn',//提交按钮
			isShow:offerTableObj.isOfferDetailedItem,//是否需要分项报价
      offerAttention: offerTableObj.offerAttention,
      // filesDataDetail:[],//传入回显文件
			flieName: '#fileHtml',//分项报价DOM
	
		})
	}
}
/*end报价*/
/* 报价表部分参数收集 */
function getPriceParams() {
  var pStr = ''
  // 只有后审需要
  if (examType == 1) {
    var obj = {
      tempOfferFileList: fileUp.options.filesDataDetail,
      packagePriceLists: $("#offerTable").bootstrapTable('getData'),
      isOfferDetailedItem: $("input[name='isOfferDetailedItem']:checked").val(),
      offerAttention:$("textarea[name='offerAttention']").val()
    }
    pStr = '&' + $.param(obj);
    // for (var key in obj) {
    //   var item = obj[key]
    //   if (Array.isArray(item)) {
    //     for (var i = 0; i < item.length; i++){
    //       for (var k in item[i]) {
    //         pStr += '&'+key+'['+i+'].'+k+'='+item[i][k]
    //       }
    //     }
    //   } else {
    //     pStr += '&'+key+'='+item
    //   }
    // }
  }
	
	return pStr;
}

/* 询比采购文件历史 */
//询比采购文件历史请求
function getFileHistory(paramsObj) {
  $.ajax({
    type: "post",
    url: top.config.AuctionHost+'/BidFileController/findFileChangeTopList',
    dataType: 'json',
    data: paramsObj,
    async: true,
    success: function (result) {
      if (result.success) {
        if (result.data.length > 0) {
          renderFileHistoryHTML(result.data) //有记录显示
          $(".filesHistory").show();
        }
      } else {
        top.layer.alert(result.message);
      }
    }
  })
}


// //挂载询比采购文件历史记录
function renderFileHistoryHTML(data) {
  $("#filesHistoryList").bootstrapTable({
    undefinedText: "",
    pagination: false,
    columns: [{
      title: "序号",
      align: "center",
      width: "50px",
      formatter: function (value, row, index) {
        return index + 1;
      }
    },
    {
      title: "变更标题",
      align: "center",
      field: 'fileChangeCount',
      formatter:function(value, row, index){
				if(value || value == 0){
					if(value == 0){
						return "首次";
					} else {
						return "第" +value+ "次变更";
					}
				}
			}
    },
    {
      title: "变更时间",
      align: "center",
      field: 'subDate'
    }, {
      field: '',
      title: '操作',
      align: 'center',
      halign: 'center',
      width: '100',
      formatter: function (value, row, index) {
        return '<button class="btn-xs btn btn-primary" onclick=fileHisItemView(\"' + index + '\")><span class="glyphicon glyphicon-eye-open" aria-hidden="true"></span>查看</button>';
      }
    }
    ]

  })
  $("#filesHistoryList").bootstrapTable('load', data);
  $(".fixed-table-loading").hide();
}
var viewpackage = 'Auction/common/Agent/Purchase/model/fileInfo.html';
function fileHisItemView($index) {
  var rowData = $('#filesHistoryList').bootstrapTable('getData'); //bootstrap获取当前页的数据	
	parent.layer.open({
		type: 2 //此处以iframe举例
			,
		title: '查看文件',
		area: ['100%', '100%'],
		maxmin: true,//开启最大化最小化按钮
		content: viewpackage+"?projectId="+packageInfo.projectId+'&packageId='+packageInfo.id+'&examType=' + examType + '&tenderType=0&special=VIEW&fileCheckId='+rowData[$index].id,
		success: function(layero, index) {
			var iframeWind = layero.find('iframe')[0].contentWindow;
		}
	});
}
/* -------------采购文件历史end--------------- */