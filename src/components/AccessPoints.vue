<template>
  <div>
    <h2>
      Live View

      <span class="quick-tool">
        <a title="Toggle live or pause" v-on:click="live=!live" :class="{live: live, paused: !live}">
          <span v-if="live">Live ▶️</span>
          <span v-if="!live">Paused ⏸</span>
        </a>
      </span>
    </h2>

    <div class="tools tabs">
      <a v-on:click="activeTab='feed'" :class="{active: activeTab==='feed'}">AP Live Feed</a>
      <a v-on:click="activeTab='list'" :class="{active: activeTab==='list'}">AP List</a>
      <a v-on:click="activeTab='events'" :class="{active: activeTab==='events'}">Events</a>
    </div>

    <div class="tabs-container">
      <div class="tab" v-if="activeTab === 'feed'">
        <div v-if="locationMeasurements.length !== 0">
          <table>
            <thead>
            <tr>
              <th>Location</th>
              <th>Client</th>
              <th>Meta</th>
              <th>Access Point</th>
              <th>Clients</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(lm, index) in locationMeasurements" v-bind:key="lm.mac + lm.collected_at + index">
              <td><span v-rainbow-background="{from: lm.location}">{{ lm.location }}</span></td>
              <td>{{ lm.client_id }}</td>
              <td>
                <div v-if="lm.vendor">{{ lm.vendor }}</div>
                <div class="detail">
                  {{ lm.collected_at }} / {{ lm.agent_version }}
                </div>
              </td>
              <td>
                <div>
                  <span v-rainbow-background="{from: lm.hostname || lm.mac}">{{ lm.hostname || lm.mac }}</span>
                  <div class="detail">
                    {{ lm.authentication }}
                    <span v-if="lm.channel">/ {{ lm.channel }} </span>
                    <span v-if="lm.frequency">/ {{ lm.frequency }} </span>
                  </div>
                </div>
              </td>
              <td>
                <div v-for="client in lm.clients" v-bind:key="'cl' + client.mac">
                <span v-rainbow-background="{from: client.hostname || client.vendor || client.mac}">{{
                    client.hostname || client.vendor || client.mac
                  }}</span>
                </div>
              </td>
            </tr>
            </tbody>
          </table>

        </div>
        <div v-if="locationMeasurements.length === 0">
          <p>Waiting for data,...</p>
        </div>
      </div>
      <div class="tab" v-if="activeTab === 'list'">

        <div v-if="accessPoints.length !== 0">
          <p>Number of currently visible Access Points: {{ accessPoints.length }}</p>

          <table class="access-points">
            <thead>
            <tr>
              <th>Access Point</th>
              <th>Clients</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="ap in accessPoints" v-bind:key="ap.mac">
              <td>
                <div v-rainbow-background="{from: ap.hostname || ap.mac}">{{ ap.hostname }}</div>
                <div>{{ ap.mac }}</div>
                <div v-if="ap.vendor">{{ ap.vendor }}</div>
                <div class="detail">
                  <div>{{ ap.rssi }} / {{ ap.cipher }} / {{ ap.authentication }}, {{ ap.location }}</div>
                  <div>{{ ap['updates'] }}</div>
                </div>
              </td>
              <td>

                <ul v-for="client in ap.clients" v-bind:key="'cl' + ap.mac + client.mac">
                  <li>
                    <div v-rainbow-background="{from: client.hostname || client.vendor || client.mac}">{{ client.mac }}
                      <span v-if="client.vendor"> - {{ client.vendor }}</span>
                      <span class="detail">
                      <span v-if="client.authentication">{{ client.authentication }} /</span>
                      <span v-if="client.channel"> {{ client.channel }} /</span>
                      <span v-if="client.frequency"> {{ client.frequency }} </span>
                    </span>
                    </div>
                  </li>
                </ul>

              </td>
            </tr>
            </tbody>

          </table>
        </div>

        <div v-if="accessPoints.length === 0">
          <p>Waiting for the data,...</p>
        </div>
      </div>
      <div class="tab" v-if="activeTab === 'events'">
        <div v-if="freshEvents.length !== 0">
          <table>
            <thead>
            <tr>
              <th style="width: 20%">Meta</th>
              <td>Event Data</td>
            </tr>
            </thead>
            <tbody>
            <tr v-for="event in freshEvents" v-bind:key="event.key">
              <td>
                <div v-rainbow-background="{from: event.tag}">{{ event.tag }}</div>
                <div v-rainbow-background="{from: event.location}">{{ event.location }}</div>
                <div>{{ event.client_id }}</div>
                <div>{{ event.agent_version }}</div>
                <div>{{ event.collected_at }}</div>
              </td>
              <td>
                <ul v-for="(item, index) in renderEventData(event.data)" v-bind:key="item.key + index">
                  <li>
                    <strong>{{ item.key }}:</strong> {{ item.value }}
                  </li>
                </ul>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
        <div v-if="freshEvents.length === 0">
          <p>Waiting for the data,...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
