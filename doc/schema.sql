-- ----------------------------------------------------------
-- Script MYSQL complet (Pizzeria)
-- ----------------------------------------------------------

-- ----------------------------
-- Table: allergen
-- ----------------------------
CREATE TABLE allergen (
  id_allergen INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  CONSTRAINT allergen_PK PRIMARY KEY (id_allergen)
) ENGINE=InnoDB;

-- ----------------------------
-- Table: ingredient
-- ----------------------------
CREATE TABLE ingredient (
  id_ingredient INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  extra_cost DECIMAL(10,2) NOT NULL,
  is_available TINYINT(1) NOT NULL,
  CONSTRAINT ingredient_PK PRIMARY KEY (id_ingredient)
) ENGINE=InnoDB;

-- ----------------------------
-- Table: drink
-- ----------------------------
CREATE TABLE drink (
  id_drink INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  volume_cl INT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  is_available TINYINT(1) NOT NULL,
  CONSTRAINT drink_PK PRIMARY KEY (id_drink)
) ENGINE=InnoDB;

-- ----------------------------
-- Table: restaurant_table
-- ----------------------------
CREATE TABLE restaurant_table (
  id_table INT NOT NULL,
  table_number INT NOT NULL,
  capacity INT NOT NULL,
  CONSTRAINT restaurant_table_PK PRIMARY KEY (id_table)
) ENGINE=InnoDB;

-- ----------------------------
-- Table: pizza
-- ----------------------------
CREATE TABLE pizza (
  id_pizza INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  base_price DECIMAL(10,2) NOT NULL,
  image_url VARCHAR(255) NOT NULL,
  is_available TINYINT(1) NOT NULL,
  CONSTRAINT pizza_PK PRIMARY KEY (id_pizza)
) ENGINE=InnoDB;

-- ----------------------------
-- Table: dessert
-- ----------------------------
CREATE TABLE dessert (
  id_dessert INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  is_available TINYINT(1) NOT NULL,
  CONSTRAINT dessert_PK PRIMARY KEY (id_dessert)
) ENGINE=InnoDB;

-- ----------------------------
-- Table: user_account
-- ----------------------------
CREATE TABLE user_account (
  id_user INT NOT NULL,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  loyalty_points INT NOT NULL,
  is_admin TINYINT(1) NOT NULL,
  CONSTRAINT user_account_PK PRIMARY KEY (id_user)
) ENGINE=InnoDB;

-- ----------------------------
-- Table: address
-- ----------------------------
CREATE TABLE address (
  id_address INT NOT NULL,
  street VARCHAR(255) NOT NULL,
  zip_code VARCHAR(255) NOT NULL,
  city VARCHAR(255) NOT NULL,
  id_user INT NOT NULL,
  CONSTRAINT address_PK PRIMARY KEY (id_address),
  CONSTRAINT address_user_account_FK FOREIGN KEY (id_user) REFERENCES user_account(id_user)
) ENGINE=InnoDB;

-- ----------------------------
-- Table: reservation
-- ----------------------------
CREATE TABLE reservation (
  id_reservation INT NOT NULL,
  reservation_date DATE NOT NULL,
  reservation_time TIME NOT NULL,
  guest_count INT NOT NULL,
  status VARCHAR(255) NOT NULL,
  id_user INT NOT NULL,
  id_table INT NOT NULL,
  CONSTRAINT reservation_PK PRIMARY KEY (id_reservation),
  CONSTRAINT reservation_user_account_FK FOREIGN KEY (id_user) REFERENCES user_account(id_user),
  CONSTRAINT reservation_restaurant_table_FK FOREIGN KEY (id_table) REFERENCES restaurant_table(id_table)
) ENGINE=InnoDB;

-- ----------------------------
-- Table: customer_order
-- ----------------------------
CREATE TABLE customer_order (
  id_order INT NOT NULL,
  order_date DATETIME NOT NULL,
  status VARCHAR(255) NOT NULL,
  invoice_number VARCHAR(255) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  order_type VARCHAR(255) NOT NULL,
  id_user INT NOT NULL,
  CONSTRAINT customer_order_PK PRIMARY KEY (id_order),
  CONSTRAINT customer_order_user_account_FK FOREIGN KEY (id_user) REFERENCES user_account(id_user)
) ENGINE=InnoDB;

-- ----------------------------
-- Table: order_line
-- ----------------------------
-- id_pizza, id_drink et id_dessert peuvent être NULL (une ligne = un seul article)
CREATE TABLE order_line (
  id_order_line INT NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  id_order INT NOT NULL,
  id_pizza INT NULL,
  id_drink INT NULL,
  id_dessert INT NULL,
  CONSTRAINT order_line_PK PRIMARY KEY (id_order_line),
  CONSTRAINT order_line_customer_order_FK FOREIGN KEY (id_order) REFERENCES customer_order(id_order),
  CONSTRAINT order_line_pizza_FK FOREIGN KEY (id_pizza) REFERENCES pizza(id_pizza),
  CONSTRAINT order_line_drink_FK FOREIGN KEY (id_drink) REFERENCES drink(id_drink),
  CONSTRAINT order_line_dessert_FK FOREIGN KEY (id_dessert) REFERENCES dessert(id_dessert)
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- Tables de jointure
-- ----------------------------------------------------------

-- ----------------------------
-- Table: has_allergen
-- ----------------------------
CREATE TABLE has_allergen (
  id_allergen INT NOT NULL,
  id_ingredient INT NOT NULL,
  CONSTRAINT has_allergen_PK PRIMARY KEY (id_allergen, id_ingredient),
  CONSTRAINT has_allergen_allergen_FK FOREIGN KEY (id_allergen) REFERENCES allergen(id_allergen),
  CONSTRAINT has_allergen_ingredient_FK FOREIGN KEY (id_ingredient) REFERENCES ingredient(id_ingredient)
) ENGINE=InnoDB;

-- ----------------------------
-- Table: pizza_recipe
-- ----------------------------
CREATE TABLE pizza_recipe (
  id_ingredient INT NOT NULL,
  id_pizza INT NOT NULL,
  CONSTRAINT pizza_recipe_PK PRIMARY KEY (id_ingredient, id_pizza),
  CONSTRAINT pizza_recipe_ingredient_FK FOREIGN KEY (id_ingredient) REFERENCES ingredient(id_ingredient),
  CONSTRAINT pizza_recipe_pizza_FK FOREIGN KEY (id_pizza) REFERENCES pizza(id_pizza)
) ENGINE=InnoDB;

-- ----------------------------
-- Table: line_supplement
-- ----------------------------
CREATE TABLE line_supplement (
  id_ingredient INT NOT NULL,
  id_order_line INT NOT NULL,
  quantity INT NOT NULL,
  CONSTRAINT line_supplement_PK PRIMARY KEY (id_ingredient, id_order_line),
  CONSTRAINT line_supplement_ingredient_FK FOREIGN KEY (id_ingredient) REFERENCES ingredient(id_ingredient),
  CONSTRAINT line_supplement_order_line_FK FOREIGN KEY (id_order_line) REFERENCES order_line(id_order_line)
) ENGINE=InnoDB;
