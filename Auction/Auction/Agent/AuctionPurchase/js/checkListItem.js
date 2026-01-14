function du(data){
	//把之前的值渲染到页面上
	$('#detailedName').val(data.detailedName);//名称
	$('#packageId').val(data.packageId);//包件Id
	$('#detailedId').val(data.id);//ID
	$("#brand").val(data.brand)
	$('#detailedVersion').val(data.detailedVersion);//型号规格
	$('#detailedCount').val(data.detailedCount);//数量
	$('#detailedUnit').val(data.detailedUnit);//单位
	$("#budget").val(data.budget)
	$('#detailedContent').val(data.detailedContent);//备注
};
function passMessage(callback){
	$("#btn_close").on("click", function () {
		parent.layer.close(parent.layer.getFrameIndex(window.name));
	});
	$('#btn_submit').click(function(){
		callback();
	});
}
