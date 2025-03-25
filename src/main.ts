import dotenv from "dotenv"
dotenv.config()

import { web } from "@application/web"
import { logger } from "@application/logging"

import {client, connectToMongoDB} from "@application/database"

// ENV IMPORT
const PORT = process.env.PORT

connectToMongoDB()

web.get("/",async (req,res)=>{

  await logger.info( await client.db().collections())

  res.json({
    "message": "hello world!"
  }).end()
})

web.listen(PORT, ()=>{
  logger.info(`Server up and running at http://localhost:${PORT}`)
})