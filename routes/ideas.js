const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Load helper
const {ensureAuthenticated} = require('../helpers/auth');

// load task model
require('../models/Idea');
const Idea = mongoose.model('ideas');

// Task index page
router.get('/', ensureAuthenticated, (req, res) => {
    Idea.find({user: req.user.id})
        .sort({date:'desc'})
        .then(ideas => {
            res.render('ideas/index', {
                ideas: ideas
            })
        })
})

// Add task form
router.get('/add', ensureAuthenticated, (req, res) => {
    res.render('ideas/add');
});

// Edit task form
router.get('/edit/:id', ensureAuthenticated, (req, res) => {
    Idea.findOne({
        _id: req.params.id
    })
    .then(idea => {
        if(idea.user != req.user.id) {
            req.flash('error_msg', 'GTFO');
            res.redirect('/');
        }
        else {
            res.render('ideas/edit', {
                idea:idea
            });
        }
    });
});

// Process form
router.post('/', ensureAuthenticated, (req, res) => {
    let errors = [];

    if(!req.body.title) {
        errors.push({text: 'Add a title!'});
    }
    if(!req.body.details) {
        errors.push({text: 'Add details!'});
    }

    if(errors.length > 0) {
        res.render('ideas/add', {
            errors: errors,
            title: req.body.title,
            details: req.body.details
        })
    } else {
        const newUser = {
            title: req.body.title,
            details: req.body.details,
            user: req.user.id
        };
        new Idea(newUser)
            .save()
            .then(idea => {
                req.flash('succes_msg', 'Task added'),
                res.redirect('/ideas');
            })
    }

});

// Edit form process
router.put('/:id', ensureAuthenticated, (req, res) => {
    Idea.findOne({
        _id: req.params.id
    })
    .then(idea => {
        //new values
        idea.title = req.body.title,
        idea.details = req.body.details,
        idea.save()
            .then(idea => {
                req.flash('succes_msg', 'Task updated'),
                res.redirect('/ideas');
            });
    });
});

// Delete task
router.delete('/:id', ensureAuthenticated, (req, res) => {
    Idea.deleteOne({_id: req.params.id})
        .then(() => {
            req.flash('succes_msg', 'Task removed'),
            res.redirect('/ideas');
        });
});

module.exports = router;
