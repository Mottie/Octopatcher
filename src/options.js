/* jshint esnext:true, unused:true */
/* global chrome */
let defaults = {
  cc_enabled : true,
  cc_minLines : 10,
  cc_state : "c",
  mc_enabled: true,
  mc_state: "e",
  mc_colors: ["#6778d0", "#ac9c3d", "#b94a73", "#56ae6c", "#9750a1", "#ba543d"]
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
  chrome.storage.sync.set({
    cc_enabled : $("cc_enabled").checked,
    cc_minLines : $("cc_min").value,
    cc_state : $("cc_state").value,
    mc_enabled: $("mc_enabled").checked,
    mc_state: $("mc_state").value,
    mc_colors: getColors()
  });
  return false;
}

function getOptions() {
  // Use default values
  chrome.storage.sync.get(defaults, settings => {
    $("cc_enabled").checked = settings.cc_enabled;
    $("cc_min").value = settings.cc_minLines;
    $("cc_state").value = settings.cc_state;
    $("mc_enabled").checked = settings.mc_enabled;
    $("mc_state").value = settings.mc_state;
    setColors(settings.mc_colors);
  });
}

function resetOptions() {
  chrome.storage.sync.set(defaults);
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
