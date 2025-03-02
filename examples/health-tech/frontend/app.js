// Main application JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Fetch demo data for charts
    fetchPatientData();

    // Set up navigation interactivity
    setupNavigation();

    // Initialize real-time updates
    initRealTimeUpdates();
    
    // Default to dashboard view
    navigateTo('dashboard');
    
    // Check for URL hash to navigate
    if (window.location.hash) {
        const page = window.location.hash.substring(1);
        navigateTo(page);
    }
});

// Fetch patient data for charts
function fetchPatientData() {
    fetch('/api/demo/motion-metrics')
        .then(response => response.json())
        .then(data => {
            createCharts(data);
        })
        .catch(error => {
            console.error('Error fetching patient data:', error);
            // Use demo data if API fails
            createChartsWithDemoData();
        });
}

// Create charts with data from API
function createCharts(data) {
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: false
            },
            x: {
                grid: {
                    display: false
                }
            }
        },
        plugins: {
            legend: {
                display: false
            }
        },
        elements: {
            line: {
                tension: 0.4
            },
            point: {
                radius: 4
            }
        }
    };

    // Gait Speed Chart
    if (data.metrics && data.metrics.gait_speed) {
        const gaitSpeedData = data.metrics.gait_speed;
        const gaitSpeedCtx = document.getElementById('gaitSpeedChart').getContext('2d');
        
        new Chart(gaitSpeedCtx, {
            type: 'line',
            data: {
                labels: gaitSpeedData.map(item => formatDate(item.date)),
                datasets: [{
                    data: gaitSpeedData.map(item => item.value),
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    borderColor: 'rgba(59, 130, 246, 1)',
                    borderWidth: 2,
                    fill: true
                }]
            },
            options: {
                ...chartOptions,
                scales: {
                    ...chartOptions.scales,
                    y: {
                        ...chartOptions.scales.y,
                        title: {
                            display: true,
                            text: 'm/s'
                        }
                    }
                }
            }
        });
    }

    // Stride Length Chart
    if (data.metrics && data.metrics.stride_length) {
        const strideLengthData = data.metrics.stride_length;
        const strideLengthCtx = document.getElementById('strideLengthChart').getContext('2d');
        
        new Chart(strideLengthCtx, {
            type: 'line',
            data: {
                labels: strideLengthData.map(item => formatDate(item.date)),
                datasets: [{
                    data: strideLengthData.map(item => item.value),
                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                    borderColor: 'rgba(16, 185, 129, 1)',
                    borderWidth: 2,
                    fill: true
                }]
            },
            options: {
                ...chartOptions,
                scales: {
                    ...chartOptions.scales,
                    y: {
                        ...chartOptions.scales.y,
                        title: {
                            display: true,
                            text: 'm'
                        }
                    }
                }
            }
        });
    }

    // Range of Motion Chart
    if (data.metrics && data.metrics.range_of_motion) {
        const rangeOfMotionData = data.metrics.range_of_motion;
        const rangeOfMotionCtx = document.getElementById('rangeOfMotionChart').getContext('2d');
        
        new Chart(rangeOfMotionCtx, {
            type: 'line',
            data: {
                labels: rangeOfMotionData.map(item => formatDate(item.date)),
                datasets: [{
                    data: rangeOfMotionData.map(item => item.value),
                    backgroundColor: 'rgba(139, 92, 246, 0.2)',
                    borderColor: 'rgba(139, 92, 246, 1)',
                    borderWidth: 2,
                    fill: true
                }]
            },
            options: {
                ...chartOptions,
                scales: {
                    ...chartOptions.scales,
                    y: {
                        ...chartOptions.scales.y,
                        title: {
                            display: true,
                            text: 'degrees'
                        }
                    }
                }
            }
        });
    }
}

// Create charts with demo data if API fails
function createChartsWithDemoData() {
    const demoData = {
        patient_id: 1,
        name: "John Doe",
        metrics: {
            gait_speed: [
                {date: "2023-01-01", value: 1.2},
                {date: "2023-01-08", value: 1.3},
                {date: "2023-01-15", value: 1.25},
                {date: "2023-01-22", value: 1.4},
                {date: "2023-01-29", value: 1.5}
            ],
            stride_length: [
                {date: "2023-01-01", value: 0.6},
                {date: "2023-01-08", value: 0.65},
                {date: "2023-01-15", value: 0.62},
                {date: "2023-01-22", value: 0.7},
                {date: "2023-01-29", value: 0.72}
            ],
            range_of_motion: [
                {date: "2023-01-01", value: 85},
                {date: "2023-01-08", value: 87},
                {date: "2023-01-15", value: 90},
                {date: "2023-01-22", value: 92},
                {date: "2023-01-29", value: 95}
            ]
        }
    };
    
    createCharts(demoData);
}

