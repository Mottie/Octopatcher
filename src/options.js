/* jshint esnext:true, unused:true */
/* global chrome */
const defaults = {
  // content collapse
  cc_enabled : true, // enabled
  cc_animated: true, // show animation
  cc_minLines : 10,  // min lines
  cc_state : "c",    // (c)ollapsed or (e)xpanded

  // markdown collapse
  mc_enabled: true,  // enabled
  mc_animated: true, // show animation
  mc_state: "e",     // (c)ollapsed or (e)xpanded
  mc_colors: [       // arrow colors
    "#6778d0",       // h1
    "#ac9c3d",       // h2
    "#b94a73",       // h3
    "#56ae6c",       // h4
    "#9750a1",       // h5
    "#ba543d"        // h6
  ]
};

function getColors() {
  let colors = [],
    indx = 0;
  while (indx < 6) {
    colors[indx] = $("mc_color" + indx).value || defaults.mc_colors[indx];
    indx++;
  }
  return colors;
}

function setColors(colors) {
  if (colors && colors.length) {
    let indx = 0;
    while (indx < 6) {
      $("mc_color" + indx).value = colors[indx] || defaults.mc_colors[indx];
      indx++;
    }
  }
}

function setOptions() {
  chrome.storage[chrome.storage.sync ? "sync" : "local"].set({
    cc_enabled : $("cc_enabled").checked,
    cc_animated : $("cc_animated").checked,
    cc_minLines : $("cc_min").value,
    cc_state : $("cc_state").value,
    mc_enabled: $("mc_enabled").checked,
    mc_animated : $("mc_animated").checked,
    mc_state: $("mc_state").value,
    mc_colors: getColors()
  });
  return false;
}

function getOptions() {
  // Use default values
  chrome.storage[chrome.storage.sync ? "sync" : "local"]
    .get(defaults, settings => {
      $("cc_enabled").checked = settings.cc_enabled;
      $("cc_animated").checked = settings.cc_animated;
      $("cc_min").value = settings.cc_minLines;
      $("cc_state").value = settings.cc_state;
      $("mc_enabled").checked = settings.mc_enabled;
      $("mc_animated").checked = settings.mc_animated;
      $("mc_state").value = settings.mc_state;
      setColors(settings.mc_colors);
    });
}

function resetOptions() {
  chrome.storage[chrome.storage.sync ? "sync" : "local"].set(defaults);
  getOptions();
}

document.addEventListener("DOMContentLoaded", () => {
  $("reset").addEventListener("click", resetOptions);
  document.body.addEventListener("change", setOptions);
  getOptions();
});

function $(selector, el) {
  return (el || document).getElementById(selector);
}
