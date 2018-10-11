const imap = require('imap-simple');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"

//waitTime is optional
async function findEmail(email, password, searchCriteria, fetchOptions, waitTime) {

	const connection = await imap.connect({
		imap: {
			user: email,
			password: password,
			host: 'imap.gmail.com',
			port: 993,
			tls: true,
			authTimeout: 10000
		}
	});

	await connection.openBox("INBOX");

	let results = await connection.search(searchCriteria, fetchOptions);

	if (typeof waitTime !== undefined) {
		const start = Date.now();
		while (Date.now() - start < waitTime && results.length === 0) {
			results = await connection.search(searchCriteria, fetchOptions);
		}
	}

	const subjects = results.map(
		(res) => res.parts.filter(
			(part) => part.which === "HEADER")[0].body.subject[0]);


	connection.end();

	return subjects
}

//waitTime is optional
async function findEmailTo(email, password, to, waitTime) {
	const searchCriteria = [ ["TO", to], "UNSEEN" ];
	const fetchOptions = {
		bodies: ["HEADER", "TEXT"],
		markSeen: true
	}

	const res = await findEmail(email, password, searchCriteria, fetchOptions, waitTime);
	console.log("DEBUG: mail to: ", res);
	return res
}

//waitTime is optional
async function findEmailFrom(email, password, from, waitTime) {
	const searchCriteria = [ ["FROM", from], "UNSEEN" ];
	const fetchOptions = {
		bodies: ["HEADER", "TEXT"],
		markSeen: true
	}

	const res = await findEmail(email, password, searchCriteria, fetchOptions, waitTime);
	return res
}

function randomMailGenerator(email) {
	// añadimos el substring(2) para quitarle los decimales.
	const random = Math.random().toString(36).substring(2);
	var random_email = email + "+" + random + "@gmail.com";

	return random_email
}

module.exports = {findEmail, findEmailTo, findEmailFrom, randomMailGenerator};
