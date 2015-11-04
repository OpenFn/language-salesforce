(testGroup macros
           (assert (= (field "key" "value")
                     (object "key" "value")
                     )
                   "(field <key> <value>)")
           )
