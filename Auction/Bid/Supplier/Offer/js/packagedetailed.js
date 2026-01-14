
var data="";
function du(obj,num){
   data=JSON.parse(sessionStorage.getItem('detailItem'))
	//税前分项信息
	if(obj==0){
		var tabsd="";
		for(var i=0;i<data.length;i++){
			//如果没有税前分项信息则为输入框
			if(data[i].beforTaxPriceItem==undefined||data[i].beforTaxPriceItem==null||data[i].beforTaxPriceItem==""){
				tabsd+='<tr>'
				  +'<td>'+(i+1)+'</td>'
			      +'<td>'+ data[i].packageDetailedName +'</td>'
			      +'<td style="width:50%"><input  class="blur" id="blur'+ i+'"/></td>'			     
			      +'</tr>'
			}else{//如果有泽显示
				tabsd+='<tr>'
				 +'<td>'+(i+1)+'</td>'
			      +'<td>'+ data[i].packageDetailedName +'</td>'
			      +'<td style="width:50%"><input  class="blur" id="blur'+ i+'" value="'+ data[i].beforTaxPriceItem +'"/></td>'			     
			      +'</tr>'
			}
			
		};
		$("#tables").html(tabsd);
	}
	if(obj==1){
		var tabsd="";
		for(var i=0;i<data.length;i++){
			tabsd+='<tr>'
			      +'<td>'+(i+1)+'</td>'
			      +'<td>'+ data[i].packageDetailedName +'</td>'
			      +'<td style="width:50%">'+ data[i].afterTaxPriceItem +'</td>'			     
			      +'</tr>'
		};
		$("#tables").html(tabsd);
	}
	$('.blur').on('blur',function(){
		var $index=$(this).context.id.substring(4)
		data[$index].beforTaxPriceItem=$(this).val();
	    data[$index].afterTaxPriceItem=$(this).val()*num/100;	
	    console.log(data)
	})
}
function view(obj){
	var viewData=JSON.parse(sessionStorage.getItem('detailItem'));
	console.log(viewData)
	if(obj==0){
		var tabsd="";
		for(var i=0;i<viewData.length;i++){
			tabsd+='<tr>'
			      +'<td>'+(i+1)+'</td>'
			      +'<td>'+ viewData[i].packageDetailedItem.packageDetailedName +'</td>'
			      +'<td style="width:50%">'+ viewData[i].beforTaxPriceItem +'</td>'			     
			      +'</tr>'
		};
		$("#tables").html(tabsd);
	};
	if(obj==1){
		var tabsd="";
		for(var i=0;i<viewData.length;i++){
			tabsd+='<tr>'
			      +'<td>'+(i+1)+'</td>'
			      +'<td>'+ viewData[i].packageDetailedItem.packageDetailedName +'</td>'
			      +'<td style="width:50%">'+ viewData[i].afterTaxPriceItem +'</td>'			     
			      +'</tr>'
		};
		$("#tables").html(tabsd);
	}
}

