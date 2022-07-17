/**
 * Demonstration for terminal style text area
 */
(function () {
	const Preferences = $gmedit["ui.Preferences"];
	const FileWrap = $gmedit["electron.FileWrap"];

	var terminalContainer, sizer, splitter, editor, session;

	function forceUpdate() {
		var e = new CustomEvent("resize");
		e.initEvent("resize");
		window.dispatchEvent(e);
	}

	function toggleTerminal() {
		if (terminalContainer) {
			terminalContainer.style.display == "none" ? show(aceEditor.session.gmlFile) : hide();
			splitter.syncMain();
			forceUpdate();
		} else {
			console.error("Could not find resource terminalContainer");
		}
	}

	function show(file) {
		if (!file.codeEditor) return;
		terminalContainer.style.display = "";
		sizer.style.display = "";

		session = GMEdit.aceTools.cloneSession(file.codeEditor.session);
		editor.setSession(session);
	}

	function hide() {
		terminalContainer.style.display = "none";
		sizer.style.display = "none";
	}

	function init() {
		prepareHtml();

		// Default to hidden
		// hide();

		AceCommands.add({
			name: "toggleTerminal",
			bindKey: "Ctrl-`",
			exec: function (editor) {
				toggleTerminal();
				var currPrefs = FileWrap.readConfigSync("config", Preferences.path);
				if (currPrefs) {
					var currTRT = currPrefs.toggleTerminal;
					if (currTRT == null) currTRT = currPrefs.toggleTerminal = {};
					FileWrap.writeConfigSync("config", Preferences.path, currPrefs);
				}
			}
		});

		AceCommands.addToPalette({
			name: "Toggle Output Terminal",
			exec: "toggleTerminal"
		});

		GMEdit.on("preferencesBuilt", function (e) {
			var out = e.target.querySelector('.plugin-settings[for="output-terminal"]');
			var currTRT = Preferences.current.toggleTerminal;
			// moveHamburger = opt(currTRT, "moveHamburger", true);

			// TODO: Might not need any options for this plugin. 
			// Preferences.addCheckbox(out, "Show hamburger when resource tree is closed", opt(currTRT, "moveHamburger", true), function (val) {
			// 	var currTRT = prepareTRT();
			// 	showFuncArgs = currTRT.moveHamburger = val;
			// 	Preferences.save();
			// 	updateHamburgerLocation();
			// });
		});
	}

	function prepareHtml() {
		terminalContainer = document.createElement("div");
		terminalContainer.classList.add("ace_container");

		sizer = document.createElement("div");
		var editorId = "terminal";
		sizer.setAttribute("splitter-element", "#" + editorId);
		sizer.setAttribute("splitter-lskey", "aside_height");
		sizer.setAttribute("splitter-default-height", aceEditor.container.clientHeight / 4);
		sizer.classList.add("splitter-td-ext");

		let nextCont = document.createElement("div");
		nextCont.classList.add("ace_container");
		let mainCont = aceEditor.container.parentElement;
		var mainChildren = [];
		for (let el of mainCont.children) mainChildren.push(el);
		for (let ch of mainChildren) {
			mainCont.removeChild(ch);
			nextCont.append(ch);
		}
		mainCont.style.setProperty("flex-direction", "column");
		mainCont.append(nextCont);
		mainCont.append(sizer);
		mainCont.append(terminalContainer);
		parent = mainCont;

		var textarea = document.createElement("textarea");
		terminalContainer.appendChild(textarea);
		editor = GMEdit.aceTools.createEditor(textarea);

		terminalContainer.id = editorId;
		splitter = new GMEdit_Splitter_ext(sizer, GMEditSplitterDirection.Height);
	}

	GMEdit.register("terminal", {
		init: init
	});
})();
