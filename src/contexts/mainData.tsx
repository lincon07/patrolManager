import React from "react";
import { Department, MainDataContextType, Member, Server } from "../types";
import bcso from "../assets/bcso.png";
import hp from "../assets/sahp.png";
import pd from "../assets/lspd.png";
import fd from "../assets/fd.png";
import civ from "../assets/civ.png";
import DoC from "../assets/DoC.png";
import { LocalFireDepartment, LocalFireDepartmentOutlined, LocalPolice, LocalPoliceOutlined, People, PeopleOutlineOutlined } from "@mui/icons-material";

const MainDataContext = React.createContext<MainDataContextType | null>(null);

const MainDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) =>  {
    const [departments, setDepartments] = React.useState<Department[]>([]);
    const [servers, setServers] = React.useState<Server[]>([]);
    const [members, setMembers] = React.useState<Member[]>([]);

    const fetchMembers = async () => {
        const tempMembers: Member[] = [
            {
                "name": "John Doe",
                "email": "JDoe@gmail.coom",
                "websiteID": "23312",
                "discordID": "737699613594877983"
            }
        ]
        setMembers(tempMembers);
    }
    const fetchDepartments = async () => {
        const tempDepartments: Department[] = [
            {
                "FullName": "Sheriff's Office",
                "Alias": "SO",
                "DiscordID": "317430442431086594",
                "RoleID": "428212810049257484",
                "Image": bcso,
                "Icon": <LocalPoliceOutlined />
            },
            {
                "FullName": "Highway Patrol",
                "Alias": "HP",
                "DiscordID": "346092058689142785",
                "RoleID": "428212616373207050",
                "Image": hp,
                "Icon": <LocalPoliceOutlined />

            },
            {
                "FullName": "Police Department",
                "Alias": "PD",
                "DiscordID": "344980171687723008",
                "RoleID": "428212668533440512",
                "Image": pd,
                "Icon": <LocalPoliceOutlined />

            },
            {
                "FullName": "Fire Department",
                "Alias": "FD",
                "DiscordID": "329008294523961345",
                "RoleID": "822426820447567872",
                "Image": fd,
                "Icon": <LocalFireDepartmentOutlined />

            },
            {
                "FullName": "Civilian Operation",
                "Alias": "CIV",
                "DiscordID": "822426820447567872",
                "RoleID": "822426820447567872",
                "Image": civ,
                "Icon": <PeopleOutlineOutlined />

            },
            {
                "FullName": "Department of Corrections",
                "Alias": "DoC",
                "DiscordID": "1146406262217646142",
                "RoleID": "822426820447567872",
                "Image": DoC,
                "Icon": <LocalPoliceOutlined />

            }

        ]
        setDepartments(tempDepartments);
    }

    const fetchServers = async () => {
        const Servers: Server[] = [
            {
                "FullName": "Server 1",
                "Alias": "S1"
            },
            {
                "FullName": "Server 2",
                "Alias": "S2"
            },
            {
                "FullName": "Server 3",
                "Alias": "S3"
            },
            {
                "FullName": "Server 4",
                "Alias": "S4"
            }

        ]
        setServers(Servers);
    }

    React?.useEffect(() => {
        fetchDepartments();
        fetchServers();
        fetchMembers();
    }, []);

    const value = {
        Departments: departments,
        Servers: servers,
        Members: members

    };

    return (
        <MainDataContext.Provider value={value}>
            {children}
        </MainDataContext.Provider>
    );
}

export { MainDataContext, MainDataProvider };