import { Router } from "express";
import { addToCart, checkoutCart, modifyCart, viewCart, clearCart, removeFromCart, getTotalPrice } from "../../prisma/cartData.js";
const router = Router();

router.post('/add', async (req, res) => {
    const { userId, productId, quantity } = req.body;
    try {
      const result = await addToCart(userId, productId, quantity);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  router.post('/checkout', async (req, res) => {
    const { userId } = req.body;
    try {
      const result = await checkoutCart(userId);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  router.put('/modify', async (req, res) => {
    const { userId, productId, quantity } = req.body;
    try {
      const result = await modifyCart(userId, productId, quantity);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  //view?userId = 123
  router.get('/view', async (req, res) => {
    const  userId  = parseInt(req.query.userId); 
    console.log(userId);
    try {
      const result = await viewCart(userId);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  router.post('/clear', async (req, res) => {
    const { userId } = req.body;
    try {
      const result = await clearCart(userId);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  router.post('/remove', async (req, res) => {
    const { userId, productId } = req.body;
    try {
      const result = await removeFromCart(userId, productId);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });


  //total?userId = 123
  router.get('/total', async (req, res) => {
    const  userId  = parseInt(req.query.userId); 
    try {
      const totalPrice = await getTotalPrice(userId);
      res.status(200).json({ totalPrice });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  export default router;