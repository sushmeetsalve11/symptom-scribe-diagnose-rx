import { Diagnosis } from "@/components/DiagnosisCard";
import { MedicationInfo } from "@/components/PrescriptionRecommendation";
import { analyzeText } from "./nlpService";

// Mock symptom keywords to diagnosis mapping
const symptomKeywordMap: Record<string, string[]> = {
  // Headache related
  "headache": ["migraine", "tension headache", "cluster headache", "sinusitis"],
  "head pain": ["migraine", "tension headache", "cluster headache", "sinusitis"],
  "migraine": ["migraine"],
  
  // Respiratory related
  "cough": ["common cold", "flu", "bronchitis", "covid-19", "allergies", "sinusitis"],
  "runny nose": ["common cold", "flu", "allergies", "sinusitis"],
  "sneezing": ["common cold", "allergies", "sinusitis"],
  "sore throat": ["common cold", "flu", "strep throat", "tonsillitis"],
  "congestion": ["common cold", "flu", "allergies", "sinusitis"],
  
  // Fever related
  "fever": ["common cold", "flu", "covid-19", "strep throat", "bronchitis", "tonsillitis"],
  "chills": ["flu", "covid-19", "strep throat"],
  
  // Digestive related
  "nausea": ["flu", "food poisoning", "gastroenteritis"],
  "vomiting": ["flu", "food poisoning", "gastroenteritis", "migraine"],
  "diarrhea": ["food poisoning", "gastroenteritis"],
  "abdominal pain": ["food poisoning", "gastroenteritis", "appendicitis"],
  "stomach pain": ["food poisoning", "gastroenteritis", "appendicitis"],
  
  // Skin related
  "rash": ["allergies", "eczema", "contact dermatitis"],
  "itchy": ["allergies", "eczema", "contact dermatitis"],
  "skin": ["allergies", "eczema", "contact dermatitis"],
  
  // Pain related
  "joint pain": ["flu", "arthritis"],
  "body ache": ["flu", "common cold"],
  "muscle pain": ["flu", "common cold"],
  "fatigue": ["common cold", "flu", "covid-19", "allergies", "migraine"],
  "tired": ["common cold", "flu", "covid-19", "allergies", "migraine"],
  
  // Specific to conditions
  "runny eyes": ["allergies"],
  "difficulty breathing": ["covid-19", "asthma", "allergies"],
  "shortness of breath": ["covid-19", "asthma"],
  "loss of taste": ["covid-19"],
  "loss of smell": ["covid-19", "sinusitis"],
  "ear pain": ["ear infection", "sinusitis"],
};

// Mock diagnosis database
const diagnosisDatabase: Record<string, Omit<Diagnosis, 'id' | 'confidence'>> = {
  "common cold": {
    condition: "Common Cold",
    description: "A viral infection of the upper respiratory tract, primarily the nose and throat. Most people recover within 7-10 days.",
    symptoms: ["runny nose", "sneezing", "congestion", "sore throat", "cough", "mild fatigue"],
    riskLevel: "low",
    recommendations: ["rest", "hydration", "over-the-counter remedies"]
  },
  "flu": {
    condition: "Influenza (Flu)",
    description: "A contagious respiratory illness caused by influenza viruses. It can cause mild to severe illness and can be serious in high-risk individuals.",
    symptoms: ["fever", "chills", "cough", "sore throat", "body aches", "fatigue", "headache"],
    riskLevel: "medium",
    recommendations: ["antiviral medications", "rest", "hydration"]
  },
  "migraine": {
    condition: "Migraine",
    description: "A neurological condition characterized by intense, debilitating headaches often accompanied by nausea, vomiting, and sensitivity to light and sound.",
    symptoms: ["severe headache", "throbbing pain", "nausea", "vomiting", "sensitivity to light", "sensitivity to sound"],
    riskLevel: "low",
    recommendations: ["pain relievers", "triptans", "anti-nausea medications"]
  },
  "tension headache": {
    condition: "Tension Headache",
    description: "The most common type of headache, characterized by dull, aching head pain and tightness across the forehead or back of the head.",
    symptoms: ["mild to moderate headache", "pressure around head", "tenderness on scalp"],
    riskLevel: "low",
    recommendations: ["pain relievers", "stress management", "rest"]
  },
  "sinusitis": {
    condition: "Sinusitis",
    description: "Inflammation of the sinus cavities, usually due to infection or allergies.",
    symptoms: ["facial pressure", "congestion", "thick nasal discharge", "reduced sense of smell", "headache", "post-nasal drip"],
    riskLevel: "low",
    recommendations: ["decongestants", "nasal steroids", "antibiotics if bacterial"]
  },
  "allergies": {
    condition: "Seasonal Allergies",
    description: "An immune system reaction to substances in the environment like pollen, dust mites, or pet dander.",
    symptoms: ["sneezing", "runny nose", "itchy eyes", "congestion", "runny eyes", "itchy throat"],
    riskLevel: "low",
    recommendations: ["antihistamines", "nasal steroids", "decongestants"]
  },
  "covid-19": {
    condition: "COVID-19",
    description: "A respiratory illness caused by the SARS-CoV-2 virus. Symptoms range from mild to severe.",
    symptoms: ["fever", "cough", "shortness of breath", "fatigue", "loss of taste", "loss of smell", "sore throat"],
    riskLevel: "high",
    recommendations: ["consult healthcare provider", "isolation", "supportive care"]
  },
  "strep throat": {
    condition: "Strep Throat",
    description: "A bacterial infection causing inflammation and pain in the throat.",
    symptoms: ["severe sore throat", "pain when swallowing", "fever", "red tonsils", "white spots on tonsils"],
    riskLevel: "medium",
    recommendations: ["antibiotics", "pain relievers", "rest"]
  },
  "bronchitis": {
    condition: "Bronchitis",
    description: "Inflammation of the lining of the bronchial tubes which carry air to and from the lungs.",
    symptoms: ["persistent cough", "chest discomfort", "fatigue", "mild fever", "shortness of breath"],
    riskLevel: "medium",
    recommendations: ["rest", "hydration", "bronchodilators"]
  },
  "gastroenteritis": {
    condition: "Gastroenteritis",
    description: "Inflammation of the stomach and intestines, typically resulting from bacterial or viral infections.",
    symptoms: ["diarrhea", "nausea", "vomiting", "abdominal cramps", "fever", "dehydration"],
    riskLevel: "medium",
    recommendations: ["hydration", "rest", "bland diet"]
  },
};

