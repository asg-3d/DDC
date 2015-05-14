(function() {
	var u = "undefined" != typeof chrome ? chrome.extension.getBackgroundPage() : opera.extension.bgProcess,
		b = 0,
		l = document.getElementById("playButton"),
		k = document.getElementById("sounds"),
		r = document.getElementById("urls"),
		c = new Audio,
		n = document.getElementById("volumeCombobox"),
		s = chrome.runtime.getManifest(),
		j = s.name + ' v'+s.version;
		g = function(c) {
			return document.getElementById("neonlight" + c);
		},
		w = function() {
			if (0 == b) {
				for (m = 0;21 > m;m++) {
					g(m).style.color = "white";
				}
			}
			g(b).style.color = "#E7AA11";
			0 < b && (g(b - 1).style.color = "#F5D681");
			5 < b && (g(b - 1 - 5).style.color = "white");
			20 > b ? b++ : (b = 0, clearInterval(flashing), setTimeout(p, 0));
		},
		p = function() {
			flashing = setInterval(w, 20);
		},
		t = function() {
			window.close();
			return!1;
		};
	document.addEventListener("DOMContentLoaded", function() {
		document.title = j;
		var q = function (a) {
				a ? c.paused ? (c.volume = n.value, c.pause(), c.src = k.value, l.className = "forminput play", c.play()) : (c.pause(), c.currentTime = 0, l.className = "forminput stop") : (c.volume = n.value, c.pause(), c.src = k.value, l.className = "forminput play", c.play());
			},
			b = localStorage.refresh_interval;
		if (b) {
				for (var f = document.getElementById("interval"), a = 0;a < f.children.length;a++) {
					var d = f.children[a];
					if (d.value == b) {
						d.selected = "true";
					break;
				}
			}
			var e = document.getElementById("audio_checkbox"),
				g = document.getElementById("tab_checkbox"),
				d = void 0 != localStorage.sounVolume ? Number(localStorage.sounVolume) : .5,
				f = void 0 != localStorage.refresh_sound_file ? localStorage.refresh_sound_file : "assets/click.ogg",
				b = "undefined" != localStorage.url_forum ? localStorage.url_forum : "http://demiart.ru/forum/index.php",
				h = document.getElementById("menu_context"),
				fi = document.getElementById("favicon"),
				a = 0;
			e.checked = "true" == localStorage.audioOn ? !0 : !1;
			g.checked = "true" == localStorage.viewtab ? !0 : !1;
			h.checked = "true" == localStorage.showContext ? !0 : !1;
			fi.checked = "true" == localStorage.favicon ? !0 : !1;
			while(a<1) {
				a += .05,
				a = Number(a.toFixed(3)),
				e = document.createElement("option"),
				e.value = a,
				e.innerHTML = Math.round(100 * a) + "%",
				n.appendChild(e),
				e.value == d && (e.selected = "true");
			}
			for (a = 0;a < soundList.length;++a) {
				d = document.createElement("option"), d.value = soundList[a].value, d.innerHTML = soundList[a].name, k.appendChild(d), d.value === f && (d.selected = "true");
			}
			for (a = 0;a < urlList.length;++a) {
				f = document.createElement("optgroup");
				d = urlList[a];
				f.label = d.optiongroup;
				for (e = 0;e < d.options.length;++e) {
					g = d.options[e], h = document.createElement("option"), h.value = g.value, h.innerHTML = g.name, f.appendChild(h), h.value == b && (h.selected = "true");
				}
				r.appendChild(f);
			}
			document.querySelector("#sounds").addEventListener("change", function() {
				q(!1);
			});
			document.querySelector("#playButton").addEventListener("click", function() {
			q(!0);
			});
			document.querySelector("#volumeCombobox").addEventListener("change", function() {
				q(!1);
			});
			document.getElementById("year").innerHTML = " \u2012 " + (void 0 != localStorage.refresh_date ? localStorage.refresh_date : (new Date).getFullYear());
			document.getElementById("nameext").innerText = j;
		}
	});
	document.querySelector("#save").addEventListener("click", function() {
		var b = document.getElementById("interval"),
		c = document.getElementById("audio_checkbox"),
		f = document.getElementById("tab_checkbox"),
		a = document.getElementById("menu_context"),
		fi = document.getElementById("favicon"),
		d = b.children[b.selectedIndex].value,
		b = b.children[b.selectedIndex].innerText,
		e = r.value;
		localStorage.favicon = fi.checked;
		localStorage.refresh_sound_file = k.children[k.selectedIndex].value;
		localStorage.refresh_interval = d;
		localStorage.refresh_interval_text = b;
		localStorage.url_forum = e;
		localStorage.audioOn = c.checked;
		localStorage.viewtab = f.checked;
		localStorage.showContext = a.checked;
		localStorage.sounVolume = n.value;
		document.getElementById("options").style.display = "none";
		document.getElementById("flashing").style.display = "block";
		p();
		setTimeout(t, 2500);
		u.resetOptions();
	});
	document.querySelector("#closed").addEventListener("click", t);
	c.addEventListener("ended", function() {
		l.className = "forminput stop";
	});
	document.oncontextmenu = function() {
		//return!1;
	};
	$(document).ready(function(){
		$('.help').click(function(){
			if($(this).hasClass('active')){
				$(this).removeClass('active').text('HELP');
				$('div.options').show();
				$('div.helpoptions').hide();
			}else{
				$(this).addClass('active').text('OPTIONS');
				$('div.options').hide();
				$('div.helpoptions').show();
			}
		})
	})
})();