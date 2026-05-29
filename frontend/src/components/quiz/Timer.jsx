import React from "react";
import { Clock } from "lucide-react";
const Timer = ({ secondsRemaining }) => {
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;{/* Formatting values */}const formattedMinutes = String(minutes).padStart(2,'0'); 
  const formattedSeconds = String(seconds).padStart(2,'0');{/* Choose alert styling based on remaining duration */}const getTimerStyles = () => { 
    if (secondsRemaining <= 60) { {/* Critical (Under 60 seconds) - blinking red */}return 'bg-rose-50 text-rose-600 border-rose-200/50 animate-pulse'; 
    } else if (secondsRemaining <= 180) { {/* Warning (Under 3 minutes) - yellow alert */}return 'bg-amber-50 text-amber-600 border-amber-200/50'; 
    } else { {/* Safe (Over 3 minutes) - neutral indigo */}return 'bg-slate-50 text-slate-700 border-slate-200'; 
    } 
  }; 
  
  return ( 
    <div className={`flex items-center gap-2 rounded-xl border px-3.5 py-1.5 font-mono text-sm font-bold shadow-sm transition-all ${getTimerStyles()}`}> 
      <Clock className="h-4 w-4"/> 
      <span> {formattedMinutes}:{formattedSeconds} </span> 
    </div> 
  );
};
export default Timer;
