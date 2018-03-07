//require mysql and inquirer
var mysql = require('mysql');
var inquirer = require('inquirer');
//create connection to db
var connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "oscar22",
    database: "Bamazon"
  });
  

function start(){
// ---------------------------------------
// PRINTING THE ITEMS FOR SALE and DETAILS
// ---------------------------------------

 connection.query('SELECT * FROM Products', function(err, res){
  if(err) throw err;
  console.log('----------------------------------------------------------------------------------------------------')
  console.log('   *************************             BAMAZON                         *************************  ')
  console.log('----------------------------------------------------------------------------------------------------')

  for(var i = 0; i<res.length;i++){
    console.log("ID: " + res[i].ItemID + " | " + "Product: " + res[i].ProductName + " | " + "Department: " + res[i].DepartmentName + " | " + "Price: " + res[i].Price + " | " + "QTY: " + res[i].StockQuantity);
   }
   console.log('----------------------------------------------------------------------------------------------------')
   console.log(' *************************    Northwestern University 2018               *************************  ')
   console.log('----------------------------------------------------------------------------------------------------')
 
  console.log(' ');
  inquirer.prompt([
    {
      type: "input",
      name: "id",
      message: "Enter the PRODUCT ID that you want to buy?",
      validate: function(value){
        if(isNaN(value) == false && parseInt(value) <= res.length && parseInt(value) > 0){
          return true;
        } else{
          return false;
        }
      }
    },
    {
      type: "input",
      name: "qty",
      message: "Enter the QUANTITY you want to purchase",
      validate: function(value){
        if(isNaN(value)){
          return false;
        } else{
          return true;
        }
      }
    }
    ]).then(function(ans){
      var whatToBuy = (ans.id)-1;
      var howMuchToBuy = parseInt(ans.qty);
      var grandTotal = parseFloat(((res[whatToBuy].Price)*howMuchToBuy).toFixed(2));

      // ---------------------------------------
      // CHECK IF THE QUANTITY IS SUFFICIENT
      // ---------------------------------------

      if(res[whatToBuy].StockQuantity >= howMuchToBuy){
        //after purchase, updates quantity in Products
        connection.query("UPDATE Products SET ? WHERE ?", [
        {StockQuantity: (res[whatToBuy].StockQuantity - howMuchToBuy)},
        {ItemID: ans.id}
        ], function(err, result){
            if(err) throw err;
            console.log("SUCCESS! Your total is $" + grandTotal.toFixed(2) + ". Your item(s) will be shipped to you in 3-5 business days.");
        });

        connection.query("SELECT * FROM Departments", function(err, deptRes){
          if(err) throw err;
          var index;
          for(var i = 0; i < deptRes.length; i++){
            if(deptRes[i].DepartmentName === res[whatToBuy].DepartmentName){
              index = i;
            }
          }
          
          // ---------------------------------------
          // UPDATE TOTAL SALES IN A DEPARTMENT
          // ---------------------------------------

          connection.query("UPDATE Departments SET ? WHERE ?", [
          {TotalSales: deptRes[index].TotalSales + grandTotal},
          {DepartmentName: res[whatToBuy].DepartmentName}
          ], function(err, deptRes){
              if(err) throw err;
             
          });
        });

      } else{
        console.log("INSUFFICIENT QUANTITY!!!");
      }

      reprompt();
    })
})
}

// ---------------------------------------
// PURCHASE ANOTHER ITEM FUNCTION
// ---------------------------------------


function reprompt(){
  inquirer.prompt([{
    type: "confirm",
    name: "reply",
    message: "Buy Another Item ?"
  }]).then(function(ans){
    if(ans.reply){
      start();
    } else{
      console.log("Thank You ...");
    }
  });
}

start();