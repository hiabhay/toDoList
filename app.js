const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app=express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.set('view engine', 'ejs'); 

mongoose.connect('mongodb://127.0.0.1:27017/todolistDB');

const itemsSchema = new mongoose.Schema({
    name: String
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: "Wash Hair"
})

const item2 = new Item({
    name: "Cook Food",
})

const item3 = new Item({
    name: "Walk",
})

const defaultItems = [item1, item2, item3];

const listSchema = {
    name: "String",
    items : [itemsSchema]
} 

const List = mongoose.model("List", listSchema);

app.get("/", function(req,res){
    Item.find()
      .then(function (foundItems) {
        if(foundItems.length===0){
          Item.insertMany(defaultItems);
          res.redirect("/");
        }
        else{
          res.render("list", {listTitle: "Today", newListItems: foundItems})
        }
    })
})

app.get("/:customListName", function(req, res){
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({name: customListName}).then(function(doc){
        if(!doc){
            const list = new List ({
                name: customListName,
                items : defaultItems
            });
            list.save();
            res.redirect("/"+customListName);
        }
        else{
            res.render("list", {listTitle: doc.name, newListItems: doc.items})
        }
    })

})

app.post("/", function(req, res){
    const itemName = req.body.newItem; 
    const listName = req.body.list;
    const item = new Item({
        name: itemName,
    });
 
    if(listName==="Today"){
        item.save();
        res.redirect("/");
    }
    else{
        List.findOne({name: listName}).then(function(doc){
            doc.items.push(item);
            doc.save();
            res.redirect("/" + listName); 
        })
    }
});

app.post("/delete", function(req,res){
    const checkedItemID = req.body.checkbox;
    const listName = req.body.listName;

    if(listName==="Today"){
        Item.findById(checkedItemID)
        .then((item)=>{
        item.deleteOne();
        res.redirect("/");
      })
    }
    else{
        List.findOneAndUpdate(
            {name: listName},
            {
              $pull: { items: {_id: checkedItemID} }
            },
            {'new': true}
          ).then((doc)=>{
            console.log(doc);
          }).catch(err=>console.log(err));
        res.redirect("/"+listName)
    }
})



app.post("/work", function(req, res){
    let item = req.body.newItem; 
    workItems.push(item);
    res.redirect("/work");
})




app.listen(3000, function(){
    console.log("Server is listening.")
})