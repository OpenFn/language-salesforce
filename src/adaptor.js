import jsforce from 'jsforce';

let conn = new jsforce.Connection({loginUrl: "https://test.salesforce.com"});
conn.login('myagro@vera.org.openfn', 'data2012', function(err, userInfo) {
  if (err) { return console.error(err); }
  // Now you can get the access token and instance URL information.
  // Save them to establish connection next time.
  console.log(conn.accessToken);
  console.log(conn.instanceUrl);
  // logged in user property
  console.log("User ID: " + userInfo.id);
  console.log("Org ID: " + userInfo.organizationId);

  conn.sobject("Account").describe(function(err, meta) {
    if (err) { return console.error(err); }
    console.log('Label : ' + meta.label);
    console.log('Num of Fields : ' + meta.fields.length);
    // ...
  });

  conn.query('SELECT Id, Name FROM Account', function(err, res) {
    if (err) { return console.error(err); }
    console.log(res);
  });

  // [
  // {
  //   "properties": {
  //     "Grand_Packet_extID__c": "SMSTO:+22394806941:paquet 1449",
  //     "Zone__r": {
  //       "Zone_Code__c": "SID"
  //     },
  //     "Date_Sent__c": "2015-10-13T16:34:28.094000"
  //   },
  //   "action": "upsert",
  //   "externalID": "Grand_Packet_extID__c",
  //   "sObject": "Packet__c"
  // }
  // ]
  conn.sobject("Packet__c").upsert({
    "Grand_Packet_extID__c": "SMSTO:+22394806941:paquet 1449",
    "Zone__r": {
      "Zone_Code__c": "SID"
    },
    "Date_Sent__c": "2015-10-13T16:34:28.094000"
  }, "Grand_Packet_extID__c", function(err, res) {
    if (err) { return console.error(err); }
    console.log(JSON.stringify(res, null, 4));
  })
});

