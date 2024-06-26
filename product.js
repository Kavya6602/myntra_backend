const express = require('express');
const router = express.Router();
const connection = require('./db');
const { addRequestId, logRequest,validateQueryParams} = require('./middleware')

const productId = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            res.status(400).send({ error: " product ID required" })
        }
        console.log(req.params.product_id)
        const query = `select p.name,p.description,p.image,p.rating,p.price,p.discount,p.is_active,p.type,s.name from products as p 
        join product_size as ps on p.product_id = ps.product_id
        join sizes as s on ps.size_id = s.size_id where p.product_id = ?`;
        const [results] = await connection.promise().execute(query, [id || null]);

        if (results.length === 0) {
            return res.status(404).send({ error: "Product not found" }); // Return if product with given ID doesn't exist
        }

        res.status(200).send({ message: 'Success', product: results[0] })

    } catch (e) {
        console.error(e);
        res.status(500).send({ message: 'Internal server error' })
    }
}

const getAllProducts = async (req, res) => {
    try {
        const { type, minPrice, maxPrice, limit, offset, sort } = req.query;

        if (!limit && !offset) {
            throw new Error(`Both limit and offset must be provided.`);
        } else if (!limit) {
            throw new Error(`Limit must be provided.`);
        } else if (!offset) {
            throw new Error(`Offset must be provided.`);
        }

        let filterData = [];
        let filter = [];

        if (type) {
            filterData.push('type = ?');
            filter.push(type);
        }

        if (minPrice) {
            filterData.push('price >= ?');
            filter.push(minPrice);
        }

        if (maxPrice) {
            filterData.push('price <= ?');
            filter.push(maxPrice);
        }

        let filterString = '';
        if (filterData.length) {
            filterString = `WHERE ${filterData.join(' and ')}`;
        }

        let sortString = '';
        if (sort) {
            const validSortOrders = ['asc', 'desc'];
            const sortOrder = validSortOrders.includes(sort.toLowerCase()) ? sort.toUpperCase() : 'ASC';
            sortString = `ORDER BY price ${sortOrder}`;
        }

        const getMethod = `SELECT name, description, image, rating, price, discount, is_active, type FROM products ${filterString} ${sortString} LIMIT ? OFFSET ?`;

        const [query] = await connection
            .promise()
            .execute(getMethod, [...filter, limit, offset]);

        res.status(200).send({ message: 'All products', result: query });
        console.log(query);
    } catch (e) {
        console.error(e);
        res.status(500).send({ message: 'Internal Server Error' });
    }
};


router.get('/productid/:id',logRequest, productId);
router.get("/product",logRequest, getAllProducts);

module.exports = router;