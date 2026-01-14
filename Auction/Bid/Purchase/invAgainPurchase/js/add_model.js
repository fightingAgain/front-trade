var uid="";
var gid="";;
var projecturl='Auction/common/Purchase2/model/add_project.html';
var findProjectPackage=config.bidhost+'/PurchaseController/findProjectPackage.do';
function selet(){
	var width=top.$(parent).width()*0.8
	var height=top.$(parent).height()*0.8	
	parent.layer.open({
        type: 2 //此处以iframe举例
        ,title: '添加项目'
        ,area: [width+'px', height+'px']
        ,content:projecturl
        ,btn: ['确定','取消'] 
        //确定按钮
        ,yes: function(index,layero){           
         var iframeWin=layero.find('iframe')[0].contentWindow;
        
         uid=iframeWin.checkboxed.id
         gid=iframeWin.checkboxed.projectId       
         $("#projectName").html(iframeWin.checkboxed.project.projectName);
         $("#projectCode").html(iframeWin.checkboxed.project.projectCode);
         $("#purchaserName").html(iframeWin.checkboxed.purchaserName);
         $("#purchaserAddress").html(iframeWin.checkboxed.purchaserAddress);
         $("#purchaserLinkmen").html(iframeWin.checkboxed.purchaserLinkmen);
         $("#purchaserTel").html(iframeWin.checkboxed.purchaserTel);
         $.ajax({
		   	url:findProjectPackage,
			   	type:'get',
			   	dataType:'json',
			   	//contentType:'application/json;charset=UTF-8',
			   	data:{
			   		"projectId":iframeWin.checkboxed.projectId,
			   		
			   	},
			   	success:function(data){ 			   		
			   		var Tdr=""
			   		if(data.rows.length>0){
			   			
			   			 for(var i=0;i<data.rows.length;i++){ 
			   			  Tdr+='<tr>'
			   			    +'<td>'+(i+1)+'</td>'
				     		+'<td style="text-align: left;">'+data.rows[i].packageName+'</td>'
				     		+'<td style="text-align: left;">'+data.rows[i].packageNum+'</td>'
				     		+'<td><input type="checkbox" name="package" value="'+ data.rows[i].id +'"/></td>'	     		
				     	    +'</tr>'
			   			 }
			   			 
			   		}else{
			   			Tdr+='<tr><td colspan=3>暂无数据</td></tr>'
			   		}
			   		 $("#tablebjb").html(Tdr) 
			   	}	
			  }); 
         parent.layer.close(index);
        },
        btn2:function(){
        	
        } 
      });
}
var check_val = [];
var dase=""
function du(){	
   var obj = document.getElementsByName("package");
    for(k in obj){
        if(obj[k].checked)
            check_val.push(obj[k].value);
    }
    dase=check_val.join(",")
}

