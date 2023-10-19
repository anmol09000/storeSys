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

let fs=require("fs");
let fname="shop.json";
let {data}=require("./ShopData");


app.get("/shops",function(req,res){
    let data1=JSON.stringify(data);
    fs.writeFile(fname,data1,function(err,content){
        if(err) res.status(404).send(err);
        else{
            fs.readFile(fname,"utf8",function(err,content){
                if(err) res.status(404).send("No Data Found");
                else{
                    let arr=JSON.parse(content);
                    res.send(arr.data.shops);
                }
            })
        }
    })
});
app.post("/shops",function(req,res){
    let body=req.body;
    fs.readFile(fname,"utf8",function(err,content){
        if(err) res.status(404).send(err);
        else{
            let arr=JSON.parse(content);
            let maxId=arr.data.shops.reduce((acc,curr)=>curr.shopId>acc?curr.shopId:acc, 0);
            let newId=maxId+1;
            let shop={shopId:newId,...body};
            arr.data.shops.push(shop);
            let data1=JSON.stringify(arr);
            fs.writeFile(fname,data1,function(err,content){
                if(err) res.status(404).send(err);
                else res.send("Successfully Inserted !!");
            })
        }
    })
});

app.get("/products",function(req,res){
    fs.readFile(fname,"utf8",function(err,content){
        if(err) res.status(404).send("No Data Found");
        else{
            let arr=JSON.parse(content);
            res.send(arr.data.products);
        }
    })
});
app.get("/products/:productName",function (req,res) {
  let productName = req.params.productName;
  fs.readFile(fname,"utf8",function(err,content){
    if (err) {
      res.send(err);
    } else {
      let data1 = JSON.parse(content);
      let prod = data1.data.products.find((a) => a.productName === productName);
      if (prod) {
        res.send(prod);
      } else {
        res.status(404).send("No Data Found");
      }
    }
  });
});
app.post("/products",function(req,res){
    let body=req.body;
    fs.readFile(fname,"utf8",function(err,content){
        if(err) res.status(404).send(err);
        else{
            let arr=JSON.parse(content);
            let maxId=arr.data.products.reduce((acc,curr)=>curr.productId>acc?curr.productId:acc, 0);
            let newId=maxId+1;
            let product={productId:newId,...body};
            arr.data.products.push(product);
            let data1=JSON.stringify(arr);
            fs.writeFile(fname,data1,function(err,content){
                if(err) res.status(404).send(err);
                else res.send("Successfully Inserted !!");
            })
        }
    })
});
app.put("/products/:productid",function(req,res){
    let productid=+req.params.productid;
    let body=req.body;
    fs.readFile(fname,"utf8",function(err,content){
        if(err) res.status(404).send(err);
        else{
            let arr=JSON.parse(content);
            let index=arr.data.products.findIndex((a)=>a.productId===productid);
            if(index>=0){
                let updated={productId:productid, ...body};
                arr.data.products[index]=updated;
                let data1=JSON.stringify(arr);
                fs.writeFile(fname,data1,function(err,content){
                    if(err) res.status(404).send(err);
                    else res.send(updated);
                })
            }else res.status(404).send("No Data Found");
        }
    })
});

app.get("/purchases", function (req, res) {
    let product = req.query.product;
    let shop = +req.query.shop;
    let sort = req.query.sort;
  
    if (product) {
      let productIds = product.split(",").map(Number);
      fs.readFile(fname, "utf8", function (err, content) {
        if (err) res.status(404).send(err);
        else {
          let arr = JSON.parse(content);
          let arr1 = arr.data.purchases.filter((a) => productIds.includes(a.productid));
          if (arr1) res.send(arr1);
          else res.status(404).send("No Data Found");
        }
      });
    } else if (shop) {
      fs.readFile(fname, "utf8", function (err, content) {
        if (err) res.status(404).send(err);
        else {
          let arr = JSON.parse(content);
          let arr1 = arr.data.purchases.filter((a) => a.shopId === shop);
          if (arr1) res.send(arr1);
          else res.status(404).send("No Data Found");
        }
      });
    } else if (sort) {
      fs.readFile(fname, "utf8", function (err, content) {
        if (err) res.status(404).send(err);
        else {
          let arr = JSON.parse(content);
          let sortedPurchases;
  
          if (sort === "QtyAsc") {
            sortedPurchases = [...arr.data.purchases].sort((a, b) => a.quantity - b.quantity);
          } else if (sort === "QtyDesc") {
            sortedPurchases = [...arr.data.purchases].sort((a, b) => b.quantity - a.quantity);
          } else if (sort === "ValueAsc") {
            sortedPurchases = [...arr.data.purchases].sort((a, b) => a.quantity * a.price - b.quantity * b.price);
          } else if (sort === "ValueDesc") {
            sortedPurchases = [...arr.data.purchases].sort((a, b) => b.quantity * b.price - a.quantity * a.price);
          }
  
          res.send(sortedPurchases);
        }
      });
    } else {
      fs.readFile(fname, "utf8", function (err, content) {
        if (err) res.status(404).send("No Data Found");
        else {
          let arr = JSON.parse(content);
          res.send(arr.data.purchases);
        }
      });
    }
  });
  
