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
      src: ["octopatcher.crx"]
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
    crx: {
      chrome: {
        options: {
          privateKey: "chrome.pem",
        },
        src: ["src/*", "src/**/*"],
        dest: "octopatcher.crx",
      }
    }
  });

  grunt.loadNpmTasks("grunt-contrib-clean");
  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.loadNpmTasks("grunt-crx");
  grunt.loadNpmTasks("grunt-eslint");

  grunt.registerTask("default", ["clean", "jshint", "eslint", "crx"]);

};
