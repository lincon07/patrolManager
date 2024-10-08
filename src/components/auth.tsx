import { Button, Stack, Typography } from "@mui/material"
import React, { useContext } from "react"
import { AuthContext } from "../contexts/Auth"
import ReusableAppbarToolbar from "./reusables/appbar_toolbar"
import { patrolManagerLogo } from "../types"
import { FaDiscord } from "react-icons/fa"
import { BsDiscord } from "react-icons/bs"
import { RiDiscordLine } from "react-icons/ri"

const Auth = () => {
    const Auth = useContext(AuthContext)

    const handleLogin = () => {
        Auth?.Authenticate()
    }
    return (
        <Stack spacing={10} alignItems={'center'}>
            <ReusableAppbarToolbar elements={[
                <Typography key={0} variant="h6">Authentication</Typography>
            ]} appbarProps={{ variant: 'elevation'}} toolbarProps={{variant: 'dense', color: 'warning'}} />
            <img src={patrolManagerLogo} alt="Patrol Manager Logo" height={'auto'} width={"40%"} />
            <Button variant="contained" color="secondary" onClick={handleLogin} startIcon={<RiDiscordLine />}>Authenticate</Button>
        </Stack>
    )
}

export default Auth