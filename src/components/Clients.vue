<template>
  <div>
    <ul v-for="client in clientsList" v-bind:key="'cl' + client.mac">
      <li>
        <div v-rainbow="{from: client.hostname || client.vendor || client.mac}">{{ client.mac }}
          <span v-if="client.vendor"> - {{ client.vendor }}</span>
          <span class="detail">
                      <span v-if="client.authentication">{{ client.authentication }} /</span>
                      <span v-if="client.channel"> {{ client.channel }} /</span>
                      <span v-if="client.frequency"> {{ client.frequency }} </span>
        </span>
        </div>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">

import {Component, Prop, Vue} from "vue-property-decorator";
import {Client} from "@/components/Models";
import {RainbowDirective} from "@/components/RainbowDirective";

@Component({
  name: 'Clients',
  directives: {'rainbow': RainbowDirective}
})
export default class Clients extends Vue {
  @Prop({type: Array, required: true, default: []})
  readonly clients!: Client[]

  get clientsList(): Client[] {
    return this.clients;
  }
}
</script>

<style scoped>

</style>