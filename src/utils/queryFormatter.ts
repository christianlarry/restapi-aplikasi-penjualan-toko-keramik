export const parseQueryArray = (val:string|string[]|undefined)=>{
  if(!val) return undefined

  return Array.isArray(val) ? val : [val]
}

export const parseQuerySizeToArray = (val:string|string[]|undefined)=>{
  if(!val) return undefined

  const sizeArr = Array.isArray(val) ? val : [val]

  const sizeObjArr = sizeArr.map(size=>{
    const width = size.split("x")[0]
    const height = size.split("x")[1]

    return {
      width,
      height
    }
  })

  return sizeObjArr
}