var flieListUrl=config.bidhost+'/PurFileController/list.do';//查看附件接口
var searchUrlFile = config.bidhost + '/PurFileController/list.do'; //采购文件分页
var Detailedlist=config.bidhost +'/PackageDetailedController/list.do'//明细查看
var BidFileDownloadUrl='0502/Bid/Purchase/model/view_DownloadReport.html'//添加下载记录页面
var findPurchaseUrl=config.bidhost + '/ProjectReviewController/findProjectInfo.do'//根据项目ID获取所有项目信息内容
var examType='1'//资格审查的缓存
var tenderTypeCode='0'//资格审查的缓存
var packageInfo=""//包件信息
var edittype="edittype";
var checkMsgType = "";
var packageCheckListInfo=[]//评审项信息
var supplierType="1"
var packageDetailInfo=[]//明细信息

var businessPriceSetData=""//自定义信息

var checkListItem=[]//评价项信息

//var DetailedItemData=""//分项信息

var checkPlana=""
var publicData=[];//邀请供应商数据列表
var projectSupplementList=[];
//该条数据的项目id
var projectDataID="";
 
var projectData=[];
 //初始化
//获取询比公告发布的数据
var userName,userId,purchaserNames;
var isAccepts="";
function Purchase(uid){	
	projectDataID=uid
	$.ajax({
		url: findPurchaseUrl+'?t='+ new Date().getTime(), //生成一个随机参数。以防止浏览器不发送请求，直接从缓存中读取之前的数据
		type: 'get',
		async:false,
		dataType: 'json',
		data: {
			'projectId':projectDataID,
			
		},
		success: function(data) {			
			projectData=data.data;			
			PurchaseData();			
			if(projectData.projectState==2){
				$(".projectSource0").show()
				$('input[type="text"]').attr('disabled',true)
				$('select').attr('disabled',true)
				$('.btn').attr('disabled',false)
				$("#chosePucharse").hide()
			}else{
				$(".projectSource0").hide()
				$('input[type="text"]').attr('disabled',false)
				$('select').attr('disabled',false)
				$("#chosePucharse").show()
			}
			console.log(projectData.examType)
			if(projectData.examType==1){
				$(".showExam1").show();
			}else{
				$(".showExam1").hide();
			}
		}
	});		   						
};

function PurchaseData(){
	 //渲染公告的数据
	    $('div[id]').each(function(){
			$(this).html(projectData[this.id]);
		});
        if(projectData.projectType==0){
        	$('.engineering').show()
        }else{
        	$('.engineering').hide()
        }
        if(projectData.isAgent==0){
        	$('.isAgent1').hide()
        }else{
        	$('.isAgent1').show()
        }
}