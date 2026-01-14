var buyFileUrl = config.AuctionHost + "/AuctionFileController/findAuctionFileDownloadList.do" //新增接口采购文件下载记录明细
//挂载采购文件下载记录请求
function buyFileDetail(uid, showCollection) {
	$.ajax({
		type: "get",
		url: buyFileUrl,
		dataType: 'json',
		data:{
			"packageId":uid
		},
		async: true,
		success: function(result) {
			if(result.success) {
				//处理数据按微信、支付宝支付分组，若支付用户id重复，红字显示
				var arr = result.data;
				var colors = ["red", "#EE7600", "#9400D3", "green", "#EE00EE", "#8B1A1A"];
				var isRepeat = false;
				for(var i = 0; i < arr.length - 1; i++){
					isRepeat = false;
					if(arr[i].color){
						continue;
					}
					for(var j = i+1; j < arr.length; j++){
						if(arr[j].color){
							continue;
						}
						if(arr[i].payId == arr[j].payId){
							if(colors.length > 0){
								arr[i].color = colors[0];
								arr[j].color = colors[0];
							} else {
								arr[i].color = "red";
								arr[j].color = "red";
							}
							isRepeat = true;
						}
					}
					if(isRepeat){
						colors.splice(0,1);
					}
				}
				buyFileHtml(arr, showCollection); //有记录显示
			} else {
				//top.layer.alert(result.message);
			}
		}
	})
}
//挂载采购文件下载记录
function buyFileHtml(data, showCollection) {
	$("#PurchaseFileDownload").bootstrapTable({
		undefinedText: "",
		pagination: false,
		columns: [{
				title: "序号",
				align: "center",
				width: "50px",
				formatter: function(value, row, index) {
					return index + 1;
				}
			},
			{
				title: "企业名称",
				align: "left",
				field: "enterpriseName",
				formatter:function(value, row, index){
					if(showCollection && isReminderCollection(row.enterpriseCode)){
						return '<span class="glyphicon glyphicon-exclamation-sign" style="color: #ccbb09;margin-right: 5px"></span>' + showBidderRenameList(row.enterpriseId, value, RenameData, 'body')
					}else{
						return showBidderRenameList(row.enterpriseId, value, RenameData, 'body')
					}
				}
			},
			{
				title: "购买时间",
				align: "center",
				field: "subDate",
				width: "160",

			},
			{
				title: "购买情况",
				align: "center",
				width: "87",
				field: 'orderStatus',
				formatter: function(value, row, index) {
					if(value == "0") {
						return '<span style="color:green;">无需购买</span>';
					} else if(value == "1") {
						return '<span style="color:green;">已购买</span>';
					}else if(value == "2") {
						return '<span style="color:red;">未购买</span>';
					}
				}
			},
			{
				title: "下载次数",
				align: "center",
				width: "80",
				field: 'buyCount'
			},
			{
				title: "支付方式",
				align: "center",
				width: "87",
				field: 'payFrom',
				formatter: function(value, row, index) {
					if(value == "WEIXIN") {
						return '<span>微信</span>';
					} else if(value == "ZHIFUBAO") {
						return '<span>支付宝</span>';
					} else {
						return "";
					}
				}
			},
			{
				title: "支付用户ID",
				align: "center",
				field: 'payId',
				formatter: function(value, row, index) {
					if(value){
						if(row.color){
							return "<span style='color:"+row.color+"'>"+value+"</span>";
						} else {
							return value;
						}
					} else {
						return "";
					}
				}
			},
			{
				
				title: "操作",
				align: "center",
				width: "80",
				field: 'action',
				formatter: function(value, row, index) {
					return "<button onclick=downView(\'" + row.enterpriseId + "\') class='btn btn-primary btn-xs'><span class='glyphicon glyphicon-eye-open'></span>查看</button>"
			 	}
			}
		]

	})
	$("#PurchaseFileDownload").bootstrapTable('load', data);
	$(".table-file .fixed-table-body").css("height","auto");
	$("table#PurchaseFileDownload td").css("white-space","normal");
}

/**
 * 文件下载记录查看详情
 * @param {Object} enterpriseId  供应商id
 */
function downView(enterpriseId){
	parent.layer.open({
		type: 2,
		title: '查看详情',
		area: ['1100px','600px'],
		// maxmin: false, //该参数值对type:1和type:2有效。默认不显示最大小化按钮。需要显示配置maxmin: true即可
		resize: false, //是否允许拉伸
		closeBtn: 1,
		content: 'Auction/common/Agent/BidNotice/modal/BidDownloadFileInfo.html?packageId='+packageId+'&enterpriseId='+enterpriseId+'&projectId='+projectId+'&tenderType=1',
		success:function(layero,index1){    
			var iframeWind=layero.find('iframe')[0].contentWindow;
		}
	});
}