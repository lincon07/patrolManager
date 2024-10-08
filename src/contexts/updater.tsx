import { check } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';
import React, { createContext, useEffect } from 'react';
import { getVersion } from '@tauri-apps/api/app';
import { enqueueSnackbar } from 'notistack';
import { Dialog, Button, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider } from '@mui/material';
import TOS from '../TOS';

interface UpdaterContextType {
  checkForUpdates: () => void;
  currentVersion: string;
}

const UpdaterContext = createContext<UpdaterContextType | null>(null);

interface UpdaterProviderProps {
  children: React.ReactNode;
}

const UpdaterProvider: React.FC<UpdaterProviderProps> = ({ children }) => {
  const [currentVersion, setCurrentVersion] = React.useState<string>("Loading...");
  const [UpdateDialogOpen, setUpdateDialogOpen] = React.useState<boolean>(false);
  const [updateAvailable, setUpdateAvailable] = React.useState<any>(null);
  //temp T.O.S 
  const [showTOSDialog, setShowTOSDialog] = React.useState<boolean>(true);

  const handleCheckForUpdates = async () => {
    console.log('checking for updates');
    const update = await check();
    if (update) {
      console.log(`found update ${update.version} from ${update.date} with notes ${update.body}`);
      enqueueSnackbar(`Update found: ${update.version}`, { variant: 'success' });
      setUpdateAvailable(update);
      setUpdateDialogOpen(true);
    } else {
      console.log('no updates found');
      enqueueSnackbar('No updates found', { variant: 'info' });
    }
  };

  useEffect(() => {
    // Only check for updates once during component mount
    if (window?.location.pathname !== "/unauthorized") {
      handleCheckForUpdates();
    }
    getVersion().then((version) => {
      setCurrentVersion(version);
      console.log(`Current version: ${version}`);
    });
  }, []); // Empty dependency array to ensure this only runs once

  const handleUpdate = async () => {
    if (updateAvailable) {
      console.log('installing update');
      await updateAvailable.downloadAndInstall();
      console.log('update installed');
      relaunch();
    }
  };

  const value = {
    checkForUpdates: handleCheckForUpdates,
    currentVersion: currentVersion,
  };

  return (
    <UpdaterContext.Provider value={value}>
      <Dialog open={UpdateDialogOpen} onClose={() => setUpdateDialogOpen(false)}>
        <DialogTitle>Update Available</DialogTitle>
        <DialogContent>
          <DialogContentText>
            An update to version {updateAvailable?.version} is available. Would you like to install it now?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUpdateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdate} color="primary" autoFocus>
            Update Now
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog 
        open={false} 
        onClose={() => setShowTOSDialog(false)} 
        fullWidth 
      >        
      <DialogTitle> 
        Terms of Service
      </DialogTitle>
      <Divider />
      <DialogContent>
          <TOS />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowTOSDialog(false)}>I Agree</Button>
        </DialogActions>
      </Dialog>
      
      {children}
    </UpdaterContext.Provider>
  );
};

export { UpdaterProvider, UpdaterContext };
