// const sectionQuery = {
// 	title: "Transformation Query With Group and Avg",
// 	input: {
// 		WHERE: {
// 			AND: [
// 				{
// 					IS: {
// 						sections_title: "*es*"
// 					}
// 				},
// 				{
// 					GT: {
// 						sections_avg: 80
// 					}
// 				}
// 			]
// 		},
// 		OPTIONS: {
// 			COLUMNS: [
// 				"sections_dept",
// 				"minGrades"
// 			]
// 		},
// 		TRANSFORMATIONS: {
// 			GROUP: [
// 				"sections_dept"
// 			],
// 			APPLY: [
// 				{
// 					minGrades: {
// 						MIN: "sections_avg"
// 					}
// 				}
// 			]
// 		}
// 	},
// 	errorExpected: false,
// 	// eslint-disable-next-line max-len
// 	expected: [{sections_dept:"apbi",minGrades:80.18},{sections_dept:"apsc",minGrades:80.29},{sections_dept:"arch",minGrades:80.02},{sections_dept:"arst",minGrades:80.71},{sections_dept:"arth",minGrades:81.6},{sections_dept:"asia",minGrades:80.39},{sections_dept:"asic",minGrades:80.79},{sections_dept:"astr",minGrades:80.1},{sections_dept:"audi",minGrades:84.13},{sections_dept:"bafi",minGrades:80.04},{sections_dept:"bama",minGrades:80.32},{sections_dept:"bams",minGrades:80.14},{sections_dept:"bapa",minGrades:80.39},{sections_dept:"baul",minGrades:82.29},{sections_dept:"biof",minGrades:87.33},{sections_dept:"biol",minGrades:80.07},{sections_dept:"bmeg",minGrades:83},{sections_dept:"busi",minGrades:80.11},{sections_dept:"caps",minGrades:86.84},{sections_dept:"cens",minGrades:83.19},{sections_dept:"chbe",minGrades:80.03},{sections_dept:"chem",minGrades:80.88},{sections_dept:"chin",minGrades:80.11},{sections_dept:"civl",minGrades:80.17},{sections_dept:"cnps",minGrades:85.91},{sections_dept:"cnrs",minGrades:82},{sections_dept:"coec",minGrades:81.79},{sections_dept:"cohr",minGrades:80.48},{sections_dept:"comm",minGrades:80.02},{sections_dept:"cons",minGrades:81.18},{sections_dept:"cpsc",minGrades:83.08},{sections_dept:"crwr",minGrades:90},{sections_dept:"dent",minGrades:80.5},{sections_dept:"eced",minGrades:83.26},{sections_dept:"econ",minGrades:80.28},{sections_dept:"edcp",minGrades:83.14},{sections_dept:"edst",minGrades:82.67},{sections_dept:"educ",minGrades:82.59},{sections_dept:"eece",minGrades:80.5},{sections_dept:"ends",minGrades:80.12},{sections_dept:"enph",minGrades:80.26},{sections_dept:"envr",minGrades:80.83},{sections_dept:"eosc",minGrades:80.52},{sections_dept:"epse",minGrades:81.48},{sections_dept:"etec",minGrades:83.07},{sections_dept:"fish",minGrades:85.43},{sections_dept:"fist",minGrades:85.13},{sections_dept:"fmst",minGrades:80.57},{sections_dept:"fnh",minGrades:83.13},{sections_dept:"fnis",minGrades:84.78},{sections_dept:"food",minGrades:80.21},{sections_dept:"fopr",minGrades:81.25},{sections_dept:"fre",minGrades:81},{sections_dept:"fren",minGrades:85.6},{sections_dept:"frst",minGrades:80.26},{sections_dept:"geog",minGrades:80.72},{sections_dept:"germ",minGrades:85.67},{sections_dept:"grsj",minGrades:81.07},{sections_dept:"hgse",minGrades:81.65},{sections_dept:"hist",minGrades:81.33},{sections_dept:"hunu",minGrades:81.6},{sections_dept:"iar",minGrades:83.33},{sections_dept:"igen",minGrades:80.92},{sections_dept:"japn",minGrades:80.03},{sections_dept:"kin",minGrades:80.07},{sections_dept:"larc",minGrades:80.72},{sections_dept:"law",minGrades:80.19},{sections_dept:"libe",minGrades:80.27},{sections_dept:"libr",minGrades:80.4},{sections_dept:"ling",minGrades:88.8},{sections_dept:"lled",minGrades:80.43},{sections_dept:"math",minGrades:85},{sections_dept:"mech",minGrades:80.11},{sections_dept:"medg",minGrades:83.75},{sections_dept:"medi",minGrades:82.67},{sections_dept:"micb",minGrades:81.43},{sections_dept:"mtrl",minGrades:80.44},{sections_dept:"musc",minGrades:80.56},{sections_dept:"name",minGrades:85.5},{sections_dept:"nrsc",minGrades:80.67},{sections_dept:"nurs",minGrades:80.08},{sections_dept:"obst",minGrades:82.5},{sections_dept:"path",minGrades:84},{sections_dept:"pcth",minGrades:81},{sections_dept:"phar",minGrades:80.12},{sections_dept:"phil",minGrades:80.75},{sections_dept:"phys",minGrades:80.04},{sections_dept:"plan",minGrades:83.36},{sections_dept:"poli",minGrades:84.18},{sections_dept:"port",minGrades:89.75},{sections_dept:"psyc",minGrades:85.75},{sections_dept:"relg",minGrades:80.17},{sections_dept:"rhsc",minGrades:87.23},{sections_dept:"rmes",minGrades:80.61},{sections_dept:"soil",minGrades:80.86},{sections_dept:"sowk",minGrades:81.61},{sections_dept:"span",minGrades:81},{sections_dept:"spha",minGrades:82.34},{sections_dept:"spph",minGrades:80.17},{sections_dept:"stat",minGrades:80.86},{sections_dept:"surg",minGrades:80.6},{sections_dept:"thtr",minGrades:81.6},{sections_dept:"udes",minGrades:80.63},{sections_dept:"ufor",minGrades:84.08},{sections_dept:"urst",minGrades:80.18},{sections_dept:"zool",minGrades:83.67}]
// };

// export {sectionQuery};
