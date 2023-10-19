var express = require("express");
var app = express();
app.use(express.json());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
    res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE, HEAD"
  );
  next();
});
const port = 2410;
app.listen(port, () => console.log(`Node app listening on port ${port}!`));

let mysql=require("mysql");
let connData=({
    host:"localhost",
    user:"root",
    password:"",
    database:"testdb",
});

app.get("/shops",function(req,res){
    let connection=mysql.createConnection(connData);
    let sql="SELECT * FROM shops";
    connection.query(sql,function(err,result){
        if(err) res.status(404).send("No Data Found");
        else res.send(result);
    })
});
app.post("/shops",function(req,res){
    let body=Object.values(req.body);
    let connection=mysql.createConnection(connData);
    let sql="INSERT INTO shops(name,rent) VALUES (?,?)";
    connection.query(sql,body,function(err,result){
        if(err) res.status(404).send("No Data Found");
        else res.send("Inserted Successfully !");
    })
});

app.get("/totalpurchase/product/:productid",function(req,res){
    let productid=req.params.productid;
    let connection=mysql.createConnection(connData);
    let sql="SELECT shopid,productid,SUM(quantity*price) as TotalPurchase FROM purchases WHERE productid=? GROUP BY shopid";
    connection.query(sql,productid,function(err,result){
        if(err) res.status(404).send("No Data Found");
        else res.send(result);
    })
})

app.get("/products",function(req,res){
    let connection=mysql.createConnection(connData);
    let sql="SELECT * FROM products";
    connection.query(sql,function(err,result){
        if(err) res.status(404).send("No Data Found");
        else res.send(result);
    })
});
app.post("/products",function(req,res){
    let body=Object.values(req.body);
    let connection=mysql.createConnection(connData);
    let sql="INSERT INTO products(productname,category,description) VALUES (?,?,?)";
    connection.query(sql,body,function(err,result){
        if(err) res.status(404).send("No Data Found");
        else res.send("Inserted Successfully !");
    })
});
app.get("/products/:id",function(req,res){
    let id=req.params.id;
    let connection=mysql.createConnection(connData);
    let sql="SELECT * FROM products WHERE productid=?";
    connection.query(sql,id,function(err,result){
        if(err) res.status(404).send("No Data Found");
        else res.send(result);
    })
});
app.put("/products/:name",function(req,res){
    let name=req.params.name;
    let body=req.body;
    let connection=mysql.createConnection(connData);
    let sql="UPDATE products SET ? WHERE productname=?";
    connection.query(sql,[body,name],function(err,result){
        if(err) res.status(404).send("No Data Found");
        else res.send("Updated Successfully !");
    })
});
app.get("/totalpurchase/shop/:shopid",function(req,res){
    let shopid=req.params.shopid;
    let connection=mysql.createConnection(connData);
    let sql="SELECT shopid,productid,SUM(quantity*price) as TotalPurchase FROM purchases WHERE shopid=? GROUP BY productid";
    connection.query(sql,shopid,function(err,result){
        if(err) res.status(404).send("No Data Found");
        else res.send(result);
    })
});

app.get("/purchases", function (req, res) {
    let product = req.query.product;
    let shop = req.query.shop;
    let sort = req.query.sort;
    let connection = mysql.createConnection(connData);
    let conditions = [];
    let values = [];

    if (product) {
        let productArr = product.split(",");
        conditions.push("productid IN (?)");
        values.push(productArr);
    }

    if (shop) {
        conditions.push("shopid = ?");
        values.push(shop);
    }

    let sql = "SELECT * FROM purchases";

    if (conditions.length > 0) {
        sql += " WHERE " + conditions.join(" AND ");
    }

    if (sort) {
        if (sort === "QtyAsc") {
            sql += " ORDER BY quantity ASC";
        } else if (sort === "QtyDesc") {
            sql += " ORDER BY quantity DESC";
        } else if (sort === "ValueAsc") {
            sql += " ORDER BY price * quantity ASC";
        } else if (sort === "ValueDesc") {
            sql += " ORDER BY price * quantity DESC";
        }
    }

    connection.query(sql, values, function (err, result) {
        if (err) res.status(404).send("No Data Found");
        else res.send(result);
    });
});

app.get("/purchases/shops/:shopid",function(req,res){
    let shopid=req.params.shopid;
    let connection=mysql.createConnection(connData);
    let sql="SELECT * FROM purchases WHERE shopid=?";
    connection.query(sql,shopid,function(err,result){
        if(err) res.status(404).send("No Data Found");
        else res.send(result);
    })
});
app.get("/purchases/products/:productid",function(req,res){
    let productid=req.params.productid;
    let connection=mysql.createConnection(connData);
    let sql="SELECT * FROM purchases WHERE productid=?";
    connection.query(sql,productid,function(err,result){
        if(err) res.status(404).send("No Data Found");
        else res.send(result);
    })
});
app.post("/purchases",function(req,res){
    let body=Object.values(req.body);
    let connection=mysql.createConnection(connData);
    let sql="INSERT INTO purchases(shopid,productid,quantity,price) VALUES (?,?,?,?)";
    connection.query(sql,body,function(err,result){
        if(err) res.status(404).send("No Data Found");
        else res.send("Inserted Successfully !");
    })
});


