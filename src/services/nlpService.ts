
// Simple NLP service for symptom analysis
// This is a lightweight implementation that could be replaced with a more robust solution

// Entity types for medical NLP
export type EntityType = 'SYMPTOM' | 'DURATION' | 'SEVERITY' | 'BODY_PART';

export interface Entity {
  text: string;
  type: EntityType;
  confidence: number;
}

export interface NlpAnalysisResult {
  entities: Entity[];
  normalizedText: string;
  extractedSymptoms: string[];
  detectedTimeframes: string[];
  severityIndicators: {[symptom: string]: 'mild' | 'moderate' | 'severe'};
}

// Medical vocabulary for entity extraction
const medicalVocabulary = {
  symptoms: [
    'headache', 'migraine', 'pain', 'ache', 'cough', 'sneeze', 'sneezing',
    'runny nose', 'congestion', 'fever', 'chills', 'nausea', 'vomiting',
    'diarrhea', 'fatigue', 'tired', 'exhausted', 'sore throat', 'dizziness',
    'shortness of breath', 'breathing difficulty', 'rash', 'itchy', 'swollen'
  ],
  bodyParts: [
    'head', 'chest', 'stomach', 'throat', 'nose', 'ear', 'eyes', 'back',
    'neck', 'arm', 'leg', 'joint', 'muscle', 'skin', 'lung', 'heart'
  ],
  durations: [
    'day', 'days', 'week', 'weeks', 'month', 'months', 'year',
    'years', 'hour', 'hours', 'minute', 'minutes', 'second', 'seconds'
  ],
  severities: [
    'mild', 'moderate', 'severe', 'slight', 'extreme', 'intense',
    'excruciating', 'unbearable', 'barely', 'hardly', 'very', 'really'
  ]
};

// Utility function to tokenize text
const tokenize = (text: string): string[] => {
  // Convert to lowercase and split into words
  return text.toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Replace punctuation with spaces
    .split(/\s+/)             // Split on whitespace
    .filter(word => word.length > 0); // Remove empty strings
};

// Extract entities from text
const extractEntities = (text: string): Entity[] => {
  const tokens = tokenize(text);
  const entities: Entity[] = [];
  
  // Look for multi-word symptoms first (e.g., "runny nose")
  const multiWordSymptoms = medicalVocabulary.symptoms.filter(s => s.includes(' '));
  for (const symptom of multiWordSymptoms) {
    if (text.toLowerCase().includes(symptom)) {
      entities.push({
        text: symptom,
        type: 'SYMPTOM',
        confidence: 0.9
      });
    }
  }
  
  // Process individual tokens
  for (const token of tokens) {
    // Check if token is a symptom
    if (medicalVocabulary.symptoms.includes(token)) {
      // Avoid duplication with multi-word symptoms
      if (!entities.some(e => e.type === 'SYMPTOM' && e.text.includes(token))) {
        entities.push({
          text: token,
          type: 'SYMPTOM',
          confidence: 0.85
        });
      }
    }
    // Check if token is a body part
    else if (medicalVocabulary.bodyParts.includes(token)) {
      entities.push({
        text: token,
        type: 'BODY_PART',
        confidence: 0.8
      });
    }
    // Check if token is a duration term
    else if (medicalVocabulary.durations.includes(token)) {
      entities.push({
        text: token,
        type: 'DURATION',
        confidence: 0.8
      });
    }
    // Check if token is a severity term
    else if (medicalVocabulary.severities.includes(token)) {
      entities.push({
        text: token,
        type: 'SEVERITY',
        confidence: 0.75
      });
    }
  }
  
  // Look for numeric durations (e.g., "3 days")
  const durationRegex = /(\d+)\s+(day|days|week|weeks|month|months|year|years|hour|hours)/gi;
  let match;
  while ((match = durationRegex.exec(text)) !== null) {
    entities.push({
      text: match[0],
      type: 'DURATION',
      confidence: 0.9
    });
  }
  
  return entities;
};

// Extract symptom-severity pairs
const extractSymptomSeverity = (text: string, entities: Entity[]): {[symptom: string]: 'mild' | 'moderate' | 'severe'} => {
  const severityPairs: {[symptom: string]: 'mild' | 'moderate' | 'severe'} = {};
  
  const symptoms = entities.filter(e => e.type === 'SYMPTOM');
  const severities = entities.filter(e => e.type === 'SEVERITY');
  
  // Simple proximity-based pairing
  for (const symptom of symptoms) {
    let closestSeverity = 'moderate' as 'mild' | 'moderate' | 'severe';
    let minDistance = Infinity;
    
    for (const severity of severities) {
      const severityIdx = text.indexOf(severity.text);
      const symptomIdx = text.indexOf(symptom.text);
      const distance = Math.abs(severityIdx - symptomIdx);
      
      if (distance < minDistance) {
        minDistance = distance;
        
        // Map severity terms to standard levels
        if (['mild', 'slight', 'barely', 'hardly'].includes(severity.text)) {
          closestSeverity = 'mild';
        } else if (['moderate', 'somewhat'].includes(severity.text)) {
          closestSeverity = 'moderate';
        } else if (['severe', 'extreme', 'intense', 'excruciating', 'unbearable', 'very', 'really'].includes(severity.text)) {
          closestSeverity = 'severe';
        }
      }
    }
    
    // Only assign severity if it's close enough (within 5 words)
    if (minDistance < 20) {
      severityPairs[symptom.text] = closestSeverity;
    }
  }
  
  return severityPairs;
};

// Extract duration information
const extractDurations = (entities: Entity[]): string[] => {
  return entities
    .filter(e => e.type === 'DURATION')
    .map(e => e.text);
};

// Main NLP analysis function
export const analyzeText = (text: string): NlpAnalysisResult => {
  const entities = extractEntities(text);
  
  // Extract just the symptom texts
  const extractedSymptoms = entities
    .filter(e => e.type === 'SYMPTOM')
    .map(e => e.text);
  
  // Extract durations
  const detectedTimeframes = extractDurations(entities);
  
  // Extract severity indicators
  const severityIndicators = extractSymptomSeverity(text, entities);
  
  // Create normalized version of text with entities highlighted
  let normalizedText = text.toLowerCase();
  
  return {
    entities,
    normalizedText,
    extractedSymptoms,
    detectedTimeframes,
    severityIndicators
  };
};

// Return related symptoms based on a primary symptom
export const getSuggestedRelatedSymptoms = (symptom: string): string[] => {
  // Common symptom relationships
  const relatedSymptomMap: Record<string, string[]> = {
    'headache': ['nausea', 'sensitivity to light', 'dizziness'],
    'cough': ['sore throat', 'congestion', 'runny nose'],
    'fever': ['chills', 'fatigue', 'body ache'],
    'nausea': ['vomiting', 'diarrhea', 'stomach pain'],
    'rash': ['itchy', 'swelling', 'redness'],
  };
  
  return relatedSymptomMap[symptom] || [];
};
