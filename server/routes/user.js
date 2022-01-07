const express = require('express');
const router = express.Router();
const usercontroller = require('../controllers/usercontroller');

// create, find, update, delete
router.get('/', usercontroller.view);
router.post('/', usercontroller.find);
router.get('/adduser', usercontroller.form);
router.post('/adduser', usercontroller.create);
router.get('/edituser/:id', usercontroller.edit);
router.post('/edituser/:id', usercontroller.update);
router.get('/deleteuser/:id', usercontroller.delete);
router.get('/viewuser/:id', usercontroller.viewone);

module.exports = router;