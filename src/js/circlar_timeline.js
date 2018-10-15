/**
 *  @author Hong Zhang hong.x1.zhang@kp.org
 *  KP Circlar_timeline element for KP homepage
 *  Genarate HTML look like this.
<div class="circlar_timeline">
  <div class="inactive_circlar"></div>
  <span class="progress-dot played"></span>
  <span class="progress-dot active"></span>
  <span class="progress-dot"></span>
  <span class="progress-dot"></span>
</div>
*/
document.onreadystatechange = function () {
  if (document.readyState == "interactive") {
    circlar_timeline.init();
  }
}

var circlar_timeline = {
  progress_dots : [],
  current_dot: 0,
  init: function () {
    var sections = document.getElementsByTagName("section")
    var sl = sections.length;
    var container = document.getElementsByClassName("circlar_timeline")[0];
    var inactive_c = document.createElement("div");
    inactive_c.classList.add("inactive_circlar");
    var active_mask = document.createElement("div");
    active_mask.classList.add("active_mask");
    var active_c = document.createElement("div");
    active_c.classList.add("active_circlar");

    for (var i = 1; i < sl; i++) {
      var progress_dot = document.createElement("div");
      progress_dot.classList.add("progress-dot");
      var alpha = Math.acos(143 / 182) + 0.25;
      progress_dot.style.bottom = -6 + 182 + 182 * Math.cos((Math.PI - 2 * alpha) * i / sl + alpha) + "px";
      progress_dot.style.right = -6 - 143 + 182 * Math.sin((Math.PI - 2 * alpha) * i / sl + alpha) + "px";
      this.progress_dots.push(progress_dot);
      container.appendChild(progress_dot);
    }
    container.appendChild(inactive_c);
    active_mask.appendChild(active_c);

    active_mask.style.height=42+"px";
    active_mask.style.width=39+"px";
    active_mask.style.bottom=284-33+"px"
    container.appendChild(active_mask);

  }
}
