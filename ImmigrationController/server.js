const express = require('express');
const db = require('./db');
const bodyParser = require('body-parser');
const qr = require("qrcode");
const axios = require('axios');
require('dotenv').config(); 
const Citizen = require('./models/nid_models');
const multer = require('multer');
const File = require('./models/file_models')
const path = require('path');
const { log } = require('console');


// const multer = require('multer');
// const mongoose = require('mongoose');
// const { GridFsStorage } = require('multer-gridfs-storage');
// const Grid = require('gridfs-stream');
// const path = require('path');
// initiating the express app
const app = express();

// Middleware
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));

// setting global attributes
var connectionId = null;
var retrievedAttribute = null;

let nid_global = null;


var tokn = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MzI2Mjk2ODUsInVzZXJuYW1lIjoiVlg3Tk1NM1FtS29RVTZBWW9WQ29OVCIsIm9yZ05hbWUiOiJPcmcxIiwiaWF0IjoxNzMyNTkzNjg1fQ.ZeLFi2MKV4lARRUlPaxFr15xaXQGjhlwbmCxOVxwWmc";



// setting the view engine to EJS
app.set("view engine", "ejs");

// setting up parsers
app.use(express.static('views')); // background image er jonno. This will serve static files from the 'views' folder
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


// MongoDB URI
//const mongoURI = 'mongodb+srv://sajin:sjs123@ssi.0st8y.mongodb.net/';  // Replace with your MongoDB connection string

// Create MongoDB connection
// const conn = mongoose.createConnection(mongoURI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true
// });

/////////////////////////////////////////////////////File handle//////////////////////////////////////////////////////////////////////
// // Initialize GridFS stream
// let gfs;
// conn.once('open', () => {
//     gfs = Grid(conn.db, mongoose.mongo);
//     gfs.collection('uploads');  // Define collection for file storage
// });

// // Set up storage engine for GridFS
// const storage = new GridFsStorage({
//     url: mongoURI,
//     file: (req, file) => {
//         return new Promise((resolve, reject) => {
//             const filename = path.basename(file.originalname, path.extname(file.originalname)) + '-' + Date.now() + path.extname(file.originalname);
//             const fileInfo = {
//                 filename: filename,
//                 bucketName: 'uploads'  // Collection where files will be stored
//             };
//             resolve(fileInfo);
//         });
//     }
// });

// const upload = multer({ storage });  // Multer configuration to use GridFS storage
/*************************************************************
 *  ALL OF YOUR API SHOULD BE WRITTEN BELOW THIS LINE
*************************************************************/
// Route for the home page
app.get("/", (req, res) => {
    res.render("home"); // Ensure home.ejs is in the views folder
});

app.get("/nidPage", (req, res) => {
    res.render("nidPage"); // Ensure home.ejs is in the views folder
});

app.get("/hi", (req, res) => {
    res.send("hello"); // Ensure home.ejs is in the views folder
});

// app.get("/visaApplyOrClaim", (req, res) => {
//     res.render("visaApplyOrClaim"); 
// });
// app.get("/fewdays2", (req, res) => {
//     res.render("fewdays2"); 
// });
// app.get("/claimPassport", (req, res) => {
//     res.render("claimPassport"); 
// });

// app.get("/fraud", (req, res) => {
//     res.render("fraud"); 
// });
// app.get("/revoked", (req, res) => {
//     res.render("revoked"); 
// });

// app.get('/claimVisa', (req, res) => {
//     res.render('claimVisa');
// });

/////////////////////////////////////////////////////////////////////////////////

// Route for the visa page (visa.ejs)
app.get('/connectImmigration', (req, res) => {
    res.render('connectImmigration'); // Ensure visa.ejs is in the views folder
});

app.get('/proofPassport', (req, res) => {
    res.render('proofPassport');
});
  
app.get('/proofVisa', (req, res) => {
    res.render('proofVisa');
});
  
