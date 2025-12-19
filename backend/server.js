import express from "express";
import cors from "cors";
import mysql from "mysql2";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
const salt = 10;

const app = express();
const PORT = 5001;

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);
app.use(express.json());
app.use(cookieParser());
dotenv.config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.log("Error connecting");
  } else {
    console.log("Connected to database successfully");
  }
});

const predictPriority = (category, description) => {
  const text = description.toLowerCase();

  if (
    category === "Bug" ||
    text.includes("crash") ||
    text.includes("error") ||
    text.includes("not working")||
    text.includes("urgent") ||
    text.includes("fail")
  ) {
    return "High";
  }

  return "Normal";
};


const verifyUser = (req, res, next) => {
  const token = req.cookies.token;
  console.log("TOKEN", token)
  if (!token) {
    return res.json({ Error: "Token is not valid" });
  } else {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.json({ Error: "Token is not valid" });
      } else {
        req.userId = decoded.id;
        req.name = decoded.name;
        next();
      }
    });
  }
};

app.get("/auth", verifyUser, (req, res) => {
  return res.json({ Status: "Success", name: req.name });
});

//feedback api

app.post("/feedback", verifyUser, (req, res) => {
  console.log("POST API HIT")
  const { title, description, category } = req.body;
  if (!title || !description || !category) {
    return res.json({ Error: "All the fields are required" });
  }
   const priority = predictPriority(category, description);
    const sql = "INSERT INTO feedback (user_id, title, description, category, priority) VALUES (?, ?, ?, ?, ?)";
    db.query(
      sql,
      [req.userId, title, description, category, priority],
      (err) => {
        if (err) {
          console.log("MYSQL ERROR", err);
          return res.json({ Error: "Database error" });
        }
        return res.json({ Status: "Success" });
      }
    );
  }
);

app.get("/feedback", verifyUser, (req, res) => {
  const sql = "SELECT * FROM feedback WHERE user_id = ? ORDER BY created_at DESC";
  db.query(sql, [req.userId], (err, results) => {
    if(err){
      console.log(err);
      return res.json({Error:"Database Error"})
    }
    return res.json(results);
  })
})

app.get("/feedback/:id", verifyUser, (req, res) => {
  const sql =
    "SELECT * FROM feedback WHERE id = ? AND user_id = ?";

  db.query(sql, [req.params.id, req.userId], (err, result) => {
    if (err) return res.json({ Error: "Database error" });

    if (result.length === 0) {
      return res.json({ Error: "Feedback not found" });
    }

    return res.json(result[0]); // ✅ single object
  });
});


//delete feedback
app.delete("/feedback/:id",verifyUser, (req, res) =>{
     const feedbackId = req.params.id;
     const sql = "DELETE FROM feedback WHERE id = ? AND user_id = ?";
     db.query (sql, [feedbackId, req.userId], (err, result) => {
      if(err)
        {
         console.log(err);
         return res.json({Error:"database error"});
        } 
        if(result.affectedRows === 0){
          return res.json({Error: "Unauthorized or feedback not found"})
        }
return res.json({Status:"Deleted Successfully"})

     })
})

//edit feedback

app.put("/feedback/:id", verifyUser, (req, res) => {
  const { title, category, description } = req.body;
  const sql = `
    UPDATE feedback
    SET title=?, category=?, description=?
    WHERE id=? AND user_id=?
  `;
  db.query(
    sql,
    [title, category, description, req.params.id, req.userId],
    (err, result) => {
      if (err) return res.json({ Error: "DB error" });
      res.json({ Status: "Success" });
    }
  );
});


app.post("/register", (req, res) => {
  const sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
  bcrypt.hash(req.body.password.toString(), salt, (err, hash) => {
    if (err) return res.json({ Error: "Error in hashing" });

    const values = [req.body.name, req.body.email, hash];
    db.query(sql, values, (err, result) => {
      if (err) {
        return res.json({ Error: err.message });
        console.log(err);
      }
      return res.json({ Status: "Success" });
    });
  });
});

app.post("/login", (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res.json({ message: "Enter email and password" });
  }
  const sql = "SELECT * FROM users WHERE email = ?";
  db.query(sql, [req.body.email], (err, data) => {
    if (err) return res.json({ Error: "Login error in server" });
    if (data.length > 0) {
      bcrypt.compare(
        req.body.password.toString(),
        data[0].password,
        (err, response) => {
          if (err) return res.json({ Error: "password comparision failed" });
          if (response) {
            const id = data[0].id;
            const name = data[0].name;
            const token = jwt.sign({ id, name }, process.env.JWT_SECRET, {
              expiresIn: "1d",
            });
            res.cookie("token", token, {
              httpOnly: true,
              sameSite: "lax",
              secure: false,
            });
            return res.json({ Status: "Success" });
          } else {
            return res.json({ Error: "Password not matched " });
          }
        }
      );
    } else {
      return res.json({ message: "Email not existed register first" });
    }
  });
});

app.get("/logout", (req, res) => {
  res.clearCookie("token");
  return res.json({ Status: "Success" });
});

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
