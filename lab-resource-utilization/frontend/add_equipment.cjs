const axios = require('axios');

const API_URL = 'http://localhost:8081';

async function addEquipment() {
  try {
    const email = `test_admin_${Date.now()}@gmail.com`;
    const password = 'password123';

    console.log('Registering user...');
    await axios.post(`${API_URL}/auth/register`, {
      name: 'Test Admin',
      email: email,
      password: password,
      role: 'SYSTEM_ADMIN'
    });

    console.log('Logging in...');
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: email,
      password: password
    });

    const token = loginRes.data.token;

    console.log('Adding equipment...');
    const equipmentRes = await axios.post(`${API_URL}/equipment`, {
      name: 'Advanced Scanning Electron Microscope',
      category: 'Imaging',
      description: 'High-resolution imaging equipment for nanotechnology research.',
      manufacturer: 'Zeiss',
      modelNumber: 'Sigma 500',
      serialNumber: `SEM-${Date.now()}`,
      purchaseDate: '2023-01-15',
      department: 'Nanotechnology',
      institution: 'Main Campus',
      quantity: 1,
      status: 'AVAILABLE'
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log('Successfully added equipment:', equipmentRes.data);
  } catch (error) {
    console.error('Error adding equipment:', error.response ? error.response.data : error.message);
  }
}

addEquipment();
