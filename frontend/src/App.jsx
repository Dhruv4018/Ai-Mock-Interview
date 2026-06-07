import React, { useEffect } from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './page/Home'
import Auth from './page/Auth'
import axios from 'axios'
import { useDispatch } from 'react-redux'
import { setuserData } from './redux/userSlice'
import InterviewPage from './page/InterviewPage'
import InterviewHistory from './page/InterviewHistory'
import Pricing from './page/Pricing'
import InterviewReport from './page/InterviewReport'


export const ServerUrl = "https://ai-mock-interview-96bw.onrender.com"

const App = () => {
  const dispatch = useDispatch()

  useEffect(()=>{
    const getUser = async()=>{
      try {
        const result = await axios.get(`${ServerUrl}/api/user/current`,{withCredentials:true})
        dispatch(setuserData(result.data))
          
      } catch (error) {
        console.log(error)
        dispatch(setuserData(null))
        
      }
    }                                                                                                                                                        
    getUser()

  }, [])
  
  return (
   <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/auth" element={<Auth />} />
    <Route path="/interview" element={<InterviewPage />} />
    <Route path="/history" element={<InterviewHistory />} />
    <Route path="/pricing" element={<Pricing />} />
    <Route path="/report/:id" element={<InterviewReport />} />




   </Routes>
  )
}

export default App
