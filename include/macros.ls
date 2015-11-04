; (field "fieldName" "value")
(macro field (name value)
       (object ~name ~value))
       
; (create "Big_Packet__c" (field "PacketID" "10001"))
(macro create (sObject rest...)
       ( (object 
           action "create"
           sObject ~sObject
           fields (array ~rest...) )
  ))
       
; (create "Big_Packet__c" 
;         (field "AnotherField" "yoyo")
;         (field "PacketID" "10001")
;         (field "FieldName" "hello")
;         )

; (salesforce 
;   credentials
;   (actions
;     (create "object1"
;             (field "field" "value"
;                    )
;             )
;     (create "object1"
;             (field "field" "value"
;                    )
;             )
;     )
;   )

(console.log "LOADED!")
