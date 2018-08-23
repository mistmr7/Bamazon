let mysql = require('mysql')
let inquirer = require('inquirer')

let connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'root',
    database: 'bamazon'
})

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

function viewProducts() {
    let query = connection.query("SELECT * FROM products", function(err,res){
        if (err) throw err;
        else {
            console.log('Item ID | Product Name | Price | Quantity')
            console.log('==============================')
            for (i=0; i < res.length; i++){    
                console.log(res[i].item_id + ' | ' + res[i].product_name + ' | ' +  res[i].price + ' | ' + res[i].stock_quantity)
                
            }
            console.log('==============================')                
        }
        runSearch()
    })
}

function viewLowInventory() {
    let query = connection.query("SELECT * FROM products", function(err,res){
        if (err) throw err;
        else {
            console.log('Item ID | Product Name | Price | Quantity')
            console.log('==============================')
            for (i=0; i < res.length; i++){
                if (res[i].stock_quantity < 5) {    
                console.log(res[i].item_id + ' | ' + res[i].product_name + ' | ' +  res[i].price + ' | ' + res[i].stock_quantity)
                }
            }
            console.log('==============================')                
        }
        runSearch()
    })
}

function addNewInventory() {
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
            let itemID = parseInt(answer.item)
            let stockQ = parseInt(answer.stock)
            let query = connection.query(
                "UPDATE products SET ? WHERE ?",
                [{stock_quantity: stockQ}, {item_id: itemID}],
                function(err,res){
                    if (err) {
                        throw err;
                    } else {
                        console.log('Stock has been updated')
                        console.log('==============================')                
                    }
                    runSearch()
            })
            
        })

    
}

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
        let productPrice = parseInt(answer.price)
        let stockQuantity = parseInt(answer.stock)
        let query = connection.query(
            "INSERT INTO PRODUCTS SET ?", {   
            product_name: answer.product,
            department_name: answer.department,
            price: productPrice,
            stock_quantity: stockQuantity
            }, function(err,res){
                if (err) {
                    throw err;
                } else {
                    console.log('New Product has been added to inventory')
                    console.log('==============================')                
                }
                runSearch()
        })
        
    })
}

runSearch()