// Mock medication database
const medicationDatabase: Record<string, MedicationInfo[]> = {
  "Common Cold": [
    {
      id: "med-cold-1",
      name: "Acetaminophen (Tylenol)",
      genericName: "Acetaminophen",
      dosage: "325-650mg",
      frequency: "Every 4-6 hours as needed",
      duration: "Up to 10 days",
      sideEffects: ["Liver damage (with overuse)", "Nausea", "Rash"],
      warnings: [
        "Do not exceed 3000mg in 24 hours",
        "Avoid alcohol consumption",
        "Use caution if you have liver disease"
      ]
    },
    {
      id: "med-cold-2",
      name: "Dextromethorphan (Robitussin DM)",
      genericName: "Dextromethorphan",
      dosage: "10-20mg",
      frequency: "Every 4 hours as needed",
      duration: "Up to 7 days",
      sideEffects: ["Drowsiness", "Dizziness", "Nausea"],
      warnings: [
        "Avoid if taking MAO inhibitors",
        "May cause drowsiness - avoid driving",
        "Do not use for persistent or chronic cough"
      ]
    }
  ],
  "Influenza (Flu)": [
    {
      id: "med-flu-1",
      name: "Oseltamivir (Tamiflu)",
      genericName: "Oseltamivir Phosphate",
      dosage: "75mg",
      frequency: "Twice daily",
      duration: "5 days",
      sideEffects: ["Nausea", "Vomiting", "Headache"],
      warnings: [
        "Most effective when started within 48 hours of symptoms",
        "Complete the full treatment course",
        "May cause neuropsychiatric effects in rare cases"
      ]
    },
    {
      id: "med-flu-2",
      name: "Ibuprofen (Advil)",
      genericName: "Ibuprofen",
      dosage: "200-400mg",
      frequency: "Every 4-6 hours as needed",
      duration: "Up to 10 days",
      sideEffects: ["Stomach pain", "Heartburn", "Dizziness", "Mild headache"],
      warnings: [
        "Take with food to reduce stomach irritation",
        "Avoid if you have kidney disease",
        "Do not take with other NSAIDs"
      ],
      interactionWarnings: [
        "May interact with blood thinners",
        "May increase blood pressure if taking certain medications"
      ]
    }
  ],
  "Migraine": [
    {
      id: "med-migraine-1",
      name: "Sumatriptan (Imitrex)",
      genericName: "Sumatriptan Succinate",
      dosage: "25-100mg",
      frequency: "Once at onset, may repeat after 2 hours if needed",
      duration: "As needed (max 200mg/day)",
      sideEffects: ["Tingling", "Dizziness", "Fatigue", "Neck/throat/jaw pain"],
      warnings: [
        "Do not use if you have heart disease or uncontrolled high blood pressure",
        "Do not use within 24 hours of other triptan medications",
        "Do not use within 2 weeks of MAO inhibitors"
      ],
      interactionWarnings: [
        "May interact with certain antidepressants (SSRIs or SNRIs)",
        "Do not combine with ergotamine-containing drugs"
      ]
    },
    {
      id: "med-migraine-2",
      name: "Rizatriptan (Maxalt)",
      genericName: "Rizatriptan Benzoate",
      dosage: "5-10mg",
      frequency: "Once at onset, may repeat after 2 hours if needed",
      duration: "As needed (max 30mg/day)",
      sideEffects: ["Dizziness", "Drowsiness", "Fatigue", "Dry mouth"],
      warnings: [
        "Do not use if you have heart disease",
        "Do not use within 24 hours of other triptan medications",
        "Do not use within 2 weeks of MAO inhibitors"
      ]
    }
  ],
  "Tension Headache": [
    {
      id: "med-tension-1",
      name: "Ibuprofen (Advil)",
      genericName: "Ibuprofen",
      dosage: "200-400mg",
      frequency: "Every 4-6 hours as needed",
      duration: "Up to 10 days",
      sideEffects: ["Stomach pain", "Heartburn", "Dizziness"],
      warnings: [
        "Take with food to reduce stomach irritation",
        "Avoid if you have kidney disease",
        "Do not take with other NSAIDs"
      ]
    },
    {
      id: "med-tension-2",
      name: "Acetaminophen (Tylenol)",
      genericName: "Acetaminophen",
      dosage: "325-650mg",
      frequency: "Every 4-6 hours as needed",
      duration: "Up to 10 days",
      sideEffects: ["Liver damage (with overuse)", "Nausea"],
      warnings: [
        "Do not exceed 3000mg in 24 hours",
        "Avoid alcohol consumption",
        "Use caution if you have liver disease"
      ]
    }
  ],
  "Sinusitis": [
    {
      id: "med-sinus-1",
      name: "Amoxicillin",
      genericName: "Amoxicillin",
      dosage: "250-500mg",
      frequency: "Three times daily",
      duration: "10-14 days",
      sideEffects: ["Diarrhea", "Stomach upset", "Rash"],
      warnings: [
        "Complete the full course even if feeling better",
        "Notify doctor if severe diarrhea occurs",
        "Tell your doctor if you have allergies to penicillin"
      ]
    },
    {
      id: "med-sinus-2",
      name: "Fluticasone (Flonase)",
      genericName: "Fluticasone Propionate",
      dosage: "1-2 sprays per nostril",
      frequency: "Once daily",
      duration: "Up to several months (as directed)",
      sideEffects: ["Nasal irritation", "Headache", "Nosebleeds"],
      warnings: [
        "May take several days to notice improvement",
        "Avoid spraying directly onto nasal septum",
        "If symptoms worsen, discontinue use and consult doctor"
      ]
    }
  ],
  "Seasonal Allergies": [
    {
      id: "med-allergy-1",
      name: "Loratadine (Claritin)",
      genericName: "Loratadine",
      dosage: "10mg",
      frequency: "Once daily",
      duration: "As needed during allergy season",
      sideEffects: ["Headache", "Drowsiness (rare)", "Dry mouth"],
      warnings: [
        "Non-drowsy for most people",
        "Take consistently for best results",
        "May take a few days to reach full effectiveness"
      ]
    },
    {
      id: "med-allergy-2",
      name: "Cetirizine (Zyrtec)",
      genericName: "Cetirizine Hydrochloride",
      dosage: "5-10mg",
      frequency: "Once daily",
      duration: "As needed during allergy season",
      sideEffects: ["Drowsiness", "Fatigue", "Dry mouth"],
      warnings: [
        "May cause more drowsiness than loratadine",
        "Avoid alcohol while taking this medication",
        "May cause increased drowsiness in older adults"
      ]
    }
  ],
  "COVID-19": [
    {
      id: "med-covid-1",
      name: "Consult a healthcare provider",
      genericName: "No self-medication recommended",
      dosage: "As prescribed",
      frequency: "As prescribed",
      duration: "As prescribed",
      sideEffects: ["Varies by medication"],
      warnings: [
        "COVID-19 requires proper medical consultation",
        "Follow isolation guidelines",
        "Seek emergency care for severe symptoms"
      ]
    }
  ],
  "Strep Throat": [
    {
      id: "med-strep-1",
      name: "Penicillin V",
      genericName: "Penicillin V Potassium",
      dosage: "250-500mg",
      frequency: "Four times daily",
      duration: "10 days",
      sideEffects: ["Diarrhea", "Nausea", "Rash"],
      warnings: [
        "Complete the full course even if feeling better",
        "Tell your doctor if you have allergies to penicillin",
        "Take on an empty stomach 1 hour before or 2 hours after meals"
      ]
    },
    {
      id: "med-strep-2",
      name: "Azithromycin (Zithromax)",
      genericName: "Azithromycin",
      dosage: "500mg day 1, 250mg days 2-5",
      frequency: "Once daily",
      duration: "5 days",
      sideEffects: ["Diarrhea", "Stomach pain", "Nausea"],
      warnings: [
        "For patients with penicillin allergy",
        "May interact with certain medications",
        "May cause heart rhythm problems in rare cases"
      ],
      interactionWarnings: [
        "Do not take with certain heart medications",
        "May interact with antacids containing aluminum or magnesium"
      ]
    }
  ],
  "Bronchitis": [
    {
      id: "med-bronch-1",
      name: "Albuterol (ProAir, Ventolin)",
      genericName: "Albuterol Sulfate",
      dosage: "1-2 inhalations",
      frequency: "Every 4-6 hours as needed",
      duration: "As needed",
      sideEffects: ["Nervousness", "Tremor", "Increased heart rate", "Headache"],
      warnings: [
        "Do not exceed recommended dosage",
        "Seek medical attention if symptoms worsen",
        "Use caution if you have heart disease or high blood pressure"
      ]
    },
    {
      id: "med-bronch-2",
      name: "Guaifenesin (Mucinex)",
      genericName: "Guaifenesin",
      dosage: "200-400mg",
      frequency: "Every 4 hours",
      duration: "Up to 7 days",
      sideEffects: ["Nausea", "Vomiting", "Drowsiness"],
      warnings: [
        "Drink plenty of fluids",
        "May not be suitable for children under 4 years",
        "Consult doctor if symptoms persist more than 7 days"
      ]
    }
  ],
  "Gastroenteritis": [
    {
      id: "med-gastro-1",
      name: "Loperamide (Imodium)",
      genericName: "Loperamide Hydrochloride",
      dosage: "2mg after first loose stool, then 1mg after each subsequent loose stool",
      frequency: "As needed (max 8mg/day for OTC use)",
      duration: "Up to 2 days",
      sideEffects: ["Constipation", "Dry mouth", "Drowsiness", "Dizziness"],
      warnings: [
        "Do not use if bloody diarrhea or high fever present",
        "Not for children under 2 years",
        "Discontinue use if symptoms worsen"
      ]
    },
    {
      id: "med-gastro-2",
      name: "Oral Rehydration Solution (Pedialyte, Gatorade)",
      genericName: "Multiple electrolytes",
      dosage: "As directed on package",
      frequency: "Throughout the day",
      duration: "Until symptoms resolve",
      sideEffects: ["Generally well-tolerated"],
      warnings: [
        "Critical for preventing dehydration",
        "Especially important for children and elderly",
        "Seek medical attention if unable to keep fluids down"
      ]
    }
  ]
};

