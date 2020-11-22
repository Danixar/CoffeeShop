Create or Switch Database
`use coffeeShop`

Create Collection
` db.createCollection('menu')`
` db.createCollection('users')`
` db.createCollection('orders')`
` db.createCollection('tokens')`

Drop Collection
`db.menu.drop()`

Insert Row

```
db.menu.insert({
    name: 'Orange Mocha Frappuchino',
    size: 'Tio Grande',
    price: 19.99,
    time_required: 10,
    description: 'Expensive',
    removed: false,
    date: Date()
})
```

```
db.users.insert({
    first_name: 'Evan',
    last_name: 'Wiegers',
    email: 'root',
    password: 'root',
    customer: false,
    date: Date()
})
```

```
db.orders.insert({
    customer: {
        first_name: 'Tim',
        last_name: 'Eric',
        customer_id = Object('blah1243546676')
    },
    items: [
        {
            item_id: ObjectID('496809340'),
            quantity: 3
        },
        {
            item_id: ObjectID('90540969420'),
            quantity: 1
        }
    ],
    cancelled: false,
    created_at: Date(),
    finished_at: Date() + 10,
    completed: false,
    notified_customer: false
})
```

```
db.token.insert({
    user: {
        user_id: ObjectID('09557680393'),
        customer: true
    },
    token: '89583402-1498598'
    last_used: Date()
})
```

Get All Rows
`db.menu.find().pretty()`

Find Rows
`db.menu.find({size: 'Tio Grande'}).pretty()`

Sort Rows
`db.menu.sort({name: 1}).pretty()`
1 is ascending, -1 for descending

Count Rows
`db.menu.count()`

limit records
`db.menu.find({name: 'Orange Mocha Frappucino'}).limit(1).pretty()`
`db.menu.findOne({name: 'Orange Mocha Frappucino'})`

For Each
`db.menu.find().forEach(function(doc) { print('Option: ' + doc.name)})`

Update Row

```
db.menu.update({ _id: ObjectID("85656093402230-0")},
    {
        $set: {
            removed: true,
            removed_at: Date()
        }
    }
)
```

Delete Row
`db.menu.remove({ name: 'Orange Mocha Frappucino' })`