// Format date for chart labels
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Set up navigation interactivity
function setupNavigation() {
    const navLinks = document.querySelectorAll('nav a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove('font-bold', 'underline'));
            
            // Add active class to clicked link
            link.classList.add('font-bold', 'underline');
            
            // Handle navigation based on link text
            const page = link.textContent.toLowerCase();
            navigateTo(page);
        });
    });
}

// Page navigation handler
function navigateTo(page) {
    // Hide all page content
    document.querySelectorAll('.page-content').forEach(element => {
        element.classList.add('hidden');
    });
    
    // Show the selected page
    const pageElement = document.getElementById(`${page}-page`);
    if (pageElement) {
        pageElement.classList.remove('hidden');
        
        // Load page-specific data
        switch(page) {
            case 'dashboard':
                loadDashboardData();
                break;
            case 'patients':
                loadPatientsList();
                break;
            case 'reports':
                loadReportsList();
                break;
            case 'settings':
                // Settings would be loaded here
                break;
        }
    }
}

// Simulate real-time updates for the dashboard
function initRealTimeUpdates() {
    // Simulate system status updates every 30 seconds
    setInterval(() => {
        const statuses = document.querySelectorAll('.bg-green-500');
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        
        // Simulate occasional status changes
        if (Math.random() > 0.8) {
            randomStatus.classList.remove('bg-green-500');
            randomStatus.classList.add('bg-yellow-500');
            
            setTimeout(() => {
                randomStatus.classList.remove('bg-yellow-500');
                randomStatus.classList.add('bg-green-500');
            }, 5000);
        }
    }, 30000);
    
    // Simulate new data points being added to charts (in a real app this would come from websockets)
    setInterval(() => {
        console.log('Simulating new data point (would update charts in production)');
        // In production: update charts with new data from websocket connection
    }, 60000);
}

// Add patient motion data form handler
function handleMotionDataUpload(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    fetch('/api/motion-data/', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        console.log('Upload successful:', data);
        // Show success message
        alert('Motion data uploaded successfully');
        form.reset();
    })
    .catch(error => {
        console.error('Error uploading motion data:', error);
        alert('Error uploading motion data');
    });
}

// Health metrics form handler
function submitHealthMetrics(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const healthMetric = {
        patient_id: parseInt(formData.get('patient_id')),
        metric_type: formData.get('metric_type'),
        metric_value: parseFloat(formData.get('metric_value')),
        unit: formData.get('unit'),
        notes: formData.get('notes')
    };
    
    fetch('/api/health-metrics/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(healthMetric)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Health metric saved:', data);
        alert('Health metric saved successfully');
        form.reset();
    })
    .catch(error => {
        console.error('Error saving health metric:', error);
        alert('Error saving health metric');
    });
}

// Load patients list for patients page
function loadPatientsList() {
    const patientsContainer = document.getElementById('patients-list');
    
    if (!patientsContainer) return;
    
    // Show loading state
    patientsContainer.innerHTML = '<div class="text-center py-4"><div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div><p class="mt-2 text-gray-600">Loading patients...</p></div>';
    
    // Fetch patients from API
    fetch('/api/patients/')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(patients => {
            if (patients.length === 0) {
                patientsContainer.innerHTML = `
                    <div class="text-center py-8">
                        <p class="text-gray-500">No patients found</p>
                        <button id="add-first-patient" class="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                            Add Your First Patient
                        </button>
                    </div>
                `;
                
                document.getElementById('add-first-patient')?.addEventListener('click', () => {
                    showPatientForm();
                });
                return;
            }
            
            // Generate HTML for patients table
            let html = `
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-semibold">All Patients (${patients.length})</h3>
                    <button id="add-patient-btn" class="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
                        Add New Patient
                    </button>
                </div>
                <div class="overflow-x-auto">
                    <table class="min-w-full bg-white">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medical ID</th>
                                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date of Birth</th>
                                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200">
            `;
            
            patients.forEach(patient => {
                html += `
                    <tr class="hover:bg-gray-50">
                        <td class="px-4 py-2">${patient.id}</td>
                        <td class="px-4 py-2">${patient.medical_id}</td>
                        <td class="px-4 py-2">${patient.gender || 'Not specified'}</td>
                        <td class="px-4 py-2">${patient.date_of_birth ? new Date(patient.date_of_birth).toLocaleDateString() : 'Not specified'}</td>
                        <td class="px-4 py-2">
                            <button data-patient-id="${patient.id}" class="view-patient-btn text-blue-600 hover:underline mr-2">View</button>
                            <button data-patient-id="${patient.id}" class="edit-patient-btn text-green-600 hover:underline mr-2">Edit</button>
                            <button data-patient-id="${patient.id}" class="add-motion-data-btn text-purple-600 hover:underline">Add Data</button>
                        </td>
                    </tr>
                `;
            });
            
            html += `
                        </tbody>
                    </table>
                </div>
            `;
            
            patientsContainer.innerHTML = html;
            
            // Add event listeners for buttons
            document.getElementById('add-patient-btn')?.addEventListener('click', () => {
                showPatientForm();
            });
            
            document.querySelectorAll('.view-patient-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const patientId = e.target.dataset.patientId;
                    viewPatientDetails(patientId);
                });
            });
            
            document.querySelectorAll('.edit-patient-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const patientId = e.target.dataset.patientId;
                    editPatient(patientId);
                });
            });
            
            document.querySelectorAll('.add-motion-data-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const patientId = e.target.dataset.patientId;
                    showAddMotionDataForm(patientId);
                });
            });
        })
        .catch(error => {
            console.error('Error fetching patients:', error);
            patientsContainer.innerHTML = `
                <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <p>Error loading patients. Please try again.</p>
                    <p class="text-sm">${error.message}</p>
                </div>
            `;
        });
}

