const map = L.map('map', {
    center: [1, 0],
    zoom: 2,
    dragging: true,  // Disable dragging
    scrollWheelZoom: true
});

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors',
  opacity: 0.8  // Set a slightly lower opacity for a darker effect
}).addTo(map);


// Load markers from local storage
let savedMarkers = JSON.parse(localStorage.getItem('markers')) || [];


// Add saved markers to the map
savedMarkers.forEach(marker => {
    const { lat, lng, name, contacts } = marker;
    const newMarker = L.marker([lat, lng]).addTo(map);
    const popupContent = generatePopupContent(name, lat, lng, contacts);
    newMarker.bindPopup(popupContent).openPopup();
});

function generatePopupContent(markerName, lat, lng, contacts) {
    let content = `<ul>${markerName}</ul>`;

    if (contacts && contacts.length > 0) {
        content += '<br><ul>Contact Details:<ul>';
        contacts.forEach(contact => {
            content += `<li>Name: ${contact.name}, Phone: ${contact.phone}, Details: ${contact.details || ''}</li>`;
        });
        content += '</ul>';
    }

    return content;
}

function showForm() {
    const formContainer = document.getElementById('addMarkerForm');
    formContainer.style.display = 'block';
}

function hideForm() {
    const formContainer = document.getElementById('addMarkerForm');
    formContainer.style.display = 'none';
    document.getElementById('markerForm').reset();
    document.getElementById('contactsContainer').innerHTML = '';
}

function addContact() {
    const contactsContainer = document.getElementById('contactsContainer');
    const contactDiv = document.createElement('div');
    contactDiv.innerHTML = `
        <label>Contact Name:</label>
        <input type="text" name="contactName" required>
        
        <label>Contact Phone:</label>
        <input type="text" name="contactPhone" required>
        
        <label>Contact Details:</label>
        <input type="text" name="contactDetails">
    `;
    contactsContainer.appendChild(contactDiv);
}

async function addMarker(event) {
    event.preventDefault();

    // Get the marker name
    const markerName = document.getElementById('markerName').value.trim();

    if (!markerName) {
        alert('Please enter a valid marker name.');
        return;
    }

    const contacts = [];
    const contactDivs = document.querySelectorAll('#contactsContainer > div');
    contactDivs.forEach(contactDiv => {
        const contactName = contactDiv.querySelector('input[name="contactName"]').value;
        const contactPhone = contactDiv.querySelector('input[name="contactPhone"]').value;
        const contactDetails = contactDiv.querySelector('input[name="contactDetails"]').value;

        contacts.push({ name: contactName, phone: contactPhone, details: contactDetails || '' });
    });

    try {
        // Geocode the location name to get coordinates
        const { lat, lng } = await geocodeLocation(markerName);

        // Add marker to the map
        const marker = L.marker([lat, lng]).addTo(map);
        const popupContent = generatePopupContent(markerName, lat, lng, contacts);
        marker.bindPopup(popupContent).openPopup();

        // Save marker to local storage
        savedMarkers.push({ lat, lng, name: markerName, contacts });
        localStorage.setItem('markers', JSON.stringify(savedMarkers));

        hideForm();

        console.log(`Marker: ${markerName}, Contacts:`, contacts);
        document.getElementById('markerForm').reset();
    } catch (error) {
        alert('Marker Added succuessfully.');
    }
}



function showForm(formId) {
    const formContainer = document.getElementById(formId);
    formContainer.style.display = 'block';
}
function hideForm(formId) {
    const formContainer = document.getElementById(formId);
    formContainer.style.display = 'none';

    // Reset the form and clear any existing inputs
    const form = formContainer.querySelector('form');
    if (form) {
        form.reset();
        const contactsContainer = formContainer.querySelector('#contactsContainer');
        if (contactsContainer) {
            contactsContainer.innerHTML = '';
        }
    }
}
function removeMarker() {
    const markerName = document.getElementById('removeMarkerName').value;

    if (!markerName) {
        console.log('Removing marker...');
        alert('Please enter a marker name to remove.');
        return;
    }

    const confirmRemove = confirm(`Are you sure you want to remove the marker '${markerName}'?`);

    if (confirmRemove) {
        removeMarkerFromMap(markerName);
        hideForm('removeMarkerForm');
    }
}

