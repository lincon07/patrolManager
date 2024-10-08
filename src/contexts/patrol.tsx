import React from "react";
import { Department, PatrolContextType, Server } from "../types";
import { enqueueSnackbar } from "notistack";

const PatrolContext = React.createContext<PatrolContextType | null>(null);

const PatrolProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [selectedDepartment, setSelectedDepartment] = React.useState<Department | null>(null);
    const [selectedServer, setselectedServer] = React.useState<Server | null>(null)
    const [onDuty, setonDuty] = React.useState<boolean>(false)

    // handle select department
    const handleSelectDepartment = (dept: Department) => {
        setSelectedDepartment(dept)
        enqueueSnackbar(`Selected Department: ${dept.FullName}`, { variant: "info" })
    }
    // handle select server
    const handleSelectServer = (server: Server) => {
        setselectedServer(server)
        enqueueSnackbar(`Selected Server: ${server.FullName}`, { variant: "info" })
    }
    // handle on duty
    const handleOnDuty = () => {
    }
    // handle off duty
    const handleOffDuty = () => {

    }
    const value = {
        onDuty,
        selectedDepartment,
        selectedServer,
        handleSelectDepartment,
        handleSelectServer,
        handleOnDuty,
        handleOffDuty
    }
    return (
        <PatrolContext.Provider value={value}>
            {children}
        </PatrolContext.Provider>
    )
}


export { PatrolProvider, PatrolContext };