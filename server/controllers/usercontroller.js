const mysql = require('mysql');

// connection pool
const pool = mysql.createPool({
    connectionLimit: 100,
    host:            process.env.DB_HOST,
    user:            process.env.DB_USER,
    password:        process.env.DB_PASS,
    database:        process.env.DB_NAME
});

// render home page
exports.view = (req, res) => {    
    // connect to database
    pool.getConnection((err, connection) => {
        if (err) throw err;  // something went wrong!
        console.log('connected as ID ' + connection.threadId);
        
        // use the connection
        connection.query('SELECT * FROM user WHERE status = "active"',
                         (err, rows) => {
            // done w connection --> release it
            connection.release();
            if (!err) {
                let userRemoved = req.query.removed;
                res.render('index', { rows, userRemoved });
            } else console.log(err);
            console.log('data from user table: \n', rows);
        });
    });
};


// find user by search
exports.find = (req, res) => {
    // connect to database
    pool.getConnection((err, connection) => {
        if (err) throw err;  // something went wrong!
        console.log('connected as ID ' + connection.threadId);
        
        let searchTerm = req.body.search;

        // use the connection
        connection.query('SELECT * FROM user WHERE status = "active" AND CONCAT(first_name, " ", last_name) LIKE ? OR CONCAT(last_name, " ", first_name) LIKE ?',
                         Array(2).fill('%' + searchTerm + '%'),
                         (err, rows) => {
            // done w connection --> release it
            connection.release();
            if (!err) res.render('index', { rows });
            else console.log(err);
            console.log('data from user table: \n', rows);
        });
    });
};


// render adduser page
exports.form = (req, res) => {
    res.render('adduser');
};


// add new user
exports.create = (req, res) => {
    const { first_name, last_name, email, phone, comments } = req.body;

    pool.getConnection((err, connection) => {
        if (err) throw err;  // something went wrong!
        console.log('connected as ID ' + connection.threadId);

        // use the connection
        connection.query('INSERT INTO user SET first_name = ?, last_name = ?, email = ?, phone = ?, comments = ?',
                         [first_name, last_name, email, phone, comments],
                         (err, rows) => {
            // done w connection --> release it
            connection.release();
            if (!err) res.render('adduser', { alert: 'User added successfully!' });
            else console.log(err);
            console.log('data from user table: \n', rows);
        });
    });
};


// edit user
exports.edit = (req, res) => {
    // connect to database
    pool.getConnection((err, connection) => {
        if (err) throw err;  // something went wrong!
        console.log('connected as ID ' + connection.threadId);
        
        // use the connection
        connection.query('SELECT * FROM user WHERE id = ?',
                         [req.params.id],
                         (err, rows) => {
            // done w connection --> release it
            connection.release();
            if (!err) res.render('edituser', { rows });
            else console.log(err);
            console.log('data from user table: \n', rows);
        });
    });
};


// update user
exports.update = (req, res) => {
    const { first_name, last_name, email, phone, comments } = req.body;

    pool.getConnection((err, connection) => {
        if (err) throw err;  // something went wrong!
        console.log('connected as ID ' + connection.threadId);

        // use the connection
        connection.query('UPDATE user SET first_name = ?, last_name = ?, email = ?, phone = ?, comments = ? WHERE id = ?',
                         [first_name, last_name, email, phone, comments, req.params.id],
                         (err, rows) => {
            // done w connection --> release it
            connection.release();
            if (!err) {
                pool.getConnection((err, connection) => {
                    if (err)
                        throw err;  // something went wrong!
                    console.log('connected as ID ' + connection.threadId);
                    
                    // use the connection
                    connection.query('SELECT * FROM user WHERE id = ?',
                                     [req.params.id],
                                     (err, rows) => {
                        // done w connection --> release it
                        connection.release();
                        if (!err)
                            res.render('edituser', { rows, alert: 'User updated successfully!' });
                        else
                            console.log(err);
                        console.log('data from user table: \n', rows);
                    });
                });
            } else console.log(err);
            console.log('data from user table: \n', rows);
        });
    });
};


// delete user
exports.delete = (req, res) => {
    // connect to database
    pool.getConnection((err, connection) => {
        if (err) throw err;  // something went wrong!
        console.log('connected as ID ' + connection.threadId);
        
        // use the connection
        connection.query('DELETE FROM user WHERE id = ?',
                        [req.params.id],
                        (err, rows) => {
            // done w connection --> release it
            connection.release();
            if (!err) {
                let userRemoved = encodeURIComponent("User removed successfully.");
                res.redirect('/?removed=' + userRemoved);
            }
            else console.log(err);
            console.log('data from user table: \n', rows);
        });
    });
};


// view user info
exports.viewone = (req, res) => {
    // connect to database
    pool.getConnection((err, connection) => {
        if (err) throw err;  // something went wrong!
        console.log('connected as ID ' + connection.threadId);
        
        // use the connection
        connection.query('SELECT * FROM user WHERE id = ?',
                        [req.params.id],
                        (err, rows) => {
            // done w connection --> release it
            connection.release();
            if (!err) res.render('viewuser', { rows })
            else console.log(err);
            console.log('data from user table: \n', rows);
        });
    });
};