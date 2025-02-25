import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  CircularProgress,
  Select,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  FormControlLabel,
  Typography
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Delete } from '@mui/icons-material';
import { getUsers, editUser, deleteUser, getOrgs, editOrgs, checkAuth } from '../api';
import CustomButton from '../components/CustomButton';
import Scrollbar from '../components/Scrollbar';
import * as XLSX from 'xlsx';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [orgs, setOrgs] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedOrgs, setSelectedOrgs] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    fetchUsers();
    fetchOrgs();
    fetchUserRole();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await getUsers();
      setUsers(response);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrgs = async () => {
    try {
      const response = await getOrgs();
      if (response && response.orgs) {
        const uniqueOrgs = Array.from(
          new Map(response.orgs.map(org => [org.uuid, org])).values()
        );
        setOrgs(uniqueOrgs);
      } else {
        setOrgs([]);
      }
    } catch (error) {
      console.error("Error fetching organizations:", error);
      setOrgs([]);
    }
  };

  const fetchUserRole = async () => {
    try {
      const response = await checkAuth();
      setUserRole(response.role);
    } catch (error) {
      console.error("Error fetching user role:", error);
    }
  };

  const handleEditOrgs = async (id, allowedOrgs) => {
    try {
      await editOrgs(id, { orgs: allowedOrgs });
      fetchUsers();
    } catch (error) {
      console.error("Error updating user organizations:", error);
    }
  };

  const handleToggleUserStatus = async (user) => {
    if (userRole !== 'admin') return; // Restrict for non-admins
    const newStatus = !user.account_enabled;
    try {
      await editUser(user._id, {
        role: user.role,
        account_enabled: newStatus.toString()
      });
      fetchUsers();
    } catch (error) {
      console.error("Error updating user status:", error);
    }
  };

  const handleRoleChange = async (user, newRole) => {
    if (userRole !== 'admin') return; // Restrict for non-admins
    try {
      await editUser(user._id, {
        role: newRole,
        account_enabled: user.account_enabled.toString()
      });
      fetchUsers();
    } catch (error) {
      console.error("Error updating user role:", error);
    }
  };

  const handleOpenDeleteConfirm = (id) => {
    setUserToDelete(id);
    setConfirmDeleteOpen(true);
  };
  
  // Function to delete the user after confirmation
  const handleDeleteUser = async () => {
    if (userRole !== 'admin' || !userToDelete) return;
    try {
      await deleteUser(userToDelete);
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
    } finally {
      setConfirmDeleteOpen(false);
      setUserToDelete(null);
    }
  };

  const handleOpenModal = async (user) => {
    setSelectedUser(user);
    try {
      const response = await getOrgs();
      const uniqueOrgs = Array.from(
        new Map(response.orgs.map(org => [org.uuid, org])).values()
      );
      setOrgs(uniqueOrgs);
    } catch (error) {
      console.error("Error fetching organizations in modal:", error);
      setOrgs([]);
    }
    setSelectedOrgs([...new Set(user.allowed_Orgs.map(org => org.uuid))]);
    setModalOpen(true);
  };
  

  const handleToggleOrg = (uuid) => {
    setSelectedOrgs(prev =>
      prev.includes(uuid)
        ? prev.filter(id => id !== uuid)
        : [...prev, uuid]
    );
  };

  const handleSaveOrgs = async () => {
    if (selectedUser) {
     
      const updatedOrgs = orgs.filter(org => selectedOrgs.includes(org.uuid));
      await handleEditOrgs(selectedUser._id, updatedOrgs);
      setModalOpen(false);
    }
  };

  const columns = [
    { field: 'username', headerName: 'Username', flex: 1, minWidth: 180 },
    { field: 'email', headerName: 'Email', flex: 1.5, minWidth: 220 },
    {
      field: 'role',
      headerName: 'Role',
      flex: 0.8,
      minWidth: 120,
      renderCell: (params) => (
        <Select
          value={params.value}
          onChange={(e) => handleRoleChange(params.row, e.target.value)}
          size="small"
          fullWidth
          disabled={userRole !== 'admin'} // Disable for non-admins
        >
          <MenuItem value="user">User</MenuItem>
          <MenuItem value="admin">Admin</MenuItem>
        </Select>
      )
    },
    {
      field: 'account_enabled',
      headerName: 'Status',
      flex: 0.8,
      minWidth: 140,
      renderCell: (params) => (
        <Button
          variant="contained"
          sx={{
            backgroundColor: params.value ? "#4CAF50" : "#F44336",
            color: "#fff",
            "&:hover": {
              backgroundColor: params.value ? "#388E3C" : "#D32F2F"
            }
          }}
          onClick={() => handleToggleUserStatus(params.row)}
          disabled={userRole !== 'admin'} // Disable for non-admins
        >
          {params.value ? 'ACTIVE' : 'DISABLED'}
        </Button>
      )
    },
    {
      field: 'allowedOrgs',
      headerName: 'Organizations',
      flex: 1,
      minWidth: 160,
      renderCell: (params) =>
        userRole === 'admin' ? (
          <Button variant="contained" onClick={() => handleOpenModal(params.row)}>
            ALLOWED ORGS
          </Button>
        ) : (
          <Button variant="contained" disabled>
            ALLOWEDORGS
          </Button>
        )
    },    
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 0.5,
      minWidth: 100,
      renderCell: (params) => (
        <IconButton onClick={() => handleOpenDeleteConfirm(params.row._id)} disabled={userRole !== 'admin'}>
          <Delete />
        </IconButton>
      )
    }
  ];


  const handleExportToExcel = () => {
    if (users.length === 0) {
      console.warn("No user data to export");
      return;
    }
  
    console.log("Users before export:", users);
  
    const formattedData = users.map(user => {
      let orgNames = "None"; // Default value
  
      if (user.allowed_Orgs && Array.isArray(user.allowed_Orgs)) {
        // Extract organization names exactly as in the UI
        const extractedNames = user.allowed_Orgs.map(org => org.name).filter(Boolean);
        
        if (extractedNames.length > 0) {
          orgNames = extractedNames.join(", ");
        }
      }
  
      return {
        Username: user.username,
        Email: user.email,
        Role: user.role,
        Status: user.account_enabled ? "ACTIVE" : "DISABLED",
        Allowed_Organizations: orgNames,
      };
    });
  
    console.log("Exporting Data:", formattedData); // Debugging output
  
    const ws = XLSX.utils.json_to_sheet(formattedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Users");
    XLSX.writeFile(wb, "UserDetails.xlsx");
  };
  
  return (
    <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" height="100vh" sx={{ mt: -5 }}>
      <Box sx={{ width: '90%', display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleExportToExcel} 
          sx={{width: '200px' }}
        >
          EXPORT TO EXCEL
        </Button>
      </Box>
      <Paper elevation={3} sx={{ height: '75%', width: '90%', p: 2 }}>
        {loading ? (
          <CircularProgress />
        ) : (
          <DataGrid
            rows={users.map((user, index) => ({
              id: index + 1,
              ...user
            }))}
            columns={columns}
            pageSizeOptions={[5, 10, 20]}
            sx={{ border: 0 }}
          />
        )}
      </Paper>
      <Dialog 
        open={modalOpen} 
        onClose={() => setModalOpen(false)}
        sx={{
          "& .MuiDialog-paper": { 
            borderRadius: "12px", 
            padding: "20px",
            minWidth: "400px"
          }
        }}
      >
        <DialogTitle 
          sx={{ 
            fontSize: "1.5rem", 
            fontWeight: "bold", 
            textAlign: "center",
          }}
        >
          Select Allowed Organizations
        </DialogTitle>

        {/* Wrapped DialogContent inside Scrollbar */}
        <Scrollbar style={{ maxHeight: "400px", overflowY: "auto", padding: "16px" }}>
          <DialogContent dividers>
            {orgs.length > 0 ? (
              orgs.map((org) => (
                <FormControlLabel
                  key={org.uuid}
                  control={
                    <Checkbox
                      checked={selectedOrgs.includes(org.uuid)}
                      onChange={() => handleToggleOrg(org.uuid)}
                    />
                  }
                  label={
                    <Typography sx={{ fontSize: "1rem" }}>
                      {org.name}
                    </Typography>
                  }
                  sx={{ 
                    display: "flex", 
                    alignItems: "center", 
                    paddingY: "5px" 
                  }}
                />
              ))
            ) : (
              <Typography sx={{ textAlign: "center", padding: "10px" }}>
                No organizations available
              </Typography>
            )}
          </DialogContent>
        </Scrollbar>
        <DialogActions sx={{ justifyContent: "space-between", padding: "16px" }}>
        <CustomButton 
            variant="contained" 
            onClick={handleSaveOrgs}
          >
            Save
          </CustomButton>
          <CustomButton 
            variant="outlined" 
            onClick={() => setModalOpen(false)} 
          >
            Cancel
          </CustomButton>
        </DialogActions>
      </Dialog>
      <Dialog
  open={confirmDeleteOpen}
  onClose={() => setConfirmDeleteOpen(false)}
  sx={{
    "& .MuiDialog-paper": {
      borderRadius: "12px",
      padding: "20px",
      minWidth: "350px"
    }
  }}
>
  <DialogTitle
    sx={{
      fontSize: "1.5rem",
      fontWeight: "bold",
      textAlign: "center",
    }}
  >
    Confirm Deletion
  </DialogTitle>
  <DialogContent>
    <Typography sx={{ fontSize: "1rem", textAlign: "center", padding: "10px" }}>
      Are you sure you want to delete this user? <br/><br/>  <strong>This action cannot be undone!</strong>
    </Typography>
  </DialogContent>
  <DialogActions sx={{ justifyContent: "space-between", padding: "16px" }}>
    <CustomButton
      variant="contained"
      onClick={handleDeleteUser}
    >
      Delete
    </CustomButton>
    <CustomButton
      variant="outlined"
      onClick={() => setConfirmDeleteOpen(false)}
    >
      Cancel
    </CustomButton>
  </DialogActions>
</Dialog>      
    </Box>
  );
};

export default UserManagement;
