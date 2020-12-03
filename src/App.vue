<template>
  <div id="app">
    <div class="title-bar">Pinkstack / The Oracle Peak 🏔</div>
    <div class="content">
      <AccessPoints/>
    </div>
  </div>
</template>

<script lang="ts">
import {Component, Vue} from 'vue-property-decorator';
import AccessPoints from './components/AccessPoints.vue';

@Component({
  components: {AccessPoints},
})
export default class App extends Vue {
}
</script>

<style lang="scss">
html, body {
  margin: 0;
  padding: 0;
}

#app {
  // font-family: sans-serif;
  font-family: 'Share Tech Mono', monospace;
  color: #2c3e50;
  font-size: 11pt;
}

#app .title-bar {
  background-color: #a92a4b;
  color: #52d2b1;
  line-height: 20px;
  padding: 10px;
  font-family: 'Major Mono Display', monospace;
  font-weight: bold;
}

#app .content {
  padding: 20px;
  padding-top: 0px;
}

h1, h2, h3, th {
  font-family: 'Major Mono Display', monospace;
}

.as-title {
  font-family: 'Major Mono Display', monospace;
}

h2 .quick-tool {
  display: inline-block;
  float: right;
  font-family: 'Share Tech Mono', monospace;
  font-size: 10pt;

  a {
    cursor: pointer;

    &.paused {
      color: darkred;
    }
  }
}
</style>
