import express from 'express'
import bodyParser from 'body-parser'
import Postgres from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const databaseConfig = { connectionString: process.env.DATABASE_URL };
const pool = new Postgres.Pool(databaseConfig);

const getProducts = (request, response) => {
  const ids = JSON.parse(request.query.ids ?? '[]');
  if (ids.length > 0) {
    pool.query('SELECT * FROM products WHERE id = ANY($1::text[])', [ids], (error, results) => {
      if (error) {
        throw error
      }
      response.status(200).json(results.rows)
    })
  } else {
    pool.query('SELECT * FROM products ORDER BY id ASC', (error, results) => {
      if (error) {
        throw error
      }
      response.status(200).json(results.rows)
    })
  }
}

const getProductById = (request, response) => {
  const { id } = request.params

  pool.query('SELECT * FROM products WHERE id = $1', [id], (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
}

const port = 3000
const app = express()

app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)

app.get('/', getProducts)
app.get('/products', getProducts)
app.get('/products/:id', getProductById)

app.listen(port, () => {
  console.log(`App running on port ${port}.`)
})
