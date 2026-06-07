import User from "../models/user.models.js"
import genToken from "../config/token.js"
export const googleAuth = async (req,res)=>{
    try{
        const {name ,email} = req.body
        let user = await User.findOne({email})
        if(!user){
            user = await User.create({
                name,
                email,
            })
        }
        let token = await genToken(user._id)
        res.cookie("token", token,{
            http:true,
            secure:true, 
            sameSite:"none",
            maxAge:8*24*60*60*1000
        })

        return res.status(200).json({message:"user create successfully", user})
        
        
    }catch(error){
        console.log(error)
        return res.status(500).json({message:`Google auth error , ${error}`})
        
    }
}


export const logOut = async (req,res)=>{
    try {
         await res.clearCookie("token")
         return res.status(200).json({message:`LogOut Successfully`})
    } catch (error) {
        return res.status(500).json({message:`LogOut error , ${error}`})
        
    }
}
