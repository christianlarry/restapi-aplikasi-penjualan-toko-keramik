

db.products.insertOne({
  "_id": ObjectId("123"),
  "name": "Marble Effect Ceramic",
  "type": "Floor",
  "design": "Marble",
  "size": { "width": 60, "height": 60 },
  "color": "White",
  "finishing": "Matte",
  "texture": "Smooth",
  "category_id": ObjectId("abc123"),
  "category_name": "Marble",  // Denormalized for fast query
  "brand_id": ObjectId("xyz789"),
  "brand_name": "Roman"
})
