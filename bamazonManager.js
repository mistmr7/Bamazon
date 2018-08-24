// Pull in the required packages from npm
let mysql = require('mysql')
let inquirer = require('inquirer')

// Define the connection to mysql
let connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'root',
    database: 'bamazon'
})

// Main menu to pull up for managers, prompting them to pick from a list of actions
function runSearch() {
    inquirer
      .prompt({
            name: "action",
            type: "list",
            message: "What would you like to do?",
            choices: [
            "View Products for Sale",
            "View Low Inventory",
            "Add to New Inventory",
            "Add New Product",
            "Quit"
            ]
      })
      .then(function(answer) {

        // Switch made for each of the different choices they could make, running the functions below based on the choice
            switch (answer.action) {
            case "View Products for Sale":
                viewProducts()
                break;
    
            case "View Low Inventory":
                viewLowInventory()
                break;
    
            case "Add to New Inventory":
                addNewInventory()
                break;
    
            case "Add New Product":
                addNewProduct()
                break;
            
            case "Quit":
                connection.end()
                break;
            }
      });
}

// Function to run to show all of the items on the screen
function viewProducts() {
    let query = connection.query(
        // SQL query to select all products in inventory
        "SELECT * FROM products",
         function(err,res){
        if (err) throw err;
        else {
            console.log('Item ID | Product Name | Price | Quantity')
            console.log('==============================')
            // Loop through all products and print their information to the screen
            for (i=0; i < res.length; i++){    
                console.log(res[i].item_id + ' | ' + res[i].product_name + ' | ' +  res[i].price + ' | ' + res[i].stock_quantity)
                
            }
            console.log('==============================')                
        }

        // Bring the manager back to the main menu
        runSearch()
    })
}

// Function run to view any item that has less than 5 products in inventory
function viewLowInventory() {
    let query = connection.query(
        // SQL query to select all products
        "SELECT * FROM products",
         function(err,res){
        if (err) throw err;
        else {
            console.log('Item ID | Product Name | Price | Quantity')
            console.log('==============================')
            // Loop through all of the items to check them all
            for (i=0; i < res.length; i++){
                // If an item has less than 5 in stock, print that item to the screen
                if (res[i].stock_quantity < 5) {    
                console.log(res[i].item_id + ' | ' + res[i].product_name + ' | ' +  res[i].price + ' | ' + res[i].stock_quantity)
                }
            }
            console.log('==============================')                
        }

        // Bring the manager back to the main menu
        runSearch()
    })
}

// Function to update the stock quantity for a given item
function addNewInventory() {
    //Questions to identify the item needing updating and the quantity to update it to
    inquirer
        .prompt([{
            name: 'item',
            type: 'input',
            message: 'What is the item ID you would like to update?'
        }, {
            name: 'stock',
            type: 'input',
            message: 'Please input the new stock quantity.'
        }])
        .then(function(answer) {
            // Answers parsed to correct form for price and stock quantity
            let itemID = parseInt(answer.item)
            let stockQ = parseInt(answer.stock)
            let query = connection.query(
                // SQL query to update products to stock quantity of the answer above on the item chosen above
                "UPDATE products SET ? WHERE ?",
                [{stock_quantity: stockQ}, {item_id: itemID}],
                function(err,res){
                    if (err) {
                        throw err;
                    } else {
                        console.log('Stock has been updated')
                        console.log('==============================')                
                    }
                
                // Bring the manager back to the main menu
                runSearch()
            })
            
        })

    
}

// Run the function to add a new product to the database. Answers to the first four questions will define the product
function addNewProduct() {
    inquirer
    .prompt([{
        name: 'product',
        type: 'input',
        message: 'What is the name of the new product?'
    }, {
        name: 'department',
        type: 'input',
        message: 'What department will sell this product?'
    }, {
        name: 'price',
        type: 'input',
        message: 'What is the price of the new product?'
    }, {
        name: 'stock',
        type: 'input',
        message: 'What quantity should be added to stock?'
    }])
    .then(function(answer) {
        // Answers parsed to correct form for price and stock quantity
        let productPrice = parseInt(answer.price)
        let stockQuantity = parseInt(answer.stock)
        let query = connection.query(
            // SQL query
            "INSERT INTO PRODUCTS SET ?", 
            //set the parameters for the new item
            {   
            product_name: answer.product,
            department_name: answer.department,
            price: productPrice,
            stock_quantity: stockQuantity
            }, function(err,res){
                if (err) {
                    throw err;
                } else {
                    // show that it ran correctly
                    console.log('New Product has been added to inventory')
                    console.log('==============================')                
                }
            // Bring the manager back to the main menu
            runSearch()
        })
        
    })
}

runSearch()