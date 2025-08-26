"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle, XCircle, Play, Mail } from "lucide-react"

// Import all questions from the tests
import { allQuestions } from "@/lib/questions"

interface Question {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  difficulty: "easy" | "medium" | "hard"
  testNumber: number
}

interface TestResult {
  questionId: string
  selectedAnswer: number
  isCorrect: boolean
}

export default function DesignerTest() {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [currentTest, setCurrentTest] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [showResults, setShowResults] = useState(false)
  const [testStarted, setTestStarted] = useState(false)
  const [emailSending, setEmailSending] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  useEffect(() => {
    const savedState = localStorage.getItem("designerTestState")
    if (savedState) {
      try {
        const state = JSON.parse(savedState)
        setFirstName(state.firstName || "")
        setLastName(state.lastName || "")
        setCurrentTest(state.currentTest || [])
        setCurrentQuestionIndex(state.currentQuestionIndex || 0)
        setSelectedAnswer(state.selectedAnswer || null)
        setTestResults(state.testResults || [])
        setShowResults(state.showResults || false)
        setTestStarted(state.testStarted || false)
      } catch (error) {
        console.error("Error loading saved state:", error)
      }
    }
  }, [])

  useEffect(() => {
    const state = {
      firstName,
      lastName,
      currentTest,
      currentQuestionIndex,
      selectedAnswer,
      testResults,
      showResults,
      testStarted,
    }
    localStorage.setItem("designerTestState", JSON.stringify(state))
  }, [firstName, lastName, currentTest, currentQuestionIndex, selectedAnswer, testResults, showResults, testStarted])

  const generateTest = () => {
    if (!firstName.trim() || !lastName.trim()) {
      alert("Veuillez entrer votre prénom et nom avant de commencer le test.")
      return
    }

    const easyQuestions = allQuestions.filter((q) => q.difficulty === "easy")
    const mediumQuestions = allQuestions.filter((q) => q.difficulty === "medium")
    const hardQuestions = allQuestions.filter((q) => q.difficulty === "hard")

    const selectedEasy = shuffleArray(easyQuestions).slice(0, 10)
    const selectedMedium = shuffleArray(mediumQuestions).slice(0, 5)
    const selectedHard = shuffleArray(hardQuestions).slice(0, 5)

    const testQuestions = shuffleArray([...selectedEasy, ...selectedMedium, ...selectedHard])

    setCurrentTest(testQuestions)
    setCurrentQuestionIndex(0)
    setSelectedAnswer(null)
    setTestResults([])
    setShowResults(false)
    setTestStarted(true)
  }

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex)
  }

  const handleNextQuestion = async () => {
    if (selectedAnswer === null) return

    const currentQuestion = currentTest[currentQuestionIndex]
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer

    const result: TestResult = {
      questionId: currentQuestion.id,
      selectedAnswer,
      isCorrect,
    }

    const newResults = [...testResults, result]
    setTestResults(newResults)

    if (currentQuestionIndex < currentTest.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setSelectedAnswer(null)
    } else {
      setShowResults(true)
      // Automatically send email when test completes
      setTimeout(async () => {
        // Use the updated testResults that includes the current answer
        await sendResultsByEmailAutomatically()
      }, 1000) // Small delay to ensure state is updated
    }
  }

  const resetTest = () => {
    setTestStarted(false)
    setFirstName("")
    setLastName("")
    setCurrentTest([])
    setCurrentQuestionIndex(0)
    setSelectedAnswer(null)
    setTestResults([])
    setShowResults(false)
    localStorage.removeItem("designerTestState")
  }

  const calculateScore = () => {
    const correct = testResults.filter((r) => r.isCorrect).length
    return {
      correct,
      total: testResults.length,
      percentage: Math.round((correct / testResults.length) * 100),
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "hard":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "Facile"
      case "medium":
        return "Moyen"
      case "hard":
        return "Difficile"
      default:
        return difficulty
    }
  }

  const sendResultsByEmailAutomatically = async () => {
    try {
      const score = calculateScore()

      // Create detailed results HTML
      const detailedResults = currentTest
        .map((question, index) => {
          const result = testResults[index]
          if (!result) return '' // Skip if result is undefined
          return `
          <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <div style="display: flex; align-items: center; margin-bottom: 10px;">
              <span style="color: ${result.isCorrect ? "#16a34a" : "#dc2626"}; margin-right: 10px;">
                ${result.isCorrect ? "✓" : "✗"}
              </span>
              <span style="background: ${question.difficulty === "easy" ? "#dcfce7" : question.difficulty === "medium" ? "#fef3c7" : "#fee2e2"}; 
                           color: ${question.difficulty === "easy" ? "#166534" : question.difficulty === "medium" ? "#92400e" : "#991b1b"}; 
                           padding: 4px 8px; border-radius: 4px; font-size: 12px;">
                ${question.difficulty === "easy" ? "Facile" : question.difficulty === "medium" ? "Moyen" : "Difficile"}
              </span>
            </div>
            <p style="font-weight: bold; margin-bottom: 10px;">${question.question}</p>
            <div>
              ${question.options
                .map(
                  (option, optionIndex) => `
                <div style="padding: 8px; margin: 4px 0; border-radius: 4px; 
                           background: ${
                             optionIndex === question.correctAnswer
                               ? "#dcfce7"
                               : optionIndex === result.selectedAnswer && !result.isCorrect
                                 ? "#fee2e2"
                                 : "#f9fafb"
                           }; 
                           color: ${
                             optionIndex === question.correctAnswer
                               ? "#166534"
                               : optionIndex === result.selectedAnswer && !result.isCorrect
                                 ? "#991b1b"
                                 : "#374151"
                           };">
                  ${option}
                </div>
              `,
                )
                .join("")}
            </div>
          </div>
        `
        })
        .join("")

      // Use Resend API
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName,
          lastName,
          score,
          detailedResults,
        }),
      })

      if (response.ok) {
        setEmailSent(true)
        console.log("Email sent automatically via Resend")
        return true
      } else {
        throw new Error("Failed to send email")
      }
    } catch (error) {
      console.error("Error sending email automatically:", error)
      return false
    }
  }

  const sendResultsByEmail = async () => {
    setEmailSending(true)

    try {
      const success = await sendResultsByEmailAutomatically()
      if (!success) {
        throw new Error("Automatic email failed")
      }
    } catch (error) {
      console.error("Error sending email:", error)
      const subject = encodeURIComponent(`Résultats Test Designer - ${firstName} ${lastName}`)
      const body = encodeURIComponent(
        `Candidat: ${firstName} ${lastName}\nScore: ${calculateScore().percentage}% (${calculateScore().correct}/20)\nDate: ${new Date().toLocaleDateString("fr-FR")}\n\nVeuillez consulter les détails complets dans l'interface du test.`,
      )
      window.open(`mailto:louenes.abbas@numilex.com?subject=${subject}&body=${body}`)
      setEmailSent(true)
    } finally {
      setEmailSending(false)
    }
  }

  if (!testStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <div className="mb-6">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Group%2013-GCn4QlYOPzUDFxaEzBdf2Yv8WNDACi.png"
                alt="Numilex Logo"
                className="h-16 mx-auto mb-4"
              />
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900 mb-4">Test Designer Numilex</CardTitle>
            <p className="text-lg text-gray-600 mb-6">Test complet de connaissances en design graphique</p>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <Label htmlFor="firstName" className="text-left block mb-2 font-medium">
                  Prénom *
                </Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="Votre prénom"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full"
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName" className="text-left block mb-2 font-medium">
                  Nom *
                </Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Votre nom"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full"
                  required
                />
              </div>
            </div>
            
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-6">
              Dans le cadre de votre processus de recrutement chez Numilex, vous devez répondre aux 20 questions d’évaluation qui suivent, à l’issu de ce test, votre note sera transmise automatiquement au service recrutement. Nous vous rappelons qu’il est strictement interdit d’utiliser votre téléphone lors du test.
            </p>
            <Button
              onClick={generateTest}
              size="lg"
              className="w-full"
              disabled={!firstName.trim() || !lastName.trim()}
            >
              <Play className="mr-2 h-5 w-5" />
              Commencer le Test
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (showResults) {
    const score = calculateScore()
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          <Card className="mb-6">
            <CardHeader className="text-center">
              <div className="mb-4">
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Group%2013-GCn4QlYOPzUDFxaEzBdf2Yv8WNDACi.png"
                  alt="Numilex Logo"
                  className="h-12 mx-auto mb-2 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={resetTest}
                  title="Cliquez pour refaire le test"
                />
              </div>
              <CardTitle className="text-3xl font-bold text-gray-900 mb-2">Résultats du Test</CardTitle>
              <p className="text-lg text-gray-700 mb-4 font-medium">
                {firstName} {lastName}
              </p>
              <div className="text-6xl font-bold mb-4">
                <span
                  className={
                    score.percentage >= 70
                      ? "text-green-600"
                      : score.percentage >= 50
                        ? "text-yellow-600"
                        : "text-red-600"
                  }
                >
                  {score.percentage}%
                </span>
              </div>
              <p className="text-xl text-gray-600">
                {score.correct} / 20 réponses correctes
              </p>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-green-600 font-medium">
                ✓ Résultats envoyés automatiquement au département recrutement  ✓
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Détail des Réponses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {currentTest.map((question, index) => {
                  const result = testResults[index]
                  return (
                    <div key={question.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {result.isCorrect ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600" />
                          )}
                          <Badge className={getDifficultyColor(question.difficulty)}>
                            {getDifficultyLabel(question.difficulty)}
                          </Badge>
                        </div>
                        <span className="text-sm text-gray-500">Test {question.testNumber}</span>
                      </div>
                      <p className="font-medium mb-2">{question.question}</p>
                      <div className="space-y-1">
                        {question.options.map((option, optionIndex) => (
                          <div
                            key={optionIndex}
                            className={`p-2 rounded text-sm ${
                              optionIndex === question.correctAnswer
                                ? "bg-green-100 text-green-800"
                                : optionIndex === result.selectedAnswer && !result.isCorrect
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-50"
                            }`}
                          >
                            {option}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const currentQuestion = currentTest[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / currentTest.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-4">
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Group%2013-GCn4QlYOPzUDFxaEzBdf2Yv8WNDACi.png"
            alt="Numilex Logo"
            className="h-10 mx-auto"
          />
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">
              Question {currentQuestionIndex + 1} sur {currentTest.length}
            </span>
            <Badge className={getDifficultyColor(currentQuestion.difficulty)}>
              {getDifficultyLabel(currentQuestion.difficulty)}
            </Badge>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">{currentQuestion.question}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 mb-6">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  className={`w-full p-4 text-left rounded-lg border transition-colors ${
                    selectedAnswer === index
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <span className="font-medium mr-3">{String.fromCharCode(97 + index)})</span>
                  {option}
                </button>
              ))}
            </div>

            <Button onClick={handleNextQuestion} disabled={selectedAnswer === null} className="w-full">
              {currentQuestionIndex < currentTest.length - 1 ? "Question Suivante" : "Voir les Résultats"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
