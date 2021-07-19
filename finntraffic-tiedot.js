import { LitElement, html } from 'lit-element';
import mapboxgl from 'mapbox-gl';

const MAB_BOX_TIMEOUT = 60000000;
const MAPBOX_TOKEN =
  'pk.eyJ1IjoidGltb3I2NiIsImEiOiJja3F3ODczd3UwNTJ4MndueHBkdjB5c3dsIn0.68mu1Rk-3ZMPqlzBF_HknQ';

var mappi;

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
    this.buildMap();
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
          // Add a GeoJSON source with 2 points
          mappi.addSource('tietyot', {
            type: 'geojson',
            data:
              'https://tie.digitraffic.fi/api/v3/data/traffic-messages/simple?inactiveHours=0&includeAreaGeometry=true&situationType=ROAD_WORK'
          });

          mappi.addSource('tiedotteet', {
            type: 'geojson',
            data:
              'https://tie.digitraffic.fi/api/v3/data/traffic-messages/simple?inactiveHours=0&includeAreaGeometry=false&situationType=TRAFFIC_ANNOUNCEMENT'
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
            id: 'tiedotteet',
            type: 'line',
            source: 'tiedotteet',
            layout: {
              'line-join': 'round',
              'line-cap': 'round'
            },
            paint: {
              'line-color': '#ff0',
              'line-width': 4
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

          mappi.on('mouseenter', 'tiedotteet', function(e) {
            mappi.getCanvas().style.cursor = 'pointer';
          });

          mappi.on('mouseleave', 'tiedotteet', function() {
            mappi.getCanvas().style.cursor = '';
            popup_tiedotteet.remove();
          });

          mappi.on('click', 'tietyot', function(e) {
            mappi.getCanvas().style.cursor = 'pointer';

            var announcements = eval(e.features[0].properties.announcements);
            var title = announcements[0].title;
            var roadWorkPhases = eval(announcements[0].roadWorkPhases);
            var worktypes = eval(roadWorkPhases[0].worktypes);
            var worktypes_description = worktypes[0].description;
            var releaseTime = e.features[0].properties.releaseTime;
            var description = announcements[0].location.description;

            popup_tietyot.setHTML(
              '<h3>' +
                title +
                '</h3><br/>' +
                releaseTime +
                '<br/><br/>' +
                description
            );
            popup_tietyot.setLngLat(e.lngLat);
            popup_tietyot.addTo(mappi);
          });

          mappi.on('click', 'tiedotteet', function(e) {
            mappi.getCanvas().style.cursor = 'pointer';

            var announcements = eval(e.features[0].properties.announcements);
            var title = announcements[0].title;
            var features = eval(announcements[0].features);
            var features_name = features[0].name;
            var comment = announcements[0].comment;
            var releaseTime = e.features[0].properties.releaseTime;
            var description = announcements[0].location.description;

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
      if (mappi.getLayer('tietyot') && mappi.getLayer('tiedotteet')) {
        // Enumerate ids of the layers.
        var toggleableLayerIds = ['tietyot', 'tiedotteet'];
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
