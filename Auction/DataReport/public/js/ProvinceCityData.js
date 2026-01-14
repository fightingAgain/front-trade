var ProvinceData;
function setProvinceKb(nothingSelectText) {
	var url = window.top.location.href.split('index')[0];
	url = url.split('view')[0];
	$.ajaxSettings.async = false;
	$.getJSON(url + 'media/js/base/prov-city.json', function(data) {
		ProvinceData = data;
		var option = "<option value=''>" + (nothingSelectText || "--请选择--") + "</option>";
		$("#ProvinceKb").append(option);
		for(var i = 0; i < ProvinceData.length; i++) {
			option = "<option value='" + ProvinceData[i].code + "' data-value='"+ ProvinceData[i].name +"'>" + ProvinceData[i].name + "</option>";
			$("#ProvinceKb").append(option);
		}
	});
}

$("#ProvinceKb").change(function() {
	$("#CityKb").empty();
	$("#Country").empty();
	var code = $(this).val();
	setCityKb(code);
	$("#provinceNameKb").val($(this).find("option:selected").attr("data-value"));
	$("#cityNameKb").val($("#City").find("option:selected").attr("data-value"));
});

$("#CityKb").change(function() {
	var code = $(this).val();
	setCountryKb($("#ProvinceKb").val(),code);
	$("#cityNameKb").val($(this).find("option:selected").attr("data-value"));
//	if($("#taxAddress").length > 0){
//		$("#taxAddress").val($("#Province option:selected").text() + $("#City option:selected").text());
//	}
});

function setCityKb(code) {
	$("#CityKb").empty();
	var option = "";
	$("#CityKb").append(option);
	for(var i = 0; i < ProvinceData.length; i++) {
		if(code == ProvinceData[i].code) {
			var cityData = ProvinceData[i].childs;
			for(var j = 0; j < cityData.length; j++) {
				option = "<option value='" + cityData[j].code + "' data-value='"+ cityData[j].name +"'>" + cityData[j].name + "</option>";
				$("#CityKb").append(option);
			}
			return;
		}
	}
}

function setCountryKb(Province, City) {
	var option = "<option value=''>--请选择--</option>";
	$("#Country").append(option);
	for(var i = 0; i < ProvinceData.length; i++) {
		if(Province == ProvinceData[i].code) {
			var cityData = ProvinceData[i].childs;
			for(var j = 0; j < cityData.length; j++) {
				if(City == cityData[j].code) {
					var CountryData = cityData[j].childs;
					for(var x = 0; x < CountryData.length; x++) {
						option = "<option value='" + CountryData[x].code + "'>" + CountryData[x].name + "</option>";
						$("#Country").append(option);
					}
				}
			}
			return;
		}
	}
}

function getProvinceAndCity(province, city, obj) {
	var strProvinceAndCity = "";
	var url = window.location.href.split('index')[0];
	url = url.split('view')[0];
	$.getJSON(url + 'media/js/base/prov-city.json', function(data) {
		for(var i = 0; i < data.length; i++) {
			if(data[i].code == province) {
				strProvinceAndCity = data[i].name;
				var cityData = data[i].childs;
				for(var j = 0; j < cityData.length; j++) {
					if(cityData[j].code == city) {
						strProvinceAndCity += "  " + cityData[j].name;
						$("#" + obj).html(strProvinceAndCity);
						break;
					}
				}
			}
		}
	});
}

function getProvinceAndCityAndCountry(province, city, Country) {
	var strProvinceAndCity = "";
	var url = window.location.href.split('index')[0];
	url = url.split('view')[0];
	$.ajaxSettings.async = false;
	$.getJSON(url + 'media/js/base/prov-city.json', function(data) {
		for(var i = 0; i < data.length; i++) {
			if(data[i].code == province) {
				strProvinceAndCity+=data[i].name;
				var cityData = data[i].childs;
				for(var j = 0; j < cityData.length; j++) {
					if(cityData[j].code == city) {
						strProvinceAndCity+="  "+cityData[j].name;
						var CountryData = cityData[j].childs;
						for(var x =0;x<CountryData.length;x++){
							if(CountryData[x].code == Country){
								strProvinceAndCity+="  "+CountryData[x].name;
							}
						}
						break;
					}
				}
			}
		}
	});
	return strProvinceAndCity;
}

// 根据code找到province和city  code
function getCodeKb(areaCode){
	var data = ProvinceData;
	for(var i = 0; i < data.length; i++) {
		if(data[i].code == areaCode){
			$("#ProvinceKb").val(data[i].code);
			setCityKb(data[i].code);
			return;
		}
		for(var j = 0; j < data[i].childs.length; j++){
			if(data[i].childs[j].code == areaCode){
				$("#ProvinceKb").val(data[i].code);
				setCityKb(data[i].code);
				$("#CityKb").val(data[i].childs[j].code);
				setCountryKb(data[i].code, data[i].childs[j].code);
				return;
			}
			for(var k = 0; k < data[i].childs[j].childs.length; k++){
				if(data[i].childs[j].childs[k].code == areaCode){
//					codeStr = data[i].code + "," + data[i].childs[j].code;
					$("#ProvinceKb").val(data[i].code);
					setCityKb(data[i].code);
					$("#CityKb").val(data[i].childs[j].code);
					setCountryKb(data[i].code, data[i].childs[j].code);
					$("#CountryKb").val(areaCode);
					return;
				}
			}
		}
	}
}
//根据code找到上级name
function getNameKb(areaCode){
	var strName="";
	var url = window.top.location.href.split('index')[0];
	url = url.split('view')[0];
	$.ajaxSettings.async = false;
	$.getJSON(url + 'media/js/base/prov-city.json', function(data) {
		
		for(var i = 0; i < data.length; i++) {
			if(data[i].code == areaCode){
				strName += data[i].name;
				return;
			}
			for(var j = 0; j < data[i].childs.length; j++){
				if(data[i].childs[j].code == areaCode){
					strName += data[i].name + "  " + data[i].childs[j].name;
					return;
				}
				for(var k = 0; k < data[i].childs[j].childs.length; k++){
					if(data[i].childs[j].childs[k].code == areaCode){
						strName += data[i].name + "  " + data[i].childs[j].name + data[i].childs[j].childs[k].name;
						return;
					}
				}
			}
		}
	});
	return strName;
}
