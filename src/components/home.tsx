import { Chip, IconButton, List, Menu, MenuItem, MenuList, Stack, Tooltip, Typography, Box } from "@mui/material";
import ReusableAppbarToolbar from "./reusables/appbar_toolbar";
import { Book, ExitToAppOutlined, ManageAccounts, Settings } from "@mui/icons-material";
import React, { useContext } from "react";
import { AuthContext } from "../contexts/Auth";
import { UpdaterContext } from "../contexts/updater";
import Advanced from "./patrolModes/advanced";
import Lite from "./patrolModes/lite";
import { MainDataContext } from "../contexts/mainData";

const Home = () => {
    const Auth = useContext(AuthContext);
    const Updater = useContext(UpdaterContext);
    const mainData = useContext(MainDataContext);
    const [settingsMenuAnchor, setSettingsMenuAnchor] = React.useState<null | HTMLElement>(null);
    const handleSettingsMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
        setSettingsMenuAnchor(event.currentTarget);
    };

    const handleSettingsMenuClose = () => {
        setSettingsMenuAnchor(null);
    };

    const handleLogOut = () => {
        // Log out logic
        Auth?.LogOut();
        handleSettingsMenuClose();
    };

    // Welcome Message
    const handleWelcomeMessage = () => {
        const Hour = new Date().getHours();
        if (Hour >= 0 && Hour <= 11) return `Good Morning`;
        if (Hour >= 12 && Hour <= 17) return `Good Afternoon`;
        return `Good Evening`;
    };


    return (
        <Stack spacing={9}>
            <Box sx={{ position: "relative" }}>
                <ReusableAppbarToolbar
                    elements={[
                        <Stack key="stack" direction="row" spacing={2} flexGrow={0.5}>
                            <Typography key="title">Home</Typography>
                            {Updater?.currentVersion && (
                                <Tooltip title="You are on the latest version">
                                    <Chip label={`v${Updater.currentVersion}`} color="warning" size="small" variant="filled" />
                                </Tooltip>
                            )}
                        </Stack>,
                                        <Typography
                                        flexGrow={0.5}
                                       >
                                            {handleWelcomeMessage() } 
                                        </Typography>,
                        <Tooltip key="settings-tooltip-patrol-logs" title="Patrol Logs">
                            <IconButton color="inherit" onClick={() => {}}>
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
                {/* Welcome Message positioned in the center */}

            </Box>

            {/* Patrol Mode */}
            <Advanced />
            {/* End Patrol Mode */}

            {/* Settings Menu */}
            <Menu open={Boolean(settingsMenuAnchor)} anchorEl={settingsMenuAnchor} onClose={handleSettingsMenuClose}>
                <MenuList>
                    <MenuItem onClick={handleLogOut}>
                        <Settings color="inherit" />
                        <Typography ml={"10px"} variant="inherit">
                            Settings
                        </Typography>
                    </MenuItem>
                    <MenuItem onClick={handleLogOut}>
                        <ExitToAppOutlined color="inherit" />
                        <Typography ml={"10px"} variant="inherit">
                            Sign Out
                        </Typography>
                    </MenuItem>
                </MenuList>
            </Menu>
            {/* End Settings Menu */}
        </Stack>
    );
};

export default Home;
