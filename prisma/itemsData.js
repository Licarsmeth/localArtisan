import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const itemsData = [
  {"id":4,"title":"Nepali Ornaments","description":"Handmade,Unique and fine design made with care. Nice for your wife","price":2500,"rating":3.4444444444444446,"category":"Gold and oraments","inStock":1,"sellerId":1,"adminId":null,
    "photos":[{"url":"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTMS3I8T-5HEDIMV5KcwAPMdg1F1UhkVpfz5A&s"}]
    },
    
    {"id":5,"title":"Nepali Old man","description":"useless old man","price":220,"rating":3.5384615384615383,"category":"Men and Womens","inStock":3,"sellerId":1,"adminId":null,"photos":[{"url":"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQzkvdcqPTqTKUKJC5DvNoeONzYS3Y6MgGr0w&s"},{"url":"https://media.gettyimages.com/id/117145008/photo/nepalese-couple.jpg?s=612x612&w=gi&k=20&c=LeaDtBHrQQ0dCvd6ZjqncDsOjtvtJZ6sYDbdEziWztk="}]},
    
    {"id":7,"title":"Seto Tower","description":"Nepali White tower designed by kp oli and co","price":450,"rating":4,"category":"View Tower","inStock":14,"sellerId":1,"adminId":null,"photos":[{"url":"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT2CtGwQciRfeSPnHH4jKzDDnnHhYfvfhCd-g&s"}]},
    
    {"id":8,"title":"KP tower","description":"KP Oli obsessed tower","price":233,"rating":3,"category":"Tower","inStock":0,"sellerId":1,"adminId":null,"photos":[{"url":"https://assets-api.kathmandupost.com/thumb.php?src=https://assets-cdn.kathmandupost.com/uploads/source/news/2024/news/Untitled13-1726276317.jpg&w=900&height=601"},{"url":"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTr3GwkHQeGA9SaafjxZk4ilGak7PlMkyvaQQ&s"}]},
    
    {"id":9,"title":"Kathmandu ko fohor","description":"Kathmandu ko fohor for khaire","price":1000,"rating":0,"category":"Waste","inStock":23,"sellerId":1,"adminId":null,"photos":[{"url":"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSEzo1GpgEfzTyPR0SAo1KsOg-_lyLgGINQFg&s"}]},
    
    {"id":11,"title":"Nepali Rail","description":"Nepali KP oli rail","price":2332,"rating":0,"category":"Nepali Transport","inStock":16,"sellerId":1,"adminId":null,"photos":[{"url":"https://thumbs.dreamstime.com/b/old-blue-colored-electric-bus-useless-parked-nepali-122481222.jpg"}]},
    
    {"id":13,"title":"Nepali Raksi","description":"Nepali Rakshi made by khaire","price":534,"rating":0,"category":"Alcohol","inStock":333,"sellerId":1,"adminId":null,"photos":[{"url":"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS5LwSqEtAmFR99Ov_TSmpkYynLLrxuOyKqGA&s"}]},
    
    {"id":14,"title":"Nepali Mustang ko Syau","description":"Apple from Mustang Nepal, very juicy","price":1.2,"rating":0,"category":"Fruits","inStock":0,"sellerId":2,"adminId":null,"photos":[{"url":"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSr4Fo2rTO4AovAp8Qpz4bg9p_UkHTmEkNXIQ&s"}]},
    
    {"id":16,"title":"Raute","description":"Nepali Raute ","price":2300,"rating":0,"category":"Mens and Womens","inStock":6,"sellerId":2,"adminId":null,"photos":[{"url":"https://dareadventurenepal.wordpress.com/wp-content/uploads/2020/09/gaute.jpg?w=1568"},{"url":"https://ichef.bbci.co.uk/ace/standard/976/cpsprodpb/F4ED/production/_89110726_16.jpg"}]},
    
    {"id":19,"title":"Khukuri Rum","description":"Nepali Rum, good for cold","price":6.88,"rating":0,"category":"Alcohol","inStock":14,"sellerId":1,"adminId":null,"photos":[{"url":"https://liquorworld.com.np/wp-content/uploads/2020/11/Khukri-Spice-750ML.jpg"}]},
    
    {"id":20,"title":"Surya Churot","description":"Nepali Ciggerate,khaire loves it.","price":2.44,"rating":0,"category":"Tobacco","inStock":486,"sellerId":2,"adminId":null,"photos":[{"url":"https://hungerend.com/wp-content/uploads/2022/03/surya-red-min.jpg"}]},
   
];

//simple add not upsert
export async function addItems(itemsData) {
    try {
      if (!Array.isArray(itemsData)) {
        itemsData = [itemsData]; // Wrap the single item in an array
    }
        // Create items one by one to get their IDs
        for (const item of itemsData) {
            const createdItem = await prisma.item.create({
                data: {
                    title: item.title,
                    description: item.description,
                    price: item.price,
                    rating: item.rating,
                    category: item.category,
                    inStock: item.inStock,
                    sellerId: item.sellerId,
                },
            });

            // Insert associated photos
            await prisma.photo.createMany({
                data: item.photos.map(photo => ({
                    url: photo.url,
                    itemId: createdItem.id, // Associate photo with the correct item ID
                })),
            });
        }
        console.log('Items added successfully');
    } catch (error) {
        console.log("Error inserting items:", error);
    }
}

//new value of a field in the item of given id
export async function updateItem(id, field, value) {
  try {
    // Check if the item exists
    const existingItem = await prisma.item.findUnique({
      where: { id },
    });

    if (!existingItem) {
      console.log(`Item with ID ${id} does not exist.`);
      return;
    }

    // Prepare data for update
    const dataToUpdate = {};
    dataToUpdate[field] = value; // Dynamically set the field to update

    // Update the item
    const updatedItem = await prisma.item.update({
      where: { id },
      data: dataToUpdate,
    });

    console.log("Item updated successfully:", updatedItem);
  } catch (error) {
    console.log("error updating items", error);
  }
}

export async function updateItemPhotos(itemId, newPhotoUrls) {
  try {
      const existingItem = await prisma.item.findUnique({
          where: { id: itemId },
          include: { photos: true }, // Include related photos
      });

      if (!existingItem) {
          console.log(`Item with ID ${itemId} does not exist.`);
          return;
      }

      // Clear existing photos
      await prisma.photo.deleteMany({
          where: { itemId: existingItem.id },
      });

      // Add new photo URLs
      const newPhotos = newPhotoUrls.map(url => ({
          url,
          itemId: existingItem.id,
      }));

      await prisma.photo.createMany({
          data: newPhotos,
      });

      console.log("Photos updated successfully for item ID:", itemId);
  } catch (error) {
      console.log("Error updating photos:", error);
  }
}

async function getItems(){
  try {
    // Fetch all items from the Item model
    const allItems = await prisma.item.findMany(
      {
        include:{
          photos: true,
        }
      }
    );
    
    // Return items as an object
    return { items: allItems };
} catch (error) {
    console.error("Error fetching items:", error);
} finally {
    await prisma.$disconnect();
}
}
addItems(itemsData);
export default getItems;
