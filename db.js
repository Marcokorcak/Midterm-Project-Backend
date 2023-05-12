const Pool = require("pg").Pool;
const DATABASE_URL =
  "postgres://shntrmdsghimku:b3ee73c97e5c43b1e59b59f11ad1c921b59f8027ada7b6d8b494b812409af47c@ec2-44-213-228-107.compute-1.amazonaws.com:5432/d8h6m4sjhe4gns";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  User: "shntrmdsghimku",
  Password: "b3ee73c97e5c43b1e59b59f11ad1c921b59f8027ada7b6d8b494b812409af47c",
  Host: "ec2-44-213-228-107.compute-1.amazonaws.com",
  Database: "d8h6m4sjhe4gns",
});

//let currentUser = 38; //placeholder variable for current user id

//users table functions//
//create a user
const signup = async (req, res) => {
  //signup page
  try {
    const { username, email, passwd } = req.body;
    let errors = {};

    const isEmailInUse = await pool.query(
      "SELECT * FROM users WHERE email = $1", //checks if email is in use
      [email]
    );

    if (isEmailInUse.rows.length > 0) {
      errors.email = "Email is already in use";
    }

    const isUsernameInUse = await pool.query(
      "SELECT * FROM users WHERE username = $1", //checks if email is in use
      [username]
    );

    if (isUsernameInUse.rows.length > 0) {
      errors.username = "Username is already in use";
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json(errors);
    }

    const newUserSignup = await pool.query(
      "INSERT INTO users (username, email, passwd) VALUES ($1, $2, $3) RETURNING *", //inserts data into users table
      [username, email, passwd]
    );

    //1 is checking account, 2 is savings
    const randNumAccountSavings = Math.floor(100000 + Math.random() * 900000);
    const randNumRoutingSavings = Math.floor(100000 + Math.random() * 900000);

    const randNumAccountChecking = Math.floor(100000 + Math.random() * 900000);
    const randNumRoutingChecking = Math.floor(100000 + Math.random() * 900000);

    const randNumCreditCard1 = Math.floor(100000 + Math.random() * 900000);
    const randNumCreditCard2 = Math.floor(100000 + Math.random() * 900000);

    const balance = 1000;
    const debt1 = 100;
    const debt2 = 300;

    const credit_card_1 = 1;
    const credit_card_2 = 2;

    const account_number_savings = randNumAccountSavings;
    const routing_number_savings = randNumRoutingSavings;
    const type_account_savings = 2;

    const account_number_checking = randNumAccountChecking;
    const routing_number_checking = randNumRoutingChecking;
    const type_account_checking = 1;

    const newUser = await pool.query("SELECT COUNT(*) FROM users");
    const nextUser = newUser.rows[0].count;

    console.log(newUser);

    const newSavingsAccount = await pool.query(
      "INSERT INTO account (balance, account_number, routing_number, type_account) VALUES($1, $2, $3, $4) RETURNING *",
      [
        balance,
        account_number_savings,
        routing_number_savings,
        type_account_savings,
      ]
    );

    // const newJointSavingsAccount = await pool.query(
    //   "INSERT INTO joint (user_id_FK, account_id_FK) VALUES ($1, $2)",
    //   [nextUser, newSavingsAccount.rows[0].account_id]
    // );

    const newCheckingAccount = await pool.query(
      "INSERT INTO account (balance, account_number, routing_number, type_account) VALUES($1, $2, $3, $4) RETURNING *",
      [
        balance,
        account_number_checking,
        routing_number_checking,
        type_account_checking,
      ]
    );

    // const newJointCheckingAccount = await pool.query(
    //   "INSERT INTO joint (user_id_FK, account_id_FK) VALUES ($1, $2)",
    //   [nextUser, newCheckingAccount.rows[0].account_id]
    // );

    const newCreditCard1 = await pool.query(
      "INSERT INTO credit_card (debt, credit_card_num, type_credit_card) VALUES($1, $2, $3) RETURNING *",
      [debt1, randNumCreditCard1, credit_card_1]
    );

    const newJointCreditCard1 = await pool.query(
      "INSERT INTO joint (user_id_FK, account_id_FK, credit_card_id_FK) VALUES ($1, $2, $3)",
      [
        nextUser,
        newCheckingAccount.rows[0].account_id,
        newCreditCard1.rows[0].credit_card_id,
      ]
    );

    const newCreditCard2 = await pool.query(
      "INSERT INTO credit_card (debt, credit_card_num, type_credit_card) VALUES($1, $2, $3) RETURNING *",
      [debt2, randNumCreditCard2, credit_card_2]
    );

    const newJointCreditCard2 = await pool.query(
      "INSERT INTO joint (user_id_FK, account_id_FK, credit_card_id_FK) VALUES ($1, $2, $3)",
      [
        nextUser,
        newSavingsAccount.rows[0].account_id,
        newCreditCard2.rows[0].credit_card_id,
      ]
    );
    // res.status(200).json({ success: true });

    res.json({ sucess: true, data: newUser.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//login

const login = async (req, res) => {
  //validates user with users table
  try {
    const { username, passwd } = req.body;
    const user = await pool.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);
    if (user.rows.length === 0) {
      return res.status(404).json({
        error: {
          message: "User not found", //checks user and displays message if not found
        },
      });
    }
    if (!(passwd === user.rows[0].passwd)) {
      return res.status(401).json({
        error: {
          message: "Incorrect password", //checks if password is incorrect and prints message
        },
      });
    }
    currentUser = user.rows[0].user_id; //grab current user id when logging in, used for joint table
    console.log(currentUser);
    res.status(200).json({ success: true }); //user logged in successfully
  } catch (err) {
    res.status(500).send("Server Error"); //server error
  }
};

//Account functions//

//CONNECTED WITH JOINT

const getCheckingAccount = async (req, res) => {
  try {
    const getJointAccount = await pool.query(
      "SELECT account_id_FK FROM joint WHERE user_id_FK = $1",
      [currentUser]
    );

    let jointAccountLength = getJointAccount.rows.length;

    let array = [];
    let array2 = [];

    for (let i = 0; i < jointAccountLength; i++) {
      array[i] = getJointAccount.rows[i].account_id_fk;
      // console.log(array[i]);
    }

    let arrString = array.toString();

    console.log(arrString);

    const getAllUserAccount = await pool.query(
      "SELECT * FROM account WHERE type_account = 1 AND account_id IN (" +
        arrString +
        ") "
    );

    res.json(getAllUserAccount.rows);
    console.log(array);
    console.log(array2);
  } catch (err) {
    console.error(err.message);
  }
};

const getSavingsAccount = async (req, res) => {
  try {
    const getJointAccount = await pool.query(
      "SELECT account_id_FK FROM joint WHERE user_id_FK = $1",
      [currentUser]
    );

    let jointAccountLength = getJointAccount.rows.length;

    let array = [];
    let array2 = [];

    for (let i = 0; i < jointAccountLength; i++) {
      array[i] = getJointAccount.rows[i].account_id_fk;
    }

    let arrString = array.toString();

    console.log(arrString);

    const getAllUserAccount = await pool.query(
      "SELECT * FROM account WHERE type_account = 2 AND account_id IN (" +
        arrString +
        ") "
    );

    res.json(getAllUserAccount.rows);
    console.log(array);
    console.log(array2);
  } catch (err) {
    console.error(err.message);
  }
};

const incrementAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const { balance } = req.body;
    await pool.query(
      "UPDATE account SET balance = (balance + $1) WHERE account_id = $2",
      [balance, id]
    );
    const account = await pool.query(
      "SELECT * FROM account WHERE account_id = $1",
      [id]
    );
    res.json(account.rows[0]);
  } catch (err) {
    console.error(err.message);
  }
};

const decrementAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const { balance } = req.body;

    const account = await pool.query(
      "SELECT * FROM account WHERE account_id = $1",
      [id]
    );

    const newBal = account.rows[0].balance - balance;

    if (newBal < 0) {
      return res.status(401).json({
        error: {
          message: "You do not Have Sufficient Funds for this Withdrawal.", //checks if password is incorrect and prints message
        },
      });
    } else {
      await pool.query(
        "UPDATE account SET balance = (balance - $1) WHERE account_id = $2",
        [balance, id]
      );
    }
    res.json(account.rows[0]);
  } catch (err) {
    console.error(err.message);
  }
};

