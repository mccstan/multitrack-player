<template>
  <v-container>

    <v-overlay :value="isLoading">
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </v-overlay>

    <!-- Project Selection Dropdown -->
    <v-select
      v-model="selectedProject"
      :items="projectNames"
      label="Select a project"
      @change="fetchAndLoadProjectTracks"
      clearable
      return-object
      item-text="name"
      item-value="name"
    ></v-select>

    <!-- Local File Input -->
    <VFileInput
      label="Or upload tracks"
      @change="addTracks"
      :value="files"
      multiple
      placeholder="Add audio files"
      accept="audio/*"
    />

    <!-- Display Loaded Tracks -->
    <Track
      v-for="(track, index) in $store.state.tracks"
      :track="track"
      :number="index + 1"
      :key="track.id"
    />
  </v-container>
</template>

<script>
import Track from './Track';

export default {
  components: {
    Track,
  },
  data() {
    return {
      files: [],
      projectNames: [],
      selectedProject: null,
      isLoading: false
    };
  },
  mounted() {
    this.fetchProjects();
  },
  methods: {
    async fetchProjects() {
      try {
        const response = await this.$axios.get(`/api/list-projects`);
        this.projectNames = response.data.map((projectName) => ({ name: projectName }));
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    },
    async fetchAndLoadProjectTracks() {
      if (!this.selectedProject) return;
      this.isLoading = true; // Start loading

      try {
        const response = await this.$axios.get(
          `/api/list-project-files/${encodeURIComponent(
            this.selectedProject.name
          )}`
        );
        // Create an array of promises for each file loading action
        const loadPromises = response.data.map(
          file => this.loadTrack(file.name, file.url) // Assuming `loadTrack` returns a Promise
        );

        // Wait for all tracks to be loaded before hiding the loader
        await Promise.all(loadPromises);
      } catch (error) {
        console.error('Error fetching project files:', error);
      } finally {
        this.isLoading = false; // End loading
      }
    },

    // Example loadTrack method that returns a Promise
    loadTrack(name, url) {
      return new Promise((resolve, reject) => {
        // Simulate track loading with a fetch, decode, or any async operation
        this.$store.dispatch('addTrack', { name, url })
          .then(resolve) // Resolve the promise when the track is loaded
          .catch(reject); // Reject the promise on error
      });
    },

    addTracks(files) {
      if (!files.length) return;
      files.forEach((file) => {
        const name = file.name.substring(0, file.name.lastIndexOf('.'));
        const fileReader = new FileReader();
        fileReader.readAsArrayBuffer(file);
        fileReader.addEventListener('load', () => {
          this.$store.dispatch('addTrack', {
            name,
            arrayBuffer: fileReader.result
          });
        });
      });
      this.files = [];
    },
  },
};
</script>
