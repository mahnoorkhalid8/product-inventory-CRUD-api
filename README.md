# Product Inventory CRUD API

Backend-only CRUD API built with Node.js, Express.js, MongoDB (Atlas), and Mongoose.
Includes JWT authentication, image upload (Multer), request validation, filtering/search/sort/pagination,
an aggregation endpoint, centralized error handling, and security middleware.

## Folder Structure

```
Product-Inventory-CRUD-API/
├── server.js                  # Entry point
├── .env                        # Environment variables (not committed)
├── .env.example                 # Template for environment variables
├── package.json
└── src/
    ├── app.js                  # Express app setup
    ├── config/
    │   └── db.js                # MongoDB connection
    ├── models/
    │   ├── User.js
    │   └── Product.js
    ├── controllers/
    │   ├── authController.js
    │   └── productController.js
    ├── routes/
    │   ├── authRoutes.js
    │   └── productRoutes.js
    ├── middlewares/
    │   ├── auth.js               # JWT protect middleware
    │   ├── validate.js           # express-validator error handler
    │   ├── upload.js              # Multer config
    │   ├── notFound.js
    │   └── errorHandler.js        # Centralized error handler
    ├── utils/
    │   ├── catchAsync.js
    │   └── generateToken.js
    └── uploads/                  # Uploaded product images
```

## Setup

1. Install dependencies (already done if you ran this scaffold yourself):
   ```
   npm install
   ```

2. Create a MongoDB Atlas free cluster and get your connection string (see steps below), then
   edit `.env` and replace `MONGO_URI` with your real connection string. Also set a strong
   random value for `JWT_SECRET`.

3. Start the server:
   ```
   npm run dev
   ```
   (uses nodemon, auto-restarts on file changes) or `npm start` for a plain run.

4. You should see:
   ```
   MongoDB connected: <your-cluster-host>
   Server running in development mode on port 5000
   ```

## MongoDB Atlas Setup (one-time)

1. Sign up at https://www.mongodb.com/cloud/atlas/register
2. Create a free M0 cluster.
3. Database Access → Add a database user (username + password).
4. Network Access → Add IP Address → Allow Access from Anywhere (0.0.0.0/0) for development.
5. Connect → Drivers → Node.js → copy the connection string.
6. Paste it into `.env` as `MONGO_URI`, filling in your username/password and adding a database
   name, e.g.:
   ```
   MONGO_URI=mongodb+srv://myuser:mypass@cluster0.xxxxx.mongodb.net/productInventoryDB?retryWrites=true&w=majority
   ```

## API Endpoints

| Method | Endpoint                        | Protected | Description                              |
|--------|----------------------------------|-----------|-------------------------------------------|
| POST   | /api/auth/register               | No        | Register a new user                       |
| POST   | /api/auth/login                  | No        | Login, returns JWT token                   |
| GET    | /api/products                    | No        | List products (filter/search/sort/paginate)|
| GET    | /api/products/:id                | No        | Get a single product                       |
| POST   | /api/products                    | Yes       | Create product (multipart/form-data, field `image`) |
| PUT    | /api/products/:id                | Yes       | Update product (optional new image)        |
| DELETE | /api/products/:id                | Yes       | Delete product                             |
| GET    | /api/products/stats/summary      | No        | Aggregation: count & avg price by category |

### Query params for GET /api/products
- `category=electronics`
- `search=phone` (matches product name, case-insensitive)
- `sortBy=price` or `sortBy=createdAt`
- `order=asc` or `order=desc`
- `page=1&limit=10`

## Testing with Postman / Thunder Client

1. **Register**: POST `http://localhost:5000/api/auth/register`
   Body (JSON): `{ "name": "Fahad", "email": "fahad@example.com", "password": "secret123" }`

2. **Login**: POST `http://localhost:5000/api/auth/login`
   Body (JSON): `{ "email": "fahad@example.com", "password": "secret123" }`
   Copy the `token` from the response.

3. **Create product** (protected): POST `http://localhost:5000/api/products`
   Headers: `Authorization: Bearer <token>`
   Body: `form-data` with fields `name`, `description`, `price`, `category`, `stock`, and
   a file field named `image`.

4. **Get all products**: GET `http://localhost:5000/api/products?category=electronics&search=phone&sortBy=price&order=asc&page=1&limit=5`

5. **Get single product**: GET `http://localhost:5000/api/products/<productId>`

6. **Update product** (protected): PUT `http://localhost:5000/api/products/<productId>`
   Headers: `Authorization: Bearer <token>`
   Body: `form-data` or JSON with fields to update.

7. **Delete product** (protected): DELETE `http://localhost:5000/api/products/<productId>`
   Headers: `Authorization: Bearer <token>`

8. **Stats**: GET `http://localhost:5000/api/products/stats/summary`

Take a screenshot of each request/response, plus the terminal output, and the MongoDB Atlas
collection view, and paste them into the submission Word document.
