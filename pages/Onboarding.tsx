import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import OnboardingLayout from '../components/Onboarding/OnboardingLayout';
import StepIntent from '../components/Onboarding/StepIntent';
import StepDetails from '../components/Onboarding/StepDetails';
import StepConfirmation from '../components/Onboarding/StepConfirmation';

const Onboarding = () => {
    const navigate = useNavigate();
    const { user, refreshProfile } = useAuth();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<any>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        // Redirect if not logged in
        if (!user) {
            // navigate('/signin'); // Let the protected route handle this? 
            // Actually this page should be protected.
        }
    }, [user, navigate]);

    const handleIntentSelect = (intent: string) => {
        const newData = { ...formData, primary_intent: intent };
        setFormData(newData);

        // If unsure, skip details
        if (intent === 'unsure') {
            saveAndFinish(newData);
        } else {
            setStep(2);
        }
    };

    const handleDetailsComplete = (details: any) => {
        const newData = { ...formData, ...details };
        setFormData(newData);
        setStep(3); // Go to confirmation (which triggers save on 'Continue')
    };

    const saveAndFinish = async (finalData: any = formData) => {
        if (!user) return;
        setIsSubmitting(true);

        try {
            const updatePayload = {
                ...finalData,
                onboarding_completed: true,
                onboarding_completed_at: new Date().toISOString()
            };

            const { error } = await supabase
                .from('profiles')
                .update(updatePayload)
                .eq('id', user.id);

            if (error) throw error;

            // Refresh local profile state
            if (refreshProfile) await refreshProfile();

            // Store flag for animation specific to this session if needed
            // But usually we just redirect

            // Redirect based on intent
            if (finalData.primary_intent === 'sell') {
                navigate('/seller');
            } else {
                navigate('/mvp-kits');
            }

        } catch (err) {
            console.error('Onboarding save error:', err);
            // Fallback redirect
            navigate('/dashboard');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSkip = () => {
        // Mark as completed but with empty data? 
        // Or just 'unsure'? User requirement says allow skip.
        // "Allow Skip anytime"
        // "Total steps: 2–4 max"
        // "If some answers are missing (skipped), gracefully omit those phrases"

        // We'll treat skip as "unsure" basically, or just minimal data
        saveAndFinish({
            primary_intent: 'unsure',
            onboarding_completed: true, // Mark complete so they aren't bugged again
            onboarding_completed_at: new Date().toISOString()
        });
    };

    // Render Steps
    const renderStep = () => {
        switch (step) {
            case 1:
                return <StepIntent onSelect={handleIntentSelect} />;
            case 2:
                return <StepDetails intent={formData.primary_intent} onComplete={handleDetailsComplete} />;
            case 3:
                // Step 3 is the confirmation view which SAVES at the end
                // Actually, the requirement says "Mark onboarding as fully completed after this screen"
                // So we SAVE on the "Continue" button click inside StepConfirmation?
                // Or we save BEFORE showing it?
                // "Generate a sentence like... Text must be assembled only from stored onboarding data"
                // It implies we should have data. But simpler is: save on "Continue".

                return <StepConfirmation data={formData} onComplete={() => saveAndFinish()} />;
            default:
                return null;
        }
    };

    // No skip on final step
    const showSkip = step < 3;

    return (
        <OnboardingLayout
            currentStep={step}
            totalSteps={3}
            onSkip={showSkip ? handleSkip : undefined}
        >
            {renderStep()}
        </OnboardingLayout>
    );
};

export default Onboarding;
