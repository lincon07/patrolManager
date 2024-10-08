import { AppBar, AppBarProps, Toolbar, ToolbarProps } from "@mui/material";
import React from "react";

interface ReusableAppbarToolbarProps {
    elements: JSX.Element[];
    appbarProps: AppBarProps;
    toolbarProps: ToolbarProps
}

const ReusableAppbarToolbar: React.FC<ReusableAppbarToolbarProps> = ({ elements, appbarProps, toolbarProps }) => {
    return (
        <AppBar {...appbarProps}>
            <Toolbar {...toolbarProps}>
                {elements}
            </Toolbar>
        </AppBar>
    );
};

export default ReusableAppbarToolbar;
