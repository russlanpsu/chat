$(function(){	
	
	var users;
	
	$.post("history.php",
		{action: "getUsers"},
		function(data){		
						
			users = JSON.parse(data);
			CreateUsersList_old("fromUser", users);
			
		});			
	
	$("#dialog").dialog({
		modal:true,		
		buttons:{
			"OK":function(){
												
				var $fromUser = $("#fromUser option:selected");
				
				var fromUserId = $fromUser.attr("id");
				CreateUsersList(users, fromUserId);

				var fromUserName = $fromUser.text()
				$("#userName").html(fromUserName);
				$(this).dialog("close");
			}
		}
	});		

	$("#toUser").change(function(){
		doAction("getHistory");
		setInterval(function(){doAction("updateHistory")}, 2000);
	});
	
	$("#btnSend").click(function(){
		sendMessage();
	});
	
	$("#msgField").keypress(function(event){		
		if (event.which == 13){
			sendMessage();			
			event.preventDefault();
		};		
	});
	
	$('#msgField').bind('input propertychange', function() {
		$("#status").html("");
	});

});

function CreateUsersList_old(targetListId, users, excludedUserId){
	
	if (excludedUserId === undefined){
		excludedUserId = -1;
	};
	
	var fromUserList = document.getElementById(targetListId);			
    for(var i=0; i<users.length; i++){
        var user = users[i];
        if (user.id != excludedUserId){
            var optionItem = document.createElement("option");
            optionItem.id = user.id;
            optionItem.innerHTML = user.name;
            fromUserList.appendChild(optionItem);
        }
    }
};

function renderTemplate(tmplId, target, context, append){
	var $tmpl = $('#' + tmplId);

	var template = Handlebars.compile($tmpl.html());
	var rendered = template(context);

	if (append === undefined){
		$('#' + target).html(rendered);
	}else if (append === true){
		$('#' + target).append(rendered);
	}


}

function CreateUsersList(users, excludedUserId){

	if (excludedUserId === undefined){
		excludedUserId = -1;
	};

	/*var userList = document.getElementById(parent);
	for(var i=0; i<users.length; i++){
		var user = users[i];
		if (user.id != excludedUserId){
			var liItem = document.createElement("li");
			liItem.classList.add("user_item")
			liItem.id = user.id;
			liItem.innerHTML = user.name;

			userList.appendChild(liItem);
		}
	}*/
	for (var i=0; i<users.length; i++){
		if (excludedUserId == users[i].id){
			users.splice(i, 1);
			break;
		}
	}

	var context = {users: users};

	renderTemplate('tmpl_user_list', 'cont_user_list', context);

	$('.user_item').click(function(){
	//	alert(this.getAttribute("id"));
		var $activeUser = $('.active_user');
		if ($activeUser.length > 0){
			$($activeUser[0]).removeClass('active_user');
		};

		$(this).addClass('active_user');
	//	this.classList.add('active_user');
		doAction("getHistory");
		setInterval(function(){doAction("updateHistory")}, 2000);
	})

};


function sendMessage(){
	var $msgField = $("#msgField");
	var msgText = $msgField.val();
	
	var $fromUser = $("#fromUser option:selected");
//	var $toUser = $("#toUser option:selected");
	var $toUser = $($(".active_user")[0]);
	
	var fromUserId = $fromUser.attr("id");
	var toUserId = $toUser.attr("id");
	
	//$.ajax({
	//	//url: 'chat.php',
	//	url: 'history.php',
	//	type: 'POST',
	///*	data: JSON.stringify({action: "insertMessage",
	//						fromUser: fromUserId,
	//						toUser: toUserId,
	//						msg: msgText}),
	//	contentType: 'application/json; charset=utf-8',*/
	//	data: {	action: "insertMessage",
	//			fromUser: fromUserId,
	//			toUser: toUserId,
	//			msg: msgText},
	//	dataType: 'json',
	//	async: true,
	//	success: function(){
	//
     //       var histDiv = document.getElementById("history");
     //       var msg = {	from_user: fromUserId,
     //              		msg_text: msgText,
	//					create_date: new Date().toLocaleTimeString(),
	//					isOutcoming: true
	//					};
    //
	//		var messages = [msg];
     //       //appendMessageToHistory_old(histDiv, fromUserId, msg);
	//		appendMessagesToHistory(messages, fromUserId);
    //
     //       histDiv.scrollTop = histDiv.scrollHeight;
	//		$("#status").text("Сообщение отправлено");
     //       $msgField.val("");
     //
	//	},
	//	error: function(){
	//		alert("error");
	//	}
	//});


	$.post('history.php',
			{action: "insertMessage",
				fromUser: fromUserId,
				toUser: toUserId,
				msg: msgText},


			function(){

				var histDiv = document.getElementById("history");
				var msg = {	from_user: fromUserId,
						msg_text: msgText,
						create_date: new Date().toLocaleTimeString(),
						isOutcoming: true
						};

				var messages = [msg];
				//appendMessageToHistory_old(histDiv, fromUserId, msg);
				appendMessagesToHistory(messages, fromUserId);

				histDiv.scrollTop = histDiv.scrollHeight;
				$("#status").text("Сообщение отправлено");
				$msgField.val("");

			}
	)
};		


/* переделать на шаблоны */
function appendMessageToHistory_old(parent, fromUserId, histItem){

	var dtSpan = document.createElement("span");
	dtSpan.classList.add("date-caption");
	dtSpan.innerHTML = histItem.create_date;

	var divWrapper = document.createElement("div");

	divWrapper.classList.add("msg-wrapper");
	var histElement = document.createElement("div");
	histElement.classList.add("msg-text");
	if (histItem.from_user == fromUserId){

		divWrapper.classList.add("right");
		divWrapper.appendChild(dtSpan);
		histElement.classList.add("msg-text");
		histElement.classList.add("out_msg");

		divWrapper.appendChild(histElement);
	}else{
		divWrapper.classList.add("left");
		histElement.classList.add("msg-text");
		histElement.classList.add("in_msg");
		divWrapper.appendChild(histElement);
		divWrapper.appendChild(dtSpan);
	};

    histElement.innerHTML = histItem.msg_text;
    parent.appendChild(divWrapper);
}

function appendMessagesToHistory(messages, fromUserId){

	messages.forEach(function(msg){
		msg.isOutcoming = (msg.from_user == fromUserId);
	});
	var context = {messages: messages};
	renderTemplate('tmpl_msg_history', 'history', context, true);

}

function doAction(action){
	var $fromUser = $("#fromUser option:selected");
//	var $toUser = $("#toUser option:selected");
	var $toUser = $($(".active_user")[0]);
	
	var fromUserId = $fromUser.attr("id");
	var toUserId = $toUser.attr("id");
	
	if (toUserId == -1){
		return;
	}
	
	var fromUserName = $fromUser.text();
	var toUserName = $toUser.text();
	
	$.post("history.php",
          
		{action: action,
		fromUser: fromUserId,
		toUser: toUserId},
          
		function(data){		

			if (action == 'getHistory'){
				$('.msg-wrapper').remove();

			}
			var histDiv = document.getElementById("history");
            var history = JSON.parse(data);
          /*
			 for (var i=0; i<history.length; i++){
			 var histItem = history[i];
			 appendMessageToHistory(histDiv, fromUserId, histItem);
			 }*/
			if (history.length > 0){
				appendMessagesToHistory(history, fromUserId);
                histDiv.scrollTop = histDiv.scrollHeight;
            }
			
		}
	);
};
