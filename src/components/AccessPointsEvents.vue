<template>
  <div>
    <div v-if="events.length !== 0">
      <table>
        <thead>
        <tr>
          <th style="width: 20%">Meta</th>
          <th>Event Data</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="event in events" v-bind:key="event.key">
          <td>
            <div v-rainbow="{from: event.tag}">{{ event.tag }}</div>
            <div v-rainbow="{from: event.location}">{{ event.location }}</div>
            <div>{{ event.client_id }}</div>
            <div>{{ event.agent_version }}</div>
            <div>{{ event.collected_at }}</div>
          </td>
          <td>
            <ul v-for="(item, index) in renderEventData(event.data)" v-bind:key="item.key + index">
              <li>
                <strong>{{ item.key }}:</strong>
                <span v-if="!isObject(item.value)">
                      {{ item.value }}
                    </span>
                <div v-if="isObject(item.value)">
                  <ul v-for="(item_2, index_2) in renderEventData(item.value)"
                      v-bind:key="item_2.key + index_2 + 'level2'" style="margin-left: 40px; padding-left: 40px;">
                    <li>
                      <strong>{{ item_2.key }}:</strong>
                      {{ item_2.value }}
                    </li>
                  </ul>
                </div>
              </li>
            </ul>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
    <div v-if="events.length === 0">
      <p>Waiting for the data,...</p>
    </div>
  </div>
</template>

<script lang="ts">

import {Component, Vue, Prop} from "vue-property-decorator";
import {Event} from "@/components/Models";
import {RainbowDirective} from "@/components/RainbowDirective";
import * as _ from "lodash";

@Component({
  directives: {'rainbow': RainbowDirective}
})
export default class AccessPointsEvents extends Vue {
  @Prop({type: Array, required: true, default: []})
  readonly liveEvents!: Event[]

  get events() {
    return this.liveEvents;
  }

  renderEventData(data: any) {
    return _.filter(_.zip(Object.keys(data), Object.values(data)).map((pair) => ({
      key: pair[0], value: pair[1]
    })), (item) => !_.isEmpty(item.value))
  }

  isObject(what: any): boolean {
    return _.isObject(what)
  }
}
</script>

<style scoped>

</style>