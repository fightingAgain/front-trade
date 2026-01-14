/* 停机提醒 */
function startNavTask(isEnd) {
    if (!timeStep) {
		 haltReminder(isEnd);
        var time = 30000;
        timeStep = setInterval(function () {
            haltReminder(isEnd);
        }, time);
    }
}
function haltReminder(isEnd){
	if(isEnd != 1 && !alertHaltReminder){
		$.ajax({
		 	type:"post",
		   	url: top.config.Syshost + '/ShutdownReminderController/quearyReview.do', //查询当前是否处于 停机提醒范围，如果没有 就查询 15分钟后,
		   	async: true,
			hideLoading: true,
		   	success: function(data){
		   		if(data.success){
					if(data.data){
						top.layer.alert((data.data.remark + '(停机时间：' + data.data.startDate.substring(0, 16) + '至' + data.data.endDate.substring(0, 16) + ')'),{title:'系统停机提示'});
						alertHaltReminder = true;
						if (timeStep) {
						    clearInterval(timeStep);
							timeStep = null;
						}
					}
		   		}else{
					top.layer.alert(data.message)
				}
		   	},
		   	error: function(){
		   		
		   	},
		});
	}
}
/************************************* 供应商网络信息 、 投标人相关信息、保证金信息   *******************************************/
var warnUrl = top.config.AuctionHost + '/MachineController/findWarningProjectById.do';//预警
var machineUrl = top.config.AuctionHost + '/MachineController/findOpeningMachineList.do';//违标篡标信息查询
var bondUrl=top.config.depositHost +"/DepositController/managerLookSubmitSituation.do";//查看虚拟子帐号保证金递交情况
var msgUrl = "Bond/cashViewList/model/tenderList.html"; // 查看 
var bondData=[];
function getMachineList(){
	$.ajax({
		type:"post",
		url:machineUrl,
		async:true,
		data: {
			'packageId':packageId,
			'projectId':projectId
		},
		success: function(res){
			if(res.success){
				tableForIp(res.data)
			}else{
				top.layer.alert(res.message);
			}
		}
	});
	
}
/************************************* 供应商网络信息    *******************************************/
function tableForIp(data){
	
	$('#ipTableList').bootstrapTable({
		pagination: false,
	
		undefinedText: "/",
		columns: [
		/* {
		    field: "xuhao",
			title: "序号",
			align: "center",
			halign: "center",
			width: "50px",
			formatter: function(value, row, index) {
				return index + 1;
			},
		}, */{
			field: "bidderName",
			title: "供应商名称",
			align: "left",
		},
		{
			field: "mac",
			title: "投标文件MAC地址",
			align: "left",
			halign: "left",	
			cellStyle: {
				css: {
					"min-width": "120px",
					"word-wrap": "break-word",
					"word-break": "break-all",
					"white-space": "normal"
				}
			},
			formatter: function(value,row,index) {
				if(value){
					if(row.macFlag==1){
						return '<div class="ipBox"><span class="red">'+row.mac+'</span></div>'
					}else if(row.macFlag==2){
						return '<div class="ipBox"><span class="green">'+row.mac+'</span></div>'
					}else{
						return '<div class="ipBox"><span class="default">'+row.mac+'</span></div>'
					}
				}else{
					return "/";
				}
			}
		},
		{
			field: "caCertificate",
			title: "投标人（参与人）CA证书号",
			align: "center",
			cellStyle: {
				css: {
					"min-width": "120px",
					"word-wrap": "break-word",
					"word-break": "break-all",
					"white-space": "normal"
				}
			},
			formatter: function(value, row, index) {
				if(value == undefined){
					return "/";
				}else{
					if(row.caCertificateFlag==1){
						return '<div class="ipBox"><span class="red">'+row.caCertificate+'</span></div>'
					}else if(row.caCertificateFlag==2){
						return '<div class="ipBox"><span class="green">'+row.caCertificate+'</span></div>'
					}else{
						return '<div class="ipBox"><span class="default">'+row.caCertificate+'</span></div>'
					}
				}
			}		
		},
		{
			field: "encryptionDog",
			title: "造价软件加密锁号",
			align: "center",
			cellStyle: {
				css: {
					"min-width": "120px",
					"word-wrap": "break-word",
					"word-break": "break-all",
					"white-space": "normal"
				}
			},	
			formatter: function(value, row, index) {
				if(value == undefined || value == '/'){
					return "/";
				}else{
					if(row.encryptionDogFlag==1){
						return '<div class="ipBox"><span class="red">'+value+'</span></div>'
					}else if(row.encryptionDogFlag==2){
						return '<div class="ipBox"><span class="green">'+value+'</span></div>'
					}else{
						return '<div class="ipBox"><span class="default">'+value+'</span></div>'
					}
				}
			}				
		},
		{
			field: "downIpList",
			title:((examType == 1)?"招标（采购）文件下载IP地址":"资格预审文件下载IP地址") ,
			align: "left",
			halign: "left",	
			cellStyle: {
				css: {
					"width": "370px",
					"word-wrap": "break-word",
					"word-break": "break-all",
					"white-space": "normal"
				}
			},
			formatter: function(value,row,index) {
				let str = '<div class="ipBox">';
				for(let i=0; i<value.length;i++){
					if(value[i].ip){
						if(value[i].flag==1){
							str+='<span class="red">'+value[i].ip+'</span>'
						}else if(value[i].flag==2){
							str+='<span class="green_wrap"><span class="green">'+value[i].ip+'</span><span>（'+value[i].remarks+'）</span></span>'
						}else{
							str+='<span class="default">'+value[i].ip+'</span>'
						}
					}
				}
				str +='</div>';
				return str
			}								
		},
		{
			field: "uploadIpList",
			title: ((examType == 1)?"投标文件（项目建议书）上传IP地址":"资格申请文件递交IP地址"),
			align: "left",
			halign: "left",	
			cellStyle: {
				css: {
					"width": "370px",
					"word-wrap": "break-word",
					"word-break": "break-all",
					"white-space": "normal"
				}
			},	
			formatter: function(value,row,index) {
				let str = '<div class="ipBox">';
				for(let i=0; i<value.length;i++){
					if(value[i].flag==1){
						str+='<span class="red">'+value[i].ip+'</span>'
					}else if(value[i].flag==2){
						str+='<span class="green_wrap"><span class="green">'+value[i].ip+'</span><span>（'+value[i].remarks+'）</span></span>'
					}else{
						str+='<span class="default">'+value[i].ip+'</span>'
					}
				}
				str +='</div>';
				return str
			}	
		},
		{
			field: "decryptIpList",
			title: '开标解密IP',
			visible: isShowScreen=='0'?true: false,
			align: "left",
			halign: "left",	
			cellStyle: {
				css: {
					"width": "370px",
					"word-wrap": "break-word",
					"word-break": "break-all",
					"white-space": "normal"
				}
			},	
			formatter: function(value,row,index) {
				let str = '<div class="ipBox">';
				for(let i=0; i<value.length;i++){
					if(value[i].flag==1){
						str+='<span class="red">'+value[i].ip+'</span>'
					}else if(value[i].flag==2){
						str+='<span class="green_wrap"><span class="green">'+value[i].ip+'</span><span>（'+value[i].remarks+'）</span></span>'
					}else{
						str+='<span class="default">'+value[i].ip+'</span>'
					}
				}
				str +='</div>';
				return str
			}	
		},
		{
			field: "disknum",
			title: "硬盘序列号",
			align: "center",
			cellStyle: {
				css: {
					"min-width": "120px",
					"word-wrap": "break-word",
					"word-break": "break-all",
					"white-space": "normal"
				}
			},
			formatter: function(value, row, index) {
				if(value == undefined || value == '/'){
					return "/";
				}else{
					if(row.disknumFlag==1){
						return '<div class="ipBox"><span class="red">'+value+'</span></div>'
					}else if(row.disknumFlag==2){
						return '<div class="ipBox"><span class="green">'+value+'</span></div>'
					}else{
						return '<div class="ipBox"><span class="default">'+value+'</span></div>'
					}
				}
			}
		}
		]
	});
	$('#ipTableList').bootstrapTable("load",data); //重载数据;
}

