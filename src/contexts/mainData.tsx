import React, { createContext, useState, useEffect } from "react";
import { Department, MainDataContextType, Member, Server } from "../types";
import { createStore, Store } from '@tauri-apps/plugin-store';

// Create stores using Tauri's plugin-store
const handleCreateStore = async (storeName: string): Promise<Store> => {
    return await createStore(`data.${storeName}`);
};

const MainDataContext = createContext<MainDataContextType | null>(null);

const MainDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [departments, setDepartments] = useState<Department[] | null>(null);
    const [servers, setServers] = useState<Server[]>([]);
    const [members, setMembers] = useState<Member | null>(null); // Single Member object
    const [departmentStore, setDepartmentStore] = useState<Store | null>(null);
    const [serverStore, setServerStore] = useState<Store | null>(null);
    const [memberStore, setMemberStore] = useState<Store | null>(null);

    // Store changes listeners
    departmentStore?.onChange(async () => {
        const storedDepartments = await departmentStore?.get('departments');
        if (storedDepartments) {
            setDepartments(storedDepartments as Department[]);
            await departmentStore?.save();
        }
    });

    serverStore?.onChange(async () => {
        const storedServers = await serverStore?.get('servers');
        if (storedServers) {
            setServers(storedServers as Server[]);
            serverStore?.save();
        }
    });

    memberStore?.onChange(async () => {
        const storedMember = await memberStore?.get('member'); // Single Member object
        if (storedMember) {
            setMembers(storedMember as Member);
            await memberStore?.save();
        }
    });

    useEffect(() => {
        const initializeStores = async () => {
            const deptStore = await handleCreateStore('Departments');
            const srvStore = await handleCreateStore('Servers');
            const memStore = await handleCreateStore('Member'); // Single member key

            setDepartmentStore(deptStore);
            setServerStore(srvStore);
            setMemberStore(memStore);

            const storedDepartments = await deptStore.get('departments');
            const storedServers = await srvStore.get('servers');
            const storedMember = await memStore.get('member'); // Single member key

            if (storedDepartments) setDepartments(storedDepartments as Department[]);
            if (storedServers) setServers(storedServers as Server[]);
            if (storedMember) setMembers(storedMember as Member); // Set the single Member
        };

        initializeStores();
    }, []);

    const value = {
        Departments: departments,
        Servers: servers,
        Members: members, // Single Member object
        DepartmentStore: departmentStore,
        ServerStore: serverStore,
        MemberStore: memberStore,
    };

    return (
        <MainDataContext.Provider value={value}>
            {children}
        </MainDataContext.Provider>
    );
};

export { MainDataContext, MainDataProvider };
