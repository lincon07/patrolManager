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
} from "@mui/material";
import ReusableAppbarToolbar from "./reusables/appbar_toolbar";
import { Delete, ExitToAppOutlined, ExpandMore, MoreVert } from "@mui/icons-material";
import { MainDataContext } from "../contexts/mainData";
import React, { useContext } from "react";
import { useNavigate } from "react-router-dom"; // Assuming you're using react-router for navigation
import { ConvertDate, ConvertDuration } from "../types";
import { PatrolContext } from "../contexts/patrol";

const Logs = () => {
    const mainData = useContext(MainDataContext);
    const patrol = useContext(PatrolContext);
    const [departmentMenuAnchor, setDepartmentMenuAnchor] = React.useState<null | HTMLElement>(null);
    const [serverMenuAnchor, setServerMenuAnchor] = React.useState<null | HTMLElement>(null);
    const departmentMenuOpen = Boolean(departmentMenuAnchor);
    const serverMenuOpen = Boolean(serverMenuAnchor);
    const nav = useNavigate();

    const handleDepartmentMenu = (event: React.MouseEvent<HTMLElement>) => {
        setDepartmentMenuAnchor(event.currentTarget);
    };

    const handleSettingsMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
        setServerMenuAnchor(event.currentTarget);
    };

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

            <Table>
                {/* Table Headers */}
                <TableHead>
                    <TableRow>
                        <TableCell>#</TableCell>
                        <TableCell>Start Date</TableCell>
                        <TableCell>End Date</TableCell>
                        <TableCell>Duration</TableCell>
                        <TableCell>
                            <Tooltip title="Department">
                                <Button color="inherit" endIcon={<ExpandMore />} onClick={handleDepartmentMenu}>
                                    Department
                                </Button>
                            </Tooltip>
                        </TableCell>
                        <TableCell>
                            <Tooltip title="Server">
                                <Button color="inherit" endIcon={<ExpandMore />} onClick={handleSettingsMenu}>
                                    Server
                                </Button>
                            </Tooltip>
                        </TableCell>
                        <TableCell>Subdivision Usage</TableCell>
                        <TableCell>Actions</TableCell>
                    </TableRow>
                </TableHead>
                {/* Table Body */}
                <TableBody>
    {mainData?.Members?.PatrolLogs?.length ? (
        mainData?.Members?.PatrolLogs?.map((log, index) => (
            <TableRow key={index}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{ConvertDate(log?.StartTime)}</TableCell>
                <TableCell>{ConvertDate(log?.EndTime)}</TableCell>
                <TableCell>{ConvertDuration(log?.Duration)}</TableCell>
                <TableCell>{log.department?.Alias}</TableCell>
                <TableCell>{log.server?.Alias}</TableCell>
                <TableCell>
                    {log.SubdivisionUsage?.map((subdiv, subIndex) => (
                        <Tooltip key={subIndex} title={`Duration: ${ConvertDuration(subdiv?.Duration)}`}>
                            <Chip label={subdiv.Subdivision?.Alias} />
                        </Tooltip>
                    ))}
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
                onClose={() => setDepartmentMenuAnchor(null)}
            >
                {mainData?.Departments?.map((dept, index) => (
                    <MenuItem
                        key={index}
                        onClick={() => {

                            setDepartmentMenuAnchor(null);
                        }}
                    >
                        {dept?.FullName}
                    </MenuItem>
                ))}
            </Menu>
            {/* Server Menu */}
            <Menu anchorEl={serverMenuAnchor} open={serverMenuOpen} onClose={() => setServerMenuAnchor(null)}>
                {mainData?.Servers?.map((server, index) => (
                    <MenuItem
                        key={index}
                        onClick={() => {
                            setServerMenuAnchor(null);
                        }}
                    >
                        {server?.FullName}
                    </MenuItem>
                ))}
            </Menu>
        </Stack>
    );
};

export default Logs;
