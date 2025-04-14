
import React from "react";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface DisclaimerProps {
  className?: string;
}

export const Disclaimer: React.FC<DisclaimerProps> = ({ className }) => {
  return (
    <Alert variant="destructive" className={cn("bg-red-50 border-red-300 text-red-800", className)}>
      <AlertTriangle className="h-5 w-5" />
      <AlertTitle className="font-semibold">Medical Disclaimer</AlertTitle>
      <AlertDescription className="text-sm">
        This app uses Natural Language Processing to analyze symptoms for educational purposes only and is not a substitute 
        for professional medical advice, diagnosis, or treatment. The NLP analysis is limited and may not capture all medical 
        nuances. Always seek the advice of your physician or other qualified health provider with any questions you may have 
        regarding a medical condition.
      </AlertDescription>
    </Alert>
  );
};
