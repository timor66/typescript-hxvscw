import { LitElement, html } from 'lit-element';
import mapboxgl from 'mapbox-gl';
import axios from 'axios';
import proj4 from 'proj4';
var moment = require('moment');
const axios = require('axios');
const epsg3067 = require('epsg-index/s/3067.json');
const epsg4326 = require('epsg-index/s/4326.json');

const MAB_BOX_TIMEOUT = 60000000;
const MAPBOX_TOKEN =
  'pk.eyJ1IjoidGltb3I2NiIsImEiOiJja3F3ODczd3UwNTJ4MndueHBkdjB5c3dsIn0.68mu1Rk-3ZMPqlzBF_HknQ';
const url_road_works = 'https://tie.digitraffic.fi/api/v3/data/traffic-messages/simple?inactiveHours=0&includeAreaGeometry=true&situationType=ROAD_WORK';
const url_traffic_announcements = 'https://tie.digitraffic.fi/api/v3/data/traffic-messages/simple?inactiveHours=0&includeAreaGeometry=false&situationType=TRAFFIC_ANNOUNCEMENT';
const url_postal_areas = 'https://geo.stat.fi/geoserver/wfs?service=WFS&version=2.0.0&request=GetFeature&typeName=postialue:pno_tilasto&outputFormat=json';

var mappi;
var pno_geojson;

class MapBoxComponent extends LitElement {
  constructor() {
    super();
  }

  firstUpdated() {
    this.initMap();
  }

  createRenderRoot() {
    return this;
  }

  initMap() {
    let options = {
      enableHighAccuracy: true,
      timeout: MAB_BOX_TIMEOUT,
      maximumAge: 0
    };
    mappi = this.map;

    const sendGetRequest = async () => {
      try {
          const resp = await axios.get(url_postal_areas, {timeout: 10000});
          return resp.data;
      } catch (err) {
          // Handle Error Here
          console.error(err);
      }
  };
  
  let epgs_3067_Handler = (res) => {
    var pno_geojson_tmp = eval(res);
    var pno_geojson_tmp_features = eval(pno_geojson_tmp.features);

    pno_geojson_tmp.features.forEach(function(feature) {
      feature.geometry.coordinates.forEach(function(coordinates) {
        coordinates.forEach(function(coord) {
          coord.forEach(function(coord2){
            var latlon = proj4(epsg3067.proj4,epsg4326.proj4, coord2);
            coord2.splice(0, 1, latlon[0]);
            coord2.splice(1, 1, latlon[1]);
          });
        });
      });
    });
    pno_geojson = pno_geojson_tmp;  
    this.buildMap();
  };

  sendGetRequest().then(result => epgs_3067_Handler(result));

  }

