import { Router } from "express";
import authorize from "../rbac.js";
import getUsers from "../../prisma/usersData.js";
const router = Router();

router.get("/allUsers",authorize(['see_item', 'warn']), async (req, res)=> {
    try {
        const users = await getUsers();
        res.json(users);
    } catch (error) {
        console.log("Error fetching users", error);
        res.status(500).json({ error: "Failed to fetch users" });
    }
});

export default router;