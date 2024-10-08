import { Image } from "@tauri-apps/api/image";
import AppLogo from "./assets/patrol_manager_logo.png"

export const patrolManagerLogo = AppLogo 
export interface Member {
    name: string;
    email: string;
    websiteID: string;
}


// main data Context
export interface MainDataContextType {
    Departments: Department[];
    Servers: Server[];
}

export interface Department {
    Alias: string;
    FullName: string;
    Image: string;
    Icon: React.ReactNode
}

export interface Server {
    Alias: string;
    FullName: string;
}


// Patrol Conext 

export interface PatrolContextType {
    onDuty: boolean;
    selectedDepartment: Department | null;
    selectedServer: Server | null;
    handleSelectDepartment: (dept: Department) => void;
    handleSelectServer: (server: Server) => void;
    handleOnDuty: () => void;
    handleOffDuty: () => void;
}
// theme 
export interface ThemeContextType {
    theme: string;
    handleSetTheme: (theme: string) => void;
}