  buildMap() {
    mapboxgl.accessToken = MAPBOX_TOKEN;
    mappi = new mapboxgl.Map({
      container: 'finntraffic-map',
      style: 'mapbox://styles/timor66/ckr32cq3pemln18qspaqpkqiq',
      center: [24.94, 60.16],
      zoom: 6
    }).addControl(new mapboxgl.NavigationControl(), 'top-left');

    mappi.on('load', () => {
      // Add an image to use as a custom marker
      mappi.loadImage(
        'https://docs.mapbox.com/mapbox-gl-js/assets/custom_marker.png',
        function(error, image) {
          if (error) throw error;
          mappi.addImage('custom-marker', image);
          // Tietyöt layer
          mappi.addSource('tietyot', {
            type: 'geojson',
            data: url_road_works
          });

          // Tieliikennetiedotteet layer
          mappi.addSource('liikennetiedotteet', {
            type: 'geojson',
            data: url_traffic_announcements
          });

          mappi.addSource('postinumeroalueet', {
            type: 'geojson',
            data: pno_geojson
          });

          mappi.addLayer({
            id: 'tietyot',
            type: 'line',
            source: 'tietyot',
            layout: {
              'line-join': 'round',
              'line-cap': 'round'
            },
            paint: {
              'line-color': '#f00',
              'line-width': 8
            }
          });

          mappi.addLayer({
            id: 'liikennetiedotteet',
            type: 'line',
            source: 'liikennetiedotteet',
            layout: {
              'line-join': 'round',
              'line-cap': 'round'
            },
            paint: {
              'line-color': '#ff0',
              'line-width': 8
            }
          });

          mappi.addLayer({
            id: 'postinumeroalueet',
            type: 'fill',
            source: 'postinumeroalueet',
            paint: {
              
              "fill-color": "#0000ff",
              "fill-opacity": 0.5
              
            }
          });    
          
          mappi.addLayer({
            'id': 'outline',
            'type': 'line',
            'source': 'postinumeroalueet',
            'layout': {},
            'paint': {
            'line-color': '#000',
            'line-width': 3
            }
          });

          var popup_tietyot = new mapboxgl.Popup();
          var popup_tiedotteet = new mapboxgl.Popup();

          mappi.on('mouseenter', 'tietyot', function(e) {
            mappi.getCanvas().style.cursor = 'pointer';
          });

          mappi.on('mouseleave', 'tietyot', function() {
            mappi.getCanvas().style.cursor = '';
            popup_tietyot.remove();
          });

          mappi.on('mouseenter', 'liikennetiedotteet', function(e) {
            mappi.getCanvas().style.cursor = 'pointer';
          });

          mappi.on('mouseleave', 'liikennetiedotteet', function() {
            mappi.getCanvas().style.cursor = '';
            popup_tiedotteet.remove();
          });

          mappi.on('click', 'postinumeroalueet', function (e) {
            new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(e.features[0].properties.nimi)
            .addTo(mappi);
          });

          mappi.on('click', 'tietyot', function(e) {
            mappi.getCanvas().style.cursor = 'pointer';

            var announcements = eval(e.features[0].properties.announcements);
            var title = announcements[0].title;
            var features = eval(announcements[0].features);
            var roadWorkPhases = eval(announcements[0].roadWorkPhases);
            var worktypes = eval(roadWorkPhases[0].worktypes);
            var location_description = announcements[0].location.description;
            var worktypes_description = worktypes[0].description;
            var releaseTime = moment(
              e.features[0].properties.releaseTime
            ).format('DD.MM.YYYY HH:mm:ss');
            var time_and_duration = announcements[0].timeAndDuration;
            var start_time = moment(time_and_duration.startTime).format(
              'DD.MM.YYYY HH:mm:ss'
            );
            var end_time = moment(time_and_duration.endTime).format(
              'DD.MM.YYYY HH:mm:ss'
            );
            var working_hours = roadWorkPhases[0].workingHours;
            var restrictions = eval(
              announcements[0].roadWorkPhases[0].restrictions
            );
            var comment = (!announcements[0].roadWorkPhases[0].comment) ? '' : announcements[0].roadWorkPhases[0].comment;

            var wrkHrs = '';
            var resTr = '';
            var weekdays = [];
            weekdays.push('MONDAY', 'MA');
            weekdays.push('TUESDAY', 'TI');
            weekdays.push('WEDNESDAY', 'KE');
            weekdays.push('THURSDAY', 'TO');
            weekdays.push('FRIDAY', 'PE');

            working_hours.forEach(function(arrayItem) {
              wrkHrs =
                wrkHrs +
                arrayItem.weekday +
                ' ' +
                arrayItem.startTime +
                ' - ' +
                arrayItem.endTime +
                '<br/>';
            });

            restrictions.forEach(function(arrayItem) {
              resTr =
                resTr +
                arrayItem.restriction.name + '. ' +
                (!arrayItem.restriction.quantity ? '' : arrayItem.restriction.quantity)  + '. ' +
                (!arrayItem.restriction.unit ? '' : arrayItem.restriction.unit) +
                '. ';
            });

            popup_tietyot.setHTML(
              '<h3>' +
                title +
                '</h3><br/>' +
                releaseTime +
                '<br/><br/>' +
                location_description +
                '<br/><br/>' +
                worktypes_description +
                '<br/><br/>' +
                comment +
                '<br/><br/>' +
                resTr +
                '<br/><br/>' +
                start_time +
                '&nbsp;&minus;<br/>' +
                end_time +
                '<br/><br/>' +
                wrkHrs
            );
            popup_tietyot.setLngLat(e.lngLat);
            popup_tietyot.addTo(mappi);
          });

          mappi.on('click', 'liikennetiedotteet', function(e) {
            mappi.getCanvas().style.cursor = 'pointer';

            var announcements = eval(e.features[0].properties.announcements);
            var title = announcements[0].title;
            var features = eval(announcements[0].features);
            var features_name = features[0].name != '' ? features[0].name : '';
            var comment = announcements[0].comment;
            var releaseTime = moment(
              e.features[0].properties.releaseTime
            ).format('DD.MM.YYYY HH:mm:ss');
            var description = announcements[0].location.description;
            var time_and_duration = announcements[0].timeAndDuration;
            var start_time = moment(time_and_duration.startTime).format(
              'DD.MM.YYYY HH:mm:ss'
            );
            var end_time = moment(time_and_duration.endTime).format(
              'DD.MM.YYYY HH:mm:ss'
            );

            popup_tiedotteet.setHTML(
              '<h3>' +
                title +
                '</h3><br/>' +
                releaseTime +
                '<br/><br/>' +
                description +
                '<br/><br/>' +
                features_name +
                '<br/><br/>' +
                start_time +
                '&nbsp;&minus;<br/>' +
                end_time +
                '<br/><br/>' +
                comment
            );
            popup_tiedotteet.setLngLat(e.lngLat);
            popup_tiedotteet.addTo(mappi);
          });
          // Add a symbol layer
          /*mappi.addLayer({
                      'id': 'points',
                      'type': 'symbol',
                      'source': 'points',
                      'layout': {
                          'icon-image': 'custom-marker',
                          // get the title name from the source's "title" property
                          'text-field': ['get', 'tasks'],
                          'text-font': [
                             'Open Sans Semibold',
                              'Arial Unicode MS Bold'
                          ],
                          'text-offset': [0, 1.25],
                          'text-anchor': 'top'
                      }
                  });*/
          /*mappi.on('click', 'points', function (e) {
                    var coordinates = e.features[0].geometry.coordinates.slice();
                    var description = e.features[0].properties.tasks + "<br/>" + e.features[0].properties.time;
                     
                    // Ensure that if the map is zoomed out such that multiple
                    // copies of the feature are visible, the popup appears
                    // over the copy being pointed to.
                    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
                    }
                     
                    new mapboxgl.Popup()
                        .setLngLat(coordinates)
                        .setHTML(description)
                        .addTo(mappi);
                    });
                     
                    // Change the cursor to a pointer when the mouse is over the places layer.
                    mappi.on('mouseenter', 'points', function () {
                        mappi.getCanvas().style.cursor = 'pointer';
                    });
                     
                    // Change it back to a pointer when it leaves.
                    mappi.on('mouseleave', 'points', function () {
                    mappi.getCanvas().style.cursor = '';
                    });*/
        }
      );
    });

    mappi.on('idle', function() {
      // If these two layers have been added to the style,
      // add the toggle buttons.
      if (mappi.getLayer('tietyot') && mappi.getLayer('liikennetiedotteet') && mappi.getLayer('postinumeroalueet')) {
        // Enumerate ids of the layers.
        var toggleableLayerIds = ['tietyot', 'liikennetiedotteet','postinumeroalueet'];
        // Set up the corresponding toggle button for each layer.
        for (var i = 0; i < toggleableLayerIds.length; i++) {
          var id = toggleableLayerIds[i];
          if (!document.getElementById(id)) {
            // Create a link.
            var link = document.createElement('a');
            link.id = id;
            link.href = '#';
            link.textContent = id;
            link.className = 'active';
            // Show or hide layer when the toggle is clicked.
            link.onclick = function(e) {
              var clickedLayer = this.textContent;
              e.preventDefault();
              e.stopPropagation();

              var visibility = mappi.getLayoutProperty(
                clickedLayer,
                'visibility'
              );

              // Toggle layer visibility by changing the layout object's visibility property.
              if (visibility === 'visible') {
                mappi.setLayoutProperty(clickedLayer, 'visibility', 'none');
                this.className = '';
              } else {
                this.className = 'active';
                mappi.setLayoutProperty(clickedLayer, 'visibility', 'visible');
              }
            };

            var layers = document.getElementById('menu');
            layers.appendChild(link);
          }
        }
      }
    });
  }

  render() {
    return html`
      <div id="finntraffic-map"></div>
    `;
  }

  
}
//Component registration
customElements.define('mapbox-component', MapBoxComponent);

