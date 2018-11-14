var inquirer = require("inquirer");

var mysql = require("mysql");

var cTable = require('console.table');

var connection = mysql.createConnection({
  host: "localhost",
  multipleStatements: true,

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "password",
  database: "bamazon"
});

connection.connect(function(err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId);
  getOperation();
});

function getOperation() {
  inquirer.prompt([
    {
      type: "list",
      name: "operation",
      message: "Welcome, Supervisor. What would you like to do?",
      choices: [
        {
          name: "View Product Sales by Department", 
          value: "viewProductSales"
        },
        {
          name: "Create New Department", 
          value: "createDepartment"
        }
      ]
    }
  ]).then(answers => {
    if (answers.operation === "viewProductSales") {
      displayProductSales();
    } else if (answers.operation === "createDepartment") {
      createDepartment();
    }
  });
}

function displayProductSales() {
  console.log("\n Retrieving product sales...\n")
  var query = "SELECT departments.department_id as ID, departments.department_name as 'Department Name', departments.over_head_costs as 'Overhead Costs', SUM(products.product_sales) as Sales " +
  "FROM departments " +
  "LEFT JOIN products " +
  "ON departments.department_name = products.department_name " +
  "GROUP BY departments.department_name; ";
  connection.query(query, function(err, res) {
    if (err) throw err;
    for (var i = 0; i < res.length; i++) {
      if (res[i].Sales === null) {
        res[i].Sales = 0;
      }
      res[i]["Profit"] = res[i].Sales - res[i]["Overhead Costs"];
    }
    console.table(res);
    setTimeout(getOperation, 1000);
  });
}


function createDepartment() {
  inquirer.prompt([
    {
      type: "input",
      name: "deptName",
      message: "Department Name:"
    },
    {
      type: "number",
      name: "overheadCosts",
      message: "Overhead Costs:"
    }
  ]).then(answers => {
    if (answers.overheadCosts !== answers.overheadCosts) {
      console.log("Please enter numbers only for overhead costs");
      createDepartment();
    } else {
      connection.query("INSERT INTO departments SET ?", 
      {
        department_name: answers.deptName,
        over_head_costs: answers.overheadCosts
      },
      function(err, res) {
        if (err) throw err;
        console.log("Department successfully added!");
        setTimeout(getOperation, 1500);
      })
    }
  });
};