import React, { ReactNode, useEffect } from 'react'; 
import { register } from '@tauri-apps/plugin-global-shortcut';
import { enqueueSnackbar } from 'notistack';
import { PatrolContext } from '../contexts/patrol';

interface ShortcutProviderProps {
  children: ReactNode;
}

const ShortCutyProvider: React.FC<ShortcutProviderProps> = ({ children }) => {
  const patrol = React.useContext(PatrolContext);
  
  useEffect(() => {
    const registerShortcuts = async () => {
      try {
        await register('CommandOrControl+Shift+d', () => {
          patrol?.handleToggleOnDuty();
        });
      } catch (error) {
        console.error('Failed to register shortcuts:', error);
      }
    };

    const handleKeydown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'r') {
        event.preventDefault();
        console.log("Refresh disabled");
      }
    };

    window.addEventListener('keydown', handleKeydown);
    registerShortcuts();

    // Clean up the event listener when the component is unmounted
    return () => {
      window.removeEventListener('keydown', handleKeydown);
    };
  }, [patrol]);

  return <>{children}</>;
};

export default ShortCutyProvider;
