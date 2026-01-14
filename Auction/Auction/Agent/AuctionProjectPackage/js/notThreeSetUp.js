var urlViewAuctionInfo=top.config.AuctionHost + "/AuctionPackageConfigController/findByPackageId.do"
var projectId = getUrlParam("projectId");
var packageId = getUrlParam("id") ;
var offerCount=getUrlParam("offerCount") ;
var creType=getUrlParam("creType") ;
var checkStatus=getUrlParam("checkStatus") ;
var msgData;
function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象  
	var r = window.location.search.substr(1).match(reg); // 匹配目标参数  
	if(r != null) return unescape(r[2]);
	return null; // 返回参数值  
}
$(function(){
    
    $.ajax({
		url: urlViewAuctionInfo,
		type: "post",
		data: {
			packageId: packageId,
			projectId: projectId,
			tenderType: 1,
		},
		success: function(res) {
            if(res.success){
                msgData=res.data;
                if(msgData){
                    $('input[name="supplierCountConfig"][value="'+  (msgData.supplierCountConfig||0)+'"]').prop('checked',true);
                    // $("#auctionEndTime").val(msgData.auctionEndTime)  
                }  
            }
		}
    });
   
    $("#offerCount").html(offerCount);
    if(offerCount==0){
        $('.supplierCountConfig2').hide();
    }
    if($('input[name="supplierCountConfig"]').val()==0){
        $("#isauctionEndTime").show()
    }
    $('input[name="supplierCountConfig"]').on('change',function(){
        if($(this).val()==0){
            $("#isauctionEndTime").show();
        }else{
            $("#isauctionEndTime").hide();
        }
    })
    //竞价截止时间
	$('#auctionEndTime').datetimepicker({
		step: 5,
		lang: 'ch',
		format: 'Y-m-d H:i',
		onShow: function() {
			var nowSysDate=top.$("#systemTime").html()+" "+top.$("#sysTime").html();
			$('#auctionEndTime').datetimepicker({
				minDate: NewDateT(nowSysDate)
			})
		},
    });
    $("#btnClose").click(function() {
        var index = parent.layer.getFrameIndex(window.name);
        top.layer.close(index);
    });
    $("#btnSave").click(function() {
        if($('input[name="supplierCountConfig"]:checked').val()==0&&$('#auctionEndTime').val()==""){
            parent.layer.alert('请选择竞价截止时间')
            return;
        }
        var pare={
            'packageId': packageId,
            'projectId': projectId,
            'tenderType': 1,
            'supplierCountConfig':$('input[name="supplierCountConfig"]:checked').val()

        }
        if($('input[name="supplierCountConfig"]:checked').val()==0){
            pare.auctionEndTime=$("#auctionEndTime").val()
        }
        $.ajax({
            url: top.config.AuctionHost + "/AuctionPackageConfigController/insertPackageConfig.do",
            type: "post",
            data:pare,
            success: function(res) {
                if(res.success){
                    parent.$('#OfferList').bootstrapTable('refresh');
                    var index = parent.layer.getFrameIndex(window.name);
                    top.layer.close(index);
    
                }
            }
        });
    });
});
function NewDateT(str){  
    if(!str){  
      return 0;  
    }  
    arr=str.split(" ");  
    d=arr[0].split("-");  
    t=arr[1].split(":");
    var date = new Date(); 
   
    date.setUTCFullYear(d[0], d[1] - 1, d[2]);   
    date.setUTCHours(t[0]-8, t[1], t[2], 0);
    return date;  
}