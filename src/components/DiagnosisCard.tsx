
import React from "react";
import { ArrowRight, Info, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

export interface Diagnosis {
  id: string;
  condition: string;
  confidence: number;
  description: string;
  symptoms: string[];
  riskLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
}

interface DiagnosisCardProps {
  diagnosis: Diagnosis;
  onClick: (diagnosis: Diagnosis) => void;
  isSelected: boolean;
  className?: string;
}

export const DiagnosisCard: React.FC<DiagnosisCardProps> = ({
  diagnosis,
  onClick,
  isSelected,
  className,
}) => {
  const getRiskColor = (risk: string): string => {
    switch (risk) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-amber-500';
      case 'low':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  };
  
  const getConfidenceColor = (confidence: number): string => {
    if (confidence > 75) return 'bg-green-500';
    if (confidence > 50) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all hover:shadow-md",
        isSelected ? "border-2 border-medical-500 shadow-md" : "",
        className
      )}
      onClick={() => onClick(diagnosis)}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-bold">{diagnosis.condition}</CardTitle>
          <HoverCard>
            <HoverCardTrigger asChild>
              <Info className="h-4 w-4 text-gray-400 cursor-help" />
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <h4 className="font-semibold mb-1">About this condition</h4>
              <p className="text-sm text-gray-500">{diagnosis.description}</p>
            </HoverCardContent>
          </HoverCard>
        </div>
        <CardDescription className="flex items-center gap-1">
          <span className={getRiskColor(diagnosis.riskLevel)}>
            {diagnosis.riskLevel.charAt(0).toUpperCase() + diagnosis.riskLevel.slice(1)} Risk
          </span>
          {diagnosis.riskLevel === 'high' && (
            <AlertCircle className="h-3 w-3 text-red-500" />
          )}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3 pb-2">
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium">Confidence</span>
            <span className="text-sm font-bold">{diagnosis.confidence}%</span>
          </div>
          <Progress 
            value={diagnosis.confidence} 
            className={cn("h-2", getConfidenceColor(diagnosis.confidence))} 
          />
        </div>
        
        <div>
          <span className="text-sm font-medium">Matching Symptoms</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {diagnosis.symptoms.slice(0, 3).map((symptom, i) => (
              <span 
                key={i}
                className="inline-flex items-center px-2 py-1 rounded-full bg-symptom-100 text-symptom-800 text-xs"
              >
                {symptom}
              </span>
            ))}
            {diagnosis.symptoms.length > 3 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 text-gray-800 text-xs">
                +{diagnosis.symptoms.length - 3} more
              </span>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-2">
        <div 
          className="text-sm text-medical-600 flex items-center gap-1 font-medium"
        >
          View Recommendations
          <ArrowRight className="h-3 w-3 ml-1" />
        </div>
      </CardFooter>
    </Card>
  );
};
