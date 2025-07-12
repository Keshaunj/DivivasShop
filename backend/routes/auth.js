const express = require("express");
const router = express.Router();
// login
// signup
// logout
router.get("/login", (req, res) => {
  res.json({ message: "Login Successful" });
});
router.get("/signup", (req, res) => {
  res.json({ message: "SignUp successful" });
});
router.get("/register", (req, res) => {
  res.json({
    message: "Registation Complete!",
  });
});
