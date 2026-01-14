function Supplement(data) {

	var list = ""
	if(projectSupplements.length > 0) {
		list += '<tr>'
		list += '<td class="th_bg">公告开始时间</td>'
		list += '<td colspan="3" style="text-align: left;">'
		list += '<div id="noticeStartDate"></div>'
		list += '</td>'
		list += '</tr>'
		list += '<tr>'
		list += '<td class="th_bg">公告截止时间</td>'
		list += '<td  style="text-align: left;">'
		list += '<div id="noticeEndDate"></div>'
		list += '</td>'
		list += '<td class=" th_bg" >原始公告截止时间</td>'
		list += '<td style="text-align: left;">'
		list += '<div id="oldNoticeEndDate"></div>'
		list += '</td>'
		list += '</tr>'
		list += '<tr>'
		list += '<td class="th_bg">提出澄清截止时间</td>'
		list += '<td style="text-align: left;">'
		list += '<div id="askEndDate"></div>'
		list += '</td>'
		list += '<td class="th_bg">原始提出澄清截止时间</td>'
		list += '<td  style="text-align: left;">'
		list += '<div id="oldAskEndDate"></div>'
		list += '</td>'
		list += '</tr>'
		list += '<tr>'
		list += '<td class="th_bg">答复截止时间</td>'
		list += '<td style="text-align: left;">'
		list += '<div id="answersEndDate"></div>'
		list += '</td>'
		list += '<td class="th_bg">原始答复截止时间</td>'
		list += '<td style="text-align: left;">'
		list += '<div id="oldAnswersEndDate"></div>'
		list += '</td>'
		list += '</tr>'
		//	     	list+='<tr>'
		//	     		list+='<td class="th_bg">竞价开始时间</td>'
		//	     		list+='<td class="" style="text-align: left;">'
		//	     			list+='<div id="auctionStartDate"></div>'
		//	     		list+='</td>' 
		//	     		list+='<td class="oldTime th_bg" >原始竞价开始时间</td>'
		//	     		list+='<td class="oldTime" style="text-align: left;">'
		//	     			list+='<div id="oldAuctionStartDate"></div>'
		//	     		list+='</td>'
		//	     	list+='</tr>'

		if(data == 6 || data == 7) {
			list += '<tr>'
			list += '<td class="th_bg">竞价开始时间</td>'
			list += '<td class="" style="text-align: left;">'
			list += '<div id="auctionStartDate"></div>'
			list += '</td>'
			list += '<td class="oldTime th_bg" >原始竞价开始时间</td>'
			list += '<td class="oldTime" style="text-align: left;">'
			list += '<div id="oldAuctionStartDate"></div>'
			list += '</td>'
			list += '</tr>'
			list += '<tr>'
			list += '<td class="th_bg">竞价截止时间</td>'
			list += '<td  style="text-align: left;">'
			list += ' <div id="auctionEndDate"></div>'
			list += '</td>'
			list += '<td class="th_bg">原竞价截止时间</td>'
			list += '<td  style="text-align: left;">'
			list += '<div id="oldAuctionEndDate"></div>'
			list += '</td>'
			list += '</tr>'
		} else {
			list += '<tr>'
			list += '<td class="th_bg">竞价开始时间</td>'
			list += '<td class="" style="text-align: left;">'
			list += '<div id="auctionStartDate"></div>'
			list += '</td>'
			list += '<td class="oldTime th_bg" >原始竞价开始时间</td>'
			list += '<td class="oldTime" style="text-align: left;">'
			list += '<div id="oldAuctionStartDate"></div>'
			list += '</td>'
			list += '</tr>'
		}

		list += '<tr>'
		list += '<td class="th_bg">是否竞价文件递交</td>'
		list += '<td style="text-align: left;">'
		list += '<div id="isFileText"></div>'
		list += '</td>'
		if(purchaseaData.isFile == 0) {
			if(purchaseaData.project[0].manual==1) {
				if(purchaseaData.supplierCount) {
					list += '<td class="th_bg">	最少供应商数量</td>'
					list += '<td colspan="3" style="text-align: left;">'
					list += '<div id="supplierCount"></div>'
					list += '</td>'
				}
			}

		}
		list += '</tr>'
		if(purchaseaData.isFile == 0) {
			list += '<tr class="isFileDate">'
			list += '<td class="th_bg">竞价文件递交截止时间</td>'
			list += '<td class="newTime" style="text-align: left;">'
			list += '<div id="fileEndDate" style="display: inline-block;"></div><div style="padding: 5px" class="red">（即竞价文件审核开始时间）</div>'
			list += '</td>'
			list += '<td class="oldTime th_bg" >原始竞价文件递交截止时间</td>'
			list += '<td class="oldTime" colspan="2" style="text-align: left;">'
			list += '<div id="oldFileEndDate"></div>	 '
			list += '</td>'
			list += '</tr>'
			list += '<tr class="isFileDate">'
			list += '<td class="th_bg">竞价文件审核截止时间</td>'
			list += '<td class="newTime" style="text-align: left;">'
			list += '<div id="fileCheckEndDate"></div><div style="padding: 5px" class="red">（竞价文件递交截止时间后才能开始审核，请预留足够的审核时间）</div>'
			list += '</td>'
			list += '<td class="oldTime th_bg" >原始竞价文件审核截止时间</td>'
			list += '<td class="oldTime" colspan="2" style="text-align: left;">'
			list += '<div id="oldFileCheckEndDate"></div>'
			list += '</td>'
			list += '</tr>'
		}

	} else {
		list += '<tr>'
		list += '<td class="th_bg">公告开始时间</td>'
		list += '<td style="text-align: left;">'
		list += '<div id="noticeStartDate"></div>'
		list += '</td>'
		list += '<td class="th_bg">公告截止时间</td>'
		list += '<td  style="text-align: left;">'
		list += '<div id="noticeEndDate"></div>'
		list += '</td>'
		list += '</tr>'
		list += '<tr>'
		list += '<td class="th_bg">提出澄清截止时间</td>'
		list += '<td style="text-align: left;">'
		list += '<div id="askEndDate"></div>'
		list += '</td>'
		list += '<td class="th_bg">答复截止时间</td>'
		list += '<td style="text-align: left;">'
		list += '<div id="answersEndDate"></div>'
		list += '</td>'
		list += '</tr>'
		if(data == 6 || data == 7) {
			list += '<tr>'
			list += '<td class="th_bg">竞价开始时间</td>'
			list += '<td  style="text-align: left;">'
			list += '<div id="auctionStartDate"></div>'
			list += '</td>'
			list += '<td class="th_bg">竞价截止时间</td>'
			list += '<td  style="text-align: left;">'
			list += '<div id="auctionEndDate"></div>'
			list += '</td>'
			list += '</tr>'
		} else {
			list += '<tr>'
			list += '<td class="th_bg">竞价开始时间</td>'
			list += '<td colspan="3" style="text-align: left;">'
			list += '<div id="auctionStartDate"></div>'
			list += '</td>'
			list += '</tr>'
		}

		//	     	list+='<tr>'
		//	     		list+='<td class="th_bg">竞价开始时间</td>'
		//	     		list+='<td colspan="3" style="text-align: left;">'
		//	     			list+='<div id="auctionStartDate"></div>'
		//	     		list+='</td>' 	     	
		//	     	list+='</tr>'
		list += '<tr>'
		list += '<td class="th_bg">是否竞价文件递交</td>'
		list += '<td style="text-align: left;">'
		list += '<div id="isFileText"></div>'
		list += '</td>'
		if(purchaseaData.isFile == 0) {
			if(purchaseaData.project[0].manual==1) {
				if(purchaseaData.supplierCount) {
					list += '<td class="th_bg">	最少供应商数量</td>'
					list += '<td colspan="3" style="text-align: left;">'
					list += '<div id="supplierCount"></div>'
					list += '</td>'
				}
			}
		}
		list += '</tr>'
		if(purchaseaData.isFile == 0) {
			list += '<tr class="isFileDate">'
			list += '<td class="th_bg">竞价文件递交截止时间</td>'
			list += '<td class="newTime" style="text-align: left;">'
			list += '<div id="fileEndDate" style="display: inline-block;"></div><div style="padding: 5px" class="red">（即竞价文件审核开始时间）</div>'
			list += '</td>'
			list += '<td class="th_bg">竞价文件审核截止时间</td>'
			list += '<td class="newTime" style="text-align: left;">'
			list += '<div id="fileCheckEndDate"></div><div style="padding: 5px" class="red">（竞价文件递交截止时间后才能开始审核，请预留足够的审核时间）</div>'
			list += '</td>'
			list += '</tr>'
		}
	}
	$("#timeTbody").html(list);
	if(projectSupplements.length > 0) {
		$('div[id]').each(function() {
			$(this).html(projectSupplements[0][this.id]);
			if(reg.test(projectSupplements[0][this.id])) {
				$(this).html(projectSupplements[0][this.id].substring(0, 16));
			}
		});
	}
}