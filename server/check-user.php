<?php
    require_once("../db/db.php");
    function user_exists($username, $password, $email) {
        try {
            $db = new DB("172.28.112.213", "3306", "skyosev", "822751469", "users_data");
            $conn = $db->getConnection();
            $sql = "SELECT id as uid FROM users WHERE name = :username AND email = :email AND passwd = :password;";
            $password = md5($password);

            $stmt = $conn->prepare($sql);
            $stmt->execute(["username" => $username,"email"=>$email, "password"=>$password,]);

            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if(empty($row)) {
                return array("exist" => false);
            }
            return array("exist" => true, "id" => $row["uid"]);
        }
        catch (PDOException $e) {
            return false;
        }
    }