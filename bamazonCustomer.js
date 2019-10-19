const inquire = require('inquirer');
const cTable = require('console.table');
const mysql = require("mysql");

var connection = mysql.createConnection({
  host: "localhost",

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
  displayTable();
});

function displayTable() {
    connection.query(
        "SELECT * FROM products",
        function(err, res) {
          if (err) throw err;
          console.table(res);
          beginPurchase();
    });
}



function beginPurchase() {
    inquire.prompt(
        [
            {
                type: "list",
                name: "intro",
                message: "What would you like to do?",
                choices: ["Purchase an item", "Exit"]
            }
        ]
    ).then(function(user) {
        if(user.intro == "Purchase an item") {
            inquire.prompt(
                [
                    {
                      type: "input",
                      name: "itemID",
                      message: "Enter the item ID: "
                    },
                    {
                      type: "input",
                      name: "quantity",
                      message: "Enter the quantity you would like to purchase: "
                    }
                ]
            ).then(function(data) {
                quantityCheck(data.itemID, data.quantity);
            })
        } else if (user.intro == "Exit") {
            connection.end();
        }
    })
}



function quantityCheck(id, quantityReq) {
    
    connection.query(`SELECT stock_quantity FROM products WHERE item_id=${id}`, function(err, res) {
        if (err) throw err;
        if ((res[0].stock_quantity > 0) || (parseInt(quantityReq) > res[0].stock_quantity)) {
            connection.query(`UPDATE products SET stock_quantity=${res[0].stock_quantity}-${quantityReq} WHERE item_id=${id}`,
                function(err) {
                    if (err) throw err;
                    console.log("\nPurchase successful!\n");
                    totalCost(id, quantityReq);
                    displayTable();
                })
        }
        else if ((res[0].stock_quantity) == 0 || (parseInt(quantityReq) < res[0].stock_quantity)) {
            console.log("\nInsufficient quantity available!");
            displayTable();
        }
    });
}
//"INSERT INTO products SET ?",{ flavor: "Rocky Road", price: 3.0, quantity: 50 },
//"SELECT * FROM products" 

function totalCost(id, quantity) {
    connection.query(`SELECT price FROM products WHERE item_id=${id}`, function(err, res) {
        if (err) throw err;
        console.log(`Total cost: ${res[0].price * quantity}\n`);
    });
}






