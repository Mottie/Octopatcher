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
      src: ["octopatcher.zip", "octopatcher.xpi"]
    },
    jshint: {
      options: {
        browser: true,
        undef: true,
        esnext: true
      },
      files: {
        src: ["src/*.js"]
      }
    },
    eslint: {
      target: ["src/*.js"]
    },
    compress: {
      chrome: {
        options: {
          archive: "octopatcher.zip",
        },
        files: [{
          expand : true,
          cwd: "src/",
          src: ["*", "images/*"],
          dest: "",
          filter: "isFile"
        }, {
          expand : true,
          cwd: "src/chrome",
          src: ["*"],
          dest: "",
          filter: "isFile"
        }]
      },
      firefox: {
        options: {
          archive: "octopatcher.xpi",
          mode: "zip"
        },
        files: [{
          expand : true,
          cwd: "src/",
          src: ["*", "images/*"],
          dest: "",
          filter: "isFile"
        }, {
          expand : true,
          cwd: "src/firefox",
          src: ["*"],
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

  // update chrome & firefox manifest.json file version numbers to match the package.json version
  grunt.registerTask("updateManifest", () => {
    let indx, file,
      manifests = ["src/chrome/manifest.json", "src/firefox/manifest.json"],
      len = manifests.length;
    for ( indx = 0; indx < len; indx++ ) {
      if (!grunt.file.exists(manifests[indx])) {
        grunt.log.error("file " + manifests[indx] + " not found");
        return true; // return false to abort the execution
      }
      file = grunt.file.readJSON(manifests[indx]);
      file.version = pkg.version;
      grunt.file.write(manifests[indx], JSON.stringify(file, null, 2)); // serialize it back to file
    }
  });

  grunt.registerTask("default", [
    "clean",
    "jshint",
    "eslint",
    "updateManifest",
    "compress:chrome",
    "compress:firefox"
  ]);
};
