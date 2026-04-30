const express = require("express");
const pool = require("./db");

const app = express();
app.use(express.json());

/* Middleware Logging */
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} - ${new Date()}`);
  next();
});

/* GET semua */
app.get("/tasks", async (req, res) => {
  const result = await pool.query("SELECT * FROM tasks");
  res.json(result.rows);
});

/* GET by ID */
app.get("/tasks/:id", async (req, res) => {
  const result = await pool.query(
    "SELECT * FROM tasks WHERE id=$1",
    [req.params.id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ message: "Task tidak ditemukan" });
  }

  res.json(result.rows[0]);
});

/* POST */
app.post("/tasks", async (req, res) => {
  const { title, description } = req.body;

  if (!title || title.trim() === "") {
    return res.status(400).json({ message: "Title tidak boleh kosong" });
  }

  const result = await pool.query(
    "INSERT INTO tasks (title, description) VALUES ($1, $2) RETURNING *",
    [title, description]
  );

  res.json(result.rows[0]);
});

/* PUT */
app.put("/tasks/:id", async (req, res) => {
  const { title, description, is_completed } = req.body;

  const result = await pool.query(
    "UPDATE tasks SET title=$1, description=$2, is_completed=$3 WHERE id=$4 RETURNING *",
    [title, description, is_completed, req.params.id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ message: "Task tidak ditemukan" });
  }

  res.json(result.rows[0]);
});

/* DELETE */
app.delete("/tasks/:id", async (req, res) => {
  const result = await pool.query(
    "DELETE FROM tasks WHERE id=$1 RETURNING *",
    [req.params.id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ message: "Task tidak ditemukan" });
  }

  res.json({ message: "Task berhasil dihapus" });
});

app.listen(3000, () => {
  console.log("Server jalan di http://localhost:3000");
});