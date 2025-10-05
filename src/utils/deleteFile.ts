import fs from "fs"

export const deleteFile = (filePath:string)=>{
  fs.existsSync(filePath) && fs.unlink(filePath,(err)=>{
    if(err) throw err
  })
}