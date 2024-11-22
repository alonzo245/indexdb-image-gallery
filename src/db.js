import { openDB } from "idb";

// Initialize IndexedDB
const dbPromise = openDB("images-db", 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains("images")) {
      db.createObjectStore("images", { keyPath: "id", autoIncrement: true });
    }
  },
});

// Save an image with order
export async function saveImage(image, order) {
  const db = await dbPromise;
  return db.add("images", { image, order });
}

// Get all images sorted by order
export async function getImages() {
  const db = await dbPromise;
  const tx = db.transaction("images", "readonly");
  const store = tx.objectStore("images");
  const images = await store.getAll();
  return images.sort((a, b) => a.order - b.order); // Sort by order
}

// Clear all records from the images table
export async function deleteTable() {
  const db = await dbPromise;
  return db.clear("images");
}
