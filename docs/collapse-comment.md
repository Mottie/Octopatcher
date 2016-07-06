Adds a header that can toggle long code and quote blocks in issue comments

* The block header:
  * Allows the toggling of the long code & quote block, based on a set number of minimum lines.
  * Includes the code language based on the syntax highlighting class name; if highlighting is not applied, "Block" is used as the header name.
  * Includes the number of lines within the block.
* Click the header to toggle the view of the content immediately below the header.
* Use <kbd>Shift</kbd> + Click to toggle the view of all blocks *within the same issue comment*.
* This portion of the Chrome extension was originally written as a [userscript](https://github.com/Mottie/GitHub-userscripts/wiki/GitHub-collapse-in-comment).

## Settings

![content-collapse](https://cloud.githubusercontent.com/assets/136959/16566472/66091342-41da-11e6-854d-d4023c80071a.png)

* "Enabled" - Check to enable (default) the content collapse script.
* "Initial State" - Set to "Collapsed" (default) to have the blocks initially collapsed, or "Expanded" to keep the blocks expanded.
* "Min Lines" - Set the minimum number of lines (`10` by default) that needs to be within a block before a header is added.

## Screenshot

![github-collapse-in-comment](https://cloud.githubusercontent.com/assets/136959/16365968/71ebeeac-3bd4-11e6-970f-b7616347e440.gif)
