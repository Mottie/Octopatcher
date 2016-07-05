/*global module :false*/
module.exports = function(grunt) {
  "use strict";

  var pkg = grunt.file.readJSON("package.json");
  grunt.file.defaultEncoding = "utf8";
  grunt.file.preserveBOM = false;

  // Project configuration.
  grunt.initConfig({
    pkg: pkg,

    clean: {
      src: ["octopatcher.zip"]
    },
    jshint: {
      options: {
        browser: true,
        undef: true,
        esnext: true
      },
      files: {
        src: ["src/**/*.js"]
      }
    },
    eslint: {
      target: ["src/*.js"]
    },
    compress: {
      main: {
        options: {
          archive: "octopatcher.zip",
        },
        files: [{
          expand : true,
          cwd: "src/",
          src: ["**"],
          dest: "",
          filter: "isFile"
        }]
      }
    }
  });

  grunt.loadNpmTasks("grunt-contrib-clean");
  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.loadNpmTasks("grunt-contrib-compress");
  grunt.loadNpmTasks("grunt-eslint");

  grunt.registerTask("default", ["clean", "jshint", "eslint", "compress"]);

};
