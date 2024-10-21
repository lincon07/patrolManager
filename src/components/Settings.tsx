import { useState, useContext, useEffect } from "react";
import {
    Box,
    Button,
    Divider,
    FormControl,
    Input,
    InputAdornment,
    InputLabel,
    Paper,
    Stack,
    Switch,
    Typography,
    IconButton,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Alert,
} from "@mui/material";
import ReusableAppbarToolbar from "./reusables/appbar_toolbar";
import { BadgeOutlined, ConfirmationNumberOutlined, EmailOutlined, ExitToApp, ExpandMore } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { MainDataContext } from "../contexts/mainData";
import { AuthContext } from "../contexts/Auth";

const Settings = () => {
    const mainData = useContext(MainDataContext);
    const Auth = useContext(AuthContext);
    const nav = useNavigate();

    const [email, setEmail] = useState(mainData?.Members?.email || Auth?.discordMember?.email || "");
    const [websiteID, setWebsiteID] = useState(mainData?.Members?.websiteID || "");
    const [name, setName] = useState(Auth?.guildMember?.nick?.replace(/\b\w{1,3}-\d{3,4}\b/, "").trim() || "");
    const [discordID] = useState(mainData?.Members?.discordID || Auth?.guildMember?.id || "");
    const [litePatrolMode, setLitePatrolMode] = useState(mainData?.Members?.litePatrolMode || false);
    
    const [departmentNicknames, setDepartmentNicknames] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        const fetchDepartmentNicknames = async () => {
            const accessToken = localStorage.getItem("authToken");

            if (accessToken && Auth?.fetchDepartmentGuildMemberData && mainData?.Departments) {
                for (const dept of mainData.Departments) {
                    const roles = await Auth.fetchDepartmentGuildMemberData(accessToken, dept.DiscordID);
                    if (roles && Auth.departmentGuildMembers[dept.DiscordID]) {
                        setDepartmentNicknames((prev) => ({
                            ...prev,
                            [dept.DiscordID]: Auth.departmentGuildMembers[dept.DiscordID]?.nick || "",
                        }));
                    }
                }
            }
        };

        fetchDepartmentNicknames();
    }, [Auth, mainData]);

    const handleSaveMain = async () => {
        const existingMember = mainData?.Members || {};

        const user = {
            email,
            websiteID,
            name,
            discordID,
            litePatrolMode,
            hasAgreedtoTOS: 'hasAgreedtoTOS' in existingMember ? existingMember.hasAgreedtoTOS : false, // Check if property exists
            PatrolLogs: 'PatrolLogs' in existingMember ? existingMember.PatrolLogs : [], // Check if property exists
        };

        await mainData?.MemberStore?.set("member", user);
        await mainData?.MemberStore?.save();
    };

    const handleNicknameChange = (deptID: string, value: string) => {
        setDepartmentNicknames((prev) => ({
            ...prev,
            [deptID]: value,
        }));
    };

    return (
        <Stack spacing={10}>
            <ReusableAppbarToolbar
                elements={[
                    <Typography key={1} variant="h6" component="div" flexGrow={1}>
                        Settings
                    </Typography>,
                    <IconButton key={2} onClick={() => { nav('/home') }}>
                        <ExitToApp />
                    </IconButton>
                ]}
                appbarProps={{ variant: "elevation" }}
                toolbarProps={{ variant: "dense" }}
            />
            <Stack direction={'column'} spacing={5} alignItems={'center'}>
                <Box component={Paper} width={'90vw'} padding={1}>
                    <Typography padding={'15px'} textAlign="left" color="textSecondary">Main Settings</Typography>
                    <Divider />
                    <Stack spacing={5} direction={'column'} margin={1}>
                        <Stack spacing={4} direction={'row'}>
                            <FormControl variant="standard">
                                <InputLabel>Email</InputLabel>
                                <Input
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    startAdornment={<InputAdornment position="start"> <EmailOutlined /> </InputAdornment>}
                                />
                            </FormControl>
                            <FormControl variant="standard">
                                <InputLabel>Website ID</InputLabel>
                                <Input
                                    value={websiteID}
                                    onChange={(e) => setWebsiteID(e.target.value)}
                                    startAdornment={<InputAdornment position="start"> <ConfirmationNumberOutlined /> </InputAdornment>}
                                />
                            </FormControl>
                        </Stack>
                        <Stack spacing={4} direction={'row'}>
                            <FormControl variant="standard">
                                <InputLabel>Name</InputLabel>
                                <Input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    startAdornment={<InputAdornment position="start"> <BadgeOutlined /> </InputAdornment>}
                                />
                            </FormControl>
                            <FormControl variant="standard" disabled>
                                <InputLabel>Discord ID</InputLabel>
                                <Input
                                    value={discordID}
                                    startAdornment={<InputAdornment position="start"> <BadgeOutlined /> </InputAdornment>}
                                />
                            </FormControl>
                        </Stack>
                        <Stack spacing={4} direction={'row'} alignItems="center">
                            <Alert sx={{width: '100%'}} variant="outlined" severity="info">Lite Patrol Mode Coming Soon!</Alert>
                        </Stack>
                        <Button fullWidth variant="contained" color="success" onClick={handleSaveMain}>Save</Button>
                    </Stack>
                </Box>
            </Stack>
        </Stack>
    );
};

export default Settings;
