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
import { CssBaseline } from "@mui/material";
import { PatrolProvider } from "./contexts/patrol";
import Patrol from "./components/patrol";
import ShortCutyProvider from "./components/shortcuts";
import Settings from "./components/settings";
import Logs from "./components/logs";

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
                    <ShortCutyProvider>
                    <Routes>
                      <Route path="/home" element={<Home />} />
                      <Route path="/" element={<Auth />} />
                      <Route path="/unauthorized" element={<Unauthorized />} />
                      <Route path="/patrol" element={<Patrol />} />
                      <Route path="/settings" element={<Settings  />} />
                      <Route path="/logs" element={<Logs  />} />
                    </Routes>
                    </ShortCutyProvider>
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