app.get('/congrats', (req, res) => {
    res.render('congrats');
});




  
// app.get('/visaStep5', (req, res) => {
//     res.render('visaStep5');
// });

// app.get('/visaStep6', (req, res) => {
//     res.render('visaStep6');
// });

/////////////////////////////////////////////////////////////////////////////



// create an invitation for establishing connection for passport.
app.get('/newConnection', async (req, res) => {
    try {
        connectionId = null;
        const resp = await axios.post('http://localhost:8021/connections/create-invitation');
        //console.log(resp)
        if (resp) {
            const connectionID = resp.data['connection_id'];
            console.log(connectionID)
            console.log(typeof connectionID)
            // await Citizen.updateOne(
            //     { nidNumber: nid_global }, // Query to match the document
            //     { $set: { imigConId: connectionID } } // Update operation
            // );
            const inviteURL = JSON.stringify(resp.data['invitation_url'], null, 4);
            qr.toDataURL(inviteURL, (err, src) => {
                //console.log({ src });
                res.render("invitationQr", { src, connectionID });
            });
        } else {
            res.render("connectImmigration", { message: "API service unavailable" });
        }
    } catch (err) {
        console.error(err);
    }
});




app.get('/api/check-nid', async (req, res) => {

    const { nid } = req.query; // Use req.query to get the NID from the GET request

    if (!nid) {
        return res.status(400).json({ message: 'NID number is required' });
    }
    
    try {
        // Find the NID in the database
        const user = await Citizen.findOne({ nidNumber: nid });

        if (user) {
            console.log(nid)
            nid_global = nid;
            console.log(nid_global);
            
            return res.status(200).json({ message: 'You are a Citizen of Bangladesh', matched: true });
        } else {
            return res.status(404).json({ message: 'Not matched', matched: false });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
});
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// var roleCheck = null
// console.log(roleCheck)
//main
// app.post("/webhooks/*", (req, res, next) => {
// 	try {
// 		console.log("==================== webhook data ==================")
// 		console.log(req.body)
//         roleCheck = req.body["state"]
//         console.log(`************************************************************************************************`,roleCheck)
// 		console.log("==================== webhook data ==================")
// 		const conID = req.body['connection_id']
// 		const conStatus = req.body['rfc23_state']
// 		if(conID){
// 			// Connection complete
// 			if(conStatus === "completed"){
// 				console.log("=========== Connected Successful ============")
// 				connectionId = conID
// 			}
// 			// Credential accepted by user from mobile
// 			if(req.body['state'] === 'credential_acked'){
// 				console.log("=========== Credential acknowledged by user ============")
// 			}
// 			// Proof request approved by user from mobile
// 			if(req.body.state === "presentation_received"){
// 				const revealed_role = req.body?.presentation?.requested_proof?.revealed_attrs['vc_role']?.raw ?? undefined
// 				console.log("=========== Role Proved ===========")
// 				retrievedAttribute = revealed_role
// 			}
// 		}
// 		res.writeHead(200, {'Content-Type': 'text/plain'});
// 		res.end('Event Received\n');
// 	} catch ( err ) {
// 		console.error( err )
// 	}
// })

///////////////////////////////////////////////////////////////////////////////////////////////

var roleCheck = null
console.log(roleCheck)
let issuerDid = null; // Variable to store the issuer's DID
//working
app.post("/webhooks/*", async (req, res) => {
    try {
        console.log("==================== Webhook Data ==================");
        console.log(req.body);
        roleCheck = req.body["state"]
        console.log("==================== Webhook Data ==================");

        const conID = req.body['connection_id'];
        const state = req.body['state'];
		const conStatus = req.body['rfc23_state']
		if(conID){
			// Connection complete
			if(conStatus === "completed"){
				console.log("=========== Connected Successful ============")
				connectionId = conID
			}
		}

        if (state === "presentation_received") {
            console.log("=========== Proof Request Approved by User ==========");

            const presentationExchangeId = req.body.presentation_exchange_id;
            if (presentationExchangeId) {
                try {
                    // Fetch the full presentation record from the Admin API
                    const response = await axios.get(
                        `http://127.0.0.1:8021/present-proof/records/${presentationExchangeId}`
                    );
                    const presentationRecord = response.data;

                    // Log the retrieved presentation record for debugging
                    console.log("Retrieved Presentation Record:", JSON.stringify(presentationRecord, null, 2));

                    // Extract the revealed attributes
                    const revealedAttrs = presentationRecord.presentation.requested_proof.revealed_attrs;
                    const revealedRole = revealedAttrs?.['vc_role']?.raw ?? undefined;
                    console.log("=========== Role Proved ===========")
                    retrievedAttribute = revealedRole;

                    // Extract the cred_def_id from identifiers
                    const identifiers = presentationRecord.presentation.identifiers;
                    if (identifiers && identifiers.length > 0) {
                        const credDefId = identifiers[0].cred_def_id;
                        if (credDefId) {
                            issuerDid = credDefId.split(':')[0]; // Extract issuer's DID
                            console.log("Issuer DID retrieved from proof:", issuerDid);
                        } else {
                            console.log("No cred_def_id found in identifiers.");
                        }
                    } else {
                        console.log("No identifiers found in the presentation.");
                    }
                } catch (error) {
                    console.error("Error fetching presentation exchange record:", error.message);
                }
            } else {
                console.log("Missing 'presentation_exchange_id' in webhook payload.");
            }
        }

        // Respond to the webhook
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Event Received\n');
    } catch (err) {
        console.error("Error processing webhook:", err);
        res.status(500).send("Error processing webhook.");
    }
});

// Store state globally (or use a database for production)



// create new citizen information
app.post('/citizen', async (req, res) => {
    try {
        // Create and save the citizen directly from req.body
        const newCitizen = new Citizen(req.body); // Mongoose will handle the fields automatically

        const savedCitizen = await newCitizen.save();

        // Send a success response
        res.status(201).json({ message: "Citizen created successfully", citizen: savedCitizen });
    } catch (error) {
        if (error.code === 11000) {
            // Handle unique constraint error for NID Number
            return res.status(409).json({ message: "NID Number already exists" });
        }
        console.error("Error creating citizen:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


// // Configure multer
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'uploads/');
//     },
//     filename: (req, file, cb) => {
//         cb(null, Date.now() + path.extname(file.originalname));
//     },
// });

// const upload = multer({ storage });

// // Route to upload multiple files
// app.post('/upload', upload.array('files', 10), async (req, res) => {
//     try {
//         const files = req.files.map((file) => ({
//             filename: file.filename,
//             path: file.path,
//             size: file.size,
//         }));

//         const savedFiles = await File.insertMany(files);
//         res.json({ files: savedFiles });
//     } catch (error) {
//         res.status(500).json({ error: 'File upload failed' });
//     }
// });
/////////////////////////////////////////////****************************************************************************************** *///////////////
// Configure multer for file storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Save files in the 'uploads' folder
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique file name
    },
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        // Only allow PDF files
        if (path.extname(file.originalname).toLowerCase() === '.pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only .pdf files are allowed'), false);
        }
    },
});


