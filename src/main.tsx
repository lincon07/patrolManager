import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { UpdaterProvider } from "./contexts/updater";
import { SnackbarProvider } from "notistack";
import { AuthProvider } from "./contexts/Auth";
import Auth from "./components/auth";
import Home from "./components/home";
import Unauthorized from "./components/unauthorized";
import { LoadingProvider } from "./contexts/loading";
import { MainDataProvider } from "./contexts/mainData";
import { ThemeProvider } from "./contexts/theme";
import { CircularProgress, CssBaseline } from "@mui/material";
import { Circle } from "@mui/icons-material";
import { PatrolProvider } from "./contexts/patrol";

const Loading = () => {
  // center the loading spinner
  return (
    <CircularProgress color="secondary" size={'20px'} sx={{
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)"
    }} />
  )
}
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider> {/* Use your custom ThemeProvider here */}
        <CssBaseline />
        <LoadingProvider>
          <SnackbarProvider>
            <UpdaterProvider>
              <AuthProvider>
                <MainDataProvider>
                  <PatrolProvider>
                    <Routes>
                      <Route path="/home" element={<Home />} />
                      <Route path="/" element={<Auth />} />
                      <Route path="/unauthorized" element={<Unauthorized />} />
                    </Routes>
                  </PatrolProvider>
                </MainDataProvider>
              </AuthProvider>
            </UpdaterProvider>
          </SnackbarProvider>
        </LoadingProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
