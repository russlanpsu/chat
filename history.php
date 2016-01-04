<?php

include 'chat.class.php';

$action = $_POST['action'];

if (!(isset($action))){
	echo "Params are not setted";
	exit;
}

//	$mysqli = $mysqli = new mysqli("mysql.main-hosting.com", "u277145571_admin", "pass_word", "u277145571_db");
//	$mysqli = new mysqli($hostName, "root", "pass_word", "dev_schema");

$chat = new Chat();

if ($action == "getUsers"){
//	$users = getUsers();
	$users = $chat->getUsers();
	echo json_encode($users);
}else{

	$fromUser = $_POST['fromUser'];
	$toUser = $_POST['toUser'];

	if (!(isset($fromUser)
		and isset($toUser))) {

		echo "Params are not setted";
		exit;
	}
};

switch ($action){

	case "getHistory":

		$history = $chat->getHistory($fromUser, $toUser);
		echo json_encode($history);
		break;

	case "updateHistory":

		$history = $chat->updateHistory($fromUser);
		echo json_encode($history);
		break;

	case "insertMessage":

	//	$jsonMsg = file_get_contents('php://input');
		$msg = $_POST['msg'];
		$chat->insertMessage($fromUser, $toUser, $msg);
		break;
}

?>