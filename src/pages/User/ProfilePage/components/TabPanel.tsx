import React from 'react';
import { Box } from '@mui/material';
import TabContentLoader from '../../../../components/UI/TabContentLoader';

interface TabPanelProps {
  children: React.ReactNode;
  value: number;
  index: number;
  [key: string]: any;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <TabContentLoader tabIndex={index}>
          <Box sx={{ pt: 0 }}>
            {children}
          </Box>
        </TabContentLoader>
      )}
    </div>
  );
};

export default TabPanel; 