import React, { useEffect, useState, useRef } from 'react';
import { Paper, Button, Typography, List, ListItem, ListItemText, Divider, IconButton, Box } from '@mui/material';
import { ArrowUpward, ArrowDownward, CheckCircle, Cancel } from '@mui/icons-material';
import { useTheme } from '../context/ThemeProvider';

const DiffNavigator = ({ comparisonResult, parentSize = { width: 300, height: 500 } }) => {
  const { isDarkMode } = useTheme();
  const [changes, setChanges] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const listRef = useRef(null);

  useEffect(() => {
    const diffElements = document.querySelectorAll('.comparison-container del, .comparison-container ins');
    setChanges(Array.from(diffElements));
    setCurrentIndex(0);
  }, [comparisonResult]);

  const goToChange = (index) => {
    if (changes.length === 0) return;
    setCurrentIndex(index);
    changes[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (listRef.current) {
      const listItem = listRef.current.querySelectorAll('li')[index];
      if (listItem) {
        listRef.current.scrollTo({ top: listItem.offsetTop - listRef.current.offsetHeight / 2, behavior: 'smooth' });
      }
    }
  };

  return (
    <Paper
      elevation={5}
      sx={{
        padding: '15px',
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderLeft: '1px solid',
        borderColor: isDarkMode ? '#444' : '#ddd',
        backgroundColor: isDarkMode ? '#121212' : '#f9f9f9',
        color: isDarkMode ? '#ffffff' : '#000000',
        overflow: 'hidden',
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
        🔍 Total Changes: <span style={{fontWeight: 'bold' }}>{changes.length}</span>
      </Typography>

      <Button
        variant="contained"
        fullWidth
        sx={{ mb: 1, backgroundColor: '#d81b60', '&:hover': { backgroundColor: '#c2185b' } }}
        startIcon={<ArrowUpward />}
        onClick={() => goToChange(currentIndex - 1)}
        disabled={currentIndex === 0}
      >
        Previous Change
      </Button>

      <Button
        variant="contained"
        fullWidth
        sx={{ mb: 2, backgroundColor: '#d81b60', '&:hover': { backgroundColor: '#c2185b' } }}
        startIcon={<ArrowDownward />}
        onClick={() => goToChange(currentIndex + 1)}
        disabled={currentIndex === changes.length - 1}
      >
        Next Change
      </Button>

      <Box ref={listRef} sx={{ flexGrow: 1, borderRadius:'10px', overflowY: 'auto', bgcolor: isDarkMode ? '#1e1e1e' : '#ffffff' }}>
        <List>
          {changes.map((change, index) => {
            const isAddition = change.tagName.toLowerCase() === 'ins';
            return (
              <React.Fragment key={index}>
                <ListItem
                  button
                  onClick={() => goToChange(index)}
                  selected={currentIndex === index}
                  sx={{
                    backgroundColor: currentIndex === index ? (isDarkMode ? '#333' : '#e0f7fa') : 'transparent',
                    '&:hover': { backgroundColor: isDarkMode ? '#444' : '#b2ebf2' },
                    borderLeft: currentIndex === index ? '4px solid #d81b60' : 'none',
                    paddingLeft: currentIndex === index ? '12px' : '16px',
                    color: isDarkMode ? '#ffffff' : '#000000',
                  }}
                >
                  <IconButton size="small" sx={{ color: isAddition ? 'green' : 'red' }}>
                    {isAddition ? <CheckCircle /> : <Cancel />}
                  </IconButton>
                  <ListItemText primary={`${change.textContent.slice(0, 30)}...`} />
                </ListItem>
                <Divider sx={{ bgcolor: isDarkMode ? '#444' : '#ddd' }} />
              </React.Fragment>
            );
          })}
        </List>
      </Box>
    </Paper>
  );
};

export default DiffNavigator;
