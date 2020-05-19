//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const lodash = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser: true, useUnifiedTopology: true});

const itemSchema = {
  title: String,
};

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  title: "Buy Cookies"
});

const item2 = new Item({
  title: "Second Item"
});

const item3 = new Item({
  title: "Click the + to Add to List"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  title: String,
  items: [itemSchema]
}

const List = mongoose.model("List", listSchema)

app.get("/", function(req, res) {

  Item.find({}, function(error, founditems){

      if(founditems.length === 0){
        Item.insertMany(defaultItems, function(error){
          if(error){
            console.log("Not Added");
          } else {
            console.log("Data added to Collection");
          }
        })
        res.redirect("/");
      } else {
        res.render("list", {listTitle: "Today", newListItems: founditems});
      }
  } )

  
 
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    title: itemName
  });

  if(listName === "Today"){
    item.save();
    res.redirect("/");
  } else {
    List.findOne({title: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    })
  }
});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.list;

  if(listName === "Today"){
     Item.findByIdAndRemove(checkedItemId, function(errors){
      if(!errors){
        console.log("Added to Database")
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({title: listName}, {$pull: {items: {_id: checkedItemId}}}, function(errors, foundList){
      if(!errors){
        res.redirect("/"+listName);
      }
    });
  }
});

app.get("/:listname", function(req, res){
  const customListName = lodash.capitalize(req.params.listname);

  List.findOne({title: customListName}, function(error, foundList){
    if(!error){
      if(!foundList){
         const list = new List({
          title: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect(""+ customListName);
      } else {
        res.render("list", {listTitle: foundList.title, newListItems: foundList.items});
      }
    }
  });
 
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
