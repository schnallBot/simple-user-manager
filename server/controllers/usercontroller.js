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
        
        // select all from user table
        connection.query('SELECT * FROM user',
                         (err, rows) => {
            // done w connection --> release it
            connection.release();
            if (err) console.log(err);
            else {
                let userRemoved = req.query.removed;
                let userStarred = req.query.starred;
                res.render('index', { rows, userRemoved, userStarred });
            }
            // console.log('data from user table: \n', rows);
        });
    });
};


// find users by search
exports.find = (req, res) => {
    // connect to database
    pool.getConnection((err, connection) => {
        if (err) throw err;  // something went wrong!
        console.log('connected as ID ' + connection.threadId);
        
        let searchTerm = req.body.search;

        // search by name
        connection.query('SELECT * FROM user WHERE CONCAT(first_name, " ", last_name) LIKE ? OR CONCAT(last_name, " ", first_name) LIKE ?',
                         Array(2).fill('%' + searchTerm + '%'),
                         (err, rows) => {
            // done w connection --> release it
            connection.release();
            if (err) console.log(err);
            else res.render('index', { rows });
            // console.log('data from user table: \n', rows);
        });
    });
};


// show only starred users
exports.starred = (req, res) => {
    // connect to database
    pool.getConnection((err, connection) => {
        if (err) throw err;  // something went wrong!
        console.log('connected as ID ' + connection.threadId);
        
        // select all starred users
        connection.query('SELECT * FROM user WHERE is_starred = ?',
                         [1],
                         (err, rows) => {
            // done w connection --> release it
            connection.release();
            if (err) console.log(err);
            else res.render('index', { rows });
            // console.log('data from user table: \n', rows);
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

        // insert user with info from request body
        connection.query('INSERT INTO user SET first_name = ?, last_name = ?, email = ?, phone = ?, comments = ?',
                         [first_name, last_name, email, phone, comments],
                         (err, rows) => {
            // done w connection --> release it
            connection.release();
            if (err) console.log(err);
            else res.render('adduser', { alert: 'User added successfully!' });
            // console.log('data from user table: \n', rows);
        });
    });
};


// star/unstar a user
exports.starone = (req, res) => {
    // connect to database
    pool.getConnection((err, connection) => {
        if (err) throw err;  // something went wrong!
        console.log('connected as ID ' + connection.threadId);

        let isStarred = 0;
        
        // get user id first
        connection.query('SELECT is_starred FROM user WHERE id = ?',
                         [req.params.id],
                         (err, rows) => {
            if (err) console.log(err);
            else {
                // get starred status of user
                isStarred = parseInt(rows[0].is_starred);

                // set starred status to opposite
                connection.query('UPDATE user SET is_starred = ? WHERE id = ?',
                                 [!isStarred, req.params.id],
                                 (err, rows) => {
                    // done w connection --> release it
                    connection.release();
                    if (err) console.log(err);
                    else {
                        let msg = "User starred successfully!"
                        if (isStarred) msg = "User unstarred successfully."
                        let userStarred = encodeURIComponent(msg);
                        res.redirect('/?starred=' + userStarred);
                    }
                    // console.log('data from user table: \n', rows);
                });
            }
        });
    });
};


// view user info
exports.viewone = (req, res) => {
    // connect to database
    pool.getConnection((err, connection) => {
        if (err) throw err;  // something went wrong!
        console.log('connected as ID ' + connection.threadId);
        
        // view this one user
        connection.query('SELECT * FROM user WHERE id = ?',
                        [req.params.id],
                        (err, rows) => {
            // done w connection --> release it
            connection.release();
            if (err) console.log(err);
            else res.render('viewuser', { rows })
            // console.log('data from user table: \n', rows);
        });
    });
};


// edit user
exports.edit = (req, res) => {
    // connect to database
    pool.getConnection((err, connection) => {
        if (err) throw err;  // something went wrong!
        console.log('connected as ID ' + connection.threadId);
        
        // edit this one user
        connection.query('SELECT * FROM user WHERE id = ?',
                         [req.params.id],
                         (err, rows) => {
            // done w connection --> release it
            connection.release();
            if (err) console.log(err);
            else res.render('edituser', { rows });
            // console.log('data from user table: \n', rows);
        });
    });
};


// update user
exports.update = (req, res) => {
    const { first_name, last_name, email, phone, comments } = req.body;

    pool.getConnection((err, connection) => {
        if (err) throw err;  // something went wrong!
        console.log('connected as ID ' + connection.threadId);

        // update this one user
        connection.query('UPDATE user SET first_name = ?, last_name = ?, email = ?, phone = ?, comments = ? WHERE id = ?',
                         [first_name, last_name, email, phone, comments, req.params.id],
                         (err, rows) => {
            if (err) console.log(err);
            else {
                // bring back to edit user page
                connection.query('SELECT * FROM user WHERE id = ?',
                                    [req.params.id],
                                    (err, rows) => {
                    // done w connection --> release it
                    connection.release();
                    if (err) console.log(err);
                    else res.render('edituser', { rows, alert: 'User updated successfully!' });
                    // console.log('data from user table: \n', rows);
                });
            }
        });
    });
};


// delete user
exports.delete = (req, res) => {
    // connect to database
    pool.getConnection((err, connection) => {
        if (err) throw err;  // something went wrong!
        console.log('connected as ID ' + connection.threadId);
        
        // delete this one user
        connection.query('DELETE FROM user WHERE id = ?',
                        [req.params.id],
                        (err, rows) => {
            // done w connection --> release it
            connection.release();
            if (err) console.log(err);
            else {
                let userRemoved = encodeURIComponent("User removed successfully.");
                res.redirect('/?removed=' + userRemoved);
            }
            // console.log('data from user table: \n', rows);
        });
    });
};