import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { Pool } from "pg";

const port = process.env.PORT || 3333;

const app = express();

const connectionString =
  "postgresql://postgres:WUPCgzIsxjMXMZo8RSgS@containers-us-west-33.railway.app:7167/railway";
const db = new Pool({
  connectionString,
});

//Middleware
app.use(cors());

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.raw({ type: "application/vnd.custom-type" }));
app.use(bodyParser.text({ type: "text/html" }));

//Routes
app.get("/", (req, res) => {
  res.send("The Fridge Opens Ominously");
});

//Get user Items
app.get("/db/userItems", (req, res) => {
  const sqlSelect =
    "SELECT users.name as user, users.id as id, JSON_ARRAYAGG(JSON_OBJECT('id', items.id, 'name', items.name, 'quantity', items.quantity)) AS 'items' from users JOIN items on users.id = items.owner GROUP BY users.id;";
  db.query(sqlSelect, (err, result) => {
    if (err) {
      res.send(err);
    } else {
      res.send(result);
    }
  });
});

app.get("/test", async (req, res) => {
  const posts = await db.query("SELECT * FROM foods;");
  res.send({ posts });
});

//Delete item
app.post("/db/delete-item", (req, res) => {
  const { name, owner } = req.body;
  const sqlSelect = "DELETE FROM items WHERE owner = ? AND name = ?;";
  db.query(sqlSelect, [owner, name], (err, result) => {
    if (err) {
      res.send(err);
    } else {
      res.send(result);
    }
  });
});

//Add Item
app.post("/db/add-item", (req, res) => {
  const { name, owner, quantity } = req.body;
  const sqlInsert = "INSERT INTO items (name, owner, quantity) VALUES (?,?,?);";
  db.query(sqlInsert, [name, owner, quantity], (err, result) => {
    if (err) {
      res.send(err);
    } else {
      res.send(result);
    }
  });
});

//Update item quantity
app.post("/db/update-item-quantity", (req, res) => {
  const { name, owner, quantity } = req.body;
  const sqlInsert =
    "UPDATE items SET quantity = quantity + ? WHERE owner = ? AND name= ?;";
  db.query(sqlInsert, [quantity, owner, name], (err, result) => {
    if (err) {
      res.send(err);
    } else {
      res.send(result);
    }
  });
});

//Get foodgroups
app.get("/db/foodgroups", (req, res) => {
  const sqlSelect =
    "SELECT json_arrayagg(foodgroup) AS foodgroups FROM (SELECT DISTINCT foodgroup from foods) a;";
  db.query(sqlSelect, (err, result) => {
    if (err) {
      res.send(err);
    } else {
      res.send(result);
    }
  });
});

//Get food by foodgroup
app.get("/db/food-by-group", (req, res) => {
  const sqlSelect = "SELECT foodgroup, name FROM foods;";
  db.query(sqlSelect, (err, result) => {
    if (err) {
      res.send(err);
    } else {
      res.send(result.rows);
    }
  });
});

//Get items in foodgroup
app.post("/db/food", (req, res) => {
  const { foodgroup } = req.body;
  const sqlSelect = "SELECT name FROM foods WHERE foodgroup = ?";
  db.query(sqlSelect, [foodgroup], (err, result) => {
    if (err) {
      res.send(err);
    } else {
      res.send(result);
    }
  });
});

//Listener
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
