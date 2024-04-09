const express = require('express');
const router = express.Router();
const connection = require('./db');
const { addRequestId, logRequest,validateQueryParams} = require('./middleware')

const getAllWishlist = async (req, res) => {
    try {
        const { limit, offset } = req.query
        // console.log(req)
        if (!limit && !offset) {
            throw new Error(`Both limit and offset must be provided.`);
        } else if (!limit) {
            throw new Error(`Limit must be provided.`);
        } else if (!offset) {
            throw new Error(`Offset must be provided.`);
        }

        const getMethod = `select p.name,p.description,p.image,p.rating,p.price,p.discount,p.is_active,p.type,s.name from products as p join product_size as ps on p.product_id = ps.product_id
        join sizes as s on s.size_id = ps.size_id
        LIMIT ? OFFSET ?`;

        // Execute the query
        const [query] = await connection
            .promise()
            .execute(getMethod, [limit, offset]);

        res.status(200).send({ result: query })

    } catch (e) {
        console.error(e)
        res.status(500).send({ message: 'Internal Server Error' });
        // next(e);
    }
}

const deleteWishlist = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            res.status(400).send('ID is required')
        }
        const softDelete = `delete from wishlist where wishlist_id = ?`;

        const [result] = await connection
            .promise()
            .execute(softDelete, [id]);

        res.status(200).send({ message: "Deleted Successfully" })
    } catch (e) {
        console.error(e);
        res.status(500).send({ message: 'Internal server error' });
        // next(e)
    }
};

const addWishlist = async (req, res) => {
    try {
        const { user_id, product_id, is_active, quantity } = req.body;

        if (!user_id || !product_id) {
            return res.status(400).json({ message: "User ID and Product ID are required." })
        }
        const query = `insert into  wishlist (user_id, product_id,is_active,quantity) values(?,?,?,?)`;

        const [results] = await connection
            .promise()
            .execute(query, [user_id, product_id, is_active, quantity])
        res.status(201).send({ message: "Created Successfully!", data: results, });

    } catch (e) {
        console.log(e)
        res.status(500).send({ message: "Internal Server Error" })
    }
}

const updateWishlist = async (req, res) => {
    try {
        const { quantity } = req.body;
        const { id } = req.params

        // console.log(req.params.id);
        // console.log(req.body.quantity)
        if (!id) {
            return res.status(400).json({ message: "Id is required" });
        }

        console.log(id)
        const query = `update wishlist set quantity = ? where product_id= ?`;

        const [results] = await connection
            .promise()
            .execute(query, [id, quantity]);
        console.log(results)

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: "Product not found in wishlist" });
        }

        res.status(200).send({ message: 'Successfully updated' })
    }
    catch (e) {
        console.error(e);
        res.status(500).send({ message: e.message });
    }

}

router.get('/wishlist',logRequest, getAllWishlist);
router.delete('/wishlist/:id',logRequest, deleteWishlist);
router.post('/wishlist',logRequest, addWishlist)
router.put('/wishlist/:id',logRequest, updateWishlist)

module.exports = router;