/*


 * @Description: In User Settings Edit
 * @Description: 打印功能
 * @FilePath: \FrameWork\bidPrice\currencyControl\js\Printing.js
 */ 
//打印
function previewBtn(oper,isPortrait){
	if (oper < 10){
    try{
        print.portrait   =  isPortrait    ;//横向打印 
    }catch(e){
        //alert("不支持此方法");
    }
	bdhtml=window.document.body.innerHTML;//获取当前页的html代码
	sprnstr="<!--startprint"+oper+"-->";//设置打印开始区域
	eprnstr="<!--endprint"+oper+"-->";//设置打印结束区域
	prnhtml=bdhtml.substring(bdhtml.indexOf(sprnstr)); //从开始代码向后取html
	prnhtml=prnhtml.substring(0,prnhtml.indexOf(eprnstr));//从结束代码向前取html
	window.document.body.innerHTML=prnhtml;
	window.print();
	window.document.body.innerHTML=bdhtml;
	} else {
	window.print();
	}
}
//关闭
function closeWin(){
	var index = parent.layer.getFrameIndex(window.name);
	top.layer.close(index);
}