const getCreditCard1 = async (req, res) => {
  try {
    const getJointAccount = await pool.query(
      "SELECT credit_card_id_FK FROM joint WHERE user_id_FK = $1",
      [currentUser]
    );

    let jointAccountLength = getJointAccount.rows.length;

    let array = [];
    let array2 = [];

    for (let i = 0; i < jointAccountLength; i++) {
      array[i] = getJointAccount.rows[i].credit_card_id_fk;
    }

    let arrString = array.toString();

    console.log(arrString);

    const getAllUserAccount = await pool.query(
      "SELECT * FROM credit_card WHERE type_credit_card = 1 AND credit_card_id IN (" +
        arrString +
        ") "
    );

    res.json(getAllUserAccount.rows);
    console.log(array);
    console.log(array2);
  } catch (err) {
    console.error(err.message);
  }
};

const getCreditCard2 = async (req, res) => {
  try {
    const getJointAccount = await pool.query(
      "SELECT credit_card_id_FK FROM joint WHERE user_id_FK = $1",
      [currentUser]
    );

    let jointAccountLength = getJointAccount.rows.length;

    let array = [];
    let array2 = [];

    for (let i = 0; i < jointAccountLength; i++) {
      array[i] = getJointAccount.rows[i].credit_card_id_fk;
    }

    let arrString = array.toString();

    console.log(arrString);

    const getAllUserAccount = await pool.query(
      "SELECT * FROM credit_card WHERE type_credit_card = 2 AND credit_card_id IN (" +
        arrString +
        ") "
    );

    res.json(getAllUserAccount.rows);
    console.log(array);
    console.log(array2);
  } catch (err) {
    console.error(err.message);
  }
};

const decrementCreditCard = async (req, res) => {
  try {
    const { id } = req.params;
    const { balance } = req.body;

    const credit_card = await pool.query(
      "SELECT * FROM credit_card WHERE credit_card_id = $1",
      [id]
    );

    const newBal = credit_card.rows[0].debt - balance;

    if (newBal < 0) {
      return res.status(401).json({
        error: {
          message: "You Must Only Pay up to Amount Owed", //checks if password is incorrect and prints message
        },
      });
    } else {
      await pool.query(
        "UPDATE credit_card SET debt = (debt - $1) WHERE credit_card_id = $2",
        [balance, id]
      );
    }
    res.json(credit_card.rows[0]);
  } catch (err) {
    console.error(err.message);
  }
};

const updateSettings = async (req, res) => {
  try {
    const { username, email, passwd } = req.body;

    await pool.query(
      "UPDATE users SET username = $1, email = $2, passwd = $3 WHERE user_id = $4",
      [username, email, passwd, currentUser]
    );

    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err.message);
  }
};

module.exports = {
  signup,
  login,
  getCheckingAccount,
  getSavingsAccount,
  incrementAccount,
  decrementAccount,
  updateSettings,
  getCreditCard1,
  getCreditCard2,
  decrementCreditCard,
  pool,
}; //export all modules
