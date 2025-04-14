
import React, { useState, useEffect } from "react";
import { ChevronUp, ChevronDown, AlertTriangle, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChatInterface } from "@/components/ChatInterface";
import { DiagnosisCard, type Diagnosis } from "@/components/DiagnosisCard";
import { PrescriptionRecommendation, type MedicationInfo } from "@/components/PrescriptionRecommendation";
import { Disclaimer } from "@/components/Disclaimer";
import {
  analyzeSymptomsAndGetDiagnoses,
  getRecommendedMedications,
  getInitialMessages
} from "@/services/mockDiagnosticService";

// Message type for chat
interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const Index = () => {
  // Chat state
  const [messages, setMessages] = useState<Message[]>(getInitialMessages());
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Diagnostic state
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<Diagnosis | null>(null);
  const [medications, setMedications] = useState<MedicationInfo[]>([]);
  
  // UI state
  const [showDisclaimerBanner, setShowDisclaimerBanner] = useState(true);
  const [activeTab, setActiveTab] = useState("chat");

  // Handle new message from user
  const handleSendMessage = async (content: string) => {
    // Add user message to chat
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      content,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);
    
    try {
      // Analyze symptoms
      const results = await analyzeSymptomsAndGetDiagnoses(content);
      setDiagnoses(results);
      setSelectedDiagnosis(results.length > 0 ? results[0] : null);
      
      // Get medications for top diagnosis
      if (results.length > 0) {
        const meds = getRecommendedMedications(results[0].condition);
        setMedications(meds);
      }
      
      // Add bot response
      let botResponseText = "Based on the symptoms you've described, I've generated some potential diagnoses. ";
      
      if (results.length > 0) {
        botResponseText += `The most likely condition might be ${results[0].condition} (${results[0].confidence}% confidence). `;
        botResponseText += "Please review the analysis tab for details and remember this is not a definitive diagnosis.";
        
        // Switch to analysis tab after processing
        setTimeout(() => setActiveTab("analysis"), 500);
      } else {
        botResponseText += "I couldn't identify any specific conditions based on the symptoms provided. Please provide more details.";
      }
      
      const botResponse: Message = {
        id: `msg-${Date.now() + 1}`,
        content: botResponseText,
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error("Error analyzing symptoms:", error);
      
      // Add error message
      const errorMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        content: "I'm sorry, I encountered an error while analyzing your symptoms. Please try again.",
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle diagnosis selection
  const handleSelectDiagnosis = (diagnosis: Diagnosis) => {
    setSelectedDiagnosis(diagnosis);
    const meds = getRecommendedMedications(diagnosis.condition);
    setMedications(meds);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-medical-600 to-medical-800 text-white py-4 px-6 shadow-md">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-7 w-7" />
            <h1 className="text-2xl font-bold">Symptom Scribe</h1>
          </div>
          <div className="text-sm opacity-80">
            Symptom Analysis &amp; Prescription Guidance
          </div>
        </div>
      </header>
      
      {/* Disclaimer Banner */}
      {showDisclaimerBanner && (
        <div className="bg-red-100 border-b border-red-200 py-2 px-4">
          <div className="container mx-auto flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-4 w-4" />
              <span>
                <strong>Medical Disclaimer:</strong> This is for informational purposes only, not medical advice.
              </span>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-red-700 h-6 hover:bg-red-200 hover:text-red-800"
              onClick={() => setShowDisclaimerBanner(false)}
            >
              Dismiss
            </Button>
          </div>
        </div>
      )}
      
      {/* Main content */}
      <main className="container mx-auto py-6 px-4 flex-1 flex flex-col">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <div className="flex justify-center mb-4">
            <TabsList>
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
              {selectedDiagnosis && (
                <TabsTrigger value="prescription">Treatment</TabsTrigger>
              )}
            </TabsList>
          </div>

          <TabsContent value="chat" className="flex-1 flex flex-col">
            <div className="max-w-3xl w-full mx-auto">
              <Disclaimer className="mb-6" />
              <ChatInterface 
                messages={messages}
                onSendMessage={handleSendMessage}
                isProcessing={isProcessing}
              />
            </div>
          </TabsContent>

          <TabsContent value="analysis" className="flex-1">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-2xl font-bold mb-2">Symptom Analysis</h2>
              <p className="text-gray-600 mb-6">
                Based on the symptoms you've provided, these are the potential conditions 
                identified. The confidence score indicates relative likelihood, but is not 
                a definitive diagnosis.
              </p>

              {diagnoses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {diagnoses.map(diagnosis => (
                    <DiagnosisCard
                      key={diagnosis.id}
                      diagnosis={diagnosis}
                      onClick={handleSelectDiagnosis}
                      isSelected={selectedDiagnosis?.id === diagnosis.id}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white p-6 rounded-lg shadow border text-center">
                  <p className="text-gray-500">No analysis available yet. Please describe your symptoms in the chat.</p>
                </div>
              )}
              
              <div className="mt-6 bg-orange-50 border border-orange-100 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="text-orange-500 h-5 w-5" />
                  <p className="text-orange-700 font-medium">
                    Important: This analysis is for informational purposes only.
                  </p>
                </div>
                <p className="text-orange-600 text-sm mt-1">
                  The confidence scores are approximate and based on limited information. 
                  Only a healthcare provider can properly diagnose a medical condition.
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="prescription" className="flex-1">
            <div className="max-w-4xl mx-auto">
              {selectedDiagnosis ? (
                <>
                  <PrescriptionRecommendation
                    condition={selectedDiagnosis.condition}
                    medications={medications}
                  />
                  
                  <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="text-red-500 h-5 w-5" />
                      <p className="text-red-700 font-medium">
                        Medical Consultation Required
                      </p>
                    </div>
                    <p className="text-red-600 text-sm mt-1">
                      These medication suggestions are based on general treatment guidelines.
                      Any medication should only be taken under the supervision of a healthcare provider
                      who can consider your complete medical history, current medications, and individual needs.
                    </p>
                  </div>
                </>
              ) : (
                <div className="bg-white p-6 rounded-lg shadow border text-center">
                  <p className="text-gray-500">
                    Please select a diagnosis to see potential treatment options.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-100 border-t py-4 px-6">
        <div className="container mx-auto text-center text-sm text-gray-500">
          <p>Symptom Scribe is for educational purposes only. Always consult a healthcare professional for medical advice.</p>
          <p className="mt-1">© {new Date().getFullYear()} Symptom Scribe</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
