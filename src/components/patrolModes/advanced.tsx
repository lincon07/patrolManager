import React, { useState, useContext } from "react";
import { MainDataContext } from "../../contexts/mainData";
import { PatrolContext } from "../../contexts/patrol";
import { AuthContext } from "../../contexts/Auth";
import { Button, Card, CardActions, CardMedia, Chip, Divider, Menu, MenuItem, MenuList, Stack, Tooltip, Typography, Alert, IconButton, Badge } from "@mui/material";
import { BookOutlined, BookSharp, CancelOutlined, CheckOutlined, Dns, LocalFireDepartmentOutlined, LocalPoliceOutlined, LoginSharp, PeopleOutline, Start } from "@mui/icons-material";
import { ConvertDuration, Department, Server } from "../../types";
import { GiPoliceCar, GiPouringChalice } from "react-icons/gi";
import { SiContainerd } from "react-icons/si";
import { PiPoliceCarLight } from "react-icons/pi";
import { useNavigate } from "react-router-dom";

const Advanced = () => {
    const mainData = useContext(MainDataContext);
    const patrol = useContext(PatrolContext);
    const Auth = useContext(AuthContext);
    const nav = useNavigate()
    const [serverMenuOpen, setServerMenuOpen] = useState(false);
    const [serverMenuAnchor, setServerMenuAnchor] = useState<null | HTMLElement>(null);

    const handleServerMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
        setServerMenuAnchor(event.currentTarget);
        setServerMenuOpen(true);
    };

    const handlePatrol = (e: React.MouseEvent<HTMLButtonElement>, department: Department) => {
        handleServerMenuOpen(e);
        patrol?.handleSelectDepartment(department);
    };

    const handleServerSelect = (server: Server) => {
        patrol?.handleSelectServer(server);
        setServerMenuOpen(false);
    };

    const handleDeptIcon = (dept: Department) => {
        switch (dept?.Icon) {
            case "LEO":
                return <LocalPoliceOutlined />;
            case "CIV":
                return <PeopleOutline />;
            case "FIRE":
                return <LocalFireDepartmentOutlined />;
            default:
                return <LocalPoliceOutlined />;
        }
    };

    const handleTotalPatrolSeconds = (Dept: Department, raw: boolean = false): number | string => {
        const totalSeconds = mainData?.Members?.PatrolLogs
            ?.filter((log) => log?.department?.Alias === Dept?.Alias && log.EndTime && new Date(log.EndTime).getMonth() === new Date().getMonth())
            ?.reduce((acc, curr) => acc + (curr?.Duration || 0), 0) || 0;

        return raw ? totalSeconds : ConvertDuration(totalSeconds);
    };

    return (
        <Stack padding={3}>
            {/* Check if Departments is available and is an array */}
            {Array.isArray(mainData?.Departments) && mainData?.Departments.length > 0 ? (
                <Stack display={'flex'} flexDirection={'row'} flexWrap={'wrap'} gap={'3vw'} justifyContent={'center'}>
                    {mainData?.Departments.map((dept, index) => {
                        const hasPermission = Auth?.guildMember?.roles?.includes(dept?.RoleID) || false;

                        // Display Alert if the user doesn't have permission
                        if (!hasPermission) {
                            return (
                               null
                            );
                        }

                        return (
                            <Card key={dept?.RoleID || index} variant="elevation" sx={{ width: '25vw', height: "auto" }}>
                                <CardMedia width={"100%"} image={dept?.Image} component="img" />
                                <CardMedia>
                                    <Stack
                                        sx={{
                                            display: 'flex',
                                            flexDirection: 'row',
                                            gap: '10px',
                                            flexWrap: 'wrap',
                                            margin: '15px',
                                        }}
                                    >
                                        <Tooltip title={dept?.FullName}>
                                            <Chip
                                                icon={handleDeptIcon(dept)}
                                                label={dept?.Alias}
                                                color="info"
                                                variant="outlined"
                                                size="small"
                                            />
                                        </Tooltip>
                                        <Tooltip title={`${ConvertDuration(handleTotalPatrolSeconds(dept, true) as number)}`}>
                                            <Chip
                                                icon={(handleTotalPatrolSeconds(dept, true) as number) > 7200 ? <CheckOutlined /> : <CancelOutlined />}
                                                label={(handleTotalPatrolSeconds(dept, true) as number) > 7200 ? `Hours Meet: ${ConvertDuration(handleTotalPatrolSeconds(dept, true) as number)}` : "Hours Not Meet"}
                                                color={(handleTotalPatrolSeconds(dept, true) as number) > 7200 ? "success" : "error"}
                                                variant="outlined"
                                                size="small"
                                            />
                                        </Tooltip>
                                    </Stack>
                                </CardMedia>
                                <Divider />
                                <CardActions sx={{display: 'flex', flexDirection: 'row'}}>
                                    <Stack spacing={3} direction={'row'} flexGrow={1}>
                                        <Badge color="secondary" badgeContent={mainData?.Members?.PatrolLogs?.filter((log) => log.department.Alias === dept?.Alias).length}>
                                            <IconButton size="small" onClick={() => {
                                                nav("/logs", { state: { department: dept?.FullName } });
                                            }}>
                                                <BookOutlined />
                                            </IconButton>
                                        </Badge> 
                                    </Stack>
                                    <Tooltip title="Patrol">
                                            <IconButton onClick={(e) => handlePatrol(e, dept)}>
                                                <PiPoliceCarLight />
                                            </IconButton>
                                        </Tooltip>
                                </CardActions>
                            </Card>
                        );
                    })}
                </Stack>
            ) : (
                <Typography variant="h6" align="center">
                    No departments available.
                </Typography>
            )}

            {/* Server selection menu */}
            <Menu
                variant="menu"
                open={serverMenuOpen}
                anchorEl={serverMenuAnchor}
                onClose={() => setServerMenuOpen(false)}
            >
                <MenuList variant="menu">
                    {mainData?.Servers?.map((server, index) => (
                        <MenuItem
                            key={server?.Alias || index}
                            divider={mainData?.Servers?.length - 1 !== index}
                            onClick={() => handleServerSelect(server)}
                        >
                            <Dns />
                            <Typography ml={'10px'}>{server?.FullName}</Typography>
                        </MenuItem>
                    ))}
                </MenuList>
            </Menu>
        </Stack>
    );
};

export default Advanced;
