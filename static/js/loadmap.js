var x = document.getElementById("info");
let plat = -1;
let plon = -1;
let currentTimestamp ;

function getLocation() {

    currentTimestamp = new Date();
    if (navigator.geolocation) {
        
        navigator.geolocation.getCurrentPosition(showPosition,function(error){ alert(error.message)},{enableHighAccuracy: true,timeout: 5000});
    } 
    else {
        x.innerHTML = "Geolocation is not supported by this browser.";
    }
}

function showPosition(position) {
    
    if(plat == -1){
        
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
    }
    else if(calcdistance(plat,plon,position.coords.latitude,position.coords.longitude)>1){
        //initMap();
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

setInterval(getLocation,5000);

let map;
function initMap(){
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 28, lng: 77},
        zoom: 8
    });
    console.log("map printed: "+plat+"  "+plon);
}