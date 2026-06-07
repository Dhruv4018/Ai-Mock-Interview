import React, { useEffect, useRef, useState } from 'react'
import maleVideo from "../assets/Videos/male-ai.mp4"
import femaleVideo from "../assets/Videos/female-ai.mp4"
import Timer from './Timer'
import { motion } from 'motion/react'
import { FaArrowLeft, FaMicrophone, FaMicrophoneSlash } from "react-icons/fa"
import axios from 'axios'
import { ServerUrl } from '../App'
import { BsArrowLeft, BsArrowRight } from 'react-icons/bs'
import { useNavigate } from 'react-router-dom'

const Step2Interview = ({ interviewData, onFinish }) => {
  const navigate = useNavigate()

  const { interviewId, questions, userName } = interviewData

  const [isIntroPhase, setIsIntroPhase] = useState(true)
  const [isMicOn, setIMicOn] = useState(true)
  const [isAIPlaying, setIsAIPlaying] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answer, setAnswer] = useState("")
  const [feedback, setFeedback] = useState("")
  const [timeLeft, setTimeLeft] = useState(questions[0]?.timeLimit || 60)
  const [selectdVoice, setSelectedVoice] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [voiceGender, setVoiceGender] = useState("female");
  const [subtitle, setSubtitle] = useState("")
  const isListeningRef = useRef(false)   // 🔥 NEW
