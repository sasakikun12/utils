require("dotenv").config();
const axios = require("axios");
const jwt = require("jsonwebtoken");
const secret_token = process.env.SECRET_TOKEN;
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const oracledb = require("oracledb");
const app = express();
app.use(express.json());
const port = process.env.PORT || 5600;
const type = process.env.TYPE;
const Pool = require("pg").Pool;
let mySQLPool, connectionConfig, pool;

if (type === "dev") {
  mySQLPool = mysql.createPool({
    host: process.env.MYSQL_HOST_DEV,
    user: process.env.MYSQL_USER_DEV,
    password: process.env.MYSQL_PASSWORD_DEV,
    database: process.env.MYSQL_DATABASE_DEV,
  });

  connectionConfig = {
    user: process.env.ORACLE_USER,
    password: process.env.ORACLE_PASSWORD_DEV,
    connectString: `${process.env.ORACLE_HOST_DEV}:${process.env.ORACLE_PORT}/${process.env.ORACLE_DATABASE}`,
  };

  pool = new Pool({
    user: process.env.PGUSER,
    host: process.env.HOST_TESTE,
    database: process.env.DATABASE_TESTE,
    password: process.env.PGPASSWORD,
    dialect: process.env.DIALECT,
    port: process.env.PGPORT,
  });

  app.use(cors());
} else {
  mySQLPool = {
    host: process.env.MYSQL_HOST_PROD,
    user: process.env.MYSQL_USER_PROD,
    password: process.env.MYSQL_PASSWORD_PROD,
    database: process.env.MYSQL_DATABASE_PROD,
  };

  connectionConfig = {
    user: process.env.ORACLE_USER,
    password: process.env.ORACLE_PASSWORD_PROD,
    connectString: `${process.env.ORACLE_HOST_PROD}:${process.env.ORACLE_PORT}/${process.env.ORACLE_DATABASE}`,
  };

  pool = new Pool({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    dialect: process.env.DIALECT,
    port: process.env.PGPORT,
  });
}

function generateAccessToken(username) {
  return jwt.sign(username, secret_token, { expiresIn: "36000s" });
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, secret_token, (err, user) => {
    if (err) return res.sendStatus(403);

    req.user = user;

    next();
  });
}

//--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

oracledb.getConnection(connectionConfig, (err, connection) => {
  // Authenticator endpoint

  app.post("/authenticator", authenticateToken, (req, res) => {
    axios
      .get("https://url.com/authenticate", {
        headers: {
          "Content-Type": "application/json",
          authorization: "Bearer " + req.body.attribute,
        },
      })
      .then((response) => {
        res.send(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  });

  // Token/PostgreSQL endpoint

  app.post("/login", (req, res) => {
    const table = process.env.PG_TABLE
    pool
      .query(`SELECT * FROM ${table}`, [])
      .then((response) => {
        if (response.rows.length) {
          const token = generateAccessToken({ username: 'user123' });
          res.send(token);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  });

  // Mysql endpoint

  app.patch("/mysql", authenticateToken, (req, res) => {
    const table = process.env.MYSQL_TABLE;
    mySQLPool.query(
      `SELECT * FROM ${table}`,
      [],
      (err, result) => {
        if (err) {
          res.status(400).send(new Error("description"));
        } else {
          res.send(result.rows);
        }
      }
    );
  });

  // Oracle endpoint

  app.get("/oracle/:attribute", authenticateToken, (req, res) => {
    connection.execute(
      "SELECT * FROM table WHERE attribute = :attribute",
      [attribute],
      (err, result) => {
        if (err) {
          console.error("/cliente/:cod_cliente", err.message);
          res.status(500).send("Error executing query.");
        } else {
          res.send(result.rows);
        }
      }
    );
  });

  //--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

  app.listen(port, () => {
    console.log(`Connected on port ${port}`);
  });
});

process.on("SIGINT", () => {
  oracledb.getPool().close(() => {
    console.log("Pool closed");
    process.exit(0);
  });
});
