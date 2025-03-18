import dotenv from "dotenv"
import { web } from "@/application/web"
dotenv.config()

// ENV IMPORT
const PORT = process.env.PORT

web.listen(PORT, ()=>{
  console.log(`Server up and running at http://localhost:${PORT}`)
})