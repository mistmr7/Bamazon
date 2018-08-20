let mysql = require('mysql')
let inquirer = require('inquirer')

let connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'root',
    database: 'bamazon'
})

connection.connect(function(err) {
    if (err) throw err;
    else {
        console.log(`Connected as id ${connection.threadId}`)
        getAllProducts()
        
    }
    
})

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
        askQuestions()
    })
}

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
    let itemID = answer.selectItems
    let itemQuantity = answer.selectQuantity
    function purchaseProducts() {
        let query = connection.query(
            'SELECT * FROM products WHERE item_id = ?',
            [itemID],
            function(err,res){
                if (err) throw err;
                else {
                    if(res[0].stock_quantity >= itemQuantity) {
                        console.log(`Thank you for your purchase of ${res[0].product_name}! Your total today will be $${res[0].price * itemQuantity}.`)
                    } else {
                        console.log('Insufficient Quantity!')
                    }
                }
            }
        )
    }
    function updateQuantity() {
        let query = connection.query(
            'UPDATE products SET ? WHERE ?',
            [{stock_quantity: (- itemQuantity},
             {item_id: itemID}],
            function(err,res){
                if (err) throw err;
                else {
                    console.log('updated')
                }
            }
        )
    }
    purchaseProducts()
    updateQuantity()
    connection.end()   
})
}