function removeMarkerFromMap(markerName) {
    savedMarkers = savedMarkers.filter(marker => marker.name !== markerName);
    localStorage.setItem('markers', JSON.stringify(savedMarkers));

    // Clear the map and add updated markers
    map.eachLayer(layer => {
        if (layer instanceof L.Marker) {
            map.removeLayer(layer);
        }
    });

    savedMarkers.forEach(marker => {
        addMarkerToMap(marker);
    });
}
function addMarkerToMap(marker) {
    const { lat, lng, name, contacts } = marker;
    const newMarker = L.marker([lat, lng]).addTo(map);
    const popupContent = generatePopupContent(name, lat, lng, contacts);
    newMarker.on('click', function () {
        showMarkerDetailsInContainer(name, contacts);
    });
    newMarker.bindPopup(popupContent).openPopup();
}
function showMarkerDetailsInContainer(markerName, contacts) {
    const containerTitle = document.getElementById('markerDetailsTitle');
    const containerContent = document.getElementById('markerDetailsContent');

    containerTitle.textContent = markerName;

    let content = `<p>Latitude: ${marker.lat}</p><p>Longitude: ${marker.lng}</p>`;

    if (contacts && contacts.length > 0) {
        content += '<br><p>Contact Details:</p><ul>';
        contacts.forEach(contact => {
            content += `<li>Name: ${contact.name}, Phone: ${contact.phone}, Details: ${contact.details || ''}</li>`;
        });
        content += '</ul>';
    }

    containerContent.innerHTML = content;

    // Show the marker details container
    const markerDetailsContainer = document.getElementById('markerDetailsContainer');
    markerDetailsContainer.style.display = 'block';
}

// Add a function to hide the marker details container
function hideMarkerDetailsContainer() {
    const markerDetailsContainer = document.getElementById('markerDetailsContainer');
    markerDetailsContainer.style.display = 'none';
}

function removeMarkerFromMap(markerName) {
    savedMarkers = savedMarkers.filter(marker => marker.name !== markerName);
    localStorage.setItem('markers', JSON.stringify(savedMarkers));

    // Clear the map and add updated markers
    map.eachLayer(layer => {
        if (layer instanceof L.Marker) {
            map.removeLayer(layer);
        }
    });

    savedMarkers.forEach(marker => {
        addMarkerToMap(marker);
    });
}
function removeContactFromMap(markerName, contactName) {
    const markerIndex = savedMarkers.findIndex(marker => marker.name === markerName);

    if (markerIndex !== -1) {
        const marker = savedMarkers[markerIndex];
        marker.contacts = marker.contacts.filter(contact => contact.name !== contactName);

        localStorage.setItem('markers', JSON.stringify(savedMarkers));

        // Clear the map and add updated markers
        map.eachLayer(layer => {
            if (layer instanceof L.Marker) {
                map.removeLayer(layer);
            }
        });

        savedMarkers.forEach(marker => {
            addMarkerToMap(marker);
        });
    }
}

function removeContact() {
    const markerName = document.getElementById('removeContactMarkerName').value;
    const contactName = document.getElementById('removeContactName').value;

    if (!markerName || !contactName) {
        alert('Please enter both marker and contact names to remove a contact.');
        return;
    }

    const confirmRemove = confirm(`Are you sure you want to remove the contact '${contactName}' from the marker '${markerName}'?`);

    if (confirmRemove) {
        removeContactFromMap(markerName, contactName);
    }
}
function toggleRemoveContactForm() {
    const formContainer = document.getElementById('removeContactForm');

    formContainer.classList.toggle('collapsed');

    const minimizeBtn = formContainer.querySelector('.minimize-btn');
    const maximizeBtn = formContainer.querySelector('.maximize-btn');

    if (formContainer.classList.contains('collapsed')) {
        minimizeBtn.style.display = 'none';
        maximizeBtn.style.display = 'inline-block';
    } else {
        minimizeBtn.style.display = 'inline-block';
        maximizeBtn.style.display = 'none';
    }
}






async function storeMarkersInDatabase() {
    try {
      const response = await fetch('http://localhost:3000/api/storeMarkers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ markers: savedMarkers }),
      });
  
      if (!response.ok) {
        throw new Error(`Error storing markers: ${response.statusText}`);
      }
  
      console.log('Markers stored successfully!');
    } catch (error) {
      console.error(`Error storing markers: ${error.message}`);
    }
}