// Enhanced helper function to identify potential diagnoses based on NLP analysis
const identifyPotentialDiagnoses = (symptomText: string): [string[], string[]] => {
  const symptoms: string[] = [];
  const conditions = new Set<string>();
  
  // Use NLP to extract symptom entities
  const nlpResult = analyzeText(symptomText);
  const extractedSymptoms = nlpResult.extractedSymptoms;
  
  // Add extracted symptoms to the list
  extractedSymptoms.forEach(symptom => {
    symptoms.push(symptom);
  });
  
  // Check for keyword matches in the extracted symptoms
  extractedSymptoms.forEach(symptom => {
    if (symptomKeywordMap[symptom]) {
      symptomKeywordMap[symptom].forEach(condition => conditions.add(condition));
    }
  });
  
  // If no direct matches, fall back to the old text search method
  if (conditions.size === 0) {
    // Convert to lowercase for case-insensitive matching
    const text = symptomText.toLowerCase();
    
    // Check for keyword matches in symptom text
    Object.entries(symptomKeywordMap).forEach(([keyword, relatedConditions]) => {
      if (text.includes(keyword)) {
        symptoms.push(keyword);
        relatedConditions.forEach(condition => conditions.add(condition));
      }
    });
  }

  return [symptoms, Array.from(conditions)];
};

