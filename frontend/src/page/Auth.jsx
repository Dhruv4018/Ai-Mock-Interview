import React from 'react'
import { BsRobot } from "react-icons/bs"
import { IoSparkles } from "react-icons/io5"
import { motion } from "motion/react"
import { FcGoogle } from "react-icons/fc"
import { signInWithPopup } from 'firebase/auth'
import { auth, provider } from '../utils/firebase'
import axios from 'axios'
import { ServerUrl } from '../App'
import { useDispatch } from 'react-redux'
import { setuserData } from '../redux/userSlice'

const Auth = ({ isModel = false }) => {
    const dispatch = useDispatch()

    const handlerGoogleAuth = async () => {
        try {
            const result = await signInWithPopup(auth, provider)
            let user = result.user
            let name = user.displayName
            let email = user.email

            const response = await axios.post(`${ServerUrl}/api/auth/google`, { name, email }, { withCredentials: true })
            dispatch(setuserData(response.data))
            window.location.reload()
        } catch (error) {
            console.log(error)
            dispatch(setuserData(null))

        }

    }
    return (
        <div className={`w-full ${isModel ? "py-4":"min-h-screen bg-[#f3f3f3] flex items-center justify-center px-6 py-20"}`}>
            <motion.div
                initial={{ opacity: 0, y: -40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.05 }}

                className={`w-full ${isModel ? "max-w-md p-8 rounded-3xl" : "max-w-lg p-12 rounded-[32px]"} bg-white shadow-2xl border border-gray-200 `}>
                {/* Logo Row */}
                <div className='flex items-center justify-center gap-3 mb-6'>
                    <div className='bg-black text-white p-2 rounded-lg'>
                        <BsRobot size={19} />
                    </div>
                    <h2 className='font-semibold text-lg'>IntervAI</h2>
                </div>

                {/* Heading */}
                <h1 className='text-2xl md:text-3xl font-semibold text-center leading-snug mb-4'>
                    Continue With{" "}
                    <span className='bg-green-100 text-green-600 px-3 py-1 rounded-full inline-flex items-center gap-2'>
                        <IoSparkles size={16} />
                        AI Smart Interview
                    </span>
                </h1>

                {/* Description */}
                <p className='text-center text-gray-500 text-sm mb-6'>
                    Sign in to start AI-Powered mock interviews,
                    track you progress, and unlock detailed performance insights.
                </p>

                <motion.button
                    whileHover={{ opacity: 0.9, scale: 1.03 }}
                    whileTap={{ opacity: 1, scale: 0.98 }}

                    className='w-full flex items-center justify-center gap-3 py-3 bg-black text-white rounded-full shadow-md cursor-pointer'
                    onClick={handlerGoogleAuth}
                >
                    <FcGoogle size={18} />
                    Continue with Google
                </motion.button>

            </motion.div>
        </div>
    )
}

export default Auth