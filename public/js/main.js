// the by default stuff when the page is loaded are here

const socket = io();


// the below event gets the formated message from the server and uses websockets to mark the marker and append the data in the "history" class
socket.on('putMarker', marker => {
        // console.log(marker);
        
        const history = document.querySelector('.history');
        const locationMarker = document.createElement('div');
        locationMarker.setAttribute('class', 'location_chat');
        locationMarker.innerHTML = `<h3>Recent Message</h3><div class="chat__info"><p class="history__username">${marker.username}</p><p class="history__time">${marker.time}</p></div><p class="history__locationName">${marker.name}</p>`;
        history.append(locationMarker);
        var mark = L.marker([marker.latitude, marker.longitude]).addTo(map);
        map.flyTo([marker.latitude, marker.longitude], 7)
})


// the below socket.on method will see if a new user joined using the join room form and then update it in the users list of the particular room so other users in the room can see it
socket.on('updateNewUser', newUser => {
        console.log(newUser);
        const usersList = document.querySelector('.users-list');
        const p = document.createElement('p');
        p.classList.add('list__user-name');
        p.innerHTML = newUser;

        usersList.append(p);
        
})

// this sets the map
var map = L.map('map').setView([51.505, -0.09], 3);
L.tileLayer('https://api.maptiler.com/maps/basic-v2/256/{z}/{x}/{y}.png?key=H27HL0lBXxglh3AXeBca', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

L.control.scale({updateWhenIdle: true}).addTo(map);

// the below takes all the location data retrieved from the server and then marks it on the map
locationData.forEach( el => {
        const coordinates = el.location.coordinates;
        var mark = L.marker([coordinates[1], coordinates[0]]).addTo(map);
})


socket.emit('joinRoom', {roomData, userData});

// socket.on('roomUsers', users => {
//         outputRoomUser(users);
// })

socket.on('message', msg => console.log(msg));




function outputRoomUser(users){
        users.forEach(user => {
                const p =document.createElement('p');
                p.innerHTML = `<p class="room-user">${user.name}</p>`
                const userslist = document.querySelector('.users-list');
                userslist.append(p);
        });
}



// the stuff which comes when user interacts with the application is here

document.querySelector('.form').addEventListener('submit', async e => {
        e.preventDefault();

        // The api call and the parameters for the api is declared here.
        const searchTerm = document.querySelector('#search').value;
        const locations = document.querySelector('.locations');

        const params = {
                q: searchTerm,
                format: 'json',
                addressdetails: 1,
                polygon_geojson: 1
        };

        NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org/search?';
        const queryString = new URLSearchParams(params);
        const res = await axios({
                method: 'GET',
                url: `${NOMINATIM_BASE_URL}${queryString}`
        });

        const locationData = res.data;

        // the data recieved from the api is used to display it to the user
        // locationData is the data we recieved from the api and the 'locations' is the div that we are supposed to append the locaiton data to
        outputApiResponse(locationData, locations);

        // the below looks for the all of the locations which was the result of the geocoding api and check which one was clicked and then store it to DB
        storeLocation();
});


function outputApiResponse(data, locationDiv){
        // here we are taking the data and storing the name as the text in the button
        // we are using hte latitude and longitude data and storing it in as a attribute to the class, so we can later use it for future purpose
        data.forEach(element => {
                const p = document.createElement("button");
                p.textContent = element.display_name;
                const lat_lon = {
                        lat: element.lat,
                        long: element.lon
                };
                p.setAttribute('location', JSON.stringify(lat_lon));
                p.setAttribute('class', 'address');
                locationDiv.append(p);
        })
}

function storeLocation(){
        const address = document.querySelectorAll('.address');
        address.forEach(button => {
                button.addEventListener('click', async() => {
                        const spatialData = JSON.parse(button.getAttribute("location"));
                        const locationName = button.textContent;
                        const latitude = spatialData.lat;
                        const longitude =spatialData.long;
                        const res = await axios({
                                method: 'POST',
                                url: 'http://127.0.0.1:3000/api/v1/location',
                                data: {
                                        name: locationName,
                                        latitude: latitude,
                                        longitude: longitude,
                                        user: userData._id,
                                        room: roomData._id
                                }
                        });

                        const time = res.data.data.data.time;
                        // console.log(res.data.data.data.time);

                        // the below function clears the search result after a button has been clicked
                        clearSearchResults();

                        // the below lines clear the searchBar and focuses on it (took it from traversy media)
                        const searchBar = document.querySelector('#search');
                        searchBar.value = '';
                        searchBar.focus();

                        socket.emit('newMarker', {locationName, latitude, longitude, userData, roomData, time});
                })
        })
};


function clearSearchResults(){
        const searchResults = document.querySelectorAll('.address');
        searchResults.forEach(element => {
                element.remove();
        });
};