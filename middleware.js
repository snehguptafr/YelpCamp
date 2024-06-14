const express = require("express");

module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()){
        req.flash("error", "You need to be signed in");
        res.redirect("/login");
    }
    next()
}