/* eslint-disable */
import * as _ from "lodash";
import {DirectiveOptions} from 'vue';
import {Prop, Vue} from 'vue-property-decorator';
import Component from 'vue-class-component';
import {connect} from 'mqtt';

const rainbowBackgroundDirective: DirectiveOptions = {
  inserted(el, node) {
    const hashString = (input: string): string => {
      const colors: string[] = [
        "#e51c23", "#e91e63", "#9c27b0", "#673ab7", "#3f51b5",
        "#5677fc", "#03a9f4", "#00bcd4", "#009688", "#259b24",
        "#8bc34a", "#afb42b", "#ff9800", "#ff5722", "#f59602",
        "#795548", "#607d8b"
      ];

      let hash = 0;
      if (input.length === 0) return hash + '';
      for (let i = 0; i < input.length; i++) {
        hash = input.charCodeAt(i) + ((hash << 5) - hash);
        hash = hash & hash;
      }
      hash = ((hash % colors.length) + colors.length) % colors.length;
      return colors[hash];
    };

    const hueString = (input: string): string => {
      let hash = 0;
      if (input.length === 0) return hash + '';
      for (let i = 0; i < input.length; i++) {
        hash = input.charCodeAt(i) + ((hash << 5) - hash);
        hash = hash & hash;
      }
      return (hash % 360) + '';
    }

    if (el && _.get(node, 'value.from', false)) {
      el.style.color = `hsl(${hueString(_.get(node, 'value.from'))}, 70%, 50%)`;
    }
  }
}

export type RSSI = string;
export type MacAddress = string;
export type Location = string;

interface Device {
  mac: MacAddress;
  rssi: RSSI;
  frequency: number;
  hostname: string;
  vendor: string;
  channel: number;
}

export interface Client extends Device {
  alias: string;
  last_seen: string;
  first_seen: string;
}

export interface AccessPoint extends Device {
  clients: Client[];
  authentication: string;
}

export interface LocationMeasurement extends AccessPoint {
  agent_version: string;
  location: Location;
  client_id: string;
  collected_at: string;
}

export interface Event {
  agent_version: string;
  client_id: string;
  collected_at: string;
  data: Map<string, string | number>;
  key: string;
  location: string;
  tag: string;
  time: string;
}

@Component({
  directives: {'rainbow-background': rainbowBackgroundDirective}
})
export default class AccessPoints extends Vue {
  MAX_MEASUREMENTS_SIZE = 200;
  MAX_EVENTS_SIZE = 20;
  locationMeasurements: LocationMeasurement[] = [];
  events: Event[] = [];
  activeTab: string = 'events' // or list or events
  live: boolean = true;

  private appendMeasurement(measurement: LocationMeasurement): void {
    if (this.live)
      this.locationMeasurements = this.locationMeasurements.concat(measurement).slice(this.MAX_MEASUREMENTS_SIZE * -1);
  }

