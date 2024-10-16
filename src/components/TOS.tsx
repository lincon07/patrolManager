import { Warning } from "@mui/icons-material";
import { Stepper, Step, StepLabel, Stack, Typography, Button, Box, Paper } from "@mui/material";
import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MainDataContext } from "../contexts/mainData";

const TOS = () => {
    const mainData = useContext(MainDataContext);
    const steps = [
        "You will abide by all DoJRP rules and regulations.",
        "You will not use this service to abuse the system.",
        "You will not share this service with anyone outside of DoJRP.",
        "You have sole responsibility for your account and its actions."
    ];

    const [activeStep, setActiveStep] = useState(0);
    const [completed, setCompleted] = useState(false);
    const nav = useNavigate();

    const handleNext = async () => {
        if (activeStep < steps.length - 1) {
            setActiveStep((prevStep) => prevStep + 1);
        } if (activeStep === steps.length - 1) {
            setCompleted(true);
            const existingData = await mainData?.MemberStore?.get("member");
            await mainData?.MemberStore?.set("member", {
                ...existingData, 
                hasAgreedtoTOS: true // Ensure we add this flag to the existing data
            });
            await mainData?.MemberStore?.save();
            nav("/settings");
        }
    };

    const handleReset = () => {
        setActiveStep(0);
        setCompleted(false);
    };

    return (
        <Stack spacing={4} sx={{ alignItems: 'center' }}>
            <Paper elevation={3} sx={{ padding: 4, width: '100%', maxWidth: 600 }}>
                <Typography variant="h5" align="center" gutterBottom>
                    Terms of Service
                </Typography>
                
                <Stepper activeStep={activeStep} orientation="vertical">
                    {steps.map((label, index) => (
                        <Step key={index} completed={index < activeStep}>
                            <StepLabel icon={<Warning color="warning" />}>
                                <Typography variant="body1">{label}</Typography>
                            </StepLabel>
                        </Step>
                    ))}
                </Stepper>

                <Box sx={{ mt: 3, mb: 2 }}>
                    {completed ? (
                        <Typography variant="h6" align="center" gutterBottom>
                            All steps completed – you have agreed to the Terms of Service.
                        </Typography>
                    ) : (
                        <Typography variant="body1" align="center" gutterBottom>
                            Please review and agree to the terms.
                        </Typography>
                    )}
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                    {!completed ? (
                        <Button variant="contained" onClick={handleNext} sx={{ mt: 1 }}>
                            {activeStep === steps.length - 1 ? 'Agree' : 'Next'}
                        </Button>
                    ) : (
                        <Button variant="contained" onClick={handleReset} sx={{ mt: 1 }}>
                            Reset
                        </Button>
                    )}
                </Box>
            </Paper>
        </Stack>
    );
};

export default TOS;
