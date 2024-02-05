<?php

function throw_and_die($error) {
    $data = array(
        "Status" => false,
        "Content"=> $error
    );
    header("Content-Type: application/json");
    $json = json_encode($data);
    echo $json;
    die();
}

function succeed_many($arr) {
    $data = array(
        "Status"=> true,
        "Content"=> json_encode($arr)
    );
    header("Content-Type: application/json");
    echo json_encode($data);
}

function succeed($message) {
    $data = array(
        "Status"=> true,
        "Content"=> $message
    );
    // header("Content-Type: application/json");
    $json = json_encode($data);
    http_response_code(200);
    echo $json;
    die();
}