// Show form to add a new patient
function showPatientForm(patientData = null) {
    // Create modal for patient form
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50';
    
    const isEditing = patientData !== null;
    
    modal.innerHTML = `
        <div class="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div class="flex justify-between items-center border-b px-6 py-4">
                <h3 class="text-lg font-semibold">${isEditing ? 'Edit Patient' : 'Add New Patient'}</h3>
                <button id="close-modal" class="text-gray-400 hover:text-gray-500 focus:outline-none">
                    <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
            <form id="patient-form" class="px-6 py-4">
                ${isEditing ? `<input type="hidden" name="id" value="${patientData.id}">` : ''}
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="medical_id">
                        Medical ID*
                    </label>
                    <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
                           id="medical_id" name="medical_id" type="text" required
                           value="${isEditing ? patientData.medical_id : ''}">
                </div>
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="gender">
                        Gender
                    </label>
                    <select class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
                            id="gender" name="gender">
                        <option value="" ${isEditing && !patientData.gender ? 'selected' : ''}>Not specified</option>
                        <option value="male" ${isEditing && patientData.gender === 'male' ? 'selected' : ''}>Male</option>
                        <option value="female" ${isEditing && patientData.gender === 'female' ? 'selected' : ''}>Female</option>
                        <option value="other" ${isEditing && patientData.gender === 'other' ? 'selected' : ''}>Other</option>
                    </select>
                </div>
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="date_of_birth">
                        Date of Birth
                    </label>
                    <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
                           id="date_of_birth" name="date_of_birth" type="date"
                           value="${isEditing && patientData.date_of_birth ? patientData.date_of_birth : ''}">
                </div>
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="height_cm">
                        Height (cm)
                    </label>
                    <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
                           id="height_cm" name="height_cm" type="number" step="0.1"
                           value="${isEditing && patientData.height_cm ? patientData.height_cm : ''}">
                </div>
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="weight_kg">
                        Weight (kg)
                    </label>
                    <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
                           id="weight_kg" name="weight_kg" type="number" step="0.1"
                           value="${isEditing && patientData.weight_kg ? patientData.weight_kg : ''}">
                </div>
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="contact_phone">
                        Contact Phone
                    </label>
                    <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
                           id="contact_phone" name="contact_phone" type="tel"
                           value="${isEditing && patientData.contact_phone ? patientData.contact_phone : ''}">
                </div>
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="emergency_contact">
                        Emergency Contact
                    </label>
                    <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
                           id="emergency_contact" name="emergency_contact" type="text"
                           value="${isEditing && patientData.emergency_contact ? patientData.emergency_contact : ''}">
                </div>
                <div class="flex items-center justify-end">
                    <button type="button" id="cancel-form" class="mr-4 py-2 px-4 border border-gray-300 rounded text-gray-700 hover:bg-gray-100">
                        Cancel
                    </button>
                    <button type="submit" class="py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700">
                        ${isEditing ? 'Update' : 'Save'} Patient
                    </button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners
    document.getElementById('close-modal').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    document.getElementById('cancel-form').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    document.getElementById('patient-form').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        
        // Convert to an object with proper types
        const patientData = {
            medical_id: formData.get('medical_id'),
            gender: formData.get('gender') || null,
            date_of_birth: formData.get('date_of_birth') || null,
            height_cm: formData.get('height_cm') ? parseFloat(formData.get('height_cm')) : null,
            weight_kg: formData.get('weight_kg') ? parseFloat(formData.get('weight_kg')) : null,
            contact_phone: formData.get('contact_phone') || null,
            emergency_contact: formData.get('emergency_contact') || null,
            user_id: 1  // In a real app, this would be the logged-in user's ID
        };
        
        const url = isEditing ? `/api/patients/${formData.get('id')}` : '/api/patients/';
        const method = isEditing ? 'PUT' : 'POST';
        
        fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(patientData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Close modal
            document.body.removeChild(modal);
            
            // Reload patients list
            loadPatientsList();
            
            // Show success message
            alert(`Patient ${isEditing ? 'updated' : 'created'} successfully`);
        })
        .catch(error => {
            console.error('Error saving patient:', error);
            alert(`Error ${isEditing ? 'updating' : 'creating'} patient. Please try again.`);
        });
    });
}

// View patient details
function viewPatientDetails(patientId) {
    fetch(`/api/patients/${patientId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(patient => {
            // Get health metrics for this patient
            return Promise.all([
                patient,
                fetch(`/api/health-metrics/patient/${patientId}`).then(res => res.json()),
                fetch(`/api/motion-data/patient/${patientId}`).then(res => res.json()),
                fetch(`/api/sessions/patient/${patientId}`).then(res => res.json())
            ]);
        })
        .then(([patient, healthMetrics, motionData, sessions]) => {
            // Create modal for patient details
            const modal = document.createElement('div');
            modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50';
            
            modal.innerHTML = `
                <div class="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-screen overflow-y-auto">
                    <div class="flex justify-between items-center border-b px-6 py-4">
                        <h3 class="text-lg font-semibold">Patient Details: ${patient.medical_id}</h3>
                        <button id="close-modal" class="text-gray-400 hover:text-gray-500 focus:outline-none">
                            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                    <div class="px-6 py-4">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div>
                                <h4 class="text-md font-semibold mb-2">Personal Information</h4>
                                <div class="bg-gray-50 p-4 rounded">
                                    <p><span class="font-medium">Medical ID:</span> ${patient.medical_id}</p>
                                    <p><span class="font-medium">Gender:</span> ${patient.gender || 'Not specified'}</p>
                                    <p><span class="font-medium">Date of Birth:</span> ${patient.date_of_birth ? new Date(patient.date_of_birth).toLocaleDateString() : 'Not specified'}</p>
                                    <p><span class="font-medium">Height:</span> ${patient.height_cm ? `${patient.height_cm} cm` : 'Not specified'}</p>
                                    <p><span class="font-medium">Weight:</span> ${patient.weight_kg ? `${patient.weight_kg} kg` : 'Not specified'}</p>
                                </div>
                            </div>
                            <div>
                                <h4 class="text-md font-semibold mb-2">Contact Information</h4>
                                <div class="bg-gray-50 p-4 rounded">
                                    <p><span class="font-medium">Phone:</span> ${patient.contact_phone || 'Not specified'}</p>
                                    <p><span class="font-medium">Emergency Contact:</span> ${patient.emergency_contact || 'Not specified'}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="mb-6">
                            <div class="flex justify-between items-center mb-2">
                                <h4 class="text-md font-semibold">Recent Health Metrics</h4>
                                <button id="add-health-metric-btn" class="text-sm px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700">Add Metric</button>
                            </div>
                            ${healthMetrics.length > 0 ? `
                                <div class="overflow-x-auto">
                                    <table class="min-w-full bg-white">
                                        <thead class="bg-gray-50">
                                            <tr>
                                                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                                                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                                                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                                            </tr>
                                        </thead>
                                        <tbody class="divide-y divide-gray-200">
                                            ${healthMetrics.slice(0, 5).map(metric => `
                                                <tr>
                                                    <td class="px-4 py-2">${new Date(metric.recorded_at).toLocaleString()}</td>
                                                    <td class="px-4 py-2">${metric.metric_type}</td>
                                                    <td class="px-4 py-2">${metric.metric_value}</td>
                                                    <td class="px-4 py-2">${metric.unit || '-'}</td>
                                                    <td class="px-4 py-2">${metric.notes || '-'}</td>
                                                </tr>
                                            `).join('')}
                                        </tbody>
                                    </table>
                                </div>
                            ` : `
                                <div class="bg-gray-50 p-4 rounded text-center">
                                    <p class="text-gray-500">No health metrics recorded</p>
                                </div>
                            `}
                        </div>
                        
                        <div class="mb-6">
                            <div class="flex justify-between items-center mb-2">
                                <h4 class="text-md font-semibold">Motion Data</h4>
                                <button id="add-motion-data-btn" class="text-sm px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">Add Motion Data</button>
                            </div>
                            ${motionData.length > 0 ? `
                                <div class="overflow-x-auto">
                                    <table class="min-w-full bg-white">
                                        <thead class="bg-gray-50">
                                            <tr>
                                                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Movement Type</th>
                                                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                                                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody class="divide-y divide-gray-200">
                                            ${motionData.map(data => `
                                                <tr>
                                                    <td class="px-4 py-2">${new Date(data.recording_date).toLocaleString()}</td>
                                                    <td class="px-4 py-2">${data.movement_type}</td>
                                                    <td class="px-4 py-2">${data.notes || '-'}</td>
                                                    <td class="px-4 py-2">
                                                        <button data-motion-id="${data.id}" class="view-motion-btn text-blue-600 hover:underline">View</button>
                                                    </td>
                                                </tr>
                                            `).join('')}
                                        </tbody>
                                    </table>
                                </div>
                            ` : `
                                <div class="bg-gray-50 p-4 rounded text-center">
                                    <p class="text-gray-500">No motion data recorded</p>
                                </div>
                            `}
                        </div>
                    </div>
                    <div class="flex justify-end border-t px-6 py-4">
                        <button id="edit-patient-btn" class="mr-4 py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700">
                            Edit Patient
                        </button>
                        <button id="generate-report-btn" class="py-2 px-4 bg-purple-600 text-white rounded hover:bg-purple-700">
                            Generate Report
                        </button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Add event listeners
            document.getElementById('close-modal').addEventListener('click', () => {
                document.body.removeChild(modal);
            });
            
            document.getElementById('edit-patient-btn').addEventListener('click', () => {
                document.body.removeChild(modal);
                editPatient(patientId);
            });
            
            document.getElementById('add-health-metric-btn')?.addEventListener('click', () => {
                document.body.removeChild(modal);
                showAddHealthMetricForm(patientId);
            });
            
            document.getElementById('add-motion-data-btn')?.addEventListener('click', () => {
                document.body.removeChild(modal);
                showAddMotionDataForm(patientId);
            });
            
            document.getElementById('generate-report-btn')?.addEventListener('click', () => {
                generatePatientReport(patientId);
            });
            
            document.querySelectorAll('.view-motion-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const motionId = e.target.dataset.motionId;
                    viewMotionData(motionId);
                });
            });
        })
        .catch(error => {
            console.error('Error loading patient details:', error);
            alert('Error loading patient details. Please try again.');
        });
}

// Edit existing patient
function editPatient(patientId) {
    fetch(`/api/patients/${patientId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(patient => {
            showPatientForm(patient);
        })
        .catch(error => {
            console.error('Error loading patient for editing:', error);
            alert('Error loading patient data. Please try again.');
        });
}

// Show form to add health metric
function showAddHealthMetricForm(patientId) {
    // Create modal for health metric form
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50';
    
    modal.innerHTML = `
        <div class="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div class="flex justify-between items-center border-b px-6 py-4">
                <h3 class="text-lg font-semibold">Add Health Metric</h3>
                <button id="close-modal" class="text-gray-400 hover:text-gray-500 focus:outline-none">
                    <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
            <form id="health-metric-form" class="px-6 py-4">
                <input type="hidden" name="patient_id" value="${patientId}">
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="metric_type">
                        Metric Type*
                    </label>
                    <select class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
                            id="metric_type" name="metric_type" required>
                        <option value="">Select a metric type</option>
                        <option value="heart_rate">Heart Rate</option>
                        <option value="blood_pressure">Blood Pressure</option>
                        <option value="temperature">Temperature</option>
                        <option value="weight">Weight</option>
                        <option value="oxygen_saturation">Oxygen Saturation</option>
                        <option value="pain_level">Pain Level</option>
                        <option value="range_of_motion">Range of Motion</option>
                        <option value="gait_speed">Gait Speed</option>
                        <option value="stride_length">Stride Length</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="metric_value">
                        Value*
                    </label>
                    <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
                           id="metric_value" name="metric_value" type="number" step="0.01" required>
                </div>
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="unit">
                        Unit
                    </label>
                    <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
                           id="unit" name="unit" type="text" placeholder="e.g., bpm, mmHg, °C">
                </div>
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="notes">
                        Notes
                    </label>
                    <textarea class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
                              id="notes" name="notes" rows="3"></textarea>
                </div>
                <div class="flex items-center justify-end">
                    <button type="button" id="cancel-form" class="mr-4 py-2 px-4 border border-gray-300 rounded text-gray-700 hover:bg-gray-100">
                        Cancel
                    </button>
                    <button type="submit" class="py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700">
                        Save Metric
                    </button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners
    document.getElementById('close-modal').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    document.getElementById('cancel-form').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    document.getElementById('health-metric-form').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        
        // Convert to an object with proper types
        const healthMetric = {
            patient_id: parseInt(formData.get('patient_id')),
            metric_type: formData.get('metric_type'),
            metric_value: parseFloat(formData.get('metric_value')),
            unit: formData.get('unit') || null,
            notes: formData.get('notes') || null
        };
        
        fetch('/api/health-metrics/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(healthMetric)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Close modal
            document.body.removeChild(modal);
            
            // Show success message
            alert('Health metric added successfully');
            
            // Refresh patient details
            viewPatientDetails(patientId);
        })
        .catch(error => {
            console.error('Error saving health metric:', error);
            alert('Error saving health metric. Please try again.');
        });
    });
}

// Show form to add motion data
function showAddMotionDataForm(patientId) {
    // Create modal for motion data form
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50';
    
    modal.innerHTML = `
        <div class="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div class="flex justify-between items-center border-b px-6 py-4">
                <h3 class="text-lg font-semibold">Add Motion Data</h3>
                <button id="close-modal" class="text-gray-400 hover:text-gray-500 focus:outline-none">
                    <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
            <form id="motion-data-form" class="px-6 py-4">
                <input type="hidden" name="patient_id" value="${patientId}">
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="movement_type">
                        Movement Type*
                    </label>
                    <select class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
                            id="movement_type" name="movement_type" required>
                        <option value="">Select movement type</option>
                        <option value="walking">Walking</option>
                        <option value="running">Running</option>
                        <option value="stair_climbing">Stair Climbing</option>
                        <option value="sit_to_stand">Sit to Stand</option>
                        <option value="squatting">Squatting</option>
                        <option value="stretching">Stretching</option>
                        <option value="balance">Balance Exercise</option>
                        <option value="upper_body">Upper Body Exercise</option>
                        <option value="lower_body">Lower Body Exercise</option>
                        <option value="full_body">Full Body Exercise</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="motion_file">
                        Motion Data File*
                    </label>
                    <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
                           id="motion_file" name="motion_file" type="file" required
                           accept=".csv,.json,.txt">
                    <p class="text-xs text-gray-500 mt-1">Accepted formats: CSV, JSON, TXT</p>
                </div>
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="notes">
                        Notes
                    </label>
                    <textarea class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
                              id="notes" name="notes" rows="3"></textarea>
                </div>
                <div class="flex items-center justify-end">
                    <button type="button" id="cancel-form" class="mr-4 py-2 px-4 border border-gray-300 rounded text-gray-700 hover:bg-gray-100">
                        Cancel
                    </button>
                    <button type="submit" class="py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700">
                        Upload Data
                    </button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners
    document.getElementById('close-modal').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    document.getElementById('cancel-form').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    document.getElementById('motion-data-form').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        
        // Make API call to upload motion data
        fetch('/api/motion-data/', {
            method: 'POST',
            body: formData  // FormData is sent as multipart/form-data
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Close modal
            document.body.removeChild(modal);
            
            // Show success message
            alert('Motion data uploaded successfully');
            
            // Refresh patient details
            viewPatientDetails(patientId);
        })
        .catch(error => {
            console.error('Error uploading motion data:', error);
            alert('Error uploading motion data. Please try again.');
        });
    });
}

// View motion data details
function viewMotionData(motionId) {
    fetch(`/api/motion-data/${motionId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Create modal for motion data details
            const modal = document.createElement('div');
            modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50';
            
            // In a real application, you would display the actual motion data visualization here
            modal.innerHTML = `
                <div class="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4">
                    <div class="flex justify-between items-center border-b px-6 py-4">
                        <h3 class="text-lg font-semibold">Motion Data: ${data.movement_type}</h3>
                        <button id="close-modal" class="text-gray-400 hover:text-gray-500 focus:outline-none">
                            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                    <div class="px-6 py-4">
                        <div class="mb-4">
                            <h4 class="text-md font-semibold mb-2">Motion Data Information</h4>
                            <div class="bg-gray-50 p-4 rounded">
                                <p><span class="font-medium">Movement Type:</span> ${data.movement_type}</p>
                                <p><span class="font-medium">Recording Date:</span> ${new Date(data.recording_date).toLocaleString()}</p>
                                <p><span class="font-medium">Data File:</span> ${data.data_file_path}</p>
                                <p><span class="font-medium">Notes:</span> ${data.notes || 'No notes'}</p>
                            </div>
                        </div>
                        
                        <div class="mb-4">
                            <h4 class="text-md font-semibold mb-2">Motion Visualization</h4>
                            <div class="bg-gray-50 p-4 rounded text-center h-80 flex justify-center items-center">
                                <p class="text-gray-500">Visualization would be displayed here in a full implementation</p>
                            </div>
                        </div>
                        
                        <div class="mb-4">
                            <h4 class="text-md font-semibold mb-2">Analysis Results</h4>
                            <div class="bg-gray-50 p-4 rounded text-center">
                                <p class="text-gray-500">Motion analysis results would be displayed here</p>
                            </div>
                        </div>
                    </div>
                    <div class="flex justify-end border-t px-6 py-4">
                        <button id="download-data-btn" class="mr-4 py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700">
                            Download Data
                        </button>
                        <button id="generate-report-btn" class="py-2 px-4 bg-purple-600 text-white rounded hover:bg-purple-700">
                            Generate Report
                        </button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Add event listeners
            document.getElementById('close-modal').addEventListener('click', () => {
                document.body.removeChild(modal);
            });
            
            document.getElementById('download-data-btn')?.addEventListener('click', () => {
                // In a real app, this would download the motion data file
                alert('In a real application, this would download the motion data file');
            });
            
            document.getElementById('generate-report-btn')?.addEventListener('click', () => {
                // In a real app, this would generate a report for this specific motion data
                alert('In a real application, this would generate a report for this specific motion data');
            });
        })
        .catch(error => {
            console.error('Error loading motion data:', error);
            alert('Error loading motion data. Please try again.');
        });
}

// Generate patient report
function generatePatientReport(patientId) {
    // In a real application, this would generate a PDF report for the patient
    alert(`In a real application, this would generate a comprehensive report for patient ${patientId}`);
}

// Load reports list
function loadReportsList() {
    const reportsContainer = document.getElementById('reports-list');
    
    if (!reportsContainer) return;
    
    // In a real application, this would fetch reports from the API
    // For the demo, we'll create a mock UI
    
    let html = `
        <div class="mb-6">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-semibold">Generated Reports</h3>
                <div>
                    <button id="new-report-btn" class="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 mr-2">
                        Generate New Report
                    </button>
                    <select id="report-filter" class="border rounded py-1 px-2 text-gray-700">
                        <option value="all">All Reports</option>
                        <option value="patient">By Patient</option>
                        <option value="date">By Date</option>
                        <option value="type">By Type</option>
                    </select>
                </div>
            </div>
            
            <div class="overflow-x-auto">
                <table class="min-w-full bg-white">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Report Type</th>
                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Generated Date</th>
                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200">
                        <tr>
                            <td class="px-4 py-2">1</td>
                            <td class="px-4 py-2">John Doe</td>
                            <td class="px-4 py-2">Monthly Progress</td>
                            <td class="px-4 py-2">${new Date().toLocaleDateString()}</td>
                            <td class="px-4 py-2">
                                <button class="view-report-btn text-blue-600 hover:underline mr-2">View</button>
                                <button class="download-report-btn text-green-600 hover:underline">Download</button>
                            </td>
                        </tr>
                        <tr>
                            <td class="px-4 py-2">2</td>
                            <td class="px-4 py-2">Jane Smith</td>
                            <td class="px-4 py-2">Rehabilitation Assessment</td>
                            <td class="px-4 py-2">${new Date(Date.now() - 86400000).toLocaleDateString()}</td>
                            <td class="px-4 py-2">
                                <button class="view-report-btn text-blue-600 hover:underline mr-2">View</button>
                                <button class="download-report-btn text-green-600 hover:underline">Download</button>
                            </td>
                        </tr>
                        <tr>
                            <td class="px-4 py-2">3</td>
                            <td class="px-4 py-2">Michael Johnson</td>
                            <td class="px-4 py-2">Gait Analysis</td>
                            <td class="px-4 py-2">${new Date(Date.now() - 172800000).toLocaleDateString()}</td>
                            <td class="px-4 py-2">
                                <button class="view-report-btn text-blue-600 hover:underline mr-2">View</button>
                                <button class="download-report-btn text-green-600 hover:underline">Download</button>
                            </td>
                        </tr>
                        <tr>
                            <td class="px-4 py-2">4</td>
                            <td class="px-4 py-2">John Doe</td>
                            <td class="px-4 py-2">Exercise Compliance</td>
                            <td class="px-4 py-2">${new Date(Date.now() - 259200000).toLocaleDateString()}</td>
                            <td class="px-4 py-2">
                                <button class="view-report-btn text-blue-600 hover:underline mr-2">View</button>
                                <button class="download-report-btn text-green-600 hover:underline">Download</button>
                            </td>
                        </tr>
                        <tr>
                            <td class="px-4 py-2">5</td>
                            <td class="px-4 py-2">Emily Davis</td>
                            <td class="px-4 py-2">Initial Assessment</td>
                            <td class="px-4 py-2">${new Date(Date.now() - 345600000).toLocaleDateString()}</td>
                            <td class="px-4 py-2">
                                <button class="view-report-btn text-blue-600 hover:underline mr-2">View</button>
                                <button class="download-report-btn text-green-600 hover:underline">Download</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        
        <div>
            <h3 class="text-lg font-semibold mb-4">Report Templates</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow">
                    <h4 class="font-semibold mb-2">Monthly Progress Report</h4>
                    <p class="text-sm text-gray-600 mb-4">Overview of patient progress over the last month with key metrics and trends.</p>
                    <button class="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">Use Template</button>
                </div>
                <div class="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow">
                    <h4 class="font-semibold mb-2">Rehabilitation Assessment</h4>
                    <p class="text-sm text-gray-600 mb-4">Detailed assessment of patient rehabilitation status with recommendations.</p>
                    <button class="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">Use Template</button>
                </div>
                <div class="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow">
                    <h4 class="font-semibold mb-2">Gait Analysis Report</h4>
                    <p class="text-sm text-gray-600 mb-4">In-depth analysis of patient gait patterns and symmetry metrics.</p>
                    <button class="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">Use Template</button>
                </div>
            </div>
        </div>
    `;
    
    reportsContainer.innerHTML = html;
    
    // Add event listeners
    document.getElementById('new-report-btn')?.addEventListener('click', () => {
        showGenerateReportForm();
    });
    
    document.querySelectorAll('.view-report-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            // In a real app, this would open the report viewer
            alert('In a real application, this would open the report viewer');
        });
    });
    
    document.querySelectorAll('.download-report-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            // In a real app, this would download the report
            alert('In a real application, this would download the report as a PDF');
        });
    });
}

