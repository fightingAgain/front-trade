/***************************************  评审的配置   *******************************/
var isTabNewReview = true;   //是否切换到新的评标流程
var managerPrice = false;//项目经理价格修正
var managerSum = false;//项目经理汇总
var managerReport = false;//项目经理提交评标报告

var judgePrice = true;//评委价格修正
var judgeSum = true;//评委汇总
var judgeReport = true;//评委汇总评标报告

/*是否公共资源
 * 襄阳公共资源内项目评标报告正文评委组长可编辑，非公共资源内项目评委组长和项目经理均可编辑
 * 
 */
if(!window.isPublicProject){
	managerReport = true;
	judgeReport = false;
}
/*if(marketType == 'DF'){
	managerSum = true;
	judgeSum = false;
}else{
	managerSum = false;
	judgeSum = true;
}*/