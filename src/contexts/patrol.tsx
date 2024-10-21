import React, { useContext, useEffect, useState } from "react";
import { Department, PatrolContextType, PatrolLogs, Server, Subdivision, SubdivisionUsage } from "../types";
import { enqueueSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";
import { MainDataContext } from "./mainData";
import { Dialog, DialogActions, DialogContent, DialogTitle, Button } from '@mui/material';

const PatrolContext = React.createContext<PatrolContextType | null>(null);

const PatrolProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const mainData = useContext(MainDataContext);
    const [selectedDepartment, setSelectedDepartment] = React.useState<Department | null>(null);
    const [selectedServer, setSelectedServer] = React.useState<Server | null>(null);
    const [onDuty, setOnDuty] = React.useState<boolean>(false);
    const [isMemberData, setIsMemberData] = React.useState<boolean>(false);
    const [litePatrolMode, setLitePatrolMode] = React.useState<boolean>(mainData?.Members?.litePatrolMode || false);
    const [mainPatrolDuration, setMainPatrolDuration] = React.useState<number>(0);
    const [subdivisionUsage, setSubdivisionUsage] = React.useState<SubdivisionUsage[]>([]);
    const [activeSubdivision, setActiveSubdivision] = React.useState<string | null>(null);

    const subdivisionIntervalRef = React.useRef<number | null>(null); // Ref for interval ID
    const activeSubdivisionStartTimeRef = React.useRef<Date | null>(null); // Ref to store start time

    const [subdivisionToResume, setSubdivisionToResume] = useState<Subdivision | null>(null);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState<boolean>(false);

    const nav = useNavigate();

    // Effect to handle the main patrol duration timer when onDuty is true
    useEffect(() => {
        let interval: number | null = null;
        if (onDuty) {
            interval = window.setInterval(() => {
                setMainPatrolDuration((prevDuration) => prevDuration + 1);
            }, 1000);
        }

        return () => {
            if (interval !== null) {
                clearInterval(interval);
            }
        };
    }, [onDuty]);

    // Handle select department
    const handleSelectDepartment = (dept: Department) => {
        setSelectedDepartment(dept);
        enqueueSnackbar(`Selected Department: ${dept.FullName}`, { variant: "info" });
    };

    // Handle select server
    const handleSelectServer = (server: Server) => {
        setSelectedServer(server);
        enqueueSnackbar(`Selected Server: ${server.FullName}`, { variant: "info" });
    };

    // Handle patrol log creation
    const handleCreatePatrolLog = async (newPatrolLog: PatrolLogs) => {
        try {
            const existingMemberData = await mainData?.MemberStore?.get('member') || {};
            const existingPatrolLogs = existingMemberData.PatrolLogs || [];
            const updatedPatrolLogs = [...existingPatrolLogs, newPatrolLog];

            const updatedMemberData = {
                ...existingMemberData,
                PatrolLogs: updatedPatrolLogs
            };

            await mainData?.MemberStore?.set('member', updatedMemberData);
            await mainData?.MemberStore?.save();
            enqueueSnackbar("Patrol log updated", { variant: "success" });
        } catch (error) {
            console.error("Failed to update patrol logs", error);
            enqueueSnackbar("Failed to update patrol logs", { variant: "error" });
        }
    };

    // Handle deleting patrol log
    const handleDeletePatrolLog = async (index: number) => {
        try {
            const existingMemberData = await mainData?.MemberStore?.get('member') || {};
            const existingPatrolLogs = existingMemberData.PatrolLogs || [];
            const updatedPatrolLogs = existingPatrolLogs.filter((_: any, i: any) => i !== index);

            const updatedMemberData = {
                ...existingMemberData,
                PatrolLogs: updatedPatrolLogs
            };

            await mainData?.MemberStore?.set('member', updatedMemberData);
            await mainData?.MemberStore?.save();
            enqueueSnackbar("Patrol log deleted", { variant: "success" });
        } catch (error) {
            console.error("Failed to delete patrol log", error);
            enqueueSnackbar("Failed to delete patrol log", { variant: "error" });
        }
    };

    // Handle starting subdivision usage with check for existing usage
    const handleStartSubdivisionUsage = (subdivision: Subdivision) => {
        const existingSubdivision = subdivisionUsage.find(
            (usage) => usage.Subdivision.Alias === subdivision.Alias && usage.EndTime
        );

        if (existingSubdivision) {
            // If the subdivision exists and is paused, ask user to resume or overwrite
            setSubdivisionToResume(subdivision);
            setConfirmDialogOpen(true);
        } else {
            startNewSubdivision(subdivision); // Start fresh if no existing subdivision is found
        }
    };

    // Function to actually start a new subdivision
    const startNewSubdivision = (subdivision: Subdivision) => {
        if (activeSubdivision) {
            enqueueSnackbar(`You can only have one active subdivision at a time. Please stop or pause ${activeSubdivision} before starting another.`, { variant: "warning" });
            return;
        }
    
        const newSubdivisionUsage: SubdivisionUsage = {
            Subdivision: subdivision,
            StartTime: new Date(),
            EndTime: null,
            Duration: 0, 
            Active: true,
            Paused: false // Initially, the subdivision is not paused
        };
    
        setSubdivisionUsage((prevUsage) => [...prevUsage, newSubdivisionUsage]);
        setActiveSubdivision(subdivision.Alias);
        activeSubdivisionStartTimeRef.current = new Date();
    
        startSubdivisionTimer(subdivision);
    };

    // Helper function to start subdivision timer
    const startSubdivisionTimer = (subdivision: Subdivision) => {
        if (subdivisionIntervalRef.current) {
            clearInterval(subdivisionIntervalRef.current);
        }

        subdivisionIntervalRef.current = window.setInterval(() => {
            const startTime = activeSubdivisionStartTimeRef.current;
            if (!startTime) return;

            const now = new Date();
            const elapsedTime = Math.floor((now.getTime() - startTime.getTime()) / 1000);

            setSubdivisionUsage((prevUsage) =>
                prevUsage.map((usage) => {
                    if (usage.Subdivision.Alias === subdivision.Alias && !usage.EndTime) {
                        return { ...usage, Duration: elapsedTime };
                    }
                    return usage;
                })
            );
        }, 1000);
    };

    // Function to handle resuming the existing subdivision
    const handleResumeSubdivision = () => {
        if (subdivisionToResume) {
            activeSubdivisionStartTimeRef.current = new Date(); // Set the new start time when resuming
            setSubdivisionUsage((prevUsage) =>
                prevUsage.map((usage) => {
                    if (usage.Subdivision.Alias === subdivisionToResume.Alias && usage.EndTime) {
                        return { ...usage, EndTime: null, Paused: false, Active: true }; // Mark as resumed
                    }
                    return usage;
                })
            );
            setActiveSubdivision(subdivisionToResume.Alias);
            startSubdivisionTimer(subdivisionToResume);
        }
        setConfirmDialogOpen(false);
    };

    // Function to handle overwriting the existing subdivision
    const handleOverwriteSubdivision = () => {
        if (subdivisionToResume) {
            startNewSubdivision(subdivisionToResume); // Overwrite with a fresh start
        }
        setConfirmDialogOpen(false);
    };

    // Handle stopping subdivision usage
    const handleStopSubdivisionUsage = (subdivision: Subdivision) => {
        setSubdivisionUsage((prevSubUsage) => {
            return prevSubUsage.map((usage) => {
                if (usage.Subdivision.Alias === subdivision.Alias && !usage.EndTime) {
                    return { ...usage, EndTime: new Date(), Active: false };
                }
                return usage;
            });
        });

        if (subdivisionIntervalRef.current) {
            clearInterval(subdivisionIntervalRef.current);
            subdivisionIntervalRef.current = null;
        }

        setActiveSubdivision(null);
    };

    // Handle pausing subdivision usage
    const handlePauseSubdivisionUsage = (subdivision: Subdivision) => {
        setSubdivisionUsage((prevSubUsage) => {
            return prevSubUsage.map((usage) => {
                if (usage.Subdivision.Alias === subdivision.Alias && !usage.EndTime) {
                    return { ...usage, Paused: true, Active: false }; // Paused and no longer active
                }
                return usage;
            });
        });
    
        if (subdivisionIntervalRef.current) {
            clearInterval(subdivisionIntervalRef.current);
            subdivisionIntervalRef.current = null;
        }
    
        setActiveSubdivision(null); // No active subdivision after pausing
    };
    

    // Handle on duty
    const handleOnDuty = () => {
        setOnDuty(true);
        enqueueSnackbar("You are now on duty", { variant: "info" });

        if (selectedDepartment && selectedServer) {
            const newPatrolLog: PatrolLogs = {
                department: selectedDepartment,
                server: selectedServer,
                Duration: 0,
                Active: true,
                StartTime: new Date(),
                EndTime: new Date(),
                SubdivisionUsage: []
            };

            handleCreatePatrolLog(newPatrolLog);
        } else {
            enqueueSnackbar("Please select a department and server", { variant: "error" });
        }
    };

    // Handle off duty
    const handleOffDuty = async () => {
        try {
            const existingMemberData = await mainData?.MemberStore?.get('member') || {};
            const existingPatrolLogs = existingMemberData.PatrolLogs || [];
            const activePatrolLogIndex = existingPatrolLogs.findIndex((log: PatrolLogs) => log.Active === true);
            const activePatrolLog = existingPatrolLogs[activePatrolLogIndex];

            if (activePatrolLog) {
                activePatrolLog.EndTime = new Date();
                activePatrolLog.Active = false;
                activePatrolLog.Duration = Math.floor((new Date().getTime() - new Date(activePatrolLog.StartTime).getTime()) / 1000);
                activePatrolLog.SubdivisionUsage = subdivisionUsage;

                const updatedPatrolLogs = [...existingPatrolLogs.slice(0, activePatrolLogIndex), activePatrolLog, ...existingPatrolLogs.slice(activePatrolLogIndex + 1)];

                const updatedMemberData = {
                    ...existingMemberData,
                    PatrolLogs: updatedPatrolLogs
                };

                await mainData?.MemberStore?.set('member', updatedMemberData);
                await mainData?.MemberStore?.save();
            }
        } catch (error) {
            console.error("Failed to update patrol log", error);
            enqueueSnackbar("Failed to update patrol log", { variant: "error" });
        }

        setOnDuty(false);
        enqueueSnackbar("You are now off duty", { variant: "info" });
        setSelectedDepartment(null);
        setSelectedServer(null);
        nav("/home");
        setMainPatrolDuration(0);
        setSubdivisionUsage([]);
        setActiveSubdivision(null);
    };

    // Toggle patrol mode
    const handleTogglePatrolMode = () => {
        setLitePatrolMode(!litePatrolMode);
    };

    // Handle patrol cancellation
    const handleCancelPatrol = () => {
        setSelectedDepartment(null);
        setSelectedServer(null);
        nav("/home");
    };

    const value: PatrolContextType = {
        onDuty,
        selectedDepartment,
        selectedServer,
        isMemberData,
        litePatrolMode,
        mainPatrolDuration,
        activeSubdivision,
        subdivisionUsage,
        handleSelectDepartment,
        handleSelectServer,
        handleOnDuty,
        handleOffDuty,
        handleToggleOnDuty: () => setOnDuty(!onDuty),
        handleTogglePatrolMode,
        handleCancelPatrol,
        handleDeletePatrolLog,
        handleStartSubdivisionUsage,
        handleStopSubdivisionUsage,
        handlePauseSubdivisionUsage,
        handleResumeSubdivisionUsage: handleResumeSubdivision // Use corrected function
    };

    return (
        <PatrolContext.Provider value={value}>
            {children}

            {/* Confirmation Dialog */}
            <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
                <DialogTitle>Resume or Overwrite Subdivision</DialogTitle>
                <DialogContent>
                    You already have an existing log for {subdivisionToResume?.FullName}. Would you like to resume from where you left off, or overwrite the existing log?
                </DialogContent>
                <DialogActions>
                    {/* Show "Resume" button only if the subdivision is paused */}
                    {subdivisionToResume?.FullName && (
                        <Button onClick={handleResumeSubdivision} color="primary">
                            Resume
                        </Button>
                    )}
                    <Button onClick={handleOverwriteSubdivision} color="secondary">
                        Overwrite
                    </Button>
                </DialogActions>
            </Dialog>
        </PatrolContext.Provider>
    );
};

export { PatrolProvider, PatrolContext };