app.post('/upload', upload.array('documents', 10), async (req, res) => {
    try {
        const { visaType } = req.body; // Extract visa type from the request body

        // Map through the uploaded files and save their details along with the visa type
        const files = req.files.map((file) => ({
            filename: file.filename,
            path: file.path,
            size: file.size,
            //visaType: visaType, // Associate the visa type with the file
        }));
        //const user = await Citizen.findOne({ nidNumber: nid_global });

        await Citizen.updateOne(
            { nidNumber: nid_global },
            { $set: { visaType: visaType } }
        );


        // Save files and visa type to the database
        const savedFiles = await File.insertMany(files); // Insert file details into MongoDB

        res.status(200).json({ message: 'File upload success', files: savedFiles });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'File upload failed' });
    }
});


//visaApplyOrClaim.ejs --> eitar script a /checkclaim verify hobe
// let state = true;

// app.get('/checkClaim', (req, res) => {
//     try {
//         res.status(200).json({ state }); // Send the current state value
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'Server error' });
//     }
// });



// fetch connection status
app.get("/status", (req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    if (!connectionId) {
        res.end("Not connected");
        return;
    }
    res.end(`${true}`);
});



//main

// app.get("/rolecheck", (req,res) => {
//     if (roleCheck== "presentation_received"){
//         roleCheck = ""

