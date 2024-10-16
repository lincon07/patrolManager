import { enqueueSnackbar } from "notistack";
import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LoadingContext } from "./loading";
import axios from "axios";
import { AuthContextType, discordMember, GuildMember } from "../types";

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
    children: ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const Loading = useContext(LoadingContext);
    const [guildMember, setGuildMember] = useState<GuildMember | null>(null);
    const [departmentGuildMembers, setDepartmentGuildMembers] = useState<{ [key: string]: GuildMember | null }>({});
    const [discordMember, setDiscordMember] = useState<discordMember | null>(null);
    const nav = useNavigate();
    const location = useLocation();

    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    // Builds the Discord OAuth URL based on the current environment
    const URLBuilder = () => {
        const redirectUri = import.meta.env.MODE === "development"
            ? "http://localhost:1420/"
            : "http://tauri.localhost/";

        return `https://discord.com/oauth2/authorize?client_id=1265144300404998186&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=identify+guilds+guilds.members.read`;
    };

    // Triggers Discord authentication
    const Authenticate = () => {
        Loading?.setLoading(true);
        const Discord_Auth_URL = URLBuilder();
        window.location.href = Discord_Auth_URL;
    };

    // Sends a notification to a Discord webhook
    const sendToDiscord = async (webhookURL: string, message: string, userInfo: discordMember, color: number) => {
        try {
            const { id, username, avatar } = userInfo;
            const avatarUrl = avatar
                ? `https://cdn.discordapp.com/avatars/${id}/${avatar}.png`
                : "https://cdn.discordapp.com/embed/avatars/0.png";

            await axios.post(webhookURL, {
                embeds: [
                    {
                        title: "Login Attempt",
                        description: message,
                        color: color,
                        fields: [
                            { name: "DoJ Name", value: `\`\`\` ${username} \`\`\`` },
                            { name: "Discord ID", value: `\`\`\` ${id} \`\`\`` },
                        ],
                        thumbnail: { url: avatarUrl },
                        footer: { text: "Authentication Portal" },
                    }
                ]
            });
        } catch (error) {
            console.error("Error sending message to Discord:", error);
        }
    };

    // Fetches the user's Discord profile
    const fetchUserProfile = async (accessToken: string) => {
        try {
            const response = await axios.get("https://discord.com/api/users/@me", {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            return response.data;
        } catch (error) {
            console.error("Failed to fetch user profile", error);
            return null;
        }
    };

    // Fetches the access token using the authorization code
    const fetchAccessToken = async (code: string) => {
        const tokenUrl = "https://discord.com/api/oauth2/token";
        const data = new URLSearchParams({
            client_id: "1265144300404998186",
            client_secret: "ECMroElTboDgjjpnh3nY9NS4vC1x95gt",
            grant_type: "authorization_code",
            code: code,
            redirect_uri: import.meta.env.MODE === "development" ? "http://localhost:1420/" : "http://tauri.localhost/"
        });

        try {
            const response = await axios.post(tokenUrl, data, {
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
            });

            const accessToken = response.data.access_token;
            localStorage.setItem("authToken", accessToken);
            const profile = await fetchUserProfile(accessToken);

            if (profile) {
                const roles = await fetchMainGuildMemberData(accessToken);

                if (!roles) {
                    nav("/unauthorized");
                    return;
                }

                setDiscordMember(profile);
                nav("/home");
            }
        } catch (error) {
            console.error("Error fetching access token:", error);
        }
    };

    // Handles rate limiting and retries requests if necessary
    const handleRateLimit = async (response: any) => {
        if (response.status === 429) {
            const retryAfter = response.headers['retry-after'];
            if (retryAfter) {
                console.warn(`Rate limited. Retrying after ${retryAfter} seconds.`);
                await delay(parseFloat(retryAfter) * 1000);
            }
            return true;
        }
        return false;
    };

    // Fetches guild member data for the main guild
    const fetchMainGuildMemberData = async (accessToken: string): Promise<string[] | null> => {
        const url = "https://discord.com/api/users/@me/guilds/214986296299487232/member";
        try {
            const response = await axios.get(url, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
    
            const memberData = response.data;
            const roles = memberData?.roles || [];
            
            console.log("Fetched Roles:", roles); // Debug log to check roles
    
            if (roles.length === 0) {
                console.error("No roles found, user may not be a member of the guild.");
                return null;
            }
    
            setGuildMember({
                id: memberData.user.id,
                avatar: memberData.user.avatar,
                roles,
                bio: memberData.user.bio || "",
                communication_disabled_until: null,
                deaf: false,
                flags: memberData.user.flags || 0,
                joined_at: memberData.user.joined_at || new Date().toISOString(),
                mute: false,
                nick: memberData.nick || null,
                pending: false,
                premium_since: null,
                unusual_dm_activity_until: null,
            });
    
            return roles;
        } catch (error) {
            console.error("Error fetching main guild member data", error);
            return null;
        }
    };
    

    // Fetches department-specific guild member data with retry handling for rate limits
    const fetchDepartmentnGuildMemberData = async (accessToken: string, departmentID: string): Promise<string[] | null> => {
        const url = `https://discord.com/api/users/@me/guilds/${departmentID}/member`;

        try {
            let response = await axios.get(url, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            // Handle rate limiting and retry if needed
            if (await handleRateLimit(response)) {
                response = await axios.get(url, {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });
            }

            const memberData = response.data;
            const roles = memberData?.roles || [];

            // Update the specific department guild member data
            setDepartmentGuildMembers((prev) => ({
                ...prev,
                [departmentID]: {
                    id: memberData.user.id,
                    avatar: memberData.user.avatar,
                    roles,
                    bio: memberData.user.bio || "",
                    communication_disabled_until: null,
                    deaf: false,
                    flags: memberData.user.flags || 0,
                    joined_at: memberData.user.joined_at || new Date().toISOString(),
                    mute: false,
                    nick: memberData.nick || null,
                    pending: false,
                    premium_since: null,
                    unusual_dm_activity_until: null,
                },
            }));

            return roles;
        } catch (error) {
            console.error("Error fetching department guild member data", error);
            return null;
        }
    };

    // Batch fetching departments to reduce the number of requests
    const fetchDepartmentsInBatch = async (accessToken: string, departmentIDs: string[]) => {
        for (const departmentID of departmentIDs) {
            await fetchDepartmentnGuildMemberData(accessToken, departmentID);
        }
    };

    // Checks for a valid auth token and fetches user profile if available
    const checkAuthToken = async () => {
        const token = localStorage.getItem("authToken");

        if (!token) {
            nav("/");
            return;
        }

        try {
            const response = await axios.get("https://discord.com/api/users/@me", {
                headers: { Authorization: `Bearer ${token}` },
            });

            const profile = response.data;
            const roles = await fetchMainGuildMemberData(token);

            if (!roles) {
                nav("/unauthorized");
                return;
            }

            setDiscordMember(profile);
            nav("/home");
        } catch (error) {
            console.error("Auth token is invalid or expired", error);
            localStorage.removeItem("authToken");
            nav("/");
        }
    };

    // Logs out the user and sends a logout message to the Discord webhook
    const LogOut = async () => {
        localStorage.removeItem("authToken");
        if (discordMember) {
            await sendToDiscord(
                "https://discord.com/api/webhooks/1292992125688086579/251pWJQkYoGiTd4xhD9rRUbJ9UJUWj165XW1NiUfBoIB7LiXYyIzGyp797opY-Cllvmf", 
                "A user has logged out.", 
                discordMember, 
                15158332
            );
        }
        enqueueSnackbar("Logged out", { variant: "info" });
        nav("/");
    };

    // UseEffect hook to check for auth token on initial load
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const code = params.get("code");
        if (code) {
            fetchAccessToken(code);
            nav(location.pathname, { replace: true });
        } else {
            checkAuthToken();
        }
    }, [location.search, nav]);

    return (
        <AuthContext.Provider value={{ Authenticate, LogOut, fetchMainGuildMemberData, fetchDepartmentnGuildMemberData, fetchDepartmentsInBatch, guildMember, discordMember, departmentGuildMembers }}>
            {children}
        </AuthContext.Provider>
    );
};

export { AuthProvider, AuthContext };
