<?php
    class DB
    {
        private $connection;

        function __construct($host, $port, $username, $password, $dbname)
        {
            $connectionString = "mysql:host=$host:$port;dbname=$dbname";
            $this->connection = new PDO($connectionString, $username, $password);
        }

        function getConnection() 
        {
            return $this->connection;
        }

    }
