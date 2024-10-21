import { Alert, Button, Stack } from "@mui/material";
import { patrolManagerLogo } from "../types";
import { useContext } from "react";
import { AuthContext } from "../contexts/Auth";
import { useNavigate } from "react-router-dom";

const Unauthorized = () => {
    const Auth = useContext(AuthContext)
    const nav = useNavigate()

    const handleLogOut = () => {
        Auth?.LogOut()
    }

    return (
        <Stack spacing={5} alignItems={'center'}>
            <Alert severity="warning" sx={{minWidth: '100%'}}>We were not able to detect that you are a <strong>current</strong> member of the community!</Alert>
            <img src={patrolManagerLogo} alt="Patrol Manager Logo" height={'auto'} width={"35%"} />
            <Button variant="contained" color="primary" onClick={handleLogOut}>Log Out</Button>
            <Button variant="contained" color="primary" onClick={() => {nav('/')}}>Log Out</Button>
        </Stack>
    );
}

export default Unauthorized;