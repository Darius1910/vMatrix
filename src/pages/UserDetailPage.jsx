import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  FormControlLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { Delete, Edit } from "@mui/icons-material";
import { getUsers, editUser, deleteUser, getOrgs } from "../api";
import Scrollbar from "../components/Scrollbar"; // ✅ Custom Scrollbar

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [orgs, setOrgs] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedOrgs, setSelectedOrgs] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(null);

  useEffect(() => {
    fetchUsers();
    fetchOrgs();
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
    console.log("Organizations fetched:", response.data);
    setOrgs(response.data);
  } catch (error) {
    console.error("Error fetching organizations:", error.response ? error.response.data : error.message);
  }
};


const handleEditUser = async (id, role, accountEnabled, allowedOrgs = []) => {
  setUpdatingStatus(id); // Prevent flickering on toggle

  try {
    console.log("Updating user:", { id, role, accountEnabled, allowedOrgs });

    await editUser(id, { role, account_enabled: accountEnabled, allowed_Orgs: allowedOrgs });

    // ✅ Ensure `allowedOrgs` is always an array and use correct key names
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user._id === id ? { ...user, role, account_enabled: accountEnabled, allowed_Orgs: allowedOrgs } : user
      )
    );
  } catch (error) {
    console.error("Error updating user:", error);
    alert("Failed to update user. Check the console for details.");
  } finally {
    setUpdatingStatus(null);
  }
};
  

  const handleDeleteUser = async (id) => {
    try {
      await deleteUser(id);
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleOpenModal = (user) => {
    setSelectedUser(user);
    setSelectedOrgs(user.allowed_Orgs.map((org) => org.uuid));
    setSelectedRole(user.role);
    setModalOpen(true);
  };

  const handleToggleOrg = (uuid) => {
    setSelectedOrgs((prev) =>
      prev.includes(uuid) ? prev.filter((id) => id !== uuid) : [...prev, uuid]
    );
  };

  const handleSaveUserChanges = async () => {
    if (selectedUser) {
      const updatedOrgs = orgs.filter((org) => selectedOrgs.includes(org.uuid));
      await handleEditUser(selectedUser._id, selectedRole, selectedUser.account_enabled, updatedOrgs);
      setModalOpen(false);
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
      <Paper elevation={3} sx={{ width: "90%", maxWidth: "1000px", p: 3 }}>
        <Typography variant="h5" mb={3} textAlign="center">
          User Management
        </Typography>

        {loading ? (
          <Box display="flex" justifyContent="center">
            <CircularProgress />
          </Box>
        ) : (
          <Scrollbar style={{ maxHeight: "60vh" }}> {/* ✅ Custom Scrollbar */}
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Username</strong></TableCell>
                    <TableCell><strong>Email</strong></TableCell>
                    <TableCell><strong>Role</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Typography color="textSecondary">No users found</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user._id}>
                        <TableCell>{user.username}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.role}</TableCell>
                        <TableCell>
                          <Button
                            variant="contained"
                            sx={{
                              backgroundColor: user.account_enabled ? "#4caf50" : "#e53935",
                              color: "white",
                              transition: "background-color 0.3s ease",
                              "&:hover": {
                                backgroundColor: user.account_enabled ? "#388e3c" : "#c62828",
                              },
                            }}
                            size="small"
                            disabled={updatingStatus === user._id} // Prevent flickering
                            onClick={() =>
                              handleEditUser(user._id, user.role, !user.account_enabled, user.allowed_Orgs)
                            }
                          >
                            {user.account_enabled ? "ENABLED" : "DISABLED"}
                          </Button>
                        </TableCell>
                        <TableCell>
                          <IconButton color="primary" onClick={() => handleOpenModal(user)}>
                            <Edit />
                          </IconButton>
                          <IconButton color="error" onClick={() => handleDeleteUser(user._id)}>
                            <Delete />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Scrollbar>
        )}
      </Paper>

      {/* User Edit Modal */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)}>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1">Select Allowed Organizations:</Typography>
          {orgs.length === 0 ? (
            <Typography color="textSecondary">No organizations available</Typography>
          ) : (
            orgs.map((org) => (
              <FormControlLabel
                key={org.uuid}
                control={<Checkbox checked={selectedOrgs.includes(org.uuid)} onChange={() => handleToggleOrg(org.uuid)} />}
                label={org.name}
              />
            ))
          )}

          <Typography variant="subtitle1" mt={2}>Change Role:</Typography>
          <Select
            fullWidth
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            variant="outlined"
            size="small"
          >
            <MenuItem value="user">User</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </Select>
        </DialogContent>
        <DialogActions>
          <Button
            sx={{
              color: "#757575",
              "&:hover": { backgroundColor: "#e0e0e0" }
            }}
            onClick={() => setModalOpen(false)}
          >
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSaveUserChanges}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement;
