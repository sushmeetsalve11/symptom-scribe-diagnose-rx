
import React from "react";
import { AlertCircle, Clock, BadgeCheck, HeartPulse, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface MedicationInfo {
  id: string;
  name: string;
  genericName?: string;
  dosage: string;
  frequency: string;
  duration: string;
  sideEffects: string[];
  warnings: string[];
  interactionWarnings?: string[];
}

interface PrescriptionRecommendationProps {
  condition: string;
  medications: MedicationInfo[];
  className?: string;
}

export const PrescriptionRecommendation: React.FC<PrescriptionRecommendationProps> = ({
  condition,
  medications,
  className,
}) => {
  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-bold">Treatment Options for {condition}</CardTitle>
        <CardDescription className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <span className="text-red-500 font-semibold">
            These are only suggestions. Always consult with a healthcare provider.
          </span>
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            The following medications are commonly prescribed for treating {condition}. 
            The actual treatment should be determined by a qualified healthcare professional 
            based on your complete medical history, current medications, and specific circumstances.
          </p>
          
          <Accordion type="single" collapsible className="w-full">
            {medications.map((med) => (
              <AccordionItem key={med.id} value={med.id}>
                <AccordionTrigger className="hover:bg-gray-50 px-4 py-2 rounded-lg">
                  <div className="flex items-center gap-2 text-left">
                    <HeartPulse className="h-4 w-4 text-medical-500" />
                    <div>
                      <p className="font-medium">{med.name}</p>
                      {med.genericName && (
                        <p className="text-xs text-gray-500">({med.genericName})</p>
                      )}
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4">
                  <div className="space-y-4 pt-2">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-medical-500" />
                          <span className="text-sm font-medium">Dosage</span>
                        </div>
                        <p className="text-sm">{med.dosage}</p>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-medical-500" />
                          <span className="text-sm font-medium">Frequency</span>
                        </div>
                        <p className="text-sm">{med.frequency}</p>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-medical-500" />
                          <span className="text-sm font-medium">Duration</span>
                        </div>
                        <p className="text-sm">{med.duration}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="h-4 w-4 text-amber-500" />
                        <span className="text-sm font-medium">Side Effects</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {med.sideEffects.map((effect, i) => (
                          <Badge key={i} variant="outline" className="bg-amber-50 text-amber-800 border-amber-200">
                            {effect}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    {med.warnings.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-red-500" />
                          <span className="text-sm font-medium">Warnings</span>
                        </div>
                        <ul className="list-disc pl-5 space-y-1">
                          {med.warnings.map((warning, i) => (
                            <li key={i} className="text-sm text-red-700">
                              {warning}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {med.interactionWarnings && med.interactionWarnings.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-red-500" />
                          <span className="text-sm font-medium">Drug Interactions</span>
                        </div>
                        <ul className="list-disc pl-5 space-y-1">
                          {med.interactionWarnings.map((interaction, i) => (
                            <li key={i} className="text-sm text-red-700">
                              {interaction}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </CardContent>
      
      <CardFooter className="bg-gray-50 border-t rounded-b-lg">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <BadgeCheck className="h-4 w-4 text-green-500" />
                <span>Recommendations based on clinical guidelines</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs max-w-xs">
                Treatment recommendations are compiled from standard medical practice 
                guidelines and regularly updated medical references. Always verify with 
                your healthcare provider.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardFooter>
    </Card>
  );
};
