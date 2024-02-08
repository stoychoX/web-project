<?php
require_once("../db/db.php");
require_once("./utils.php");

function check_email_duplicate($email, $connection) {
    try {
        $query = "SELECT COUNT(*) as count FROM `users` WHERE `email` = :email;";
        $stmt = $connection->prepare($query);

        $stmt->execute(["email" => $email]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row["count"] > 0;
    } catch (PDOException $e) {
        throw_and_die($e->getMessage());
    } catch (Exception $e) {
        throw_and_die($e->getMessage());
    }
}

function insert_user_impl($username, $password, $email, $connection) {
    try {
        $query = "INSERT INTO `users`(`name`, `email`, `passwd`) VALUES (:username, :email, :password);";
        $stmt = $connection->prepare($query);
        $password = md5($password);

        $stmt->execute(["username" => $username, "email" => $email, "password" => $password,]);

        $affectedRows = $stmt->rowCount();

        if ($affectedRows > 0) {
            succeed("Successful signing in.");
        } else {
            throw_and_die("Counld not insert user");
        }
    } catch (PDOException $e) {
        throw_and_die($e->getMessage());
    } catch (Exception $e) {
        throw_and_die($e->getMessage());
    }
}

function insert_user($username, $password, $email) {
    if (empty($username) || empty($email) || empty($password))
        throw_and_die("Need username, email and password");

    $db = new DB();
    $connection = $db->getConnection();

    if (check_email_duplicate($email, $connection))
        throw_and_die('Duplicate email');
    insert_user_impl($username, $password, $email, $connection);
}

function insert_into_configs($record_str, $name, $db) {
    $query = "INSERT INTO `configs`(`line`, `name`) VALUES (:line, :name);";

    $connection = $db->getConnection();
    try {
        $stmt = $connection->prepare($query);

        $stmt->execute(["line" => $record_str, "name" => $name,]);
        $affectedRows = $stmt->rowCount();

        if ($affectedRows > 0) {
            return $connection->lastInsertId();
        } else {
            throw_and_die("Unexpected error");
        }
    } catch (PDOException $e) {
        throw_and_die("unexpected error");
    }
}

function insert_relation($record_id, $db) {
    $user_id = $_SESSION["id"];
    $query = "INSERT INTO `user-config-mapping` (`uid`, `cid`) VALUES (:uid, :cid);";

    try {
        $connection = $db->getConnection();
        $stmt = $connection->prepare($query);

        $stmt->execute(["uid" => $user_id, "cid" => $record_id,]);

        $affectedRows = $stmt->rowCount();

        if ($affectedRows > 0) {
            succeed("Inserted successfully");
        } else {
            throw_and_die("Unexpected error");
        }
    } catch (PDOException $e) {
        throw_and_die("Unexpected error");
    }
}

function insert_record($json_data) {
    $record = json_encode($json_data["Record"]);
    $record_name = $json_data["Name"];
    $db = new DB();

    $id = insert_into_configs($record, $record_name, $db);
    insert_relation($id, $db);
}

function load_configs() {
    $db = new DB();
    $id = $_SESSION["id"];

    $query = "SELECT name, id FROM `configs` AS cfg JOIN `user-config-mapping` AS ucm ON ucm.cid = cfg.id WHERE ucm.uid = :id;";
    $connection = $db->getConnection();

    try {
        $stmt = $connection->prepare($query);
        $stmt->execute(["id" => $id,]);
        $data = $stmt->fetchAll();
        succeed_many($data);
    } catch (PDOException $e) {
        throw_and_die("Unexpected error.");
    }
}

function load_record($id) {
    $db = new DB();
    $query = "SELECT line, name FROM `configs` AS c WHERE c.id = :id;";

    $connection = $db->getConnection();
    try {
        $stmt = $connection->prepare($query);
        $stmt->execute(["id" => $id,]);

        $data = $stmt->fetchAll();
        $count = $stmt->rowCount();

        if ($count == 0) {
            throw_and_die("Unable to find such config");
        }
        succeed($data);
    } catch (PDOException $e) {
        throw_and_die("Unexpected error");
    }
}

function user_exists($username, $password, $email) {
    try {
        $db = new DB();
        $conn = $db->getConnection();
        $sql = "SELECT id as uid FROM users WHERE name = :username AND email = :email AND passwd = :password;";
        $password = md5($password);

        $stmt = $conn->prepare($sql);
        $stmt->execute(["username" => $username, "email" => $email, "password" => $password,]);

        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if (empty($row)) {
            return array("exist" => false);
        }
        return array("exist" => true, "id" => $row["uid"]);
    } catch (PDOException $e) {
        return false;
    }
}

function update_record($json_data) {
    $id = $json_data["Id"];
    $record = $json_data["Record"];

    try {
        $db = new DB();

        $connection = $db->getConnection();
        $sql = "UPDATE `configs` AS c SET c.line = :record WHERE c.id = :id;";
        $stmt = $connection->prepare($sql);
        $stmt->execute(["record" => $record, "id" => $id,]);

        $updated = $stmt->rowCount();

        if($updated != 1) {
            throw_and_die("This shouldn't happen - more than one records or none updated.");
        }
        else {
            succeed("Successfully updated");
        }
    }
    catch (PDOException $e) {
        throw_and_die("Unable to perform update");
    }
}

function delete_record($json_data) {
    $id = $json_data["Id"];

    try {
        $db = new DB();
        $connection = $db->getConnection();
        $sql = "DELETE FROM `configs` WHERE id = :id; DELETE FROM `user-config-mapping` WHERE cid = :cid;";
        $stmt = $connection->prepare($sql);
        $stmt->execute(["id" => $id, "cid" => $id,]);

        $updated = $stmt->rowCount();
        if($updated == 0) {
            throw_and_die("Unable to delete any records");
        }
        else {
            succeed("Record deleted.");
        }

    } catch (PDOException $e) {
        throw_and_die("Unable to perform update");
    }
}

function cache_record($json_data) {
    $record = $json_data["Record"];
    $_SESSION["RecordCache"] = $record;
    succeed("Record added in cache");
}

function fetch_cache($json_data) {
    if(isset($_SESSION["RecordCache"])) {
        $record = $_SESSION["RecordCache"];
        unset($_SESSION["RecordCache"]);
        succeed($record); // record is string
    }
    
    throw_and_die("Unable to find cached record");
}