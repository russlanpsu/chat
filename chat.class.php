<?php

/**
 * Created by PhpStorm.
 * User: Руслан
 * Date: 04.01.2016
 * Time: 0:23
 */

define('HISTORY_PAGE_SIZE', 10);
class Chat
{


    private $mysqli;

    public function __construct(){

        include 'settings.php';
        $this->mysqli = new mysqli($hostName, $userName, $password, $dbName);

    }

    function __destruct() {
        $this->mysqli->close();
    }

    public function setMessageRead($curUser, $companion){

        $sql = "UPDATE messages
				SET is_readed = 1
				WHERE from_user = {$companion}
				    AND to_user = {$curUser}
					AND is_readed = 0";
        $this->mysqli->query($sql);
    }

    public function getHistory($curUser, $companion, $page = 0){

        $startRow = HISTORY_PAGE_SIZE*$page;

        $sql = "SELECT * FROM
					(SELECT msg_text,
						from_user,
						to_user,
						create_date
					FROM messages
					  WHERE from_user IN ({$curUser}, {$companion})
						 AND to_user IN ({$curUser}, {$companion})
					 ORDER BY create_date DESC
					 LIMIT {$startRow} ," . HISTORY_PAGE_SIZE .
					")T
				ORDER BY create_date ASC";
        $result = $this->mysqli->query($sql);

        $history = array();
        while ($row = mysqli_fetch_assoc($result)) {
            $history[] = $row;
        }

        $this->setMessageRead($curUser, $companion);

        return $history;
    }

    public function getUnreadMessages($curUser, $companion){

        $sql = "SELECT msg_text,
					from_user,
					to_user,
					create_date
				FROM messages
				WHERE from_user = {$companion}
				    AND to_user = {$curUser}
					AND is_readed = 0";

        $result = $this->mysqli->query($sql);
        $history = array();
        while ($row = mysqli_fetch_assoc($result)) {
            $history[] = $row;
        }

        $this->setMessageRead($curUser, $companion);
        return $history;

    }

    public function updateHistory($curUser, $companion){
        $unreadMessages = $this->getUnreadMessages($curUser, $companion);
        $unreadMessagesCount = $this->getIncomingMessagesCount($curUser);
        $result = array(
                        "unreadMsgs"=>$unreadMessages,
                        "unreadMsgsCount"=>$unreadMessagesCount
                        );
        return $result;
    }

    public function getUsers($excludeUserId = -1){

        $sql = "SELECT id, name FROM users
				WHERE id <> {$excludeUserId}
				ORDER BY ID";
        $result = $this->mysqli->query($sql);
        $users = array();
        while ($row = mysqli_fetch_assoc($result)) {
            $users[] = $row;
        };

        return $users;

    }

    public function insertMessage($fromUser, $toUser, $msg){

        $this->mysqli->query(sprintf( 'INSERT INTO messages
								        (msg_text, to_user, from_user, create_date)
							          values
								        ("%1$s", %2$s, %3$s, now())',
                                    $msg, $toUser, $fromUser
                                    )
                            );
    }

    public function test(){
        echo "Test OK!";
    }

    public function getIncomingMessagesCount($curUser){
        $sql = "SELECT from_user as user_id, count(from_user) as msgs_count
                FROM messages
                WHERE to_user = {$curUser}
                  AND is_readed = 0
                GROUP BY from_user";
        $result = $this->mysqli->query($sql);
        $messagesCount = array();
        while ($row = mysqli_fetch_assoc($result)) {
            $messagesCount[] = $row;
        };

        return $messagesCount;

    }

}