// Enhanced function to generate confidence scores with NLP insights
const generateConfidenceScores = (
  symptoms: string[], 
  conditions: string[],
  originalText: string
): Diagnosis[] => {
  const diagnoses: Diagnosis[] = [];
  
  // Get NLP analysis for severity information
  const nlpResult = analyzeText(originalText);
  
  // For each condition, calculate a confidence score
  conditions.forEach(conditionKey => {
    const conditionData = diagnosisDatabase[conditionKey];
    if (!conditionData) return;
    
    // Count matching symptoms
    const matchingSymptoms = symptoms.filter(symptom => 
      conditionData.symptoms.includes(symptom)
    );
    
    // Calculate base confidence score
    const totalConditionSymptoms = conditionData.symptoms.length;
    const matchedSymptomCount = matchingSymptoms.length;
    
    // Base confidence on % of condition's symptoms that were matched
    let confidence = Math.min(
      95, 
      Math.max(
        30,
        Math.round(
          (matchedSymptomCount / Math.min(3, totalConditionSymptoms)) * 80
          + Math.random() * 15
        )
      )
    );
    
    // Apply NLP-based adjustments
    
    // 1. Adjust based on symptom severity
    const severeSymptomCount = matchingSymptoms.filter(symptom => 
      nlpResult.severityIndicators[symptom] === 'severe'
    ).length;
    
    // Increase confidence if severe symptoms are present
    if (severeSymptomCount > 0) {
      confidence = Math.min(95, confidence + (severeSymptomCount * 5));
    }
    
    // 2. Adjust based on duration
    const hasDurationInfo = nlpResult.detectedTimeframes.length > 0;
    if (hasDurationInfo) {
      // Specific conditions are more likely with longer durations
      const longTermConditions = ['sinusitis', 'allergies', 'asthma'];
      const hasLongDuration = nlpResult.detectedTimeframes.some(d => 
        d.includes('week') || d.includes('month') || d.includes('year')
      );
      
      if (hasLongDuration && longTermConditions.includes(conditionKey)) {
        confidence = Math.min(95, confidence + 10);
      } else if (hasLongDuration && !longTermConditions.includes(conditionKey)) {
        confidence = Math.max(30, confidence - 5);
      }
    }
    
    // COVID-19 special case - don't overrepresent
    if (conditionKey === "covid-19" && matchedSymptomCount < 3) {
      confidence = Math.min(confidence, 50);
    }
    
    diagnoses.push({
      id: `diag-${conditions.indexOf(conditionKey)}`,
      condition: conditionData.condition,
      confidence,
      description: conditionData.description,
      symptoms: conditionData.symptoms,
      riskLevel: conditionData.riskLevel,
      recommendations: conditionData.recommendations
    });
  });
  
  // Sort by confidence score (descending)
  return diagnoses.sort((a, b) => b.confidence - a.confidence);
};

