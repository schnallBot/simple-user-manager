const express = require('express');
const router = express.Router();
const usercontroller = require('../controllers/usercontroller');

// home and search
router.get('/', usercontroller.view);
router.post('/', usercontroller.find);

// see starred users, add user
router.get('/starred', usercontroller.starred);
router.get('/adduser', usercontroller.form);
router.post('/adduser', usercontroller.create);

// single user functions
router.get('/staruser/:id', usercontroller.starone);
router.get('/viewuser/:id', usercontroller.viewone);
router.get('/edituser/:id', usercontroller.edit);
router.post('/edituser/:id', usercontroller.update);
router.get('/deleteuser/:id', usercontroller.delete);

module.exports = router;