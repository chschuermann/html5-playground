(function($) {

    $.geoLookout = function( el, options ) {

        var self = this;
        this.el = $(el);
        this.lookoutData = [];
        this.lookoutMarkers = []


        this.init = function() {
            this.loadMapScript();
        };

        this.getLookoutData = function() {
            var url = 'data/lookouts_zurich.js';
            $.ajax({
                url: url,
                dataType: 'jsonp',
                crossDomain: true,
                jsonpCallback: 'parseResponse',
                success: function( data ){
                    self.lookoutData = [];
                    for (var i=0; i<data.features.length; i++) {
                        var feature = data.features[i];
                        self.lookoutData.push({
                            'name': feature['properties']['Name'],
                            'zip': feature['properties']['PLZ'],
                            'city': feature['properties']['Ort'],
                            'position': {
                                'lat': data.features[i]['geometry']['coordinates'][1],
                                'lng': data.features[i]['geometry']['coordinates'][0]
                            }
                        });
                    }
                    self.getPosition();
//                    self.renderLookoutList();
                }
            });
        };

        this.getPosition = function() {
//            this.renderLookoutList();
            if (Modernizr.geolocation) {
                navigator.geolocation.getCurrentPosition(this.orderListByDistance);
            }else {
                this.renderLookoutList();
            }
        }

        this.renderLookoutList = function() {
            this.el.empty();
            for (var i=0; i<this.lookoutData.length; i++) {
//                this.el.append('<li><span class="name">'+this.lookoutData[i]['name']+'</span><span class="distance">'+this.lookoutData[i]['distance']+'</span></li>');
                this.el.append('<li class="row"><div class="small-9 columns"><span class="name">'+this.lookoutData[i]['name']+'</span></div><div class="small-3 columns"><span class="distance">'+this.formatDistance(this.lookoutData[i]['distance'])+'</span></div></li>');
            }
        }

        this.orderListByDistance = function(position) {
            self.userPosition = { 'lat': position.coords.latitude, 'lng': position.coords.longitude };
            self.initMap();

            self.addMapMarker(self.userPosition, true);

            for (var i=0; i<self.lookoutData.length; i++) {
                self.lookoutData[i]['distance'] = Math.round(self.getDistance(self.userPosition, self.lookoutData[i]['position']));
            }
            self.lookoutData.sort(self.sortByDistance);
            self.renderLookoutList()
        }

        this.getDistance = function(position1, position2) {
            var R = 6371; // km
            var dLat = numToRad(position2.lat-position1.lat);
            var dLng = numToRad(position2.lng-position1.lng);
            var lat1 = numToRad(position1.lat);
            var lat2 = numToRad(position2.lat);

            var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.sin(dLng/2) * Math.sin(dLng/2) * Math.cos(lat1) * Math.cos(lat2);
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            var d = R * c * 1000;
            return d;

            function numToRad(val) {
                return val * Math.PI / 180;
            }
        }

        this.sortByDistance = function(a, b) {
            if (a.distance < b.distance) return -1;
            if (a.distance > b.distance) return 1;
            return 0;
        }

        this.formatDistance = function(distance) {
            if (distance >= 1000) return String(Math.round(distance/100)/10) + 'km';
            else return String(distance) + 'm';
        }


        this.loadMapScript = function() {
            var script = document.createElement("script");
            script.type = "text/javascript";
            script.src = "http://maps.googleapis.com/maps/api/js?sensor=false&callback=lookoutList.mapScriptCallback";
            document.body.appendChild(script);
        }

        this.mapScriptCallback = function() {
            this.scriptLoaded = true;
            this.initMap();
            this.getLookoutData();
        }

        this.initMap = function() {
            if (!this.userPosition || !this.scriptLoaded) return false;

            var mapOptions = {
                zoom: 13,
                center: new google.maps.LatLng(this.userPosition.lat, this.userPosition.lng),
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                zoomControl: false,
                panControl: false,
                mapTypeControl: false
            }
            this.map = new google.maps.Map($('#map-canvas')[0], mapOptions);
            this.addMapMarkers();
        }

        this.addMapMarkers = function () {
            for (var i=0; i<this.lookoutData.length; i++) {
                this.addMapMarker(this.lookoutData[i].position, false);
            }
        }

        this.addMapMarker = function (position, currentPosition) {
            var position = new google.maps.LatLng(position.lat, position.lng);
            var markerOptions = {
                'map': this.map,
                'position': position
            };

            if(currentPosition){
                var image = new google.maps.MarkerImage('img/location.png',
                   new google.maps.Size(20, 20)
                );
            }else{
                var image = new google.maps.MarkerImage('img/map-marker.png',
                    new google.maps.Size(25, 36)
                );
            }


//            var image = new google.maps.MarkerImage('img/map-marker.png');
            markerOptions.icon = image;

            var marker = new google.maps.Marker(markerOptions);
//            google.maps.event.addListener(marker, 'click', function () {
//                this.infoWindow = new google.maps.InfoWindow({
//                    content: '<div id="content"><div id="bodyContent">asdfasdf</div></div>',
//                    position: position
//                });
////                this.infoWindow.setContent(self.createInfoWindow());
////                this.infoWindow.setPosition(position);
//                this.infoWindow.open(self.map);
//            }.bind(this));

            this.lookoutMarkers.push(marker);
            return marker;
        };

        this.createInfoWindow = function () {
//            var infoWindow = _.template(this.options.locationFinderMapInfoWindowTemplate);
            return '<div id="content">sdfasdf</div>';
        };




        this.init();
    };

    $.fn.geoLookout = function( options ) {
        return new $.geoLookout( this, options );
    };

})(jQuery);