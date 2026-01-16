/*
 */ 
//清单报价

$(function(){
    PackageOffer(offersData);
    offerDetaileds(offerDetailedData);
    packageDetaileds(packageDetailedData)
})
function PackageOffer(offers) {
	$("#PackageOfferTable").bootstrapTable({
		data: offers,
		columns: [{
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
			title: '供应商'
		},
		{
			field: 'saleTaxTotal',
			title: '最终报价',
		},
		{
			field: 'legalPerson',
			title: '法人/被授权人'
		},
		{
			field: 'linkTel',
			title: '联系方式'
		}
		]
	});
};
//清单报价详情
function offerDetaileds(data) {
	$("#offerDetailedsTable").bootstrapTable({
		cache: false,
		data: data,
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
			field: 'enterpriseName',
			title: '供应商名称'
		},
		{
			field: 'saleTaxTotal',
			title: '最终报价',
		},

		]
	});
};
//包件详情
function packageDetaileds(packageDatas) {
	var packageDetaileds = packageDatas.packageDetaileds;
	$("#packageDetailedsTable").bootstrapTable({
		data: packageDetaileds,
		clickToSelect: true,
		onClickRow: function (row) {
			var offerDetaileds = packageDatas.offerDetaileds; //询比采购报价详情
			var newofferDetaileds = new Array();
			for (x in offerDetaileds) {
				if (offerDetaileds[x].packageDetailedId == row.id)
					newofferDetaileds.push(offerDetaileds[x]);
			}
			$('#offerDetailedsTable').bootstrapTable('load', newofferDetaileds);
		},
		onCheck: function (row) {
			var offerDetaileds = packageDatas.offerDetaileds; //询比采购报价详情
			var newofferDetaileds = new Array();
			for (x in offerDetaileds) {
				if (offerDetaileds[x].packageDetailedId == row.id)
					newofferDetaileds.push(offerDetaileds[x]);
			}
			$('#offerDetailedsTable').bootstrapTable('load', newofferDetaileds);
		},
		columns: [{
			radio: true,
			formatter: function (value, row, index) {
				if (index == 0) {
					var offerDetaileds = packageDatas.offerDetaileds; //询比采购报价详情
					var newofferDetaileds = new Array();
					for (x in offerDetaileds) {
						if (offerDetaileds[x].packageDetailedId == row.id)
							newofferDetaileds.push(offerDetaileds[x]);
					}
					$('#offerDetailedsTable').bootstrapTable('load', newofferDetaileds);
					return true;
				} else {
					return false
				};
			}
		},
		{
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
			field: 'detailedName',
			title: '名称'
		}, {
			field: 'detailedVersion',
			title: '型号规格'
		}, {
			field: 'detailedCount',
			title: '数量'
		}, {
			field: 'detailedUnit',
			title: '单位'
		}
		]
	});
};