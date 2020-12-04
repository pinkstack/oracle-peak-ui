<template>
  <div>
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
            <div v-rainbow="{from: ap.hostname || ap.mac}">{{ ap.hostname }}</div>
            <div>{{ ap.mac }}</div>
            <div v-if="ap.vendor">{{ ap.vendor }}</div>
            <div class="detail">
              <div>{{ ap.rssi }} / {{ ap.cipher }} / {{ ap.authentication }}, {{ ap.location }}</div>
              <div>{{ ap['updates'] }}</div>
            </div>
          </td>
          <td>
            <Clients :clients="ap.clients"/>
          </td>
        </tr>
        </tbody>

      </table>
    </div>

    <div v-if="accessPoints.length === 0">
      <p>Waiting for the data,...</p>
    </div>
  </div>
</template>

<script lang="ts">
import {Component, Prop, Vue} from "vue-property-decorator";
import {AccessPoint, LocationMeasurement} from "@/components/Models";
import {RainbowDirective} from "@/components/RainbowDirective";
import * as _ from "lodash";
import Clients from "@/components/Clients.vue";

@Component({
  components: {Clients},
  directives: {'rainbow': RainbowDirective}
})
export default class AccessPointsList extends Vue {
  @Prop({type: Array, required: true, default: []})
  readonly liveMeasurements!: LocationMeasurement[]

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

    return _.sortBy(this.liveMeasurements.reduce(reducer, Array<LocationMeasurement>()),
        [(ap: AccessPoint) => ap.clients.length * -1, (ap: AccessPoint) => ap.mac]
    );
  }
}
</script>

<style scoped>

</style>