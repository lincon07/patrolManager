import {
    IconButton,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
    Chip,
    Tooltip,
    Alert,
    Button,
    Menu,
    MenuItem,
    Paper,
    Fab,
} from "@mui/material";
import ReusableAppbarToolbar from "./reusables/appbar_toolbar";
import { ArrowUpward, Delete, ExitToAppOutlined, ExpandMore } from "@mui/icons-material";
import { MainDataContext } from "../contexts/mainData";
import React, { useContext, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ConvertDate, ConvertDuration } from "../types";
import { PatrolContext } from "../contexts/patrol";

const Logs = () => {
    const mainData = useContext(MainDataContext);
    const patrol = useContext(PatrolContext);
    const [departmentMenuAnchor, setDepartmentMenuAnchor] = useState<null | HTMLElement>(null);
    const [serverMenuAnchor, setServerMenuAnchor] = useState<null | HTMLElement>(null);
    const departmentMenuOpen = Boolean(departmentMenuAnchor);
    const serverMenuOpen = Boolean(serverMenuAnchor);
    const [scrollingDirection, setScrollingDirection] = useState<"up" | "down" | null>(null);
    const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
    const [selectedServer, setSelectedServer] = useState<string | null>(null);
    const nav = useNavigate();
    const location = useLocation();

    const handleDepartmentMenu = (event: React.MouseEvent<HTMLElement>) => {
        setDepartmentMenuAnchor(event.currentTarget);
    };

    const handleSettingsMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
        setServerMenuAnchor(event.currentTarget);
    };

    const closeDepartmentMenu = () => setDepartmentMenuAnchor(null);
    const closeServerMenu = () => setServerMenuAnchor(null);

    useEffect(() => {
        if (location?.state?.department) { 
            setSelectedDepartment(location.state.department);
        }
    }, [location])
    const handleSelectDepartment = (department: string | null) => {
        setSelectedDepartment(department);
        closeDepartmentMenu();
    };

    const handleSelectServer = (server: string | null) => {
        setSelectedServer(server);
        closeServerMenu();
    };

    let lastScrollTop = 0;

    const onScroll = (e: any) => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        if (scrollTop > lastScrollTop) {
            setScrollingDirection("down");
        } else {
            setScrollingDirection("up");
        }

        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    };

    useEffect(() => {
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const handleScrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // Filter logs based on selected department and server
    const filteredLogs = mainData?.Members?.PatrolLogs?.filter(log => {
        const departmentMatch = selectedDepartment ? log.department?.FullName === selectedDepartment : true;
        const serverMatch = selectedServer ? log.server?.FullName === selectedServer : true;
        return departmentMatch && serverMatch;
    }) || [];

    return (
        <Stack spacing={10}>
            <ReusableAppbarToolbar
                elements={[
                    <Typography key={1} variant="h6" component="div" flexGrow={1}>
                        Logs
                    </Typography>,
                    <IconButton key={2} onClick={() => nav("/home")}>
                        <ExitToAppOutlined />
                    </IconButton>,
                ]}
                appbarProps={{ variant: "elevation" }}
                toolbarProps={{ variant: "dense" }}
            />

            <Table size="small">
                {/* Table Headers */}
                <TableHead>
                    <TableRow component={Paper}>
                        <TableCell>#</TableCell>
                        <TableCell>Dates</TableCell>
                        <TableCell>Duration</TableCell>
                        <TableCell>
                            <Tooltip title="Department">
                                <Button color="inherit" endIcon={<ExpandMore />} onClick={handleDepartmentMenu}>
                                    {selectedDepartment || "Department"}
                                </Button>
                            </Tooltip>
                        </TableCell>
                        <TableCell>
                            <Tooltip title="Server">
                                <Button color="inherit" endIcon={<ExpandMore />} onClick={handleSettingsMenu}>
                                    {selectedServer || "Server"}
                                </Button>
                            </Tooltip>
                        </TableCell>
                        <TableCell>Subdivision Usage</TableCell>
                        <TableCell>Actions</TableCell>
                    </TableRow>
                </TableHead>
                {/* Table Body */}
                <TableBody>
                    {filteredLogs.length ? (
                        filteredLogs.map((log, index) => (
                            <TableRow key={index} component={index % 2 !== 0 ? Paper : "tr"}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{ConvertDate(log.StartTime)} - {ConvertDate(log.EndTime)}</TableCell>
                                <TableCell>{ConvertDuration(log.Duration)}</TableCell>
                                <TableCell><Chip size="small" label={log.department?.FullName} /></TableCell>
                                <TableCell><Chip size="small" label={log.server?.FullName} /></TableCell>
                                <TableCell>
                                    {log.SubdivisionUsage && log.SubdivisionUsage.length > 0 ? (
                                        log.SubdivisionUsage.map((subdiv, subIndex) => (
                                            <Tooltip key={subIndex} title={`Duration: ${ConvertDuration(subdiv.Duration)}`}>
                                                <Chip label={subdiv.Subdivision?.Alias} />
                                            </Tooltip>
                                        ))
                                    ) : (
                                        <Chip label="N/A" />
                                    )}
                                </TableCell>
                                <TableCell>
                                    <IconButton onClick={() => patrol?.handleDeletePatrolLog(index)}>
                                        <Delete />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={8}>
                                <Alert severity="warning">No logs found</Alert>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
            {/* Department Menu */}
            <Menu
                anchorEl={departmentMenuAnchor}
                open={departmentMenuOpen}
                onClose={closeDepartmentMenu}
            >
                <MenuItem onClick={() => handleSelectDepartment(null)}>All Departments</MenuItem>
                {mainData?.Departments?.map((dept, index) => (
                    <MenuItem
                        key={index}
                        onClick={() => handleSelectDepartment(dept?.FullName)}
                    >
                        {dept?.FullName}
                    </MenuItem>
                ))}
            </Menu>
            {/* Server Menu */}
            <Menu anchorEl={serverMenuAnchor} open={serverMenuOpen} onClose={closeServerMenu}>
                <MenuItem onClick={() => handleSelectServer(null)}>All Servers</MenuItem>
                {mainData?.Servers?.map((server, index) => (
                    <MenuItem
                        key={index}
                        onClick={() => handleSelectServer(server?.FullName)}
                    >
                        {server?.FullName}
                    </MenuItem>
                ))}
            </Menu>

            {scrollingDirection === "down" && (
                <Fab
                    size="small"
                    color="secondary"
                    sx={{ position: 'fixed', bottom: 16, right: 16 }}
                    onClick={handleScrollToTop}
                >
                    <ArrowUpward sx={{ color: 'white' }} />
                </Fab>
            )}
        </Stack>
    );
};

export default Logs;
