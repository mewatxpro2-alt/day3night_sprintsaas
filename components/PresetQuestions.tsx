import React from 'react';
import { PRESET_QUESTIONS } from '../config/support';

interface PresetQuestionsProps {
    onSelect: (question: string) => void;
}

const PresetQuestions: React.FC<PresetQuestionsProps> = ({ onSelect }) => {
    return (
        <div className="space-y-3 animate-fade-in">
            <p className="text-sm text-textMuted text-center mb-4">
                Quick questions to get started:
            </p>

            <div className="grid grid-cols-1 gap-2">
                {PRESET_QUESTIONS.map((q) => (
                    <button
                        key={q.id}
                        onClick={() => onSelect(q.text)}
                        className="flex items-center gap-3 p-3 bg-surfaceHighlight hover:bg-accent-primary/10 border border-border rounded-lg text-left transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <span className="text-2xl flex-shrink-0">{q.icon}</span>
                        <span className="text-sm text-textMain font-medium">{q.text}</span>
                    </button>
                ))}
            </div>

            <p className="text-xs text-textMuted text-center mt-4">
                Or type your own question below 👇
            </p>
        </div>
    );
};

export default PresetQuestions;
