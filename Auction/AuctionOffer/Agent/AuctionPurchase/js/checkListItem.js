function du(data){
	//把之前的值渲染到页面上
	$('#name').val(data.name);//名称	
	$("#brand").val(data.brand)
	$('#version').val(data.version);//型号规格
	$('#count').val(data.count);//数量
	$('#unit').val(data.unit);//单位
	$("#budget").val(data.budget)
	$('#content').val(data.content);//备注
}
// name	是	string	材料设备名称
// brand	否	string	品牌
// version	否	string	型号规格
// count	是	string	数量
// unit	否	string	单位
// budget	否	string	采购预算(元)
// content	否	string	备注
function save(){
	return {
		'name':$('#name').val(),//名称	
		'brand':$("#brand").val(),
		'version':$('#version').val(),//型号规格
		'count':$('#count').val(),//数量
		'unit':$('#unit').val(),//单位
		'budget':$("#budget").val(),
		'content':$('#content').val(),//备注
	}
}