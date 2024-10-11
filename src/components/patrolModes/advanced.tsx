import { CancelOutlined, Dns, LocalPoliceOutlined, LocalFireDepartmentOutlined, PeopleOutlineOutlined } from "@mui/icons-material";
import { Button, Card, CardActions, CardMedia, Chip, Divider, Menu, MenuItem, MenuList, Stack, Tooltip, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { MainDataContext } from "../../contexts/mainData";
import { PatrolContext } from "../../contexts/patrol";
import { Department, Server } from "../../types";
import { AuthContext } from "../../contexts/Auth";
import { enqueueSnackbar } from "notistack";

const Advanced = () => {
    const mainData = React.useContext(MainDataContext);
    const patrol = React.useContext(PatrolContext);
    const Auth = React.useContext(AuthContext);
    const [serverMenuOpen, setServerMenuOpen] = useState(false);
    const [serverMenuAnchor, setServerMenuAnchor] = useState<null | HTMLElement>(null);
    const [roles, setRoles] = React.useState<string[]>([]);

    const handleServerMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
        setServerMenuAnchor(event.currentTarget);
        setServerMenuOpen(true);
    };

    const handlePatrol = (e: React.MouseEvent<HTMLButtonElement>, Department: Department) => {
        handleServerMenuOpen(e);
        patrol?.handleSelectDepartment(Department);
    };

    const handleServerSelect = (Server: Server) => {
        patrol?.handleSelectServer(Server);
        setServerMenuOpen(false);
    };

    useEffect(() => {
        const accessToken = localStorage.getItem('authToken');
        if (accessToken) {
            Auth?.fetchMainGuildMemberData(accessToken).then(roles => {
                console.log('User is authenticated');
                console.log("roles", roles);
                setRoles(roles);
            });
        } else {
            console.log('User is not authenticated');
        }
    }, []);
    

    return (
        <Stack padding={3}>
            <Stack display={'flex'} flexDirection={'row'} flexWrap={'wrap'} gap={'3vw'} justifyContent={'center'}>
                {mainData?.Departments?.map((dept, index) => (
                    <Card variant="elevation" sx={{ width: '25vw', height: "auto" }} key={index}>
                        <CardMedia width={"100%"} image={dept?.Image} component="img" />
                        <CardMedia>
                            <Stack sx={{ display: 'flex', flexDirection: 'row', gap: '10px', flexWrap: 'wrap', margin: '15px' }}>
                                <Tooltip title={dept?.FullName}>
                                    <Chip icon={<LocalPoliceOutlined />} label={dept?.Alias} color="info" variant="outlined" size="small" />
                                </Tooltip>
                            </Stack>
                        </CardMedia>
                        <Divider />
                        <CardActions sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Button 
                                startIcon={dept?.Icon} 
                                variant="outlined" 
                                color="primary" 
                                size="small" 
                                onClick={(e) => {handlePatrol(e, dept)}} 
                                disabled={roles.includes(dept?.RoleID) ? false : true}
                            >
                                Patrol
                            </Button>
                        </CardActions>
                    </Card>
                ))}
            </Stack>

            <Menu
                variant="menu"
                open={serverMenuOpen}
                anchorEl={serverMenuAnchor}
                onClose={() => setServerMenuOpen(false)}
            >
                <MenuList variant="menu" dense>
                    {mainData?.Servers?.map((server, index) => (
                        <MenuItem divider key={index} onClick={() => { handleServerSelect(server) }}>
                            <Dns />
                            <Typography ml={'10px'}> {server?.FullName} </Typography>
                        </MenuItem>
                    ))}
                </MenuList>
            </Menu>
        </Stack>
    );
};

export default Advanced;
