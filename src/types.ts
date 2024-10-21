import { Image } from "@tauri-apps/api/image";
import AppLogo from "./assets/patrol_manager_logo.png";

// Patrol Manager Logo
export const patrolManagerLogo = AppLogo;


export interface discordMember {
    accent_color: number;
    avatar: string | null;
    avatar_decoration_data?: string | null; // Make it optional
    banner: string | null;
    banner_color: string | null;
    clan: string | null;
    discriminator: string;
    flags: number;
    global_name: string;
    id: string;
    public_flags: number;
    username: string;
    email: string;
}



export interface GuildMember {
    id: string;          // Discord ID of the user
    avatar: string | null;  // Guild-specific avatar
    roles: string[];     // List of roles the user has in the guild
    bio: string;
    communication_disabled_until: string | null;
    deaf: boolean;
    flags: number;
    joined_at: string;
    mute: boolean;
    nick: string | null; // Nickname in the guild
    pending: boolean;
    premium_since: string | null;
    unusual_dm_activity_until: string | null;
}

export interface AuthContextType {
    guildMember: GuildMember | null;
    discordMember: discordMember | null;
    departmentGuildMembers: { [key: string]: GuildMember | null }; // Pluralized version for storing guild members by department
    Authenticate: () => void;
    LogOut: () => void;
    fetchMainGuildMemberData: (accessToken: string) => Promise<string[] | null>;
    fetchDepartmentGuildMemberData: (accessToken: string, DepartmentID: string) => Promise<string[] | null>;
    fetchDepartmentsInBatch: (accessToken: string, DepartmentIDs: string[]) => Promise<void>;
    
}


// Interface for the main context
export interface MainDataContextType {
    Departments: Department[] | null;      // List of departments
    Servers: Server[];                     // List of servers
    Members: Member | null;                // Allow single Member or null
    DepartmentStore: any | null;           // Store for departments
    ServerStore: any | null;               // Store for servers
    MemberStore: any | null;               // Store for members
}

// Interface for an individual department
export interface Department {
    Alias: string;                  // Short name or alias for the department
    FullName: string;               // Full name of the department
    DiscordID: string;              // Discord ID for the department's server or guild
    RoleID: string;                 // Discord role ID for the department
    Image: string;                  // URL or path to the department's image
    Icon: string;                   // React node for department icon
    Subdivisions: Subdivision[];    // List of subdivisions   
}

export interface Subdivision {
    Alias: string;                  // Short name or alias for the subdivision
    FullName: string;               // Full name of the subdivision
}

// Interface for a server in the patrol system
export interface Server {
    Alias: string;                  // Short name or alias for the server
    FullName: string;               // Full name of the server
}

// Interface for the patrol context
export interface PatrolContextType {
    onDuty: boolean;                                // Whether the user is on duty
    selectedDepartment: Department | null;          // The department the user has selected
    selectedServer: Server | null;                  // The server the user has selected
    isMemberData: boolean;                          // Whether the user has valid member data
    litePatrolMode: boolean;                        // Whether the user is in lite patrol mode
    mainPatrolDuration: number;                     // Total patrol duration for the user
    activeSubdivision: string | null;               // Active subdivision alias (if any)
    subdivisionUsage: SubdivisionUsage[];           // Array to track subdivision usage
    handleSelectDepartment: (dept: Department) => void;  // Function to select a department
    handleSelectServer: (server: Server) => void;   // Function to select a server
    handleOnDuty: () => void;                       // Function to mark the user as on duty
    handleOffDuty: () => void;                      // Function to mark the user as off duty
    handleToggleOnDuty: () => void;                 // Function to toggle on duty status
    handleTogglePatrolMode: () => void;             // Function to toggle patrol mode
    handleCancelPatrol: () => void;                 // Function to cancel the current patrol
    handleDeletePatrolLog: (index: number) => void; // Function to delete a patrol log
    handleStartSubdivisionUsage: (subdivision: Subdivision) => void; // Function to start subdivision usage
    handleStopSubdivisionUsage: (subdivision: Subdivision) => void;  // Function to stop subdivision usage
    handlePauseSubdivisionUsage: (subdivision: Subdivision) => void; // Function to pause subdivision usage
    handleResumeSubdivisionUsage: (subdivision: Subdivision) => void; // Function to resume subdivision usage
}



// Interface for the theme context
export interface ThemeContextType {
    theme: string;                                  // Current theme
    handleSetTheme: (theme: string) => void;        // Function to set the theme
}

// Interface for members
export interface Member {
    name: string;                                   // Name of the member
    email: string;                                  // Email of the member
    websiteID: string;                              // ID from the website or system (e.g., for logging)
    discordID: string;                              // Member's Discord ID
    litePatrolMode: boolean;                        // Whether the member is in lite patrol mode
    PatrolLogs: PatrolLogs[];                       // Patrol logs for the member
    hasAgreedtoTOS: boolean;                        // Whether the member has agreed to the terms of service
}

// Interface for patrol logs
export interface PatrolLogs {
    department: Department;
    server: Server;
    StartTime: Date;
    EndTime: Date;
    Duration: number;
    Active: boolean;
    SubdivisionUsage: SubdivisionUsage[];
}

// Interface for subdivision usage
export interface SubdivisionUsage {
    Subdivision: Subdivision;
    StartTime: Date;
    EndTime: Date | null;
    Duration: number;
    Active: boolean;
    Paused: boolean;
}

// Utility function to convert duration to human-readable format
export const ConvertDuration = (duration: number) => {
    const days = Math.floor(duration / 86400);
    const hours = Math.floor((duration % 86400) / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = duration % 60;
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
};

// Utility function to format date
export const ConvertDate = (dateInput: string | Date) => {
    const date = new Date(dateInput); // Ensure it's converted to a Date object
    if (isNaN(date.getTime())) {
        return "Invalid Date";
    }

    // Format the date to "Jan 1, 2021"
    const options: Intl.DateTimeFormatOptions = {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    };
    return date.toLocaleDateString('en-US', options);
};
