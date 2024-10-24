import {
    Accordion,
    AccordionActions,
    AccordionSummary,
    Alert,
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogTitle,
    Divider,
    IconButton,
    MenuItem,
    Paper,
    Select,
    Stack,
    Tooltip,
    Typography,
} from "@mui/material";
import ReusableAppbarToolbar from "./reusables/appbar_toolbar";
import {
    ExitToAppOutlined,
    ExpandMore,
    FastfoodOutlined,
    Refresh,
} from "@mui/icons-material";
import React, { useEffect, useState } from "react";
import { PatrolContext } from "../contexts/patrol";
import { MainDataContext } from "../contexts/mainData";
import { AuthContext } from "../contexts/Auth";
import { ConvertDuration, Department, Server } from "../types";
import { enqueueSnackbar } from "notistack";
import { GiPoliceCar } from "react-icons/gi";
import { invoke } from "@tauri-apps/api/core";

const Patrol: React.FC = () => {
    const patrol = React.useContext(PatrolContext);
    const mainData = React.useContext(MainDataContext);
    const Auth = React.useContext(AuthContext);
    const [ExitPatrolDialogOpen, setExitPatrolDialogOpen] = useState(false);
    const [channelClients, setChannelClients] = useState<any[]>([]);
    let socket: WebSocket | null = null;

    useEffect(() => {
        // WebSocket connection
        socket = new WebSocket("ws://localhost:33802");

        socket.onopen = () => {
            console.log("Connected to WebSocket server");
        };

        socket.onmessage = (event) => {
            try {
                const response = JSON.parse(event.data);
                if (response && response.type === "recv_controller_data") {
                    // Update the state with the channel_clients data
                    setChannelClients(response.data.channel_clients || []);
                }
                console.log("Received data:", response);
            } catch (error) {
                console.error("Error parsing WebSocket message:", error);
            }
        };

        socket.onerror = (error) => {
            console.error("WebSocket error:", error);
        };

        // Clean up WebSocket connection on component unmount
        return () => {
            if (socket) {
                socket.close();
                console.log("WebSocket connection closed");
            }
        };
    }, []);

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

    const handleOnDuty = async () => {
        patrol?.handleOnDuty();
        if (patrol?.selectedDepartment && patrol?.selectedServer) {
            await updateDiscordStatus(
                patrol.selectedDepartment.Alias,
                patrol.selectedServer.FullName
            );
            enqueueSnackbar("rpc updated", { variant: "success" });
        } else {
            enqueueSnackbar("rpc not updated", { variant: "error" });
        }
    };

    // Function to update the Discord Rich Presence
    async function updateDiscordStatus(
        departmentAlias: string,
        serverAlias: string
    ) {
        try {
            await invoke("update_discord_status", {
                department: departmentAlias,
                server: serverAlias,
            });
            console.log("Discord status updated");
        } catch (error) {
            console.error("Failed to update Discord status:", error);
        }
    }

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

    const handleRefresh = () => {
        if (socket) {
            const message = {
                type: "get_controller_data",
            };
            socket.send(JSON.stringify(message));
            console.log("Sent message to server");
        }
    };

    useEffect(() => {
        console.log("Channel Clients", channelClients);
    }, [channelClients]);

    return (
        <Stack spacing={10} direction={"column"} alignItems={"center"}>
            <ReusableAppbarToolbar
                elements={[
                    <Stack
                        key={1}
                        direction="row"
                        alignItems="center"
                        flexGrow={1}
                        spacing={1}
                    >
                        <Typography key={0}>Patrol as</Typography>
                        <Select
                            defaultValue={patrol?.selectedDepartment?.Alias}
                            variant="standard"
                            autoWidth
                            disabled={patrol?.onDuty}
                        >
                            {mainData?.Departments?.map((dept, index) => {
                                const hasPermission =
                                    Auth?.guildMember?.roles?.includes(
                                        dept?.RoleID
                                    ) || false;
                                return (
                                    <MenuItem
                                        key={index}
                                        value={dept?.Alias}
                                        onClick={() =>
                                            handleSelectDepartment(dept)
                                        }
                                        disabled={!hasPermission}
                                    >
                                        {dept?.Alias}
                                    </MenuItem>
                                );
                            })}
                        </Select>
                        <Typography>In</Typography>
                        <Select
                            defaultValue={patrol?.selectedServer?.FullName}
                            variant="standard"
                            autoWidth
                            disabled={patrol?.onDuty}
                        >
                            {mainData?.Servers?.map((server, index) => (
                                <MenuItem
                                    key={index}
                                    value={server?.FullName}
                                    onClick={() => handleSelectServer(server)}
                                >
                                    {server?.FullName}
                                </MenuItem>
                            ))}
                        </Select>
                    </Stack>,
                    <Tooltip key={2} title="Exit Patrol">
                        <IconButton
                            onClick={() => setExitPatrolDialogOpen(true)}
                            color="inherit"
                        >
                            <ExitToAppOutlined />
                        </IconButton>
                    </Tooltip>,
                ]}
                appbarProps={{ variant: "elevation" }}
                toolbarProps={{ variant: "dense", color: "warning" }}
            />

            <Stack spacing={5} direction={"column"} alignItems={"center"}>
                <Box component={Paper} width={"90vw"} padding={1}>
                    <Stack direction={"row"} alignItems="center">
                        <Typography
                            padding={"15px"}
                            flexGrow={1}
                            color="textSecondary"
                        >
                            Patrol Actions
                        </Typography>
                        <Typography padding={"15px"} key={1} color="textSecondary">
                            {ConvertDuration(patrol?.mainPatrolDuration || 0)}
                        </Typography>
                    </Stack>
                    <Divider />
                    <Stack
                        direction={"row"}
                        spacing={5}
                        justifyContent="center"
                        alignItems="center"
                        paddingTop={3}
                    >
                        <Tooltip title={`Start ${patrol?.selectedDepartment?.Alias} patrol`}>
                            <Button
                                startIcon={<GiPoliceCar />}
                                variant="contained"
                                color="success"
                                disabled={patrol?.onDuty}
                                onClick={handleOnDuty}
                            >
                                10-41
                            </Button>
                        </Tooltip>
                        <Tooltip title={`Pause ${patrol?.selectedDepartment?.Alias} patrol`}>
                            <Button
                                startIcon={<FastfoodOutlined />}
                                variant="contained"
                                color="warning"
                                disabled={!patrol?.onDuty}
                                onClick={handleOffDuty}
                            >
                                10-7
                            </Button>
                        </Tooltip>
                        <Tooltip title={`Stop ${patrol?.selectedDepartment?.Alias} patrol`}>
                            <Button
                                startIcon={<ExitToAppOutlined />}
                                variant="contained"
                                color="error"
                                disabled={!patrol?.onDuty}
                                onClick={handleOffDuty}
                            >
                                10-42
                            </Button>
                        </Tooltip>
                    </Stack>
                </Box>
            </Stack>

            {/* Subdivision Actions */}
            <Stack direction={"column"} alignItems={"center"}>
                <Box component={Paper} width={"90vw"} padding={1}>
                    <Typography
                        padding={"15px"}
                        textAlign="left"
                        color="textSecondary"
                    >
                        Subdivision Actions
                    </Typography>
                    <Divider />
                    <Stack justifyContent="center" alignItems="center" paddingTop={3}>
                        {mainData?.Departments?.find(
                            (dept) => dept?.Alias === patrol?.selectedDepartment?.Alias
                        )?.Subdivisions ? (
                            mainData?.Departments?.find(
                                (dept) => dept?.Alias === patrol?.selectedDepartment?.Alias
                            )?.Subdivisions?.map((subdiv, index) => {
                                const isActive = patrol?.activeSubdivision === subdiv.Alias;
                                const isPaused = patrol?.subdivisionUsage?.some(
                                    (usage) =>
                                        usage.Subdivision.Alias === subdiv.Alias &&
                                        !usage.EndTime &&
                                        usage.Duration > 0
                                );
                                return (
                                    <Accordion key={index} sx={{ width: "100%" }} elevation={2}>
                                        <AccordionSummary expandIcon={<ExpandMore />}>
                                            <Typography flexGrow={1}>
                                                {subdiv?.Alias}
                                            </Typography>
                                            <Tooltip
                                                title={ConvertDuration(
                                                    patrol?.subdivisionUsage?.find(
                                                        (subdivUsage) =>
                                                            subdivUsage?.Subdivision?.Alias ===
                                                            subdiv?.Alias
                                                    )?.Duration || 0
                                                )}
                                            >
                                                <Chip
                                                    label={
                                                        isActive
                                                            ? "Active"
                                                            : isPaused
                                                            ? "Paused"
                                                            : "Inactive"
                                                    }
                                                    variant="outlined"
                                                    color={
                                                        isActive
                                                            ? "success"
                                                            : isPaused
                                                            ? "warning"
                                                            : "error"
                                                    }
                                                    size="small"
                                                    sx={{ mr: "15px" }}
                                                />
                                            </Tooltip>
                                        </AccordionSummary>
                                        <AccordionActions>
                                            <Button
                                                variant="contained"
                                                color="success"
                                                startIcon={<GiPoliceCar />}
                                                disabled={patrol?.onDuty}
                                                onClick={() => handleSubdivisionStart(subdiv)}
                                            >
                                                10-41
                                            </Button>
                                            <Button
                                                startIcon={<FastfoodOutlined />}
                                                variant="contained"
                                                color="warning"
                                                disabled={!patrol?.onDuty}
                                                onClick={() => handleSubdivisionPause(subdiv)}
                                            >
                                                10-7
                                            </Button>
                                            <Button
                                                startIcon={<GiPoliceCar />}
                                                variant="contained"
                                                color="success"
                                                disabled={!patrol?.onDuty}
                                                onClick={() => handleSubdivisionResume(subdiv)}
                                            >
                                                10-8
                                            </Button>
                                            <Button
                                                variant="contained"
                                                color="error"
                                                startIcon={<ExitToAppOutlined />}
                                                disabled={!patrol?.onDuty}
                                                onClick={() => handleSubdivisionStop(subdiv)}
                                            >
                                                10-42
                                            </Button>
                                        </AccordionActions>
                                    </Accordion>
                                );
                            })
                        ) : (
                            <Alert
                                variant="outlined"
                                color="error"
                                severity="info"
                                sx={{ width: "100%" }}
                            >
                                No subdivisions found
                            </Alert>
                        )}
                    </Stack>
                </Box>
            </Stack>

            {/* Online Resources */}
            <Stack direction={"column"} alignItems={"center"}>
                <Box component={Paper} width={"90vw"} padding={1}>
                    <Stack direction={"row"} alignItems="center">
                        <Typography
                            padding={"15px"}
                            textAlign="left"
                            color="textSecondary"
                            flexGrow={1}
                        >
                            Online Resources
                        </Typography>
                        <Tooltip title="Refresh">
                            <IconButton
                                color="inherit"
                                size="small"
                                sx={{ padding: "15px" }}
                                onClick={handleRefresh}
                            >
                                <Refresh />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                    <Divider />
                    <Stack spacing={2}  direction={'row'} display={'flex'} flexWrap={'wrap'} width={'100%'} paddingTop={3}>
                        {channelClients.length > 0 ? (
                            channelClients.map((client, index) => (
                                <Chip
                                    key={index}
                                    label={client.name || `Client ${index + 1}`}
                                    color="default"
                                    variant="filled"
                                    size="medium"
                                />
                            ))
                        ) : (
                            <Alert
                                variant="outlined"
                                color="error"
                                severity="info"
                                sx={{ width: "100%" }}
                            >
                                No clients connected
                            </Alert>
                        )}
                    </Stack>
                </Box>
            </Stack>

            {/* Exit Patrol Dialog */}
            <Dialog
                open={ExitPatrolDialogOpen}
                onClose={() => setExitPatrolDialogOpen(false)}
            >
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
