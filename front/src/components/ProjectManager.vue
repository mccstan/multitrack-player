<template>
  <v-container>
    <v-select
      v-model="selectedProject"
      :items="projectNames"
      label="Select a project"
      @change="fetchProjectFiles"
    ></v-select>

    <v-list>
      <v-list-item
        v-for="(file, index) in projectFiles"
        :key="index"
      >
        <v-list-item-content>
          <v-list-item-title>{{ file.name }}</v-list-item-title>
        </v-list-item-content>
        <v-list-item-action>
          <v-btn :href="file.url" target="_blank" icon>
            <v-icon>mdi-download</v-icon>
          </v-btn>
        </v-list-item-action>
      </v-list-item>
    </v-list>
  </v-container>
</template>

<script>

export default {
  data() {
    return {
      projectNames: [],
      selectedProject: null,
      projectFiles: [],
    };
  },
  mounted() {
    this.fetchProjects();
  },
  methods: {
    async fetchProjects() {
      try {
        const host = process.env.VUE_APP_API_HOST;
        const response = await this.$axios.get(`${host}/api/list-projects`);
        this.projectNames = response.data;
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    },
    async fetchProjectFiles(projectName) {
      try {
        const host = process.env.VUE_APP_API_HOST;
        const response = await this.$axios.get(
          `${host}/api/list-project-files/${encodeURIComponent(projectName)}`
        );
        this.projectFiles = response.data;
      } catch (error) {
        console.error('Error fetching project files:', error);
      }
    }
  }
};
</script>
