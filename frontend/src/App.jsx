import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [dish, setDish] = useState('')
  const [recipe, setRecipe] = useState(null)
  const [loading, setLoading] = useState(false)

  // --- NEW: Cooking Mode & Timer States ---
  const [isCooking, setIsCooking] = useState(false)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0) // Timer in seconds
  const [isTimerRunning, setIsTimerRunning] = useState(false)

  // --- NEW: The Timer Logic ---
  // This useEffect runs a countdown every second if the timer is active
  useEffect(() => {
    let interval;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1)
      }, 1000)
    } else if (timeLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false)
      alert("⏰ Beep Beep! Timer is up!")
    }
    
    // Cleanup the interval when the component re-renders or unmounts
    return () => clearInterval(interval)
  }, [isTimerRunning, timeLeft])

  // Helper to format seconds into MM:SS
  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
  }

  // --- Existing Fetch Logic ---
  const handleCook = async (e) => {
    e.preventDefault()
    setLoading(true)
    setIsCooking(false) // Reset cooking mode if they search a new dish
    
    try {
      const response = await fetch('http://127.0.0.1:8000/api/generate-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dish: dish }),
      })
      
      const data = await response.json()
      const parsedRecipe = JSON.parse(data.recipe)
      setRecipe(parsedRecipe)
      
    } catch (error) {
      console.error("Error fetching recipe:", error)
      alert("Oops! The kitchen caught on fire. Check the console.")
    } finally {
      setLoading(false)
    }
  }

  // --- NEW: Navigation Helpers ---
  const startCookingMode = () => {
    setIsCooking(true)
    goToStep(0)
  }

  const goToStep = (index) => {
    setCurrentStepIndex(index)
    const step = recipe[index]
    
    // If the step has a timer, convert minutes to seconds and set it
    if (step && step.timer_minutes > 0) {
      setTimeLeft(step.timer_minutes * 60)
    } else {
      setTimeLeft(0)
    }
    setIsTimerRunning(false) // Always start a new step paused
  }

  const nextStep = () => {
    if (currentStepIndex < recipe.length - 1) {
      goToStep(currentStepIndex + 1)
    } else {
      // Last step finished!
      setIsCooking(false)
      alert("🎉 Bon Appétit! You successfully cooked the dish!")
    }
  }

  // --- What renders on the screen ---
  return (
    <div className="app-container" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', padding: '20px' }}>
      <h1>Let Him Cook 🍳</h1>
      
      {/* 1. The Search Bar (Hidden while actively cooking) */}
      {!isCooking && (
        <form onSubmit={handleCook}>
          <input 
            type="text" 
            value={dish} 
            onChange={(e) => setDish(e.target.value)} 
            placeholder="e.g., Chicken Parmesan" 
            required 
            style={{ padding: '10px', width: '250px', marginRight: '10px' }}
          />
          <button type="submit" disabled={loading} style={{ padding: '10px' }}>
            {loading ? 'Chef is thinking...' : 'Get Recipe!'}
          </button>
        </form>
      )}

      {/* 2. Recipe Preview & Start Button */}
      {recipe && !isCooking && (
        <div style={{ marginTop: '30px' }}>
          <h2>Recipe Ready!</h2>
          <p>This recipe has {recipe.length} steps.</p>
          <button 
            onClick={startCookingMode}
            style={{ padding: '15px 30px', fontSize: '18px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
          >
            👨‍🍳 Start Cooking
          </button>
        </div>
      )}

      {/* 3. The Active Cooking Mode */}
      {recipe && isCooking && (
        <div style={{ marginTop: '30px', textAlign: 'left', padding: '20px', border: '2px solid #333', borderRadius: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0 }}>Step {currentStepIndex + 1} of {recipe.length}</h2>
            <button onClick={() => setIsCooking(false)} style={{ padding: '5px 10px', fontSize: '12px' }}>Exit Cooking Mode</button>
          </div>
          
          <hr style={{ margin: '15px 0' }}/>
          
          <p style={{ fontSize: '20px', lineHeight: '1.5' }}>
            {recipe[currentStepIndex].instruction}
          </p>
          
          {recipe[currentStepIndex].tips && (
            <p style={{ fontStyle: 'italic', color: '#666', backgroundColor: '#f9f9f9', padding: '10px', borderRadius: '5px' }}>
              💡 Tip: {recipe[currentStepIndex].tips}
            </p>
          )}

          {/* 4. The Functional Timer */}
          {recipe[currentStepIndex].timer_minutes > 0 && (
            <div style={{ margin: '20px 0', padding: '15px', backgroundColor: '#fff3e0', borderRadius: '8px', textAlign: 'center' }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#e65100' }}>
                ⏳ {formatTime(timeLeft)}
              </h3>
              
              {timeLeft > 0 ? (
                <button 
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  style={{ padding: '8px 16px', fontSize: '16px', cursor: 'pointer' }}
                >
                  {isTimerRunning ? '⏸ Pause Timer' : '▶ Start Timer'}
                </button>
              ) : (
                <p style={{ color: '#e65100', fontWeight: 'bold', margin: 0 }}>Time is up!</p>
              )}
            </div>
          )}

          <div style={{ marginTop: '30px', textAlign: 'right' }}>
            <button 
              onClick={nextStep}
              style={{ padding: '10px 20px', fontSize: '16px', backgroundColor: '#008CBA', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
            >
              {currentStepIndex === recipe.length - 1 ? 'Finish Cooking!' : 'Done, Next Step ➔'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App