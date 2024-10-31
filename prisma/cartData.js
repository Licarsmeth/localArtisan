import { PrismaClient } from "@prisma/client";
import { clear } from "console";

const prisma = new PrismaClient();

async function addToCart(userId, productId, quantity) {
  const item = await prisma.item.findUnique({
    where: { id: productId },
  });

  if (!item) {
    throw new Error("Product does not exist.");
  }

  // Retrieve the user's cart
  const cart = await prisma.cart.findUnique({
    where: { userId: userId },
    include: { products: true },
  });

  // Determine existing quantity in the cart for this product
  const existingProduct = cart
    ? cart.products.find((p) => p.productId === productId)
    : null;
  const currentQuantityInCart = existingProduct ? existingProduct.quantity : 0;
  if (item.inStock < quantity + currentQuantityInCart) {
    throw new Error("Not enough stock available.");
  }

  if (cart) {
    const existingProduct = cart.products.find(
      (p) => p.productId === productId
    );
    if (existingProduct) {
      await prisma.cartProduct.update({
        where: { id: existingProduct.id },
        data: { quantity: existingProduct.quantity + quantity },
      });
    } else {
      await prisma.cartProduct.create({
        data: {
          cartId: cart.id,
          productId: productId,
          quantity: quantity,
        },
      });
    }
  } else {
    const newCart = await prisma.cart.create({
      data: {
        userId: userId,
        products: {
          create: {
            productId: productId,
            quantity: quantity,
          },
        },
      },
    });

}
await prisma.item.update({
  where: { id: productId },
  data: { inStock: item.inStock - quantity },
});
}

async function checkoutCart(userId) {
  const cart = await prisma.cart.findUnique({
    where: { userId: userId },
    include: { products: true },
  });

  if (!cart || cart.products.length === 0) {
    throw new Error("Cart is empty or does not exist.");
  }

  // Process payment and create order logic here...
  //jastai processPayment(cart);

  await prisma.cartProduct.deleteMany({
    where: { cartId: cart.id },
  });

  await prisma.cart.delete({
    where: { id: cart.id },
  });

  return { message: "Checkout successful. Your cart has been cleared." };
}

async function modifyCart(userId, productId, newQuantity) {
    const cart = await prisma.cart.findUnique({
        where: { userId: userId },
        include: { products: true }
    });

    if (!cart) {
        throw new Error("Cart does not exist.");
    }

    const existingProduct = cart.products.find(p => p.productId === productId);

    if (!existingProduct) {
        throw new Error("Product not found in cart.");
    }

    // Determine the difference in quantity
    const currentQuantity = existingProduct.quantity;
    
    if (newQuantity > currentQuantity) {
        const additionalQuantity = newQuantity - currentQuantity;

        // Check if there's enough stock before updating
        const item = await prisma.item.findUnique({ where: { id: productId } });
        
        if (item.inStock < additionalQuantity) {
            throw new Error("Not enough stock available.");
        }

        // Update stock for additional items being added to the cart
        await prisma.item.update({
            where: { id: productId },
            data: { inStock: item.inStock - additionalQuantity }
        });
        
        // Update quantity in the cart
        await prisma.cartProduct.update({
            where: { id: existingProduct.id },
            data: { quantity: newQuantity }
        });
        
    } else if (newQuantity < currentQuantity) {
        const removedQuantity = currentQuantity - newQuantity;

        // Restore stock for removed items
        await prisma.item.update({
            where: { id: productId },
            data: { inStock: { increment: removedQuantity } } // Increase stock
        });

        // Update quantity in the cart
        await prisma.cartProduct.update({
            where: { id: existingProduct.id },
            data: { quantity: newQuantity }
        });
        
    } else {
         // If quantities are equal, do nothing.
         return;
     }
}


async function viewCart(userId) {
  const cart = await prisma.cart.findUnique({
    where: { userId: userId },
    include: {
      products: {
        include: {
          product: true, // Assuming you want to include product details
        },
      },
    },
  });

  if (!cart) {
    return { message: "Cart is empty or does not exist." };
  }

  const items = cart.products.map((item) => ({
    productId: item.productId,
    quantity: item.quantity,
    title: item.product.title,
    price: item.product.price,
  }));

  console.log(items);
  return items;
}

//unlike checkoutCart, doesn't delete the cart itself. Just cleans it up.
async function clearCart(userId) {
  const cart = await prisma.cart.findUnique({
    where: { userId: userId },
  });

  if (!cart) {
    throw new Error("Cart does not exist.");
  }

  await prisma.cartProduct.deleteMany({
    where: { cartId: cart.id },
  });

  return { message: "Cart has been cleared." };
}

//again, doesn't delete the cart.
async function removeFromCart(userId, productId) {
  const cart = await prisma.cart.findUnique({
    where: { userId: userId },
    include: { products: true },
  });

  if (!cart) {
    throw new Error("Cart does not exist.");
  }

  const existingProduct = cart.products.find((p) => p.productId === productId);

  if (!existingProduct) {
    throw new Error("Product not found in cart.");
  }

  // Increase stock before removing from cart
  await prisma.item.update({
    where: { id: productId },
    data: { inStock: { increment: existingProduct.quantity } } // Restore stock
});

  await prisma.cartProduct.delete({
    where: { id: existingProduct.id },
  });

  return { message: "Product removed from cart." };
}

async function getTotalPrice(userId) {
  const cart = await prisma.cart.findUnique({
    where: { userId: userId },
    include: {
      products: {
        include: {
          product: true, // Assuming you want to access product details
        },
      },
    },
  });

  if (!cart || cart.products.length === 0) {
    return { totalPrice: 0 };
  }

  const totalPrice = cart.products.reduce((total, item) => {
    return total + item.quantity * item.product.price;
  }, 0);
  console.log(totalPrice);
  return { totalPrice };
}
