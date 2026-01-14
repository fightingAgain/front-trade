var getUrl=config.AuctionHost + '/AppraisalFeeController/findAppraisalFeeMsg.do';
var saveUrl=config.AuctionHost + '/AppraisalFeeController/editAppraisalFee.do';
var id="";//主键id
var packageId;
var appraisalCheckers=new Array();//评审费数组
var appraisalPackageContacts=new Array();//关联包件数组
var examType;
var applyCount;
var zongType='VIEW';
var approval=null;
$(function(){
    if ($.getUrlParam("id") && $.getUrlParam("id") != "undefined") {
        id = $.getUrlParam("id");
        getDetail();
        // 审核
        
        // 评审费
        bidsectionTable();
        //附件
        fileTable();
        //关联包件
        relevanceTable();       
    }
    if($.getUrlParam("type")=='VIEW'){
        $("#btnPass").hide();
        $("#btnNoPass").hide();
        if(!approval){
            approval=$("#approval").ApprovalProcess({
                businessId: id,
                status: 3,     
            });
        }
    }else{
        if(!approval){
            approval=$("#approval").ApprovalProcess({
                businessId: id,
                status: 2,  
                tableName:'#table'   
            });
        }
    }
     //关闭当前窗口
     $("#btnClose").click(function () {
        var index = parent.layer.getFrameIndex(window.name);
        parent.layer.close(index);
    });  
})
 //审核通过
 $("#btnPass").click(function () {
    parent.layer.confirm('温馨提示：确定审核通过？', {
        btn: ['是', '否'] //可以无限个按钮
    }, function(indexs, layero) {
        approval.updateWorkFlow(0)
        parent.layer.close(indexs);
    }, function(indexs) {
        parent.layer.close(indexs)
    });
}); 
//审核不通过
$("#btnNoPass").click(function () {
    parent.layer.confirm('温馨提示：确定审核不通过？', {
        btn: ['是', '否'] //可以无限个按钮
    }, function(indexs, layero) {
        approval.updateWorkFlow(1)
        parent.layer.close(indexs);
    }, function(indexs) {
        parent.layer.close(indexs)
    });
    
});

function getDetail() {
    $.ajax({
        url: getUrl,
        type: "post",
        async: false,
        data: {
            id: id
        },
        success: function (data) {
            if (data.success == false) {
                parent.layer.alert(data.message);
                return;
            }
            var arr = data.data;   
            appraisalCheckers=arr.appraisalCheckers;     
            var packageAppraisalInfo=arr.packageAppraisalInfo;
            AccessoryList=arr.appraisalFeeFiles;
            appraisalPackageContacts=arr.appraisalPackageContacts
            for(key in arr){
                if(key=="applyCount"){
                    $("#"+key).html('本项目'+arr[key]+'次提交申请')
                }else if(key == "feeUnderparty") {
                    if(arr[key]==0){
                        $("#"+key).html('中（选）标单位'); 
                    }else{
                        $("#"+key).html('东风咨询');
                    }
                } else {
                   
                    $("#"+key).html(arr[key]);
                }
            }; 
            for (key in packageAppraisalInfo) {
                $("#"+key).html(packageAppraisalInfo[key])   
            }
            for(var i = 0; i < AccessoryList.length; i++){
                if(AccessoryList[i].fileType==1||AccessoryList[i].fileType==2){
                    item = AccessoryList[i];
                    var html = fileHtml(item);
                    $("#saveFile" + item.fileType).closest("td").append(html);                 
                }   
            }
            examType=arr.examType;
            packageId=packageAppraisalInfo.packageId;
            applyCount=arr.applyCount;
            $("#examType").html(arr.examType==0?'资格预审':'资格后审')            
        },
        error: function (data) {
            parent.layer.alert("加载失败");
        }
    });
};
//标段列表
function bidsectionTable() {
    $('#bidsectionTable').bootstrapTable({
        columns: [{
            field: 'xh',
            title: '序号',
            align: 'center',
            width: '50px',
            formatter: function (value, row, index) {
                return index + 1; //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
            }
        }, {
            field: 'checkerAccess',
            title: '获取方式',
            align: 'center',
            width: '80px',
            formatter: function (value, row, index) {
                // 获取方式 0自动抽取 1手动添加
                var title='<input type="hidden" value="'+ (value||"") +'" id="checkerAccess'+ index +'" name="appraisalCheckers['+ index +'].checkerAccess">'
                if(value==0){
                    return title+'自动抽取'
                }else{
                    return title+'手动添加'
                }
            }
        },{
            field: 'checkerName',
            title: '姓名',
            align: 'left',
            width: '100px',
            
        },{
            field: 'checkerIdentityCardNum',
            title: '证件号码',
            align: 'left',
            width: '180px',
            
        },{
            field: 'checkerClassify',
            title: '人员分类',
            align: 'left',
            width: '100px',          
            formatter: function (value, row, index) {
                return value==0?'评委':'工作人员'
            }
        },{
            field: 'checkerTel',
            title: '手机号',
            align: 'left',
            width: '130px',
           
        },{
            field: 'appraisalFee',
            title: '评审费',
            align: 'left',
            width: '100px',   
        },{
            field: 'payeeName',
            title: '收款人姓名',
            align: 'left',
            width: '100px',
            
        },{
            field: 'payeeIdentityCardNum',
            title: '收款人证件号码',
            align: 'left',
            width: '185px',
           
        },{
            field: 'payeeTel',
            title: '收款人手机号',
            align: 'left',
            width: '130px',
            
        },{
            field: 'payeeBankAccount',
            title: '收款人银行卡号',
            align: 'left',
            width: '190px',
           
        },{
            field: 'payeeBankName',
            title: '收款人银行',
            align: 'left',
            width: '240px',            
        },{
            field: 'payState',
            title: '支付状态',
            align: 'left',
            width: '100px',
            formatter: function (value, row, index) {
                var title= '<input type="hidden" autocomplete="off" value="'+ (value||"") +'" id="payState'+ index +'" name="appraisalCheckers['+ index +'].payState" class="form-control">'
                if(row.isPay==1){
                    return '不支付';
                }else{
                    if(value==0){
                        return '未支付'+title;
                    }
                    if(value==3){
                        return '已支付'+title;
                    }
                    if(value==6){
                        return '支付失败'+title;
                    }else{
                        return '未支付';
                    }
                } 
               
            }
        },{
            field: 'failureReason',
            title: '支付失败原因',
            align: 'left',
            width: '100px',
            formatter: function (value, row, index) {
                // var title= '<input  autocomplete="off" value="'+ (value||"") +'" id="failureReason'+ index +'" name="appraisalCheckers['+ index +'].failureReason" class="form-control">'   
                return  value||"";       
            }
        },{
            field: 'editReason',
            title: '修改原因',
            align: 'left',
            width: '100px',
           
        }],
    })
    $('#bidsectionTable').bootstrapTable('load', appraisalCheckers);

}
