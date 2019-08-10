var ignoreResults = false

Quagga.init({
	inputStream: {
		name: "Live",
		type: "LiveStream",
		target: document.getElementById("camContainer"),
		constraints: {
			width: 1000,
			height: 1800,
		}
	},
	locate: false,
	frequency: 80,
	decoder: {
		readers: ["code_39_reader"]
	},
}, function(err) {
	if (err) {
		console.log(err);
		return
	}
	console.log("Initialization finished. Ready to start");
	Quagga.start()
})

Quagga.onDetected(function(resp) {
	console.log(">", resp)
	var code = resp.codeResult.code

	if (!code.match(/^\d{7}$/g)) return

	if (ignoreResults) return
	ignoreResults = true

	document.getElementById("camHint").style.display = "none"

	document.getElementById("result").classList.add("show")
	document.getElementById("resultNum").innerHTML = code
	document.getElementById("resultName").innerHTML = "????"
	document.getElementById("resultIcon").className = "fa fa-refresh fa-spin fa-3x fa-fw"
	document.getElementById("resultText").innerHTML = "Laden..."

	var xhr = new XMLHttpRequest()

	xhr.open("GET", "./check.php?code=" + code, true)
	xhr.responseType = "json"

	xhr.onload = function() {
		var status = xhr.status;

		if (status === 200) {
			if (xhr.response.member) {
				document.getElementById("result").classList.add("good")
				document.getElementById("resultIcon").className = "fa fa-check fa-3x fa-fw"
				document.getElementById("resultText").innerHTML = "CRT Lid"
				document.getElementById("resultName").innerHTML = xhr.response.name
			}
			else {
				document.getElementById("result").classList.add("bad")
				document.getElementById("resultIcon").className = "fa fa-exclamation-triangle fa-3x fa-fw"
				document.getElementById("resultText").innerHTML = "GEEN Lid"

			}
			console.log(xhr.response)
		}
		else {
			document.getElementById("result").classList.remove("show")
		}
	}

	xhr.send()
})

document.getElementById("resultClose").addEventListener("click", function() {
	ignoreResults = false
	document.getElementById("camHint").style.display = "block"
	document.getElementById("result").className = ""
})
