<?php
session_start();

require_once("./check-user.php");
require_once("./utils.php");
require_once("./add-user-to-database.php");

function log_user_handler($json_data)
{
    if (isset($json_data["username"]) && isset($json_data["password"]) && isset($json_data["email"])) {
        $username = $json_data["username"];
        $password = $json_data["password"];
        $email = $json_data["email"];

        $exist = user_exists($username, $password, $email);
        if ($exist['exist'] == true) {
            $_SESSION['id'] = $exist['id'];
            $_SESSION['username'] = $username;
            succeed("Found user with id " . $exist['id']);
        }

        throw_and_die("User doesn't exist");
    } else {
        throw_and_die("Username, email or password aren't set.");
    }
}
function ping_handler()
{
    $hassession = (session_status() === PHP_SESSION_ACTIVE);
    $name = "404";
    if ($hassession && isset($_SESSION["username"]))
        $name = $_SESSION["username"];
    $data = array(
        "Has-session" => $hassession,
        "name" => $name
    );
    succeed_many($data);
}

function insert_handler($json_data)
{
    $username = isset($json_data["username"]) ? $json_data["username"] : "";
    $email = isset($json_data["email"]) ? $json_data["email"] : "";
    $password = isset($json_data["password"]) ? $json_data["password"] : "";
    insert_user($username, $password, $email);
}

$data = file_get_contents("php://input");
$json_data = json_decode($data, true);

if (isset($json_data["RequestType"])) {
    if ($json_data["RequestType"] == "LogUser") {
        log_user_handler($json_data);
    } else if ($json_data["RequestType"] == "Ping") {
        ping_handler();
    } else if ($json_data["RequestType"] == "InsertUser") {
        insert_handler($json_data);
    } else {
        throw_and_die("No such request type.");
    }
} else
    throw_and_die("Missing request type field.");