// Get medication suggestions for a condition
const getMedicationSuggestions = (condition: string): MedicationInfo[] => {
  return medicationDatabase[condition] || [];
};

// Enhanced diagnostic analysis using NLP
export const analyzeSymptomsAndGetDiagnoses = async (
  symptomText: string
): Promise<Diagnosis[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Process the symptoms and identify potential conditions
  const [symptoms, conditions] = identifyPotentialDiagnoses(symptomText);
  
  // If no conditions identified, return generic response
  if (conditions.length === 0) {
    return [{
      id: "diag-unknown",
      condition: "Insufficient Information",
      confidence: 30,
      description: "There isn't enough specific symptom information to determine a potential diagnosis. Please provide more details about your symptoms.",
      symptoms: symptoms.length > 0 ? symptoms : ["none identified"],
      riskLevel: "low",
      recommendations: ["provide more specific symptoms", "consult healthcare provider"]
    }];
  }
  
  // Generate confidence scores and return diagnoses
  return generateConfidenceScores(symptoms, conditions, symptomText);
};

// Get recommended medications for a condition
export const getRecommendedMedications = (
  condition: string
): MedicationInfo[] => {
  return getMedicationSuggestions(condition);
};

// Get initial bot messages
export const getInitialMessages = () => {
  return [
    {
      id: "welcome-1",
      content: "Hello! I'm your Symptom Scribe assistant. I can help analyze your symptoms and suggest possible diagnoses along with common prescription recommendations.",
      sender: 'bot' as const,
      timestamp: new Date()
    },
    {
      id: "welcome-2",
      content: "Please describe your symptoms in detail. For example: 'I've had a severe headache and fever for the past 3 days, along with a sore throat.'",
      sender: 'bot' as const,
      timestamp: new Date()
    },
    {
      id: "disclaimer-1",
      content: "IMPORTANT: This is for informational purposes only and should not replace professional medical advice. Always consult a healthcare provider for diagnosis and treatment.",
      sender: 'bot' as const,
      timestamp: new Date()
    }
  ];
};