  private appendEvent(event: Event): void {
    if (this.live) {
      this.events.unshift(event)
      this.events = this.events.slice(0, this.MAX_EVENTS_SIZE);
    }
  }

  client = connect("wss://mqtt.eclipse.org:443/mqtt", {
    // protocol: 'ws'
  }).on('connect', () => {
    this.client.subscribe([
      "oracle-peak-staging/+/+/access-points",
      "oracle-peak-staging/+/+/events",
    ], {qos: 0}, (err) => {
      if (!err) console.log("Successfully subscribed to MQTT broker.");
    });
  }).on('message', (topic, message) => {
    if (_.endsWith(topic, "access-points")) {
      let measurement = _.update(JSON.parse(message.toString('utf-8')), "clients", (clients) => _.sortBy(clients, (c) => c.vendor))
      this.appendMeasurement(measurement as LocationMeasurement);
    } else if (_.endsWith(topic, "events")) {
      this.appendEvent(JSON.parse(message.toString('utf-8')) as Event)
    } else {
      throw new Error(`Unsupported topic ${topic}`);
    }
  })

  created() {
    console.log("Starting connection to MQTT WebSocket...")
  }

  get accessPoints(): any[] {
    const toAccessPoint = (measurement: LocationMeasurement): AccessPoint => (measurement as AccessPoint);

    const mergeAccessPoints = (current: AccessPoint, newAccessPoint: AccessPoint) => {
      (newAccessPoint as any)['updates'] = ((current as any)['updates'] || 0) + 1;
      newAccessPoint.clients = _.uniqBy(current.clients.concat(newAccessPoint.clients), (ap) => ap.mac)
      return _.merge(current, newAccessPoint)
    }

    const reducer = (acc: AccessPoint[], measurement: LocationMeasurement) => {
      const i = _.findIndex(acc, (ap) => ap.mac === measurement.mac)
      return i === -1 ? acc.concat(toAccessPoint(measurement)) :
          _.update(acc, `[${i}]`, (c: AccessPoint) => mergeAccessPoints(c, toAccessPoint(measurement)))
    };

    return _.sortBy(this.locationMeasurements.reduce(reducer, Array<LocationMeasurement>()),
        [(ap: AccessPoint) => ap.clients.length * -1, (ap: AccessPoint) => ap.mac]
    );
  }

  get freshEvents(): Event[] {
    return this.events;
  }

  renderEventData(data: any) {
    return _.filter(_.zip(Object.keys(data), Object.values(data)).map((pair) => ({
      key: pair[0], value: pair[1]
    })), (item) => !_.isEmpty(item.value))
  }
}
</script>

<style scoped lang="scss">
table {
  width: 100%;
}

table, tr, td, th {
  vertical-align: top;
  padding: 0;
  margin: 0;
  border: none;
  border-collapse: collapse;
  border-spacing: 0;
}

.detail {
  color: #666;
}

table {
  td, th {
    padding: 5px;
    padding-right: 10px;
    border-bottom: 1px solid #eeeeee;

    p {
      padding: 0;
      margin: 0;
    }
  }

  thead td, thead th {
    border-bottom: 2px solid #EEEEEE;
  }
}


ul, li {
  list-style: none;
  margin: 0;
  padding: 0;
}

.ap {
  &.ap-row {
    td, th {
      // height: 100px;
    }
  }
}

.clients {
  li.client {
    display: inline-block;
    margin-right: 10px;
  }
}

.tools {
  display: block;
  margin-top: 30px;
  margin-bottom: 5px;
  line-height: 26px;
  height: 25px;

  a {
    background-color: #f2f2f2;
    border: 1px solid #E2E2E2;
    padding: 10px;
    border-radius: 4px;
    margin-right: 10px;
  }


}

.tabs {
  border-bottom: 1px solid #E2E2E2;

  a {
    border-bottom: 0;
    padding-bottom: 5px;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;

    &.active {
      background-color: white;
    }
  }

}

.tabs-container {
  .tab {
    padding: 5px
  }
}
</style>
