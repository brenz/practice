/**
 *  @author Hong Zhang hong.x1.zhang@kp.org
 *  KP Circlar_timeline element for KP homepage
 *  Genarate HTML look like this.
 * Create html element like that
<div class="circlar_timeline">
  <div class="inactive_circlar"></div>
  <span class="progress-dot played"></span>
  <span class="progress-dot active"></span>
  <span class="progress-dot"></span>
  <span class="progress-dot"></span>
</div>
*/

var circlar_timeline = {
  progress_dots : [],
  current_dot: 0,
  container: Object,
  init: function () {
    var sections = document.querySelectorAll("section");
    var sl = sections.length;
    this.container = document.getElementsByClassName("circlar_timeline")[0];
    //this.container.classList.add("hide");
    this.container.style.opacity=0;
    var inactive_c = document.createElement("div");
    inactive_c.classList.add("inactive_circlar");
    var active_mask = document.createElement("div");
    active_mask.classList.add("active_mask");
    var active_c = document.createElement("div");
    active_c.classList.add("active_circlar");

    for (var i = 1; i < sl; i++) {
      var progress_dot = document.createElement("div");
      progress_dot.classList.add("progress-dot");
      progress_dot.setAttribute("tabindex", 0)
      var alpha = Math.acos(143 / 182) + 0.25;
      progress_dot.style.bottom = -6 + 182 + 182 * Math.cos((Math.PI - 2 * alpha) * i / sl + alpha) + "px";
      progress_dot.style.right = -6 - 143 + 182 * Math.sin((Math.PI - 2 * alpha) * i / sl + alpha) + "px";
      this.progress_dots.push(progress_dot);
      this.container.appendChild(progress_dot);
      progress_dot.setAttribute("dot_num", i);
      progress_dot.addEventListener("click",this.clickHandler);
    }
    this.container.appendChild(inactive_c);
    active_mask.appendChild(active_c);

    active_mask.style.height=42+"px";
    active_mask.style.width=39+"px";
    active_mask.style.bottom=284-33+"px"
    this.container.appendChild(active_mask);
  },
  clickHandler:function(e){
    //console.log(e.target.attributes["dot_num"].value);
    var next_section=Number(e.target.attributes["dot_num"].value);
    if (current_section != next_section){
      sectionMovingAnim(current_section,next_section);
    }
  },
  setDot:function(num){
    console.log("Set this dot to active"+num);
    for (var i=0;i<this.progress_dots.length;i++){
      this.progress_dots[i].classList.remove("active");
      this.progress_dots[i].classList.remove("played");
    }
    this.progress_dots[num].classList.add("active");
    this.progress_dots[num].focus();
    for (var j=0;j<num;j++){
      this.progress_dots[j].classList.add("played");
    }
  },
 /* showDot:function(){
    this.container.classList.remove("hide");
  },
  hideDot:function(){
    this.container.classList.add("hide");
  },*/
  isShow: function(){
    return this.container.style.opacity;
  }
}
