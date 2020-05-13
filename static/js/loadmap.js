var x = document.getElementById("info");
let plat = -1;
let plon = -1;
let currentTimestamp ;
let path = [];


let db;
let map;
let request;
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 28, lng: 77 },
        zoom: 8
    });
    console.log("map printed: " + plat + "  " + plon);
}

console.log("declaring variables",plat,plon);
function getLocation() {

    currentTimestamp = new Date();
    if (navigator.geolocation) {
        
        navigator.geolocation.getCurrentPosition(showPosition,function(error){ alert(error.message)},{enableHighAccuracy: true,timeout: 5000});
    } 
    else {
        x.innerHTML = "Geolocation is not supported by this browser.";
    }
}

function displayData(){
    path = [];
    //console.log('hello');
    let objectStore = db.transaction('trail_os').objectStore('trail_os');
    objectStore.openCursor().onsuccess = function(e){
        let cursor = e.target.result;

        if(cursor){
            //console.log(cursor.value);
            //console.log(cursor);
            let userLatLng = new google.maps.LatLng(cursor.value.latitude, cursor.value.longitude);
            //console.log(userLatLng);
            let item = {lat: cursor.value.latitude,lng: cursor.value.longitude};
            //console.log(item);
            path.push(item);
            let marker = new google.maps.Marker({
                position: userLatLng,
                title: "Time: "+ cursor.value.timestamp.toLocaleTimeString() +", "+ cursor.value.timestamp.toDateString(),
                map: map
            });
            //console.log(marker.getPosition());
            map.setCenter(marker.getPosition());
            map.setZoom(17);
            map.panTo(marker.position);
            cursor.continue();
        }
        var poly = new google.maps.Polyline({
            path: path,
            geodesic: true,
            strokeColor: '#FF0000',
            strokeOpacity: 1.0,
            strokeWeight: 2
        });
        poly.setMap(map);
        if(path.length >0){
            console.log("setting previous known lat lon from db",path[path.length-1].lat,path[path.length-1].lng);
            plat = path[path.length-1].lat;
            plon = path[path.length-1].lng;
        }
    }
    
}

function showPosition(position) {
    
    if(plat == -1){
        console.log("no item fetched from db yet");
        plat = position.coords.latitude;
        plon = position.coords.longitude;
        //initMap();
        var userLatLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        var marker = new google.maps.Marker({
            position: userLatLng,
            title: "Time: "+ currentTimestamp.toLocaleTimeString() +", "+ currentTimestamp.toDateString(),
            map: map
        });
        map.setCenter(marker.getPosition());
        map.setZoom(17);
        map.panTo(marker.position);
        acc = position.coords.accuracy;
        x.innerHTML = "Time: "+ currentTimestamp.toLocaleTimeString() +", "+ currentTimestamp.toDateString()+ "<br>"+"Latitude: " + plat +"<br>Longitude: " + plon+"<br>accuracy: "+acc;
    
        let newItem = {
            timestamp: currentTimestamp,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        };

        let transaction = db.transaction(['trail_os'],'readwrite');
        let objectStore = transaction.objectStore('trail_os');

        let request = objectStore.add(newItem);
        request.onsuccess = function(){
            console.log('added first item in db successfully' + newItem.latitude+ " "+ newItem.longitude);
        }
        transaction.oncomplete = function() {
            console.log('Transaction completed: database modification finished.');
        
            displayData();
        };

        transaction.onerror = function() {
            console.log('Transaction not opened due to error');
          };
    }
    else if(calcdistance(plat,plon,position.coords.latitude,position.coords.longitude)>10){
        //initMap();
        plat = position.coords.latitude;
        plon = position.coords.longitude;
        acc = position.coords.accuracy;
        var userLatLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        
        var marker = new google.maps.Marker({
            position: userLatLng,
            title: "Time: "+ currentTimestamp.toLocaleTimeString() +", "+ currentTimestamp.toDateString(),
            map: map
        });
        map.setCenter(marker.getPosition());
        map.setZoom(17);
        map.panTo(marker.position);
        x.innerHTML ="Time: "+ currentTimestamp.toLocaleTimeString()+", "+currentTimestamp.toDateString()+"<br>Latitude: " + position.coords.latitude +"<br>Longitude: " + position.coords.longitude+"<br>accuracy: "+acc;
    
        let newItem = {
            timestamp: currentTimestamp,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        };

        let transaction = db.transaction(['trail_os'],'readwrite');
        let objectStore = transaction.objectStore('trail_os');

        let request = objectStore.add(newItem);
        request.onsuccess = function(){
            console.log('added item in db successfully' + newItem.latitude+" "+ newItem.longitude);
        }
        transaction.oncomplete = function() {
            console.log('Transaction completed: database modification finished.');
        
            displayData();
        };

        transaction.onerror = function() {
            console.log('Transaction not opened due to error');
          };
    }
    else{
        x.innerHTML ="Time: "+ currentTimestamp.toLocaleTimeString()+", "+currentTimestamp.toDateString()+"<br>Latitude: " + position.coords.latitude +"<br>Longitude: " + position.coords.longitude+"<br>accuracy: "+position.coords.accuracy;
    }
    
    
}
function calcdistance(lat1,lon1,lat2,lon2){
    const R = 6371e3; // metres
    const p1 = lat1 * Math.PI/180; 
    const p2 = lat2 * Math.PI/180;
    const dp = (lat2-lat1) * Math.PI/180;
    const dl = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(dp/2) * Math.sin(dp/2) + Math.cos(p1) * Math.cos(p2) * Math.sin(dl/2) * Math.sin(dl/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    const d = R * c; // in metres
    return d;

}


window.onload = function(e){
    request = window.indexedDB.open('trail_os',1);

    request.onerror = function(){
        console.log('database failed to open');
    };

    request.onsuccess = function(){
        console.log('database opened successfully');
        db = request.result;
        setInterval(getLocation,5000);

        displayData();
        console.log("displaying data...");
    };

    request.onupgradeneeded = function(e){

        let db = e.target.result;

        let objectStore = db.createObjectStore('trail_os',{keyPath: 'trail_id',autoIncrement: true});

        objectStore.createIndex('latitude','latitude',{unique: false});
        objectStore.createIndex('timestamp','timestamp',{unique: true});
        objectStore.createIndex('longitude','longitude',{unique: false});

        console.log('database setup complete');

    };

    
};


