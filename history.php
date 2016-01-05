<?php

include 'chat.class.php';

$action = $_POST['action'];

if (!(isset($action))){
	echo "Params are not setted";
	exit;
}

//test2
//	$mysqli = $mysqli = new mysqli("mysql.main-hosting.com", "u277145571_admin", "pass_word", "u277145571_db");
//	$mysqli = new mysqli($hostName, "root", "pass_word", "dev_schema");
// test xxx
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

		if (isset($_POST['historyPageIndex'])){
			$historyPageIndex = $_POST['historyPageIndex'];
			$history = $chat->getHistory($fromUser, $toUser, $historyPageIndex);
		}else{
			$history = $chat->getHistory($fromUser, $toUser);
		}


		echo json_encode($history);
		break;

	case "updateHistory":

		$history = $chat->updateHistory($fromUser, $toUser);
		echo json_encode($history);
		break;

	case "insertMessage":

	//	$jsonMsg = file_get_contents('php://input');
		$msg = $_POST['msg'];
		$chat->insertMessage($fromUser, $toUser, $msg);
		break;
}

