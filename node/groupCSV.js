const fs = require('fs');
const parse = require('csv-parse');
const async = require('async');

const origin2Asylum = {};
const numberOfExpats = {};
const numberOfInpats = {};

if (process.argv.length < 3) {

	console.log("CSV file name required");

} else {

	let outputFile = "output.json";

	if (process.argv.length >= 4) {

		outputFile = process.argv[3];

	}

	fs.createReadStream(process.argv[2])
		.pipe(parse({delimiter: ';', from: 2}))
		.on("data", (row) => {

			const countryOfAsylum = row[0];
			const countryOfOrigin = row[1];
			let totalOfRefugees = parseInt(row[5]);

			if (row[5] === "")
				totalOfRefugees = parseInt(row[6]);

			let asylumList = [];
			let expats = 0;
			let inpats = 0;

			if (origin2Asylum.hasOwnProperty(countryOfOrigin)) {

				asylumList = origin2Asylum[countryOfOrigin];
				expats = numberOfExpats[countryOfOrigin];

			}

			if (numberOfInpats.hasOwnProperty(countryOfAsylum)) {

				inpats = numberOfInpats[countryOfAsylum];

			}

			asylumList.push({ countryOfAsylum, totalOfRefugees });
			expats += totalOfRefugees;
			inpats += totalOfRefugees;

			origin2Asylum[countryOfOrigin] = asylumList;
			numberOfExpats[countryOfOrigin] = expats;
			numberOfInpats[countryOfAsylum] = inpats;

		})
		.on("end", () => {

			console.log(`Writting file ${outputFile}`);
			fs.writeFileSync(outputFile, JSON.stringify({
				origin2Asylum,
				numberOfExpats,
				numberOfInpats
			}));

			let csvExpats = [];
			for (key in numberOfExpats) {

				csvExpats.push(`${key};${numberOfExpats[key]}`);

			}

			let csvInpats = [];
			for (key in numberOfInpats) {

				csvInpats.push(`${key};${numberOfInpats[key]}`);

			}

			fs.writeFileSync(`${outputFile}.expats.csv`, csvExpats.join("\n"));
			fs.writeFileSync(`${outputFile}.inpats.csv`, csvInpats.join("\n"));

		});

}