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

	/*$("#toUser").change(function(){
		doAction("getHistory");

		//setInterval(function(){doAction("updateHistory")}, 2000);
		doAction("updateHistory")

	});*/
	
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

	$('#history').scroll(function(){

		var $this = $(this);
		console.log($this.scrollTop());

		if ($this.scrollTop() == 0){
			//$($this.children()[0]).before('<div>test</div>');

			var pageIndex = ~~$this.attr('page-index');
			if (pageIndex != -1) {
				pageIndex += 1;
				var isLastPage = getHistory(pageIndex);
				if (isLastPage) {
					pageIndex = -1;
				}
				$this.attr('page-index', pageIndex);
			}

		}

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

function renderTemplate(tmplId, target, context, appendKind){
	var $tmpl = $('#' + tmplId);

	var template = Handlebars.compile($tmpl.html());
	var rendered = template(context);

	switch (appendKind){

		case 'before':

			var $target = $('#' + target);
			var firstChild = $target.children()[0];
			$(firstChild).before(rendered);

			$target.scrollTop($(firstChild).offset().top);

			break;

		case 'insert':

			$('#' + target).html(rendered);
			break;

		case 'append':

			$('#' + target).append(rendered);
			break;

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

	renderTemplate('tmpl_user_list', 'cont_user_list', context, 'insert');

	$('.user_item').click(function(){
	//	alert(this.getAttribute("id"));
		var $activeUser = $('.active_user');
		if ($activeUser.length > 0){
			$($activeUser[0]).removeClass('active_user');
		};

		$this = $(this);
		$this.addClass('active_user');
		$this.html($this.attr('user-name'));

		$('#history').attr('page-index', 0);

	//	this.classList.add('active_user');
		doAction("getHistory");
		setInterval(function(){doAction('updateHistory')}, 2000);
		//doAction("updateHistory");
	})

};


function sendMessage(){
	var $msgField = $("#msgField");
	var msgText = $msgField.val();
	
	var $fromUser = $("#fromUser option:selected");
//	var $toUser = $("#toUser option:selected");
	var $toUser = $($(".active_user")[0]);
	
	var fromUserId = $fromUser.attr('id');
	var toUserId = $toUser.attr('id');


	$.post('history.php',
			{action: 'insertMessage',
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
}

function appendMessagesToHistory(messages, fromUserId){

	messages.forEach(function(msg){
		msg.isOutcoming = (msg.from_user == fromUserId);
	});
	var context = {messages: messages};
	renderTemplate('tmpl_msg_history', 'history', context, 'append');

}

function updateIncomingMessagesCount(messagesCount){
	$('.user_item').each(function(){
		var $this = $(this);
		var userId = $this.attr('id');
		for(var i=0; i<messagesCount.length; i++){
			var item=messagesCount[i];
			if (userId == item.user_id){
				$this.html($this.attr('user-name') + ' (' + item.msgs_count + ')');
				break;
			}
		}
	});
}

//	временное решение
function getHistory(pageIndex){
	var result;
	var $fromUser = $("#fromUser option:selected");
//	var $toUser = $("#toUser option:selected");
	var $toUser = $($(".active_user")[0]);

	var fromUserId = $fromUser.attr("id");
	var toUserId = $toUser.attr("id");

	/*$.post('history.php',

		{action: 'getHistory',
			fromUser: fromUserId,
			toUser: toUserId,
			historyPageIndex: pageIndex},

		function(data){
			var history = JSON.parse(data);

			history.forEach(function(msg){
				msg.isOutcoming = (msg.from_user == fromUserId);
			});

			var context = {messages: history};
			renderTemplate('tmpl_msg_history', 'history', context, 'before');

		});*/
	$.ajax({
		type: 'POST',

		url: 'history.php',

		data: {action: 'getHistory',
			fromUser: fromUserId,
			toUser: toUserId,
			historyPageIndex: pageIndex},

		async: false,

		success: function(data) {
			var history = JSON.parse(data);

			history.forEach(function (msg) {
				msg.isOutcoming = (msg.from_user == fromUserId);
			});

			var context = {messages: history};
			renderTemplate('tmpl_msg_history', 'history', context, 'before');

			result = (history.length == 0);

		}

	});

	return result;

}

function doAction(action){
	var $fromUser = $("#fromUser option:selected");
//	var $toUser = $("#toUser option:selected");
	var $toUser = $($(".active_user")[0]);
	
	var fromUserId = $fromUser.attr('id');
	var toUserId = $toUser.attr('id');
	
	if (toUserId == -1){
		return;
	}
	
	$.post('history.php',
          
		{action: action,
		fromUser: fromUserId,
		toUser: toUserId},
          
		function(data){

			var histDiv = document.getElementById('history');
			var receivedData = JSON.parse(data);
			var history;

			switch (action) {

				case 'getHistory':

					history = receivedData;
					$('.msg-wrapper').remove();
					break;

				case 'updateHistory':

					history = receivedData.unreadMsgs;
					updateIncomingMessagesCount(receivedData.unreadMsgsCount);
					break;

			}

			if (history.length > 0){
				appendMessagesToHistory(history, fromUserId);
                histDiv.scrollTop = histDiv.scrollHeight;
            }
			
		}
	);
};
