import { Backdrop, CircularProgress } from "@mui/material";
import React, { createContext } from "react";


interface LoadingContextData {
    loading: boolean;
    setLoading: (loading: boolean) => void;
}

const LoadingContext = createContext<LoadingContextData | null>(null);


interface LoadingProviderProps {
    children: React.ReactNode;
}
const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
    const [loading, setLoading] = React.useState<boolean>(false);

    const handleSetLoading = (loading: boolean) => {
        setLoading(loading);
    }

    const value = {
        loading,
        setLoading: handleSetLoading,
    };
    return (
        <LoadingContext.Provider value={value}>
            <Backdrop open={loading} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <CircularProgress color="secondary" />
            </Backdrop>
            {children}
        </LoadingContext.Provider>
    );
}

export { LoadingProvider, LoadingContext };