let mysql = require('mysql')
let inquirer = require('inquirer')
let stockQuantity
let itemID

// Define the connection to mysql
let connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'root',
    database: 'bamazon'
})

// Connect to mysql
connection.connect(function(err) {
    if (err) throw err;
    else {
        // Log that we are connected so the user knows
        console.log(`Connected as id ${connection.threadId}`)
        // Call function to get all of the products from the store and print them to the console
        getAllProducts()    
    } 
})

// Get all of the products from the store and print them to the console
function getAllProducts() {
    let query = connection.query("SELECT * FROM products", function(err,res){
        if (err) throw err;
        else {
            console.log('Item ID | Product Name | Price')
            console.log('==============================')
            for (i=0; i < res.length; i++){    
                console.log(res[i].item_id + ' | ' + res[i].product_name + ' | ' +  res[i].price)
            }                
        }
        // Ask the user questions about what they would like to buy
        askQuestions()
    })
}

// Prompt the user to answer questions related to their purchase of item id and quantity
function askQuestions() {
    inquirer.prompt([{
    name: 'selectItems',
    type: 'input',
    message: 'Please select the Item ID of the item you would like to purchase',
    choices: 0
}, {
    name: 'selectQuantity',
    type: 'input',
    message: 'Please select the quantity you would like to buy',
    choices: 0
}]).then(answer => {
    // Parse the item id from a string to a number and the quantity to buy
    let itemID = parseInt(answer.selectItems)
    let itemQuantity = parseInt(answer.selectQuantity)

    // Function called to run the product purchase
    function purchaseProducts() {
        let query = connection.query(
            // sql line to pull all items where ID is selected from the above prompt
            'SELECT * FROM products WHERE item_id = ?',
            [itemID],
            function(err,res){
                if (err) throw err;
                else {
                    // If we have enough stock, print the price of the purchase
                    if(res[0].stock_quantity >= itemQuantity) {
                        console.log(`Thank you for your purchase of ${res[0].product_name}! Your total today will be $${res[0].price * itemQuantity}.`)
                    } else {
                        // Otherwise, print that we don't have enough in stock
                        console.log('Insufficient Quantity!')
                    }

                    // set the variables for stockQuantity and itemID and set them to use in Updating the quantity
                    stockQuantity = res[0].stock_quantity
                    itemID = res[0].item_id
                    updateQuantity()
                }
            }
        )
        
         
    }

    // Function called to update the quantity in stock
    function updateQuantity() {
        let query = connection.query(
            // SQL query to set stock to new stock quantity where the item ID was chosen for purchase
            'UPDATE products SET stock_quantity = (SELECT stock_quantity - ?) WHERE item_id = ?',
            [itemQuantity,
             itemID],
            function(err,res){
                if (err) throw err;
                else {
                    console.log('Stock Quantity updated to reflect purchase')
                    // End the connection after the purchase
                    connection.end()
                }
            }
        )
        console.log(query.sql)
    }
    purchaseProducts()   
})
}

