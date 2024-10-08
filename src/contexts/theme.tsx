import React, { createContext, useState } from "react";
import { ThemeContextType } from "../types";
import { createTheme, ThemeProvider as MUIThemeProvider, CssBaseline } from "@mui/material";

// Create the context for theme
const ThemeContext = createContext<ThemeContextType | null>(null);

// Define the ThemeProvider component
const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [darkMode, setDarkMode] = useState<string>("dark");

    // Create a theme based on the darkMode state
    const theme = createTheme({
        palette: {
            mode: darkMode === "dark" ? "dark" : "light"
        },
        components: {
            MuiButton: {
                styleOverrides: {
                    root: {
                        textTransform: "none"
                    }
                }
            }
        }
    });

    // Function to switch between themes
    const handleTheme = (theme: string) => {
        setDarkMode(theme);
    };

    // Context value to provide the theme and the function to change the theme
    const value = {
        theme: darkMode,
        handleSetTheme: handleTheme
    };

    return (
        <ThemeContext.Provider value={value}>
            {/* Use MUI's ThemeProvider to apply the theme */}
            <MUIThemeProvider theme={theme}>
                <CssBaseline /> {/* Ensure consistent baseline styles */}
                {children}
            </MUIThemeProvider>
        </ThemeContext.Provider>
    );
};

// Export both the context and the provider
export { ThemeProvider, ThemeContext };
