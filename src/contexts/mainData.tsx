import React from "react";
import { Department, MainDataContextType, Server } from "../types";
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

    const fetchDepartments = async () => {
        const tempDepartments: Department[] = [
            {
                "FullName": "Sheriff's Office",
                "Alias": "SO",
                "Image": bcso,
                "Icon": <LocalPoliceOutlined />
            },
            {
                "FullName": "Highway Patrol",
                "Alias": "HP",
                "Image": hp,
                "Icon": <LocalPoliceOutlined />

            },
            {
                "FullName": "Police Department",
                "Alias": "PD",
                "Image": pd,
                "Icon": <LocalPoliceOutlined />

            },
            {
                "FullName": "Fire Department",
                "Alias": "FD",
                "Image": fd,
                "Icon": <LocalFireDepartmentOutlined />

            },
            {
                "FullName": "Civilian Operation",
                "Alias": "CIV",
                "Image": civ,
                "Icon": <PeopleOutlineOutlined />

            },
            {
                "FullName": "Department of Corrections",
                "Alias": "DoC",
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
    })

    const value = {
        Departments: departments,
        Servers: servers
    };

    return (
        <MainDataContext.Provider value={value}>
            {children}
        </MainDataContext.Provider>
    );
}

export { MainDataContext, MainDataProvider };