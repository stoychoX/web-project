<?php

function throw_and_die($error) {
    $data = array(
        "Status" => false,
        "Content"=> $error
    );
    $json = json_encode($data);
    echo $json;
    die();
}

function succeed_many($arr) {
    $data = array(
        "Status" => true,
        "Content" => json_encode($arr)
    );
    echo json_encode($data);
}

function succeed($message) {
    $data = array(
        "Status"=> true,
        "Content"=> $message
    );

    $json = json_encode($data);
    echo $json;
    die();
}