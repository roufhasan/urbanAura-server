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

- `GET /api/products`: Get all products

- `POST /api/products`: Add a new product

- `PUT /api/products/:id`: Update a product

- `DELETE /api/products/:id`: Delete a product

### Reviews

- `POST /api/products/:id/review`: Add a review to a product

### Carts

- `GET /api/carts`: Get user's cart

- `POST /api/carts`: Add an item to the cart

- `PUT /api/carts/:id`: Update cart item quantity

- `DELETE /api/carts/:id`: Remove an item from the cart

### Favorites

- `GET /api/favorites`: Get user's favorite products

- `POST /api/favorites`: Add a product to favorites

- `DELETE /api/favorites/:id`: Remove a product from favorites

### Payments

- `POST /api/payments`: Process a payment

### Admin

- `GET /api/admin/orders`: Get all orders

- `PUT /api/admin/orders/:id`: Update order status

- `POST /api/admin/products`: Add a new product

## Contact

**Email**: [roufhasan5@gmail.com](mailto:roufhasan5@gmail.com)

**LinkedIn**: [www.linkedin.com/in/rouf-hasan-hridoy](www.linkedin.com/in/rouf-hasan-hridoy)

**Portfolio**: [https://roufhasanhridoy.netlify.app/](https://roufhasanhridoy.netlify.app/)
