import dotenv from "dotenv"
dotenv.config()

import { web } from "@application/web"
import { logger } from "@application/logging"
import { connectToMongoDB } from "./application/database"

// Connect to DB First!!!
connectToMongoDB().then(()=>{

  // ENV IMPORT
  const PORT = process.env.PORT

  web.listen(PORT, ()=>{
    logger.info(`Server up and running at http://localhost:${PORT}`)
  })
})