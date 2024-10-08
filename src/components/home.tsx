import { Chip, IconButton, List, Menu, MenuItem, MenuList, Stack, Tooltip, Typography } from "@mui/material";
import ReusableAppbarToolbar from "./reusables/appbar_toolbar";
import { Book, ExitToAppOutlined, ManageAccounts, Settings } from "@mui/icons-material";
import React, { useContext } from "react";
import { AuthContext } from "../contexts/Auth";
import { UpdaterContext } from "../contexts/updater";
import Advanced from "./patrolModes/advanced";

const Home = () => {
    const Auth = useContext(AuthContext);
    const Updater = useContext(UpdaterContext);
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

    return (
        <Stack spacing={7}>
            <ReusableAppbarToolbar 
                elements={[
                    <Stack key="stack" direction="row" spacing={2} flexGrow={1}>
                        <Typography key="title">
                            Home
                        </Typography>
                        {Updater?.currentVersion && (
                            <Chip  label={`v${Updater.currentVersion}`} variant="outlined" color="info" size="small" />
                        )}
                    </Stack>,
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
                appbarProps={{ variant: "elevation" }} toolbarProps={{ variant: "dense", color: "warning" }}
            />

            {/* Patrol Mode */}
            <Advanced />
            {/* End Patrol Mode */}

            
            {/* Settings Menu */}
            <Menu
                open={Boolean(settingsMenuAnchor)}
                anchorEl={settingsMenuAnchor}
                onClose={handleSettingsMenuClose}
                
            >
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
