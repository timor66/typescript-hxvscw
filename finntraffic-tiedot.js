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

    /*async function makeGetRequest() {

      let res = await axios.get('https://geo.stat.fi/geoserver/wfs?service=WFS&version=2.0.0&request=GetFeature&typeName=postialue:pno_tilasto&outputFormat=json');
    
      let data = res.data;
      return data;
    }
    
    console.log(makeGetRequest());*/ 

    const sendGetRequest = async () => {
      try {
          const resp = await axios.get('https://geo.stat.fi/geoserver/wfs?service=WFS&version=2.0.0&request=GetFeature&typeName=postialue:pno_tilasto&outputFormat=json', {timeout: 5000});
          return resp.data;
      } catch (err) {
          // Handle Error Here
          console.error(err);
      }
  };
  
  let myHandler = (r) => {
    console.log('Called!');
    var pno_geojson_tmp = eval(r);
    var pno_geojson_tmp_features = eval(pno_geojson_tmp.features);
    console.log(pno_geojson_tmp.features);

    pno_geojson_tmp.features.forEach(function(arrayItem) {
      arrayItem.geometry.coordinates.forEach(function(arrayItem2) {
        /*var val = proj4(epsg3067.proj4,epsg4326.proj4, arrayItem2);
        //console.log(proj4(epsg3067.proj4,epsg4326.proj4, arrayItem2));
        arrayItem2.splice(0, 1, val[0]);
        arrayItem2.splice(1, 1, val[1]);*/
        console.log(arrayItem2);
  
  
      });
      //console.log(arrayItem.geometry.coordinates);
    });
    console.log(pno_geojson_tmp);  
  };

  sendGetRequest().then(res => myHandler(res));

   /*function get_pno_geojson() {
     let data;
     await axios.get('https://geo.stat.fi/geoserver/wfs?service=WFS&version=2.0.0&request=GetFeature&typeName=postialue:pno_tilasto&outputFormat=json')
    .then((response) => {data = response.data})
    .catch(function (error) {
      console.log(error);
    });
    return data;
  }  */  
//pno_geojson = get_pno_geojson();
    /*get_pno_geojson() {

      let data = {};

      axios.get('https://geo.stat.fi/geoserver/wfs?service=WFS&version=2.0.0&request=GetFeature&typeName=postialue:pno_tilasto&outputFormat=json')
      .then(function (response) {
          data = response.data;
      }).catch(function (error) {
          console.log(error);
      });
      return data;
    };*/

    //console.log(pno_geojson);


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
          // Tietyöt layer
          mappi.addSource('tietyot', {
            type: 'geojson',
            data:
              'https://tie.digitraffic.fi/api/v3/data/traffic-messages/simple?inactiveHours=0&includeAreaGeometry=true&situationType=ROAD_WORK'
          });

          // Tieliikennetiedotteet layer
          mappi.addSource('liikennetiedotteet', {
            type: 'geojson',
            data:
              'https://tie.digitraffic.fi/api/v3/data/traffic-messages/simple?inactiveHours=0&includeAreaGeometry=false&situationType=TRAFFIC_ANNOUNCEMENT'
          });

          mappi.addSource('postinumerot', {
            type: 'geojson',
            data: {"type":"FeatureCollection","features":[{"type":"Feature","id":"pno_tilasto.24","geometry":{"type":"MultiPolygon","coordinates":pno},"geometry_name":"geom","properties":{"postinumeroalue":"00340","nimi":"Kuusisaari-Lehtisaari","namn":"Granö-Lövö","euref_x":380834,"euref_y":6673255,"pinta_ala":1008214,"vuosi":2021,"kunta":"091","he_vakiy":1776,"he_naiset":889,"he_miehet":887,"he_kika":44,"he_0_2":51,"he_3_6":58,"he_7_12":127,"he_13_15":74,"he_16_17":44,"he_18_19":35,"he_20_24":100,"he_25_29":75,"he_30_34":74,"he_35_39":78,"he_40_44":132,"he_45_49":133,"he_50_54":142,"he_55_59":155,"he_60_64":117,"he_65_69":89,"he_70_74":102,"he_75_79":73,"he_80_84":52,"he_85_":65,"ko_ika18y":1422,"ko_perus":194,"ko_koul":1228,"ko_yliop":200,"ko_ammat":253,"ko_al_kork":200,"ko_yl_kork":575,"hr_tuy":1422,"hr_ktu":63919,"hr_mtu":34641,"hr_pi_tul":264,"hr_ke_tul":431,"hr_hy_tul":727,"hr_ovy":90892273,"te_taly":756,"te_takk":2.3,"te_as_valj":52,"te_yks":236,"te_nuor":36,"te_eil_np":21,"te_laps":199,"te_plap":45,"te_aklap":81,"te_klap":91,"te_teini":85,"te_yhlap":27,"te_aik":303,"te_elak":260,"te_omis_as":557,"te_vuok_as":163,"te_muu_as":36,"tr_kuty":756,"tr_ktu":119495,"tr_mtu":67491,"tr_pi_tul":76,"tr_ke_tul":239,"tr_hy_tul":441,"tr_ovy":90337991,"ra_ke":1,"ra_raky":227,"ra_muut":22,"ra_asrak":205,"ra_asunn":852,"ra_as_kpa":122.2,"ra_pt_as":396,"ra_kt_as":456,"tp_tyopy":367,"tp_alku_a":2,"tp_jalo_bf":7,"tp_palv_gu":358,"tp_a_maat":2,"tp_b_kaiv":0,"tp_c_teol":1,"tp_d_ener":0,"tp_e_vesi":0,"tp_f_rake":6,"tp_g_kaup":14,"tp_h_kulj":11,"tp_i_majo":10,"tp_j_info":135,"tp_k_raho":9,"tp_l_kiin":13,"tp_m_erik":38,"tp_n_hall":7,"tp_o_julk":0,"tp_p_koul":0,"tp_q_terv":91,"tp_r_taid":13,"tp_s_muup":11,"tp_t_koti":0,"tp_u_kans":6,"tp_x_tunt":0,"pt_vakiy":1767,"pt_tyoll":807,"pt_tyott":46,"pt_0_14":266,"pt_opisk":141,"pt_elakel":404,"pt_muut":103,"bbox":[380321.1969,6672345.0962,381932.2753,6674414.7585]}}]}
                          //'https://geo.stat.fi/geoserver/wfs?service=WFS&version=2.0.0&request=GetFeature&typeName=postialue:pno_tilasto&outputFormat=json'
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
            id: 'postinumerot',
            type: 'fill',
            source: 'postinumerot',
            paint: {
              
              "fill-color": "#0000ff"
              
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

          mappi.on('click', 'tietyot', function(e) {
            mappi.getCanvas().style.cursor = 'pointer';

            var announcements = eval(e.features[0].properties.announcements);
            var title = announcements[0].title;
            var features = eval(announcements[0].features);
            console.log(features[0]);
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
            console.log(e.features[0].properties.releaseTime);
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

            console.log(time_and_duration);
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
      if (mappi.getLayer('tietyot') && mappi.getLayer('liikennetiedotteet')) {
        // Enumerate ids of the layers.
        var toggleableLayerIds = ['tietyot', 'liikennetiedotteet'];
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

