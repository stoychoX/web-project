<?php
require_once("../db/db.php");
require_once("./utils.php");

function check_email_duplicate($email, $connection)
{
    try {
        $query = "SELECT COUNT(*) as count FROM `users` WHERE `email` = :email;";
        $stmt = $connection->prepare($query);

        $stmt->execute(["email" => $email]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row["count"] > 0;
    } 
    catch (PDOException $e) {
        throw_and_die($e->getMessage());
    }
    catch (Exception $e) {
        throw_and_die($e->getMessage());
    }
}

function insert_user_impl($username, $password, $email, $connection)
{
    try {
        $query = "INSERT INTO `users`(`name`, `email`, `passwd`) VALUES (:username, :email, :password);";
        $stmt = $connection->prepare($query);
        $password = md5($password);

        $stmt->execute(["username" => $username,"email"=>$email, "password"=>$password,]);

        $affectedRows = $stmt->rowCount();

        if ($affectedRows > 0) {
            succeed("Successful signing in.");
        } else {
            throw_and_die("Counld not insert user");
        }
    }
    catch (PDOException $e) {
        throw_and_die($e->getMessage());
    }
    catch (Exception $e) {
        throw_and_die($e->getMessage());
    }
}

function insert_user($username, $password, $email)
{
    if(empty($username) || empty($email) || empty($password)) throw_and_die("Need username, email and password");

    $db = new DB('172.28.112.213', '3306', 'skyosev', '822751469', 'users_data');
    $connection = $db->getConnection();

    if(check_email_duplicate($email, $connection)) throw_and_die('Duplicate email');
    insert_user_impl($username, $password, $email, $connection);
}