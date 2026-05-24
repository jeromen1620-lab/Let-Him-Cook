import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';

export default function App() {
  const [dish, setDish] = useState('');
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(false);

  const [isCooking, setIsCooking] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Timer logic (Exactly the same as Web!)
  useEffect(() => {
    let interval;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      Alert.alert("⏰ Beep Beep!", "Time is up!");
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleCook = async () => {
    if (!dish.trim()) return;
    setLoading(true);
    setIsCooking(false);

    try {
      const response = await fetch('http://192.168.1.3:8000/api/generate-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dish: dish }),
      });

      // 🕵️‍♂️ THE TRAP: Get the raw text instead of assuming it's JSON
      const rawText = await response.text();
      console.log("--- DEBUG INFO ---");
      console.log("HTTP Status:", response.status);
      console.log("Raw Server Response:", rawText);
      console.log("------------------");

      // Now try to parse it normally
      const data = JSON.parse(rawText);
      const parsedRecipe = JSON.parse(data.recipe);
      setRecipe(parsedRecipe);
      
    } catch (error) {
      console.error(error);
      Alert.alert("Server Error", "Check your computer's terminal to see the debug info!");
    } finally {
      setLoading(false);
    }
  };

  const startCookingMode = () => {
    setIsCooking(true);
    goToStep(0);
  };

  const goToStep = (index) => {
    setCurrentStepIndex(index);
    const step = recipe[index];
    if (step && step.timer_minutes > 0) {
      setTimeLeft(step.timer_minutes * 60);
    } else {
      setTimeLeft(0);
    }
    setIsTimerRunning(false);
  };

  const nextStep = () => {
    if (currentStepIndex < recipe.length - 1) {
      goToStep(currentStepIndex + 1);
    } else {
      setIsCooking(false);
      Alert.alert("🎉 Bon Appétit!", "You successfully cooked the dish!");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Let Him Cook 🍳</Text>

      {/* 1. Search Bar */}
      {!isCooking && (
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.input}
            placeholder="e.g., Chicken Parmesan"
            value={dish}
            onChangeText={setDish}
          />
          <TouchableOpacity style={styles.button} onPress={handleCook} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Get Recipe!</Text>}
          </TouchableOpacity>
        </View>
      )}

      {/* 2. Start Cooking Screen */}
      {recipe && !isCooking && (
        <View style={styles.recipePreview}>
          <Text style={styles.subtitle}>Recipe Ready!</Text>
          <Text style={styles.infoText}>This recipe has {recipe.length} steps.</Text>
          <TouchableOpacity style={styles.startButton} onPress={startCookingMode}>
            <Text style={styles.buttonText}>👨‍🍳 Start Cooking</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 3. Active Cooking Mode */}
      {recipe && isCooking && (
        <View style={styles.cookingCard}>
          <View style={styles.headerRow}>
            <Text style={styles.stepCounter}>Step {currentStepIndex + 1} of {recipe.length}</Text>
            <TouchableOpacity onPress={() => setIsCooking(false)}>
              <Text style={styles.exitText}>Exit</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.divider} />
          
          <Text style={styles.instruction}>{recipe[currentStepIndex].instruction}</Text>
          
          {recipe[currentStepIndex].tips && (
            <View style={styles.tipBox}>
              <Text style={styles.tipText}>💡 Tip: {recipe[currentStepIndex].tips}</Text>
            </View>
          )}

          {recipe[currentStepIndex].timer_minutes > 0 && (
            <View style={styles.timerBox}>
              <Text style={styles.timerText}>⏳ {formatTime(timeLeft)}</Text>
              {timeLeft > 0 ? (
                <TouchableOpacity style={styles.timerButton} onPress={() => setIsTimerRunning(!isTimerRunning)}>
                  <Text style={styles.timerButtonText}>{isTimerRunning ? '⏸ Pause' : '▶ Start'}</Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.timeUpText}>Time is up!</Text>
              )}
            </View>
          )}

          <TouchableOpacity style={styles.nextButton} onPress={nextStep}>
            <Text style={styles.buttonText}>
              {currentStepIndex === recipe.length - 1 ? 'Finish Cooking!' : 'Done, Next Step ➔'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

// React Native uses StyleSheet instead of regular CSS!
const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 30, backgroundColor: '#f5f5f5', alignItems: 'center', paddingTop: 80 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 30 },
  searchContainer: { width: '100%', alignItems: 'center' },
  input: { width: '100%', padding: 15, backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#ddd', marginBottom: 15 },
  button: { backgroundColor: '#000', padding: 15, borderRadius: 8, width: '100%', alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  recipePreview: { marginTop: 40, alignItems: 'center' },
  subtitle: { fontSize: 22, fontWeight: 'bold' },
  infoText: { fontSize: 16, marginVertical: 10, color: '#555' },
  startButton: { backgroundColor: '#4CAF50', padding: 15, borderRadius: 8, marginTop: 10 },
  cookingCard: { width: '100%', backgroundColor: '#fff', padding: 20, borderRadius: 12, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stepCounter: { fontSize: 18, fontWeight: 'bold' },
  exitText: { color: '#d32f2f', fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 15 },
  instruction: { fontSize: 20, lineHeight: 28, marginBottom: 15 },
  tipBox: { backgroundColor: '#f9f9f9', padding: 15, borderRadius: 8, marginBottom: 15 },
  tipText: { fontStyle: 'italic', color: '#666' },
  timerBox: { backgroundColor: '#fff3e0', padding: 20, borderRadius: 8, alignItems: 'center', marginBottom: 20 },
  timerText: { fontSize: 24, fontWeight: 'bold', color: '#e65100', marginBottom: 10 },
  timerButton: { backgroundColor: '#ff9800', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  timerButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  timeUpText: { color: '#e65100', fontWeight: 'bold', fontSize: 18 },
  nextButton: { backgroundColor: '#008CBA', padding: 15, borderRadius: 8, alignItems: 'center' }
});