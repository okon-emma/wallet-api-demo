const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");

/* User model */
const User = require("../../models/User");

/* Utils */
const { getRandom } = require("../../helpers/utils");

/** api/users
 * POST
 * PUBLIC
 */
router.post("/register", (req, res) => {
  const { name, email, phone, password, userRef } = req.body;

  /** Validate */
  if (!name || !email || !phone || !password) {
    return res
      .status(400)
      .json({ msg: "Please enter name, email, password, & phone" });
  }

  /** Check if user exits */
  User.findOne({ email }).then((user) => {
    if (user) return res.status(400).json({ msg: "User exists" });

    const newUser = new User({
      name,
      email,
      phone,
      account_number: getRandom(11),
      account_balance: getRandom(2) * 1000,
      userRef,
      password,
    });

    // ** Create salt & hash
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(newUser.password, salt, (err, hash) => {
        if (err) throw err;
        newUser.password = hash;

        console.log(newUser);

        newUser.save().then((user) => {
          jwt.sign(
            { id: user.id },
            config.get("bartersecret"),
            { expiresIn: 3600 },
            (err, token) => {
              if (err) throw err;
              res.json({
                token,
                user: {
                  id: user.id,
                  name: user.name,
                  email: user.email,
                  phone: user.phone,
                  account_balance: user.account_balance,
                  account_number: user.account_number,
                },
              });
            }
          );
        });
      });
    });
  });
});

module.exports = router;