app.get("/purchases/shops/:shopid",function(req,res){
    let shopid=+req.params.shopid;
    fs.readFile(fname,"utf8",function(err,content){
        if(err) res.status(404).send("No Data Found");
        else{
            let arr=JSON.parse(content);
            let purchase=arr.data.purchases.filter((a)=>a.shopId===shopid);
            if(purchase)  res.send(purchase);
            else res.send("No Data Found");
        }
    })
});
app.get("/purchases/products/:productid",function(req,res){
    let productid=+req.params.productid;
    fs.readFile(fname,"utf8",function(err,content){
        if(err) res.status(404).send("No Data Found");
        else{
            let arr=JSON.parse(content);
            let purchase=arr.data.purchases.filter((a)=>a.productid===productid);
            if(purchase)  res.send(purchase);
            else res.send("No Data Found");
        }
    })
});

app.get("/totalPurchase/shop/:shopid", function (req, res) {
    const shopId = +req.params.shopid;
  
    fs.readFile(fname, "utf8", function (err, content) {
      if (err) {
        res.status(404).send(err);
      } else {
        const arr = JSON.parse(content);
        const purchases = arr.data.purchases.filter((a) => a.shopId === shopId);
  
        if (purchases.length > 0) {
          const productTotals = purchases.reduce((totals, purchase) => {
            const { productid,quantity, price, shopId } = purchase;
  
            if (!totals[productid]) {
              totals[productid] = {
                productid: productid,
                value: 0,
                shopId: shopId,
              };
            }

            totals[productid].value += quantity * price;
  
            return totals;
          }, {});
  
          const result = Object.values(productTotals);
  
          res.send(result);
        } else {
          res.status(404).send("No Data Found");
        }
      }
    });
  });
  
app.get("/totalPurchase/product/:productid", function (req, res) {
    const productId = +req.params.productid;
  
    fs.readFile(fname, "utf8", function (err, content) {
      if (err) {
        res.status(404).send(err);
      } else {
        const arr = JSON.parse(content);
        const purchases = arr.data.purchases.filter((a) => a.productid === productId);
  
        if (purchases.length > 0) {
          const shopTotals = purchases.reduce((totals, purchase) => {
            const { shopId,quantity, price, productid } = purchase;
  
            if (!totals[shopId]) {
              totals[shopId] = {
                shopId: shopId,
                productid: productid,
                value: 0,
              };
            }
  
            totals[shopId].value += quantity * price;
  
            return totals;
          }, {});
  
          const result = Object.values(shopTotals);
  
          res.send(result);
        } else {
          res.status(404).send("No Data Found");
        }
      }
    });
  });
  
  app.post("/purchases",function(req,res){
    let body=req.body;
    fs.readFile(fname,"utf8",function(err,content){
        if(err) res.status(404).send(err);
        else{
            let arr=JSON.parse(content);
            let maxId=arr.data.purchases.reduce((acc,curr)=>curr.productId>acc?curr.productId:acc, 0);
            let newId=maxId+1;
            let product={purchaseId:newId,...body};
            arr.data.purchases.push(product);
            let data1=JSON.stringify(arr);
            fs.writeFile(fname,data1,function(err,content){
                if(err) res.status(404).send(err);
                else res.send("Successfully Inserted !!");
            })
        }
    })
});
