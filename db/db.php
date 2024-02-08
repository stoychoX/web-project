<?php
    class DB
    {
        private $connection;

        function __construct()
        {
            $config = parse_ini_file(__DIR__ . "\dbconfig.ini", true);
            $host = $config["database"]["host"];
            $port = $config["database"]["port"];
            $username = $config["database"]["username"];
            $password = $config["database"]["password"];
            $dbname = $config["database"]["dbname"];

            $connectionString = "mysql:host=$host:$port;dbname=$dbname";
            $this->connection = new PDO($connectionString, $username, $password);
        }

        function getConnection() 
        {
            return $this->connection;
        }

    }
