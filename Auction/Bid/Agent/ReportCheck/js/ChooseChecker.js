var option = JSON.parse(sessionStorage.getItem("option"));
$("#employeeId").html(option);


function btnSubmit(){
	return $("#employeeId").val();	
}