// Show form to generate a new report
function showGenerateReportForm() {
    // Create modal for report generation form
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50';
    
    modal.innerHTML = `
        <div class="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div class="flex justify-between items-center border-b px-6 py-4">
                <h3 class="text-lg font-semibold">Generate New Report</h3>
                <button id="close-modal" class="text-gray-400 hover:text-gray-500 focus:outline-none">
                    <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
            <form id="report-form" class="px-6 py-4">
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="report_type">
                        Report Type*
                    </label>
                    <select class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
                            id="report_type" name="report_type" required>
                        <option value="">Select report type</option>
                        <option value="monthly_progress">Monthly Progress Report</option>
                        <option value="rehabilitation_assessment">Rehabilitation Assessment</option>
                        <option value="gait_analysis">Gait Analysis Report</option>
                        <option value="exercise_compliance">Exercise Compliance Report</option>
                        <option value="initial_assessment">Initial Assessment Report</option>
                    </select>
                </div>
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="patient_id">
                        Patient*
                    </label>
                    <select class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
                            id="patient_id" name="patient_id" required>
                        <option value="">Select patient</option>
                        <option value="1">John Doe</option>
                        <option value="2">Jane Smith</option>
                        <option value="3">Michael Johnson</option>
                        <option value="4">Emily Davis</option>
                        <option value="5">Robert Wilson</option>
                    </select>
                </div>
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="date_range">
                        Date Range*
                    </label>
                    <select class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
                            id="date_range" name="date_range" required>
                        <option value="">Select date range</option>
                        <option value="last_week">Last Week</option>
                        <option value="last_month">Last Month</option>
                        <option value="last_3_months">Last 3 Months</option>
                        <option value="last_6_months">Last 6 Months</option>
                        <option value="last_year">Last Year</option>
                        <option value="custom">Custom Range</option>
                    </select>
                </div>
                <div id="custom_date_range" class="mb-4 hidden">
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-gray-700 text-sm font-bold mb-2" for="start_date">
                                Start Date
                            </label>
                            <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
                                   id="start_date" name="start_date" type="date">
                        </div>
                        <div>
                            <label class="block text-gray-700 text-sm font-bold mb-2" for="end_date">
                                End Date
                            </label>
                            <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
                                   id="end_date" name="end_date" type="date">
                        </div>
                    </div>
                </div>
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="notes">
                        Additional Notes
                    </label>
                    <textarea class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
                              id="notes" name="notes" rows="3"></textarea>
                </div>
                <div class="flex items-center justify-end">
                    <button type="button" id="cancel-form" class="mr-4 py-2 px-4 border border-gray-300 rounded text-gray-700 hover:bg-gray-100">
                        Cancel
                    </button>
                    <button type="submit" class="py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700">
                        Generate Report
                    </button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners
    document.getElementById('close-modal').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    document.getElementById('cancel-form').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    document.getElementById('date_range').addEventListener('change', (e) => {
        const customDateRange = document.getElementById('custom_date_range');
        if (e.target.value === 'custom') {
            customDateRange.classList.remove('hidden');
            document.getElementById('start_date').required = true;
            document.getElementById('end_date').required = true;
        } else {
            customDateRange.classList.add('hidden');
            document.getElementById('start_date').required = false;
            document.getElementById('end_date').required = false;
        }
    });
    
    document.getElementById('report-form').addEventListener('submit', (e) => {
        e.preventDefault();
        
        // In a real app, this would send the form data to the API to generate a report
        alert('In a real application, this would generate a report based on the selected criteria');
        
        // Close modal
        document.body.removeChild(modal);
        
        // Reload reports list
        loadReportsList();
    });
}

// Function to load dashboard data
function loadDashboardData() {
    // This would refresh the dashboard data if needed
    fetchPatientData();
}