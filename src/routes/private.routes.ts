import express from "express"

const router = express.Router()

// THIS IS ROUTES LINE
// CONTOH ---
router.get("/test",(req,res)=>{
  res.json({
    message: "TEST Routes"
  }).end()
})

export default router