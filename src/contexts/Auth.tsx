import { enqueueSnackbar } from "notistack";
import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LoadingContext } from "./loading";

interface AuthContextType {
    memberData: boolean;
    userInfo: any | null; // Store the user information globally
    Authenticate: () => void;
    LogOut: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
    children: ReactNode;
}

// Webhook URL for the bot to send messages to your server
const WEBHOOK_URL = 'https://discord.com/api/webhooks/1292992125688086579/251pWJQkYoGiTd4xhD9rRUbJ9UJUWj165XW1NiUfBoIB7LiXYyIzGyp797opY-Cllvmf';
const ROLE_ID = '1292995883893260329'; // Replace with the role ID you want to ping

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const Loading = useContext(LoadingContext);
    const [memberData, setMemberData] = useState<boolean>(false);
    const [userInfo, setUserInfo] = useState<any | null>(null); // Store the user info globally
    const nav = useNavigate();
    const location = useLocation();

    // OAuth authentication URL builder
    const URLBuilder = () => {
        const redirectUri = import.meta.env.MODE === "development"
            ? "http://localhost:1420/"
            : "http://tauri.localhost/";
        
        // Correctly encode redirect URI
        return `https://discord.com/oauth2/authorize?client_id=1265144300404998186&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=identify+guilds`;
    }
    // OAuth authentication URL builder
    const Authenticate = () => {
        Loading?.setLoading(true);
        const Discord_Auth_URL = URLBuilder();
        window.location.href = Discord_Auth_URL; // Redirect to Discord for authentication
    };

    // Function to send an embedded message to your Discord webhook
    const sendToDiscord = async (message: string, userInfo: any, color:number) => {
        try {
            const { id, username, avatar } = userInfo;
            await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content: `<@&${ROLE_ID}>`, // Ping the role
                    embeds: [
                        {
                            title: "Login Attempt",
                            description: message,
                            color: color, // Red or green color based on success or failure
                            fields: [
                                {
                                    name: "Discord Name",
                                    value: `\`\`\` ${username} \`\`\``,
                                    inline: false,
                                },
                                {
                                    name: "Discord ID",
                                    value: `\`\`\` ${id} \`\`\``,
                                    inline: false,
                                },
                            ],
                            thumbnail: {
                                url: `https://cdn.discordapp.com/avatars/${id}/${avatar}.png`,
                            },
                            footer: {
                                text: "Login System",
                            },
                        }
                    ]
                }),
            });
            console.log("Message sent to Discord.");
        } catch (error) {
            console.error("Error sending message to Discord:", error);
        }
    };

    // Fetch user profile (e.g., Discord ID, username) using the access token
    const fetchUserProfile = async (accessToken: string) => {
        try {
            const response = await fetch("https://discord.com/api/users/@me", {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch user profile");
            }

            return await response.json();
        } catch (error) {
            console.error("Error fetching user profile:", error);
        }
    };

    // Fetch access token after successful OAuth authorization
    const fetchAccessToken = async (code: string) => {
        const tokenUrl = "https://discord.com/api/oauth2/token";
        const data = new URLSearchParams();
        data.append("client_id", "1265144300404998186"); // Your client ID
        data.append("client_secret", "IvYD68lB3XPloS3xDgCe09QB4DpZJ6r3"); // Your client secret
        data.append("grant_type", "authorization_code");
        data.append("code", code);
        data.append("redirect_uri", import.meta.env.MODE === "development" ? "http://localhost:1420/" : "http://tauri.localhost/");

        try {
            const response = await fetch(tokenUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: data.toString(),
            });

            if (!response.ok) {
                throw new Error("Failed to fetch access token");
            }

            const tokenData = await response.json();
            const accessToken = tokenData.access_token;

            // Store the access token in localStorage
            localStorage.setItem("authToken", accessToken);

            console.log("Access Token:", accessToken); // Debugging token storage

            // Fetch user's guilds and profile using the access token
            const profile = await fetchUserProfile(accessToken);
            setUserInfo(profile); // Store user info globally
            console.log("User Info:", profile); // Debugging user info
            await fetchUserGuilds(accessToken, profile);
        } catch (error) {
            console.error("Error fetching access token:", error);
        }
    };

    // Fetch user’s guilds and check if they belong to the required guild
    const fetchUserGuilds = async (accessToken: string, userInfo: any) => {
        const guildsUrl = "https://discord.com/api/users/@me/guilds";
        const requiredGuildId = "214986296299487232"; // Your guild ID

        try {
            const response = await fetch(guildsUrl, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch user guilds");
            }

            const guildsData = await response.json();
            console.log("User's guilds:", guildsData);

            // Check if the user is in the required guild
            const isMemberInGuild = guildsData.some((guild: { id: string }) => guild.id === requiredGuildId);

            if (isMemberInGuild) {
                console.log("User is in the required guild");
                setMemberData(true);
                await sendToDiscord("A user has successfully logged in.", userInfo, 3066993); // Green color for success
                nav("/home", { replace: true }); // Redirect to home
            } else {
                console.log("User is not in the required guild");

                // Send a message to the Discord server if the user is not in the required guild
                await sendToDiscord("A user attempted to log in but is not a member of the required guild.", userInfo, 15158332); // Red color for failure
                // Redirect to unauthorized page
                nav("/unauthorized", { replace: true }); // Redirect to unauthorized
            }
        } catch (error) {
            console.error("Error fetching user guilds:", error);
        } finally {
            Loading?.setLoading(false);
        }
    };

    // Check if there's an auth token and validate it
    const checkAuthToken = async () => {
        const token = localStorage.getItem("authToken");

        if (!token) {
            nav("/auth");
            return;
        }

        try {
            const response = await fetch("https://discord.com/api/users/@me", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                // Token is valid, fetch user guilds
                const profile = await response.json();
                setUserInfo(profile); // Store user info globally
                await fetchUserGuilds(token, profile);
            } else {
                console.log("Auth token is invalid or expired");
                localStorage.removeItem("authToken");
                nav("/auth");
            }
        } catch (error) {
            console.error("Error checking auth token:", error);
            localStorage.removeItem("authToken");
            nav("/auth");
        }
    };

    // LogOut function sends a Discord message on logout
    const LogOut = async () => {
        localStorage.removeItem("authToken");
        if (userInfo) {
            await sendToDiscord("A user has logged out.", userInfo, 15158332); // Red color for logout
        }
        nav("/auth");
        enqueueSnackbar("Logged out", { variant: "info" });
    };

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const code = params.get("code");

        if (code) {
            console.log("Auth code:", code); // Debugging the auth code in production
            fetchAccessToken(code);
        }
    }, [location.search]);

    useEffect(() => {
         checkAuthToken(); // Check if token is already available on mount
    }, []);

    return (
        <AuthContext.Provider value={{ Authenticate, LogOut, memberData, userInfo }}>
            {children}
        </AuthContext.Provider>
    );
};

export { AuthProvider, AuthContext };
