import React from "react";
import { Department, PatrolContextType, Server } from "../types";
import { enqueueSnackbar } from "notistack";

const PatrolContext = React.createContext<PatrolContextType | null>(null);

const PatrolProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [selectedDepartment, setSelectedDepartment] = React.useState<Department | null>(null);
    const [selectedServer, setSelectedServer] = React.useState<Server | null>(null);
    const [onDuty, setOnDuty] = React.useState<boolean>(false);
    const [isMemberData, setIsMemberData] = React.useState<boolean>(false);  // Add this state

    // handle select department
    const handleSelectDepartment = (dept: Department) => {
        setSelectedDepartment(dept);
        enqueueSnackbar(`Selected Department: ${dept.FullName}`, { variant: "info" });
    };

    // handle select server
    const handleSelectServer = (server: Server) => {
        setSelectedServer(server);
        enqueueSnackbar(`Selected Server: ${server.FullName}`, { variant: "info" });
    };

    // handle on duty
    const handleOnDuty = () => {
        setOnDuty(true);
    };

    // handle off duty
    const handleOffDuty = () => {
        setOnDuty(false);
    };

    const value: PatrolContextType = {
        onDuty,
        selectedDepartment,
        selectedServer,
        isMemberData,  // Pass isMemberData here
        handleSelectDepartment,
        handleSelectServer,
        handleOnDuty,
        handleOffDuty,
    };

    return (
        <PatrolContext.Provider value={value}>
            {children}
        </PatrolContext.Provider>
    );
};

export { PatrolProvider, PatrolContext };
