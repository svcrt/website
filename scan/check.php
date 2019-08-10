<?php
	function refreshMembers() {
		global $json;

		// Load installed composer libaries
		require __DIR__ . '/vendor/autoload.php';

		// Start the google client
		$client = new \Google_Client();
		$client->setApplicationName("Scanner");
		$client->setScopes([\Google_Service_Sheets::SPREADSHEETS]);
		$client->setAccessType("offline");

		// Authorise using the auth.json file
		$client->setAuthConfig(__DIR__ . "/auth.json");

		// Get the google sheets api
		$sheets = new \Google_Service_Sheets($client);

		// Get the right rows from the right sheet
		$spreadsheetId = "1GsPPLAvHhXa3F2N1zSQSz4v7u9DdoVf8DLreqeNt-Fs";
		$range = "A2:C";
		$rows = $sheets->spreadsheets_values->get($spreadsheetId, $range, ["majorDimension" => "ROWS"]);

		$members = [];

		foreach ($rows["values"] as $row) {
			array_push($members, [
				"code" => $row[0],
				"name" => substr($row[1], 0, 1) . " " . $row[2]
			]);
		}

		$json = [
			"time" => time(),
			"members" => $members
		];

		file_put_contents(__DIR__ . "/cache.json", json_encode($json));
	}

	$json = [];

	if (!file_exists(__DIR__ . "/cache.json")) {
		touch(__DIR__ . "/cache.json");
		refreshMembers();
	}

	try {
		$json = json_decode(file_get_contents(__DIR__ . "/cache.json"), true);
	}
	catch (Exception $err) {
		refreshMembers();
	}

	if ($json["time"] + 4 < time()) {
		refreshMembers();
	}
	else {
		// Slow down requests to slow down brute force
		sleep(1);
	}

	$found = false;

	foreach ($json["members"] as $member) {
		if ($member["code"] == $_GET["code"]) {
			$found = $member;
			break;
		}
	}

	header("Content-Type: application/json");

	if ($found === false) {
		print(json_encode([
			"member" => false
		]));
	}
	else {
		print(json_encode([
			"member" => true,
			"name" => $found["name"]
		]));
	}

?>
