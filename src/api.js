// Import axios only once
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000', // Backend URL
  withCredentials: true, // Povolenie cookies pri každej požiadavke
});

// Prihlásenie
export const login = async (username, password) => {
  const response = await api.post('/auth/login', { username, password });
  return response.data;
};

// Registrácia
export const registerUser = async (email, username, password) => {
  const response = await axios.post('http://localhost:3000/auth/register', { email, username, password }, { withCredentials: true });
  return response.data;
};

// Kontrola autentifikácie
export const checkAuth = async () => {
  const response = await api.get('/session/me');  // API endpoint už vracia `role`
  return response.data;  // Teraz obsahuje `{ username, role }`
};



// Získanie session
export const getSession = async () => {
  const response = await api.get('/session');
  return response.data;
};

export const updateSession = async (darkMode) => {
  const response = await api.post('/session', { darkMode });
  return response.data;
};


export const logout = async () => {
  const response = await api.get('/auth/logout'); // Match the backend route
  return response.data;
};


export const addCronJob = async (name, topology) => {
  const response = await api.post('/api/cron/add-cron-jobs', { name, topology });
  return response.data;
};
// Body obsahuje:
// {
//   "name": "jobxyZ",
//   "topology": [
//        {
//           "name": "testcustomer",
//           "uuid": "15566d05-2741-4679-8892-ae00c911c699Neplatne"
//       }
//   ]
// }

export const deleteCronJob = async (jobId) => {
  const response = await api.delete(`/api/cron/jobs/${jobId}`);
  return response.data;
};

export const getCronJobs = async () => {
  const response = await api.get('/api/cron/jobs');
  return response.data;
};

export const addTopology = async (orgs) => {
  const response = await api.post('/api/topology', { orgs });
  return response.data;
};
// Body obsahuje:
// {
//   "orgs": [
//     {
//         "name": "testcustomer",
//         "uuid": "15566d05-2741-4679-8892-ae00c911c699"
//     }
//   ]
// }

export const getOrgs = async () => {
  const response = await api.get('/api/orgs');
  return response.data;
};

export const updateNetworkData = async () => {
  const response = await api.get('/api/updateNetworkData');
  return response.data;
};

export const getUsers = async () => {
  const response = await api.get('/api/user/getAll');
  return response.data;
};

export const editUser = async (id, data) => {
  const response = await api.put(`/api/user/edit/${id}`, data);
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await api.delete(`/api/user/delete/${id}`);
  return response.data;
};


export const editOrgs = async (id,data) => {
  const response = await api.put(`/api/user/addOrg/${id}`,data);
  return response.data;
};

