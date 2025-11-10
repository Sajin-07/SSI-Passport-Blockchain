const express = require('express')
const bodyParser = require('body-parser')
const qr = require("qrcode");
const axios = require('axios');
require('dotenv').config() 

// setting global attributes
var connectionId = null;
var retrievedAttribute = null;

// initiating the express js
const app = express()

// setting up the server side render engine  
app.set("view engine", "ejs");

// setting up various parsers
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())
/*************************************************************
 *  ALL OF YOUR API SHOULD BE WRITTEN BELOW THIS LINE
*************************************************************/



// YOU WILL WRITE CODE BETWEEN IN THIS AREA
// Simple routing to the index.ejs file
app.get("/", (req, res) => {
    res.render("index");
})

// create an invitation for establishing connection
app.get('/newConnection', async (req, res) => {
	try {
		connectionId = null
		const resp = await axios.post('http://localhost:8021/connections/create-invitation')
			if (resp) {
				const connectionID = resp.data['connection_id']
				const inviteURL = JSON.stringify(resp.data['invitation_url'], null, 4);
				qr.toDataURL(inviteURL, (err, src) => {
					// passing the data to invitation.ejs page to show QR Code
					console.log({src})
					res.render("invitationQr", { src, connectionID });
				});
			}
            else{
				res.render("index", {message: "API service unavailable"})
			}
	} catch (err) {
		console.log("Filed to generate invitation")
		console.error( err )
	}
})


// app.post("/webhooks/*", (req, res, next) => {
// 	try {
// 		console.log("==================== webhook data ==================")
// 		console.log(req.body)
// 		console.log("==================== webhook data ==================")
// 		const conID = req.body['connection_id']
// 		const conStatus = req.body['rfc23_state']
		// if(conID){
		// 	// Connection complete
		// 	if(conStatus === "completed"){
		// 		console.log("=========== Connected Successful ============")
		// 		connectionId = conID
		// 	}
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
// 		res.end('Event Receied\n');
// 	} catch ( err ) {
// 		console.error( err )
// 	}
// })


let issuerDid = null; // Variable to store the issuer's DID
//working
app.post("/webhooks/*", async (req, res) => {
    try {
        console.log("==================== Webhook Data ==================");
        console.log(req.body);
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










app.post('/savefabric', async function (req, res) {
    try {
        // Retrieve username and orgName from the request body
		var namee= "pagla2"

		var orgName = "Org1"
        //const { namee, orgName } = req.body;

        // Input validation
        if (!namee || !orgName) {
            res.status(400).json({
                success: false,
                message: 'Both username and orgName are required',
            });
            return;
        }

        // Prepare data to send to the external API
        const payload = {
            username: namee,
            orgName: orgName,
        };

        // Send a POST request to the external API
        const externalApiUrl = 'https://21aa-118-179-189-17.ngrok-free.app/users';
        const response = await axios.post(externalApiUrl, payload);

        // Check the response from the external API
    
            // Return the successful response to the client
        res.json({
                namee: response.data.username,
                orgName: response.data.orgName,
            });    
        
    } catch (error) {
        // Handle errors (e.g., network or API errors)
        res.status(500).json({
            success: false,
            message: 'An error occurred while saving fabric data',
            error: error.message,
        });
    }
});






// fetching connection status
app.get("/status", (req, res) => {
	res.writeHead(200, {'Content-Type': 'text/plain'});
	if(!connectionId) {
		res.end("Not connected")
		return
	}
    res.end(`${ true }`);
})


// Offer a VC
app.post('/offerCredential', async function(req,res) {
	try {
		const name = req.body.name
		const email = req.body.email
		const address = req.body.address
		const institution = req.body.institution
		const date = req.body.dob
	
		// fetching the Credential Definition
		const resp = await axios.get('http://127.0.0.1:8021/credential-definitions/created')
		
		// if not found end response
		if(!resp){
			res.end("API service unavailable")
			return 
		}

		const credID = resp.data['credential_definition_ids'][0];
		console.log("Credential ID : " + credID)
		if(credID){
			const data = {
				"auto_issue": true,
				"auto_remove": true,
				"connection_id": connectionId,
				"cred_def_id": credID,
				"comment":"Offer on cred def id " + credID,
				"credential_preview":{
					"@type":"https://didcomm.org/issue-credential/1.0/credential-preview",
					"attributes":[
						{
							"name":"name",
							"value":name
						},
						{
							"name":"email",
							"value":email
						},
						{
							"name":"address",
							"value":address
						},
						{
							"name":"institution",
							"value":institution
						},
						{
							"name":"birthdate_dateint",
							"value":date
						},
						{
							"name":"role",
							"value":"student"
						},
						{
							"name":"timestamp",
							"value": ""+Date.now()
						}
					]
				}
			};
			const result = await axios.post('http://127.0.0.1:8021/issue-credential/send-offer', data)
			res.render("index", { message: "VC sent. You will receive it soon....." })
		}
		
	} catch ( err ) {
		console.log( err )
	}
});


// requesting user to proof VC
app.get('/proofReq', async function(req,res) {
	try {
		// search for matching credential definition
		const resp = await axios.get('http://127.0.0.1:8021/credential-definitions/created')
		if( !resp ){
			res.end("Controller API service unavailable")
			return
		}

		const credID = resp.data['credential_definition_ids'][0];
		if(connectionId){
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
									"schema_name": "Faber College schema",
									"cred_def_id": credID
								}
							]
						}
					},
					"requested_predicates": {
						// You need to explore about predicates later
					}
				}
			}; 
			// request holder for a proof request
			await axios.post('http://127.0.0.1:8021/present-proof/send-request', data)
			res.render("index", { message: "Proof Request Sent. You will receive it soon....." })
		}
	
	} catch ( err ) {
		console.error( err )
	}
});


app.get("/checkRole", (req, res)=>{
	res.render("index", { message: "Proof Successful, You are: "+ retrievedAttribute + " of Faber College" })
})

/*************************************************************
 *  ALL OF YOUR API SHOULD BE ABOVE THIS LINE
*************************************************************/
app.listen(9999, () => {
	console.log('Server up at 9999')
	// global.connectionId = "44baf04c-911d-4191-9e84-e115c9101ec6"
})


