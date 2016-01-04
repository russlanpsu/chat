<?php

/**
 * Created by PhpStorm.
 * User: Руслан
 * Date: 04.01.2016
 * Time: 0:23
 */


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

    public function setMessageReaded($fromUser){

        $sql = "UPDATE messages
				SET is_readed = 1
				WHERE to_user = {$fromUser}
					AND is_readed = 0";
        $this->mysqli->query($sql);
    }

    public function getHistory($fromUser, $toUser){

        $sql = "SELECT * FROM
					(SELECT msg_text,
						from_user,
						to_user,
						create_date
					FROM messages
					  WHERE from_user IN ({$fromUser}, {$toUser})
						 AND to_user IN ({$fromUser}, {$toUser})
					 ORDER BY create_date DESC
					 LIMIT 0 , 10
					)T
				ORDER BY create_date ASC";
        $result = $this->mysqli->query($sql);

        $history = array();
        while ($row = mysqli_fetch_assoc($result)) {
            $history[] = $row;
        }

        $this->setMessageReaded($fromUser);

        return $history;
    }

    public function updateHistory($fromUser){

        $sql = "SELECT msg_text,
					from_user,
					to_user,
					create_date
				FROM messages
				WHERE to_user = {$fromUser}
					AND is_readed = 0";
        $result = $this->mysqli->query($sql);
        $history = array();
        while ($row = mysqli_fetch_assoc($result)) {
            $history[] = $row;
        }

        $this->setMessageReaded($fromUser);
        return $history;

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

}