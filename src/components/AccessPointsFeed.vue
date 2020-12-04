<template>
  <div>
    <div v-if="measurements.length !== 0">
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
        <tr v-for="(lm, index) in measurements" v-bind:key="lm.mac + lm.collected_at + index">
          <td><span v-rainbow="{from: lm.location}">{{ lm.location }}</span></td>
          <td>{{ lm.client_id }}</td>
          <td>
            <div v-if="lm.vendor">{{ lm.vendor }}</div>
            <div class="detail">
              {{ lm.collected_at }} / {{ lm.agent_version }}
            </div>
          </td>
          <td>
            <div>
              <span v-rainbow="{from: lm.hostname || lm.mac}">{{ lm.hostname || lm.mac }}</span>
              <div class="detail">
                {{ lm.authentication }}
                <span v-if="lm.channel">/ {{ lm.channel }} </span>
                <span v-if="lm.frequency">/ {{ lm.frequency }} </span>
              </div>
            </div>
          </td>
          <td>
            <Clients :clients="lm.clients" />
          </td>
        </tr>
        </tbody>
      </table>

    </div>
    <div v-if="measurements.length === 0">
      <p>Waiting for data,...</p>
    </div>
  </div>
</template>

<script lang="ts">

import {Component, Prop, Vue} from "vue-property-decorator";
import {LocationMeasurement} from "@/components/Models";
import {RainbowDirective} from "@/components/RainbowDirective";
import Clients from "@/components/Clients.vue";

@Component({
  components: {Clients},
  directives: {'rainbow': RainbowDirective}
})
export default class AccessPointsFeed extends Vue {
  @Prop({type: Array, required: true, default: []})
  readonly liveMeasurements!: LocationMeasurement[]

  get measurements(): LocationMeasurement[] {
    return this.liveMeasurements;
  }
}
</script>

<style scoped lang="scss">
</style>