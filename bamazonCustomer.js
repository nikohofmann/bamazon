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
  displayProducts();
});

function displayProducts() {
  console.log("Retrieving products...\n")
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
        " Price: $" + res[i].price.toFixed(2) +
        "\n-----------------------------------------------------"
      );
    }
    setTimeout(purchaseProduct, 1500);
  });
};

function purchaseProduct() {
  inquirer.prompt([
    {
      type: 'list',
      name: 'item',
      message: 'Which item would you like to purchase?',
      choices: items
    },
    {
      type: 'number',
      name: 'quantity',
      message: 'How many do you want?',
    }
  ]).then(answers => {
    connection.query("SELECT * FROM products WHERE item_id=" + answers.item, function(err, res) {
      if (err) throw err;
      var itemPurchased = res[0];
      if (answers.quantity > itemPurchased.stock_quantity) {
        console.log("Insufficient Quantity!");
        setTimeout(purchaseProduct, 1500);
      } else {
        connection.query("UPDATE products SET ? WHERE ?",
        [
          {
            stock_quantity: res[0].stock_quantity - answers.quantity, 
            product_sales: itemPurchased.price * answers.quantity
          },
          {
            item_id: answers.item
          }
        ],
        function(err, res) {
          if (err) throw err;
          console.log("Thank you for your order! \n Your total comes to: $" + (itemPurchased.price * answers.quantity).toFixed(2));
          inquirer.prompt([
            {
              type: "confirm",
              name: "anotherPurchase",
              message: "Would you like to make another purchase?"
            }
          ]).then(answers => {
            if (answers.anotherPurchase) {
              displayProducts();
            } else if (!answers.anotherPurchase) {
              connection.end();
            } 
          });
        });
      }
    })
  })
}