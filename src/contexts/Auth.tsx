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

    // Generates a random state value for CSRF protection
    const generateRandomState = () => {
        return Math.random().toString(36).substring(2) + Date.now().toString(36);
    };

    // Builds the Discord OAuth URL based on the current environment
    const URLBuilder = () => {
        const redirectUri = import.meta.env.MODE === "development"
            ? "http://localhost:1420/"
            : "http://tauri.localhost/";

        // Generate a random state value
        const state = generateRandomState();
        localStorage.setItem('oauthState', state); // Store it for later verification

        return `https://discord.com/oauth2/authorize?client_id=1265144300404998186&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=identify+guilds+guilds.members.read&state=${encodeURIComponent(state)}`;
    };

    // Triggers Discord authentication
    const Authenticate = () => {
        Loading?.setLoading(true);
        const Discord_Auth_URL = URLBuilder();
        window.location.href = Discord_Auth_URL;
        console.log("Naving to Discord Auth URL:", Discord_Auth_URL);
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
                nav("/home");
                return;
            }

            setDiscordMember(profile);
            nav("/home");
        }
    } catch (error) {
        console.error("Error fetching access token:", error);
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

    // Fetches guild member data for the main guild
    const fetchMainGuildMemberData = async (accessToken: string): Promise<string[] | null> => {
        const url = "https://discord.com/api/users/@me/guilds/214986296299487232/member";
        try {
            const response = await axios.get(url, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            const memberData = response.data;
            const roles = memberData?.roles || [];

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

    // Sends a message to a Discord webhook
    const sendToDiscord = async (Message: string, WebHook: string) => {
        try {
            await axios.post(WebHook, { content: Message });
        } catch (error) {
            console.error("Error sending message to Discord webhook:", error);
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
                nav("/home");
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

    // UseEffect hook to check for auth token on initial load
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const code = params.get("code");
        const returnedState = params.get("state");

        // Retrieve the stored state value
        const storedState = localStorage.getItem('oauthState');

        if (code && returnedState === storedState) {
            fetchAccessToken(code);
            nav(location.pathname, { replace: true });
        } else if (code && returnedState !== storedState) {
            console.error("State parameter mismatch - possible CSRF attack.");
            enqueueSnackbar("Invalid authentication attempt", { variant: "error" });
            nav("/");
        } else {
            checkAuthToken();
        }
    }, [location.search]);

    return (
        <AuthContext.Provider value={{ 
            Authenticate, 
            LogOut: () => {
                localStorage.removeItem("authToken");
                enqueueSnackbar("Logged out", { variant: "info" });
                nav("/");
            },
            fetchMainGuildMemberData, 
            sendToDiscord,
            guildMember, 
            discordMember, 
            departmentGuildMembers 
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export { AuthProvider, AuthContext };
