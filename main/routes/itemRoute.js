import { Router } from "express";
import getItems from "../../prisma/itemsData.js";
import { addItems } from "../../prisma/itemsData.js";
import { updateItem } from "../../prisma/itemsData.js";
import { updateItemPhotos } from "../../prisma/itemsData.js";
import authorize from "../rbac.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = Router();

router.get("/items", async (req, res)=> {
try {
        const searchTerm = req.query.search || "";
        const items = await prisma.item.findMany({
            where: {
                title: {
                    contains: searchTerm,
                },
            },
            include: {
                photos: true,
                seller: true,
                admin: true,
            },
        });
        res.json(items);
    } catch (error) {
        console.error("Error fetching items:", error);
        res.status(500).json({ error: "Failed to fetch items" });
    }
});

router.get("/items/categories", async (req,res) =>{
    try {
        const distinctCategories = await prisma.item.findMany({
            select: {
                category: true, // Select only the category field
            },
            distinct: ['category'], // Ensure categories are distinct
        });
        const categories = distinctCategories.map(item => item.category);
        res.json(categories);
    } catch (error) {
        res.status(500).json({error: "Failed to fetch categories"});
    }
})

router.get("/items/categories/:category", async (req,res) => {
    const category = req.params.category;
    try {
        const products = await prisma.item.findMany({
            where: {
                category: category, // Filter by the specified category
            },
        });
        res.json(products);
    } catch (error) {
        res.status(500).json({error: 'Failed to fetch the category items'})
    }
});

//keep this last, as :id can conflict with stuff like "categories"
router.get("/items/:id", async (req, res)=> {
    try {
        const id = parseInt(req.params.id);
        const item =  await prisma.item.findUnique({
            where: { id },
            })
        res.json(item);
    } catch (error) {
        console.log("Error fetching items", error);
        res.status(500).json({ error: "Failed to fetch item" });
    }
});

router.post('/addItems',authorize(['post_item']), async (req, res) => {
    try {
        const newItems = req.body; 
        const result = await addItems(newItems); 
        res.status(201).json(result);
    } catch (error) {
        console.error("Error adding item:", error);
        res.status(500).json({ error: 'Failed to add item' });
    }
});

router.put('/items/:id',authorize(['post_item']), async (req, res) => {
    const itemId = parseInt(req.params.id); 
    const { field, value, photos } = req.body; 

    try {
        // Check if there are fields to update
        if (field && value !== undefined) {
            await updateItem(itemId, field, value);
        }

        // If photos are provided, update them
        if (photos && Array.isArray(photos)) {
            await updateItemPhotos(itemId, photos);
        }

        return res.status(200).json({ message: 'Item updated successfully' });
    } catch (error) {
        console.error("Error updating item:", error);
        return res.status(500).json({ error: 'Failed to update item' });
    }
});

export default router;