//         res.render("proofVisa")   
//     } 
//     else{
//         res.render("proofPassport", { message: "Verification Pending...." });
//     }
// })

// app.get("/rolecheck2", (req,res) => {
//     if (roleCheck== "presentation_received"){
//         roleCheck = ""

//         res.render("congrats")   
//     } 
//     else{
//         res.render("proofVisa", { message: "Verification Pending...." });
//     }
// })


app.get("/rolecheck", async (req,res) => {
    try {
        // Define the external API URL
        const externalApiUrl = 'https://29d0-118-179-189-17.ngrok-free.app/users';

        // Make a GET request to the external API with the token in the Authorization header
        const response = await axios.get(externalApiUrl, {
            headers: {
                Authorization: `Bearer ${tokn}` // Use the tokn variable as the Bearer token
            }
        });

        // Check if the response contains the expected userDetails
        if (response.data) {
            // Extract userDetails and send it in the response
            var details = response.data.data
            console.log(`=========================***********************==========================`,details)
        } else {
            // Handle cases where the external API does not return expected data
            console.log("Failed to retrieve user details from the external API")
        }
    } catch (error) {
        // Handle errors (e.g., network issues, API errors)
        console.log("fabric server error")
        console.log(error.message)
    }


    if (roleCheck== "presentation_received" && issuerDid == details.username){
        roleCheck = ""

        res.render("proofVisa")   
    } 
    else{
        res.render("proofPassport", { message: "Verification Pending...." });
    }
})


app.get("/rolecheck2", async (req,res) => {
    try {
        // Define the external API URL
        const externalApiUrl = 'https://29d0-118-179-189-17.ngrok-free.app/users';

        // Make a GET request to the external API with the token in the Authorization header
        const response = await axios.get(externalApiUrl, {
            headers: {
                Authorization: `Bearer ${tokn}` // Use the tokn variable as the Bearer token
            }
        });

        // Check if the response contains the expected userDetails
        if (response.data) {
            // Extract userDetails and send it in the response
            var details = response.data.data
            console.log(`=========================***********************==========================`,details)
        } else {
            // Handle cases where the external API does not return expected data
            console.log("Failed to retrieve user details from the external API")
        }
    } catch (error) {
        // Handle errors (e.g., network issues, API errors)
        console.log("fabric server error")
        console.log(error.message)
    }


    if (roleCheck== "presentation_received" && issuerDid == details.username){
        roleCheck = ""

        res.render("congrats")   
    } 
    else{
        res.render("proofVisa", { message: "Verification Pending...." });
    }
})

// app.get("/rolecheck2", async (req,res) => {
//     try {
//         // Define the external API URL
//         const externalApiUrl = 'https://29d0-118-179-189-17.ngrok-free.app/users';

//         // Make a GET request to the external API with the token in the Authorization header
//         const response = await axios.get(externalApiUrl, {
//             headers: {
//                 Authorization: `Bearer ${tokn}` // Use the tokn variable as the Bearer token
//             }
//         });

//         // Check if the response contains the expected userDetails
//         if (response.data) {
//             // Extract userDetails and send it in the response
//             var details = response.data.data
//             res.send(               
//                 details
//             );
//         } else {
//             // Handle cases where the external API does not return expected data
//             console.log("Failed to retrieve user details from the external API")
//         }
//     } catch (error) {
//         // Handle errors (e.g., network issues, API errors)
//         console.log("fabric server error")
//         console.log(error.message)
//     }