/************************************* 供应商网络信息   --end *******************************************/
/* *************************           预警          ********************** */
//投标文件投标人
function reviewWarnLists(){
	$.ajax({
		type:"post",
		url:warnUrl,
		async:true,
		data: {
			'packageId':packageId,
			'projectId':projectId
		},
		success: function(res){
			if(res.success){
				warnData=res.data;
				console.log(warnData)
				reviewTableWarn(warnData)
			}else{
				top.layer.alert(rs.message);
			}
		}
	});
}
function reviewTableWarn(data){
	$('#reviewWarningList').bootstrapTable({
		pagination: false,
		undefinedText: "/",
		columns: [
		{
		    field: "xuhao",
			title: "序号",
			align: "center",
			halign: "center",
			width: "50px",
			formatter: function(value, row, index) {
				return index + 1;
			},
		},{
			field: "supplierName",
			title: "供应商名称",
			align: "left",
		},{
			field: "supplierLinkMens",
			title: "联系人",
			align: "left",
			cellStyle: {
				css: {
					"min-width": "80px",
					"word-wrap": "break-word",
					"word-break": "break-all",
					"white-space": "normal"
				}
			},
			formatter: function(value,row,index) {
				if(value){
					let str = '<div class="ipBox">';
					for(let i=0; i<value.length;i++){
						if(value[i].valueFlag==1){
							str+='<span class="red">'+(value[i].value?value[i].value:'')+'</span>'
						}else if(value[i].valueFlag==2){
							str+='<span class="green_wrap"><span class="green">'+(value[i].value?value[i].value:'')+'</span></span>'
						}else{
							str+='<span class="default">'+(value[i].value?value[i].value:'')+'</span>'
						}
					}
					str +='</div>';
					return str
				}else{
					return '/'
				}
			}
		},{
			field: "supplierLinkPhones",
			title: "手机号",
			align: "left",
			cellStyle: {
				css: {
					"min-width": "120px",
					"word-wrap": "break-word",
					"word-break": "break-all",
					"white-space": "normal"
				}
			},
			formatter: function(value,row,index) {
				if(value){
					let str = '<div class="ipBox">';
					for(let i=0; i<value.length;i++){
						if(value[i].valueFlag==1){
							str+='<span class="red">'+(value[i].value?value[i].value:'')+'</span>'
						}else if(value[i].valueFlag==2){
							str+='<span class="green_wrap"><span class="green">'+(value[i].value?value[i].value:'')+'</span></span>'
						}else{
							str+='<span class="default">'+(value[i].value?value[i].value:'')+'</span>'
						}
					}
					str +='</div>';
					return str
				}else{
					return '/'
				}
			}
		},{
			field: "supplierLinkEmails",
			title: "邮箱号",
			align: "left",
			cellStyle: {
				css: {
					"min-width": "120px",
					"word-wrap": "break-word",
					"word-break": "break-all",
					"white-space": "normal"
				}
			},
			formatter: function(value,row,index) {
				if(value){
					let str = '<div class="ipBox">';
					for(let i=0; i<value.length;i++){
						if(value[i].valueFlag==1){
							str+='<span class="red">'+(value[i].value?value[i].value:'')+'</span>'
						}else if(value[i].valueFlag==2){
							str+='<span class="green_wrap"><span class="green">'+(value[i].value?value[i].value:'')+'</span></span>'
						}else{
							str+='<span class="default">'+(value[i].value?value[i].value:'')+'</span>'
						}
					}
					str +='</div>';
					return str
				}else{
					return '/'
				}
			}
		},{
			field: 'linkCardTypes',
			title: '下载联系人证件类型',
			align: 'center',
			visible: isShowCard=='0',
			formatter: function(value,row,index) {
				if(value){
					let str = '';
					for(let i=0; i<value.length;i++){
						if (value[i].value == '1') {
							str += '护照<br>'
						} else if (value[i].value == '0') {
							str += '身份证<br>'
						}
					}
					return str
				}else{
					return '/'
				}
			}
		},{
			field: "linkCards",
			title: "下载联系人证件号",
			align: "left",
			visible: isShowCard=='0',
			formatter: function(value,row,index) {
				if(value){
					let str = '<div class="ipBox">';
					for(let i=0; i<value.length;i++){
						if(value[i].valueFlag==1){
							str+='<span class="red">'+(value[i].value?value[i].value:'')+'</span>'
						}else if(value[i].valueFlag==2){
							str+='<span class="green_wrap"><span class="green">'+(value[i].value?value[i].value:'')+'</span></span>'
						}else{
							str+='<span class="default">'+(value[i].value?value[i].value:'')+'</span>'
						}
					}
					str +='</div>';
					return str
				}else{
					return '/'
				}
			}
		},{
			field: "bidderProxy",
			title: "投标人代表",
			align: "left",
			cellStyle: {
				css: {
					"min-width": "100px",
					"word-wrap": "break-word",
					"word-break": "break-all",
					"white-space": "normal"
				}
			},
			formatter: function(value,row,index) {
				if(value){
					return '<div class="ipBox"><span class="'+(row.bidderProxyFlag==1?'red':row.bidderProxyFlag==2?'green':'default')+'">'+value+'</span></div>';
				}
			}
		},{
			field: 'bidderProxyCardType',
			title: '证件类型',
			align: 'center',
			formatter: function(value) {
				if (value == '1') {
					return '护照'
				} else if (value == '0') {
					return '身份证'
				}
			}
		},
		{
			field: "bidderProxyCard",
			title: "证件号码",
			align: "left",
			cellStyle: {
				css: {
					"min-width": "100px",
					"word-wrap": "break-word",
					"word-break": "break-all",
					"white-space": "normal"
				}
			},
			formatter: function(value,row,index) {
				if(value){
					return '<div class="ipBox"><span class="'+(row.bidderProxyCardFlag==1?'red':row.bidderProxyCardFlag==2?'green':'default')+'">'+value+'</span></div>';
				}
			}
		},
		{
			field: "projectLeader",
			title: "项目负责人",
			align: "left",
			halign: "left",	
			cellStyle: {
				css: {
					"min-width": "120px",
					"word-wrap": "break-word",
					"word-break": "break-all",
					"white-space": "normal"
				}
			},
			formatter: function(value,row,index) {
				if(value){
					return '<div class="ipBox"><span class="'+(row.projectLeaderFlag==1?'red':row.projectLeaderFlag==2?'green':'default')+'">'+value+'</span></div>';
				}
			}
		},{
			field: 'projectLeaderCardType',
			title: '证件类型',
			align: 'center',
			formatter: function(value) {
				if (value == '1') {
					return '护照'
				} else if (value == '0') {
					return '身份证'
				}
			}
		},
		{
			field: "projectLeaderCard",
			title: "证件号码",
			align: "left",
			cellStyle: {
				css: {
					"min-width": "100px",
					"word-wrap": "break-word",
					"word-break": "break-all",
					"white-space": "normal"
				}
			},
			formatter: function(value,row,index) {
				if(value){
					return '<div class="ipBox"><span class="'+(row.projectLeaderCardFlag==1?'red':row.projectLeaderCardFlag==2?'green':'default')+'">'+value+'</span></div>';
				}
			}
		},{
			field: 'registerLinkMen',
			title: '注册联系人',
			visible: isShowCard=='0',
			align: 'center',
			cellStyle: function(value, row, index) {
				if(row.registerLinkMenFlag==1){
					return {css:{'white-space':'nowrap',"width":"150px","background-color":"#ffe7e7","color":"red"}}
				}else if(row.registerLinkMenFlag==2){
					return {css:{'white-space':'nowrap',"width":"150px","background-color":"#d4ffd3","color":"green"}}
				}else{
					return {css:{'white-space':'nowrap',"width":"150px"}}
				}
			}
		}, {
	        field: 'registerLinkPhone',
	        title: '注册联系人手机号',
			visible: isShowCard=='0',
	        align: 'center',
			cellStyle: function(value, row, index){
				if(row.registerLinkPhoneFlag==1){
					return {css:{'white-space':'nowrap',"width":"150px","background-color":"#ffe7e7","color":"red"}}
				}else if(row.registerLinkPhoneFlag==2){
					return {css:{'white-space':'nowrap',"width":"150px","background-color":"#d4ffd3","color":"green"}}
				}else{
					return {css:{'white-space':'nowrap',"width":"150px"}}
				}
			},
	    },{
	        field: 'registerLinkCardType',
	        title: '注册联系人证件类型',
			visible: isShowCard=='0',
	        align: 'center',
			formatter: function(value) {
				if (value == '1') {
					return '护照'
				} else if (value == '0') {
					return '身份证'
				}
			}
	    },  {
	        field: 'registerLinkCard',
	        title: '注册联系人证件号',
			visible: isShowCard=='0',
	        align: 'center',
			cellStyle: function(value, row, index){
				if(row.registerLinkCardFlag==1){
					return {css:{'white-space':'nowrap',"width":"150px","background-color":"#ffe7e7","color":"red"}}
				}else if(row.registerLinkCardFlag==2){
					return {css:{'white-space':'nowrap',"width":"150px","background-color":"#d4ffd3","color":"green"}}
				}else{
					return {css:{'white-space':'nowrap',"width":"150px"}}
				}
			},
	    }
	]
	});
	$('#reviewWarningList').bootstrapTable("load",data); //重载数据;
}
/* *************************           预警  -end         ********************** */
/* ****************************    保证金       ***************************** */
function getBondInfo(){
	var token=sessionStorage.token;
	$.ajax({
		type:"post",
		url:bondUrl,
		async: true,
		hideLoading: true,
		beforeSend: function(xhr){
			xhr.setRequestHeader("Token",token);
		},
		data: {
			'packageId':packageId,
		},
		success: function(res){
			if(res.success){
				if(res.data.boList){
					bondData = res.data.boList;
					bondLists(bondData)
				}
			}
		}
	});
}
//保证金递交情况  线上
function bondLists(data){
	$('#bondList').bootstrapTable({
		pagination: false,
		undefinedText: "",
		columns: [
			[{
					field: 'xh',
					title: '序号',
					align: 'center',
					width: '50',
					formatter: function(value, row, index) {
						return index + 1;
					},
				},
				{
					field: 'bidderName',
					title: '投标人名称',
					align: 'left',
					// width:'12%'
				},
				{
					field: 'paymentList',
					title: '投标人来款账号名称',
					align: 'left',
					formatter: function(value, row, index) {
						let str = ''
						for(let i=0;i<value.length;i++){
							if(value[i].paymentNameFlag==1){
								if(value[i].paymentName){
									str+='<font color="red">'+value[i].paymentName+'</font>、'
								}
							}else{
								if(value[i].paymentName){
									str+=value[i].paymentName+'、'
								}
							}
						}
						str = str.substr(0, str.length - 1)
						return str
					}
				},
				{
					field: '',
					title: '投标人来款账号',
					align: 'left',
					formatter: function(value, row, index) {
						let str = ''
						for(let i=0;i<row.paymentList.length;i++){
							if(row.paymentList[i].payerAccountNumFlag==1){
								if(row.paymentList[i].payerAccountNum){
									str+='<font color="red">'+row.paymentList[i].payerAccountNum+'</font>、'
								}
							}else{
								if(row.paymentList[i].payerAccountNum){
									str+=row.paymentList[i].payerAccountNum+'、'
								}
							}
						}
						str = str.substr(0, str.length - 1)
						return str
					}
				},
				{
					field: 'virtualSubaccount',
					title: '虚拟子账号',
					align: 'left',
					// width: '130'
				},
				{
					field: 'paymentFrequency',
					title: '来款次数',
					align: 'left',
					// width: '130'
				},
				{
					field: 'submitStatus',
					title: '是否递交',
					align: 'left',
					formatter: function (value, row, index) {
						if(row.submitStatus == "0"){
							return "否";
						} else if(row.submitStatus == "1"){
							return "是";
						}
	
					}
				},
				{
					field: 'cz',
					title: '操作',
					align: 'left',
					formatter: function(value, row, index) {
						var strSee = '<button  type="button" class="btn btn-primary btn-sm btnView" data-index="' + index + '"><span class="glyphicon glyphicon-eye-open"></span>查看递交情况</button>';
						return strSee;
					}
				},

			]
		]
	});
	$('#bondList').bootstrapTable("load", data); //重载数据
	var cashTable = $('#bondList')
	var columns = cashTable.bootstrapTable('getVisibleColumns');
	$('#cash-tip').remove();
	$('<p id="cash-tip" class="red" style="margin: 6px 12px;">当发现“' +columns[2].title+ '”标红显示，且与“' +columns[1].title+ '”相同时，可能是因为名称中带括号，系统区分全角和半角所致</p>').insertAfter(cashTable);
};
//查看保证金
$("#bondList").off('click', ".btnView").on("click", ".btnView", function() {
	var index = $(this).attr("data-index");
	var row = $('#bondList').bootstrapTable('getData')[index];
	openOnline(index);
});
/*
 * 打开查看窗口（线上虚拟子帐号查看保证金递交情况）
 * 
 */
function openOnline(index) {
	var rows = $('#bondList').bootstrapTable('getData')[index];
	top.layer.open({
		type: 2,
		title: '查看详情',
		area: ['100%', '100%'],
		maxmin: false,
		resize: false,
		closeBtn: 1,
		content: msgUrl+'?tenderType=0&id='+rows.bidSectionId+'&bidderId='+rows.bidderId,
		success: function(layero, index) {
			var iframeWin = layero.find('iframe')[0].contentWindow;
			//调用子窗口方法，传参
			iframeWin.passMsg(rows);
		}
	});
};

