import { CancelOutlined, Dns, LocalPoliceOutlined } from "@mui/icons-material";
import { Button, Card, CardActionArea, CardActions, CardHeader, CardMedia, Chip, Divider, Icon, Menu, MenuItem, MenuList, Stack, Tooltip, Typography } from "@mui/material";
import React from "react";
import { MainDataContext } from "../../contexts/mainData";
import { PatrolContext } from "../../contexts/patrol";
import { Department, Server } from "../../types";

const Advanced = () => {
    const mainData = React.useContext(MainDataContext);
    const patrol = React.useContext(PatrolContext);
    const [serverMenuOpen, setServerMenuOpen] = React.useState(false);
    const [serverMenuAnchor, setServerMenuAnchor] = React.useState<null | HTMLElement>(null);

    const handleServerMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
        setServerMenuAnchor(event.currentTarget);
        setServerMenuOpen(true);
    };

    const handlePatrol = (e:React.MouseEvent<HTMLButtonElement>, Department:Department) => {
        handleServerMenuOpen(e)
        patrol?.handleSelectDepartment(Department)
    }

    const handleServerSelect = (Server:Server) => {
        patrol?.handleSelectServer(Server)
        setServerMenuOpen(false)
    }

    React.useEffect(() => {
        if(patrol?.selectedDepartment && patrol?.selectedServer) {
            // navigate to patrol page 
        }
    }, [patrol?.selectedDepartment, patrol?.selectedServer])
    return (
        <Stack padding={3}>
            <Stack display={'flex'} flexDirection={'row'} flexWrap={'wrap'} gap={'3vw'} justifyContent={'center'}>
                {mainData?.Departments?.map((dept, index) => (
                    <Card variant="elevation"  sx={{ width: '25vw', height: "auto" }} key={index}>
                        <CardMedia width={"100%"} image={dept?.Image} component="img" />
                        <CardMedia>
                            <Stack sx={{ display: 'flex', flexDirection: 'row', gap: '10px', flexWrap: 'wrap', margin: '15px' }}>
                            <Tooltip title={dept?.FullName}>
                                <Chip icon={<LocalPoliceOutlined />} label={dept?.Alias} color="info" variant="outlined" size="small" />
                            </Tooltip>
                            <Tooltip title="1hr 14mins Logged">
                                <Chip icon={<CancelOutlined />} label="Hours Not Met" color="error" variant="outlined" size="small" />
                            </Tooltip>
                            <Tooltip title="1hr 14mins Logged">
                                <Chip icon={<CancelOutlined />} label="5 Patrol" color="info" variant="outlined" size="small" />
                            </Tooltip>
                            </Stack>
                        </CardMedia>
                        <Divider />
                        <CardActions sx={{ display: 'flex', justifyContent: 'flex-end' }}> {/* Align button to the right */}
                            <Button startIcon={dept?.Icon} variant="outlined" color="primary" size="small" onClick={(e) => {handlePatrol(e, dept)}}>
                                Patrol
                            </Button>
                        </CardActions>
                    </Card>
                ))}
            </Stack>
            {/* Server Menu */}

            <Menu
                variant="menu"
                open={serverMenuOpen}
                anchorEl={serverMenuAnchor}
                onClose={() => setServerMenuOpen(false)}
                >
                    <MenuList variant="menu" dense>
                        {
                            mainData?.Servers?.map((server, index) => (
                            
                                <MenuItem divider key={index} onClick={() => {handleServerSelect(server)}}>
                                    <Dns />
                                   <Typography ml={'10px'}> {server?.FullName} </Typography>
                                </MenuItem>
                            ))
                        }
                    </MenuList>
                </Menu>
        </Stack>
    );
}

export default Advanced;
