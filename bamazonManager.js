var inquirer = require("inquirer");

var mysql = require("mysql");

var items = [];

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
      message: "Welcome, Manager. What would you like to do?",
      choices: [
        {
          name: "View Products for Sale", 
          value: "viewProducts"
        },
        {
          name: "View Low Inventory", 
          value: "viewLowInventory"
        },
        {
          name: "Add to Inventory", 
          value: "addInventory"
        },
        { 
          name: "Add New Product",
          value: "addProduct"
        }
      ]
    }
  ]).then(answers => {
    if (answers.operation === "viewProducts") {
      displayProducts();
    } else if (answers.operation === "viewLowInventory") {
      displayLowInventory();
    } else if (answers.operation === "addInventory") {
      addInventory();
    } else if (answers.operation === "addProduct") {
      addProduct();
    }
  });
}

function displayProducts() {
  console.log("\n Retrieving products...\n")
  connection.query("SELECT * FROM products", function(err, res) {
    if (err) throw err;
    items = [];
    for (var i = 0; i < res.length; i++) {
      var currentItem = {
        name: res[i].product_name,
        value: res[i].item_id
      };
      items.push(currentItem);
      console.log(
        " Item ID: " + res[i].item_id + "   |  " +
        " Product Name: " + res[i].product_name + "\n" +
        " Department: " + res[i].department_name + "   |  " +
        " Price: $" + res[i].price.toFixed(2) + "\n" +
        " Quantity in stock: " + res[i].stock_quantity +
        "\n-----------------------------------------------------"
      );
    }
    setTimeout(getOperation, 1500);
  });
};

function displayLowInventory() {
  console.log("\n Retrieving products...\n")
  connection.query("SELECT * FROM products WHERE stock_quantity < 5", function(err, res) {
    if (err) throw err;
    items = [];
    if (res.length === 0) {
      console.log("No items are running low!");
    } else {
      for (var i = 0; i < res.length; i++) {
        var currentItem = {
          name: res[i].product_name,
          value: res[i].item_id
        };
        items.push(currentItem);
        console.log(
          " Item ID: " + res[i].item_id + "   |  " +
          " Product Name: " + res[i].product_name + "\n" +
          " Department: " + res[i].department_name + "   |  " +
          " Price: $" + res[i].price.toFixed(2) + "\n" +
          " Quantity in stock: " + res[i].stock_quantity +
          "\n-----------------------------------------------------"
        );
      }
    }
    setTimeout(getOperation, 1500);
  });
};

function addInventory() {
  connection.query("SELECT * FROM products", function(err, res) {
    if (err) throw err;
    items = [];
    for (var i = 0; i < res.length; i++) {
      var currentItem = {
        name: res[i].product_name,
        value: res[i].item_id
      };
      items.push(currentItem);
    }
    inquirer.prompt([
      {
        type: 'list',
        name: 'item',
        message: 'Which item would you like to add stock to?',
        choices: items
      },
      {
        type: 'number',
        name: 'quantity',
        message: 'How many do you have to add?',
      }
    ]).then(answers => {
      connection.query("SELECT * FROM products WHERE item_id=" + answers.item, function(err, itemToUpdate) {
        if (err) throw err;
        connection.query("UPDATE products SET ? WHERE ?",
        [
          {
            stock_quantity: itemToUpdate[0].stock_quantity + answers.quantity
          },
          {
            item_id: itemToUpdate[0].item_id
          }
        ],
        function(err, res) {
          if (err) throw err;
          console.log("Inventory successfully added!");
          setTimeout(getOperation, 1500);
        });
      })
    });
  });
}

function addProduct() {
  inquirer.prompt([
    {
      type: "input",
      name: "productName",
      message: "Product Name:"
    },
    {
      type: "input",
      name: "productDepartment",
      message: "Product Department:"
    },
    {
      type: "number",
      name: "productPrice",
      message: "Price:"
    },
    {
      type: "number",
      name: "stockQuantity",
      message: "Stock Quantity:"
    }
  ]).then(answers => {
    if (answers.productPrice !== answers.productPrice || answers.stockQuantity !== answers.stockQuantity) {
      console.log("Please enter numbers only for price and stock quantity");
      addInventory();
    } else {
      connection.query("INSERT INTO products SET ?", 
      {
        product_name: answers.productName,
        department_name: answers.productDepartment,
        price: answers.productPrice,
        stock_quantity: answers.stockQuantity
      },
      function(err, res) {
        if (err) throw err;
        console.log("Product successfully added!");
        setTimeout(getOperation, 1500);
      })
    }
  });
};