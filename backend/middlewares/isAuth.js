import jwt from "jsonwebtoken"

const isAuth = async (req,res,next)=>{
    try {
        const token = req.cookies.token
        if(!token){
            return res.status(401).json({message:"Unauthorized token no exists"})
        }
        const decoded = await jwt.verify(token , process.env.JWT_SECRET)
        if(!decoded){
            return res.status(401).json({message:"User does not have a valid token"})

        }
        req.userId = decoded.userId
        next() 
        
    } catch (error) {
        return res.status(401).json({message:"Unauthorized", error})
        
    } 
}

export default isAuth