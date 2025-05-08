import express from "express"

const router = express.Router()

router.get("/",(req,res)=>{
  res.json({
    "message": "TEST this is Products routes!"
  }).end()
})

export default router