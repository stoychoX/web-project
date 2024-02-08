<?php
require_once("./utils.php");
require_once("./processor.php");

function log_user_handler($json_data) {
    if (isset($json_data["username"]) && isset($json_data["password"]) && isset($json_data["email"])) {
        $username = $json_data["username"];
        $password = $json_data["password"];
        $email = $json_data["email"];

        $exist = user_exists($username, $password, $email);
        if ($exist['exist'] == true) {
            session_start();

            $_SESSION['id'] = $exist['id'];
            $_SESSION['username'] = $username;
            succeed("Found user with id " . $exist['id']);
        }

        throw_and_die("User doesn't exist");
    } else {
        throw_and_die("Username, email or password aren't set.");
    }
}
function ping_handler() {
    session_start();
    $name = "404";
    if (isset($_SESSION["username"]))
        $name = $_SESSION["username"];
    $data = array(
        "name" => $name
    );
    succeed_many($data);
}

function insert_handler($json_data) {
    $username = isset($json_data["username"]) ? $json_data["username"] : "";
    $email = isset($json_data["email"]) ? $json_data["email"] : "";
    $password = isset($json_data["password"]) ? $json_data["password"] : "";
    insert_user($username, $password, $email);
}

function insert_record_handler($json_data) {
    session_start();
    if (!isset($json_data["Record"])) throw_and_die("Record expected.");

    if(!isset($_SESSION["username"]) || !isset($_SESSION["id"])) throw_and_die("Cannot insert record right now");

    insert_record($json_data);
}

function load_configs_handler() {
    session_start();

    if (!isset($_SESSION["id"])) {
        throw_and_die("Cannot find user.");
    }

    load_configs();
}

function get_record_handler($json_data) {
    session_start();

    if(!isset($json_data["Id"])) throw_and_die("Please pass an id");

    $id = $json_data["Id"];
    load_record($id);
}

function update_record_handler($json_data) {
    session_start();
    
    if(!isset($json_data["Id"])) throw_and_die("Please pass an id");
    if(!isset($json_data["Record"])) throw_and_die("Please provide a record");

    update_record($json_data);
}

function delete_record_handler($json_data) {
    session_start();
    if(!isset($json_data["Id"])) throw_and_die("Please pass an id");

    delete_record($json_data);
}

function cache_record_handler($json_data) {
    session_start();

    if(!isset($json_data["Record"])) throw_and_die("Please provide record!");

    cache_record($json_data);
}

function fetch_cache_handler($json_data) {
    session_start();
    fetch_cache($json_data);
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
    } else if ($json_data["RequestType"] == "InsertRecord") {
        insert_record_handler($json_data);
    } else if($json_data["RequestType"] == "LoadConfigs") {
        load_configs_handler();
    } else if($json_data["RequestType"] == "Logout") {
        session_destroy();
    } else if($json_data["RequestType"] == "GetRecord") {
        get_record_handler($json_data);
    } else if($json_data["RequestType"] == "UpdateRecord") {
        update_record_handler($json_data);
    } else if($json_data["RequestType"] == "DeleteRecord") {
        delete_record_handler($json_data);
    } else if($json_data["RequestType"] == "CacheRecord") {
        cache_record_handler($json_data);
    } else if($json_data["RequestType"] == "FetchCache") {
        fetch_cache_handler($json_data);
    } else {
        throw_and_die("No such request type.");
    }
} else
    throw_and_die("Missing request type field.");