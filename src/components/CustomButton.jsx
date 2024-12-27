// src/components/CustomButton.jsx
import React from 'react';
import { Button } from '@mui/material';
import PropTypes from 'prop-types';

const CustomButton = ({ children, variant = 'contained', color = 'primary', onClick, href, fullWidth = true, sx = {}, type = 'button' }) => {
  return (
    <Button
      type={type}
      variant={variant}
      color={color}
      onClick={onClick}
      href={href}
      fullWidth={fullWidth}
      sx={{
        padding: '8px 16px',
        fontSize: '14px',
        fontWeight: '500',
        borderRadius: '4px',
        textTransform: 'none',
        transition: 'all 0.3s ease',
        ...(variant === 'outlined' && {
          borderColor: color === 'primary' ? '#e20074' : undefined,
          color: color === 'primary' ? '#e20074' : undefined,
          ':hover': {
            backgroundColor: '#e20074', // Telekom magenta pozadie
            color: '#ffffff', // Biela farba textu na magente
          },
        }),
        ...(variant === 'contained' && {
          ':hover': {
            backgroundColor: color === 'primary' ? '#c70060' : undefined, // Tmavšia magenta pre hover
          },
        }),
        ...sx, // Ďalšie custom štýly
      }}
    >
      {children}
    </Button>
  );
};

CustomButton.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['contained', 'outlined', 'text']),
  color: PropTypes.oneOf(['primary', 'secondary', 'success', 'error', 'warning', 'info']),
  onClick: PropTypes.func,
  href: PropTypes.string,
  fullWidth: PropTypes.bool,
  sx: PropTypes.object,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
};

export default CustomButton;
