const User = require("../models/user")
const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const passport = require("passport")

router.get("/register", (req, res) => {
    res.render("users/register");
})

router.post("/register", catchAsync(async (req, res) => {
    try{
        const { email, username, password }  = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        console.log(registeredUser);
        req.flash("success", "Registered!")
        res.redirect("/campgrounds")
    }
    catch(e){
        req.flash("error", e.message)
        res.redirect("/register")
    }
}))

router.get("/login", (req, res) => {
    res.render("users/login");
})

router.post("/login", passport.authenticate('local', { failureFlash: true, failureRedirect: "/login"}), (req, res) => {
    req.flash("success", "Welcome back!");
    res.redirect("/campgrounds");
})

router.get("/logout", (req, res) => {
    req.logout(err => {
        if(err){
            return next(err);
        }
        req.flash("success", "Goodbye!");
        res.redirect("/campgrounds");
    });
})

module.exports = router