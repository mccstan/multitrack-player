<template>
  <v-container>
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
      try {
        const response = await this.$axios.get(
          `/api/list-project-files/${encodeURIComponent(this.selectedProject.name)}`
        );
        response.data.forEach((file) => {
          // Assuming file.url is directly usable or you convert it to ArrayBuffer if necessary
          this.$store.dispatch('addTrack', {
            name: file.name,
            url: file.url, // Adjust based on how your store expects to receive the track data
          });
        });
      } catch (error) {
        console.error('Error fetching project files:', error);
      }
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
            arrayBuffer: fileReader.result,
          });
        });
      });
      this.files = [];
    },
  },
};
</script>
