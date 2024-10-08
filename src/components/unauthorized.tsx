import { Alert, Button, Stack } from "@mui/material";
import { patrolManagerLogo } from "../types";
import { useContext } from "react";
import { AuthContext } from "../contexts/Auth";

const Unauthorized = () => {
    const Auth = useContext(AuthContext)

    const handleLogOut = () => {
        Auth?.LogOut()
    }
    return (
        <Stack spacing={5} alignItems={'center'}>
            <Alert severity="error">We have not been able to detect that you are a member of DoJ. If you think this was a mistake, reach out to my email patrolManager.Support@gmail.com</Alert>
            <img src={patrolManagerLogo} alt="Patrol Manager Logo" height={'auto'} width={"30%"} />
            <Button variant="contained" color="primary" onClick={handleLogOut}>Log Out</Button>
        </Stack>
    );
}

export default Unauthorized;