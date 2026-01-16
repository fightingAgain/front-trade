/*




 */ 
function du(data) {
	publicData = data;

	$('div[id]').each(function() {
		$(this).html(publicData[this.id]);
	});
	$('div[id]').each(function() {
		$(this).html(publicData.enterprise[this.id]);
	});

	$('span[id]').each(function() {
		$(this).html(publicData.enterprise[this.id]);
	});
	if(publicData.isAccept == 0) {
		$("#isAcceptText").addClass("text-success")
		$("#isAcceptText").html("接受");
		$("#supplierName").html(publicData.enterprise.enterpriseName)
	} else if(publicData.isAccept == 1) {
		$("#isAcceptText").addClass("text-danger")
		$("#isAcceptText").html("拒绝");
		$("#supplierName").html(publicData.enterprise.enterpriseName)
	};
	if(publicData.enterprise.enterpriseLevel!=undefined){
		switch(publicData.enterprise.enterpriseLevel)
		{
		case 0:
		 $("#enterpriseLevelText").html("未认证")
		  break;
		case 1:
		$("#enterpriseLevelText").html("提交认证")
		  break;
		case 2:
		$("#enterpriseLevelText").html("受理认证")
		  break;
		case 3:
		$("#enterpriseLevelText").html("已认证")
		  break;
		case 4:
		$("#enterpriseLevelText").html("认证2")
		  break;
		
		};
	};
	var url = window.location.href.split('bidPrice')[0];
	$.getJSON(url + 'media/js/base/prov-city.json', function(data) {
		var provinceData = data;
		var regProvince = $("#regProvince").html();
		var regCity = $("#regCity").html();
		for(var i = 0; i < provinceData.length; i++) {
			if(regProvince == provinceData[i].code) {
				$("#regProvince").html(provinceData[i].name);
			}
			for(var j = 0; j < provinceData[i].childs.length; j++) {
				if(regCity == provinceData[i].childs[j].code) {
					$("#regCity").html(provinceData[i].childs[j].name);
				}
			}
		}
	});
}