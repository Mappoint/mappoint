const map = L.map('map', {
    center: [0, 0],
    zoom: 2,
    dragging: false  // Disable dragging
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
    let content = `Marker: ${markerName}<br>Latitude: ${lat}<br>Longitude: ${lng}`;

    if (contacts && contacts.length > 0) {
        content += '<br><br>Contact Details:<zul>';
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

function addMarker(event) {
    event.preventDefault();

    const lat = parseFloat(document.getElementById('latitude').value);
    const lng = parseFloat(document.getElementById('longitude').value);
    const markerName = document.getElementById('markerName').value;

    if (isNaN(lat) || isNaN(lng) || !markerName) {
        alert('Please enter valid data for latitude, longitude, and marker name.');
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

    const marker = L.marker([lat, lng]).addTo(map);
    const popupContent = generatePopupContent(markerName, lat, lng, contacts);
    marker.bindPopup(popupContent).openPopup();

    // Save marker to local storage
    savedMarkers.push({ lat, lng, name: markerName, contacts });
    localStorage.setItem('markers', JSON.stringify(savedMarkers));

    hideForm();

    console.log(`Marker: ${markerName}, Latitude: ${lat}, Longitude: ${lng}, Contacts:`, contacts);
    document.getElementById('markerForm').reset();
}

function showForm(formId) {
    const formContainer = document.getElementById(formId);
    formContainer.style.display = 'block';
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
    newMarker.bindPopup(popupContent).openPopup();
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
