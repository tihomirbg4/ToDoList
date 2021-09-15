//jshint esversion: 6

const express = require("express")
const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser")
const session = require("express-session")
const flash = require("connect-flash")

const mongoose = require("mongoose")
const _ = require("lodash")

const app = express()

// const items = ["Buy Food", "Cook food", "Eat Food"]
// const workItems = []

app.set("view engine", "ejs")

app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static("public"))
app.use(cookieParser("secret"))
app.use(session({ cookie: { maxAge: null } }))
app.use(session({
    secret: "secret",
    cookie: { maxAge: 60000 },
    resave: false,
    saveUninitialized: false
}))
app.use(flash())

mongoose.connect("mongodb+srv://tihomirbg:picklock123@cluster0.axouq.mongodb.net/todolistDB", { useNewUrlParser: true })

const itemsSchema = new mongoose.Schema({
    name: String
})

const Item = mongoose.model("Item", itemsSchema)

const item1 = new Item({
    name: "Welcome to your todolist!"
})

const item2 = new Item({
    name: "Hit the + buttons to add a new item."
})

const item3 = new Item({
    name: "<-- Hit this to delete an item"
})

const defaultItems = [item1, item2, item3]

const listSchema = {
    name: String,
    items: [itemsSchema]
}

const List = mongoose.model("List", listSchema)

app.get("/", function (req, res) {

    // let today = new Date()

    // let options = {
    //     weekday: "long",
    //     day: "numeric",
    //     month: "long"
    // }

    // let day = today.toLocaleDateString("en-US", options)
    Item.find({}, function (err, foundItems) {
        if (foundItems.length === 0) {
            Item.insertMany(defaultItems, function (err) {
                if (err) {
                    console.log(err)
                }
            })
            res.redirect("/")
        } else {
            res.render("list", { listTitle: "Today", newListItems: foundItems, message: req.flash("message"), error: req.flash("error") })
        }

    })
})

app.get("/:customListName", function (req, res) {
    const customListName = _.capitalize(req.params.customListName)

    List.findOne({ name: customListName }, function (err, foundList) {
        if (!err) {
            if (!foundList) {
                const list = new List({
                    name: customListName,
                    items: defaultItems
                })

                list.save()
                res.redirect("/" + customListName)
            } else {
                res.render("list", { listTitle: foundList.name, newListItems: foundList.items, message: req.flash("message"), error: req.flash("error") })
            }
        }
    })

})


app.post("/", function (req, res) {
    let itemName = req.body.newItem
    let listName = req.body.list

    const item = new Item({
        name: itemName
    })

    if (listName === "Today") {
        if (itemName.length < 1) {
            req.flash("message", "Can't add empty item")
            req.flash("error", true)
            res.redirect("/")
        } else {
            item.save()
            req.flash("message", "Successfully added item")
            req.flash("error", false)
            res.redirect("/")
        }
    } else {
        if (itemName.length < 1) {
            req.flash("message", "Can't add empty item")
            req.flash("error", true)
            res.redirect("/" + listName)
        } else {
            List.findOne({ name: listName }, function (err, foundList) {
                foundList.items.push(item)
                foundList.save()
                req.flash("message", "Successfully added item")
                req.flash("error", false)
                res.redirect("/" + listName)
            })
        }

    }

})



app.post("/delete", function (req, res) {
    const checkedItemId = req.body.checkbox
    const listName = req.body.listName

    if (listName === "Today") {
        Item.findByIdAndRemove(checkedItemId, function (err) {
            if (err) {
                console.log(err)
            }
        })
        req.flash("message", "Successfully deleted item")
        req.flash("error", false)

        res.redirect("/")
    } else {
        List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemId } } }, function (err, foundList) {
            if (!err) {
                req.flash("message", "Successfully deleted item")
                req.flash("error", false)
                res.redirect("/" + listName)
            }
        })
    }
})


app.get("/about", function (req, res) {
    res.render("about")
})



app.listen(3000, function () {
    console.log("Server started on port 3000")
})