import { useState, useContext, useEffect } from "react";
import { Box, Button, Divider, FormControl, Input, InputAdornment, InputLabel, Paper, Stack, Switch, Typography, IconButton, Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import ReusableAppbarToolbar from "./reusables/appbar_toolbar";
import { BadgeOutlined, ConfirmationNumberOutlined, EmailOutlined, ExitToApp, ExpandMore } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { MainDataContext } from "../contexts/mainData";
import { AuthContext } from "../contexts/Auth";

const Settings = () => {
    const mainData = useContext(MainDataContext);
    const Auth = useContext(AuthContext);
    const nav = useNavigate();

    // Local state to handle form data and UI state
    const [email, setEmail] = useState(mainData?.Members?.email || Auth?.discordMember?.email || "");
    const [websiteID, setWebsiteID] = useState(mainData?.Members?.websiteID || "");
    const [name, setName] = useState(Auth?.guildMember?.nick?.match(/\b\w{1,3}-\d{3,4}\b/)?.[0] || ""); 
    const [discordID] = useState(mainData?.Members?.discordID || Auth?.guildMember?.id || "");
    const [litePatrolMode, setLitePatrolMode] = useState(mainData?.Members?.litePatrolMode || false);

    // Local state for managing department callsigns and UI expansion
    const [departmentCallsigns, setDepartmentCallsigns] = useState<{ [key: string]: string | null }>({});
    const [expandedAccordion, setExpandedAccordion] = useState<string | null>(null);
    const [isFetching, setIsFetching] = useState<{ [key: string]: boolean }>({});

    // Save the main settings to the data store
    const handleSaveMain = async () => {
        const existingMember = mainData?.Members || {};

        const user = {
            email,
            websiteID,
            name,
            discordID,
            litePatrolMode,
            hasAgreedtoTOS: existingMember?.hasAgreedtoTOS || false,
            PatrolLogs: existingMember?.PatrolLogs || [],
        };

        await mainData?.MemberStore?.set("member", user);
        await mainData?.MemberStore?.save();
    };

    // Fetch the callsign for the department from the guild member's nickname
    const fetchDepartmentCallsign = async (departmentID: string) => {
        if (!Auth || !Auth.fetchDepartmentnGuildMemberData) return;

        setIsFetching((prev) => ({ ...prev, [departmentID]: true }));

        const accessToken = localStorage.getItem("authToken");
        if (accessToken) {
            const roles = await Auth.fetchDepartmentnGuildMemberData(accessToken, departmentID);

            if (roles) {
                const departmentGuildMember = Auth.departmentGuildMembers[departmentID];
                const callsign = departmentGuildMember?.nick?.match(/\b\w{1,3}-\d{3,4}\b/)?.[0] || "N/A";
                setDepartmentCallsigns((prev) => ({ ...prev, [departmentID]: callsign }));
            }
        }

        setIsFetching((prev) => ({ ...prev, [departmentID]: false }));
    };

    // Handle accordion state for expanded view and trigger fetching the callsign
    const handleAccordionChange = (departmentID: string) => {
        if (!departmentCallsigns[departmentID] && !isFetching[departmentID]) {
            fetchDepartmentCallsign(departmentID);
        }
        setExpandedAccordion(departmentID === expandedAccordion ? null : departmentID); // Toggle accordion
    };

    const handleCallsignChange = (departmentID: string, newCallsign: string) => {
        setDepartmentCallsigns((prev) => ({ ...prev, [departmentID]: newCallsign }));
    };

    // Automatically fetch the first department's callsign on component load
    useEffect(() => {
        if (mainData?.Departments && mainData.Departments.length > 0) {
            fetchDepartmentCallsign(mainData.Departments[0].DiscordID); // Fetch callsign for the first department
        }
    }, [mainData?.Departments]);

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
                            <Typography>Lite Patrol Mode</Typography>
                            <Switch
                                checked={litePatrolMode}
                                onChange={() => setLitePatrolMode(!litePatrolMode)}
                            />
                        </Stack>
                        <Button fullWidth variant="contained" color="success" onClick={handleSaveMain}>Save</Button>
                    </Stack>
                </Box>
            </Stack>

            <Stack direction={'column'} spacing={5} alignItems={'center'}>
                <Box component={Paper} width={'90vw'} padding={1}>
                    <Typography padding={'15px'} textAlign="left" color="textSecondary">Department Settings</Typography>
                    <Divider />
                    <Stack direction={'column'} margin={1}>
                        {mainData?.Departments?.map((dept, index) => (
                            <Accordion
                                key={index}
                                expanded={expandedAccordion === dept.DiscordID}
                                onChange={() => handleAccordionChange(dept.DiscordID)}
                            >
                                <AccordionSummary expandIcon={<ExpandMore />}>
                                    <Typography>{dept?.FullName}</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Stack spacing={3} direction={'row'} alignItems="center">
                                        <FormControl fullWidth>
                                            <InputLabel>Callsign</InputLabel>
                                            <Input
                                                value={departmentCallsigns[dept.DiscordID] || (isFetching[dept.DiscordID] ? "Fetching..." : "N/A")}
                                                onChange={(e) => handleCallsignChange(dept.DiscordID, e.target.value)}
                                            />
                                        </FormControl>
                                        <Switch
                                            checked={Auth?.guildMember?.roles?.includes(dept?.RoleID) || false}
                                            disabled
                                        />
                                    </Stack>
                                </AccordionDetails>
                            </Accordion>
                        ))}
                    </Stack>
                </Box>
            </Stack>
        </Stack>
    );
};

export default Settings;
