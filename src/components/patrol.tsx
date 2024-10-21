import { Accordion, AccordionActions, AccordionSummary, Alert, Box, Button, Chip, Dialog, DialogActions, DialogTitle, Divider, IconButton, MenuItem, Paper, Select, Stack, Tooltip, Typography } from "@mui/material";
import ReusableAppbarToolbar from "./reusables/appbar_toolbar";
import { ExitToAppOutlined, ExpandMore, FastfoodOutlined } from "@mui/icons-material";
import React from "react";
import { PatrolContext } from "../contexts/patrol";
import { MainDataContext } from "../contexts/mainData";
import { AuthContext } from "../contexts/Auth";
import { ConvertDuration, Department, Server } from "../types";
import { enqueueSnackbar } from "notistack";
import { GiPoliceCar } from "react-icons/gi";

const Patrol = () => {
    const patrol = React?.useContext(PatrolContext);
    const mainData = React?.useContext(MainDataContext);
    const Auth = React?.useContext(AuthContext); // Use AuthContext to check roles
    const [ExitPatrolDialogOpen, setExitPatrolDialogOpen] = React.useState(false);
    
    const handleExitPatrol = () => {
        patrol?.handleCancelPatrol();
        console.log("Exiting Patrol");
    };

    const handleSelectDepartment = (Dept: Department) => {
        patrol?.handleSelectDepartment(Dept);
    };

    const handleSelectServer = (Server: Server) => {
        patrol?.handleSelectServer(Server);
    };

    const handleOnDuty = () => {
        patrol?.handleOnDuty();
    };
    
    const handleOffDuty = () => {
        patrol?.handleOffDuty();
    };

    const handleSubdivisionStart = (subdiv: any) => {
        if (patrol?.activeSubdivision && patrol.activeSubdivision !== subdiv.Alias) {
            enqueueSnackbar(`Pause or stop the active subdivision before starting another`, { variant: "warning" });
        } else {
            patrol?.handleStartSubdivisionUsage(subdiv);
        }
    };

    const handleSubdivisionPause = (subdiv: any) => {
        if (patrol?.activeSubdivision === subdiv.Alias) {
            patrol?.handlePauseSubdivisionUsage(subdiv);
        }
    };

    const handleSubdivisionStop = (subdiv: any) => {
        if (patrol?.activeSubdivision === subdiv.Alias) {
            patrol?.handleStopSubdivisionUsage(subdiv);
        }
    };

    const handleSubdivisionResume = (subdiv: any) => {
        if (!patrol?.activeSubdivision && patrol?.subdivisionUsage?.some((usage) => usage.Subdivision.Alias === subdiv.Alias)) {
            patrol?.handleResumeSubdivisionUsage(subdiv);
        }
    };

    return (
        <Stack spacing={10} direction={'column'} alignItems={'center'}>
            <ReusableAppbarToolbar 
                elements={[
                    <Stack key={1} direction="row" alignItems="center" flexGrow={0.5} spacing={1}>
                        <Typography key={0}>Patrol as</Typography>
                        <Select defaultValue={patrol?.selectedDepartment?.Alias} variant="standard" autoWidth disabled={patrol?.onDuty}>
                            {mainData?.Departments?.map((dept, index) => {
                                const hasPermission = Auth?.guildMember?.roles?.includes(dept?.RoleID) || false;
                                return (
                                    <MenuItem  key={index} value={dept?.Alias} onClick={() => handleSelectDepartment(dept)} disabled={!hasPermission}>
                                        {dept?.Alias}
                                    </MenuItem>
                                );
                            })}
                        </Select>
                        <Typography>In</Typography>
                        <Select defaultValue={patrol?.selectedServer?.Alias} variant="standard" autoWidth disabled={patrol?.onDuty}>
                            {mainData?.Servers?.map((server, index) => (
                                <MenuItem key={index} value={server?.Alias} onClick={() => handleSelectServer(server)}>
                                    {server?.Alias}
                                </MenuItem>
                            ))}
                        </Select>
                    </Stack>,
                    <Typography key={1} variant="h6" component="div" flexGrow={0.5} zIndex={1}>
                        {ConvertDuration(patrol?.mainPatrolDuration || 0)}
                    </Typography>,
                    <Tooltip key={2} title="Exit Patrol">
                        <IconButton onClick={() => setExitPatrolDialogOpen(true)} color="inherit">
                            <ExitToAppOutlined />
                        </IconButton>
                    </Tooltip>
                ]}
                appbarProps={{ variant: 'elevation' }}
                toolbarProps={{ variant: 'dense', color: 'warning' }}
            />

            <Stack direction={'column'} spacing={5} alignItems={'center'}>
                <Box component={Paper} width={'90vw'} padding={1}>
                    <Typography padding={'15px'} textAlign="left" color="textSecondary">Patrol Actions</Typography>
                    <Divider />
                    <Stack direction={'row'} spacing={5} justifyContent="center" alignItems="center" paddingTop={3}>
                        <Tooltip title={`Start ${patrol?.selectedDepartment?.Alias} patrol`}>
                            <Button startIcon={<GiPoliceCar />} variant="contained" color="success" disabled={patrol?.onDuty} onClick={handleOnDuty}>10-41</Button>
                        </Tooltip>
                        <Tooltip title={`Pause ${patrol?.selectedDepartment?.Alias} patrol`}>
                            <Button startIcon={<FastfoodOutlined />} variant="contained" color="warning" disabled={!patrol?.onDuty} onClick={handleOffDuty}>10-7</Button>
                        </Tooltip>
                        <Tooltip title={`Stop ${patrol?.selectedDepartment?.Alias} patrol`}>
                            <Button startIcon={<ExitToAppOutlined />} variant="contained" color="error" disabled={!patrol?.onDuty} onClick={handleOffDuty}>10-42</Button>
                        </Tooltip>
                    </Stack>
                </Box>
            </Stack>

            <Stack direction={'column'} alignItems={'center'}>
                <Box component={Paper} width={'90vw'} padding={1}>
                    <Typography padding={'15px'} textAlign="left" color="textSecondary">Subdivision Actions</Typography>
                    <Divider />
                    <Stack justifyContent="center" alignItems="center" paddingTop={3}>
                        {mainData?.Departments?.find((dept) => dept?.Alias === patrol?.selectedDepartment?.Alias)?.Subdivisions ? (
                            mainData?.Departments?.find((dept) => dept?.Alias === patrol?.selectedDepartment?.Alias)?.Subdivisions?.map((subdiv, index) => {
                                const isActive = patrol?.activeSubdivision === subdiv.Alias;
                                const isPaused = patrol?.subdivisionUsage?.some(
                                    (usage) => usage.Subdivision.Alias === subdiv.Alias && !usage.EndTime && usage.Duration > 0
                                );  
                                return (
                                    <Accordion key={index} sx={{ width: '100%' }} elevation={2}>
                                        <AccordionSummary expandIcon={<ExpandMore />}>
                                            <Typography flexGrow={1}>{subdiv?.FullName}</Typography>
                                            {ConvertDuration(patrol?.subdivisionUsage?.find(subdivUsage => subdivUsage?.Subdivision?.Alias === subdiv?.Alias)?.Duration || 0)}

                                            <Chip
                                                label={isActive ? "Active" : isPaused ? "Paused" : "Inactive"}
                                                variant="outlined"
                                                color={isActive ? "success" : isPaused ? "warning" : "error"}
                                                size="small"
                                                sx={{ mr: '15px' }}
                                            />
                                        </AccordionSummary>
                                        <AccordionActions>
                                            {!isActive && !isPaused && (
                                                <Button variant="contained" color="success" startIcon={<GiPoliceCar />} disabled={!patrol?.onDuty} onClick={() => handleSubdivisionStart(subdiv)}>
                                                    10-41
                                                </Button>
                                            )}
                                            {isActive && (
                                                <Button startIcon={<FastfoodOutlined />} variant="contained" color="warning" onClick={() => handleSubdivisionPause(subdiv)}>
                                                    10-7
                                                </Button>
                                            )}
                                            {isPaused && (
                                                <Button startIcon={<GiPoliceCar />} variant="contained" color="success" 
                                                onClick={() => handleSubdivisionResume(subdiv)}>
                                                    Resume
                                                </Button>
                                            )}
                                            {isActive && (
                                                <Button variant="contained" color="error" startIcon={<ExitToAppOutlined />} onClick={() => handleSubdivisionStop(subdiv)}>
                                                    10-42
                                                </Button>
                                            )}
                                        </AccordionActions>
                                    </Accordion>
                                );
                            })
                        ) : (
                            <Alert variant="outlined" color="error" severity="info" sx={{ width: '100%' }}>
                                No subdivisions found
                            </Alert>
                        )}
                    </Stack>
                </Box>
            </Stack>

            {/* Exit Patrol Dialog */}
            <Dialog open={ExitPatrolDialogOpen} onClose={() => setExitPatrolDialogOpen(false)}>
                <DialogTitle color="textSecondary">
                    Are you sure you want to exit patrol?
                </DialogTitle>
                <DialogActions>
                    <Button onClick={handleExitPatrol}>Yes</Button>
                    <Button onClick={() => setExitPatrolDialogOpen(false)}>Cancel</Button>
                </DialogActions>
            </Dialog>
        </Stack>
    );
};

export default Patrol;
