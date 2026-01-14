function text() {
	var allProjectData = config.AuctionHost + '/ProjectReviewController/findAutionPurchaseInfo.do';//项目数据的接口；
	var nowSysDate = top.$("#systemTime").html() + " " + top.$("#sysTime").html();
	var packageData = [];
	var DetailedData = [];

	if ($("#purchaserDepartmentId").val() == "") {
		return "请选择采购人所属部门";
	};
	if ($("#content").val() == "") {
		return "请填写竞价公告信息"
	};
	var purchaseaData = []
	$.ajax({
		url: allProjectData,
		type: 'post',
		//dataType:'json',
		async: false,
		//contentType:'application/json;charset=UTF-8',
		data: {
			'projectId': projectDataId
		},
		success: function (data) {
			//项目数据
			purchaseaData = data.data;
			//邀请供应商的数据
			publicData = purchaseaData.projectSupplier;
			if (purchaseaData.autionProjectPackage.length > 0) {
				//包件信息的数据
				packageData = purchaseaData.autionProjectPackage;

				//设备信息的数据
				DetailedData = purchaseaData.auctionPackageDetailed

			}
		},
	});
	if (packageData.length == 0 || packageData == undefined) {
		return "包件不能为空"
	};
	if (massage2 == 2) {
		return "找不到该级别的审批人,请联系管理员"
	};
	if ($("#employeeId").val() == "") {
		return "请选择审核人"
	};

	let packageAllFile = purchaseaData.purFile;
	for (var i = 0; i < packageData.length; i++) {
		//这里开始校验 是否缴纳竞价/竞卖采购文件费 && 是否上传了竞价/竞卖采购文件
		if(packageData[i].isSellFile == 0){ // isSellFile=0 需要 缴纳竞价采购文件费
			let res = []; // 保存符合要求的文件(判断数量>0)
			for(let p=0; p<packageAllFile.length; p++){
				if(packageData[i].id == packageAllFile[p].modelId){
					res.push(packageAllFile[p]);
				}
			}
			if(res.length == 0){
				return '包件' + packageData[i].packageName + "需要缴纳竞价采购文件费，竞价采购文件必须上传";
			}
		}
		//-----校验End

		var minType = packageData[i].auctionType
		if (packageData[i].dataTypeName == "" || packageData[i].dataTypeName == undefined || packageData[i].dataTypeId == "" || packageData[i].dataTypeId == undefined) {
			return '包件' + packageData[i].packageName + "的项目类型为空，请填写";

		};
		/* 前端验证屏蔽，转后台验证 */
		/* if (minType != 6 && minType != 7 && !isDfcm) {

			if (packageData[i].budgetPrice == "" || packageData[i].budgetPrice == undefined) {
				return '包件' + packageData[i].packageName + "的预算价为空，请填写";
			};
		} */
		if (packageData[i].auctionType == 0) {
			if (packageData[i].auctionModel == 0) {
				if (packageData[i].timeLimit == "" || packageData[i].timeLimit == undefined) {
					return '包件' + packageData[i].packageName + "的限时是空值，请添加";
				};

			};
		};
		if (packageData[i].auctionType == 2 && packageData[i].outType == 0) {
			if (packageData[i].firstOutSupplier == "" || packageData[i].firstOutSupplier == undefined) {
				return '包件' + packageData[i].packageName + "的第1轮淘汰供应商数不能为空";
			};

			if (packageData[i].firstKeepSupplier == "" || packageData[i].firstKeepSupplier == undefined) {
				return '包件' + packageData[i].packageName + "的第1轮最低保留供应商数不能为空";
			};

		};
		if (packageData[i].auctionType == 3 && packageData[i].outType == 0) {
			if (packageData[i].firstOutSupplier == "" || packageData[i].firstOutSupplier == undefined) {
				return '包件' + packageData[i].packageName + "的第1轮淘汰供应商数不能为空";
			};
			if (packageData[i].firstKeepSupplier == "" || packageData[i].firstKeepSupplier == undefined) {
				return '包件' + packageData[i].packageName + "的第1轮最低保留供应商数不能为空";
			};
			if (packageData[i].secondOutSupplier == "" || packageData[i].secondOutSupplier == undefined) {
				return '包件' + packageData[i].packageName + "的第2轮淘汰供应商数不能为空";
			};
			if (packageData[i].secondKeepSupplier == "" || packageData[i].secondKeepSupplier == undefined) {

				return '包件' + packageData[i].packageName + "的第2轮最低保留供应商数不能为空";
			};
		};
		var auctionOutType = []
		if (packageData[i].auctionType == 4 && packageData[i].outType == 0) {
			for (var m = 0; m < purchaseaData.auctionOutType.length; m++) {
				if (packageData[i].id == purchaseaData.auctionOutType[m].packageId) {
					auctionOutType.push(purchaseaData.auctionOutType[m])
				}
			}
			if (auctionOutType.length == 0) {
				return '包件' + packageData[i].packageName + "的淘汰方式不能为空";
			} else {
				for (var n = 0; n < auctionOutType.length; n++) {
					if (auctionOutType[n].countValue == undefined || auctionOutType[n].outValue == undefined) {
						return '包件' + packageData[i].packageName + "的淘汰方式不能为空";
					}
				}
			}
		}
		if (packageData[i].isPrice == 0 && (packageData[i].auctionModel == 0 || packageData[i].auctionType > 1)) {
			if (packageData[i].rawPrice == "" || packageData[i].rawPrice == undefined) {
				return '包件' + packageData[i].packageName + "的竞价起始价不能为空";
			}
		};
		/*
		** 1、自由竞价-按包件-设置竞价起始价
		** 2、多轮竞价/不限轮次-设置竞价起始价-设置降价幅度
		 */
		if ((packageData[i].auctionType == 0 && packageData[i].auctionModel == 0 && packageData[i].isPrice == 0) || ((packageData[i].auctionType == 4 || packageData[i].auctionType == 5 ||packageData[i].auctionType == 2||packageData[i].auctionType == 3) && packageData[i].isPrice == 0 && packageData[i].isPriceReduction == 0)) {
			if (packageData[i].priceReduction == "" || packageData[i].priceReduction == undefined) {
				return '包件' + packageData[i].packageName + "的降价幅度是空值请添加";
			}
		};
		var minData = [];
		for (var n = 0; n < DetailedData.length; n++) {
			if (DetailedData[n].packageId == packageData[i].id) {
				minData.push(DetailedData[n])
			}
		};
		if (minType != 6 && minType != 7) {
			if (minData.length == 0) {
				return '包件' + packageData[i].packageName + "的设备信息不能为空";
			}
		}
	}
}
function NewDate(str) {
	if (!str) {
		return 0;
	}
	arr = str.split(" ");
	d = arr[0].split("-");
	t = arr[1].split(":");
	var date = new Date();
	date.setUTCFullYear(d[0], d[1] - 1, d[2]);
	date.setUTCHours(t[0] - 8, t[1]);
	return date.getTime();
}