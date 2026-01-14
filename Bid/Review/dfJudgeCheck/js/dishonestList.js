/* 政府失信名单 */
function dishonestList(node){
	var flag = true;
	$("#content").load('model/dishonestList.html');
	$('#btn-box').html('');
	return flag
}
$('#content').on('click','.nameListWebsite', function(){
	var surl = $(this).attr('data-url');
	window.open(surl, "_blank");
})
/* $('.nameListWebsite').click(function(){
	
}) */