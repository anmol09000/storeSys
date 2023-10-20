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
var port = process.env.PORT||2410;
app.listen(port, () => console.log(`Node app listening on port ${port}!`));

const { Client } = require("pg");
const client = new Client({
    user:"postgres",
    password:"62653903220906",
    database:"postgres",
    port:5432,
    host:"db.xmrxwivrxbqrqwcznjat.supabase.co",
    ssl: { rejectUnauthorized:false },
});
client.connect(function(err,result){
    console.log("Connected !!")
})

app.get("/shops",function(req,res){
    let sql=`SELECT * FROM shops`;
    client.query(sql,function(err,result){
        if(err) res.status(404).send("No Data Found");
        else res.send(result.rows);
    })
});
app.post("/shops",function(req,res){
    let body=Object.values(req.body);
    let sql=`INSERT INTO shops(name,rent) VALUES ($1,$2)`;
    client.query(sql,body,function(err,result){
        if(err) res.status(404).send("No Data Found");
        else res.send("Inserted Successfully !");
    })
});

app.get("/totalpurchase/product/:productid",function(req,res){
    let productid=req.params.productid;
    let sql=`SELECT shopid, productid, SUM(quantity * price) as TotalPurchase FROM purchases WHERE productid = $1 GROUP BY shopid, productid`;
    client.query(sql,[productid],function(err,result){
        if(err) res.status(404).send("No Data Found");
        else res.send(result.rows);
    })
})

app.get("/products",function(req,res){
    let sql=`SELECT * FROM products`;
    client.query(sql,function(err,result){
        if(err) res.status(404).send("No Data Found");
        else res.send(result.rows);
    })
});
app.post("/products",function(req,res){
    let body=Object.values(req.body);
    let sql="INSERT INTO products(productname,category,description) VALUES ($1,$2,$3)";
    client.query(sql,body,function(err,result){
        if(err) res.status(404).send("No Data Found");
        else res.send("Inserted Successfully !");
    })
});
app.get("/products/:name",function(req,res){
    let name=req.params.name;
    let sql=`SELECT * FROM products WHERE productname=$1`;
    client.query(sql,[name],function(err,result){
        if(err) res.status(404).send("No Data Found");
        else res.send(result.rows);
    })
});
app.put("/products/:name",function(req,res){
    let name=req.params.name;
    let body=req.body;
    let sql=`UPDATE products SET category=$1,description=$2 WHERE productname=$3`;
    client.query(sql,[body.category,body.description,name],function(err,result){
        if(err) res.status(404).send("No Data Found");
        else res.send("Updated Successfully !");
    })
});
app.get("/totalpurchase/shop/:shopid",function(req,res){
    let shopid=req.params.shopid;
    let sql=`SELECT shopid,productid,SUM(quantity*price) as TotalPurchase FROM purchases WHERE shopid=$1 GROUP BY productid,shopid`;
    client.query(sql,[shopid],function(err,result){
        if(err) res.status(404).send("No Data Found");
        else res.send(result.rows);
    })
});

app.get("/purchases", function (req, res) {
    let product = req.query.product;
    let shop = req.query.shop;
    let sort = req.query.sort;
    let conditions = [];
    let values = [];
    let paramCount = 1;

    if (product) {
        let productArr = product.split(",").map((a)=>a.replace("pr",""));
        conditions.push(`productid = ANY($${paramCount})`);
        values.push(productArr);
        paramCount++;
    }

    if (shop) {
        let shopArr=shop.replace("st","");
        conditions.push(`shopid = $${paramCount}`);
        values.push(shopArr);
        paramCount++;
    }

    let sql = `SELECT * FROM purchases`;
    if (conditions.length > 0) {
        sql += ` WHERE ` + conditions.join(" AND ");
    }

    if (sort) {
        if (sort === "QtyAsc") {
            sql += ` ORDER BY quantity ASC`;
        } else if (sort === "QtyDesc") {
            sql += ` ORDER BY quantity DESC`;
        } else if (sort === "ValueAsc") {
            sql += ` ORDER BY price * quantity ASC`;
        } else if (sort === "ValueDesc") {
            sql += ` ORDER BY price * quantity DESC`;
        }
    }

    console.log(sql, values);
    client.query(sql, values, function (err, result) {
        if (err) res.status(404).send("No Data Found");
        else res.send(result.rows);
    });
});


app.get("/purchases/shops/:shopid",function(req,res){
    let shopid=req.params.shopid;
    let sql="SELECT * FROM purchases WHERE shopid=$1";
    client.query(sql,[shopid],function(err,result){
        if(err) res.status(404).send("No Data Found");
        else res.send(result.rows);
    })
});
app.get("/purchases/products/:productid",function(req,res){
    let productid=req.params.productid;
    let sql="SELECT * FROM purchases WHERE productid=$1";
    client.query(sql,[productid],function(err,result){
        if(err) res.status(404).send("No Data Found");
        else res.send(result.rows);
    })
});
app.post("/purchases",function(req,res){
    let body=Object.values(req.body);
    let sql="INSERT INTO purchases(shopid,productid,quantity,price) VALUES ($1,$2,$3,$4)";
    client.query(sql,body,function(err,result){
        if(err) res.status(404).send("No Data Found");
        else res.send("Inserted Successfully !");
    })
});