const isMicOnRef = useRef(true)    

  const recognitionRef = useRef(null)
  const videoRef = useRef(null);
  const currentQuestion = questions[currentIndex]

  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices.length) return;

      const femaleVoice = voices.find(v =>
        v.name.toLowerCase().includes("zira") ||
        v.name.toLowerCase().includes("samantha") ||
        v.name.toLowerCase().includes("female")
      );
      if (femaleVoice) {
        setSelectedVoice(femaleVoice);
        setVoiceGender("female");
        return;
      }

      const maleVoice =
        voices.find(v =>
          v.name.toLowerCase().includes("david") ||
          v.name.toLowerCase().includes("mark") ||
          v.name.toLowerCase().includes("male")
        );

      if (maleVoice) {
        setSelectedVoice(maleVoice)
        setVoiceGender("male");
        return
      }

      selectdVoice(voices[0]);
      setVoiceGender("female");




    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, [])

  const videoSource = voiceGender === "male" ? maleVideo : femaleVideo


  const speakText = (text) => {
    return new Promise((resolve) => {
      if (!window.speechSynthesis || !selectdVoice) {
        resolve();
        return
      }

      window.speechSynthesis.cancel();

      const humanText = text.replace(/,/g, ", ... ")
        .replace(/\./g, ". ... ");


      const utterance = new SpeechSynthesisUtterance(humanText);

      utterance.voice = selectdVoice;


      utterance.rate = 0.92;
      utterance.pitch = 1.05;
      utterance.volume = 1;

      utterance.onstart = () => {
        setIsAIPlaying(true);
        stopMic()
        videoRef.current?.play();
      };

      // utterance.onend = () => {
      //   videoRef.current?.pause();
      //   videoRef.current.currentTime = 0;
      //   setIsAIPlaying(false);

      //   if (isMicOn) {
      //     startMic();
      //   }


      //   setTimeout(() => {
      //     setSubtitle("");
      //     resolve();
      //   }, 300)
      // };
      utterance.onend = () => {
  videoRef.current?.pause();
  videoRef.current.currentTime = 0;
  setIsAIPlaying(false);

  if (isMicOnRef.current) {  // 🔥 FIX
    startMic();
  }

  setTimeout(() => {
    setSubtitle("");
    resolve();
  }, 300);
};
      setSubtitle(text);

      window.speechSynthesis.speak(utterance)
    })
  }

  useEffect(() => {
    if (!selectdVoice) {
      return;
    }
    const runIntro = async () => {
      if (isIntroPhase) {
        await speakText(
          `HI ${userName}, it's great to meet you today. I hope you're feeling confident and ready.`
        );

        await speakText(
          "I'll ask you a few questions. Just answer naturally, and take your time. Let's begin."
        );


        setIsIntroPhase(false)
      } else if (currentQuestion) {
        await new Promise(r => setTimeout(r, 800));


        if (currentIndex === questions.length - 1) {
          await speakText("Alright, this one might be a bit more challenging.");
        }

        await speakText(currentQuestion.question);

        if (isMicOn) {
          startMic();
        }
      }
    }

    runIntro()

  }, [selectdVoice, isIntroPhase, currentIndex])


  useEffect(() => {
    if (isIntroPhase) return;

    if (!currentQuestion) return;



    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0;
        }
        return prev - 1

      })

    }, 1000)
    return () => clearInterval(timer)
  }, [isIntroPhase, currentIndex])

  useEffect(() => {
    if (!isIntroPhase && currentQuestion) {
      setTimeLeft(currentQuestion.timeLimit || 60);
    }
  }, [currentIndex])


  //   useEffect(() => {
  //   if (!("webkitSpeechRecognition" in window)) return;

  //   const recognition = new window.webkitSpeechRecognition();
  //   recognition.lang = "en-US";
  //   recognition.continuous = true;
  //   recognition.interimResults = false;

  //   recognition.onresult = (event) => {
  //     const transcript =
  //       event.results[event.results.length - 1][0].transcript;

  //     setAnswer((prev) => prev + " " + transcript);
  //   };

  //   recognition.onend = () => {
  //     if (isMicOn && !isAIPlaying) {
  //       recognition.start();
  //     }
  //   };

  //   recognitionRef.current = recognition;
  // }, []);

 useEffect(() => {
  if (!("webkitSpeechRecognition" in window)) return;

  const recognition = new window.webkitSpeechRecognition();

  recognition.lang = "en-US";
  recognition.continuous = false; // 🔥 IMPORTANT FIX
  recognition.interimResults = false;

  recognition.onresult = (event) => {
    const transcript =
      event.results[event.results.length - 1][0].transcript;

    setAnswer((prev) => prev + " " + transcript);
  };

  recognition.onend = () => {
    isListeningRef.current = false;

    // 🔥 FIX: state ki jagah ref use karo
    if (isMicOnRef.current && !isAIPlaying) {
      setTimeout(() => {
        startMic();
      }, 200);
    }
  };

  recognition.onerror = (e) => {
    console.log("Speech error:", e);
    isListeningRef.current = false;
  };

  recognitionRef.current = recognition;

}, []);
  const startMic = () => {
  if (!recognitionRef.current || isAIPlaying) return;

  if (isListeningRef.current) return; // 🔥 prevent duplicate

  try {
    recognitionRef.current.start();
    isListeningRef.current = true;
  } catch (error) {
    console.log(error);
  }
};

  const stopMic = () => {
  if (recognitionRef.current) {
    try {
      recognitionRef.current.stop();
      recognitionRef.current.abort(); // 🔥 force stop
    } catch (e) {}

    isListeningRef.current = false;
  }
};

  const toggleMic = () => {
  if (isMicOnRef.current) {
    stopMic();
    isMicOnRef.current = false;
    setIMicOn(false);
  } else {
    isMicOnRef.current = true;
    setIMicOn(true);
    startMic();
  }
};
  const submitAnswer = async () => {
    if (isSubmitting) return;
    stopMic();
    setIsSubmitting(true)

    try {
      const result = await axios.post(ServerUrl + "/api/interview/submit-answer", { interviewId, questionIndex: currentIndex, answer, timeTaken: currentQuestion.timeLimit - timeLeft }, { withCredentials: true })

      setFeedback(result.data.feedback)
      speakText(result.data.feedback)
      setIsSubmitting(false)
    } catch (error) {
      console.log(error)
      setIsSubmitting(false)

    }
  }

  const handleNext = async () => {
    setAnswer("");
    setFeedback("");

    if (currentIndex + 1 >= questions.length) {
      finishInterview();
      return;
    }

    await speakText("Alright, let's move to the next question.");

    setCurrentIndex(currentIndex + 1);
    setTimeout(() => {
      if (isMicOn) startMic();
    }, 500)

  }

  const finishInterview = async () => {
    stopMic()
    setIMicOn(false)
    try {

      const result = await axios.post(ServerUrl + "/api/interview/finish",
        { interviewId }, { withCredentials: true })

      console.log(result.data)
      console.log(interviewId)
      onFinish(result.data)


    } catch (error) {

      console.log(error)

    }


  }

  useEffect(() => {
    if (isIntroPhase) return;
    if (!currentQuestion) return;

    if (timeLeft === 0 && !isSubmitting && !feedback) {
      submitAnswer();
    }
  }, [timeLeft])

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current.abort();
      }

      window.speechSynthesis.cancel();
    };
  }, [])

  const handleEndInterview = async () => {
  const confirmEnd = window.confirm("Are you sure you want to end the interview?");
  if (!confirmEnd) return;

  stopMic();
  setIMicOn(false);

  
  if (answer && !feedback) {
    await submitAnswer();
  }

  
  await speakText("Your interview has been ended. Redirecting to your report.");

  
  finishInterview();
};
  return (
    <div className='min-h-screen bg-linear-to-br from-emerald-50 via-white to-teal-100 flex items-center justify-center p-4 sm:p-6 '>



      <div className='w-full max-w-350 min-h-[80vh] bg-white rounded-3xl shadow-2xl border border-gray-200 flex flex-col lg:flex-row overflow-hidden'>

        <div className='w-full lg:w-[35%] bg-white flex flex-col items-center p-6 space-y-6 border-gray-200'>
          <div className='w-full max-w-md rounded-2xl overflow-hidden shadow-xl'>
            <video src={videoSource} key={videoSource} ref={videoRef} className='w-full h-auto object-cover' muted playsInline preload='auto' />
          </div>

          {subtitle && (
            <div className='w-full max-w-md bg-gray-50 border border-gray-200 rounded-xl p-4 shadow-sm'>
              <p className='text-gray-700 text-sm sm:text-base font-medium text-center leading-relaxed'>{subtitle}</p>
            </div>
          )}


          <div className='w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-md p-6 space-y-5'>
            <div className='flex justify-between items-center'>
              <span className='text-sm text-gray-500'>
                Interview Status
              </span>
              {isAIPlaying && <span className='text-sm font-semibold text-emerald-600'>
                {isAIPlaying ? "AI Speaking" : ""}
              </span>}

            </div>

            <div className='h-px bg-gray-200'>

            </div>

            <div className='flex justify-center'>
              <Timer timeLeft={timeLeft} totalTime={currentQuestion?.timeLimit} />
            </div>

            <div className='h-px bg-gray-200'>

            </div>
            <div className='grid grid-cols-2 gap-6 text-center'>
              <div>
                <span className='text-2xl font-bold text-emerald-600'>{currentIndex + 1}</span>
                <span className='text-xs text-gray-400'>Current Question</span>
              </div>
              <div>
                <span className='text-2xl font-bold text-emerald-600'>{questions.length} </span>
                <span className='text-xs text-gray-400'>Total Question</span>
              </div>

            </div>

          </div>


        </div>

        <div className='flex-1 flex flex-col p-4 sm:p-6 md:p-8 relative'>

          <div className='flex justify-between items-center mb-6'>
            <h2 className='text-xl sm:text-2xl font-bold text-emerald-600'>
              AI Smart Interview
            </h2>

            <button
              onClick={handleEndInterview}
              className='bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl shadow transition text-sm font-semibold cursor-pointer'
            >
              End Interview
            </button>
          </div>

          {!isIntroPhase && (
            <div className='relative mb-6 bg-gray-50 p-4 sm:p-6 rounded-2xl border border-gray-200 shadow-sm'>
              <p className='text-xs sm:text-sm text-gray-400 mb-2'>
                Question {currentIndex + 1} of {questions.length}
              </p>

              <div className='text-base sm:text-lg font-semibold text-gray-800 leading-relaxed'>
                {currentQuestion?.question}
              </div>
            </div>
          )}


          <textarea
            placeholder='Type your answer here...'
            onChange={(e) => setAnswer(e.target.value)}
            value={answer}
            className='w-full flex-1 bg-gray-100 p-4 sm:p-6 rounded-2xl resize-none outline-none border border-gray-200 focus:ring-2 focus:ring-emerald-500 transition text-gray-800'
          />


          {!feedback ? (
            <div className='flex items-center gap-4 mt-6'>
              <motion.button
                onClick={toggleMic}
                whileTap={{ scale: 0.9 }}
                className='w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-full bg-black text-white shadow-lg cursor-pointer'>
                {isMicOn ? <FaMicrophone size={20} /> : <FaMicrophoneSlash size={20} />}
              </motion.button>

              <motion.button
                onClick={submitAnswer}
                disabled={isSubmitting}
                whileTap={{ scale: 0.95 }}
                className='flex-1 bg-gradient-to-r from-emerald-600 to-teal-500 text-white py-3 sm:py-4 rounded-2xl shadow-lg hover:opacity-90 transition font-semibold cursor-pointer disabled:bg-gray-500'>
                {isSubmitting ? "Submitting..." : "Submit Answer"}
              </motion.button>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className='mt-6 bg-emerald-50 border border-emerald-200 p-5 rounded-2xl shadow-sm'>
              <p className='text-emerald-700 font-medium mb-4'>
                {feedback}
              </p>

              <button onClick={handleNext} className='w-full bg-gradient-to-r from-emerald-600 to-teal-500 text-white py-3 rounded-xl shadow-md hover:opacity-90 transition flex items-center justify-center gap-1'>
                Next Question <BsArrowRight size={18} />

              </button>
            </motion.div>
          )}
        </div>



      </div>
    </div>

  )
}

export default Step2Interview 