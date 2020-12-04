<template>
  <a title="Toggle live or pause" v-on:click="toggleLive()" :class="{live: isLive, paused: !isLive}">
    <div v-if="isLive"><span class="material-icons">pause</span></div>
    <div v-if="!isLive">️<span class="material-icons">play_circle_filled</span></div>
  </a>
</template>

<script lang="ts">

import {Component, Vue} from "vue-property-decorator";

@Component({
  name: 'LiveToggle'
})
export default class LiveToggleComponents extends Vue {
  private live = true;

  get isLive() {
    return this.live;
  }

  toggleLive() {
    this.live = !this.live;
    this.$emit(this.live ? 'live' : 'pause', [this.live]);
  }
}
</script>

<style scoped lang="scss">
a {
  display: inline-block;
  float: right;
  font-family: 'Share Tech Mono', monospace;
  font-size: 10pt;
}


@keyframes blink {
  0% { text-shadow: 1px 1px 5px darkred; }
  50% { text-shadow: none; }
  100% { text-shadow: 1px 1px 5px darkred; }
}

@-webkit-keyframes blink {
  0% { text-shadow: 1px 1px 5px darkred; }
  50% { text-shadow: 0 0 0; }
  100% { text-shadow: 1px 1px 5px darkred; }
}

a {
  cursor: pointer;

  &.paused {
    color: darkred;

    -webkit-animation: blink 2.0s linear infinite;
    -moz-animation: blink 2.0s linear infinite;
    -o-animation: blink 2.0s linear infinite;
    animation: blink 2.0s linear infinite;
  }
}
</style>