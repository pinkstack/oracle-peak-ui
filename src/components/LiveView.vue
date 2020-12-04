<template>
  <div>
    <h2>Live View

      <LiveToggle v-on:live="live = true" v-on:pause="live = false"/>
    </h2>

    <div class="tools tabs">
      <a v-on:click="activeTab='feed'" :class="{active: activeTab==='feed'}">Access Points Feed</a>
      <a v-on:click="activeTab='list'" :class="{active: activeTab==='list'}">Current View</a>
      <a v-on:click="activeTab='events'" :class="{active: activeTab==='events'}">Events</a>
    </div>

    <div class="tabs-container">
      <AccessPointsFeed :live-measurements="liveMeasurements" v-if="activeTab === 'feed'" class="tab"/>
      <AccessPointsList :live-measurements="liveMeasurements" v-if="activeTab === 'list'" class="tab"/>
      <AccessPointsEvents :live-events="liveEvents" v-if="activeTab === 'events'" class="tab"/>
    </div>
  </div>
</template>

<script lang="ts">
import * as _ from "lodash";
import {Vue} from 'vue-property-decorator';
import Component from 'vue-class-component';
import {connect, IClientSubscribeOptions, MqttClient} from 'mqtt';
import {Event, LocationMeasurement} from "@/components/Models";
import {Config} from "@/components/Config";
import AccessPointsFeed from "@/components/AccessPointsFeed.vue";
import AccessPointsList from "@/components/AccessPointsList.vue";
import AccessPointsEvents from "@/components/AccessPointsEvents.vue";
import LiveToggle from "@/components/LiveToggle.vue";
import {ClientSubscribeCallback} from "mqtt/types/lib/client";

@Component({
  components: {LiveToggle, AccessPointsEvents, AccessPointsList, AccessPointsFeed},
})
export default class LiveView extends Vue {
  private locationMeasurements = new Array<LocationMeasurement>();
  private rawEvents = new Array<Event>();
  live = true;
  activeTab: string = Config.DEFAULT_LIVE_VIEW_TAB;

  private appendMeasurement(measurement: LocationMeasurement): void {
    if (this.live)
      this.locationMeasurements = this.locationMeasurements
          .concat(_.update(measurement, "clients",
              (clients) => _.sortBy(clients, (c) => c.vendor)))
          .slice(Config.MAX_MEASUREMENTS_SIZE * -1);
  }

  private appendEvent(event: Event): void {
    if (this.live) {
      this.rawEvents.unshift(event)
      this.rawEvents = this.rawEvents.slice(0, Config.MAX_EVENTS_SIZE);
    }
  }

  connectClient = (brokerUrl: string, options: IClientSubscribeOptions, transformations: any[]): MqttClient => {
    const errorHandler: ClientSubscribeCallback = (err: Error) => {
      if (!err) console.log("Successfully subscribed to MQTT broker.")
      else console.error(err);
    }

    const messageHandler = (topic: string, rawMessage: Buffer) => {
      const message: object = JSON.parse(rawMessage.toString('utf-8')) as object
      transformations.map(t => t.slice(1)).forEach((pair) => {
        if (_.endsWith(topic, pair[0])) pair[1](message)
      })
    }

    return connect(brokerUrl, {})
        .on('message', messageHandler)
        .on('error', errorHandler)
        .subscribe((transformations.map(t => _.first<string>(t))) as string[], options, errorHandler)
  }

  created() {
    console.log("Starting connection to MQTT WebSocket...")

    this.connectClient(
        Config.MQTT_BROKER_URL,
        {qos: 0},
        [
          ["oracle-peak-staging/+/+/access-points", "access-points", (message: any): void =>
              this.appendMeasurement(message as LocationMeasurement)
          ],
          ["oracle-peak-staging/+/+/events", "events", (message: any): void =>
              this.appendEvent(message as Event)
          ]
        ])
  }

  get liveMeasurements(): LocationMeasurement[] {
    return this.locationMeasurements;
  }

  get liveEvents(): Event[] {
    return this.rawEvents;
  }
}
</script>

<style lang="scss">
@import "LiveView";
</style>
