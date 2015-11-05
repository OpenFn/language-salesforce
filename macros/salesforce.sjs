macro field {
  rule { ( $key,$value ) } => { ( { $key : $value } ) }
}

macro upsert {
  rule {
    ($sObject, $externalID, $field:expr (,) ... )
  } => {
    (function(conn) {
        return conn.sobject($sObject)
          .$[upsert]( $field (,) ..., $externalID)
    })
  }
}

macro salesforce {
  rule { ($op:expr (,) ...) } => {
    (function(adaptor, credentials) {
      return adaptor.execute([$op (,) ...]);
    })
  }
}

export field;
export upsert;
export salesforce;

// salesforce(
//   upsert(
//     "Big_Packet__c",
//     "Grand_Packet_extID__c", 
//     field("PacketID" "10001"), field(c d)
//   ) 
// )

