import { Chip, IconButton, Menu, MenuItem, MenuList, Stack, Tooltip, Typography, Box, Button, Alert } from "@mui/material";
import ReusableAppbarToolbar from "./reusables/appbar_toolbar";
import { AdminPanelSettings, AdminPanelSettingsOutlined, Book, ExitToAppOutlined, LocalPoliceOutlined, ManageAccounts, Mode, Settings, ViewCompact } from "@mui/icons-material";
import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../contexts/Auth";
import { UpdaterContext } from "../contexts/updater";
import Advanced from "./patrolModes/advanced";
import Lite from "./patrolModes/lite";
import { MainDataContext } from "../contexts/mainData";
import { PatrolContext } from "../contexts/patrol";
import { useNavigate } from "react-router-dom";
import { Department } from "../types";
import TOS from "./TOS";
import { Command } from '@tauri-apps/plugin-shell';

const Home = () => {
    const Auth = useContext(AuthContext);
    const Updater = useContext(UpdaterContext);
    const Patrol = useContext(PatrolContext);
    const mainData = useContext(MainDataContext);
    const [settingsMenuAnchor, setSettingsMenuAnchor] = useState<null | HTMLElement>(null);
    const [tempStoreValue, setTempStoreValue] = useState<Department | null>(null);
    const nav = useNavigate();

    const handleSettingsMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
        setSettingsMenuAnchor(event.currentTarget);
    };

    const handleSettingsMenuClose = () => {
        setSettingsMenuAnchor(null);
    };

    const handleLogOut = () => {
        Auth?.LogOut();
        handleSettingsMenuClose();
    };

    const handleWelcomeMessage = () => {
        const Hour = new Date().getHours();
        if (Hour >= 0 && Hour <= 11) return `Good Morning`;
        if (Hour >= 12 && Hour <= 17) return `Good Afternoon`;
        return `Good Evening`;
    };

    // Toggle patrol mode between Lite and Advanced
    const handleTogglePatrolMode = () => {
        Patrol?.handleTogglePatrolMode();
    };

    useEffect(() => {
        if (mainData?.Departments?.length) {
            setTempStoreValue(mainData.Departments[2]); // Load the first department as temp store value
        }
    }, [mainData]);

    useEffect(() => {
        if (Patrol?.selectedDepartment && Patrol?.selectedServer) {
            nav("/patrol");
        }
    }, [Patrol?.selectedDepartment, Patrol?.selectedServer]);

    const handleTempStoreValue = async () => {
        const initialDepartments: Department[] = [
            {
                Alias: "SO",
                FullName: "Sheriff's Office",
                DiscordID: "317430442431086594",
                RoleID: "428212810049257484",
                Image: "/bcso.png",
                Icon: "LEO",
                Subdivisions: [
                    { Alias: "CID", FullName: "Criminal Investigations Division" },
                    { Alias: "TeD", FullName: "Traffic Enforcement Division" }
                ]
            },
            {
                Alias: "PD",
                FullName: "Police Department",
                DiscordID: "344980171687723008",
                RoleID: "428212668533440512",
                Image: "/lspd.png",
                Icon: "LEO",
                Subdivisions: [
                    { Alias: "PA", FullName: "Port Authority" }
                ]
            },
            {
                Alias: "HP",
                FullName: "Highway Patrol",
                DiscordID: "346092058689142785",
                RoleID: "428212616373207050",
                Image: "/sahp.png",
                Icon: "LEO",
                Subdivisions: [
                    { Alias: "BACO", FullName: "Beaurau of Air and Coastal Operations" },
                    { Alias: "BTE", FullName: "Beaurau of Transportation Enforcement" }
                ]
            },
            {
                Alias: "FD",
                FullName: "Fire Department",
                DiscordID: "329008294523961345",
                RoleID: "428212771981885450",
                Image: "/fd.png",
                Icon: "FIRE",
                Subdivisions: [
                    { Alias: "FMO", FullName: "Fire Marshal's Office" },
                    { Alias: "MEO", FullName: "Medical Examiner's Office" }
                ]
            },
            {
                Alias: "CIV",
                FullName: "Civilian Operations",
                DiscordID: "789348217124945950",
                RoleID: "428212704348471308",
                Image: "/civ.png",
                Icon: "CIV",
                Subdivisions: [
                    { Alias: "ChC", FullName: "Chaises Highway Clearance" },
                    { Alias: "PW", FullName: "Public Works" }
                ]
            }
        ];
    
        // Save to the DepartmentStore
        await mainData?.DepartmentStore?.set("departments", initialDepartments);
        await mainData?.DepartmentStore?.save();
    };

    const handleSetServers = async () => {
        const initialServers = [
            {
                Alias: "1",
                FullName: "Server 1"
            },
            {
                Alias: "2",
                FullName: "Server 2"
            },
            {
                Alias: "3",
                FullName: "Server 3"
            }
        ];
    
        // Save to the ServerStore
        await mainData?.ServerStore?.set("servers", initialServers);
        await mainData?.ServerStore?.save();
    }
    

    return (
        <Stack spacing={!mainData?.Departments === null ? 5 : 10}>
            <Box sx={{ position: "relative" }}>
                <ReusableAppbarToolbar
                    elements={[
                        <Stack key="stack" direction="row" spacing={2} flexGrow={0.5}>
                            <Typography key="title">Home</Typography>
                            {Updater?.currentVersion && (
                                <Tooltip title={`${Updater?.currentVersion} is the latest version`}>
                                    <Chip label={`v${Updater.currentVersion}`} color="warning" size="small" variant="outlined" />
                                </Tooltip>
                            )}
                        </Stack>,
                        <Typography zIndex={1} flexGrow={0.5}>{handleWelcomeMessage()} {mainData?.Members?.name}</Typography>,
    
                        <Tooltip key="settings-tooltip-patrol-logs" title="Patrol Logs">
                            <IconButton color="inherit" onClick={() => { nav("/logs") }}>
                                <Book />
                            </IconButton>
                        </Tooltip>,
    
                        <Tooltip key="settings-tooltip-manage-user" title="Settings">
                            <IconButton color="inherit" onClick={handleSettingsMenuOpen}>
                                <ManageAccounts />
                            </IconButton>
                        </Tooltip>,
                    ]}
                    appbarProps={{ variant: "elevation" }}
                    toolbarProps={{ variant: "dense", color: "warning" }}
                />
            </Box>
            {mainData?.Members?.hasAgreedtoTOS === false && <TOS />}
            
            {mainData?.Departments !== null ? (
                <Advanced /> 
            ) : 
            (
               <Stack spacing={5} direction="column" alignItems="center">
                    <Typography variant="h5" color="textSecondary">
                        No departments available.
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        Please try again in a few minutes.    
                    </Typography>    
                </Stack>
            )

            }
           
            {/* Settings Menu */}
            <Menu open={Boolean(settingsMenuAnchor)} anchorEl={settingsMenuAnchor} onClose={handleSettingsMenuClose} >
                    <MenuItem onClick={handleTogglePatrolMode} divider>
                        <ViewCompact color="inherit" />
                        <Typography ml={"10px"} variant="inherit">
                            Toggle Patrol Mode
                        </Typography>
                    </MenuItem>
                    <MenuItem onClick={() => { nav("/settings"); handleSettingsMenuClose(); }} divider>
                        <Settings color="inherit" />
                        <Typography ml={"10px"} variant="inherit">
                            Settings
                        </Typography>
                    </MenuItem>
                        {Auth?.guildMember?.roles?.includes("276889430101458954" || "427147673079119872" || "305517359244902402") && (
                            <MenuItem onClick={() => { nav("/admin")}} divider>
                                <AdminPanelSettingsOutlined color="inherit" />
                                    <Typography ml={"10px"} variant="inherit">
                                        Administrative Portal
                                    </Typography>
                            </MenuItem>
                        )}
                    <MenuItem onClick={handleLogOut}>
                        <ExitToAppOutlined color="inherit" />
                            <Typography ml={"10px"} variant="inherit">
                                Sign Out
                            </Typography>
                    </MenuItem>
            </Menu>
            {/* End Settings Menu */}
        </Stack>
    );
    
};

export default Home;
