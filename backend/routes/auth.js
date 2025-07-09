const express = require("express");
const router = express.Router();
// login
// signup
// logout
Router.get("/login", (req, res) => {
  res.json({ message: "Login Successful" });
});
Router.get("/signup", (req, res) => {
  res.json({ message: "SignUp successful" });
});
Router.get("/register", (req, res) => {
  res.json({
    message: "Registation Complete!",
  });
});
