import { Image } from "@tauri-apps/api/image";
import AppLogo from "./assets/patrol_manager_logo.png";

// Patrol Manager Logo
export const patrolManagerLogo = AppLogo;

// Interface for individual guild members
export interface GuildMember {
    user: DiscordMember; // Basic user info
    nick: string | null; // Nickname in the guild, can be null
    avatar: string;      // Guild-specific avatar
    roles: any[];        // List of roles the user has in the guild
}



// Interface for Discord member
export interface DiscordMember {
    id: string;             // Discord user ID
    username: string;       // Discord username
    avatar: string | null;  // User's avatar URL or null
    guildInfo: Guild[];     // List of guilds with membership data
}

// Guild data including optional member data
export interface Guild {
    id: string;                     // Guild ID
    name: string;                   // Guild name
    memberData?: GuildMember;       // Optional: Contains member-specific data when fetched
}

// Interface for the main context
export interface MainDataContextType {
    Departments: Department[];      // List of departments
    Servers: Server[];              // List of servers
    Members: Member[];              // List of members
}

// Interface for an individual department
export interface Department {
    Alias: string;                  // Short name or alias for the department
    FullName: string;               // Full name of the department
    DiscordID: string;              // Discord ID for the department's server or guild
    RoleID: string;                 // Discord role ID for the department
    Image: string;                  // URL or path to the department's image
    Icon: React.ReactNode;          // React node for department icon
}

// Interface for a server in the patrol system
export interface Server {
    Alias: string;                  // Short name or alias for the server
    FullName: string;               // Full name of the server
}

// Interface for the patrol context
export interface PatrolContextType {
    onDuty: boolean;                               // Whether the user is on duty
    selectedDepartment: Department | null;         // The department the user has selected
    selectedServer: Server | null;                 // The server the user has selected
    isMemberData: boolean;                         // Whether the user has valid member data
    handleSelectDepartment: (dept: Department) => void;  // Function to select a department
    handleSelectServer: (server: Server) => void;  // Function to select a server
    handleOnDuty: () => void;                      // Function to mark the user as on duty
    handleOffDuty: () => void;                     // Function to mark the user as off duty
}

// Interface for the theme context
export interface ThemeContextType {
    theme: string;                                  // Current theme
    handleSetTheme: (theme: string) => void;        // Function to set the theme
}

// Interface for members
export interface Member {
    name: string;          // Name of the member
    email: string;         // Email of the member
    websiteID: string;     // ID from the website or system (e.g., for logging)
    discordID: string;     // Member's Discord ID
}
