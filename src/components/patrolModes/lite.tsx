import { Button, Menu, MenuItem, Stack, Tooltip, Typography } from "@mui/material"
import { Department, patrolManagerLogo, Server } from "../../types"
import React from "react"
import { MainDataContext } from "../../contexts/mainData"
import { PatrolContext } from "../../contexts/patrol"
import { AuthContext } from "../../contexts/Auth"

const Lite = () => {
    const mainData = React.useContext(MainDataContext)
    const patrol = React.useContext(PatrolContext)
    const Auth = React.useContext(AuthContext)
    const [serverMenuOpen, setServerMenuOpen] = React.useState(false)
    const [serverMenuAnchor, setServerMenuAnchor] = React.useState<null | HTMLElement>(null)

    const handleSelectDepartment = (Dept:Department) => {
        patrol?.handleSelectDepartment(Dept)
    }

    const handleSelectServer = (Server:Server) => {
        patrol?.handleSelectServer(Server)
    }

    const handlePatrol = (e:React.MouseEvent<HTMLButtonElement>, Dept:Department) => {
        setServerMenuAnchor(e.currentTarget)
        setServerMenuOpen(true)
        handleSelectDepartment(Dept)
    }

    if (!mainData?.Departments || !mainData?.Servers) {
        return <Typography>Loading departments and servers...</Typography>;
    }

    return (
        <Stack spacing={5} alignItems={'center'}>
            <img src={patrolManagerLogo} alt="Patrol Manager Logo" height={'auto'} width={"40%"} />
            <Typography variant="body1" color={"textSecondary"}>Select a department to jump right into a patrol!</Typography>
            <Stack gap={3} display={'flex'} flexDirection={'row'} flexWrap={'wrap'} justifyContent={'center'}>
                { mainData?.Departments?.map((dept, index) => {
                    const hasPermission = Auth?.guildMember?.roles?.includes(dept?.RoleID) || false;
                    return (
                    <Tooltip title={"2hr 14mins Logged"} key={index}>
                        <Button disabled={!hasPermission} startIcon={dept?.Icon} variant="contained" color="secondary" onClick={(e) => handlePatrol(e, dept)}>
                            {dept?.FullName}
                        </Button>
                    </Tooltip>
                    )
                })
                }
            </Stack>
            {/* Server Menu */ }
            <Menu 
                anchorEl={serverMenuAnchor}
                open={serverMenuOpen}
                onClose={() => setServerMenuOpen(false)}
            >
                {mainData.Servers.map((server, index) => (
                    <MenuItem key={index} onClick={() => handleSelectServer(server)}>
                        {server?.FullName}
                    </MenuItem>
                ))}
            </Menu>
        </Stack>
    )
}

export default Lite;