//     if (roleCheck== "presentation_received" && issuerDid== details.username){
//         roleCheck = ""

//         res.render("congrats")   
//     } 
//     else{
//         res.render("proofVisa", { message: "Verification Pending...." });
//     }
// })


//main
app.get('/proofReq', async function (req, res) {
    try {
        const user = await Citizen.findOne({ nidNumber: nid_global });
        if (user.revoked === true) {
            return res.render("revoked");
        }
        //connectionId = user.visaConId;

        // Fetch all credential definitions
        const resp = await axios.get('http://127.0.0.1:8021/credential-definitions/created');
        if (!resp) {
            res.end("Controller API service unavailable");
            return;
        }

        const credDefs = resp.data['credential_definition_ids'];
        // const visaCredDefId = credDefs.find((id) => id.includes('Visa schema'));
        const passportCredDefId = credDefs.find((id) => id.includes('Passport schema'));

        if (connectionId) {
            const data = {
                "connection_id": connectionId,
                "proof_request": {
                    "name": "Proof of Role",
                    "version": "1.0",
                    "requested_attributes": {
                        "vc_role": {
                            "name": "role",
                            "restrictions": [
                                // {
                                //     "schema_name": "Visa schema",
                                //     "cred_def_id": visaCredDefId
                                // },
                                {
                                    "schema_name": "Passport schema",
                                    "cred_def_id": passportCredDefId
                                }
                            ]
                        }
                    },
                    "requested_predicates": {}
                }
            };

            await axios.post('http://127.0.0.1:8021/present-proof/send-request', data);
            res.render("proofPassport", { message: "Proof Request Sent. You will receive it soon..." });

        }
    } catch (err) {
        console.error("Error in proof request:", err);
        res.status(500).send("An error occurred while sending the proof request.");
    }
});




app.get('/proofReq2', async function (req, res) {
    try {
        const user = await Citizen.findOne({ nidNumber: nid_global });
        if (user.revoked === true) {
            return res.render("revoked");
        }
        //connectionId = user.visaConId;

        // Fetch all credential definitions
        const resp = await axios.get('http://127.0.0.1:8021/credential-definitions/created');
        if (!resp) {
            res.end("Controller API service unavailable");
            return;
        }

        const credDefs = resp.data['credential_definition_ids'];
        const visaCredDefId = credDefs.find((id) => id.includes('Visa schema'));
        // const passportCredDefId = credDefs.find((id) => id.includes('Passport schema'));

        if (connectionId) {
            const data = {
                "connection_id": connectionId,
                "proof_request": {
                    "name": "Proof of Role",
                    "version": "1.0",
                    "requested_attributes": {
                        "vc_role": {
                            "name": "role",
                            "restrictions": [
                                {
                                    "schema_name": "Visa schema",
                                    "cred_def_id": visaCredDefId
                                }//,
                                // {
                                //     "schema_name": "Passport schema",
                                //     "cred_def_id": passportCredDefId
                                // }
                            ]
                        }
                    },
                    "requested_predicates": {}
                }
            };

            await axios.post('http://127.0.0.1:8021/present-proof/send-request', data);
            res.render("proofVisa", { message: "Proof Request Sent. You will receive it soon..." });

        }
    } catch (err) {
        console.error("Error in proof request:", err);
        res.status(500).send("An error occurred while sending the proof request.");
    }
});



// check role proof
app.get("/checkRole", (req, res) => {
    res.render("step5", { message: "Proof Successful, You are: " + retrievedAttribute + " of Country X" });
});

/*************************************************************
 *  ALL OF YOUR API SHOULD BE ABOVE THIS LINE
*************************************************************/

// Starting the server
app.listen(9999, () => {
    console.log('Server is running on port 9999');
});


//*************************************************do same for visa********************/


//do here

