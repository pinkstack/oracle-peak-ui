<template>
  <div id="app">
    <div class="title-bar">
      The Oracle Peak 🏔

      <div class="more">
        <a href="https://github.com/pinkstack/oracle-peak" title="About the project" target="_blank">
          About the project <span class="material-icons">emoji_people</span> </a>
      </div>
    </div>
    <div class="content">
      <LiveView/>
    </div>
  </div>
</template>

<script lang="ts">
import {Component, Vue} from 'vue-property-decorator';
import LiveView from './components/LiveView.vue';

@Component({
  components: {LiveView},
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
  color: #FFF; // #52d2b1;
  line-height: 20px;
  font-size: 13pt;
  padding: 20px;
  font-family: 'Major Mono Display', monospace;
  font-weight: bold;

  .more {
    display: inline-block;
    float: right;
    line-height: 15px;
    font-size: 11pt;
    font-family: 'Share Tech Mono', monospace;

    a {
      color: white;
      text-decoration: none;
    }

    .material-icons {
      vertical-align: bottom;
    }
  }
}

#app .content {
  padding: 50px;
  padding-top: 0px;
}

h1, h2, h3, th {
  font-family: 'Major Mono Display', monospace;
}

.as-title {
  font-family: 'Major Mono Display', monospace;
}

@media (prefers-color-scheme: dark) {
  body {
    background-color: #232023;

    #app {
      color: #EEEEEE;
    }
  }

  .tabs {
    .tab {
      background-color: #333;
    }
  }
}
</style>
