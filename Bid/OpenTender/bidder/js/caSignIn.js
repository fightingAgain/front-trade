function caSignIn(){
	let	CAcf = new CA({
		confirmCA:function(flag, user){
			if(!flag){
				$('#handlerBtn').css('pointer-events', 'auto');
				return;
			}

			var params = {"bidSectionId": bidId,"examType":2,"signedData": user.signedData,"random":user.strsource};

			//执行签到
			if($.trim(user.signedData) != '') {
				$.ajax({
					type: "post",
					url: config.OpenBidHost + "/BidOpeningSignInController/addBidderCfCASignIn",
					async: false,
					data:params,
					dataType: "json",
					beforeSend: function(xhr) {
						xhr.setRequestHeader("Token", sessionStorage.getItem('token'));
					},
					success: function(rsp) {
						$('#handlerBtn').css('pointer-events', 'auto');
						if(rsp.success) {
							parent.layer.alert('温馨提示：'+rsp.data, {icon: 6});
						} else {
							parent.layer.alert('温馨提示：'+rsp.message, {icon: 6});
						}
					}
				});
			}
		}
	});

	CAcf.sign();
	
}