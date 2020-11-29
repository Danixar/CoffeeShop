# TABLE CREATION COMMANDS

### MENU_ITEMS

```
CREATE TABLE IF NOT EXISTS menu_items(
     menu_id int NOT NULL AUTO_INCREMENT,
     name VARCHAR(50) NOT NULL,
     size VARCHAR(50) NOT NULL,
     price DECIMAL(15,2) NOT NULL,
     description VARCHAR(1000),
     removed BOOLEAN default 0,
     PRIMARY KEY (menu_id)
     );
```

`INSERT INTO menu_items(name, size, price, description) VALUES ();`

### EMPLOYEES

```
CREATE TABLE IF NOT EXISTS employees(
     employee_id int NOT NULL AUTO_INCREMENT,
     first_name VARCHAR(50) NULL,
     last_name VARCHAR(50) NOT NULL,
     email VARCHAR(50) NOT NULL,
     password VARCHAR(50) NOT NULL,
     UNIQUE (email),
     PRIMARY KEY (employee_id)
     );
```

`INSERT INTO employees (last_name, email, password) VALUES ('root', 'root', 'root');`

### CUSTOMERS

```
CREATE TABLE IF NOT EXISTS customers(
     customer_id int NOT NULL AUTO_INCREMENT,
     first_name VARCHAR(50) NULL,
     last_name VARCHAR(50) NOT NULL,
     email VARCHAR(50) NOT NULL,
     password VARCHAR(50) NOT NULL,
     UNIQUE (email),
     PRIMARY KEY (customer_id)
     );
```

`INSERT INTO customers (last_name, email, password) VALUES ('root', 'root', 'root');`

### ORDERS

```
CREATE TABLE IF NOT EXISTS orders(
     order_id int NOT NULL AUTO_INCREMENT,
     customer_id int NOT NULL,
     cancelled BOOLEAN default 0,
     created_at TIMESTAMP NULL,
     completed Boolean default 0,
     PRIMARY KEY (order_id)
     );
```

### ORDERED_ITEMS

```
CREATE TABLE IF NOT EXISTS ordered_items(
     item_id int NOT NULL AUTO_INCREMENT,
     menu_id int NOT NULL,
     order_id int NOT NULL,
     quantity int NOT NULL default 1,
     PRIMARY KEY (item_id)
     );
```

### TOKENS

```
CREATE TABLE IF NOT EXISTS tokens(
    token int NOT NULL AUTO_INCREMENT PRIMARY KEY,
    customer boolean NOT NULL default 1,
    user_id int NOT NULL,
    last_used timestamp NOT NULL
    );
```

### READY_CUSTOMERS

```
CREATE TABLE IF NOT EXISTS ready_orders(
    ready_id int NOT NULL AUTO_INCREMENT PRIMARY KEY,
    customer_id int NOT NULL,
    name VARCHAR(100) NOT NULL,
    order_id int NOT NULL,
    posted timestamp NOT NULL
    );
```