async function retrieveMarkersFromDatabase() {
    try {
      const response = await fetch('http://localhost:3000/api/retrieveMarkers');
  
      if (!response.ok) {
        throw new Error(`Failed to retrieve markers. Status: ${response.status}`);
      }
  
      const data = await response.json();
      const markersFromDB = data.markers || [];
      savedMarkers = markersFromDB;
  
      map.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          map.removeLayer(layer);
        }
      });
  
      savedMarkers.forEach((marker) => {
        addMarkerToMap(marker);
      });
  
      localStorage.setItem('markers', JSON.stringify(savedMarkers));
      console.log('Markers retrieved successfully!');
    } catch (error) {
      console.error(`Error retrieving markers: ${error.message}`);
    }
}
async function geocodeLocation(locationName) {
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationName)}`);

        if (!response.ok) {
            console.error(`Error: ${response.status} - ${response.statusText}`);
            throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();

        console.log('Geocoding response:', data); // Log the response data

        if (data.length > 0) {
            return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
        } else {
            throw new Error('Location not found');
        }
    } catch (error) {
        console.error(`Error geocoding location: ${error.message}`);
        throw error;
    }
}
// Add this to your existing app.js file

// Add this to your existing app.js file


function updateSearchResults(results) {
    const resultsList = document.getElementById('searchResultsList');
    resultsList.innerHTML = '';

    if (results.length === 0) {
        resultsList.innerHTML = '<li>No results found.</li>';
        return;
    }

    results.forEach(result => {
        const listItem = document.createElement('li');
        listItem.innerHTML = result;
        listItem.addEventListener('click', function () {
            showMarkerDetails(result);
            closeSearchResults();
        });
        resultsList.appendChild(listItem);
    });
}


// Add this to your existing app.js file

function searchMarkers() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();

    // Filter markers based on the search input
    const filteredMarkers = savedMarkers.filter(marker => {
        const markerNameMatch = marker.name.toLowerCase().includes(searchInput);
        const contactsMatch = marker.contacts.some(contact => contact.name.toLowerCase().includes(searchInput));
        return markerNameMatch || contactsMatch;
    });

    // Create an array of result strings
    const results = filteredMarkers.map(marker => marker.name);

    // Update search results
    updateSearchResults(results);

    // Show the search results container
    const searchResultsContainer = document.getElementById('searchResultsContainer');
    searchResultsContainer.style.display = 'block';
}

// Modify the closeSearchResults function to hide the search results container
function closeSearchResults() {
    const searchResultsContainer = document.getElementById('searchResultsContainer');
    searchResultsContainer.style.display = 'none';
}

// Modify the existing showMarkerDetails function in app.js

function showMarkerDetails(markerName, contactName) {
    const marker = savedMarkers.find(marker => marker.name === markerName);

    // Filter contacts based on the selected contact (if any)
    const selectedContact = contactName ? marker.contacts.find(contact => contact.name === contactName) : null;

    // Update modal content with marker details
    const modalTitle = document.getElementById('markerDetailsTitle');
    const modalBody = document.getElementById('markerDetailsBody');

    modalTitle.textContent = selectedContact ? selectedContact.name : markerName;

    let content = `<p>Marker: ${marker.name}</p><p>Country: ${marker.name}</p>`;

    if (selectedContact) {
        content += `<p>Contact Details:<br>
            Name: ${selectedContact.name}<br>
            Phone: ${selectedContact.phone}<br>
            Details: ${selectedContact.details || ''}</p>`;
    } else if (marker.contacts && marker.contacts.length > 0) {
        content += '<p>Contact Details:<ul>';
        marker.contacts.forEach(contact => {
            content += `<li><a href="#" onclick="showMarkerDetails('${marker.name}', '${contact.name}')">${contact.name}</a></li>`;
        });
        content += '</ul></p>';
    }

    modalBody.innerHTML = content;

    // Show the modal
    const markerDetailsModal = new bootstrap.Modal(document.getElementById('markerDetailsModal'));
    markerDetailsModal.show();

    // Update details outside of the map
    const outsideDetails = document.getElementById('outsideDetails');
    outsideDetails.innerHTML = content;
}


// Add the following function to close the search results dropdown after selecting an item

// Function to update the content in the left-hand side container
function updatePopupContentContainer(content) {
    const container = document.getElementById('popupContentContainer');
    container.innerHTML = content;
}

// Your existing popup creation code here...

// Event listener for popup open
map.on('popupopen', function (e) {
    const popupContent = e.popup.getContent();
    updatePopupContentContainer(popupContent);
    document.getElementById('popupContentContainer').style.display = 'block';
});

// Event listener for popup close
map.on('popupclose', function () {
    document.getElementById('popupContentContainer').style.display = 'none';
});
function authenticateUser(event) {
    event.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    // Check if the entered credentials are correct (replace with your actual authentication logic)
    if (username === '1' && password === '1') {
        alert('Login successful! Redirecting...');
        
        // Replace the following line with your actual redirection logic
        window.location.href = 'your_main_page.html';
    } else {
        alert('Invalid username or password. Please try again.');
    }
}



