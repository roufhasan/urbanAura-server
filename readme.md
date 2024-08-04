# UrbanAura E-Commerce Server

Welcome to the [UrbanAura](https://urbanaurafurniture.web.app/) E-Commerce Backend repository! This is the backend of the UrbanAura e-commerce platform, built using the MERN Stack (MongoDB, ExpressJS, React, NodeJS). Check out the frontend repository [here](https://github.com/roufhasan/urbanAura-client).

## Table of Contents

- [Project Link](#project-links)

- [About the Project](#about-the-project)

- [Features](#features)

- [Technologies Used](#technologies-used)

- [Installation](#installation)

- [Usage](#usage)

- [API Endpoints](#api-endpoints)

- [Contact](#contact)

## Project Links

Frontend Repository: [UrbanAura Client](https://github.com/roufhasan/urbanAura-client)

Live Link: [UrbanAura](https://urbanaurafurniture.web.app/)

## About the Project

[UrbanAura](https://urbanaurafurniture.web.app/) is an e-commerce platform designed to provide a seamless shopping experience. This project is a server built using ExpressJS and MongoDB to handle various functionalities essential for managing an online store, from handling products and reviews to managing carts and processing payments.

## Features

- **Product Management**: Add, update, delete, and view products.

- **Review System**: Allow users to review products.

- **Cart Management**: Add items to the cart, update quantities, and remove items.

- **Favorites**: Manage a list of favorite products.

- **Payment System**: Process payments securely.

- **Admin Order Management**: Admins can manage and update order statuses.

## Technologies Used

- **Backend**: ExpressJS

- **Database**: MongoDB

- **Authentication**: JWT

- **Payment Processing**: Stripe

## Installation

To get a local copy up and running, follow these steps:

1. **Clone the repository**

```sh
git clone https://github.com/roufhasan/urbanAura-server.git
```

2. **Install dependencies**

```sh
cd urbanAura-server
npm install
```

3. **Set up environment variables**

Create a .env file in the root directory and add your MongoDB Database Username, Password, Stripe payment and Access token secret key.

```sh
cd urbanAura-server
npm install
```

4. **Start the server**

```sh
npm start
```

## Usage

After installing the necessary dependencies and setting up environment variables, you can start the server and test the API endpoints using tools like Postman or Insomnia. Some API endpoints may require the removal of JWT verification for testing purposes.

## API Endpoints

Here's a brief overview of the available API endpoints:

### Products

- `GET /products`: Get all products

- `Get /products/:id`: Get a single product

- `Get /search/:key`: Get products that match the search key

### Reviews

- `GET /reviews?product_id={id}`: Get all reviews of a product

- `POST /reviews`: Post a review for a product (secured with JWT & User verification)

- `DELETE /reviews`: Delete a review from a product (secured with JWT & User verification)

### Carts (secured with JWT & User verification)

- `GET /carts?userEmail={email}`: Get the cart items for the specified user

- `PUT /carts`: Add a new item to the cart or update the quantity of an existing item

- `PATCH /carts/cart_quantity`: Update the quantity of a specific item in the cart

- `DELETE /carts`: Delete a specific item from the cart

### Favorites (secured with JWT & User verification)

- `GET /favourites?userEmail={email}`: Get the favourite items for the specified user

- `POST /favourites`: Add a new item to the user's favourites.

- `DELETE /favourites`: Delete an item from the user's favourites

### Payments (secured with JWT & User verification)

- `POST /payments/create-payment-intent`: Creates a payment intent with Stripe for processing payments

### Admin (secured with JWT & Admin verification)

- `GET /admin/orders`: Get a list of all orders

- `PUT /admin/orders/:id/status`: Update the status of a specific order

- `POST /admin/products`: Add a new product

- `PUT admin/products`: Update details of an existing product

- `DELETE admin/products/:id`: Delete a specific product from the products

## Contact

**Email**: [roufhasan5@gmail.com](mailto:roufhasan5@gmail.com)

**LinkedIn**: [www.linkedin.com/in/rouf-hasan-hridoy](www.linkedin.com/in/rouf-hasan-hridoy)

**Portfolio**: [https://roufhasanhridoy.netlify.app/](https://roufhasanhridoy.netlify.app/)
